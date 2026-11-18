declare const spindle: import('lumiverse-spindle-types').SpindleAPI

import {
  DEFAULT_SETTINGS,
  FORMAT_RULES,
  defaultFandom,
  emptyFeed,
  type Fandom,
  type Feed,
  type Post,
  type Settings,
} from './shared'
import { parsePosts, stripReasoning } from './parse'

// ---------- storage ----------

const SETTINGS_PATH = 'settings.json'
const fandomPath = (characterId: string) => `fandoms/${characterId}.json`
const feedPath = (chatId: string) => `feeds/${chatId}.json`

async function loadSettings(userId: string): Promise<Settings> {
  const saved = await spindle.userStorage.getJson<Partial<Settings>>(SETTINGS_PATH, { fallback: {}, userId })
  return { ...DEFAULT_SETTINGS, ...saved }
}

async function loadFandom(characterId: string, userId: string): Promise<Fandom> {
  const character = await spindle.characters.get(characterId, userId).catch(() => null)
  const base = defaultFandom(character?.name || 'Story')
  const saved = await spindle.userStorage.getJson<Partial<Fandom>>(fandomPath(characterId), { fallback: {}, userId })
  return { ...base, ...saved }
}

async function loadFeed(chatId: string, userId: string): Promise<Feed> {
  const saved = await spindle.userStorage.getJson<Partial<Feed>>(feedPath(chatId), { fallback: {}, userId })
  return { ...emptyFeed(), ...saved }
}

async function saveFeed(chatId: string, feed: Feed, userId: string) {
  await spindle.userStorage.setJson(feedPath(chatId), feed, { userId })
}

// ---------- helpers ----------

const generating = new Set<string>() // chatIds currently generating
const replyCounters = new Map<string, number>() // chatId -> replies since last auto refresh

function uid() {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36)
}

function clean(text: string, max = 1500) {
  const t = (text || '').replace(/<[^>]+>/g, '').replace(/\n{3,}/g, '\n\n').trim()
  return t.length > max ? t.slice(0, max) + '…' : t
}

function fillMacros(template: string, vars: Record<string, string>) {
  return template.replace(/\{\{\s*(\w+)\s*\}\}/g, (m, key) => (key in vars ? vars[key] : m))
}

async function getStoryMessages(chatId: string) {
  const all = await spindle.chat.getMessages(chatId)
  return all.filter(m => !m.hidden && m.role !== 'system' && (m.content || '').trim())
}

function formatMessages(messages: Array<{ name?: string; role: string; content: string }>, charName: string, userName: string) {
  return messages
    .map(m => `${m.name || (m.role === 'user' ? userName : charName)}: ${clean(m.content)}`)
    .join('\n\n')
}

async function llm(userId: string, settings: Settings, system: string, prompt: string, temperature: number): Promise<string> {
  const input: any = {
    type: 'quiet',
    messages: [
      { role: 'system', content: system },
      { role: 'user', content: prompt },
    ],
    parameters: { temperature },
    userId,
  }
  if (settings.connectionId) input.connection_id = settings.connectionId

  let full = ''
  for await (const chunk of spindle.generate.quietStream(input)) {
    const c: any = chunk
    if (c.type === 'token' && typeof c.token === 'string') full += c.token
    else if (c.type === 'done' && typeof c.content === 'string' && c.content.length >= full.length) full = c.content
  }
  return stripReasoning(full)
}

function send(userId: string, payload: Record<string, unknown>) {
  spindle.sendToFrontend(payload, userId)
}

// ---------- summary ----------

const SUMMARY_KEEP_RAW = 4 // newest messages always passed word for word
const SUMMARY_CHUNK = 30

