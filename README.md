# 拼图小岛 · 儿童拼图游戏

面向 4~8 岁小朋友的拼图游戏：难度 C1~C8（8 块 → 1000 块），glossy 卡通手游风 UI，
内置 6 张卡通图案 + 自定义上传图片。零依赖、免构建。

线上地址（GitHub Pages）：<https://digital-dabbler.github.io/kids-jigsaw/>

## 玩

- **桌面**：双击 `www/index.html`
- **iPhone / iPad（PWA）**：Safari 打开线上地址 → 分享 → 「添加到主屏幕」→ 全屏离线玩
  （首次打开会由 Service Worker 缓存全部资源，之后断网可玩）
- **鸿蒙设备（自装包）**：见下方「鸿蒙装机指引」
- **安卓/其他**：浏览器打开线上地址即可（或桌面快捷方式）

## 玩法说明

- 主页：‹ › 换图案（内置 6 张 + 自己上传的图），菱形徽章选难度 C1~C8，「开始拼图」
- 游戏：把散落的拼图块拖到中央淡影上，靠近正确位置会自动吸附；👁 按住看全图；顶栏绿色进度条显示进度
- 结算：按用时给 1~3 星（最佳记录保存）；可下一关 / 再玩 / 回家
- 上传：主页轮播到最后一张「＋上传照片」卡；图片仅存本机浏览器（过大时仅本次会话可用）
- 声音：🔊 开关，持久保存

## 测试

```powershell
npm test
```

（`node tests/run.js` 进程内跑 node:test，零第三方依赖；不用 `node --test tests/` 是因为它会 spawn 管道子进程，在 DSH 受限沙箱下 named pipes 被禁报 spawn EPERM）

## 结构

```
www/            游戏本体（index.html / manifest / sw.js / css / js / assets）
tests/          node:test 单元测试（纯逻辑模块 + PWA/鸿蒙壳静态检查）
tools/          make-icons.ps1（图标）、sync-harmony-assets.ps1（鸿蒙资源同步）
harmony/        鸿蒙 NEXT ArkTS WebView 壳工程（DevEco Studio 打开构建）
.github/        GitHub Pages 部署工作流（upload www/）
```

纯逻辑模块（levels/rng/geometry/pieces/storage/game/format/images）为 UMD 式：
浏览器挂 `PG.*`，Node 可 `require`，供 tests/ 直接测试。

## 鸿蒙装机指引（不进商店，个人自用）

一次性准备（人工操作）：

1. 安装 DevEco Studio（Windows 版，官网下载），注册/登录华为开发者账号并完成**个人实名认证**（免费）
2. 手机：设置 → 关于 → 连点版本号开启开发者模式；设置 → 系统 → 开发者选项 → 打开 USB 调试

每次构建：

```powershell
# 1) 同步游戏资源进壳工程（rawfile/www 不入库）
$L=[scriptblock]::Create((Get-Content -Raw -Encoding UTF8 'tools/sync-harmony-assets.ps1')); & $L
```

3. DevEco Studio 打开 `harmony/` 目录，等待依赖同步完成
4. File → Project Structure → Signing Configs → 勾选 **Automatically generate signature**（登录态下自动签调试证书）
5. 手机 USB 连电脑，DevEco 右上角选设备 → Run 'entry'（或 Build → Build Hap 后 `hdc install <hap路径>`）

壳工程要点：`EntryAbility` 全屏+常亮；`Index.ets` 用 ArkWeb `Web` 组件加载
`resource://RAWFILE/www/index.html`，开启 JS/DOM Storage；`onShowFileSelector`
接系统相册（PhotoViewPicker）打通游戏内「上传照片」。

## 人工验收清单

- [ ] 桌面双击 `www/index.html`：主页渲染、轮播、选关、开始
- [ ] C1 通关一局：拖拽吸附、进度条、结算星星、彩纸、下一关
- [ ] C8 开一局：千块散落可抓取、不卡死（允许慢）
- [ ] 上传自定义图 → 立即可拼 → 刷新后仍在（超配额时提示仅本次可用）
- [ ] 声音开关持久；peek 按住出全图、松开消失
- [ ] 游戏中转屏/改窗口大小：已放块不错位
- [ ] 线上地址 iPhone Safari 添加到主屏幕 → 全屏 → 飞行模式重开仍可玩
- [ ] 鸿蒙真机：图标启动、离线可玩、相册上传可用

## 约定

- 每次改动一个 git commit；提交前 `npm test` 必须全绿
- 内置图由百炼 `bl image generate` 生成（`--watermark false`），原图在 `www/assets/raw/`（不入库）
