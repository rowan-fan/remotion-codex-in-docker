# Remotion Codex Container

Use this skill when working inside the `remotion-codex-in-docker` container, or when the user asks Codex to modify/render a Remotion video project in this workspace.

## Environment

- The Remotion app lives at `/workspace`.
- Source media is mounted at `/media/input`.
- Rendered output belongs in `/media/output`.
- Codex home is mounted at `/root/.codex` and may contain credentials or local state; do not copy it into the project.
- The expected composition id is `MainVideo`.

## Workflow

1. Start from `/workspace`.
2. Inspect `package.json`, `src/`, and relevant scripts before editing.
3. List available media with `npm run list:media` when the task depends on assets.
4. Modify only files required for the requested video or tool behavior.
5. Keep the composition renderable even when media is missing; use placeholders only when necessary.
6. Render or otherwise verify with the narrowest useful command.
7. Put final video output under `/media/output`, normally `/media/output/final.mp4`.

## Commands

```bash
cd /workspace
npm run list:media
npm run render
```

Use Studio for visual preview when requested:

```bash
cd /workspace
npm run studio
```

## Guardrails

- Do not modify `/media/input` originals.
- Do not place outputs under `/workspace` unless the user explicitly asks.
- Do not persist secrets in code, docs, generated media, logs, or shell history.
- Do not change the composition id away from `MainVideo` unless the user requests it.
- Avoid broad refactors; keep changes scoped to the requested composition or workflow.
