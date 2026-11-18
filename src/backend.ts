declare const spindle: import('lumiverse-spindle-types').SpindleAPI

import {
  DEFAULT_SETTINGS,
  FORMAT_RULES,
  defaultFandom,
  emptyFeed,
  type CharacterInfo,
  type ChatInfo,
  type Fandom,
  type Feed,
  type GalleryInfo,
  type Group,
  type Post,
  type Settings,
  type StoredFeedInfo,
} from './shared'
import { parsePosts, stripReasoning } from './parse'

// ---------- storage ----------

const SETTINGS_PATH = 'settings.json'
const GROUPS_PATH = 'galleries.json'
const fandomPath = (characterId: string) => `fandoms/${characterId}.json`
const feedPath = (chatId: string) => `feeds/${chatId}.json`

async function loadSettings(userId: string): Promise<Settings> {
  const saved = await spindle.userStorage.getJson<Partial<Settings>>(SETTINGS_PATH, { fallback: {}, userId })
  return { ...DEFAULT_SETTINGS, ...saved }
}

async function loadGroups(userId: string): Promise<Group[]> {
  const saved = await spindle.userStorage.getJson<{ groups?: Group[] }>(GROUPS_PATH, { fallback: {}, userId })
  return Array.isArray(saved.groups) ? saved.groups : []
}

async function saveGroups(groups: Group[], userId: string) {
  await spindle.userStorage.setJson(GROUPS_PATH, { groups }, { userId })
}

function normalizeFandom(f: Partial<Fandom>, fallbackName: string): Fandom {
  return {
    name: String(f.name || '').slice(0, 60) || fallbackName,
    contextMode: f.contextMode === 'summary' ? 'summary' : 'recent',
    recentCount: Math.min(60, Math.max(1, Math.round(Number(f.recentCount) || 10))),
    notes: String(f.notes || '').slice(0, 4000),
  }
}

/** Which gallery a character belongs to, and that gallery's fandom settings. */
async function resolveGallery(characterId: string, userId: string): Promise<{ ref: string; fandom: Fandom; name: string }> {
  const groups = await loadGroups(userId)
  const group = groups.find(g => g.characterIds.includes(characterId))
  if (group) {
    const base = defaultFandom(group.name)
    return { ref: `grp:${group.id}`, fandom: { ...base, ...group.fandom }, name: group.name }
  }
  const character = await spindle.characters.get(characterId, userId).catch(() => null)
  const base = defaultFandom(character?.name || 'Story')
  const saved = await spindle.userStorage.getJson<Partial<Fandom>>(fandomPath(characterId), { fallback: {}, userId })
  return { ref: `char:${characterId}`, fandom: { ...base, ...saved }, name: character?.name || 'Unknown' }
}

async function loadFandomByRef(ref: string, userId: string): Promise<Fandom> {
  const [kind, id] = splitRef(ref)
  if (kind === 'grp') {
    const group = (await loadGroups(userId)).find(g => g.id === id)
    return group ? { ...defaultFandom(group.name), ...group.fandom } : defaultFandom('Story')
  }
  return (await resolveGallery(id, userId)).fandom
}

