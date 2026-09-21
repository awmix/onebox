# OneBox

OneBox 是一个无构建依赖的静态 PWA，把常用工具放进一个可离线使用的盒子，适合直接部署到 GitHub Pages。

## 当前能力

- 计算器：括号、百分比、键盘操作、历史记录，以及 `sin/cos/tan/log/ln/sqrt/幂/阶乘/π/e` 等科学函数，支持度/弧度切换。
- 日历：公历、农历、干支生肖、二十四节气、法定节假日、补班、个人日程；带时间的日程会自动进入右上角提醒中心。
- 天气：Open-Meteo 开源数据；城市/区县搜索、多个天气卡片、长按或拖拽排序、实时天气、小时天气、未来 15 天和出行/运动/穿衣/防晒/爬山建议。
- 转换：长度、重量、面积、体积、速度、时间、数据和温度，支持交换单位和复制结果。
- 翻译：多个公共 LibreTranslate 开源实例自动容错，翻译记录可本地保存；公共实例不可用时会明确提示，不伪造结果。
- 设置：浅色、深色、跟随系统；中文、英文；日语/韩语入口已预留。
- 数据：主题、工具顺序、日程、天气卡片、翻译记录、提醒、导航、阅读书架/进度/笔记和已导入书籍文件都保存在当前设备；可选 GitHub 授权 + 私有 Gist 同步。
- 通知：右上角提醒中心；浏览器允许通知时使用 Service Worker 通知。Safari 主屏幕 Web App 可以申请通知权限，但真正的关闭页面后台推送仍需要服务端 Push/VAPID。

## 本地运行

```bash
python3 -m http.server 4173 -d dist
```

然后打开 <http://localhost:4173>。PWA 的 Service Worker、安装按钮、离线缓存和通知都需要 HTTP(S) 上下文，不能直接双击 `index.html`。

## GitHub 同步

GitHub Pages 是纯静态托管，OneBox 使用 GitHub Device Flow，不把 OAuth Client Secret 放进前端，也不要求用户填写 Client ID。点击“GitHub”后会打开 GitHub 设备授权页；用户登录并授权后，OneBox 会自动完成登录，并使用你的私有 Gist 保存设置、工具配置、导航、日程、天气卡片、翻译记录、通知、阅读书架/进度/笔记及本地导入的书籍文件。书籍二进制内容会拆分为多个 Gist 文件，访问令牌只保存在当前设备，退出 GitHub 会清除本地令牌。

首页订阅内容、节假日和天气接口响应属于网络缓存，不参与同步；GitHub 登录令牌也不会上传到 Gist。

## 发布前检查

1. `node --check dist/app.js`、`node --check dist/sw.js`、`node --check dist/calendar-data.js`。
2. 检查计算器科学函数、日历农历/补班、日程提醒、天气搜索/小时/15 天、翻译失败态、主题/语言设置。
3. 用移动端视口检查顶部安全区颜色、双击按钮不放大、横向天气建议和工具长按排序。
4. 检查 Manifest、Service Worker、离线应用壳和无控制台错误。

仓库不需要 `npm install` 或构建步骤，GitHub Actions 直接发布 `dist/` 目录。
