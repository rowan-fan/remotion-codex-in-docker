# Codex Container Operating Guide

This Codex home is mounted into the container at `/root/.codex`.

Use these defaults when running inside this project container, especially with
`codex exec`:

- Treat `/workspace` as the only writable application workspace.
- Treat `/media/input` as read-only source media.
- Write rendered videos and other final media outputs to `/media/output`.
- Keep Remotion composition id `MainVideo` unless the user explicitly asks for a different id.
- Prefer the existing npm scripts in `/workspace/package.json` over ad hoc commands.
- Do not write secrets, API keys, login state, or environment values into source files, logs, media, or docs.
- Before editing, inspect the current project structure and preserve existing user changes.
- After meaningful code changes, run the narrowest useful verification command. For video changes, prefer `npm run render` when feasible.

Useful container commands:

```bash
cd /workspace
npm run list:media
npm run studio
npm run render
```

Common paths:

- Remotion project: `/workspace`
- Input media in container: `/media/input`
- Rendered output in container: `/media/output`
- Persisted Codex home in container: `/root/.codex`

When the user asks Codex to make a video, edit the Remotion project directly and make the result renderable. If the requested input media is missing, build a clear placeholder composition that still renders successfully and mention the missing assets.
