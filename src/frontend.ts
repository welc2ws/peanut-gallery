import type { SpindleFrontendContext } from 'lumiverse-spindle-types'
import { DEFAULT_SYSTEM_PROMPT, type Fandom, type Feed, type Post, type Settings } from './shared'
import { STYLES } from './styles'

const ICON = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M7.6 6.4A4 4 0 1 0 6.2 14"/><path d="M16.4 6.4A4 4 0 1 1 17.8 14"/><path d="M7 9.5a5 5 0 0 1 10 0V12a3 3 0 0 1-3 3v3.5a1.5 1.5 0 0 0 3 0"/><path d="M7 9.5V12a3 3 0 0 0 3 3"/><circle cx="10" cy="10.2" r=".7" fill="currentColor"/><circle cx="14" cy="10.2" r=".7" fill="currentColor"/></svg>`

const PEANUT = `<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M15.8 2.2c-2.6 0-4.6 2-4.9 4.5-.1 1-.7 1.6-1.6 1.8C6.6 9 4.6 11.4 4.6 14.2c0 3.3 2.7 6 6 6 2.6 0 4.8-1.7 5.6-4.1.3-.9.9-1.4 1.8-1.6 2.3-.6 3.9-2.6 3.9-5 0-4-2.9-7.3-6.1-7.3z" opacity=".95"/><path fill="none" stroke="rgba(0,0,0,.25)" stroke-width="1" stroke-linecap="round" d="M9 13.5c.8.3 1.6.3 2.3 0M8.6 16c.8.3 1.6.3 2.3 0M15.4 6.2c.7.3 1.5.3 2.2 0M15.8 8.7c.7.3 1.5.3 2.2 0"/></svg>`

type View = 'feed' | 'fandom' | 'settings'
interface FandomEntry { id: string; name: string; avatar: string | null }
interface ChatEntry { id: string; name: string; updated: number }

function esc(s: string) {
  return String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!))
}

