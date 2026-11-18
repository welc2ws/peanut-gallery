// @bun
// src/shared.ts
var DEFAULT_SYSTEM_PROMPT = `You are the Peanut Gallery: a crowd of online fans following {{char}}'s story with {{user}} like it's a show they're obsessed with. The fandom is called {{fandom}}.

Write short social media posts reacting to what just happened. Mix up the crowd: hype stans, shippers, theory-crafters, haters, people who only keysmash, someone who misread the plot, update/news accounts, meme accounts. Every fan has their own username and personality, and recurring fans can show up again.

Fans only know what happened on screen. They can speculate wildly, but they never know a character's hidden thoughts or anything that wasn't shown.

Use internet speak: lowercase, emojis, hashtags, caps lock, abbreviations, whatever fits. Keep each post under 280 characters.

Overall tone: {{tone}}.`;
var DEFAULT_SETTINGS = {
  connectionId: "",
  systemPrompt: DEFAULT_SYSTEM_PROMPT,
  postCount: 6,
  tone: "chaotic, funny and invested",
  temperature: 1,
  autoGenerate: false,
  autoEvery: 1,
  keepPosts: 200
};
function defaultFandom(characterName) {
  const tag = characterName.replace(/[^A-Za-z0-9]/g, "") || "Story";
  return { name: `#${tag}Nation`, contextMode: "recent", recentCount: 10, notes: "" };
}
function emptyFeed() {
  return { posts: [], summary: "", summarizedUpTo: 0 };
}
var FORMAT_RULES = `Output ONLY the posts, in exactly this format, with a line containing only --- between posts:

Display Name | @handle
The post text

---
Display Name | @handle
The post text

No preamble, numbering or commentary before or after the posts.`;

