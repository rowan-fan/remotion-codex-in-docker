# 文件级实现规格

本文档给后续编码 agent 使用。目标是让 agent 按文件和函数职责直接复现第一版项目，不需要重新设计。

## 目标架构

```text
host project root
  |
  |-- docker compose up -d
  |
  |-- http://localhost:3000 -> container:3000 Remotion Studio
  |
  |-- docker exec -it remotion-codex bash
        |
        |-- /workspace      Remotion 项目，bind mount 到宿主机 ./workspace
        |-- /media/input    输入素材，bind mount 到宿主机 ./media/input
        |-- /media/output   输出视频，bind mount 到宿主机 ./media/output
        |-- /root/.codex    Codex 配置和缓存，bind mount 到宿主机 ./codex-home
```

## 必须创建的根目录文件

```text
Dockerfile
docker-compose.yml
.dockerignore
.env.example
README.md
```

`README.md` 可以在后续编码阶段更新。当前文档已经提供实现规格。

## 必须创建的持久化目录

```text
workspace/
media/
media/input/
media/output/
codex-home/
```

这些目录必须进入仓库或通过占位文件保留：

```text
media/input/.gitkeep
media/output/.gitkeep
codex-home/.gitkeep
```

`codex-home` 目录内真实凭据文件必须被 `.gitignore` 忽略。详见 `persistence-design.md`。

## Dockerfile 规格

文件：`Dockerfile`

基础镜像：

```Dockerfile
FROM node:22-bookworm-slim
```

必须安装的系统包：

- `ca-certificates`
- `curl`
- `git`
- `bash`
- `procps`
- `ffmpeg`
- `fonts-noto`
- `fonts-noto-cjk`
- `fonts-noto-color-emoji`
- Chrome/Chromium 运行依赖：
  - `libnss3`
  - `libatk-bridge2.0-0`
  - `libatk1.0-0`
  - `libcups2`
  - `libdrm2`
  - `libxkbcommon0`
  - `libxcomposite1`
  - `libxdamage1`
  - `libxfixes3`
  - `libxrandr2`
  - `libgbm1`
  - `libasound2`
  - `libpango-1.0-0`
  - `libcairo2`

必须安装的 npm 全局工具：

```bash
npm install -g @openai/codex
```

工作目录：

```Dockerfile
WORKDIR /workspace
```

必须设置的环境变量：

```Dockerfile
ENV NODE_ENV=development
ENV REMOTION_DISABLE_UPDATE_CHECK=1
ENV npm_config_update_notifier=false
```

容器默认命令必须保持容器存活，方便 `docker exec`：

```Dockerfile
CMD ["bash", "-lc", "tail -f /dev/null"]
```

不要在镜像构建阶段写入 OpenAI/Codex API key。

## docker-compose.yml 规格

文件：`docker-compose.yml`

服务名：`remotion-codex`

容器名：`remotion-codex`

端口：

```yaml
ports:
  - "3000:3000"
```

必须挂载：

```yaml
volumes:
  - ./workspace:/workspace
  - ./media/input:/media/input
  - ./media/output:/media/output
  - ./codex-home:/root/.codex
```

必须设置工作目录：

```yaml
working_dir: /workspace
```

必须从 `.env` 读取可选环境变量：

```yaml
environment:
  OPENAI_API_KEY: ${OPENAI_API_KEY:-}
  CODEX_API_KEY: ${CODEX_API_KEY:-}
```

建议设置：

```yaml
stdin_open: true
tty: true
shm_size: "2gb"
```

`shm_size` 用于降低 Chromium 渲染时共享内存不足的概率。

## .dockerignore 规格

文件：`.dockerignore`

至少包含：

```text
.git
node_modules
workspace/node_modules
workspace/out
media/input
media/output
codex-home
.env
```

不要把素材、输出视频或 Codex 凭据打进镜像。

## .env.example 规格

文件：`.env.example`

内容：

```env
# Optional. Prefer API key for non-interactive Codex use.
OPENAI_API_KEY=
CODEX_API_KEY=

# Remotion Studio port exposed by docker-compose.yml.
REMOTION_STUDIO_PORT=3000
```

如果后续 Compose 使用 `REMOTION_STUDIO_PORT`，端口映射应为：

```yaml
ports:
  - "${REMOTION_STUDIO_PORT:-3000}:3000"
```

## workspace Remotion 项目规格

目录：`workspace/`

必须创建：

```text
workspace/package.json
workspace/package-lock.json
workspace/remotion.config.ts
workspace/src/Root.tsx
workspace/src/Video.tsx
workspace/src/styles.css
workspace/scripts/render.mjs
workspace/scripts/list-media.mjs
workspace/scripts/ensure-dirs.mjs
```

### package.json

必须包含 scripts：

```json
{
  "scripts": {
    "studio": "remotion studio --host 0.0.0.0 --port 3000",
    "render": "node scripts/render.mjs",
    "render:mp4": "node scripts/render.mjs --output /media/output/final.mp4",
    "list:media": "node scripts/list-media.mjs",
    "ensure:dirs": "node scripts/ensure-dirs.mjs"
  }
}
```

必须包含 dependencies：

```json
{
  "@remotion/cli": "latest",
  "@remotion/renderer": "latest",
  "@remotion/bundler": "latest",
  "remotion": "latest",
  "react": "latest",
  "react-dom": "latest"
}
```

编码时可以 pin 具体版本，但要保证 Remotion 包版本一致。

