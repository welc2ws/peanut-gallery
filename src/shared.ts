// Types and defaults shared by the backend and the frontend.

export interface Post {
  id: string
  name: string
  handle: string
  text: string
  ts: number
  /** Posts generated in the same refresh share a batch id. */
  batch: string
}

export interface Feed {
  posts: Post[]
  /** Rolling "story so far" summary, used when the fandom's context mode is "summary". */
  summary: string
  /** How many chat messages the summary already covers. */
  summarizedUpTo: number
}

export type ContextMode = 'recent' | 'summary'

/** Per-character settings. A "fandom" is one character; each of their chats gets its own feed. */
export interface Fandom {
  name: string
  contextMode: ContextMode
  recentCount: number
  notes: string
}

/**
 * A gallery is who shares a fandom. Every character has a solo gallery ("char:<id>")
 * unless it has been merged into a group gallery ("grp:<id>") with other characters.
 */
export interface Group {
  id: string
  name: string
  characterIds: string[]
  fandom: Fandom
}

export interface GalleryInfo {
  ref: string
  kind: 'solo' | 'group'
  name: string
  characterIds: string[]
  avatar: string | null
}

export interface CharacterInfo {
  id: string
  name: string
  avatar: string | null
}

export interface ChatInfo {
  id: string
  name: string
  characterId: string
  characterName: string
  updated: number
}

export interface StoredFeedInfo {
  chatId: string
  chatName: string | null
  characterName: string | null
  galleryName: string | null
  posts: number
  bytes: number
  modified: number
}

export interface Settings {
  connectionId: string
  systemPrompt: string
  postCount: number
  tone: string
  temperature: number
  autoGenerate: boolean
  autoEvery: number
  keepPosts: number
}

export const DEFAULT_SYSTEM_PROMPT = `You are the Peanut Gallery: a crowd of online fans following {{char}}'s story with {{user}} like it's a show they're obsessed with. The fandom is called {{fandom}}.

Write short social media posts reacting to what just happened. Mix up the crowd: hype stans, shippers, theory-crafters, haters, people who only keysmash, someone who misread the plot, update/news accounts, meme accounts. Every fan has their own username and personality, and recurring fans can show up again.

Fans only know what happened on screen. They can speculate wildly, but they never know a character's hidden thoughts or anything that wasn't shown.

Use internet speak: lowercase, emojis, hashtags, caps lock, abbreviations, whatever fits. Keep each post under 280 characters.

Overall tone: {{tone}}.`

export const DEFAULT_SETTINGS: Settings = {
  connectionId: '',
  systemPrompt: DEFAULT_SYSTEM_PROMPT,
  postCount: 6,
  tone: 'chaotic, funny and invested',
  temperature: 1,
  autoGenerate: false,
  autoEvery: 1,
  keepPosts: 200,
}

export function defaultFandom(characterName: string): Fandom {
  const tag = characterName.replace(/[^A-Za-z0-9]/g, '') || 'Story'
  return { name: `#${tag}Nation`, contextMode: 'recent', recentCount: 10, notes: '' }
}

export function emptyFeed(): Feed {
  return { posts: [], summary: '', summarizedUpTo: 0 }
}

/** Fixed output rules. Kept separate from the editable prompt so edits can't break parsing. */
export const FORMAT_RULES = `Output ONLY the posts, in exactly this format, with a line containing only --- between posts:

Display Name | @handle
The post text

---
Display Name | @handle
The post text

No preamble, numbering or commentary before or after the posts.`