// src/parse.ts
var HEADER = /^\s*(?:[-*\d.)\s]*)?\**\s*(.+?)\s*\**\s*[|\u2022\u00B7\u2014\u2013-]\s*@([A-Za-z0-9_.]+)\s*\**\s*:?\s*$/;
var HEADER_INLINE = /^\s*(?:[-*\d.)\s]*)?\**\s*(.+?)\s*\**\s*[|\u2022\u00B7\u2014\u2013-]\s*@([A-Za-z0-9_.]+)\s*\**\s*:\s*(\S.*)$/;
var HANDLE_ONLY = /^\s*\**@([A-Za-z0-9_.]+)\**\s*:?\s*(.*)$/;
function stripReasoning(raw) {
  return raw.replace(/<(think|thinking|reasoning)>[\s\S]*?<\/\1>/gi, "").replace(/^[\s\S]*?<\/(think|thinking|reasoning)>/i, "").replace(/```[a-z]*\n?/gi, "").trim();
}
function parsePosts(raw) {
  const text = stripReasoning(raw);
  const blocks = text.split(/^\s*(?:-{3,}|_{3,}|\*{3,})\s*$/m);
  const posts = [];
  for (const block of blocks) {
    const lines = block.split(`
`).map((l) => l.trimEnd());
    while (lines.length && !lines[0].trim())
      lines.shift();
    if (!lines.length)
      continue;
    let name = "";
    let handle = "";
    let body = lines;
    const header = lines[0].match(HEADER);
    const inline = header ? null : lines[0].match(HEADER_INLINE);
    if (inline) {
      name = inline[1].replace(/\*/g, "").trim();
      handle = inline[2];
      body = [inline[3], ...lines.slice(1)];
    } else if (header) {
      name = header[1].replace(/\*/g, "").trim();
      handle = header[2];
      body = lines.slice(1);
    } else {
      const only = lines[0].match(HANDLE_ONLY);
      if (only) {
        handle = only[1];
        name = only[1];
        body = only[2] ? [only[2], ...lines.slice(1)] : lines.slice(1);
      }
    }
    const postText = body.join(`
`).trim();
    if (!postText)
      continue;
    if (!handle) {
      continue;
    }
    posts.push({ name: name || handle, handle, text: postText });
  }
  return posts;
}

// src/backend.ts
var SETTINGS_PATH = "settings.json";
var fandomPath = (characterId) => `fandoms/${characterId}.json`;
var feedPath = (chatId) => `feeds/${chatId}.json`;
async function loadSettings(userId) {
  const saved = await spindle.userStorage.getJson(SETTINGS_PATH, { fallback: {}, userId });
  return { ...DEFAULT_SETTINGS, ...saved };
}
async function loadFandom(characterId, userId) {
  const character = await spindle.characters.get(characterId, userId).catch(() => null);
  const base = defaultFandom(character?.name || "Story");
  const saved = await spindle.userStorage.getJson(fandomPath(characterId), { fallback: {}, userId });
  return { ...base, ...saved };
}
async function loadFeed(chatId, userId) {
  const saved = await spindle.userStorage.getJson(feedPath(chatId), { fallback: {}, userId });
  return { ...emptyFeed(), ...saved };
}
async function saveFeed(chatId, feed, userId) {
  await spindle.userStorage.setJson(feedPath(chatId), feed, { userId });
}
var generating = new Set;
var replyCounters = new Map;
function uid() {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}
function clean(text, max = 1500) {
  const t = (text || "").replace(/<[^>]+>/g, "").replace(/\n{3,}/g, `

`).trim();
  return t.length > max ? t.slice(0, max) + "\u2026" : t;
}
function fillMacros(template, vars) {
  return template.replace(/\{\{\s*(\w+)\s*\}\}/g, (m, key) => (key in vars) ? vars[key] : m);
}
async function getStoryMessages(chatId) {
  const all = await spindle.chat.getMessages(chatId);
  return all.filter((m) => !m.hidden && m.role !== "system" && (m.content || "").trim());
}
function formatMessages(messages, charName, userName) {
  return messages.map((m) => `${m.name || (m.role === "user" ? userName : charName)}: ${clean(m.content)}`).join(`

`);
}
async function llm(userId, settings, system, prompt, temperature) {
  const input = {
    type: "quiet",
    messages: [
      { role: "system", content: system },
      { role: "user", content: prompt }
    ],
    parameters: { temperature },
    userId
  };
  if (settings.connectionId)
    input.connection_id = settings.connectionId;
  let full = "";
  for await (const chunk of spindle.generate.quietStream(input)) {
    const c = chunk;
    if (c.type === "token" && typeof c.token === "string")
      full += c.token;
    else if (c.type === "done" && typeof c.content === "string" && c.content.length >= full.length)
      full = c.content;
  }
  return stripReasoning(full);
}
function send(userId, payload) {
  spindle.sendToFrontend(payload, userId);
}
var SUMMARY_KEEP_RAW = 4;
var SUMMARY_CHUNK = 30;
async function updateSummary(chatId, feed, userId, settings, rebuild = false) {
  const chat = await spindle.chats.get(chatId, userId);
  const character = chat ? await spindle.characters.get(chat.character_id, userId) : null;
  const persona = await spindle.personas.getActive(userId).catch(() => null);
  const charName = character?.name || "Character";
  const userName = persona?.name || "User";
  const messages = await getStoryMessages(chatId);
  if (rebuild) {
    feed.summary = "";
    feed.summarizedUpTo = 0;
  }
  const target = Math.max(0, messages.length - SUMMARY_KEEP_RAW);
  if (feed.summarizedUpTo > messages.length)
    feed.summarizedUpTo = 0;
  while (feed.summarizedUpTo < target) {
    const slice = messages.slice(feed.summarizedUpTo, Math.min(target, feed.summarizedUpTo + SUMMARY_CHUNK));
    const prompt = `${feed.summary ? `STORY SO FAR:
${feed.summary}

` : ""}NEW EVENTS:
${formatMessages(slice, charName, userName)}

Rewrite the story so far to include the new events. Keep it to what an audience watching would know: what happened, who did what, relationships and big moments. No hidden thoughts. Under 400 words. Output only the summary.`;
    const result = await llm(userId, settings, `You keep a running recap of a roleplay story between ${charName} and ${userName}.`, prompt, 0.4);
    if (!result.trim())
      throw new Error("The model returned an empty summary.");
    feed.summary = result.trim();
    feed.summarizedUpTo += slice.length;
  }
}
async function generateFeed(chatId, userId) {
  if (generating.has(chatId))
    return;
  generating.add(chatId);
  send(userId, { type: "generating", chatId, on: true });
  try {
    const settings = await loadSettings(userId);
    const chat = await spindle.chats.get(chatId, userId);
    if (!chat)
      throw new Error("That chat no longer exists.");
    const character = await spindle.characters.get(chat.character_id, userId);
    const persona = await spindle.personas.getActive(userId).catch(() => null);
    const fandom = await loadFandom(chat.character_id, userId);
    const feed = await loadFeed(chatId, userId);
    const charName = character?.name || "Character";
    const userName = persona?.name || "User";
    const messages = await getStoryMessages(chatId);
    if (!messages.length)
      throw new Error("This chat has no messages for the fans to react to yet.");
    let context = "";
    if (fandom.contextMode === "summary") {
      await updateSummary(chatId, feed, userId, settings);
      const latest = messages.slice(-SUMMARY_KEEP_RAW);
      context = `STORY SO FAR:
${feed.summary || "(just getting started)"}

LATEST SCENE:
${formatMessages(latest, charName, userName)}`;
    } else {
      const latest = messages.slice(-Math.max(1, fandom.recentCount));
      context = `LATEST SCENES:
${formatMessages(latest, charName, userName)}`;
    }
    const vars = { char: charName, user: userName, fandom: fandom.name, tone: settings.tone, count: String(settings.postCount) };
    const system = `${fillMacros(settings.systemPrompt, vars)}

${FORMAT_RULES}`;
    const recentPosts = feed.posts.slice(0, 12).reverse();
    const parts = [
      `ABOUT ${charName.toUpperCase()}:
${clean(character?.description || "", 1200) || "(no description)"}`,
      persona?.description ? `ABOUT ${userName.toUpperCase()}:
${clean(persona.description, 600)}` : "",
      fandom.notes.trim() ? `FANDOM NOTES (in-jokes, ships, recurring fans):
${fandom.notes.trim()}` : "",
      context,
      recentPosts.length ? `POSTS ALREADY ON THE FEED (don't repeat these; fans can reply to or continue them):
${recentPosts.map((p) => `${p.name} | @${p.handle}: ${p.text}`).join(`
`)}` : "",
      `Write ${settings.postCount} new posts from the ${fandom.name} fandom reacting to the latest events.`
    ].filter(Boolean);
    const raw = await llm(userId, settings, system, parts.join(`

`), settings.temperature);
    const parsed = parsePosts(raw);
    if (!parsed.length) {
      spindle.log.warn(`Peanut Gallery: could not parse posts from: ${raw.slice(0, 400)}`);
      throw new Error("The fans mumbled something unreadable. Try again, or check that your model follows instructions.");
    }
    const batch = uid();
    const now = Date.now();
    const newPosts = parsed.map((p, i) => ({
      id: uid(),
      name: p.name.slice(0, 60),
      handle: p.handle.slice(0, 30),
      text: p.text.slice(0, 1000),
      ts: now - i,
      batch
    }));
    const latestFeed = await loadFeed(chatId, userId);
    latestFeed.summary = feed.summary;
    latestFeed.summarizedUpTo = feed.summarizedUpTo;
    latestFeed.posts = [...newPosts, ...latestFeed.posts].slice(0, Math.max(10, settings.keepPosts));
    await saveFeed(chatId, latestFeed, userId);
    send(userId, { type: "feed_data", chatId, characterId: chat.character_id, feed: latestFeed, fandom, newCount: newPosts.length });
  } catch (err) {
    const message = err?.message || String(err);
    spindle.log.error(`Peanut Gallery: generation failed - ${message}`);
    send(userId, { type: "error", chatId, message });
  } finally {
    generating.delete(chatId);
    send(userId, { type: "generating", chatId, on: false });
  }
}
async function listFandoms(userId) {
  const { data } = await spindle.characters.list({ limit: 500, userId });
  return data.map((c) => ({ id: c.id, name: c.name, avatar: c.avatar_url || null })).sort((a, b) => a.name.localeCompare(b.name));
}
async function listChats(characterId, userId) {
  const { data } = await spindle.chats.list({ characterId, limit: 200, userId });
  return data.sort((a, b) => (b.updated_at || 0) - (a.updated_at || 0)).map((c) => ({ id: c.id, name: c.name || "Untitled chat", updated: c.updated_at }));
}
async function sendFeed(chatId, userId) {
  const chat = await spindle.chats.get(chatId, userId);
  if (!chat)
    return send(userId, { type: "error", chatId, message: "That chat no longer exists." });
  const [feed, fandom] = await Promise.all([loadFeed(chatId, userId), loadFandom(chat.character_id, userId)]);
  send(userId, { type: "feed_data", chatId, characterId: chat.character_id, feed, fandom, generating: generating.has(chatId) });
}
async function handle(payload, userId) {
  switch (payload?.type) {
    case "init": {
      const [settings, connections, fandoms, active] = await Promise.all([
        loadSettings(userId),
        spindle.connections.list(userId).catch(() => []),
        listFandoms(userId),
        spindle.chats.getActive(userId).catch(() => null)
      ]);
      send(userId, {
        type: "init_data",
        settings,
        connections: connections.map((c) => ({ id: c.id, name: c.name || c.id, provider: c.provider, isDefault: c.is_default })),
        fandoms,
        active: active ? { chatId: active.id, characterId: active.character_id } : null
      });
      return;
    }
    case "list_chats": {
      const chats = await listChats(payload.characterId, userId);
      const fandom = await loadFandom(payload.characterId, userId);
      send(userId, { type: "chats_data", characterId: payload.characterId, chats, fandom });
      return;
    }
    case "load_feed":
      return sendFeed(payload.chatId, userId);
    case "generate":
      return generateFeed(payload.chatId, userId);
    case "save_settings": {
      const merged = { ...DEFAULT_SETTINGS, ...payload.settings || {} };
      merged.postCount = Math.min(30, Math.max(1, Math.round(Number(merged.postCount) || 6)));
      merged.autoEvery = Math.min(50, Math.max(1, Math.round(Number(merged.autoEvery) || 1)));
      merged.keepPosts = Math.min(1000, Math.max(10, Math.round(Number(merged.keepPosts) || 200)));
      merged.temperature = Math.min(2, Math.max(0, Number(merged.temperature) || 1));
      await spindle.userStorage.setJson(SETTINGS_PATH, merged, { userId });
      send(userId, { type: "settings_saved", settings: merged });
      spindle.toast.success("Peanut Gallery settings saved.");
      return;
    }
    case "save_fandom": {
      const f = payload.fandom || {};
      const fandom = {
        name: String(f.name || "").slice(0, 60) || defaultFandom("Story").name,
        contextMode: f.contextMode === "summary" ? "summary" : "recent",
        recentCount: Math.min(60, Math.max(1, Math.round(Number(f.recentCount) || 10))),
        notes: String(f.notes || "").slice(0, 4000)
      };
      await spindle.userStorage.setJson(fandomPath(payload.characterId), fandom, { userId });
      send(userId, { type: "fandom_saved", characterId: payload.characterId, fandom });
      spindle.toast.success("Fandom saved.");
      return;
    }
    case "save_summary": {
      const feed = await loadFeed(payload.chatId, userId);
      feed.summary = String(payload.summary || "");
      await saveFeed(payload.chatId, feed, userId);
      spindle.toast.success("Story summary saved.");
      return sendFeed(payload.chatId, userId);
    }
    case "rebuild_summary": {
      if (generating.has(payload.chatId))
        return;
      generating.add(payload.chatId);
      send(userId, { type: "generating", chatId: payload.chatId, on: true, what: "summary" });
      try {
        const settings = await loadSettings(userId);
        const feed = await loadFeed(payload.chatId, userId);
        await updateSummary(payload.chatId, feed, userId, settings, true);
        await saveFeed(payload.chatId, feed, userId);
        spindle.toast.success("Story summary rebuilt.");
      } catch (err) {
        send(userId, { type: "error", chatId: payload.chatId, message: `Summary failed: ${err?.message || err}` });
      } finally {
        generating.delete(payload.chatId);
        send(userId, { type: "generating", chatId: payload.chatId, on: false });
      }
      return sendFeed(payload.chatId, userId);
    }
    case "delete_post": {
      const feed = await loadFeed(payload.chatId, userId);
      feed.posts = feed.posts.filter((p) => p.id !== payload.postId);
      await saveFeed(payload.chatId, feed, userId);
      return sendFeed(payload.chatId, userId);
    }
    case "clear_feed": {
      const feed = await loadFeed(payload.chatId, userId);
      feed.posts = [];
      await saveFeed(payload.chatId, feed, userId);
      spindle.toast.success("Feed cleared.");
      return sendFeed(payload.chatId, userId);
    }
  }
}
spindle.onFrontendMessage((payload, userId) => {
  handle(payload, userId).catch((err) => {
    const message = err?.message || String(err);
    spindle.log.error(`Peanut Gallery: ${message}`);
    send(userId, { type: "error", message });
  });
});
async function onActiveChat(chatId, userId) {
  if (!chatId)
    return send(userId, { type: "active_changed", active: null });
  const chat = await spindle.chats.get(chatId, userId);
  send(userId, { type: "active_changed", active: chat ? { chatId: chat.id, characterId: chat.character_id } : null });
}
spindle.on("SETTINGS_UPDATED", (payload, userId) => {
  if (!userId)
    return;
  const key = payload?.key ?? payload?.keys?.[0];
  if (key !== "activeChatId")
    return;
  onActiveChat(payload?.value ?? null, userId).catch(() => {});
});
spindle.on("CHAT_SWITCHED", (payload, userId) => {
  if (!userId)
    return;
  const chatId = payload?.chatId ?? payload?.chat_id ?? payload?.id ?? null;
  onActiveChat(chatId, userId).catch(() => {});
});
var AUTO_TYPES = new Set(["normal", "swipe", "regenerate", "continue", undefined, ""]);
spindle.on("GENERATION_ENDED", (payload, userId) => {
  if (!userId || !payload || payload.error || !payload.content || !payload.chatId)
    return;
  if (!AUTO_TYPES.has(payload.generationType))
    return;
  (async () => {
    const settings = await loadSettings(userId);
    if (!settings.autoGenerate)
      return;
    const count = (replyCounters.get(payload.chatId) || 0) + 1;
    if (count < settings.autoEvery) {
      replyCounters.set(payload.chatId, count);
      return;
    }
    replyCounters.set(payload.chatId, 0);
    await generateFeed(payload.chatId, userId);
  })().catch((err) => spindle.log.error(`Peanut Gallery auto refresh: ${err?.message || err}`));
});
spindle.log.info("Peanut Gallery backend loaded. The herd is listening.");
