// src/shared.ts
var DEFAULT_SYSTEM_PROMPT = `You are the Peanut Gallery: a crowd of online fans following {{char}}'s story with {{user}} like it's a show they're obsessed with. The fandom is called {{fandom}}.

Write short social media posts reacting to what just happened. Mix up the crowd: hype stans, shippers, theory-crafters, haters, people who only keysmash, someone who misread the plot, update/news accounts, meme accounts. Every fan has their own username and personality, and recurring fans can show up again.

Fans only know what happened on screen. They can speculate wildly, but they never know a character's hidden thoughts or anything that wasn't shown.

Use internet speak: lowercase, emojis, hashtags, caps lock, abbreviations, whatever fits. Keep each post under 280 characters.

Overall tone: {{tone}}.`;

// src/styles.ts
var STYLES = `
.pg {
  --pg-peanut: #c8955a;
  --pg-peanut-deep: #9a6a35;
  --pg-shell: #ecd3a4;
  --pg-elephant: #8d93a5;
  --pg-radius: var(--lumiverse-radius, 10px);
  display: flex; flex-direction: column; gap: 10px;
  padding: 12px; box-sizing: border-box; height: 100%; width: 100%; max-width: 100%; overflow-y: auto; overflow-x: hidden;
  color: var(--lumiverse-text); font-size: 14px;
}
.pg *, .pg *::before, .pg *::after { box-sizing: border-box; }
.pg [hidden] { display: none !important; }
.pg section { display: flex; flex-direction: column; gap: 10px; }
.pg section .pg-card { margin-bottom: 0; }

.pg-head { display: flex; align-items: center; gap: 10px; }
.pg-logo { width: 34px; height: 34px; border-radius: 50%; display: grid; place-items: center;
  background: color-mix(in srgb, var(--pg-shell) 35%, transparent); color: var(--pg-peanut); flex: none; }
.pg-logo svg { width: 22px; height: 22px; transform: rotate(-20deg); }
.pg-title { font-weight: 800; font-size: 17px; letter-spacing: .01em; }
.pg-sub { font-size: 12px; color: var(--lumiverse-text-muted); font-style: italic; }

.pg-nav { display: flex; gap: 4px; border-bottom: 1px solid var(--lumiverse-border); }
.pg-nav button { flex: 1; padding: 8px 6px; background: none; border: none; border-bottom: 2px solid transparent;
  color: var(--lumiverse-text-muted); font-weight: 700; cursor: pointer; font-size: 13px; }
.pg-nav button.active { color: var(--lumiverse-text); border-bottom-color: var(--pg-peanut); }

.pg-switcher { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 8px; align-items: end; }
.pg-switcher .pg-small { grid-column: 1 / -1; justify-self: start; }

.pg-field { display: flex; flex-direction: column; gap: 4px; min-width: 0; }
.pg-field > span { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: .05em; color: var(--lumiverse-text-muted); }
.pg input[type="text"], .pg input[type="number"], .pg select, .pg textarea {
  width: 100%; max-width: 100%; min-width: 0; padding: 7px 9px; font: inherit; font-size: 13px; color: var(--lumiverse-text);
  background: var(--lumiverse-fill); border: 1px solid var(--lumiverse-border); border-radius: var(--pg-radius);
}
.pg textarea { resize: vertical; line-height: 1.45; }
.pg input:focus, .pg select:focus, .pg textarea:focus { outline: none; border-color: var(--pg-peanut); }

.pg-radio { display: flex; flex-wrap: wrap; align-items: baseline; gap: 6px; padding: 6px 0; cursor: pointer; font-weight: 600; font-size: 13px; }
.pg-radio small { flex-basis: 100%; padding-left: 22px; font-weight: 400; color: var(--lumiverse-text-muted); font-size: 12px; }
.pg-check { display: flex; gap: 8px; align-items: center; font-size: 13px; cursor: pointer; }
.pg input[type="radio"], .pg input[type="checkbox"] { accent-color: var(--pg-peanut); }

.pg-grid2 { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 8px; }
.pg-row { display: flex; gap: 8px; flex-wrap: wrap; }

.pg-primary { display: flex; align-items: center; justify-content: center; gap: 8px; width: 100%;
  padding: 11px 14px; border: none; border-radius: 999px; cursor: pointer; font-weight: 800; font-size: 14px;
  color: #3b2410; background: linear-gradient(180deg, var(--pg-shell), var(--pg-peanut));
  box-shadow: 0 2px 0 var(--pg-peanut-deep); transition: transform .1s, filter .15s; }
.pg-primary svg { width: 20px; height: 20px; color: #fff4dd; transform: rotate(-20deg); }
.pg-primary:hover:not(:disabled) { filter: brightness(1.05); }
.pg-primary:active:not(:disabled) { transform: translateY(2px); box-shadow: none; }
.pg-primary:disabled { opacity: .65; cursor: default; }
.pg-primary.loading svg { animation: pg-wobble .6s ease-in-out infinite alternate; }
.pg-slim { padding: 9px 14px; font-size: 13px; }

.pg-ghost { padding: 7px 12px; border-radius: 999px; cursor: pointer; font-weight: 600; font-size: 12px;
  background: none; color: var(--lumiverse-text-muted); border: 1px solid var(--lumiverse-border); }
.pg-ghost:hover:not(:disabled) { color: var(--lumiverse-text); border-color: var(--pg-peanut); }
.pg-ghost:disabled { opacity: .5; cursor: default; }
.pg-ghost.on { color: var(--pg-peanut); border-color: var(--pg-peanut); }
.pg-small { padding: 4px 10px; font-size: 11px; }
.pg-danger { padding: 8px 12px; border-radius: var(--pg-radius); cursor: pointer; font-weight: 700; font-size: 12px;
  background: none; color: var(--lumiverse-danger, #d9534f); border: 1px solid var(--lumiverse-danger, #d9534f); }
.pg-danger:disabled { opacity: .5; cursor: default; }

.pg-card { display: flex; flex-direction: column; gap: 10px; padding: 12px; margin-bottom: 10px;
  background: var(--lumiverse-fill-subtle); border: 1px solid var(--lumiverse-border); border-radius: var(--pg-radius); }
.pg-card-title { font-weight: 800; font-size: 14px; }
.pg-card-title small { font-weight: 400; color: var(--lumiverse-text-muted); }
.pg-hint { margin: 0; font-size: 12px; color: var(--lumiverse-text-muted); line-height: 1.45; }
.pg-hint code { overflow-wrap: anywhere; font-size: 11px; padding: 1px 4px; border-radius: 4px; background: var(--lumiverse-fill); }

.pg-status { font-size: 12px; line-height: 1.4; }
.pg-status.error { padding: 8px 10px; border-radius: var(--pg-radius); color: var(--lumiverse-danger, #d9534f);
  background: color-mix(in srgb, var(--lumiverse-danger, #d9534f) 10%, transparent); }
.pg-status:empty { display: none; }

.pg-feed { display: flex; flex-direction: column; border: 1px solid var(--lumiverse-border); border-radius: var(--pg-radius); overflow: hidden; }
.pg-feed:has(.pg-empty) { border: none; }
.pg-post { display: flex; gap: 10px; padding: 11px 12px; border-bottom: 1px solid var(--lumiverse-border); animation: pg-in .25s ease; }
.pg-post:last-child { border-bottom: none; }
.pg-post:hover { background: var(--lumiverse-fill-subtle); }
.pg-avatar { width: 38px; height: 38px; border-radius: 50%; flex: none; display: grid; place-items: center;
  font-weight: 800; font-size: 13px; }
.pg-body { flex: 1; min-width: 0; }
.pg-meta { display: flex; align-items: baseline; gap: 4px; min-width: 0; font-size: 13px; }
.pg-name { font-weight: 800; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 45%; }
.pg-handle, .pg-dot, .pg-time { color: var(--lumiverse-text-muted); white-space: nowrap; }
.pg-handle { overflow: hidden; text-overflow: ellipsis; min-width: 0; }
.pg-del { margin-left: auto; border: none; background: none; cursor: pointer; font-size: 16px; line-height: 1;
  color: var(--lumiverse-text-muted); opacity: 0; transition: opacity .15s; padding: 0 2px; }
.pg-post:hover .pg-del, .pg-del:focus { opacity: 1; }
@media (hover: none) { .pg-del { opacity: .5; } }
.pg-text { margin-top: 2px; line-height: 1.45; overflow-wrap: anywhere; }
.pg-tag { color: var(--pg-peanut); font-weight: 600; }

.pg-empty { display: flex; flex-direction: column; align-items: center; gap: 6px; padding: 28px 12px; text-align: center; color: var(--lumiverse-text-muted); }
.pg-empty svg { width: 40px; height: 40px; color: var(--pg-shell); transform: rotate(-20deg); }
.pg-empty p { margin: 0; font-size: 13px; }

.pg-skel { background: linear-gradient(90deg, var(--lumiverse-fill) 25%, var(--lumiverse-fill-subtle) 50%, var(--lumiverse-fill) 75%);
  background-size: 200% 100%; animation: pg-shimmer 1.2s linear infinite; border-radius: 6px; }
.pg-avatar.pg-skel { border-radius: 50%; }
.pg-line { height: 11px; margin: 6px 0; width: 85%; }
.pg-line.short { width: 55%; }

@keyframes pg-in { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: none; } }
@keyframes pg-shimmer { to { background-position: -200% 0; } }
@keyframes pg-wobble { from { transform: rotate(-35deg); } to { transform: rotate(-5deg); } }
`;

