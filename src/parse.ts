// Turns the model's raw text into posts. Kept tolerant: models drift from formats.

export interface ParsedPost {
  name: string
  handle: string
  text: string
}

const HEADER = /^\s*(?:[-*\d.)\s]*)?\**\s*(.+?)\s*\**\s*[|•·—–-]\s*@([A-Za-z0-9_.]+)\s*\**\s*:?\s*$/
const HEADER_INLINE = /^\s*(?:[-*\d.)\s]*)?\**\s*(.+?)\s*\**\s*[|•·—–-]\s*@([A-Za-z0-9_.]+)\s*\**\s*:\s*(\S.*)$/
const HANDLE_ONLY = /^\s*\**@([A-Za-z0-9_.]+)\**\s*:?\s*(.*)$/

export function stripReasoning(raw: string): string {
  return raw
    .replace(/<(think|thinking|reasoning)>[\s\S]*?<\/\1>/gi, '')
    .replace(/^[\s\S]*?<\/(think|thinking|reasoning)>/i, '')
    .replace(/```[a-z]*\n?/gi, '')
    .trim()
}

export function parsePosts(raw: string): ParsedPost[] {
  const text = stripReasoning(raw)
  const blocks = text.split(/^\s*(?:-{3,}|_{3,}|\*{3,})\s*$/m)
  const posts: ParsedPost[] = []

  for (const block of blocks) {
    const lines = block.split('\n').map(l => l.trimEnd())
    while (lines.length && !lines[0].trim()) lines.shift()
    if (!lines.length) continue

    let name = ''
    let handle = ''
    let body: string[] = lines

    const header = lines[0].match(HEADER)
    const inline = header ? null : lines[0].match(HEADER_INLINE)
    if (inline) {
      name = inline[1].replace(/\*/g, '').trim()
      handle = inline[2]
      body = [inline[3], ...lines.slice(1)]
    } else if (header) {
      name = header[1].replace(/\*/g, '').trim()
      handle = header[2]
      body = lines.slice(1)
    } else {
      const only = lines[0].match(HANDLE_ONLY)
      if (only) {
        handle = only[1]
        name = only[1]
        body = only[2] ? [only[2], ...lines.slice(1)] : lines.slice(1)
      }
    }

    const postText = body.join('\n').trim()
    if (!postText) continue
    if (!handle) {
      // A block with no header is usually preamble ("Here are the posts:"). Skip it.
      continue
    }
    posts.push({ name: name || handle, handle, text: postText })
  }

  return posts
}
