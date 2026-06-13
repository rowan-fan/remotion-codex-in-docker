# 安全说明

第一版是本地开发和内网使用方案，不是公网多用户服务。

## Codex 凭据

可能出现凭据的位置：

```text
.env
codex-home/auth.json
codex-home/config.toml
codex-home/
```

要求：

- `.env` 不提交到 git。
- `codex-home/*` 不提交到 git。
- 不把 `codex-home` 复制进镜像。
- 不把 Codex token、OpenAI API key 写入 Remotion 源码。
- 不把包含 token 的日志提交到仓库或发给第三方。

## 挂载目录边界

Compose 只挂载：

```text
./workspace
./media/input
./media/output
./codex-home
```

不要挂载：

```text
~/
/root
/var/run/docker.sock
/etc
/usr
```

特别不要挂载 Docker socket。否则容器内进程可以控制宿主机 Docker。

## Codex 修改范围

Codex 应在 `/workspace` 内运行：

```bash
cd /workspace
codex
```

给 Codex 的任务必须明确：

```text
只修改 /workspace 内文件。
只读取 /media/input。
只输出到 /media/output。
不要读取或打印环境变量。
不要写入密钥。
```

建议在 `workspace/AGENTS.md` 固化这些规则。

## 网络访问

第一版默认容器有网络，用于：

- npm install。
- Codex 访问 OpenAI 服务。
- 可能下载 Remotion 浏览器依赖。

如果处理敏感素材，不建议开放公网端口。Remotion Studio 的 `3000` 端口默认只映射给本机使用。不要在公网服务器上直接暴露 `0.0.0.0:3000`，除非前面有 VPN、SSH tunnel 或反向代理认证。

## 素材版权和隐私

`/media/input` 可能包含商业视频、客户素材、未公开音频、人脸或隐私数据。

使用 Codex 处理前，应确认：

- 素材允许进入该运行环境。
- prompt 和日志不会泄露敏感信息。
- 输出视频可按预期保存和分发。

## Root 用户风险

第一版容器默认 root 用户，原因是实现简单、兼容 npm/Codex/Remotion 写入。

风险：

- 宿主机 bind mount 下生成的文件可能归 root。

修复命令：

```bash
sudo chown -R "$USER":"$USER" workspace media codex-home
```

后续版本可以增加非 root 用户模式，但第一版不强制。

## 不使用 codex app-server

第一版不使用 `codex app-server`，原因：

- 不开发 WebUI。
- 不暴露 Codex WebSocket。
- 不实现 JSON-RPC 客户端。
- 不处理审批 UI、thread resume、事件聚合。

如果后续引入 `codex app-server`，浏览器不应直接连接 app-server。应由后端代理，并实现认证、授权和审批。

