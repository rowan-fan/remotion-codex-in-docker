# remotion-codex-in-docker

本项目提供一个本地 Docker 环境，用于在容器中运行 Codex CLI 和 Remotion 视频工程。

## 快速开始

```bash
cp .env.example .env
docker compose build
docker compose up -d
docker exec -it remotion-codex bash
```

进入容器后：

```bash
cd /workspace
npm install
npm run list:media
npm run render
```

默认输出文件：

```text
./media/output/final.mp4
```

启动 Remotion Studio：

```bash
npm run studio
```

宿主机浏览器访问：

```text
http://localhost:3000
```

## 持久化目录

- `workspace/` 挂载到容器 `/workspace`，保存 Remotion 工程。
- `/workspace/node_modules` 使用 Docker named volume，依赖安装在容器侧，不写入宿主机工程目录。
- `media/input/` 挂载到容器 `/media/input`，保存输入素材。
- `media/output/` 挂载到容器 `/media/output`，保存渲染输出。
- `codex-home/` 挂载到容器 `/root/.codex`，保存 Codex 登录状态和配置。

更多设计和工作流说明见 [docs](./docs/README.md)。