### remotion.config.ts

职责：

- 设置输出编码默认值。
- 配置 Chromium 相关选项。
- 保持配置简洁，避免隐藏魔法。

建议内容：

```ts
import {Config} from '@remotion/cli/config';

Config.setVideoImageFormat('jpeg');
Config.setOverwriteOutput(true);
```

### src/Root.tsx

职责：

- 注册 Remotion composition。
- composition id 固定为 `MainVideo`，方便脚本调用。
- 默认帧率 `30`。
- 默认时长 `300` 帧，即 10 秒。
- 默认分辨率 `1920x1080`。

必须导出组件：

```ts
export const RemotionRoot: React.FC = () => { ... };
```

必须渲染：

```tsx
<Composition
  id="MainVideo"
  component={Video}
  durationInFrames={300}
  fps={30}
  width={1920}
  height={1080}
/>
```

### src/Video.tsx

职责：

- 提供一个默认可渲染的视频。
- 显示标题、当前帧进度和素材目录提示。
- 保持代码简单，方便 Codex 修改。

建议实现细节：

- 使用 `AbsoluteFill`。
- 使用 `useCurrentFrame()` 和 `interpolate()` 做简单淡入。
- 引入 `./styles.css`。
- 不直接依赖 `/media/input` 文件，避免空素材目录导致首版渲染失败。

### src/styles.css

职责：

- 提供默认背景、标题、说明文案样式。
- 确保中文字体优先使用 Noto CJK。

建议字体栈：

```css
font-family: "Noto Sans CJK SC", "Noto Sans", Arial, sans-serif;
```

### scripts/ensure-dirs.mjs

职责：

- 确保 `/media/input`、`/media/output` 存在。
- 如果不存在则创建。

必须实现函数：

```js
function ensureDir(pathname)
```

输入：绝对路径字符串。

行为：如果目录不存在，递归创建；如果路径存在但不是目录，抛错。

脚本入口：

```js
ensureDir('/media/input');
ensureDir('/media/output');
```

### scripts/list-media.mjs

职责：

- 列出 `/media/input` 和 `/media/output` 文件。
- 帮助用户在容器内确认挂载是否生效。

必须实现函数：

```js
function formatBytes(bytes)
function listFiles(root)
function printSection(title, root)
```

`listFiles(root)` 返回数组，每项包含：

```js
{
  path: string,
  size: number,
  mtimeMs: number
}
```

只需要递归 2 层，避免误扫大目录。

### scripts/render.mjs

职责：

- 使用 Remotion Node API 渲染 `MainVideo`。
- 默认输出 `/media/output/final.mp4`。
- 支持 `--output <path>` 参数。
- 渲染前确保输出目录存在。
- 打印清晰日志。

必须实现函数：

```js
function parseArgs(argv)
function ensureParentDir(filePath)
async function bundleProject()
async function selectComposition(bundleLocation, compositionId)
async function renderComposition(options)
async function main()
```

函数职责：

- `parseArgs(argv)`：
  - 输入 `process.argv.slice(2)`。
  - 返回 `{output: string, compositionId: string}`。
  - 默认 `{output: '/media/output/final.mp4', compositionId: 'MainVideo'}`。
  - 支持 `--output` 和 `--composition`。

- `ensureParentDir(filePath)`：
  - 获取输出文件父目录。
  - 递归创建父目录。

- `bundleProject()`：
  - 调用 `bundle()`。
  - entry point 使用 `src/Root.tsx`。
  - 返回 bundle location。

- `selectComposition(bundleLocation, compositionId)`：
  - 调用 `getCompositions()`。
  - 找到指定 id。
  - 找不到时抛出包含可用 composition id 的错误。

- `renderComposition(options)`：
  - 调用 `renderMedia()`。
  - codec 使用 `h264`。
  - imageFormat 使用 `jpeg`。
  - outputLocation 使用参数输出路径。
  - onProgress 打印百分比。

- `main()`：
  - 串联 parse、ensure、bundle、select、render。
  - 捕获错误并 `process.exitCode = 1`。

## Codex 使用约定

容器内执行：

```bash
cd /workspace
codex
```

或：

```bash
cd /workspace
codex exec "根据 /media/input 的素材修改当前 Remotion 项目，输出一个 30 秒视频。渲染输出路径为 /media/output/final.mp4。"
```

建议在 `workspace/AGENTS.md` 中写入给 Codex 的本地规则。

## workspace/AGENTS.md 规格

文件：`workspace/AGENTS.md`

必须说明：

- 只能修改 `/workspace` 内文件。
- 输入素材在 `/media/input`。
- 输出视频必须写入 `/media/output`。
- 默认 composition id 是 `MainVideo`。
- 渲染命令是 `npm run render`。
- 不要把密钥写入源码或日志。

## 验收命令

后续编码完成后必须执行：

```bash
docker compose build
docker compose up -d
docker exec -it remotion-codex bash -lc "cd /workspace && npm install"
docker exec -it remotion-codex bash -lc "cd /workspace && npm run list:media"
docker exec -it remotion-codex bash -lc "cd /workspace && npm run render"
```

如果 `npm install` 已在镜像构建阶段处理，可以省略手动安装，但验收文档必须写清楚实际方式。第一版不通过首次启动脚本初始化或复制 `/workspace`。

Studio 验收：

```bash
docker exec -it remotion-codex bash -lc "cd /workspace && npm run studio"
```

宿主机访问：

```text
http://localhost:3000
```
