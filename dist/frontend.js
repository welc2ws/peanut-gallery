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
.pg-nav button { flex: 1; min-width: 0; padding: 8px 2px; background: none; border: none; border-bottom: 2px solid transparent;
  color: var(--lumiverse-text-muted); font-weight: 700; cursor: pointer; font-size: 12.5px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
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
.pg-meta { display: flex; align-items: flex-start; gap: 6px; min-width: 0; font-size: 13px; }
.pg-name { font-weight: 800; overflow-wrap: anywhere; line-height: 1.3; }
.pg-sub2 { display: flex; flex-wrap: wrap; align-items: baseline; gap: 0 4px; font-size: 12px; line-height: 1.3; }
.pg-handle, .pg-dot, .pg-time { color: var(--lumiverse-text-muted); }
.pg-handle { overflow-wrap: anywhere; }
.pg-del { margin-left: auto; border: none; background: none; cursor: pointer; font-size: 16px; line-height: 1;
  color: var(--lumiverse-text-muted); opacity: 0; transition: opacity .15s; padding: 0 2px; }
.pg-post:hover .pg-del, .pg-del:focus { opacity: 1; }
@media (hover: none) { .pg-del { opacity: .5; } }
.pg-text { margin-top: 4px; line-height: 1.45; overflow-wrap: anywhere; }
.pg-tag { color: var(--pg-peanut); font-weight: 600; }

.pg-empty { display: flex; flex-direction: column; align-items: center; gap: 6px; padding: 28px 12px; text-align: center; color: var(--lumiverse-text-muted); }
.pg-empty svg { width: 40px; height: 40px; color: var(--pg-shell); transform: rotate(-20deg); }
.pg-empty p { margin: 0; font-size: 13px; }

.pg-skel { background: linear-gradient(90deg, var(--lumiverse-fill) 25%, var(--lumiverse-fill-subtle) 50%, var(--lumiverse-fill) 75%);
  background-size: 200% 100%; animation: pg-shimmer 1.2s linear infinite; border-radius: 6px; }
.pg-avatar.pg-skel { border-radius: 50%; }
.pg-line { height: 11px; margin: 6px 0; width: 85%; }
.pg-line.short { width: 55%; }

/* ---- compact gallery switcher ---- */
.pg-switch { display: flex; flex-direction: column; gap: 6px; }
.pg-pill-row { display: flex; gap: 6px; align-items: stretch; }
.pg-pill { flex: 1; min-width: 0; display: flex; align-items: center; gap: 9px; padding: 6px 10px 6px 6px; cursor: pointer; text-align: left;
  background: var(--lumiverse-fill); color: var(--lumiverse-text); border: 1px solid var(--lumiverse-border); border-radius: 999px; font: inherit; }
.pg-pill:hover, .pg-pill.open { border-color: var(--pg-peanut); }
.pg-pill-text { flex: 1; min-width: 0; display: flex; flex-direction: column; line-height: 1.25; }
.pg-pill-main { font-weight: 800; font-size: 13px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.pg-pill-sub { font-size: 11.5px; color: var(--lumiverse-text-muted); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.pg-pill-chev { width: 18px; height: 18px; flex: none; color: var(--lumiverse-text-muted); transition: transform .15s; }
.pg-pill.open .pg-pill-chev { transform: rotate(180deg); }
.pg-follow { flex: none; width: 40px; display: grid; place-items: center; cursor: pointer; border-radius: 999px;
  background: none; color: var(--lumiverse-text-muted); border: 1px solid var(--lumiverse-border); }
.pg-follow svg { width: 18px; height: 18px; }
.pg-follow.on { color: var(--pg-peanut); border-color: var(--pg-peanut); background: color-mix(in srgb, var(--pg-peanut) 12%, transparent); }

.pg-mini { width: 30px; height: 30px; border-radius: 50%; flex: none; display: grid; place-items: center; font-weight: 800; font-size: 11px; overflow: hidden; }
.pg-img { background-size: cover; background-position: center; background-color: var(--lumiverse-fill-subtle); }
.pg-mini-peanut { background: color-mix(in srgb, var(--pg-shell) 30%, transparent); color: var(--pg-peanut); }
.pg-mini-peanut svg { width: 18px; height: 18px; transform: rotate(-20deg); }

.pg-picker { display: flex; flex-direction: column; gap: 6px; padding: 8px; border: 1px solid var(--lumiverse-border);
  border-radius: var(--pg-radius); background: var(--lumiverse-fill-subtle); animation: pg-in .15s ease; }
.pg-picker-list { display: flex; flex-direction: column; max-height: 300px; overflow-y: auto; overscroll-behavior: contain; }
.pg-pick, .pg-pick-back { display: flex; align-items: center; gap: 9px; width: 100%; padding: 7px 6px; cursor: pointer; text-align: left;
  background: none; border: none; border-radius: 8px; color: var(--lumiverse-text); font: inherit; }
.pg-pick:hover, .pg-pick-back:hover { background: var(--lumiverse-fill); }
.pg-pick.current { background: color-mix(in srgb, var(--pg-peanut) 14%, transparent); }
.pg-pick-back { color: var(--lumiverse-text-muted); font-weight: 700; font-size: 12px; }
.pg-pick-back svg { width: 16px; height: 16px; }
.pg-pick-text { flex: 1; min-width: 0; display: flex; flex-direction: column; line-height: 1.3; }
.pg-pick-main { font-weight: 700; font-size: 13px; overflow-wrap: anywhere; }
.pg-pick-sub { font-size: 11.5px; color: var(--lumiverse-text-muted); overflow-wrap: anywhere; }
.pg-pick-go { color: var(--lumiverse-text-muted); font-size: 18px; }
.pg-pick-empty { padding: 10px 6px; font-size: 12px; color: var(--lumiverse-text-muted); }

/* ---- galleries tab ---- */
.pg-groups { display: flex; flex-direction: column; gap: 6px; }
.pg-group, .pg-store { display: flex; align-items: center; gap: 9px; padding: 8px; border-radius: 8px; background: var(--lumiverse-fill); }
.pg-group-text, .pg-store-text { flex: 1; min-width: 0; }
.pg-group-actions { display: flex; flex-wrap: wrap; gap: 4px; justify-content: flex-end; flex: none; max-width: 50%; }
.pg-store { flex-direction: column; align-items: stretch; gap: 6px; }
.pg-store .pg-group-actions { max-width: none; justify-content: flex-start; }
.pg-store.orphan { opacity: .75; border: 1px dashed var(--lumiverse-border); }
.pg-storage { display: flex; flex-direction: column; gap: 6px; max-height: 360px; overflow-y: auto; }
.pg-storage-total { font-size: 13px; }
.pg-warn { color: var(--lumiverse-danger, #d9534f); }
.pg-ghost-danger:hover:not(:disabled) { color: var(--lumiverse-danger, #d9534f); border-color: var(--lumiverse-danger, #d9534f); }
.pg-editor { display: flex; flex-direction: column; gap: 8px; padding-top: 4px; border-top: 1px dashed var(--lumiverse-border); }
.pg-checklist { display: flex; flex-direction: column; max-height: 260px; overflow-y: auto; border: 1px solid var(--lumiverse-border); border-radius: 8px; }
.pg-checkrow { display: flex; align-items: center; gap: 9px; padding: 6px 8px; cursor: pointer; border-bottom: 1px solid var(--lumiverse-border); }
.pg-checkrow:last-child { border-bottom: none; }
.pg-checkrow:hover { background: var(--lumiverse-fill); }
.pg-grow { flex: 1; width: auto; }

/* ---- token estimate ---- */
.pg-token-big { font-size: 22px; font-weight: 800; color: var(--pg-peanut); }
.pg-token-big small { font-size: 12px; font-weight: 600; color: var(--lumiverse-text-muted); }
.pg-tokens .pg-small { align-self: flex-start; }

@keyframes pg-in { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: none; } }
@keyframes pg-shimmer { to { background-position: -200% 0; } }
@keyframes pg-wobble { from { transform: rotate(-35deg); } to { transform: rotate(-5deg); } }
`;

// src/frontend.ts
var ICON = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M7.6 6.4A4 4 0 1 0 6.2 14"/><path d="M16.4 6.4A4 4 0 1 1 17.8 14"/><path d="M7 9.5a5 5 0 0 1 10 0V12a3 3 0 0 1-3 3v3.5a1.5 1.5 0 0 0 3 0"/><path d="M7 9.5V12a3 3 0 0 0 3 3"/><circle cx="10" cy="10.2" r=".7" fill="currentColor"/><circle cx="14" cy="10.2" r=".7" fill="currentColor"/></svg>`;
var PEANUT = `<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M15.8 2.2c-2.6 0-4.6 2-4.9 4.5-.1 1-.7 1.6-1.6 1.8C6.6 9 4.6 11.4 4.6 14.2c0 3.3 2.7 6 6 6 2.6 0 4.8-1.7 5.6-4.1.3-.9.9-1.4 1.8-1.6 2.3-.6 3.9-2.6 3.9-5 0-4-2.9-7.3-6.1-7.3z" opacity=".95"/><path fill="none" stroke="rgba(0,0,0,.25)" stroke-width="1" stroke-linecap="round" d="M9 13.5c.8.3 1.6.3 2.3 0M8.6 16c.8.3 1.6.3 2.3 0M15.4 6.2c.7.3 1.5.3 2.2 0M15.8 8.7c.7.3 1.5.3 2.2 0"/></svg>`;
var CHEVRON = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>`;
var BACK = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>`;
var FOLLOW = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/></svg>`;
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
function avatarStyle(seed) {
  const hue = hash(seed) % 360;
  return `background: hsl(${hue} 55% 62%); color: hsl(${hue} 60% 18%);`;
}
function initials(name) {
  const letters = name.replace(/[^\p{L}\p{N} ]/gu, "").trim().split(/\s+/).map((w) => w[0]).join("");
  return (letters || name.trim()[0] || "?").slice(0, 2).toUpperCase();
}
function avatarHtml(name, url, cls = "pg-avatar") {
  if (url)
    return `<div class="${cls} pg-img" style="background-image:url('${esc(url)}')"></div>`;
  return `<div class="${cls}" style="${avatarStyle(name)}">${esc(initials(name))}</div>`;
}
function timeAgo(ts) {
  if (!ts)
    return "";
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
function bytes(n) {
  if (n < 1024)
    return `${n} B`;
  if (n < 1024 * 1024)
    return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / 1024 / 1024).toFixed(2)} MB`;
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
        <button data-view="galleries">Galleries</button>
        <button data-view="settings">Settings</button>
      </nav>

      <div class="pg-switch" data-el="switch">
        <div class="pg-pill-row">
          <button class="pg-pill" data-el="pill" aria-expanded="false">
            <span data-el="pill-avatar"></span>
            <span class="pg-pill-text">
              <span class="pg-pill-main" data-el="pill-main">No gallery</span>
              <span class="pg-pill-sub" data-el="pill-sub">Pick a chat</span>
            </span>
            <span class="pg-pill-chev">${CHEVRON}</span>
          </button>
          <button class="pg-follow" data-el="follow" title="Follow the chat you have open" aria-pressed="true">${FOLLOW}</button>
        </div>
        <div class="pg-picker" data-el="picker" hidden>
          <input type="text" data-el="picker-search" placeholder="Search galleries and chats...">
          <div class="pg-picker-list" data-el="picker-list"></div>
        </div>
      </div>

      <section data-view-panel="feed">
        <button class="pg-primary" data-el="generate">${PEANUT}<span>Toss peanuts</span></button>
        <div class="pg-status" data-el="status"></div>
        <div class="pg-feed" data-el="feed"></div>
      </section>

      <section data-view-panel="fandom" hidden>
        <div class="pg-card">
          <div class="pg-card-title">Fandom for <span data-el="fandom-for"></span></div>
          <p class="pg-hint" data-el="fandom-shared" hidden></p>
          <label class="pg-field"><span>Fandom name</span><input data-el="f-name" type="text" maxlength="60" placeholder="#TheHerd"></label>
          <div class="pg-field"><span>What fans can see</span>
            <label class="pg-radio"><input type="radio" name="pg-mode" value="recent"> Recent messages <small>fans react live to the last few messages</small></label>
            <label class="pg-radio"><input type="radio" name="pg-mode" value="summary"> Whole story <small>fans know a running recap plus the latest scene</small></label>
          </div>
          <label class="pg-field" data-el="f-recent-wrap"><span>Recent messages to show fans</span><input data-el="f-recent" type="number" min="1" max="60"></label>
          <label class="pg-field"><span>Fandom notes</span><textarea data-el="f-notes" rows="5" placeholder="Ships, in-jokes, recurring fans, what the fandom is known for..."></textarea></label>
          <button class="pg-primary pg-slim" data-el="f-save">Save fandom</button>
        </div>

        <div class="pg-card pg-tokens">
          <div class="pg-card-title">Cost per refresh <small>(this chat)</small></div>
          <div class="pg-token-big" data-el="tokens-big">–</div>
          <p class="pg-hint" data-el="tokens-detail">Pick a chat to see how much each refresh sends.</p>
          <button class="pg-ghost pg-small" data-el="tokens-recount">Recount</button>
        </div>

        <div class="pg-card">
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

      <section data-view-panel="galleries" hidden>
        <div class="pg-card">
          <div class="pg-card-title">Shared galleries</div>
          <p class="pg-hint">Put several characters in one gallery so they share a fandom: one name, one set of notes, one fanbase. Each chat still keeps its own feed.</p>
          <div class="pg-groups" data-el="groups"></div>
          <button class="pg-ghost" data-el="group-new">+ New shared gallery</button>
          <div class="pg-editor" data-el="group-editor" hidden>
            <label class="pg-field"><span>Gallery name</span><input data-el="g-name" type="text" maxlength="60" placeholder="Dating Start! cast"></label>
            <label class="pg-field"><span>Characters</span><input data-el="g-search" type="text" placeholder="Search characters..."></label>
            <div class="pg-checklist" data-el="g-list"></div>
            <div class="pg-row">
              <button class="pg-primary pg-slim pg-grow" data-el="g-save">Save gallery</button>
              <button class="pg-ghost" data-el="g-cancel">Cancel</button>
            </div>
          </div>
        </div>

        <div class="pg-card">
          <div class="pg-card-title">Storage</div>
          <div class="pg-storage-total" data-el="storage-total">Loading...</div>
          <div class="pg-storage" data-el="storage"></div>
          <div class="pg-row">
            <button class="pg-ghost" data-el="cleanup">Clean up deleted chats</button>
            <button class="pg-ghost" data-el="storage-refresh">Refresh</button>
          </div>
          <button class="pg-danger" data-el="delete-all">Delete every feed</button>
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
    switch: $("switch"),
    pill: $("pill"),
    pillAvatar: $("pill-avatar"),
    pillMain: $("pill-main"),
    pillSub: $("pill-sub"),
    follow: $("follow"),
    picker: $("picker"),
    pickerSearch: $("picker-search"),
    pickerList: $("picker-list"),
    generate: $("generate"),
    status: $("status"),
    feed: $("feed"),
    fandomFor: $("fandom-for"),
    fandomShared: $("fandom-shared"),
    fName: $("f-name"),
    fRecent: $("f-recent"),
    fRecentWrap: $("f-recent-wrap"),
    fNotes: $("f-notes"),
    fSave: $("f-save"),
    tokensBig: $("tokens-big"),
    tokensDetail: $("tokens-detail"),
    tokensRecount: $("tokens-recount"),
    summary: $("summary"),
    summarySave: $("summary-save"),
    summaryRebuild: $("summary-rebuild"),
    clearFeed: $("clear-feed"),
    groups: $("groups"),
    groupNew: $("group-new"),
    groupEditor: $("group-editor"),
    gName: $("g-name"),
    gSearch: $("g-search"),
    gList: $("g-list"),
    gSave: $("g-save"),
    gCancel: $("g-cancel"),
    storageTotal: $("storage-total"),
    storage: $("storage"),
    cleanup: $("cleanup"),
    storageRefresh: $("storage-refresh"),
    deleteAll: $("delete-all"),
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
  let galleries = [];
  let characters = [];
  let ref = "";
  let chats = [];
  let chatId = "";
  let followActive = true;
  let activeChat = null;
  let feed = null;
  let fandom = null;
  let settings = null;
  const busy = new Set;
  let unseen = 0;
  let tabOpen = false;
  let pickerOpen = false;
  let pickerRef = "";
  let pickerChats = null;
  let editingGroup = null;
  let storage = null;
  let pendingOpen = "";
  const galleryByRef = (r) => galleries.find((g) => g.ref === r);
  const galleryForCharacter = (cid) => galleries.find((g) => g.characterIds.includes(cid));
  const charName = (cid) => characters.find((c) => c.id === cid)?.name || "Unknown";
  function setView(v) {
    view = v;
    root.querySelectorAll(".pg-nav button").forEach((b) => b.classList.toggle("active", b.dataset.view === v));
    root.querySelectorAll("[data-view-panel]").forEach((p) => p.hidden = p.dataset.viewPanel !== v);
    el.switch.hidden = v === "galleries" || v === "settings";
    if (v === "galleries") {
      renderGroups();
      ctx.sendToBackend({ type: "list_storage" });
    }
    if (v === "fandom")
      requestTokens();
  }
  function renderPill() {
    const g = galleryByRef(ref);
    const chat = chats.find((c) => c.id === chatId);
    el.pillAvatar.innerHTML = g ? avatarHtml(g.name, g.avatar, "pg-mini") : `<div class="pg-mini pg-mini-peanut">${PEANUT}</div>`;
    el.pillMain.textContent = g ? g.name : galleries.length ? "Pick a gallery" : "No characters yet";
    let sub = chat ? chat.name : chats.length ? "Pick a chat" : g ? "No chats yet" : "";
    if (chat && g?.kind === "group")
      sub = `${chat.characterName} · ${chat.name}`;
    if (chat && activeChat?.chatId === chat.id)
      sub += " · open";
    el.pillSub.textContent = sub;
    el.follow.classList.toggle("on", followActive);
    el.follow.setAttribute("aria-pressed", String(followActive));
    el.follow.title = followActive ? "Following the chat you have open" : "Follow the chat you have open";
  }
  function renderPicker() {
    el.picker.hidden = !pickerOpen;
    el.pill.setAttribute("aria-expanded", String(pickerOpen));
    el.pill.classList.toggle("open", pickerOpen);
    if (!pickerOpen)
      return;
    const q = el.pickerSearch.value.trim().toLowerCase();
    if (!pickerRef) {
      const activeRef = activeChat ? galleryForCharacter(activeChat.characterId)?.ref : "";
      const list = galleries.filter((g) => !q || g.name.toLowerCase().includes(q) || g.characterIds.some((id) => charName(id).toLowerCase().includes(q))).sort((a, b) => Number(b.ref === activeRef) - Number(a.ref === activeRef) || Number(b.kind === "group") - Number(a.kind === "group") || a.name.localeCompare(b.name));
      el.pickerList.innerHTML = list.length ? list.map((g) => `<button class="pg-pick${g.ref === ref ? " current" : ""}" data-gallery="${esc(g.ref)}">
                ${avatarHtml(g.name, g.avatar, "pg-mini")}
                <span class="pg-pick-text"><span class="pg-pick-main">${esc(g.name)}</span>
                <span class="pg-pick-sub">${g.kind === "group" ? `Shared · ${g.characterIds.map(charName).map(esc).join(", ")}` : g.ref === activeRef ? "Open chat is here" : "Character"}</span></span>
                <span class="pg-pick-go">›</span></button>`).join("") : `<div class="pg-pick-empty">No galleries match.</div>`;
      return;
    }
    const g = galleryByRef(pickerRef);
    const back = `<button class="pg-pick-back" data-back="1">${BACK}<span>${esc(g?.name || "Back")}</span></button>`;
    if (!pickerChats) {
      el.pickerList.innerHTML = back + `<div class="pg-pick-empty">Loading chats...</div>`;
      return;
    }
    const list = pickerChats.filter((c) => !q || c.name.toLowerCase().includes(q) || c.characterName.toLowerCase().includes(q));
    el.pickerList.innerHTML = back + (list.length ? list.map((c) => `<button class="pg-pick${c.id === chatId ? " current" : ""}" data-chat="${esc(c.id)}">
                <span class="pg-pick-text"><span class="pg-pick-main">${esc(c.name)}</span>
                <span class="pg-pick-sub">${g?.kind === "group" ? `${esc(c.characterName)} · ` : ""}${esc(timeAgo(c.updated))}${activeChat?.chatId === c.id ? " · open" : ""}</span></span></button>`).join("") : `<div class="pg-pick-empty">No chats${q ? " match" : " yet"}.</div>`);
  }
  function renderFeed() {
    const isBusy = !!chatId && busy.has(chatId);
    el.generate.disabled = !chatId || isBusy;
    el.generate.classList.toggle("loading", isBusy);
    el.generate.querySelector("span").textContent = isBusy ? "The herd is typing..." : "Toss peanuts";
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
            <button class="pg-del" data-del="${esc(p.id)}" title="Delete post" aria-label="Delete post">×</button>
          </div>
          <div class="pg-sub2">
            <span class="pg-handle">@${esc(p.handle)}</span>
            <span class="pg-dot">·</span>
            <span class="pg-time" title="${esc(new Date(p.ts).toLocaleString())}">${timeAgo(p.ts)}</span>
          </div>
          <div class="pg-text">${richText(p.text)}</div>
        </div>
      </article>`;
  }
  function renderFandom() {
    const g = galleryByRef(ref);
    el.fandomFor.textContent = g?.name || "this gallery";
    el.fandomShared.hidden = g?.kind !== "group";
    if (g?.kind === "group")
      el.fandomShared.textContent = `Shared by ${g.characterIds.map(charName).join(", ")}. Changes here apply to all of them.`;
    if (fandom) {
      el.fName.value = fandom.name;
      modeRadios.forEach((r) => r.checked = r.value === fandom.contextMode);
      el.fRecent.value = String(fandom.recentCount);
      el.fNotes.value = fandom.notes;
      el.fRecentWrap.hidden = fandom.contextMode !== "recent";
    }
    el.fSave.disabled = !ref;
    el.summary.value = feed?.summary || "";
    const isBusy = !!chatId && busy.has(chatId);
    el.summaryRebuild.disabled = !chatId || isBusy;
    el.summarySave.disabled = !chatId;
    el.clearFeed.disabled = !chatId;
    el.tokensRecount.disabled = !chatId;
  }
  function renderGroups() {
    const groups = galleries.filter((g) => g.kind === "group");
    el.groups.innerHTML = groups.length ? groups.map((g) => `<div class="pg-group">
              ${avatarHtml(g.name, g.avatar, "pg-mini")}
              <div class="pg-group-text"><div class="pg-pick-main">${esc(g.name)}</div>
              <div class="pg-pick-sub">${g.characterIds.length ? g.characterIds.map(charName).map(esc).join(", ") : "No characters left"}</div></div>
              <div class="pg-group-actions">
                <button class="pg-ghost pg-small" data-edit-group="${esc(g.ref)}">Edit</button>
                <button class="pg-ghost pg-small" data-split-group="${esc(g.ref)}">Split</button>
              </div></div>`).join("") : `<div class="pg-pick-empty">No shared galleries yet. Every character has its own.</div>`;
    el.groupEditor.hidden = !editingGroup;
    el.groupNew.hidden = !!editingGroup;
    if (!editingGroup)
      return;
    const q = el.gSearch.value.trim().toLowerCase();
    const editingRef = editingGroup.id ? `grp:${editingGroup.id}` : "";
    const list = characters.filter((c) => !q || c.name.toLowerCase().includes(q));
    el.gList.innerHTML = list.length ? list.map((c) => {
      const other = galleries.find((g) => g.kind === "group" && g.ref !== editingRef && g.characterIds.includes(c.id));
      return `<label class="pg-checkrow">
              <input type="checkbox" data-member="${esc(c.id)}"${editingGroup.members.has(c.id) ? " checked" : ""}>
              ${avatarHtml(c.name, c.avatar, "pg-mini")}
              <span class="pg-pick-text"><span class="pg-pick-main">${esc(c.name)}</span>
              ${other ? `<span class="pg-pick-sub">in ${esc(other.name)} (will move)</span>` : ""}</span></label>`;
    }).join("") : `<div class="pg-pick-empty">No characters match.</div>`;
    el.gSave.textContent = `Save gallery (${editingGroup.members.size})`;
  }
  function renderStorage() {
    if (!storage) {
      el.storageTotal.textContent = "Loading...";
      el.storage.innerHTML = "";
      return;
    }
    const total = storage.reduce((a, f) => a + f.bytes, 0);
    const posts = storage.reduce((a, f) => a + f.posts, 0);
    const orphans = storage.filter((f) => f.chatName === null).length;
    el.storageTotal.innerHTML = `<strong>${bytes(total)}</strong> across ${storage.length} feed${storage.length === 1 ? "" : "s"} · ${posts} posts${orphans ? ` · <span class="pg-warn">${orphans} from deleted chats</span>` : ""}`;
    el.cleanup.disabled = false;
    el.storage.innerHTML = storage.length ? storage.map((f) => `<div class="pg-store${f.chatName === null ? " orphan" : ""}">
              <div class="pg-store-text">
                <div class="pg-pick-main">${f.chatName === null ? "Deleted chat" : esc(f.galleryName || "Unknown")}</div>
                <div class="pg-pick-sub">${f.chatName === null ? "The chat is gone; only the feed is left" : `${f.galleryName !== f.characterName && f.characterName ? `${esc(f.characterName)} · ` : ""}${esc(f.chatName)}`}</div>
                <div class="pg-pick-sub">${f.posts} posts · ${bytes(f.bytes)}${f.modified ? ` · ${timeAgo(f.modified)}` : ""}</div>
              </div>
              <div class="pg-group-actions">
                ${f.chatName !== null ? `<button class="pg-ghost pg-small" data-open-feed="${esc(f.chatId)}">Open</button>` : ""}
                ${f.posts ? `<button class="pg-ghost pg-small" data-clear-feed="${esc(f.chatId)}">Clear</button>` : ""}
                <button class="pg-ghost pg-small pg-ghost-danger" data-delete-feed="${esc(f.chatId)}">Delete</button>
              </div></div>`).join("") : `<div class="pg-pick-empty">No saved feeds yet.</div>`;
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
  let tokenTimer = null;
  function requestTokens() {
    if (view !== "fandom")
      return;
    if (tokenTimer)
      clearTimeout(tokenTimer);
    if (!chatId) {
      el.tokensBig.textContent = "–";
      el.tokensDetail.textContent = "Pick a chat to see how much each refresh sends.";
      return;
    }
    el.tokensBig.textContent = "...";
    tokenTimer = setTimeout(() => ctx.sendToBackend({ type: "count_tokens", chatId }), 250);
  }
  function renderTokens(msg) {
    if (msg.error) {
      el.tokensBig.textContent = "–";
      el.tokensDetail.textContent = msg.error;
      return;
    }
    el.tokensBig.innerHTML = `${msg.approximate ? "≈ " : ""}${Number(msg.total).toLocaleString()} <small>tokens sent</small>`;
    const lines = [`Plus about ${Number(msg.replyEstimate).toLocaleString()} tokens back for the posts.`];
    if (msg.contextMode === "summary" && msg.pendingSummaryMessages > 0) {
      lines.push(`The next refresh also catches the recap up on ${msg.pendingSummaryMessages} message${msg.pendingSummaryMessages === 1 ? "" : "s"}, which costs extra once.`);
    }
    if (msg.contextMode === "recent")
      lines.push("Fewer recent messages means cheaper refreshes. Whole story mode stays about the same size however long the chat gets.");
    if (msg.approximate)
      lines.push(`Estimated${msg.model ? ` for ${msg.model}` : ""}, since Lumiverse didn't have an exact tokenizer.`);
    el.tokensDetail.textContent = lines.join(" ");
  }
  function selectGallery(r, preferChat) {
    ref = r;
    chatId = preferChat || "";
    chats = [];
    feed = null;
    fandom = null;
    renderPill();
    renderFeed();
    renderFandom();
    if (r)
      ctx.sendToBackend({ type: "list_chats", ref: r });
  }
  function selectChat(id) {
    chatId = id;
    feed = null;
    renderPill();
    renderFeed();
    setStatus("");
    if (id)
      ctx.sendToBackend({ type: "load_feed", chatId: id });
    requestTokens();
  }
  function jumpToActive() {
    if (!activeChat)
      return renderPill();
    const g = galleryForCharacter(activeChat.characterId);
    if (!g)
      return renderPill();
    if (g.ref !== ref)
      selectGallery(g.ref, activeChat.chatId);
    else if (activeChat.chatId !== chatId)
      selectChat(activeChat.chatId);
    else
      renderPill();
  }
  function closePicker() {
    pickerOpen = false;
    pickerRef = "";
    pickerChats = null;
    el.pickerSearch.value = "";
    renderPicker();
  }
  root.querySelectorAll(".pg-nav button").forEach((b) => b.addEventListener("click", () => setView(b.dataset.view)));
  el.pill.addEventListener("click", () => {
    if (pickerOpen)
      return closePicker();
    pickerOpen = true;
    pickerRef = "";
    pickerChats = null;
    el.pickerSearch.value = "";
    renderPicker();
  });
  el.follow.addEventListener("click", () => {
    followActive = !followActive;
    if (followActive)
      jumpToActive();
    else
      renderPill();
  });
  el.pickerSearch.addEventListener("input", renderPicker);
  el.pickerList.addEventListener("click", (e) => {
    const t = e.target;
    const g = t.closest("[data-gallery]");
    const c = t.closest("[data-chat]");
    if (t.closest("[data-back]")) {
      pickerRef = "";
      pickerChats = null;
      el.pickerSearch.value = "";
      renderPicker();
    } else if (g) {
      pickerRef = g.dataset.gallery;
      pickerChats = pickerRef === ref && chats.length ? chats.slice() : null;
      el.pickerSearch.value = "";
      renderPicker();
      if (!pickerChats)
        ctx.sendToBackend({ type: "list_chats", ref: pickerRef, forPicker: true });
    } else if (c) {
      const id = c.dataset.chat;
      followActive = activeChat?.chatId === id;
      if (pickerRef !== ref)
        selectGallery(pickerRef, id);
      else
        selectChat(id);
      closePicker();
    }
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
    if (!ref)
      return;
    ctx.sendToBackend({
      type: "save_fandom",
      ref,
      fandom: {
        name: el.fName.value.trim(),
        contextMode: modeRadios.find((r) => r.checked)?.value || "recent",
        recentCount: Number(el.fRecent.value),
        notes: el.fNotes.value
      }
    });
  });
  el.tokensRecount.addEventListener("click", requestTokens);
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
  el.groupNew.addEventListener("click", () => {
    editingGroup = { members: new Set };
    el.gName.value = "";
    el.gSearch.value = "";
    renderGroups();
    el.gName.focus();
  });
  el.gCancel.addEventListener("click", () => {
    editingGroup = null;
    renderGroups();
  });
  el.gSearch.addEventListener("input", renderGroups);
  el.gList.addEventListener("change", (e) => {
    const box = e.target;
    if (!editingGroup || !box.dataset.member)
      return;
    if (box.checked)
      editingGroup.members.add(box.dataset.member);
    else
      editingGroup.members.delete(box.dataset.member);
    el.gSave.textContent = `Save gallery (${editingGroup.members.size})`;
  });
  el.gSave.addEventListener("click", () => {
    if (!editingGroup)
      return;
    ctx.sendToBackend({ type: "save_group", group: { id: editingGroup.id, name: el.gName.value, characterIds: [...editingGroup.members] } });
  });
  el.groups.addEventListener("click", (e) => {
    const t = e.target;
    const edit = t.closest("[data-edit-group]");
    const split = t.closest("[data-split-group]");
    if (edit) {
      const g = galleryByRef(edit.dataset.editGroup);
      if (!g)
        return;
      editingGroup = { id: g.ref.slice(4), members: new Set(g.characterIds) };
      el.gName.value = g.name;
      el.gSearch.value = "";
      renderGroups();
    } else if (split) {
      const g = galleryByRef(split.dataset.splitGroup);
      if (g && confirm(`Split "${g.name}" back into separate characters? Its shared fandom settings will be removed. Feeds are kept.`)) {
        ctx.sendToBackend({ type: "delete_group", id: g.ref.slice(4) });
      }
    }
  });
  el.storage.addEventListener("click", (e) => {
    const t = e.target;
    const open = t.closest("[data-open-feed]");
    const clear = t.closest("[data-clear-feed]");
    const del = t.closest("[data-delete-feed]");
    if (open) {
      const id = open.dataset.openFeed;
      followActive = activeChat?.chatId === id;
      pendingOpen = id;
      ctx.sendToBackend({ type: "load_feed", chatId: id });
      setView("feed");
    } else if (clear && confirm("Clear all posts in this feed?")) {
      ctx.sendToBackend({ type: "clear_feed", chatId: clear.dataset.clearFeed, fromStorage: true });
    } else if (del && confirm("Delete this feed and its story recap completely?")) {
      ctx.sendToBackend({ type: "delete_feed", chatId: del.dataset.deleteFeed });
    }
  });
  el.cleanup.addEventListener("click", () => {
    el.cleanup.disabled = true;
    ctx.sendToBackend({ type: "cleanup_orphans" });
  });
  el.storageRefresh.addEventListener("click", () => {
    storage = null;
    renderStorage();
    ctx.sendToBackend({ type: "list_storage" });
  });
  el.deleteAll.addEventListener("click", () => {
    if (confirm("Delete every saved feed and story recap for every chat? This cannot be undone."))
      ctx.sendToBackend({ type: "delete_all_feeds" });
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
        galleries = msg.galleries || [];
        characters = msg.characters || [];
        activeChat = msg.active;
        renderSettings(msg.connections || []);
        const activeGallery = activeChat ? galleryForCharacter(activeChat.characterId) : undefined;
        if (activeGallery && activeChat)
          selectGallery(activeGallery.ref, activeChat.chatId);
        else if (galleries[0])
          selectGallery(galleries[0].ref);
        else
          renderPill();
        renderFeed();
        break;
      }
      case "galleries_data": {
        galleries = msg.galleries || [];
        characters = msg.characters || characters;
        const cid = chats.find((c) => c.id === chatId)?.characterId;
        const home = cid ? galleryForCharacter(cid) : galleryByRef(ref) || galleries[0];
        selectGallery(home?.ref || "", chatId || undefined);
        renderGroups();
        renderPicker();
        break;
      }
      case "group_saved":
        editingGroup = null;
        renderGroups();
        break;
      case "chats_data": {
        if (pickerOpen && msg.ref === pickerRef) {
          pickerChats = msg.chats || [];
          renderPicker();
        }
        if (msg.forPicker || msg.ref !== ref)
          break;
        chats = msg.chats || [];
        fandom = msg.fandom;
        const keep = chats.find((c) => c.id === chatId);
        renderFandom();
        selectChat(keep ? keep.id : chats[0]?.id || "");
        break;
      }
      case "feed_data": {
        if (pendingOpen && msg.chatId === pendingOpen) {
          pendingOpen = "";
          if (msg.ref !== ref) {
            selectGallery(msg.ref, msg.chatId);
            break;
          }
          chatId = msg.chatId;
        }
        if (msg.chatId === chatId) {
          feed = msg.feed;
          fandom = msg.fandom;
          if (msg.generating)
            busy.add(chatId);
          renderPill();
          renderFeed();
          renderFandom();
          requestTokens();
        }
        if (msg.newCount && (!tabOpen || msg.chatId !== chatId)) {
          unseen += msg.newCount;
          setBadge();
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
      case "token_count":
        if (msg.chatId === chatId)
          renderTokens(msg);
        break;
      case "active_changed": {
        activeChat = msg.active;
        if (followActive)
          jumpToActive();
        else
          renderPill();
        break;
      }
      case "settings_saved":
        settings = msg.settings;
        renderSettings();
        requestTokens();
        break;
      case "fandom_saved":
        if (msg.ref === ref) {
          fandom = msg.fandom;
          renderFandom();
          requestTokens();
        }
        break;
      case "storage_data":
        storage = msg.feeds || [];
        renderStorage();
        break;
      case "feed_deleted":
        if (chatId && (msg.chatId === "*" || msg.chatId === chatId)) {
          feed = null;
          ctx.sendToBackend({ type: "load_feed", chatId });
        }
        break;
      case "error":
        if (view === "galleries") {
          el.storageTotal.innerHTML = `<span class="pg-warn">${esc(msg.message || "Something went wrong.")}</span>`;
          el.cleanup.disabled = false;
        }
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
  renderPill();
  ctx.sendToBackend({ type: "init" });
  return () => {
    clearInterval(ticker);
    if (tokenTimer)
      clearTimeout(tokenTimer);
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
