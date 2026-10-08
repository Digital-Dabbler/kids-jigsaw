# 拼图小岛 · 儿童拼图游戏

面向 4~8 岁小朋友的拼图游戏：难度 C1~C8（8 块 → 1000 块），glossy 卡通手游风 UI，
内置卡通图案 + 自定义上传图片。零依赖、免构建。

## 玩

- 桌面：双击 `www/index.html`
- 手机：见下方分发章节（PWA / 鸿蒙自装包，后续 commit 补全文档）

## 测试

```powershell
npm test
```

（node --test，零第三方依赖）

## 结构

```
www/        游戏本体（index.html / css / js / assets）
tests/      node:test 单元测试（纯逻辑模块）
tools/      图标生成、鸿蒙资源同步脚本（后续补充）
harmony/    鸿蒙 ArkTS WebView 壳工程（后续补充）
```

## 约定

- 纯逻辑模块（levels/rng/geometry/pieces/storage）写成 UMD 式：浏览器挂 `PG.*`，Node 可 `require`
- 每次改动一个 git commit；提交前 `npm test` 必须全绿
