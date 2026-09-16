# 跨仓文档格式样本

`community-document.json` 固定同一篇中文文档的 HTML、Markdown、JSON 和 Yjs update（base64）。JSON/Ydoc 由 Service 的实际 `htmlToJson`、`TiptapTransformer` 生成；两端测试使用各自完整的生产 schema 解码和往返，不另建测试专用 schema。

当前样本覆盖标题、段落、加粗、列表、空段落、稳定节点 ID 和 Unicode。复杂附件、表格、嵌入及协作撤权在后续业务验收中另测；这个样本不代表全部编辑器功能验收。

Web 与 Service 均通过已安装的 `@lec/doc-editor/fixtures/community-document.json` 读取，以同时检查包内容是否完整。修改扩展或升级版本时，先验证旧样本仍能读取，不要仅重新生成样本来消除失败。
