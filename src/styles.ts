// Peanut / elephant theme layered on top of Lumiverse's theme variables,
// so it follows the user's light/dark theme and accent.

export const STYLES = `
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

@keyframes pg-in { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: none; } }
@keyframes pg-shimmer { to { background-position: -200% 0; } }
@keyframes pg-wobble { from { transform: rotate(-35deg); } to { transform: rotate(-5deg); } }
`