function richText(s: string) {
  return esc(s)
    .replace(/(^|\s)(#[\p{L}\p{N}_]+)/gu, '$1<span class="pg-tag">$2</span>')
    .replace(/(^|\s)(@[A-Za-z0-9_.]+)/g, '$1<span class="pg-tag">$2</span>')
    .replace(/\n/g, '<br>')
}

function hash(s: string) {
  let h = 0
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0
  return Math.abs(h)
}

function avatarStyle(handle: string) {
  const h = hash(handle)
  const hue = h % 360
  return `background: hsl(${hue} 55% 62%); color: hsl(${hue} 60% 18%);`
}

function initials(name: string) {
  const letters = name.replace(/[^\p{L}\p{N} ]/gu, '').trim().split(/\s+/).map(w => w[0]).join('')
  return (letters || name.trim()[0] || '?').slice(0, 2).toUpperCase()
}

function timeAgo(ts: number) {
  const s = Math.max(0, (Date.now() - ts) / 1000)
  if (s < 60) return 'now'
  if (s < 3600) return `${Math.floor(s / 60)}m`
  if (s < 86400) return `${Math.floor(s / 3600)}h`
  if (s < 86400 * 7) return `${Math.floor(s / 86400)}d`
  return new Date(ts).toLocaleDateString()
}

export function setup(ctx: SpindleFrontendContext) {
  const removeStyle = ctx.dom.addStyle(STYLES)

  const tab = ctx.ui.registerDrawerTab({
    id: 'peanut-gallery',
    title: 'Peanut Gallery',
    shortName: 'Peanuts',
    description: 'A fan feed where the herd reacts to your roleplay',
    keywords: ['fans', 'feed', 'twitter', 'social', 'peanut', 'elephant', 'gallery'],
    iconSvg: ICON,
  })

  const root = tab.root
  root.innerHTML = `
    <div class="pg">
      <header class="pg-head">
        <span class="pg-logo">${PEANUT}</span>
        <div>
          <div class="pg-title">Peanut Gallery</div>
          <div class="pg-sub">the herd is talking</div>
        </div>
      </header>

      <nav class="pg-nav">
        <button data-view="feed" class="active">Feed</button>
        <button data-view="fandom">Fandom</button>
        <button data-view="settings">Settings</button>
      </nav>

      <div class="pg-switcher">
        <label class="pg-field"><span>Fandom</span><select data-el="fandom-select"></select></label>
        <label class="pg-field"><span>Chat</span><select data-el="chat-select"></select></label>
        <button class="pg-ghost pg-small" data-el="follow-active" title="Jump to the chat you have open">Follow open chat</button>
      </div>

      <section data-view-panel="feed">
        <button class="pg-primary" data-el="generate">${PEANUT}<span>Toss peanuts</span></button>
        <div class="pg-status" data-el="status"></div>
        <div class="pg-feed" data-el="feed"></div>
      </section>

      <section data-view-panel="fandom" hidden>
        <div class="pg-card">
          <div class="pg-card-title">Fandom for <span data-el="fandom-char"></span></div>
          <label class="pg-field"><span>Fandom name</span><input data-el="f-name" type="text" maxlength="60" placeholder="#TheHerd"></label>
          <div class="pg-field"><span>What fans can see</span>
            <label class="pg-radio"><input type="radio" name="pg-mode" value="recent"> Recent messages <small>fans react live to the last few messages</small></label>
            <label class="pg-radio"><input type="radio" name="pg-mode" value="summary"> Whole story <small>fans know a running recap plus the latest scene</small></label>
          </div>
          <label class="pg-field" data-el="f-recent-wrap"><span>Recent messages to show fans</span><input data-el="f-recent" type="number" min="1" max="60"></label>
          <label class="pg-field"><span>Fandom notes</span><textarea data-el="f-notes" rows="5" placeholder="Ships, in-jokes, recurring fans, what the fandom is known for..."></textarea></label>
          <button class="pg-primary pg-slim" data-el="f-save">Save fandom</button>
        </div>

        <div class="pg-card" data-el="summary-card">
          <div class="pg-card-title">Story so far <small>(this chat)</small></div>
          <p class="pg-hint">Used when the fandom is set to "Whole story". It updates itself each time the feed refreshes. You can edit it.</p>
          <textarea data-el="summary" rows="8" placeholder="No recap yet. It'll be written the first time the feed refreshes in Whole story mode."></textarea>
          <div class="pg-row">
            <button class="pg-ghost" data-el="summary-save">Save recap</button>
            <button class="pg-ghost" data-el="summary-rebuild">Rebuild from chat</button>
          </div>
        </div>

        <div class="pg-card">
          <div class="pg-card-title">Danger zone</div>
          <button class="pg-danger" data-el="clear-feed">Clear this chat's feed</button>
        </div>
      </section>

      <section data-view-panel="settings" hidden>
        <div class="pg-card">
          <label class="pg-field"><span>Connection</span><select data-el="s-conn"></select></label>
          <div class="pg-grid2">
            <label class="pg-field"><span>Posts per refresh</span><input data-el="s-count" type="number" min="1" max="30"></label>
            <label class="pg-field"><span>Temperature</span><input data-el="s-temp" type="number" min="0" max="2" step="0.05"></label>
          </div>
          <label class="pg-field"><span>Tone</span><input data-el="s-tone" type="text" placeholder="chaotic, funny and invested"></label>
          <label class="pg-check"><input data-el="s-auto" type="checkbox"> Refresh the feed automatically after AI replies</label>
          <div class="pg-grid2">
            <label class="pg-field"><span>...every how many replies</span><input data-el="s-every" type="number" min="1" max="50"></label>
            <label class="pg-field"><span>Posts kept per chat</span><input data-el="s-keep" type="number" min="10" max="1000"></label>
          </div>
        </div>
        <div class="pg-card">
          <div class="pg-card-title">System prompt</div>
          <p class="pg-hint">Macros: <code>{{char}}</code> <code>{{user}}</code> <code>{{fandom}}</code> <code>{{tone}}</code> <code>{{count}}</code>. The post format rules are added automatically, so you don't need to include them.</p>
          <textarea data-el="s-prompt" rows="14"></textarea>
          <button class="pg-ghost pg-small" data-el="s-reset">Reset to default prompt</button>
        </div>
        <button class="pg-primary pg-slim" data-el="s-save">Save settings</button>
      </section>
    </div>
  `

  const $ = <T extends HTMLElement = HTMLElement>(name: string) => root.querySelector(`[data-el="${name}"]`) as T

  const el = {
    fandomSelect: $<HTMLSelectElement>('fandom-select'),
    chatSelect: $<HTMLSelectElement>('chat-select'),
    followActive: $<HTMLButtonElement>('follow-active'),
    generate: $<HTMLButtonElement>('generate'),
    status: $('status'),
    feed: $('feed'),
    fandomChar: $('fandom-char'),
    fName: $<HTMLInputElement>('f-name'),
    fRecent: $<HTMLInputElement>('f-recent'),
    fRecentWrap: $('f-recent-wrap'),
    fNotes: $<HTMLTextAreaElement>('f-notes'),
    fSave: $<HTMLButtonElement>('f-save'),
    summary: $<HTMLTextAreaElement>('summary'),
    summarySave: $<HTMLButtonElement>('summary-save'),
    summaryRebuild: $<HTMLButtonElement>('summary-rebuild'),
    clearFeed: $<HTMLButtonElement>('clear-feed'),
    sConn: $<HTMLSelectElement>('s-conn'),
    sCount: $<HTMLInputElement>('s-count'),
    sTemp: $<HTMLInputElement>('s-temp'),
    sTone: $<HTMLInputElement>('s-tone'),
    sAuto: $<HTMLInputElement>('s-auto'),
    sEvery: $<HTMLInputElement>('s-every'),
    sKeep: $<HTMLInputElement>('s-keep'),
    sPrompt: $<HTMLTextAreaElement>('s-prompt'),
    sReset: $<HTMLButtonElement>('s-reset'),
    sSave: $<HTMLButtonElement>('s-save'),
  }
  const modeRadios = Array.from(root.querySelectorAll<HTMLInputElement>('input[name="pg-mode"]'))

  // ---------- state ----------
  let view: View = 'feed'
  let fandoms: FandomEntry[] = []
  let chats: ChatEntry[] = []
  let characterId = ''
  let chatId = ''
  let followActive = true
  let activeChat: { chatId: string; characterId: string } | null = null
  let feed: Feed | null = null
  let fandom: Fandom | null = null
  let settings: Settings | null = null
  const busy = new Set<string>()
  let unseen = 0
  let tabOpen = false

  // ---------- rendering ----------
  function setView(v: View) {
    view = v
    root.querySelectorAll<HTMLButtonElement>('.pg-nav button').forEach(b => b.classList.toggle('active', b.dataset.view === v))
    root.querySelectorAll<HTMLElement>('[data-view-panel]').forEach(p => (p.hidden = p.dataset.viewPanel !== v))
  }

  function renderSwitcher() {
    el.fandomSelect.innerHTML = fandoms.length
      ? fandoms.map(f => `<option value="${esc(f.id)}"${f.id === characterId ? ' selected' : ''}>${esc(f.name)}</option>`).join('')
      : '<option value="">No characters yet</option>'
    el.chatSelect.innerHTML = chats.length
      ? chats.map(c => `<option value="${esc(c.id)}"${c.id === chatId ? ' selected' : ''}>${esc(c.name)}${activeChat?.chatId === c.id ? ' (open)' : ''}</option>`).join('')
      : '<option value="">No chats</option>'
    el.followActive.classList.toggle('on', followActive)
    el.followActive.textContent = followActive ? 'Following open chat' : 'Follow open chat'
  }

  function renderFeed() {
    const isBusy = !!chatId && busy.has(chatId)
    el.generate.disabled = !chatId || isBusy
    el.generate.classList.toggle('loading', isBusy)
    const label = el.generate.querySelector('span')!
    label.textContent = isBusy ? 'The herd is typing...' : 'Toss peanuts'

    if (!chatId) {
      el.feed.innerHTML = `<div class="pg-empty">${PEANUT}<p>Open a chat or pick one above to see its fans.</p></div>`
      return
    }
    const posts = feed?.posts || []
    const typing = isBusy
      ? `<div class="pg-post pg-typing"><div class="pg-avatar pg-skel"></div><div class="pg-body"><div class="pg-skel pg-line"></div><div class="pg-skel pg-line short"></div></div></div>`
      : ''
    if (!posts.length) {
      el.feed.innerHTML = typing || `<div class="pg-empty">${PEANUT}<p>It's quiet in here. Toss some peanuts to wake up the fans.</p></div>`
      return
    }
    el.feed.innerHTML = typing + posts.map(postHtml).join('')
  }

  function postHtml(p: Post) {
    return `
      <article class="pg-post" data-id="${esc(p.id)}">
        <div class="pg-avatar" style="${avatarStyle(p.handle)}">${esc(initials(p.name))}</div>
        <div class="pg-body">
          <div class="pg-meta">
            <span class="pg-name">${esc(p.name)}</span>
            <button class="pg-del" data-del="${esc(p.id)}" title="Delete post" aria-label="Delete post">×</button>
          </div>
          <div class="pg-sub2">
            <span class="pg-handle">@${esc(p.handle)}</span>
            <span class="pg-dot">·</span>
            <span class="pg-time" title="${esc(new Date(p.ts).toLocaleString())}">${timeAgo(p.ts)}</span>
          </div>
          <div class="pg-text">${richText(p.text)}</div>
        </div>
      </article>`
  }

  function renderFandom() {
    const name = fandoms.find(f => f.id === characterId)?.name || 'this character'
    el.fandomChar.textContent = name
    if (!fandom) return
    el.fName.value = fandom.name
    modeRadios.forEach(r => (r.checked = r.value === fandom!.contextMode))
    el.fRecent.value = String(fandom.recentCount)
    el.fNotes.value = fandom.notes
    el.fRecentWrap.hidden = fandom.contextMode !== 'recent'
    el.summary.value = feed?.summary || ''
    const isBusy = !!chatId && busy.has(chatId)
    el.summaryRebuild.disabled = !chatId || isBusy
    el.summarySave.disabled = !chatId
    el.clearFeed.disabled = !chatId
  }

  function renderSettings(connections?: Array<{ id: string; name: string; provider: string; isDefault: boolean }>) {
    if (!settings) return
    if (connections) {
      el.sConn.innerHTML =
        `<option value="">Use my default connection</option>` +
        connections.map(c => `<option value="${esc(c.id)}">${esc(c.name)}${c.isDefault ? ' (default)' : ''} · ${esc(c.provider)}</option>`).join('')
    }
    el.sConn.value = settings.connectionId
    el.sCount.value = String(settings.postCount)
    el.sTemp.value = String(settings.temperature)
    el.sTone.value = settings.tone
    el.sAuto.checked = settings.autoGenerate
    el.sEvery.value = String(settings.autoEvery)
    el.sKeep.value = String(settings.keepPosts)
    el.sPrompt.value = settings.systemPrompt
  }

  function setStatus(text: string, kind: 'error' | 'info' = 'info') {
    el.status.textContent = text
    el.status.className = `pg-status ${text ? kind : ''}`
  }

  function setBadge() {
    tab.setBadge(unseen > 0 && !tabOpen ? String(unseen) : null)
  }

  // ---------- selection ----------
  function selectCharacter(id: string, preferChat?: string) {
    characterId = id
    chatId = preferChat || ''
    chats = []
    feed = null
    fandom = null
    renderSwitcher()
    renderFeed()
    if (id) ctx.sendToBackend({ type: 'list_chats', characterId: id, preferChat })
  }

  function selectChat(id: string) {
    chatId = id
    feed = null
    renderSwitcher()
    renderFeed()
    setStatus('')
    if (id) ctx.sendToBackend({ type: 'load_feed', chatId: id })
  }

  function jumpToActive() {
    if (!activeChat) return
    if (activeChat.characterId !== characterId) selectCharacter(activeChat.characterId, activeChat.chatId)
    else if (activeChat.chatId !== chatId) selectChat(activeChat.chatId)
  }

  // ---------- events ----------
  root.querySelectorAll<HTMLButtonElement>('.pg-nav button').forEach(b => b.addEventListener('click', () => setView(b.dataset.view as View)))

  el.fandomSelect.addEventListener('change', () => {
    followActive = false
    selectCharacter(el.fandomSelect.value)
  })
  el.chatSelect.addEventListener('change', () => {
    followActive = activeChat?.chatId === el.chatSelect.value
    selectChat(el.chatSelect.value)
  })
  el.followActive.addEventListener('click', () => {
    followActive = true
    renderSwitcher()
    jumpToActive()
  })

  el.generate.addEventListener('click', () => {
    if (!chatId || busy.has(chatId)) return
    setStatus('')
    ctx.sendToBackend({ type: 'generate', chatId })
  })

  el.feed.addEventListener('click', e => {
    const btn = (e.target as HTMLElement).closest<HTMLElement>('[data-del]')
    if (btn && chatId) ctx.sendToBackend({ type: 'delete_post', chatId, postId: btn.dataset.del })
  })

  modeRadios.forEach(r =>
    r.addEventListener('change', () => {
      el.fRecentWrap.hidden = r.value !== 'recent' || !r.checked
    }),
  )

  el.fSave.addEventListener('click', () => {
    if (!characterId) return
    ctx.sendToBackend({
      type: 'save_fandom',
      characterId,
      fandom: {
        name: el.fName.value.trim(),
        contextMode: modeRadios.find(r => r.checked)?.value || 'recent',
        recentCount: Number(el.fRecent.value),
        notes: el.fNotes.value,
      },
    })
  })

  el.summarySave.addEventListener('click', () => {
    if (chatId) ctx.sendToBackend({ type: 'save_summary', chatId, summary: el.summary.value })
  })
  el.summaryRebuild.addEventListener('click', () => {
    if (chatId && !busy.has(chatId)) ctx.sendToBackend({ type: 'rebuild_summary', chatId })
  })
  el.clearFeed.addEventListener('click', () => {
    if (chatId && confirm('Clear every post in this chat\'s feed?')) ctx.sendToBackend({ type: 'clear_feed', chatId })
  })

  el.sReset.addEventListener('click', () => {
    el.sPrompt.value = DEFAULT_SYSTEM_PROMPT
  })
  el.sSave.addEventListener('click', () => {
    ctx.sendToBackend({
      type: 'save_settings',
      settings: {
        connectionId: el.sConn.value,
        postCount: Number(el.sCount.value),
        temperature: Number(el.sTemp.value),
        tone: el.sTone.value.trim(),
        autoGenerate: el.sAuto.checked,
        autoEvery: Number(el.sEvery.value),
        keepPosts: Number(el.sKeep.value),
        systemPrompt: el.sPrompt.value.trim() || DEFAULT_SYSTEM_PROMPT,
      },
    })
  })

  const offActivate = tab.onActivate(() => {
    tabOpen = true
    unseen = 0
    setBadge()
  })

  // ---------- backend messages ----------
  const unsub = ctx.onBackendMessage((msg: any) => {
    switch (msg?.type) {
      case 'init_data': {
        settings = msg.settings
        fandoms = msg.fandoms || []
        activeChat = msg.active
        renderSettings(msg.connections || [])
        if (activeChat) selectCharacter(activeChat.characterId, activeChat.chatId)
        else if (fandoms[0]) selectCharacter(fandoms[0].id)
        else renderSwitcher()
        renderFeed()
        break
      }
      case 'chats_data': {
        if (msg.characterId !== characterId) break
        chats = msg.chats || []
        fandom = msg.fandom
        const keep = chats.find(c => c.id === chatId)
        renderSwitcher()
        renderFandom()
        selectChat(keep ? keep.id : chats[0]?.id || '')
        break
      }
      case 'feed_data': {
        if (msg.chatId === chatId) {
          feed = msg.feed
          fandom = msg.fandom
          if (msg.generating) busy.add(chatId)
          renderFeed()
          renderFandom()
        }
        if (msg.newCount) {
          if (!tabOpen || msg.chatId !== chatId) {
            unseen += msg.newCount
            setBadge()
          }
        }
        break
      }
      case 'generating': {
        if (msg.on) busy.add(msg.chatId)
        else busy.delete(msg.chatId)
        if (msg.chatId === chatId) {
          renderFeed()
          renderFandom()
          if (msg.on && msg.what === 'summary') setStatus('Rebuilding the story recap...')
          else if (!msg.on && el.status.classList.contains('info')) setStatus('')
        }
        break
      }
      case 'active_changed': {
        activeChat = msg.active
        if (followActive) jumpToActive()
        else renderSwitcher()
        break
      }
      case 'settings_saved':
        settings = msg.settings
        renderSettings()
        break
      case 'fandom_saved':
        if (msg.characterId === characterId) {
          fandom = msg.fandom
          renderFandom()
        }
        break
      case 'error':
        if (!msg.chatId || msg.chatId === chatId) setStatus(msg.message || 'Something went wrong.', 'error')
        break
    }
  })

  // Track whether our tab is the one showing so the badge only counts unseen posts.
  const visibility = new IntersectionObserver(entries => {
    tabOpen = entries.some(e => e.isIntersecting)
    if (tabOpen) {
      unseen = 0
      setBadge()
    }
  })
  visibility.observe(root)

  // Refresh "5m ago" labels.
  const ticker = setInterval(() => {
    root.querySelectorAll<HTMLElement>('.pg-post[data-id]').forEach(node => {
      const post = feed?.posts.find(p => p.id === node.dataset.id)
      const t = node.querySelector('.pg-time')
      if (post && t) t.textContent = timeAgo(post.ts)
    })
  }, 60_000)

  setView('feed')
  ctx.sendToBackend({ type: 'init' })

  return () => {
    clearInterval(ticker)
    visibility.disconnect()
    offActivate()
    unsub()
    removeStyle()
    tab.destroy()
  }
}
