# 持久化设计

第一版使用 bind mount，把关键状态保存在宿主机项目目录内。这样容器删除、重建、升级镜像后，视频项目、素材、输出成品和 Codex 配置仍然保留。

## 持久化目录总览

```text
./workspace     -> /workspace
./media/input   -> /media/input
./media/output  -> /media/output
./codex-home    -> /root/.codex
```

## 视频编辑路径持久化

### /workspace

用途：

- Remotion 项目源码。
- `package.json`、`remotion.config.ts`、`src/`、`scripts/`。
- Codex 修改的主要目标目录。
- 可提交到 git。

宿主机路径：

```text
./workspace
```

容器路径：

```text
/workspace
```

设计要求：

- Codex 应在 `/workspace` 下运行。
- Remotion 项目必须能在容器内独立执行 `npm run studio` 和 `npm run render`。
- `/workspace/node_modules` 可以存在于 bind mount 中，但 `.dockerignore` 和 `.gitignore` 应忽略它。

### /media/input

用途：

- 原始视频、图片、音频、字幕、logo、字体等素材。
- 用户在宿主机复制素材到 `./media/input`，容器内立即可见。

宿主机路径：

```text
./media/input
```

容器路径：

```text
/media/input
```

设计要求：

- 不提交真实素材到 git。
- 保留 `media/input/.gitkeep`。
- Codex 可以读取该目录，但不应默认改写原始素材。

### /media/output

用途：

- Remotion 渲染输出。
- 默认输出文件：`/media/output/final.mp4`。

宿主机路径：

```text
./media/output
```

容器路径：

```text
/media/output
```

设计要求：

- 不提交渲染成品到 git。
- 保留 `media/output/.gitkeep`。
- 渲染脚本必须在写入前确保目录存在。
- 后续可按任务输出到 `/media/output/YYYYMMDD-HHMMSS-name.mp4`，但第一版固定 `final.mp4` 即可。

## Codex 配置持久化

### /root/.codex

用途：

- Codex 登录状态。
- Codex 配置。
- Codex 缓存。
- Codex skills。
- MCP 配置。
- 会话或本地元数据。

宿主机路径：

```text
./codex-home
```

容器路径：

```text
/root/.codex
```

设计要求：

- docker-compose 必须 bind mount `./codex-home:/root/.codex`。
- 容器重启或重建后，Codex 登录状态、skills、缓存不应丢失。
- `codex-home` 内真实文件默认不提交到 git。
- 只提交 `codex-home/.gitkeep`。

推荐 `.gitignore`：

```text
codex-home/*
!codex-home/.gitkeep
```

安全要求：

- `codex-home/auth.json`、token、session、缓存日志都视为敏感信息。
- 不要把 `codex-home` 打进 Docker 镜像。
- 不要把 `codex-home` 上传到公开仓库。

## .gitignore 建议

后续编码阶段应创建或更新 `.gitignore`：

```text
.env

workspace/node_modules/
workspace/.cache/
workspace/out/
workspace/dist/

media/input/*
!media/input/.gitkeep

media/output/*
!media/output/.gitkeep

codex-home/*
!codex-home/.gitkeep
```

## bind mount 与 named volume 取舍

第一版选择 bind mount。

原因：

- 用户可以直接在宿主机编辑 Remotion 文件。
- 用户可以直接把素材复制进 `media/input`。
- 用户可以直接从 `media/output` 取成品。
- Codex 配置可以备份、迁移或检查。

不选择 named volume 作为第一版默认值。

原因：

- named volume 对新手不直观。
- 输出视频不方便直接找到。
- Codex 配置迁移需要额外命令。

## 容器用户和文件权限

第一版可以使用 root 用户降低实现复杂度，因为容器内 Codex、npm、Remotion 都需要写 `/workspace` 和 `/root/.codex`。

风险：

- 宿主机生成的文件可能归 root。

缓解方式：

- 文档中说明如需修正权限，可在宿主机执行：

```bash
sudo chown -R "$USER":"$USER" workspace media codex-home
```

后续版本可增加 `LOCAL_UID`、`LOCAL_GID`，在 entrypoint 中创建同 UID 用户，但第一版不强制。

## 目录初始化策略

第一版固定采用方案 A：仓库直接包含 `workspace` 示例工程。

要求：

- 直接在仓库创建 `workspace` 示例工程。
- 不实现镜像内模板目录。
- 不实现首次启动复制 `/workspace` 的 entrypoint 逻辑。
- 如果用户删除 `workspace`，应通过 git 恢复或重新创建示例工程，而不是依赖容器自动恢复。

原因：

- 行为直观，用户能直接看到和编辑 Remotion 工程。
- 减少隐藏初始化逻辑。
- 避免 bind mount 覆盖镜像内模板后产生理解成本。