// src/frontend.ts
var ICON = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M7.6 6.4A4 4 0 1 0 6.2 14"/><path d="M16.4 6.4A4 4 0 1 1 17.8 14"/><path d="M7 9.5a5 5 0 0 1 10 0V12a3 3 0 0 1-3 3v3.5a1.5 1.5 0 0 0 3 0"/><path d="M7 9.5V12a3 3 0 0 0 3 3"/><circle cx="10" cy="10.2" r=".7" fill="currentColor"/><circle cx="14" cy="10.2" r=".7" fill="currentColor"/></svg>`;
var PEANUT = `<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M15.8 2.2c-2.6 0-4.6 2-4.9 4.5-.1 1-.7 1.6-1.6 1.8C6.6 9 4.6 11.4 4.6 14.2c0 3.3 2.7 6 6 6 2.6 0 4.8-1.7 5.6-4.1.3-.9.9-1.4 1.8-1.6 2.3-.6 3.9-2.6 3.9-5 0-4-2.9-7.3-6.1-7.3z" opacity=".95"/><path fill="none" stroke="rgba(0,0,0,.25)" stroke-width="1" stroke-linecap="round" d="M9 13.5c.8.3 1.6.3 2.3 0M8.6 16c.8.3 1.6.3 2.3 0M15.4 6.2c.7.3 1.5.3 2.2 0M15.8 8.7c.7.3 1.5.3 2.2 0"/></svg>`;
function esc(s) {
  return String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
}
function richText(s) {
  return esc(s).replace(/(^|\s)(#[\p{L}\p{N}_]+)/gu, '$1<span class="pg-tag">$2</span>').replace(/(^|\s)(@[A-Za-z0-9_.]+)/g, '$1<span class="pg-tag">$2</span>').replace(/\n/g, "<br>");
}
function hash(s) {
  let h = 0;
  for (let i = 0;i < s.length; i++)
    h = h * 31 + s.charCodeAt(i) | 0;
  return Math.abs(h);
}
function avatarStyle(handle) {
  const h = hash(handle);
  const hue = h % 360;
  return `background: hsl(${hue} 55% 62%); color: hsl(${hue} 60% 18%);`;
}
function initials(name) {
  const letters = name.replace(/[^\p{L}\p{N} ]/gu, "").trim().split(/\s+/).map((w) => w[0]).join("");
  return (letters || name.trim()[0] || "?").slice(0, 2).toUpperCase();
}
function timeAgo(ts) {
  const s = Math.max(0, (Date.now() - ts) / 1000);
  if (s < 60)
    return "now";
  if (s < 3600)
    return `${Math.floor(s / 60)}m`;
  if (s < 86400)
    return `${Math.floor(s / 3600)}h`;
  if (s < 86400 * 7)
    return `${Math.floor(s / 86400)}d`;
  return new Date(ts).toLocaleDateString();
}
function setup(ctx) {
  const removeStyle = ctx.dom.addStyle(STYLES);
  const tab = ctx.ui.registerDrawerTab({
    id: "peanut-gallery",
    title: "Peanut Gallery",
    shortName: "Peanuts",
    description: "A fan feed where the herd reacts to your roleplay",
    keywords: ["fans", "feed", "twitter", "social", "peanut", "elephant", "gallery"],
    iconSvg: ICON
  });
  const root = tab.root;
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
  `;
  const $ = (name) => root.querySelector(`[data-el="${name}"]`);
  const el = {
    fandomSelect: $("fandom-select"),
    chatSelect: $("chat-select"),
    followActive: $("follow-active"),
    generate: $("generate"),
    status: $("status"),
    feed: $("feed"),
    fandomChar: $("fandom-char"),
    fName: $("f-name"),
    fRecent: $("f-recent"),
    fRecentWrap: $("f-recent-wrap"),
    fNotes: $("f-notes"),
    fSave: $("f-save"),
    summary: $("summary"),
    summarySave: $("summary-save"),
    summaryRebuild: $("summary-rebuild"),
    clearFeed: $("clear-feed"),
    sConn: $("s-conn"),
    sCount: $("s-count"),
    sTemp: $("s-temp"),
    sTone: $("s-tone"),
    sAuto: $("s-auto"),
    sEvery: $("s-every"),
    sKeep: $("s-keep"),
    sPrompt: $("s-prompt"),
    sReset: $("s-reset"),
    sSave: $("s-save")
  };
  const modeRadios = Array.from(root.querySelectorAll('input[name="pg-mode"]'));
  let view = "feed";
  let fandoms = [];
  let chats = [];
  let characterId = "";
  let chatId = "";
  let followActive = true;
  let activeChat = null;
  let feed = null;
  let fandom = null;
  let settings = null;
  const busy = new Set;
  let unseen = 0;
  let tabOpen = false;
  function setView(v) {
    view = v;
    root.querySelectorAll(".pg-nav button").forEach((b) => b.classList.toggle("active", b.dataset.view === v));
    root.querySelectorAll("[data-view-panel]").forEach((p) => p.hidden = p.dataset.viewPanel !== v);
  }
  function renderSwitcher() {
    el.fandomSelect.innerHTML = fandoms.length ? fandoms.map((f) => `<option value="${esc(f.id)}"${f.id === characterId ? " selected" : ""}>${esc(f.name)}</option>`).join("") : '<option value="">No characters yet</option>';
    el.chatSelect.innerHTML = chats.length ? chats.map((c) => `<option value="${esc(c.id)}"${c.id === chatId ? " selected" : ""}>${esc(c.name)}${activeChat?.chatId === c.id ? " (open)" : ""}</option>`).join("") : '<option value="">No chats</option>';
    el.followActive.classList.toggle("on", followActive);
    el.followActive.textContent = followActive ? "Following open chat" : "Follow open chat";
  }
  function renderFeed() {
    const isBusy = !!chatId && busy.has(chatId);
    el.generate.disabled = !chatId || isBusy;
    el.generate.classList.toggle("loading", isBusy);
    const label = el.generate.querySelector("span");
    label.textContent = isBusy ? "The herd is typing..." : "Toss peanuts";
    if (!chatId) {
      el.feed.innerHTML = `<div class="pg-empty">${PEANUT}<p>Open a chat or pick one above to see its fans.</p></div>`;
      return;
    }
    const posts = feed?.posts || [];
    const typing = isBusy ? `<div class="pg-post pg-typing"><div class="pg-avatar pg-skel"></div><div class="pg-body"><div class="pg-skel pg-line"></div><div class="pg-skel pg-line short"></div></div></div>` : "";
    if (!posts.length) {
      el.feed.innerHTML = typing || `<div class="pg-empty">${PEANUT}<p>It's quiet in here. Toss some peanuts to wake up the fans.</p></div>`;
      return;
    }
    el.feed.innerHTML = typing + posts.map(postHtml).join("");
  }
  function postHtml(p) {
    return `
      <article class="pg-post" data-id="${esc(p.id)}">
        <div class="pg-avatar" style="${avatarStyle(p.handle)}">${esc(initials(p.name))}</div>
        <div class="pg-body">
          <div class="pg-meta">
            <span class="pg-name">${esc(p.name)}</span>
            <span class="pg-handle">@${esc(p.handle)}</span>
            <span class="pg-dot">·</span>
            <span class="pg-time" title="${esc(new Date(p.ts).toLocaleString())}">${timeAgo(p.ts)}</span>
            <button class="pg-del" data-del="${esc(p.id)}" title="Delete post" aria-label="Delete post">×</button>
          </div>
          <div class="pg-text">${richText(p.text)}</div>
        </div>
      </article>`;
  }
  function renderFandom() {
    const name = fandoms.find((f) => f.id === characterId)?.name || "this character";
    el.fandomChar.textContent = name;
    if (!fandom)
      return;
    el.fName.value = fandom.name;
    modeRadios.forEach((r) => r.checked = r.value === fandom.contextMode);
    el.fRecent.value = String(fandom.recentCount);
    el.fNotes.value = fandom.notes;
    el.fRecentWrap.hidden = fandom.contextMode !== "recent";
    el.summary.value = feed?.summary || "";
    const isBusy = !!chatId && busy.has(chatId);
    el.summaryRebuild.disabled = !chatId || isBusy;
    el.summarySave.disabled = !chatId;
    el.clearFeed.disabled = !chatId;
  }
  function renderSettings(connections) {
    if (!settings)
      return;
    if (connections) {
      el.sConn.innerHTML = `<option value="">Use my default connection</option>` + connections.map((c) => `<option value="${esc(c.id)}">${esc(c.name)}${c.isDefault ? " (default)" : ""} · ${esc(c.provider)}</option>`).join("");
    }
    el.sConn.value = settings.connectionId;
    el.sCount.value = String(settings.postCount);
    el.sTemp.value = String(settings.temperature);
    el.sTone.value = settings.tone;
    el.sAuto.checked = settings.autoGenerate;
    el.sEvery.value = String(settings.autoEvery);
    el.sKeep.value = String(settings.keepPosts);
    el.sPrompt.value = settings.systemPrompt;
  }
  function setStatus(text, kind = "info") {
    el.status.textContent = text;
    el.status.className = `pg-status ${text ? kind : ""}`;
  }
  function setBadge() {
    tab.setBadge(unseen > 0 && !tabOpen ? String(unseen) : null);
  }
  function selectCharacter(id, preferChat) {
    characterId = id;
    chatId = preferChat || "";
    chats = [];
    feed = null;
    fandom = null;
    renderSwitcher();
    renderFeed();
    if (id)
      ctx.sendToBackend({ type: "list_chats", characterId: id, preferChat });
  }
  function selectChat(id) {
    chatId = id;
    feed = null;
    renderSwitcher();
    renderFeed();
    setStatus("");
    if (id)
      ctx.sendToBackend({ type: "load_feed", chatId: id });
  }
  function jumpToActive() {
    if (!activeChat)
      return;
    if (activeChat.characterId !== characterId)
      selectCharacter(activeChat.characterId, activeChat.chatId);
    else if (activeChat.chatId !== chatId)
      selectChat(activeChat.chatId);
  }
  root.querySelectorAll(".pg-nav button").forEach((b) => b.addEventListener("click", () => setView(b.dataset.view)));
  el.fandomSelect.addEventListener("change", () => {
    followActive = false;
    selectCharacter(el.fandomSelect.value);
  });
  el.chatSelect.addEventListener("change", () => {
    followActive = activeChat?.chatId === el.chatSelect.value;
    selectChat(el.chatSelect.value);
  });
  el.followActive.addEventListener("click", () => {
    followActive = true;
    renderSwitcher();
    jumpToActive();
  });
  el.generate.addEventListener("click", () => {
    if (!chatId || busy.has(chatId))
      return;
    setStatus("");
    ctx.sendToBackend({ type: "generate", chatId });
  });
  el.feed.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-del]");
    if (btn && chatId)
      ctx.sendToBackend({ type: "delete_post", chatId, postId: btn.dataset.del });
  });
  modeRadios.forEach((r) => r.addEventListener("change", () => {
    el.fRecentWrap.hidden = r.value !== "recent" || !r.checked;
  }));
  el.fSave.addEventListener("click", () => {
    if (!characterId)
      return;
    ctx.sendToBackend({
      type: "save_fandom",
      characterId,
      fandom: {
        name: el.fName.value.trim(),
        contextMode: modeRadios.find((r) => r.checked)?.value || "recent",
        recentCount: Number(el.fRecent.value),
        notes: el.fNotes.value
      }
    });
  });
  el.summarySave.addEventListener("click", () => {
    if (chatId)
      ctx.sendToBackend({ type: "save_summary", chatId, summary: el.summary.value });
  });
  el.summaryRebuild.addEventListener("click", () => {
    if (chatId && !busy.has(chatId))
      ctx.sendToBackend({ type: "rebuild_summary", chatId });
  });
  el.clearFeed.addEventListener("click", () => {
    if (chatId && confirm("Clear every post in this chat's feed?"))
      ctx.sendToBackend({ type: "clear_feed", chatId });
  });
  el.sReset.addEventListener("click", () => {
    el.sPrompt.value = DEFAULT_SYSTEM_PROMPT;
  });
  el.sSave.addEventListener("click", () => {
    ctx.sendToBackend({
      type: "save_settings",
      settings: {
        connectionId: el.sConn.value,
        postCount: Number(el.sCount.value),
        temperature: Number(el.sTemp.value),
        tone: el.sTone.value.trim(),
        autoGenerate: el.sAuto.checked,
        autoEvery: Number(el.sEvery.value),
        keepPosts: Number(el.sKeep.value),
        systemPrompt: el.sPrompt.value.trim() || DEFAULT_SYSTEM_PROMPT
      }
    });
  });
  const offActivate = tab.onActivate(() => {
    tabOpen = true;
    unseen = 0;
    setBadge();
  });
  const unsub = ctx.onBackendMessage((msg) => {
    switch (msg?.type) {
      case "init_data": {
        settings = msg.settings;
        fandoms = msg.fandoms || [];
        activeChat = msg.active;
        renderSettings(msg.connections || []);
        if (activeChat)
          selectCharacter(activeChat.characterId, activeChat.chatId);
        else if (fandoms[0])
          selectCharacter(fandoms[0].id);
        else
          renderSwitcher();
        renderFeed();
        break;
      }
      case "chats_data": {
        if (msg.characterId !== characterId)
          break;
        chats = msg.chats || [];
        fandom = msg.fandom;
        const keep = chats.find((c) => c.id === chatId);
        renderSwitcher();
        renderFandom();
        selectChat(keep ? keep.id : chats[0]?.id || "");
        break;
      }
      case "feed_data": {
        if (msg.chatId === chatId) {
          feed = msg.feed;
          fandom = msg.fandom;
          if (msg.generating)
            busy.add(chatId);
          renderFeed();
          renderFandom();
        }
        if (msg.newCount) {
          if (!tabOpen || msg.chatId !== chatId) {
            unseen += msg.newCount;
            setBadge();
          }
        }
        break;
      }
      case "generating": {
        if (msg.on)
          busy.add(msg.chatId);
        else
          busy.delete(msg.chatId);
        if (msg.chatId === chatId) {
          renderFeed();
          renderFandom();
          if (msg.on && msg.what === "summary")
            setStatus("Rebuilding the story recap...");
          else if (!msg.on && el.status.classList.contains("info"))
            setStatus("");
        }
        break;
      }
      case "active_changed": {
        activeChat = msg.active;
        if (followActive)
          jumpToActive();
        else
          renderSwitcher();
        break;
      }
      case "settings_saved":
        settings = msg.settings;
        renderSettings();
        break;
      case "fandom_saved":
        if (msg.characterId === characterId) {
          fandom = msg.fandom;
          renderFandom();
        }
        break;
      case "error":
        if (!msg.chatId || msg.chatId === chatId)
          setStatus(msg.message || "Something went wrong.", "error");
        break;
    }
  });
  const visibility = new IntersectionObserver((entries) => {
    tabOpen = entries.some((e) => e.isIntersecting);
    if (tabOpen) {
      unseen = 0;
      setBadge();
    }
  });
  visibility.observe(root);
  const ticker = setInterval(() => {
    root.querySelectorAll(".pg-post[data-id]").forEach((node) => {
      const post = feed?.posts.find((p) => p.id === node.dataset.id);
      const t = node.querySelector(".pg-time");
      if (post && t)
        t.textContent = timeAgo(post.ts);
    });
  }, 60000);
  setView("feed");
  ctx.sendToBackend({ type: "init" });
  return () => {
    clearInterval(ticker);
    visibility.disconnect();
    offActivate();
    unsub();
    removeStyle();
    tab.destroy();
  };
}
export {
  setup
};