async function updateSummary(chatId: string, feed: Feed, userId: string, settings: Settings, rebuild = false) {
  const chat = await spindle.chats.get(chatId, userId)
  const character = chat ? await spindle.characters.get(chat.character_id, userId) : null
  const persona = await spindle.personas.getActive(userId).catch(() => null)
  const charName = character?.name || 'Character'
  const userName = persona?.name || 'User'

  const messages = await getStoryMessages(chatId)
  if (rebuild) {
    feed.summary = ''
    feed.summarizedUpTo = 0
  }
  const target = Math.max(0, messages.length - SUMMARY_KEEP_RAW)
  if (feed.summarizedUpTo > messages.length) feed.summarizedUpTo = 0 // chat was trimmed

  while (feed.summarizedUpTo < target) {
    const slice = messages.slice(feed.summarizedUpTo, Math.min(target, feed.summarizedUpTo + SUMMARY_CHUNK))
    const prompt = `${feed.summary ? `STORY SO FAR:\n${feed.summary}\n\n` : ''}NEW EVENTS:\n${formatMessages(slice, charName, userName)}\n\nRewrite the story so far to include the new events. Keep it to what an audience watching would know: what happened, who did what, relationships and big moments. No hidden thoughts. Under 400 words. Output only the summary.`
    const result = await llm(
      userId,
      settings,
      `You keep a running recap of a roleplay story between ${charName} and ${userName}.`,
      prompt,
      0.4,
    )
    if (!result.trim()) throw new Error('The model returned an empty summary.')
    feed.summary = result.trim()
    feed.summarizedUpTo += slice.length
  }
}

// ---------- feed generation ----------

async function generateFeed(chatId: string, userId: string) {
  if (generating.has(chatId)) return
  generating.add(chatId)
  send(userId, { type: 'generating', chatId, on: true })

  try {
    const settings = await loadSettings(userId)
    const chat = await spindle.chats.get(chatId, userId)
    if (!chat) throw new Error('That chat no longer exists.')
    const character = await spindle.characters.get(chat.character_id, userId)
    const persona = await spindle.personas.getActive(userId).catch(() => null)
    const fandom = await loadFandom(chat.character_id, userId)
    const feed = await loadFeed(chatId, userId)

    const charName = character?.name || 'Character'
    const userName = persona?.name || 'User'

    const messages = await getStoryMessages(chatId)
    if (!messages.length) throw new Error('This chat has no messages for the fans to react to yet.')

    let context = ''
    if (fandom.contextMode === 'summary') {
      await updateSummary(chatId, feed, userId, settings)
      const latest = messages.slice(-SUMMARY_KEEP_RAW)
      context = `STORY SO FAR:\n${feed.summary || '(just getting started)'}\n\nLATEST SCENE:\n${formatMessages(latest, charName, userName)}`
    } else {
      const latest = messages.slice(-Math.max(1, fandom.recentCount))
      context = `LATEST SCENES:\n${formatMessages(latest, charName, userName)}`
    }

    const vars = { char: charName, user: userName, fandom: fandom.name, tone: settings.tone, count: String(settings.postCount) }
    const system = `${fillMacros(settings.systemPrompt, vars)}\n\n${FORMAT_RULES}`

    const recentPosts = feed.posts.slice(0, 12).reverse()
    const parts = [
      `ABOUT ${charName.toUpperCase()}:\n${clean(character?.description || '', 1200) || '(no description)'}`,
      persona?.description ? `ABOUT ${userName.toUpperCase()}:\n${clean(persona.description, 600)}` : '',
      fandom.notes.trim() ? `FANDOM NOTES (in-jokes, ships, recurring fans):\n${fandom.notes.trim()}` : '',
      context,
      recentPosts.length
        ? `POSTS ALREADY ON THE FEED (don't repeat these; fans can reply to or continue them):\n${recentPosts.map(p => `${p.name} | @${p.handle}: ${p.text}`).join('\n')}`
        : '',
      `Write ${settings.postCount} new posts from the ${fandom.name} fandom reacting to the latest events.`,
    ].filter(Boolean)

    const raw = await llm(userId, settings, system, parts.join('\n\n'), settings.temperature)
    const parsed = parsePosts(raw)
    if (!parsed.length) {
      spindle.log.warn(`Peanut Gallery: could not parse posts from: ${raw.slice(0, 400)}`)
      throw new Error('The fans mumbled something unreadable. Try again, or check that your model follows instructions.')
    }

    const batch = uid()
    const now = Date.now()
    const newPosts: Post[] = parsed.map((p, i) => ({
      id: uid(),
      name: p.name.slice(0, 60),
      handle: p.handle.slice(0, 30),
      text: p.text.slice(0, 1000),
      ts: now - i, // keep model order when sorted newest-first
      batch,
    }))

    // Re-read in case a delete/clear happened while we were generating.
    const latestFeed = await loadFeed(chatId, userId)
    latestFeed.summary = feed.summary
    latestFeed.summarizedUpTo = feed.summarizedUpTo
    latestFeed.posts = [...newPosts, ...latestFeed.posts].slice(0, Math.max(10, settings.keepPosts))
    await saveFeed(chatId, latestFeed, userId)

    send(userId, { type: 'feed_data', chatId, characterId: chat.character_id, feed: latestFeed, fandom, newCount: newPosts.length })
  } catch (err: any) {
    const message = err?.message || String(err)
    spindle.log.error(`Peanut Gallery: generation failed - ${message}`)
    send(userId, { type: 'error', chatId, message })
  } finally {
    generating.delete(chatId)
    send(userId, { type: 'generating', chatId, on: false })
  }
}

