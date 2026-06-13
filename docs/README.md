# Remotion + Codex Docker 文档索引

本文档集描述第一版实现目标：使用 Docker Compose 启动一个包含 Remotion、Codex CLI、Chrome 渲染依赖和 ffmpeg 的交互式容器。用户通过 `docker exec` 进入容器，让 Codex 在容器内修改 Remotion 项目，并通过 Remotion Studio 预览、通过 Remotion render 输出视频。

第一版不实现 WebUI、后端 API、任务队列、数据库或 `codex app-server` 集成。

## 文档顺序

1. [implementation-spec.md](./implementation-spec.md)
   - 文件级编码规格。
   - Dockerfile、docker-compose、Remotion 工程、脚本和配置文件的职责。
   - 每个脚本应提供的函数和命令。

2. [persistence-design.md](./persistence-design.md)
   - 视频素材、输出成品、Remotion 工程、Codex 配置、Codex skills/cache 的本地持久化设计。
   - Docker volume 和 bind mount 的取舍。

3. [container-workflow.md](./container-workflow.md)
   - 用户如何构建镜像、启动容器、进入容器、使用 Codex、预览 Studio、渲染视频。
   - 约定命令和排错路径。

4. [security-notes.md](./security-notes.md)
   - Codex 凭据、宿主机挂载、容器权限和素材版权注意事项。

## 第一版成功标准

- `docker compose up -d` 后容器保持运行。
- `docker exec -it remotion-codex bash` 可以进入容器。
- 容器内 `codex --version` 可执行。
- 容器内 `/workspace` 是一个可运行的 Remotion 项目。
- 宿主机浏览器访问 `http://localhost:3000` 能打开 Remotion Studio。
- 容器内执行 `npm run render` 后，生成文件出现在 `/media/output/final.mp4`。
- 宿主机可在 `./media/output/final.mp4` 看到同一个输出文件。
- 容器重启后，`/workspace`、`/media/input`、`/media/output`、`/codex-home` 中的数据不丢失。

