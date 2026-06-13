# 容器内视频剪辑工作流

本文档描述用户如何使用第一版项目。

## 1. 准备环境

复制环境变量模板：

```bash
cp .env.example .env
```

如果使用 API key，在 `.env` 中填写：

```env
OPENAI_API_KEY=sk-...
```

如果使用 Codex 交互式登录，也可以留空 `.env`，进入容器后运行：

```bash
codex
```

登录状态会保存在宿主机 `./codex-home`，因为该目录挂载到容器 `/root/.codex`。

## 2. 构建并启动容器

```bash
docker compose build
docker compose up -d
```

确认容器运行：

```bash
docker compose ps
```

## 3. 进入容器

```bash
docker exec -it remotion-codex bash
```

进入后确认路径：

```bash
pwd
```

预期：

```text
/workspace
```

## 4. 检查工具

```bash
node --version
npm --version
ffmpeg -version
codex --version
```

检查素材和输出目录：

```bash
npm run list:media
```

## 5. 放入素材

在宿主机复制素材到：

```text
./media/input
```

容器内对应：

```text
/media/input
```

支持的常见素材：

- `.mp4`
- `.mov`
- `.webm`
- `.mp3`
- `.wav`
- `.png`
- `.jpg`
- `.jpeg`
- `.srt`
- `.vtt`

第一版不做素材上传页面。

## 6. 使用 Codex 修改 Remotion 项目

交互式方式：

```bash
cd /workspace
codex
```

可以给 Codex 的任务示例：

```text
请读取 /media/input 的素材，修改当前 Remotion 项目，制作一个 30 秒横屏视频。
要求：
- composition id 保持 MainVideo。
- 代码只修改 /workspace。
- 输出通过 npm run render 生成到 /media/output/final.mp4。
- 如果素材不足，先生成一个可渲染的占位版本。
```

非交互方式：

```bash
cd /workspace
codex exec "读取 /media/input 的素材，修改当前 Remotion 项目，制作一个 30 秒横屏视频，composition id 保持 MainVideo，渲染命令必须是 npm run render。"
```

## 7. 启动 Remotion Studio

容器内执行：

```bash
cd /workspace
npm run studio
```

宿主机浏览器打开：

```text
http://localhost:3000
```

如果该命令占用当前终端，可以另开一个终端进入容器继续操作，或在宿主机执行：

```bash
docker exec -it remotion-codex bash
```

## 8. 渲染视频

容器内执行：

```bash
cd /workspace
npm run render
```

默认输出：

```text
/media/output/final.mp4
```

宿主机查看：

```text
./media/output/final.mp4
```

自定义输出：

```bash
npm run render:mp4 -- --output /media/output/demo.mp4
```

如果 `render:mp4` 脚本不透传参数，直接调用：

```bash
node scripts/render.mjs --output /media/output/demo.mp4
```

## 9. 常见排错

### Studio 无法访问

确认 `npm run studio` 使用：

```bash
remotion studio --host 0.0.0.0 --port 3000
```

确认 Compose 端口映射：

```yaml
ports:
  - "3000:3000"
```

### 渲染时 Chrome 报错

确认 Dockerfile 安装了 Chrome/Chromium 依赖和字体。

确认 Compose 设置：

```yaml
shm_size: "2gb"
```

### 中文显示为方块

确认安装：

```bash
apt-get install fonts-noto-cjk
```

CSS 使用：

```css
font-family: "Noto Sans CJK SC", "Noto Sans", Arial, sans-serif;
```

### 容器重启后 Codex 登录丢失

确认 Compose 挂载：

```yaml
volumes:
  - ./codex-home:/root/.codex
```

确认宿主机目录存在：

```bash
ls -la codex-home
```

### 输出视频找不到

容器内检查：

```bash
ls -lah /media/output
```

宿主机检查：

```bash
ls -lah media/output
```

如果容器内有而宿主机没有，说明 Compose 挂载路径不正确。