// ---------- frontend messages ----------

async function listFandoms(userId: string) {
  const { data } = await spindle.characters.list({ limit: 500, userId })
  return data
    .map(c => ({ id: c.id, name: c.name, avatar: c.avatar_url || null }))
    .sort((a, b) => a.name.localeCompare(b.name))
}

async function listChats(characterId: string, userId: string) {
  const { data } = await spindle.chats.list({ characterId, limit: 200, userId })
  return data
    .sort((a, b) => (b.updated_at || 0) - (a.updated_at || 0))
    .map(c => ({ id: c.id, name: c.name || 'Untitled chat', updated: c.updated_at }))
}

async function sendFeed(chatId: string, userId: string) {
  const chat = await spindle.chats.get(chatId, userId)
  if (!chat) return send(userId, { type: 'error', chatId, message: 'That chat no longer exists.' })
  const [feed, fandom] = await Promise.all([loadFeed(chatId, userId), loadFandom(chat.character_id, userId)])
  send(userId, { type: 'feed_data', chatId, characterId: chat.character_id, feed, fandom, generating: generating.has(chatId) })
}

async function handle(payload: any, userId: string) {
  switch (payload?.type) {
    case 'init': {
      const [settings, connections, fandoms, active] = await Promise.all([
        loadSettings(userId),
        spindle.connections.list(userId).catch(() => []),
        listFandoms(userId),
        spindle.chats.getActive(userId).catch(() => null),
      ])
      send(userId, {
        type: 'init_data',
        settings,
        connections: connections.map(c => ({ id: c.id, name: c.name || c.id, provider: c.provider, isDefault: c.is_default })),
        fandoms,
        active: active ? { chatId: active.id, characterId: active.character_id } : null,
      })
      return
    }
    case 'list_chats': {
      const chats = await listChats(payload.characterId, userId)
      const fandom = await loadFandom(payload.characterId, userId)
      send(userId, { type: 'chats_data', characterId: payload.characterId, chats, fandom })
      return
    }
    case 'load_feed':
      return sendFeed(payload.chatId, userId)
    case 'generate':
      return generateFeed(payload.chatId, userId)
    case 'save_settings': {
      const merged = { ...DEFAULT_SETTINGS, ...(payload.settings || {}) }
      merged.postCount = Math.min(30, Math.max(1, Math.round(Number(merged.postCount) || 6)))
      merged.autoEvery = Math.min(50, Math.max(1, Math.round(Number(merged.autoEvery) || 1)))
      merged.keepPosts = Math.min(1000, Math.max(10, Math.round(Number(merged.keepPosts) || 200)))
      merged.temperature = Math.min(2, Math.max(0, Number(merged.temperature) || 1))
      await spindle.userStorage.setJson(SETTINGS_PATH, merged, { userId })
      send(userId, { type: 'settings_saved', settings: merged })
      spindle.toast.success('Peanut Gallery settings saved.')
      return
    }
    case 'save_fandom': {
      const f = payload.fandom || {}
      const fandom: Fandom = {
        name: String(f.name || '').slice(0, 60) || defaultFandom('Story').name,
        contextMode: f.contextMode === 'summary' ? 'summary' : 'recent',
        recentCount: Math.min(60, Math.max(1, Math.round(Number(f.recentCount) || 10))),
        notes: String(f.notes || '').slice(0, 4000),
      }
      await spindle.userStorage.setJson(fandomPath(payload.characterId), fandom, { userId })
      send(userId, { type: 'fandom_saved', characterId: payload.characterId, fandom })
      spindle.toast.success('Fandom saved.')
      return
    }
    case 'save_summary': {
      const feed = await loadFeed(payload.chatId, userId)
      feed.summary = String(payload.summary || '')
      await saveFeed(payload.chatId, feed, userId)
      spindle.toast.success('Story summary saved.')
      return sendFeed(payload.chatId, userId)
    }
    case 'rebuild_summary': {
      if (generating.has(payload.chatId)) return
      generating.add(payload.chatId)
      send(userId, { type: 'generating', chatId: payload.chatId, on: true, what: 'summary' })
      try {
        const settings = await loadSettings(userId)
        const feed = await loadFeed(payload.chatId, userId)
        await updateSummary(payload.chatId, feed, userId, settings, true)
        await saveFeed(payload.chatId, feed, userId)
        spindle.toast.success('Story summary rebuilt.')
      } catch (err: any) {
        send(userId, { type: 'error', chatId: payload.chatId, message: `Summary failed: ${err?.message || err}` })
      } finally {
        generating.delete(payload.chatId)
        send(userId, { type: 'generating', chatId: payload.chatId, on: false })
      }
      return sendFeed(payload.chatId, userId)
    }
    case 'delete_post': {
      const feed = await loadFeed(payload.chatId, userId)
      feed.posts = feed.posts.filter(p => p.id !== payload.postId)
      await saveFeed(payload.chatId, feed, userId)
      return sendFeed(payload.chatId, userId)
    }
    case 'clear_feed': {
      const feed = await loadFeed(payload.chatId, userId)
      feed.posts = []
      await saveFeed(payload.chatId, feed, userId)
      spindle.toast.success('Feed cleared.')
      return sendFeed(payload.chatId, userId)
    }
  }
}