function splitRef(ref: string): ['char' | 'grp', string] {
  const i = String(ref).indexOf(':')
  const kind = ref.slice(0, i) === 'grp' ? 'grp' : 'char'
  return [kind, ref.slice(i + 1)]
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

// ---------- prompt ----------

interface BuiltPrompt {
  system: string
  user: string
  characterId: string
  ref: string
  fandom: Fandom
  feed: Feed
  /** Messages the recap still has to catch up on (Whole story mode only). */
  pendingSummaryMessages: number
}

async function buildPrompt(chatId: string, userId: string, opts: { updateSummary: boolean }): Promise<BuiltPrompt> {
  const settings = await loadSettings(userId)
  const chat = await spindle.chats.get(chatId, userId)
  if (!chat) throw new Error('That chat no longer exists.')
  const character = await spindle.characters.get(chat.character_id, userId)
  const persona = await spindle.personas.getActive(userId).catch(() => null)
  const { ref, fandom } = await resolveGallery(chat.character_id, userId)
  const feed = await loadFeed(chatId, userId)

  const charName = character?.name || 'Character'
  const userName = persona?.name || 'User'

  const messages = await getStoryMessages(chatId)
  if (!messages.length) throw new Error('This chat has no messages for the fans to react to yet.')

  let context = ''
  let pendingSummaryMessages = 0
  if (fandom.contextMode === 'summary') {
    if (opts.updateSummary) await updateSummary(chatId, feed, userId, settings)
    else pendingSummaryMessages = Math.max(0, messages.length - SUMMARY_KEEP_RAW - feed.summarizedUpTo)
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

  return { system, user: parts.join('\n\n'), characterId: chat.character_id, ref, fandom, feed, pendingSummaryMessages }
}

// ---------- feed generation ----------

async function generateFeed(chatId: string, userId: string) {
  if (generating.has(chatId)) return
  generating.add(chatId)
  send(userId, { type: 'generating', chatId, on: true })

  try {
    const settings = await loadSettings(userId)
    const built = await buildPrompt(chatId, userId, { updateSummary: true })

    const raw = await llm(userId, settings, built.system, built.user, settings.temperature)
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
    latestFeed.summary = built.feed.summary
    latestFeed.summarizedUpTo = built.feed.summarizedUpTo
    latestFeed.posts = [...newPosts, ...latestFeed.posts].slice(0, Math.max(10, settings.keepPosts))
    await saveFeed(chatId, latestFeed, userId)

    send(userId, { type: 'feed_data', chatId, characterId: built.characterId, ref: built.ref, feed: latestFeed, fandom: built.fandom, newCount: newPosts.length })
  } catch (err: any) {
    const message = err?.message || String(err)
    spindle.log.error(`Peanut Gallery: generation failed - ${message}`)
    send(userId, { type: 'error', chatId, message })
  } finally {
    generating.delete(chatId)
    send(userId, { type: 'generating', chatId, on: false })
  }
}

// ---------- token estimate ----------

async function countTokens(chatId: string, userId: string) {
  try {
    const settings = await loadSettings(userId)
    const built = await buildPrompt(chatId, userId, { updateSummary: false })
    const messages = [
      { role: 'system' as const, content: built.system },
      { role: 'user' as const, content: built.user },
    ]
    let total = 0
    let approximate = true
    let model = ''
    try {
      const conn = settings.connectionId ? await spindle.connections.get(settings.connectionId, userId) : null
      const result = await spindle.tokens.countMessages(messages, conn?.model ? { model: conn.model } : undefined)
      total = result.total_tokens
      approximate = result.approximate
      model = result.model
    } catch {
      total = Math.ceil((built.system.length + built.user.length) / 4)
    }
    send(userId, {
      type: 'token_count',
      chatId,
      total,
      approximate,
      model,
      // Each post is short; ~60 tokens apiece is a fair guess for the reply.
      replyEstimate: settings.postCount * 60,
      pendingSummaryMessages: built.pendingSummaryMessages,
      contextMode: built.fandom.contextMode,
    })
  } catch (err: any) {
    send(userId, { type: 'token_count', chatId, error: err?.message || String(err) })
  }
}

// ---------- galleries & lists ----------

async function listCharacters(userId: string): Promise<CharacterInfo[]> {
  const { data } = await spindle.characters.list({ limit: 500, userId })
  return data
    .map(c => ({ id: c.id, name: c.name, avatar: c.avatar_url || null }))
    .sort((a, b) => a.name.localeCompare(b.name))
}

async function listGalleries(userId: string, characters?: CharacterInfo[]): Promise<GalleryInfo[]> {
  const chars = characters || (await listCharacters(userId))
  const byId = new Map(chars.map(c => [c.id, c]))
  const groups = await loadGroups(userId)
  const grouped = new Set(groups.flatMap(g => g.characterIds))
  const out: GalleryInfo[] = groups.map(g => ({
    ref: `grp:${g.id}`,
    kind: 'group',
    name: g.name,
    characterIds: g.characterIds.filter(id => byId.has(id)),
    avatar: byId.get(g.characterIds.find(id => byId.has(id)) || '')?.avatar || null,
  }))
  for (const c of chars) {
    if (!grouped.has(c.id)) out.push({ ref: `char:${c.id}`, kind: 'solo', name: c.name, characterIds: [c.id], avatar: c.avatar })
  }
  return out
}

async function listChatsForRef(ref: string, userId: string): Promise<ChatInfo[]> {
  const [kind, id] = splitRef(ref)
  const characterIds = kind === 'grp' ? (await loadGroups(userId)).find(g => g.id === id)?.characterIds || [] : [id]
  const results: ChatInfo[] = []
  for (const characterId of characterIds) {
    const character = await spindle.characters.get(characterId, userId).catch(() => null)
    if (!character) continue
    const { data } = await spindle.chats.list({ characterId, limit: 200, userId })
    for (const c of data) {
      results.push({ id: c.id, name: c.name || 'Untitled chat', characterId, characterName: character.name, updated: c.updated_at })
    }
  }
  return results.sort((a, b) => (b.updated || 0) - (a.updated || 0))
}

async function sendFeed(chatId: string, userId: string) {
  const chat = await spindle.chats.get(chatId, userId)
  if (!chat) return send(userId, { type: 'error', chatId, message: 'That chat no longer exists.' })
  const [feed, gallery] = await Promise.all([loadFeed(chatId, userId), resolveGallery(chat.character_id, userId)])
  send(userId, { type: 'feed_data', chatId, characterId: chat.character_id, ref: gallery.ref, feed, fandom: gallery.fandom, generating: generating.has(chatId) })
}

async function sendGalleries(userId: string) {
  const characters = await listCharacters(userId)
  const galleries = await listGalleries(userId, characters)
  send(userId, { type: 'galleries_data', galleries, characters })
}

// ---------- storage manager ----------

function feedIdFromPath(path: string): string | null {
  const m = String(path).match(/(?:^|\/)([^/]+)\.json$/)
  return m ? m[1] : null
}

async function listStoredFeeds(userId: string): Promise<StoredFeedInfo[]> {
  const paths = await spindle.userStorage.list('feeds/', userId).catch(() => [] as string[])
  const groups = await loadGroups(userId)
  const charCache = new Map<string, string | null>()
  const out: StoredFeedInfo[] = []

  for (const path of paths) {
    const chatId = feedIdFromPath(path)
    if (!chatId) continue
    const full = feedPath(chatId)
    const [stat, feed, chat] = await Promise.all([
      spindle.userStorage.stat(full, userId).catch(() => null),
      loadFeed(chatId, userId).catch(() => emptyFeed()),
      spindle.chats.get(chatId, userId).catch(() => null),
    ])
    let characterName: string | null = null
    let galleryName: string | null = null
    if (chat) {
      if (!charCache.has(chat.character_id)) {
        const c = await spindle.characters.get(chat.character_id, userId).catch(() => null)
        charCache.set(chat.character_id, c?.name || null)
      }
      characterName = charCache.get(chat.character_id) || null
      galleryName = groups.find(g => g.characterIds.includes(chat.character_id))?.name || characterName
    }
    out.push({
      chatId,
      chatName: chat ? chat.name || 'Untitled chat' : null,
      characterName,
      galleryName,
      posts: feed.posts.length,
      bytes: stat?.sizeBytes || 0,
      modified: stat?.modifiedAt ? Date.parse(stat.modifiedAt) || 0 : 0,
    })
  }
  return out.sort((a, b) => b.bytes - a.bytes)
}

async function sendStorage(userId: string) {
  const feeds = await listStoredFeeds(userId)
  send(userId, { type: 'storage_data', feeds })
}

async function deleteFeedFile(chatId: string, userId: string) {
  await spindle.userStorage.delete(feedPath(chatId), userId).catch(() => {})
}

async function cleanupOrphans(userId: string) {
  const feeds = await listStoredFeeds(userId)
  let removed = 0
  for (const f of feeds) {
    if (f.chatName === null) {
      await deleteFeedFile(f.chatId, userId)
      removed++
    }
  }
  // Fandom settings for characters that were deleted.
  const fandomFiles = await spindle.userStorage.list('fandoms/', userId).catch(() => [] as string[])
  for (const path of fandomFiles) {
    const id = feedIdFromPath(path)
    if (!id) continue
    const c = await spindle.characters.get(id, userId).catch(() => null)
    if (!c) {
      await spindle.userStorage.delete(fandomPath(id), userId).catch(() => {})
      removed++
    }
  }
  // Group members that no longer exist.
  const groups = await loadGroups(userId)
  const chars = new Set((await listCharacters(userId)).map(c => c.id))
  let changed = false
  for (const g of groups) {
    const kept = g.characterIds.filter(id => chars.has(id))
    if (kept.length !== g.characterIds.length) {
      g.characterIds = kept
      changed = true
    }
  }
  if (changed) await saveGroups(groups, userId)
  spindle.toast.success(removed ? `Cleaned up ${removed} leftover file${removed === 1 ? '' : 's'}.` : 'Nothing to clean up.')
}

// ---------- frontend messages ----------

async function handle(payload: any, userId: string) {
  switch (payload?.type) {
    case 'init': {
      const [settings, connections, characters, active] = await Promise.all([
        loadSettings(userId),
        spindle.connections.list(userId).catch(() => []),
        listCharacters(userId),
        spindle.chats.getActive(userId).catch(() => null),
      ])
      const galleries = await listGalleries(userId, characters)
      send(userId, {
        type: 'init_data',
        settings,
        connections: connections.map(c => ({ id: c.id, name: c.name || c.id, provider: c.provider, isDefault: c.is_default })),
        galleries,
        characters,
        active: active ? { chatId: active.id, characterId: active.character_id } : null,
      })
      return
    }
    case 'list_chats': {
      const chats = await listChatsForRef(payload.ref, userId)
      const fandom = await loadFandomByRef(payload.ref, userId)
      send(userId, { type: 'chats_data', ref: payload.ref, chats, fandom, forPicker: !!payload.forPicker })
      return
    }
    case 'load_feed':
      return sendFeed(payload.chatId, userId)
    case 'generate':
      return generateFeed(payload.chatId, userId)
    case 'count_tokens':
      return countTokens(payload.chatId, userId)
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
      const [kind, id] = splitRef(payload.ref)
      if (kind === 'grp') {
        const groups = await loadGroups(userId)
        const group = groups.find(g => g.id === id)
        if (!group) throw new Error('That gallery no longer exists.')
        group.fandom = normalizeFandom(payload.fandom || {}, defaultFandom(group.name).name)
        await saveGroups(groups, userId)
        send(userId, { type: 'fandom_saved', ref: payload.ref, fandom: group.fandom })
      } else {
        const fandom = normalizeFandom(payload.fandom || {}, defaultFandom('Story').name)
        await spindle.userStorage.setJson(fandomPath(id), fandom, { userId })
        send(userId, { type: 'fandom_saved', ref: payload.ref, fandom })
      }
      spindle.toast.success('Fandom saved.')
      return
    }
    case 'save_group': {
      const input = payload.group || {}
      const name = String(input.name || '').trim().slice(0, 60)
      const members: string[] = Array.from(new Set((input.characterIds || []).map(String)))
      if (!name) throw new Error('Give the gallery a name.')
      if (members.length < 2) throw new Error('Pick at least two characters to share a gallery.')
      const groups = await loadGroups(userId)
      let group = input.id ? groups.find(g => g.id === input.id) : undefined
      if (!group) {
        // Start the shared fandom from the first member's solo settings.
        const first = await resolveGallery(members[0], userId)
        group = { id: uid(), name, characterIds: [], fandom: { ...first.fandom, name: defaultFandom(name).name } }
        groups.push(group)
      }
      group.name = name
      group.characterIds = members
      // A character can only be in one gallery.
      for (const g of groups) if (g !== group) g.characterIds = g.characterIds.filter(id => !members.includes(id))
      const kept = groups.filter(g => g === group || g.characterIds.length > 0)
      await saveGroups(kept, userId)
      spindle.toast.success(`Saved gallery "${name}".`)
      send(userId, { type: 'group_saved', ref: `grp:${group.id}` })
      return sendGalleries(userId)
    }
    case 'delete_group': {
      const groups = await loadGroups(userId)
      await saveGroups(groups.filter(g => g.id !== payload.id), userId)
      spindle.toast.success('Gallery split back into separate characters.')
      send(userId, { type: 'group_deleted', ref: `grp:${payload.id}` })
      return sendGalleries(userId)
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
      await sendFeed(payload.chatId, userId)
      if (payload.fromStorage) await sendStorage(userId)
      return
    }
    case 'list_storage':
      return sendStorage(userId)
    case 'delete_feed': {
      await deleteFeedFile(payload.chatId, userId)
      spindle.toast.success('Feed deleted.')
      send(userId, { type: 'feed_deleted', chatId: payload.chatId })
      return sendStorage(userId)
    }
    case 'cleanup_orphans':
      await cleanupOrphans(userId)
      await sendStorage(userId)
      return sendGalleries(userId)
    case 'delete_all_feeds': {
      const paths = await spindle.userStorage.list('feeds/', userId).catch(() => [] as string[])
      for (const p of paths) {
        const id = feedIdFromPath(p)
        if (id) await deleteFeedFile(id, userId)
      }
      spindle.toast.success('All feeds deleted.')
      send(userId, { type: 'feed_deleted', chatId: '*' })
      return sendStorage(userId)
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
