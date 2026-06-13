# Codex 工作规则

本文件是容器内 `/workspace` 的项目级指引，供 `codex` 和 `codex exec` 直接读取。

## 路径约定

- 只修改 `/workspace` 内的项目文件，除非用户明确要求其他位置。
- 输入素材位于 `/media/input`，默认只读取，不改写原始素材。
- 输出视频必须写入 `/media/output`，默认文件是 `/media/output/final.mp4`。
- Codex home 位于 `/root/.codex`，可能包含登录状态和本地配置，不要复制进项目。

## Remotion 约定

- 默认 composition id 是 `MainVideo`。
- 默认渲染命令是 `npm run render`。
- 优先使用 `package.json` 中已有脚本，不要随意新增重复脚本。
- 如果素材缺失，先做一个可以成功渲染的占位版本，并在最终回复中说明缺失内容。
- 中文文本优先使用 `"Noto Sans CJK SC", "Noto Sans", Arial, sans-serif`。

## 工作流程

1. 先读取 `package.json`、`src/` 和相关脚本，确认现有结构。
2. 需要素材时运行 `npm run list:media` 查看 `/media/input`。
3. 修改代码后运行最小可用验证；视频任务优先运行 `npm run render`。
4. 最终回复说明改了什么、验证命令是否通过、输出文件路径。

## 安全规则

- 不要把密钥、token、环境变量或登录凭据写入源码、日志、文档或视频输出。
- 不要删除用户已有素材或输出文件，除非用户明确要求。
- 不要回滚用户已有改动；如果发现无关改动，只避开它们。