spindle.onFrontendMessage((payload: any, userId: string) => {
  // An unhandled rejection kills the extension worker, so always catch.
  handle(payload, userId).catch((err: any) => {
    const message = err?.message || String(err)
    spindle.log.error(`Peanut Gallery: ${message}`)
    send(userId, { type: 'error', message })
  })
})

// ---------- events ----------

async function onActiveChat(chatId: string | null, userId: string) {
  if (!chatId) return send(userId, { type: 'active_changed', active: null })
  const chat = await spindle.chats.get(chatId, userId)
  send(userId, { type: 'active_changed', active: chat ? { chatId: chat.id, characterId: chat.character_id } : null })
}

spindle.on('SETTINGS_UPDATED', (payload: any, userId?: string) => {
  if (!userId) return
  const key = payload?.key ?? payload?.keys?.[0]
  if (key !== 'activeChatId') return
  onActiveChat(payload?.value ?? null, userId).catch(() => {})
})

spindle.on('CHAT_SWITCHED' as any, (payload: any, userId?: string) => {
  if (!userId) return
  const chatId = payload?.chatId ?? payload?.chat_id ?? payload?.id ?? null
  onActiveChat(chatId, userId).catch(() => {})
})

const AUTO_TYPES = new Set(['normal', 'swipe', 'regenerate', 'continue', undefined, ''])

spindle.on('GENERATION_ENDED', (payload, userId?: string) => {
  if (!userId || !payload || payload.error || !payload.content || !payload.chatId) return
  if (!AUTO_TYPES.has(payload.generationType as any)) return
  ;(async () => {
    const settings = await loadSettings(userId)
    if (!settings.autoGenerate) return
    const count = (replyCounters.get(payload.chatId) || 0) + 1
    if (count < settings.autoEvery) {
      replyCounters.set(payload.chatId, count)
      return
    }
    replyCounters.set(payload.chatId, 0)
    await generateFeed(payload.chatId, userId)
  })().catch((err: any) => spindle.log.error(`Peanut Gallery auto refresh: ${err?.message || err}`))
})

spindle.log.info('Peanut Gallery backend loaded. The herd is listening.')
