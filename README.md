# 🥜 Peanut Gallery

A Lumiverse extension that adds a fake social media feed to your sidebar. A crowd of "fans" posts about your roleplay as if it were a show they're obsessed with. The herd is talking.

## Features

- **A feed for every chat.** Each chat keeps its own posts.
- **Fandoms.** Every character is a fandom with its own name, notes (ships, in-jokes, recurring fans) and settings. Switch fandoms and chats from the top of the tab, or let it follow whatever chat you have open.
- **You choose what fans know, per fandom:**
  - *Recent messages*: fans react live to the last few messages.
  - *Whole story*: fans get a running recap of the whole chat plus the latest scene. The recap updates itself and you can edit it.
- **Refresh when you want.** Tap **Toss peanuts**, or turn on auto refresh after every AI reply (or every few replies).
- **Editable system prompt** with `{{char}}`, `{{user}}`, `{{fandom}}`, `{{tone}}` and `{{count}}` macros, plus tone, post count, temperature and connection settings.

## Install

In Lumiverse: **Sidebar → Extensions → install from GitHub**, then paste:

```
https://github.com/welc2ws/peanut-gallery
```

The repo has to be public for Lumiverse to download it. Grant the permissions it asks for (generation, characters, chats, personas).

## Development

```
bun install
bun run build
```

`dist/` is committed so Lumiverse can install straight from the repo. Rebuild before pushing.
