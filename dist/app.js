/* OneBox 2.0 — dependency-free, mobile-first PWA application layer. */
const APP_VERSION = '2.18.226';
const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
const uid = () => Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8);
const pad = (value) => String(value).padStart(2, '0');
const today = new Date();
const STORAGE = {
  theme: 'onebox.theme',
  language: 'onebox.language',
  toolOrder: 'onebox.tool-order',
  calculator: 'onebox.calculator',
  translationHistoryOpen: 'onebox.translation-history-open',
  events: 'onebox.events',
  holidays: 'onebox.holidays',
  weatherCards: 'onebox.weather-cards',
  legacyWeather: 'onebox.weather',
  translationHistory: 'onebox.translation-history',
  notifications: 'onebox.notifications',
  library: 'onebox.library',
  readerPreferences: 'onebox.reader-preferences',
  readerLayout: 'onebox.reader-layout',
  homeFeeds: 'onebox.home-feeds',
  homeFeedRead: 'onebox.home-feed-read',
  homeFeedOrder: 'onebox.home-feed-order',
  homeFeedVisibility: 'onebox.home-feed-visibility',
  layout: 'onebox.layout',
  notificationPreference: 'onebox.notification-preference',
  color: 'onebox.color',
  colorExplicit: 'onebox.color-explicit',
  topDisplay: 'onebox.top-display',
  footprint: 'onebox.footprint',
  openMode: 'onebox.open-mode',
  github: 'onebox.github',
  navigation: 'onebox.navigation',
  navigationLocation: 'onebox.navigation-location',
  mascotPosition: 'onebox.mascot-position',
  mascotVisible: 'onebox.mascot-visible',
};
const TOOL_DEFS = {
  calculator: { icon: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="3" width="14" height="18" rx="3"/><path d="M8 7h8M8 11h.01M12 11h.01M16 11h.01M8 15h.01M12 15h.01M16 15h.01M8 18h8"/></svg>', key: 'calculator' },
  calendar: { icon: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="5" width="16" height="16" rx="3"/><path d="M8 3v4M16 3v4M4 9h16M8 13h.01M12 13h.01M16 13h.01M8 17h.01M12 17h.01M16 17h.01"/></svg>', key: 'calendar' },
  weather: { icon: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="3.5"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>', key: 'weather' },
  translate: { icon: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 18 8 6l4 12M5.5 14h5M14 8h6M17 5v3M14 16h6M17 13v3"/></svg>', key: 'convert' },
  reader: { icon: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4.5 5.5c2.2-.9 4.6-.4 7.5 1.4v12.2c-2.9-1.8-5.3-2.3-7.5-1.4z"/><path d="M19.5 5.5c-2.2-.9-4.6-.4-7.5 1.4v12.2c2.9-1.8 5.3-2.3 7.5-1.4z"/><path d="M12 6.9v12.2"/></svg>', key: 'reader' },
  navigation: { icon: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8.5"/><path d="m15.5 8.5-2.1 5-4.9 2 2-4.9 5-2.1Z"/></svg>', activeIcon: '<svg class="filled-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 12 2.5Zm4.55 6.32-2.19 5.47-5.36 2.2a.9.9 0 0 1-1.18-1.17l2.15-5.34 5.41-2.27a.9.9 0 0 1 1.17 1.11Z"/></svg>', key: 'navigation' },
};
// Homepage subscriptions live in one registry. Set enabled:false to retire a
// source without touching rendering, ordering, cache or interaction code.
// The fetchers are intentionally source-specific: using one RSS aggregator for
// every site was the reason several feeds lagged by hours and hit rate limits.
const FEED_SOURCE_REGISTRY = [
  { id: 'ithome', name: '之家', badge: 'IT', icon: 'icons/ithome.svg?v=2.18.170', className: 'ithome', mobileHost: 'm.ithome.com', visibleByDefault: true, siteUrl: 'https://www.ithome.com/', fetchers: [{ kind: 'rss', url: 'https://www.ithome.com/rss/' }, { kind: 'rss', url: 'https://www.ithome.com/rss', direct: true }] },
  { id: 'huxiu', name: '虎嗅', badge: '虎', icon: 'https://is1-ssl.mzstatic.com/image/thumb/Purple221/v4/be/4c/7f/be4c7f2c-0ebc-7ba8-a60e-c5707c67b0ee/AppIcon-0-0-1x_U007epad-0-1-0-85-220.png/128x128bb.png', className: 'huxiu', mobileHost: 'm.huxiu.com', visibleByDefault: true, siteUrl: 'https://www.huxiu.com/', fetchers: [{ kind: 'rss', url: 'https://www.huxiu.com/rss/0.xml' }, { kind: 'rss', url: 'https://rsshub.rssforever.com/huxiu/article' }, { kind: 'rss', url: 'https://rsshub.app/huxiu/article' }] },
  { id: 'zhihu', name: '知乎', badge: '知', icon: 'https://www.zhihu.com/favicon.ico', className: 'zhihu', mobileHost: 'www.zhihu.com', visibleByDefault: true, siteUrl: 'https://www.zhihu.com/hot', fetchers: [{ kind: 'zhihu-hot', url: 'https://www.zhihu.com/api/v4/search/hot_search' }, { kind: 'zhihu-hot', url: 'https://www.zhihu.com/api/v4/search/hot_search?limit=50' }] },
  { id: 'v2ex', name: 'V站', badge: 'V', icon: 'https://www.v2ex.com/favicon.ico', className: 'v2ex', visibleByDefault: false, siteUrl: 'https://www.v2ex.com/?tab=all', fetchers: [{ kind: 'v2ex-latest', url: 'https://www.v2ex.com/api/topics/latest.json' }, { kind: 'rss', url: 'https://www.v2ex.com/index.xml' }] },
  { id: 'weibo', name: '微博', badge: '博', icon: 'icons/weibo.png?v=2.18.105', className: 'weibo', mobileHost: 'm.weibo.cn', visibleByDefault: false, siteUrl: 'https://s.weibo.com/top/summary?cate=realtimehot', fetchers: [{ kind: 'weibo-hot', url: 'https://baiapi.cn/api/weibo?type=json' }, { kind: 'weibo-hot-v2', url: 'https://weibo.com/ajax/side/hotSearch' }] },
  { id: 'bilibili', name: 'B站', badge: 'B', icon: 'icons/bilibili.ico?v=2.18.124', className: 'bilibili', mobileHost: 'm.bilibili.com', visibleByDefault: false, siteUrl: 'https://search.bilibili.com/all', fetchers: [{ kind: 'bilibili-hot', url: 'https://api.bilibili.com/x/web-interface/search/square?limit=30&platform=web' }, { kind: 'bilibili-hotword', url: 'https://s.search.bilibili.com/main/hotword' }] },
  { id: 'guancha', name: '风闻', badge: '风', icon: 'icons/guancha.png?v=2.18.124', className: 'guancha', mobileHost: 'user.guancha.cn', visibleByDefault: true, siteUrl: 'https://user.guancha.cn/main/index?s=fwdhsy', fetchers: [{ kind: 'guancha-fengwen', url: 'https://user.guancha.cn/main/index-list.json?page=1&order=1' }, { kind: 'guancha-fengwen', url: 'https://rsshub.app/guancha/topic/0/1' }] },
  { id: 'hupu', name: '虎扑', badge: '虎', icon: 'icons/hupu.ico?v=2.18.124', className: 'hupu', mobileHost: 'm.hupu.com', visibleByDefault: true, siteUrl: 'https://bbs.hupu.com/bxj', fetchers: [{ kind: 'hupu-bbs', url: 'https://bbs.hupu.com/bxj' }, { kind: 'hupu-bbs', url: 'https://bbs.hupu.com/topic-daily' }] },
];
const RSS_SOURCES = FEED_SOURCE_REGISTRY.filter((source) => source.enabled !== false);
const RSS_REFRESH_INTERVAL = 2 * 60 * 1000;
const RSS_RETENTION_MS = 2 * 24 * 60 * 60 * 1000;
const RSS_MAX_ITEMS_PER_SOURCE = 60;
const DEFAULT_HOME_FEED_ORDER = RSS_SOURCES.map((source) => source.id);
const DEFAULT_HOME_FEED_VISIBLE = RSS_SOURCES.filter((source) => source.visibleByDefault !== false).map((source) => source.id);
const NAVIGATION_SESSION_KEY = 'onebox-navigation-position';
const DEFAULT_TOOL_ORDER = Object.keys(TOOL_DEFS).filter((id) => id !== 'navigation');
const nav = $('#toolNav');
const workspace = $('#workspace');
const pageSwipeStage = document.createElement('div');
pageSwipeStage.id = 'pageSwipeStage';
pageSwipeStage.className = 'page-swipe-stage';
workspace.parentNode.insertBefore(pageSwipeStage, workspace);
pageSwipeStage.appendChild(workspace);
const homeSourceNav = document.createElement('nav');
homeSourceNav.id = 'homeSourceNav';
homeSourceNav.setAttribute('aria-label', '首页来源切换');
pageSwipeStage.parentNode.insertBefore(homeSourceNav, pageSwipeStage);
const parseStored = (key, fallback) => {
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; }
};
let persistenceTimer = null;
let oneBoxDbPromise = null;
function openOneBoxDb() {
  if (oneBoxDbPromise || !window.indexedDB) return oneBoxDbPromise;
  oneBoxDbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open('onebox-local-data', 2);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains('snapshot')) db.createObjectStore('snapshot');
      if (!db.objectStoreNames.contains('books')) db.createObjectStore('books');
      if (!db.objectStoreNames.contains('book-covers')) db.createObjectStore('book-covers');
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || Error('IndexedDB unavailable'));
  }).catch(() => null);
  return oneBoxDbPromise;
}
async function oneBoxDbGet(storeName, key) {
  const db = await openOneBoxDb();
  if (!db) return null;
  return new Promise((resolve) => {
    const request = db.transaction(storeName, 'readonly').objectStore(storeName).get(key);
    request.onsuccess = () => resolve(request.result ?? null);
    request.onerror = () => resolve(null);
  });
}
async function oneBoxDbPut(storeName, key, value) {
  const db = await openOneBoxDb();
  if (!db) return false;
  return new Promise((resolve) => {
    const request = db.transaction(storeName, 'readwrite').objectStore(storeName).put(value, key);
    request.onsuccess = () => resolve(true);
    request.onerror = () => resolve(false);
  });
}
async function oneBoxDbDelete(storeName, key) {
  const db = await openOneBoxDb();
  if (!db) return false;
  return new Promise((resolve) => {
    const request = db.transaction(storeName, 'readwrite').objectStore(storeName).delete(key);
    request.onsuccess = () => resolve(true);
    request.onerror = () => resolve(false);
  });
}
async function writePersistentSnapshot() {
  const values = {};
  Object.values(STORAGE).forEach((key) => {
    const value = localStorage.getItem(key);
    if (value !== null) values[key] = value;
  });
  await oneBoxDbPut('snapshot', 'app', { version: 1, savedAt: Date.now(), values });
}
function queuePersistentSnapshot() {
  clearTimeout(persistenceTimer);
  persistenceTimer = setTimeout(() => { writePersistentSnapshot(); }, 180);
}
const saveStored = (key, value) => {
  try { localStorage.setItem(key, JSON.stringify(value)); queuePersistentSnapshot(); } catch { /* private mode can deny storage */ }
};
async function restorePersistentSnapshot() {
  const snapshot = await oneBoxDbGet('snapshot', 'app');
  if (!snapshot?.values) return false;
  let restored = false;
  Object.entries(snapshot.values).forEach(([key, value]) => {
    if (localStorage.getItem(key) === null) {
      try { localStorage.setItem(key, value); restored = true; } catch { /* private mode can deny storage */ }
    }
  });
  return restored;
}
const escapeHtml = (value = '') => String(value).replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
const dateKey = (date) => {
  const value = new Date(date);
  return String(value.getFullYear()) + '-' + pad(value.getMonth() + 1) + '-' + pad(value.getDate());
};
const dateFromKey = (key) => new Date(String(key) + 'T12:00:00');
const localDateTimeValue = (date) => { const value = new Date(date); return dateKey(value) + 'T' + pad(value.getHours()) + ':' + pad(value.getMinutes()) + ':' + pad(value.getSeconds()); };
const sleep = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));
const toast = (message, kind = 'info') => {
  let node = $('#toast');
  if (!node) {
    node = document.createElement('div');
    node.id = 'toast';
    node.setAttribute('role', 'status');
    document.body.append(node);
  }
  node.textContent = message;
  node.dataset.kind = kind;
  node.classList.add('visible');
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => node.classList.remove('visible'), 2800);
};

const DICT = {
  zh: {
    calculator: '计算', calendar: '日历', weather: '天气', convert: '转换', unitConvert: '换算', translate: '翻译', translateConvert: '转换', reader: '阅读',
    online: '在线', offline: '离线', install: '安装应用', settings: '设置', notifications: '消息提示',
    heroSubtitle: '快速、清爽、可离线。你的数据优先保存在当前设备。',
    calculatorDesc: '支持括号、百分比、科学函数和键盘输入，并自动保留最近计算记录。',
    calendarDesc: '公历、农历、节气、节假日、补班和个人日程集中查看。',
    weatherDesc: '搜索区县，查看实时、小时级和未来 15 天天气趋势。',
    convertDesc: '常用单位换算',
    translateDesc: '快速翻译，结果保存在本机',
    recentCalculations: '最近计算', clear: '清除', ready: '完成的计算会显示在这里。',
    scientific: '科学计算', collapse: '收起', expand: '展开', degree: '度', radian: '弧度',
    keyboard: '键盘：数字、+ − × ÷、括号、Enter 等号、Esc 清空',
    today: '今天', off: '休', work: '补班', normalCalendar: '工作日历',
    legalHoliday: '法定休息', makeUpWorkday: '补班', solarTerm: '节气', selectedDay: '选中日期',
    noAgenda: '这一天还没有安排。', agenda: '日程', addAgenda: '新增日程', newReminder: '新增日程', eventContent: '日程内容', eventPlaceholder: '请输入你的日程信息', addEvent: '添加日程', addToDay: '添加日程', eventDate: '日期', eventTime: '时间', eventDateTime: '选择提醒时间', reminderSchedule: '提醒日程', eventRepeat: '重复方式',
    noteOptional: '备注（可选）', weatherSearch: '搜索', currentLocation: '当前位置',
    refresh: '刷新', searchPlace: '搜索城市或区县',
    noWeather: '天气需要联网，搜索一个城市或区县开始。', weatherLoading: '正在获取天气…',
    weatherData: '数据来自 Open-Meteo，最近更新 {time}，离线可查看。',
    sortWeather: '', hourly: '24 小时', daily: '前 3 天 · 今天 · 未来 15 天', advice: '天气建议',
    commute: '出行', sport: '运动', clothing: '穿衣', sunscreen: '防晒', hiking: '爬山', windAdvice: '风力建议', windLevel: '风力', elevation: '海拔',
    addCard: '添加', noResults: '没有找到匹配地点，请换个关键词。',
    home: '首页', tools: '工具', navigation: '导航', messages: '消息', mine: '我的', quickTools: '常用工具', openSettings: '打开设置', noMessages: '还没有消息。', homeTabs: '首页', homeTabsSelected: '已选择 {count} 项', homeSourceManage: '首页来源', homeSourceManageHint: '选择要显示在首页导航中的来源', homeSourceAdd: '添加', homeSourceRemove: '移除', homeSourceEmpty: '暂时没有其他来源',
    navigationTitle: '网站导航', navigationHint: '点击卡片显示操作，长按可以拖动排序或聚合文件夹。', navigationToolbarHint: '长按编辑 · 拖动聚合', navigationAdd: '添加网站', navigationEmpty: '还没有网站，先添加一个常用网址吧。', navigationUrl: '网站地址', navigationUrlPlaceholder: '粘贴或输入网址', navigationName: '网站名称', navigationNamePlaceholder: '可选，默认使用网站名称', navigationIcon: '网站图标', navigationIconHint: '输入网址后自动获取', navigationSave: '保存网站', navigationEdit: '编辑网站', navigationEditSave: '保存修改', navigationActionEdit: '编辑', navigationActionDelete: '删除', navigationActionCancel: '取消', navigationFolderEdit: '编辑文件夹', navigationAddToFolder: '添加到文件夹', navigationFolder: '文件夹', navigationFolderName: '文件夹名称', navigationFolderPlaceholder: '例如：工作、阅读', navigationCreateFolder: '新建文件夹', navigationSaveFolder: '保存文件夹', navigationFolderAdd: '添加网站', navigationFolderDelete: '解散文件夹', navigationFolderDeleteConfirm: '解散文件夹后，里面的网站会保留在导航中，确定解散文件夹吗？', navigationFolderDissolved: '文件夹已解散', navigationFolderEmpty: '文件夹还是空的，添加几个网站吧。', navigationRemove: '删除', navigationOpen: '打开网站', navigationSettings: '导航设置', navigationOpenModeHint: '网站打开方式', navigationOpenModeCurrent: '当前页', navigationOpenModeNewTab: '新标签页', navigationAlreadyExists: '这个网站已经添加过了', navigationInvalidUrl: '请输入有效的 http 或 https 地址', navigationDropHint: '松开后聚合为文件夹', navigationFolderCreated: '文件夹已创建', navigationAdded: '网站已添加', navigationDeleted: '网站已删除', navigationMoved: '网站已移入文件夹', navigationOrderSaved: '导航顺序已保存', navigationSiteCount: '{count} 个网站',
    allFeeds: '全部', feedRefresh: '刷新', feedLoading: '正在加载信息流…', feedEmpty: '暂时没有可显示的内容。', feedUpdated: '更新于', feedOpen: '打开原文', feedPartial: '部分订阅源暂时不可用', feedProxyHint: '内容来自公开 RSS 订阅，首页只保留最近内容。', feedTabPrevious: '查看前面的首页 Tab', feedTabNext: '查看后面的首页 Tab',
    converterType: '换算类型', from: '从', to: '到', result: '结果', swap: '交换单位', copyResult: '复制结果',
    copied: '已复制', translationInput: '输入待翻译内容', translateNow: '开始翻译', saveTranslation: '保存到本机',
    source: '源语言', target: '目标语言', translationResult: '翻译结果', translationHistory: '最近翻译',
    noTranslation: '翻译结果会显示在这里。', noHistory: '还没有保存翻译。',
    githubSync: 'GitHub 云同步', githubDescription: 'GitHub 保存设置、工具配置，同步只使用你自己的私有 Gist，OneBox 不会获取你的 GitHub 密码。', githubNotConnectedHint: '填写 Client ID 后连接 GitHub。',
    githubClientId: 'GitHub OAuth Client ID', githubClientHint: '首次使用请打开 GitHub 头像 → Settings → Developer settings → OAuth Apps，选择你的应用，勾选 Enable Device Flow 并点击 Update application；然后复制 Client ID 粘贴到这里。', githubDeveloperSettings: '打开 OAuth Apps 设置',
    githubBrowserFlowError: '当前网页无法直接读取 GitHub Device Flow，通常不是 Client ID 格式问题。请先确认已开启 Enable Device Flow，也可以使用下方访问令牌方式。', githubAccessToken: 'GitHub 访问令牌', githubTokenHint: '仅将令牌保存在当前设备，并通过 GitHub API 验证；建议使用只包含 gist 权限的令牌。', githubUseToken: '使用访问令牌连接', githubTokenMissing: '请先填写 GitHub 访问令牌。', githubTokenInvalid: '访问令牌无效或没有可用权限。', githubTokenConnected: 'GitHub 已连接',
    githubLogin: '连接 GitHub', githubLogout: '退出 GitHub', upload: '上传到 GitHub', download: '从 GitHub 恢复',
    githubConnected: '已连接', githubNotConnected: '尚未连接', openDevice: '打开验证页面',
    appUpdate: '应用更新', checkUpdate: '更新', updateAvailable: '发现有新版本', upToDate: '已是最新版', updating: '检查中', updateApplying: '更新中', updateCheckFailed: '检查失败，可重试', applyUpdate: '更新',
    notificationsPermission: '消息通知', enableNotifications: '允许通知', disableNotifications: '不允许通知', notificationDescription: 'iPhone 需要先将 OneBox 添加到主屏幕并允许消息通知；应用关闭后的后台提醒仍需要 Push 服务端。',
    userAgreement: '用户协议', viewAgreement: '查看协议', agreementTitle: 'OneBox 用户协议', agreementIntro: 'OneBox 是一款本地优先的日常工具应用，主要功能在当前设备上运行。', agreementLocal: '本地数据：计算历史、日程、天气卡片、翻译历史、通知记录、阅读书架、阅读进度和笔记等，默认保存在当前设备。你可以在应用内删除对应记录或文档。', agreementNetwork: '网络服务：首页订阅源、天气和翻译会请求对应的第三方或开源服务；首页文章来自公开订阅源，内容、时效和可用性由来源网站决定。点击文章会打开来源网站，OneBox 不控制第三方页面的登录、广告或隐私规则。', agreementGithub: 'GitHub 云同步：只有在你主动配置 OAuth Client ID 并连接 GitHub 后才会启用。同步内容写入你自己的私有 Gist，访问令牌保存在当前设备；你可以随时退出连接或删除该 Gist。', agreementPermissions: '权限说明：定位仅用于查找当前位置天气；通知仅用于提醒日程和消息；文件选择仅用于导入本地阅读文档。未授权时，相应功能不会正常工作，但不影响其他功能。', agreementDisclaimer: '使用提示：天气、翻译、订阅源和第三方网页可能因网络、服务策略或接口变化而暂时不可用。请不要在同步数据、日程或笔记中保存不适合上传到个人 GitHub Gist 的敏感信息。', agreementUpdated: '最后更新',
    addReminder: '添加提醒', reminderText: '提醒内容', remindAt: '提醒时间', noNotifications: '还没有提醒。', once: '指定时间', everyDay: '每天', workdays: '工作日', restdays: '非工作日', weekly: '每周', weekdays: '重复星期',
    markRead: '全部已读', close: '关闭', system: '跟随系统', light: '浅色', dark: '深色', darkGray: '黑灰',
    layout: '布局', classicLayout: '经典布局', simpleLayout: '简约布局', navigationLocation: '导航位置', navigationLocationMain: '主导航', navigationLocationTools: '工具 Tab', openMode: '打开方式', openCurrent: '当前页打开', openNewTab: '新标签页打开', language: '语言', theme: '主题', color: '颜色', blackWhite: '黑白配', noblePurple: '贵族紫', skyBlue: '天空蓝', notBananaGreen: '不蕉绿', meituanYellow: '美团黄', topDisplay: '顶部显示', footprint: '足迹', showFootprint: '在首页显示', hideFootprint: '不在首页显示', mascot: '宠物', showMascot: '显示宠物', hideMascot: '隐藏宠物', reorderHint: '长按工具标签可以调整顺序',
    languagePending: '日语、韩语语言包已预留，当前版本先提供中文和英文。',
    bookshelf: '书架', addBook: '添加文档', noBooks: '还没有本地文档。', readerHint: '支持 Markdown、TXT、PDF、EPUB；文档仅保存在当前设备。', openBook: '打开阅读', deleteBook: '删除文档', annotations: '笔记', readerComments: '笔记', readerNotesHint: '已保存的阅读笔记', addAnnotation: '笔记', annotationPlaceholder: '添加你的感受…', saveAnnotation: '保存', annotationHint: '选择文字后长按或点击笔记按钮。', noAnnotations: '还没有笔记。', reading: '正在阅读', closeReader: '关闭阅读', unsupportedFile: '请选择 .md、.markdown、.txt、.pdf 或 .epub 文件。', importFailed: '文档读取失败，请重试。', deleteConfirm: '确定删除这本文档吗？', pdfHint: 'PDF 使用浏览器原生阅读器打开。', epubHint: 'EPUB 已转换为适合 OneBox 的阅读视图。', readerContents: '目录', readerSettings: '阅读设置', readerReadingMethod: '阅读方式', readerTheme: '阅读背景', readerThemePaper: '纸张', readerThemeSepia: '墨水屏', readerThemeGreen: '护眼绿', readerThemeDark: '夜间', readerFontSize: '字号', readerFontFamily: '字体', readerLineHeight: '行距', readerParagraphSpacing: '段落间距', readerLetterSpacing: '字间距', readerAnimation: '翻页动画', readerAnimationSlide: '滑动', readerAnimationCover: '覆盖', readerAnimationNone: '无', readerScroll: '上下滚动', readerPages: '模拟翻页', readerProgress: '进度', readerFullscreen: '全屏', readerExitFullscreen: '退出全屏', readerFullscreenOnOpen: '是否全屏', readerFullscreenOnOpenHint: '下次打开文档时按此设置进入', readerNoContents: '暂无章节目录。', readerSettingsHint: '设置仅作用于当前设备上的阅读内容。', readerTocHint: '选择章节后跳转到对应位置。',
  },
  en: {
    calculator: 'Calculator', calendar: 'Calendar', weather: 'Weather', convert: 'Convert', unitConvert: 'Convert', translate: 'Translate', translateConvert: 'Convert', reader: 'Reader',
    online: 'Online', offline: 'Offline', install: 'Install', settings: 'Settings', notifications: 'Notifications',
    heroSubtitle: 'Fast, calm and offline-ready. Your data stays on this device first.',
    calculatorDesc: 'Parentheses, percentages, scientific functions, keyboard input and history.',
    calendarDesc: 'Gregorian, lunar, solar terms, holidays, make-up workdays and personal events.',
    weatherDesc: 'Search cities and districts for current, hourly and 15-day forecasts.',
    convertDesc: 'Common unit conversion',
    translateDesc: 'Fast translation, saved locally',
    recentCalculations: 'Recent calculations', clear: 'Clear', ready: 'Completed calculations appear here.',
    scientific: 'Scientific', collapse: 'Hide', expand: 'Show', degree: 'DEG', radian: 'RAD',
    keyboard: 'Keyboard: numbers, + − × ÷, parentheses, Enter and Escape',
    today: 'Today', off: 'Off', work: 'Make-up workday', normalCalendar: 'Work calendar',
    legalHoliday: 'Public holiday', makeUpWorkday: 'Make-up workday', solarTerm: 'Solar term', selectedDay: 'Selected day',
    noAgenda: 'Nothing planned for this day.', agenda: 'Events', addAgenda: 'New event', newReminder: 'New reminder', eventContent: 'Event details', eventPlaceholder: 'Enter your event details', addEvent: 'Add event', addToDay: 'Add event', eventDate: 'Date', eventTime: 'Time', eventDateTime: 'Date and time', reminderSchedule: 'Reminder time', eventRepeat: 'Repeat',
    noteOptional: 'Note (optional)', weatherSearch: 'Search', currentLocation: 'Current location',
    refresh: 'Refresh', searchPlace: 'Search city or district',
    noWeather: 'Search a city or district to get weather.', weatherLoading: 'Loading weather…',
    weatherData: 'Weather data from Open-Meteo · updated {time} · saved locally for offline viewing.',
    sortWeather: '', hourly: '24 hours', daily: '3 days before · today · next 15 days', advice: 'Advice',
    commute: 'Travel', sport: 'Sport', clothing: 'Clothing', sunscreen: 'Sun care', hiking: 'Hiking', windAdvice: 'Wind advice', windLevel: 'Wind', elevation: 'Elevation',
    addCard: 'Add', noResults: 'No matching place. Try another query.',
    home: 'Home', tools: 'Tools', navigation: 'Navigation', messages: 'Messages', mine: 'Me', quickTools: 'Quick tools', openSettings: 'Open settings', noMessages: 'No messages yet.', homeTabs: 'Home', homeTabsSelected: '{count} selected',
    navigationTitle: 'Web navigation', navigationHint: 'Tap a card for actions; long-press to reorder or create a folder.', navigationToolbarHint: 'Long-press to edit · drag to group', navigationAdd: 'Add website', navigationEmpty: 'No websites yet. Add a favorite site to get started.', navigationUrl: 'Website URL', navigationUrlPlaceholder: 'https://example.com', navigationName: 'Website name', navigationNamePlaceholder: 'Optional; defaults to the site name', navigationIcon: 'Website icon', navigationIconHint: 'Fetched automatically from the URL', navigationSave: 'Save website', navigationAddToFolder: 'Add to folder', navigationEdit: 'Edit website', navigationEditSave: 'Save changes', navigationActionEdit: 'Edit', navigationActionDelete: 'Delete', navigationActionCancel: 'Cancel', navigationFolderEdit: 'Edit folder', navigationFolder: 'Folder', navigationFolderName: 'Folder name', navigationFolderPlaceholder: 'For example: Work, Reading', navigationCreateFolder: 'New folder', navigationSaveFolder: 'Save folder', navigationFolderAdd: 'Add website', navigationFolderDelete: 'Dissolve folder', navigationFolderDeleteConfirm: 'Dissolving the folder will keep its websites in navigation. Continue?', navigationFolderDissolved: 'Folder dissolved', navigationFolderEmpty: 'This folder is empty. Add some websites.', navigationRemove: 'Delete', navigationOpen: 'Open website', navigationSettings: 'Navigation settings', navigationOpenModeHint: 'Open websites in', navigationOpenModeCurrent: 'Current page', navigationOpenModeNewTab: 'New tab', navigationAlreadyExists: 'This website has already been added', navigationInvalidUrl: 'Enter a valid http or https URL', navigationDropHint: 'Release to create a folder', navigationFolderCreated: 'Folder created', navigationAdded: 'Website added', navigationDeleted: 'Website deleted', navigationMoved: 'Website moved into folder', navigationOrderSaved: 'Navigation order saved', navigationSiteCount: '{count} sites',
    allFeeds: 'All', feedRefresh: 'Refresh', feedLoading: 'Loading feeds…', feedEmpty: 'No items to show yet.', feedUpdated: 'Updated', feedOpen: 'Open original', feedPartial: 'Some feeds are temporarily unavailable', feedProxyHint: 'Public RSS subscriptions; only recent items are kept on this device.', feedTabPrevious: 'Show previous home tabs', feedTabNext: 'Show more home tabs',
    converterType: 'Conversion', from: 'From', to: 'To', result: 'Result', swap: 'Swap units', copyResult: 'Copy result',
    copied: 'Copied', translationInput: 'Text to translate', translateNow: 'Translate', saveTranslation: 'Save locally',
    source: 'Source', target: 'Target', translationResult: 'Translation', translationHistory: 'Recent translations',
    noTranslation: 'Your translation will appear here.', noHistory: 'No saved translations yet.',
    githubSync: 'GitHub cloud sync', githubDescription: 'GitHub saves settings and tool configuration in your private Gist. OneBox never receives your GitHub password.', githubNotConnectedHint: 'Enter a Client ID to connect GitHub.',
    githubClientId: 'GitHub OAuth Client ID', githubClientHint: 'For first-time setup, open GitHub avatar → Settings → Developer settings → OAuth Apps, select your app, enable Enable Device Flow, click Update application, then paste the Client ID here.', githubDeveloperSettings: 'Open OAuth Apps settings',
    githubBrowserFlowError: 'This web page cannot read GitHub Device Flow directly. This is usually not a Client ID format problem. Confirm Enable Device Flow is on, or use the access-token fallback below.', githubAccessToken: 'GitHub access token', githubTokenHint: 'The token is stored only on this device and verified through GitHub API. A token with gist permission is recommended.', githubUseToken: 'Connect with access token', githubTokenMissing: 'Enter a GitHub access token first.', githubTokenInvalid: 'The access token is invalid or lacks the required permission.', githubTokenConnected: 'GitHub connected',
    githubLogin: 'Connect GitHub', githubLogout: 'Disconnect GitHub', upload: 'Upload to GitHub', download: 'Restore from GitHub',
    githubConnected: 'Connected', githubNotConnected: 'Not connected', openDevice: 'Open verification page',
    appUpdate: 'App update', checkUpdate: 'Update', updateAvailable: 'A new version is available', upToDate: 'Latest version', updating: 'Checking', updateApplying: 'Updating', updateCheckFailed: 'Check failed. Try again.', applyUpdate: 'Update',
    notificationsPermission: 'Message notifications', enableNotifications: 'Allow notifications', disableNotifications: 'Do not allow notifications', notificationDescription: 'On iPhone, add OneBox to the Home Screen and allow notifications first; background alerts after the app is closed still require a Push server.',
    userAgreement: 'User agreement', viewAgreement: 'View agreement', agreementTitle: 'OneBox user agreement', agreementIntro: 'OneBox is a local-first daily tools app. Most features run on this device.', agreementLocal: 'Local data: calculator history, events, weather cards, translation history, notifications, the reading shelf, reading progress and notes stay on this device by default. You can delete the related records or documents in the app.', agreementNetwork: 'Network services: Home subscriptions, weather and translation may request third-party or open-source services. Home articles come from public feeds; their freshness and availability depend on the source site. Opening an article takes you to that site, whose login, advertising and privacy rules are outside OneBox.', agreementGithub: 'GitHub cloud sync: it is enabled only after you configure an OAuth Client ID and connect GitHub. Synced data is written to your own private Gist, while the access token stays on this device. You can disconnect at any time or delete the Gist.', agreementPermissions: 'Permissions: location is used only to find weather for your current place; notifications are used for event and message reminders; file access is used to import local reading documents. Other features remain available when these permissions are denied.', agreementDisclaimer: 'Use note: weather, translation, feeds and third-party pages may be temporarily unavailable because of network conditions, service policies or API changes. Do not put sensitive information that should not be uploaded to a personal GitHub Gist into synced settings, events or notes.', agreementUpdated: 'Last updated',
    addReminder: 'Add reminder', reminderText: 'Reminder', remindAt: 'When', noNotifications: 'No reminders yet.', once: 'Once', everyDay: 'Every day', workdays: 'Workdays', restdays: 'Rest days', weekly: 'Weekly', weekdays: 'Weekdays',
    markRead: 'Mark all read', close: 'Close', system: 'System', light: 'Light', dark: 'Dark', darkGray: 'Black gray',
    layout: 'Layout', classicLayout: 'Classic layout', simpleLayout: 'Simple layout', openMode: 'Open links', openCurrent: 'Current page', openNewTab: 'New tab', theme: 'Theme', language: 'Language', color: 'Color', blackWhite: 'Black and white', noblePurple: 'Noble purple', skyBlue: 'Sky blue', notBananaGreen: 'WeChat green', meituanYellow: 'Meituan yellow', topDisplay: 'Show at top', footprint: 'Footprints', showFootprint: 'Show on Home', hideFootprint: 'Hide from Home', mascot: 'Pet', showMascot: 'Show pet', hideMascot: 'Hide pet', homeSourceManage: 'Home sources', homeSourceManageHint: 'Choose sources to show in the home navigation', homeSourceAdd: 'Add', homeSourceRemove: 'Remove', homeSourceEmpty: 'No other sources available', reorderHint: 'Long-press a tool tab to reorder',
    navigationLocation: 'Navigation location', navigationLocationMain: 'Main navigation', navigationLocationTools: 'Tool tabs',
    languagePending: 'Japanese and Korean are reserved for a future language pack. Chinese and English are available now.',
    bookshelf: 'Bookshelf', addBook: 'Add document', noBooks: 'No local documents yet.', readerHint: 'Supports Markdown, TXT, PDF and EPUB. Files stay on this device.', openBook: 'Open', deleteBook: 'Delete', annotations: 'Notes', readerComments: 'Notes', readerNotesHint: 'Saved reading notes', addAnnotation: 'Note', annotationPlaceholder: 'Add your thoughts…', saveAnnotation: 'Save', annotationHint: 'Select text, long-press or use the notes button.', noAnnotations: 'No notes yet.', reading: 'Reading', closeReader: 'Close reader', unsupportedFile: 'Choose a .md, .markdown, .txt, .pdf or .epub file.', importFailed: 'Could not read this document.', deleteConfirm: 'Delete this document?', pdfHint: 'PDF opens in the browser native reader.', epubHint: 'EPUB is converted into an adaptive OneBox reading view.', readerContents: 'Contents', readerSettings: 'Reading settings', readerReadingMethod: 'Reading mode', readerTheme: 'Reading background', readerThemePaper: 'Paper', readerThemeSepia: 'E-ink', readerThemeGreen: 'Green', readerThemeDark: 'Night', readerFontSize: 'Font size', readerFontFamily: 'Font', readerLineHeight: 'Line height', readerParagraphSpacing: 'Paragraph spacing', readerLetterSpacing: 'Letter spacing', readerAnimation: 'Page animation', readerAnimationSlide: 'Slide', readerAnimationCover: 'Cover', readerAnimationNone: 'None', readerScroll: 'Vertical scroll', readerPages: 'Page turn', readerProgress: 'Progress', readerFullscreen: 'Fullscreen', readerExitFullscreen: 'Exit fullscreen', readerFullscreenOnOpen: 'Open in fullscreen', readerFullscreenOnOpenHint: 'Apply this choice the next time a document opens', readerNoContents: 'No chapter contents.', readerSettingsHint: 'These settings apply only to reading on this device.', readerTocHint: 'Choose a chapter to jump to it.',
  },
};
const t = (key) => DICT[state.language]?.[key] || DICT.zh[key] || key;
DICT.zh.readerHint = '支持 md、txt、pdf、epub本地阅读';
DICT.en.readerHint = 'Read md, txt, pdf and epub files locally.';
const toolName = (id) => t(TOOL_DEFS[id]?.key || id);
const storedTheme = localStorage.getItem(STORAGE.theme);
const storedLanguage = localStorage.getItem(STORAGE.language) || 'system';
const storedLayout = localStorage.getItem(STORAGE.layout);
const storedColor = localStorage.getItem(STORAGE.color);
const storedColorExplicit = localStorage.getItem(STORAGE.colorExplicit) === 'true';
const resolveLanguageMode = (mode) => mode === 'en' || mode === 'zh' ? mode : ((navigator.language || '').toLowerCase().startsWith('en') ? 'en' : 'zh');
const storedCalculator = parseStored(STORAGE.calculator, { expr: '', history: [], historyOpen: false });
const storedTranslationHistoryOpen = parseStored(STORAGE.translationHistoryOpen, false) === true;
const storedLibrary = parseStored(STORAGE.library, []);
const storedReaderPreferences = parseStored(STORAGE.readerPreferences, {}) || {};
const storedReaderLayout = localStorage.getItem(STORAGE.readerLayout) || 'grid';
const storedHomeFeeds = parseStored(STORAGE.homeFeeds, {}) || {};
const storedHomeFeedRead = parseStored(STORAGE.homeFeedRead, {}) || {};
const storedHomeFeedOrder = parseStored(STORAGE.homeFeedOrder, DEFAULT_HOME_FEED_ORDER);
const storedHomeFeedVisibility = parseStored(STORAGE.homeFeedVisibility, null);
const storedNavigation = parseStored(STORAGE.navigation, null);
const storedNavigationLocation = localStorage.getItem(STORAGE.navigationLocation) === 'tools' ? 'tools' : 'main';
const storedNotificationPreference = parseStored(STORAGE.notificationPreference, 'allow');
const storedTopDisplay = parseStored(STORAGE.topDisplay, {}) || {};
const storedFootprint = parseStored(STORAGE.footprint, false) === true;
const storedOpenMode = localStorage.getItem(STORAGE.openMode) || 'current';
const storedMascotVisible = localStorage.getItem(STORAGE.mascotVisible) !== 'false';
const rawWeatherCards = parseStored(STORAGE.weatherCards, []);
const legacyWeather = parseStored(STORAGE.legacyWeather, null);
const normalizeToolOrder = (value, includeNavigation = false, navigationFirst = false) => {
  const allowed = includeNavigation ? Object.keys(TOOL_DEFS) : DEFAULT_TOOL_ORDER;
  const order = Array.isArray(value) ? value.map((id) => id === 'convert' ? 'translate' : id).filter((id) => allowed.includes(id)) : [];
  const normalized = [...new Set(order.concat(allowed))];
  if (includeNavigation && navigationFirst) return ['navigation', ...normalized.filter((id) => id !== 'navigation')].slice(0, allowed.length);
  return (includeNavigation ? normalized : normalized.filter((id) => id !== 'navigation')).slice(0, allowed.length);
};
const LEGACY_DEFAULT_HOME_FEED_VISIBLE = ['ithome', 'huxiu', 'zhihu', 'v2ex', 'weibo', 'bilibili'];
const normalizeHomeFeedOrder = (value) => {
  const order = Array.isArray(value) ? value.filter((id) => DEFAULT_HOME_FEED_ORDER.includes(id)) : [];
  return [...new Set(order.concat(DEFAULT_HOME_FEED_ORDER))].slice(0, DEFAULT_HOME_FEED_ORDER.length);
};
const normalizeHomeFeedVisibility = (value) => {
  const visible = Array.isArray(value) ? value : DEFAULT_HOME_FEED_VISIBLE;
  const normalized = [...new Set(visible.filter((id) => DEFAULT_HOME_FEED_ORDER.includes(id)))];
  const isLegacyDefault = normalized.length === LEGACY_DEFAULT_HOME_FEED_VISIBLE.length && LEGACY_DEFAULT_HOME_FEED_VISIBLE.every((id) => normalized.includes(id));
  if (isLegacyDefault) return [...DEFAULT_HOME_FEED_VISIBLE];
  return normalized;
};
function navigationSafeUrl(value) {
  try {
    const url = new URL(String(value || '').trim());
    return ['http:', 'https:'].includes(url.protocol) ? url.href : '';
  } catch { return ''; }
}
function navigationNameFromUrl(value) {
  try { return new URL(value).hostname.replace(/^www\./i, ''); } catch { return ''; }
}
function navigationUsesDesktopBrandIcon(value) {
  try { return /(^|\.)bilibili\.com$/i.test(new URL(value).hostname); } catch { return false; }
}
function navigationUsesOneBoxBrandIcon(value) {
  try {
    const url = new URL(value);
    return /(^|\.)awmix\.github\.io$/i.test(url.hostname) && /^\/onebox(?:\/|$)/i.test(url.pathname);
  } catch { return false; }
}
function navigationAppAssetUrl(path) {
  try { return new URL(path, document.baseURI).href; } catch { return path; }
}
function navigationAssetBases(value) {
  try {
    const parsed = new URL(value);
    const pathname = parsed.pathname || '/';
    const directory = pathname.endsWith('/') ? pathname : pathname.slice(0, pathname.lastIndexOf('/') + 1) || '/';
    return [...new Set([new URL(directory, parsed.origin).href, new URL('/', parsed.origin).href])];
  } catch { return []; }
}
function navigationIconSources(value) {
  const url = navigationSafeUrl(value);
  if (!url) return [];
  try {
    const parsed = new URL(url);
    const hostname = parsed.hostname;
    if (navigationUsesDesktopBrandIcon(url)) return [navigationAppAssetUrl('icons/bilibili.svg'), 'https://static.hdslb.com/images/favicon.ico', 'https://www.bilibili.com/favicon.ico'];
    if (navigationUsesOneBoxBrandIcon(url)) return [navigationAppAssetUrl('apple-touch-icon.png'), navigationAppAssetUrl('icons/icon-512.png'), navigationAppAssetUrl('icons/icon.svg')];
    const direct = navigationAssetBases(url).flatMap((base) => [
      new URL('apple-touch-icon.png', base).href,
      new URL('apple-touch-icon-dark.png', base).href,
      new URL('apple-touch-icon-precomposed.png', base).href,
      new URL('icons/icon-512.png', base).href,
      new URL('icons/icon-192.png', base).href,
      new URL('favicon-192x192.png', base).href,
      new URL('favicon-192.png', base).href,
      new URL('favicon-180x180.png', base).href,
      new URL('favicon-96x96.png', base).href,
      new URL('icons/favicon-light-64.png', base).href,
      new URL('icons/favicon-dark-64.png', base).href,
      new URL('favicon.png', base).href,
      new URL('favicon.ico', base).href,
      new URL('icons/icon.svg', base).href,
    ]);
    return [...new Set([
      ...direct,
      'https://icon.horse/icon/' + hostname,
      'https://icons.duckduckgo.com/ip3/' + hostname + '.ico',
      'https://www.google.com/s2/favicons?domain=' + encodeURIComponent(hostname) + '&sz=256'
    ])];
  } catch { return []; }
}
function navigationIconUrl(value) { return navigationIconSources(value)[0] || ''; }
function isNavigationIconServiceUrl(value) {
  try {
    const url = new URL(String(value || ''));
    return (url.hostname === 'www.google.com' && url.pathname === '/s2/favicons') || (url.hostname === 'icons.duckduckgo.com' && url.pathname.startsWith('/ip3/')) || (url.hostname === 'icon.horse' && url.pathname.startsWith('/icon/'));
  } catch { return false; }
}
function normalizeNavigation(value) {
  const rawItems = Array.isArray(value?.items) ? value.items : Array.isArray(value) ? value : [];
  const usedIds = new Set();
  const uniqueId = (candidate, prefix) => {
    let id = String(candidate || '').trim() || prefix + '-' + uid();
    while (usedIds.has(id)) id = prefix + '-' + uid();
    usedIds.add(id); return id;
  };
  const normalizeSite = (item) => {
    const url = navigationSafeUrl(item?.url);
    if (!url) return null;
    const icon = navigationIconUrl(url);
    return { id: uniqueId(item?.id, 'site'), type: 'site', name: String(item?.name || navigationNameFromUrl(url)).trim() || navigationNameFromUrl(url), url, icon, createdAt: Number(item?.createdAt) || Date.now() };
  };
  const items = rawItems.map((item) => {
    if (item?.type === 'folder') {
      const children = (Array.isArray(item.children) ? item.children : []).map(normalizeSite).filter(Boolean);
      return { id: uniqueId(item.id, 'folder'), type: 'folder', name: String(item.name || t?.('navigationFolder') || '文件夹').trim() || '文件夹', children, createdAt: Number(item.createdAt) || Date.now() };
    }
    return normalizeSite(item);
  }).filter(Boolean);
  return { version: 1, items };
}
function homeTabIsVisible(id) {
  return id === 'footprint' ? state?.footprint === true : state?.homeFeed?.visible?.includes(id) === true;
}
function homeTabEntries() {
  const sources = state?.homeFeed?.order?.map((id) => RSS_SOURCES.find((source) => source.id === id)).filter(Boolean) || RSS_SOURCES;
  return [...sources, { id: 'footprint', name: t('footprint'), badge: '足', className: 'footprint', local: true }];
}
function homeTabMarkMarkup(entry, extraClass = '') {
  if (entry.id === 'footprint') return '<span class="feed-source-mark footprint' + (extraClass ? ' ' + extraClass : '') + '"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="7" cy="7" r="2.2"/><circle cx="16.5" cy="8.5" r="2.2"/><circle cx="6" cy="16.5" r="2.2"/><circle cx="15.5" cy="18" r="2.2"/></svg></span>';
  return homeFeedSourceMarkMarkup(entry, extraClass);
}
function homeTabIds() {
  return [...homeFeedSources().map((source) => source.id), ...(state.footprint ? ['footprint'] : [])];
}
function homeFeedSourceMarkMarkup(source, extraClass = '') {
  return '<span class="feed-source-mark ' + escapeHtml(source.className) + (extraClass ? ' ' + extraClass : '') + '"><img src="' + escapeHtml(source.icon) + '" alt="" loading="eager" onerror="this.hidden=true;this.nextElementSibling.style.display=\'inline\'"><span class="feed-source-fallback">' + escapeHtml(source.badge) + '</span></span>';
}
const initialWeatherCards = (Array.isArray(rawWeatherCards) && rawWeatherCards.length ? rawWeatherCards : legacyWeather ? [legacyWeather] : []).map((item) => ({
  ...item,
  isCurrentLocation: Boolean(item.isCurrentLocation || item.name === '当前位置' || item.name === 'Current location'),
})).filter((item, index, cards) => !item.isCurrentLocation || cards.findIndex((candidate) => candidate.isCurrentLocation) === index);
const initialHash = location.hash.slice(1);
const initialToolHash = initialHash === 'navigation' && storedNavigationLocation === 'tools' ? 'navigation' : initialHash === 'convert' ? 'translate' : initialHash;
const initialTool = Object.keys(TOOL_DEFS).includes(initialToolHash) ? initialToolHash : 'calculator';
const initialSection = initialHash === 'navigation' && storedNavigationLocation === 'tools' ? 'tools' : ['home', 'navigation', 'messages', 'mine'].includes(initialHash) ? initialHash : Object.keys(TOOL_DEFS).includes(initialToolHash) ? 'tools' : 'home';
const normalizeReaderLibrary = (value) => {
  const books = Array.isArray(value) ? value.filter((book) => book && book.id && book.name) : [];
  const ordered = [...books].sort((a, b) => {
    const aOrder = Number(a.order); const bOrder = Number(b.order);
    if (Number.isFinite(aOrder) && Number.isFinite(bOrder) && aOrder !== bOrder) return bOrder - aOrder;
    if (Number.isFinite(aOrder) !== Number.isFinite(bOrder)) return Number.isFinite(aOrder) ? -1 : 1;
    return Number(b.lastOpenedAt || b.createdAt || 0) - Number(a.lastOpenedAt || a.createdAt || 0);
  });
  let nextOrder = ordered.reduce((max, book) => Math.max(max, Number(book.order) || 0), 0);
  return ordered.map((book, index) => ({ ...book, order: Number.isFinite(Number(book.order)) ? Number(book.order) : nextOrder + (ordered.length - index) }));
};
const state = {
  tool: initialTool,
  section: initialSection,
  theme: ['light', 'dark', 'dark-gray', 'system'].includes(storedTheme) ? storedTheme : 'system',
  color: ['mono', 'purple', 'blue', 'green', 'yellow'].includes(storedColor) && (storedColor !== 'mono' || storedColorExplicit) ? storedColor : 'purple',
  languageMode: ['zh', 'en', 'system'].includes(storedLanguage) ? storedLanguage : 'system',
  language: resolveLanguageMode(storedLanguage),
  layoutMode: storedLayout === 'classic' ? 'classic' : 'simple',
  toolOrder: normalizeToolOrder(parseStored(STORAGE.toolOrder, DEFAULT_TOOL_ORDER), storedNavigationLocation === 'tools', storedNavigationLocation === 'tools'),
  calcExpr: storedCalculator.expr || '', calcHistory: Array.isArray(storedCalculator.history) ? storedCalculator.history : [],
  calcJustEvaluated: false, calcInverse: false, calcHistoryOpen: storedCalculator.historyOpen === true, calcAngle: 'deg',
  month: new Date(today.getFullYear(), today.getMonth(), 1), selectedDate: dateKey(today),
  events: parseStored(STORAGE.events, {}) || {},
  weatherCards: initialWeatherCards.map((item) => ({ ...item, id: item.id || uid() })),
  activeWeatherId: initialWeatherCards[0]?.id || null, weatherLoading: false, weatherError: '', weatherRequest: 0, weatherSearchResults: [],
  lunarDialogDate: null, lastCalendarTap: { key: '', at: 0 },
  translation: { source: 'auto', target: 'zh', input: '', result: '', loading: false, error: '' },
  translationHistory: parseStored(STORAGE.translationHistory, []),
  translationHistoryOpen: storedTranslationHistoryOpen,
  library: normalizeReaderLibrary(storedLibrary),
  readerBookId: null, readerUrl: '', readerAssetUrls: [], readerContent: '', readerHint: '', readerToc: [], readerDialog: '', readerChromeHidden: false, readerImmersive: false, readerMode: 'library', readerReadingMode: 'scroll', readerPage: 0, readerSelectedText: '', readerSelection: null, readerAnnotationDraft: null, readerSelectionInput: 'mouse', readerLayout: storedReaderLayout === 'list' ? 'list' : 'grid', annotationBookId: null,
  readerPreferences: { theme: ['paper', 'sepia', 'green', 'dark'].includes(storedReaderPreferences.theme) ? storedReaderPreferences.theme : 'paper', fontSize: Number.isFinite(Number(storedReaderPreferences.fontSize)) ? Math.min(26, Math.max(15, Number(storedReaderPreferences.fontSize))) : 18, fontFamily: ['system', 'serif', 'mono'].includes(storedReaderPreferences.fontFamily) ? storedReaderPreferences.fontFamily : 'system', lineHeight: Number.isFinite(Number(storedReaderPreferences.lineHeight)) ? Math.min(2.2, Math.max(1.35, Number(storedReaderPreferences.lineHeight))) : 1.8, paragraphSpacing: Number.isFinite(Number(storedReaderPreferences.paragraphSpacing)) ? Math.min(28, Math.max(6, Number(storedReaderPreferences.paragraphSpacing))) : 14, letterSpacing: Number.isFinite(Number(storedReaderPreferences.letterSpacing)) ? Math.min(2, Math.max(0, Number(storedReaderPreferences.letterSpacing))) : 0, pageAnimation: ['slide', 'none'].includes(storedReaderPreferences.pageAnimation) ? storedReaderPreferences.pageAnimation : 'slide', readingMode: storedReaderPreferences.readingMode === 'pages' ? 'pages' : 'scroll', fullscreenOnOpen: storedReaderPreferences.fullscreenOnOpen === true },
  homeFeed: { active: DEFAULT_HOME_FEED_VISIBLE[0] || DEFAULT_HOME_FEED_ORDER[0], order: normalizeHomeFeedOrder(storedHomeFeedOrder), visible: normalizeHomeFeedVisibility(storedHomeFeedVisibility), hasNew: false, loading: false, errors: {}, stale: {}, updatedAt: Number(storedHomeFeeds.updatedAt || 0), cacheVersion: storedHomeFeeds.cacheVersion || '', sources: storedHomeFeeds.sources && typeof storedHomeFeeds.sources === 'object' ? storedHomeFeeds.sources : {} },
  navigation: normalizeNavigation(storedNavigation), navigationLocation: storedNavigationLocation, navigationDialog: null, navigationFolderDraft: null, navigationSettingsOpen: false,
  homeFeedRead: storedHomeFeedRead && typeof storedHomeFeedRead === 'object' ? storedHomeFeedRead : {},
  homeFeedRequest: 0,
  notifications: parseStored(STORAGE.notifications, []), notificationOpen: false, settingsOpen: false, githubDialogOpen: false, recentReadingOpen: false,
  notificationPreference: storedNotificationPreference === 'deny' ? 'deny' : 'allow',
  topDisplay: { theme: storedTopDisplay.theme !== false, language: storedTopDisplay.language !== false, messages: storedTopDisplay.messages !== false },
  footprint: storedFootprint,
  homeSourceDialogOpen: false,
  openMode: storedOpenMode === 'new-tab' ? 'new-tab' : 'current',
  mascotVisible: storedMascotVisible,
  swRegistration: null, updateAvailable: false, updateChecking: false, updateApplying: false, updateReloading: false, updateError: false,
  github: (() => { const value = parseStored(STORAGE.github, {}) || {}; return { clientId: value.clientId || '', token: value.token || '', user: value.user || null, gistId: value.gistId || '', deviceCode: '', userCode: '', verificationUri: '', expiresAt: 0, interval: 5, manualTokenOpen: false }; })(),
};
function formatNumber(value) {
  if (!Number.isFinite(value)) return '—';
  if (Math.abs(value) >= 1e12 || (Math.abs(value) > 0 && Math.abs(value) < 1e-8)) return value.toExponential(8).replace(/\.0+e/, 'e');
  return new Intl.NumberFormat(state.language === 'en' ? 'en-US' : 'zh-CN', { maximumFractionDigits: 10 }).format(value);
}
function formatDate(key, options = { month: 'long', day: 'numeric', weekday: 'long' }) {
  return new Intl.DateTimeFormat(state.language === 'en' ? 'en-US' : 'zh-CN', options).format(dateFromKey(key));
}
function themeIcon(resolved) {
  if (resolved === 'dark') return '<svg class="header-line-icon theme-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M20 15.5A8.5 8.5 0 0 1 8.5 4 8.5 8.5 0 1 0 20 15.5Z"/></svg>';
  return '<svg class="header-line-icon theme-icon" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="3.5"/><path d="M12 2.5v2M12 19.5v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2.5 12h2M19.5 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>';
}
function languageIcon() {
  return '<svg class="header-line-icon language-icon" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8.5"/><path d="M3.8 9h16.4M3.8 15h16.4M12 3.5c2.2 2.3 3.4 5.1 3.4 8.5S14.2 18.2 12 20.5C9.8 18.2 8.6 15.4 8.6 12S9.8 5.8 12 3.5Z"/></svg>';
}
function applyTheme() {
  const resolved = state.theme === 'dark-gray' ? 'dark' : state.theme === 'system' ? (window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light') : state.theme;
  document.documentElement.dataset.theme = resolved;
  document.documentElement.dataset.themeMode = state.theme;
  document.documentElement.dataset.color = state.color;
  document.documentElement.style.colorScheme = resolved;
  if (!isIosSafariReaderSurfaceActive()) {
    $$('meta[name="theme-color"]').forEach((meta) => { meta.content = resolved === 'dark' ? '#000000' : '#f3f5fa'; });
  }
  const appleStatusBar = $('meta[name="apple-mobile-web-app-status-bar-style"]');
  if (appleStatusBar) appleStatusBar.content = resolved === 'dark' ? 'black-translucent' : 'default';
  const button = $('#themeBtn');
  if (button) {
    button.innerHTML = themeIcon(resolved);
    button.setAttribute('aria-label', t('theme') + '：' + t(state.theme === 'dark-gray' ? 'darkGray' : state.theme));
    button.dataset.themeMode = state.theme;
    button.dataset.resolvedTheme = resolved;
  }
}
function renderHeaderControls() {
  const simple = state.layoutMode === 'simple';
  document.documentElement.classList.toggle('layout-simple', simple);
  document.documentElement.classList.toggle('layout-classic', !simple);
  const layoutNav = $('#layoutNav');
  if (layoutNav) layoutNav.hidden = !simple;
  const topDisplay = state.topDisplay || { theme: true, language: true, messages: true };
  const visibility = { notifyBtn: false, themeBtn: !simple && topDisplay.theme, languageBtn: !simple && topDisplay.language, settingsBtn: !simple };
  Object.entries(visibility).forEach(([id, visible]) => {
    const button = $('#' + id);
    if (button) button.hidden = !visible;
  });
  const languageButton = $('#languageBtn');
  if (languageButton) {
    languageButton.innerHTML = languageIcon();
    const languageLabel = state.languageMode === 'system' ? t('system') : state.languageMode === 'zh' ? '中文' : 'English';
    languageButton.setAttribute('aria-label', t('language') + '：' + languageLabel);
    languageButton.dataset.languageMode = state.languageMode;
  }
  const languageControl = $('#languageControl');
  const languagePicker = $('#languagePicker');
  if (languageControl) languageControl.hidden = true;
  if (languagePicker) languagePicker.value = state.languageMode;
  renderTopNav();
  refreshUpdateIndicator();
}
function applyLanguage() {
  state.language = resolveLanguageMode(state.languageMode);
  document.documentElement.lang = state.language === 'en' ? 'en' : 'zh-CN';
  document.title = state.language === 'en' ? 'OneBox · Daily Toolbox' : 'OneBox · 日常工具箱';
  const connectionStatus = $('#connectionStatus');
  if (connectionStatus) connectionStatus.textContent = navigator.onLine ? t('online') : t('offline');
  applyTheme();
  renderHeaderControls();
}
function saveThemeLanguage() { localStorage.setItem(STORAGE.theme, state.theme); localStorage.setItem(STORAGE.language, state.languageMode); queuePersistentSnapshot(); }
function saveColorPreference() { localStorage.setItem(STORAGE.color, state.color); localStorage.setItem(STORAGE.colorExplicit, 'true'); queuePersistentSnapshot(); }
function saveTopDisplay() { saveStored(STORAGE.topDisplay, state.topDisplay); }
function saveFootprintPreference() { saveStored(STORAGE.footprint, state.footprint); }
function saveMascotVisibility() { localStorage.setItem(STORAGE.mascotVisible, state.mascotVisible ? 'true' : 'false'); queuePersistentSnapshot(); }
function saveLayoutPreference() { localStorage.setItem(STORAGE.layout, state.layoutMode); queuePersistentSnapshot(); }
function cycleTheme() {
  state.theme = state.theme === 'system' ? 'light' : state.theme === 'light' ? 'dark' : state.theme === 'dark' ? 'dark-gray' : 'system';
  saveThemeLanguage(); applyTheme(); render();
}
function cycleLanguage() {
  state.languageMode = state.languageMode === 'system' ? 'zh' : state.languageMode === 'zh' ? 'en' : 'system';
  saveThemeLanguage(); applyLanguage(); renderNav(); render();
  if (state.settingsOpen) renderSettings();
}

function heading(title, subtitle, actions = '') {
  return actions ? '<div class="tool-head"><div class="tool-actions">' + actions + '</div></div>' : '';
}
const SECTION_DEFS = {
  home: { key: 'home', icon: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1V10Z"/></svg>', activeIcon: '<svg class="filled-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M3 10.2 12 3l9 7.2V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1V10.2Z"/></svg>' },
  tools: { key: 'tools', icon: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="4" width="6" height="6" rx="1"/><rect x="14" y="4" width="6" height="6" rx="1"/><rect x="4" y="14" width="6" height="6" rx="1"/><rect x="14" y="14" width="6" height="6" rx="1"/></svg>', activeIcon: '<svg class="filled-icon" viewBox="0 0 24 24" aria-hidden="true"><rect x="3.5" y="3.5" width="7" height="7" rx="1.5"/><rect x="13.5" y="3.5" width="7" height="7" rx="1.5"/><rect x="3.5" y="13.5" width="7" height="7" rx="1.5"/><rect x="13.5" y="13.5" width="7" height="7" rx="1.5"/></svg>' },
  navigation: { key: 'navigation', icon: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 4h14v16H5z"/><path d="M8 8h8M8 12h8M8 16h5"/></svg>', activeIcon: '<svg class="filled-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 3.5h14A1.5 1.5 0 0 1 20.5 5v14A1.5 1.5 0 0 1 19 20.5H5A1.5 1.5 0 0 1 3.5 19V5A1.5 1.5 0 0 1 5 3.5Zm3 3v2h8v-2H8Zm0 4v2h8v-2H8Zm0 4v2h5v-2H8Z"/></svg>' },
  messages: { key: 'messages', icon: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4"/></svg>', activeIcon: '<svg class="filled-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M18.3 9.4c0-3.7-2.4-6.2-6.3-6.2s-6.3 2.5-6.3 6.2c0 7-2.7 7.3-2.7 9.3 0 .6.4 1 1 1h16c.6 0 1-.4 1-1 0-2-2.7-2.3-2.7-9.3ZM9.6 21h4.8"/></svg>' },
  mine: { key: 'mine', icon: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8" r="3.5"/><path d="M5 20a7 7 0 0 1 14 0"/></svg>', activeIcon: '<svg class="filled-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3.6a4.2 4.2 0 1 1 0 8.4 4.2 4.2 0 0 1 0-8.4ZM4.1 20.4c.7-4.3 3.3-6.6 7.9-6.6s7.2 2.3 7.9 6.6H4.1Z"/></svg>' },
};
SECTION_DEFS.navigation.icon = '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8.5"/><path d="m15.5 8.5-2.1 5-4.9 2 2-4.9 5-2.1Z"/></svg>';
SECTION_DEFS.navigation.activeIcon = '<svg class="filled-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 12 2.5Zm4.55 6.32-2.19 5.47-5.36 2.2a.9.9 0 0 1-1.18-1.17l2.15-5.34 5.41-2.27a.9.9 0 0 1 1.17 1.11Z"/></svg>';
const sectionIcon = (item, active) => active ? item.activeIcon : item.icon;
function renderNav() {
  const includeNavigation = state.navigationLocation === 'tools';
  const normalizedOrder = normalizeToolOrder(state.toolOrder, includeNavigation);
  if (normalizedOrder.join('|') !== state.toolOrder.join('|')) { state.toolOrder = normalizedOrder; saveToolOrder(); }
  const toolIds = includeNavigation ? normalizedOrder : normalizedOrder.filter((id) => id !== 'navigation');
  const previousTabs = nav.querySelector('.tool-tabs');
  const previousScrollLeft = previousTabs?.scrollLeft || 0;
  const tabsMarkup = toolIds.map((id, index) => {
    const item = TOOL_DEFS[id];
    const active = id === 'navigation' ? state.section === 'tools' && state.tool === 'navigation' : state.section === 'tools' && state.tool === id;
    return '<button class="tab ' + (active ? 'active' : '') + '" draggable="true" data-tool="' + id + '" data-tool-index="' + index + '" aria-current="' + (active ? 'page' : 'false') + '"><span aria-hidden="true">' + item.icon + '</span>' + toolName(id) + '</button>';
  }).join('');
  nav.innerHTML = '<div class="tool-tab-panel"><button class="feed-source-scroll-button" data-tool-scroll="previous" type="button" hidden aria-label="' + escapeHtml(t('feedTabPrevious')) + '"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5.25 8.25 12 15 18.75"/></svg></button><div class="tool-tabs" data-tab-rail="tools" role="tablist" aria-label="' + escapeHtml(t('tools')) + '">' + tabsMarkup + '</div><button class="feed-source-scroll-button" data-tool-scroll="next" type="button" hidden aria-label="' + escapeHtml(t('feedTabNext')) + '"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 5.25 15.75 12 9 18.75"/></svg></button></div>';
  const nextTabs = nav.querySelector('.tool-tabs');
  if (nextTabs) {
    nextTabs.scrollLeft = Math.min(previousScrollLeft, Math.max(0, nextTabs.scrollWidth - nextTabs.clientWidth));
    nextTabs.addEventListener('scroll', updateToolTabOverflowControls, { passive: true });
    requestAnimationFrame(updateToolTabOverflowControls);
  }
  nav.title = t('reorderHint');
}
function focusActiveToolTab(smooth = false) {
  const tabs = nav.querySelector('.tool-tabs');
  const active = tabs?.querySelector('.tab.active');
  if (!tabs || !active || tabs.scrollWidth <= tabs.clientWidth + 1) return;
  const maxScroll = Math.max(0, tabs.scrollWidth - tabs.clientWidth);
  const padding = 8;
  const visibleLeft = tabs.scrollLeft + padding;
  const visibleRight = tabs.scrollLeft + tabs.clientWidth - padding;
  let target = tabs.scrollLeft;
  if (active.offsetLeft < visibleLeft) target = active.offsetLeft - padding;
  else if (active.offsetLeft + active.offsetWidth > visibleRight) target = active.offsetLeft + active.offsetWidth - tabs.clientWidth + padding;
  target = Math.min(maxScroll, Math.max(0, target));
  tabs.scrollTo({ left: target, behavior: smooth ? 'smooth' : 'auto' });
}
function updateToolTabOverflowControls() {
  const panel = nav.querySelector('.tool-tab-panel');
  const tabs = nav.querySelector('.tool-tabs');
  const previous = nav.querySelector('[data-tool-scroll="previous"]');
  const next = nav.querySelector('[data-tool-scroll="next"]');
  if (!panel || !tabs || !previous || !next) return;
  const maxScroll = Math.max(0, tabs.scrollWidth - tabs.clientWidth);
  const hasOverflow = maxScroll > 1;
  const hasPrevious = tabs.scrollLeft > 1;
  const hasNext = tabs.scrollLeft < maxScroll - 1;
  panel.classList.toggle('has-tool-overflow', hasOverflow);
  panel.classList.toggle('has-tool-overflow-left', hasPrevious);
  panel.classList.toggle('has-tool-overflow-right', hasNext);
  previous.hidden = !hasPrevious;
  next.hidden = !hasNext;
}
function scrollToolTabs(direction) {
  const tabs = nav.querySelector('.tool-tabs');
  if (!tabs) return;
  tabs.scrollBy({ left: direction * Math.max(120, Math.round(tabs.clientWidth * .72)), behavior: 'smooth' });
}
function mainSectionEntries() {
  return Object.values(SECTION_DEFS).filter((item) => item.key !== 'navigation' || state.navigationLocation === 'main');
}
function renderTopNav() {
  const layoutNav = $('#layoutNav');
  if (!layoutNav) return;
  const unread = state.notifications.filter((item) => !item.read).length;
  layoutNav.innerHTML = mainSectionEntries().map((item) => {
    const active = state.section === item.key;
    const homeUpdateDot = item.key === 'home' && state.homeFeed.hasNew ? '<i class="nav-update-dot" aria-label="' + (state.language === 'en' ? 'New updates' : '有新内容') + '"></i>' : '';
    return '<button class="layout-nav-button ' + (active ? 'active' : '') + '" data-section="' + item.key + '" aria-current="' + (active ? 'page' : 'false') + '" aria-label="' + t(item.key) + '" title="' + t(item.key) + '"><span class="layout-nav-icon" aria-hidden="true">' + sectionIcon(item, active) + homeUpdateDot + '</span>' + (item.key === 'messages' && unread ? '<sup>' + (unread > 99 ? '99+' : unread) + '</sup>' : '') + '</button>';
  }).join('');
}
function renderBottomNav() {
  const bottomNav = $('#bottomNav');
  if (!bottomNav) return;
  const classic = state.layoutMode === 'classic';
  const unread = state.notifications.filter((item) => !item.read).length;
  bottomNav.hidden = !classic;
  bottomNav.classList.toggle('auto-hide-enabled', classic);
  bottomNav.classList.toggle('navigation-in-tools', state.navigationLocation === 'tools');
  if (!classic) {
    bottomNav.classList.remove('is-blurred');
    $('main')?.classList.remove('bottom-nav-blurred');
  } else if (appScrollTop() <= 8) {
    bottomNav.classList.remove('is-blurred');
  }
  bottomNav.innerHTML = mainSectionEntries().map((item) => {
    const active = state.section === item.key;
    const homeUpdateDot = item.key === 'home' && state.homeFeed.hasNew ? '<i class="nav-update-dot" aria-label="' + (state.language === 'en' ? 'New updates' : '有新内容') + '"></i>' : '';
    return '<button class="bottom-tab ' + (active ? 'active' : '') + '" data-section="' + item.key + '" aria-current="' + (active ? 'page' : 'false') + '" aria-label="' + t(item.key) + '"><span class="bottom-tab-icon" aria-hidden="true">' + sectionIcon(item, active) + homeUpdateDot + '</span><span>' + t(item.key) + '</span>' + (item.key === 'messages' && unread ? '<sup>' + (unread > 99 ? '99+' : unread) + '</sup>' : '') + '</button>';
  }).join('');
  $('main')?.classList.toggle('bottom-nav-blurred', Boolean(classic && bottomNav.classList.contains('is-blurred')));
  renderTopNav();
}
function selectTool(id) {
  if (id === 'convert') id = 'translate';
  if (!TOOL_DEFS[id]) id = 'calculator';
  const revealActiveTab = () => requestAnimationFrame(() => { focusActiveToolTab(true); updateToolTabOverflowControls(); });
  if (id === 'navigation') {
    state.section = 'tools';
    state.tool = 'navigation';
    if (location.hash.slice(1) !== 'navigation') history.replaceState(null, '', '#navigation');
    renderNav(); renderBottomNav(); render();
    revealActiveTab();
    return;
  }
  state.section = 'tools';
  state.tool = id;
  if (location.hash.slice(1) !== id) history.replaceState(null, '', '#' + id);
  renderNav(); renderBottomNav(); render();
  revealActiveTab();
}
function selectSection(section) {
  if (!SECTION_DEFS[section]) section = 'tools';
  if (section === 'navigation' && state.navigationLocation === 'tools') return selectTool('navigation');
  const unchanged = state.section === section;
  state.section = section;
  if (section === 'home') state.homeFeed.hasNew = false;
  if (section === 'tools' && !TOOL_DEFS[state.tool]) state.tool = 'calculator';
  const route = section === 'tools' ? state.tool : section;
  if (location.hash.slice(1) !== route) history.replaceState(null, '', '#' + route);
  if (unchanged) { renderBottomNav(); return; }
  renderNav(); renderBottomNav(); render();
}
function saveToolOrder() { saveStored(STORAGE.toolOrder, state.toolOrder); }
function swapToolOrder(from, to) {
  if (from === to || from == null || to == null) return;
  [state.toolOrder[from], state.toolOrder[to]] = [state.toolOrder[to], state.toolOrder[from]];
  saveToolOrder(); renderNav();
  toast(state.language === 'en' ? 'Tool order saved' : '工具顺序已保存');
}
function homeFeedSources() {
  const visible = new Set(state.homeFeed.visible || DEFAULT_HOME_FEED_VISIBLE);
  return state.homeFeed.order.map((id) => RSS_SOURCES.find((source) => source.id === id)).filter((source) => source && visible.has(source.id));
}
function saveHomeFeedOrder() { saveStored(STORAGE.homeFeedOrder, state.homeFeed.order); }
function saveHomeFeedVisibility() { saveStored(STORAGE.homeFeedVisibility, state.homeFeed.visible); }
function swapHomeFeedSources(from, to) {
  if (from === to || from == null || to == null) return;
  [state.homeFeed.order[from], state.homeFeed.order[to]] = [state.homeFeed.order[to], state.homeFeed.order[from]];
  saveHomeFeedOrder(); render();
  toast(state.language === 'en' ? 'Feed order saved' : '订阅源顺序已保存');
}
function selectHomeFeedSource(sourceId) {
  if (!homeTabIds().includes(sourceId)) return;
  state.homeFeed.active = sourceId;
  if (state.section === 'home') {
    render();
    requestAnimationFrame(() => focusActiveHomeFeedTab(true));
  }
  if (sourceId !== 'footprint') return loadHomeFeeds(true, sourceId);
  return undefined;
}

function setHomeTabVisibility(tabId, visible) {
  if (!homeTabEntries().some((entry) => entry.id === tabId)) return;
  if (tabId === 'footprint') {
    state.footprint = visible;
    saveFootprintPreference();
  } else {
    const selected = new Set(state.homeFeed.visible);
    if (visible) selected.add(tabId); else selected.delete(tabId);
    state.homeFeed.visible = DEFAULT_HOME_FEED_ORDER.filter((id) => selected.has(id));
    saveHomeFeedVisibility();
  }
  if (!homeTabIds().includes(state.homeFeed.active)) state.homeFeed.active = homeTabIds()[0] || '';
  render();
  renderHomeSourceDialog();
  requestAnimationFrame(() => focusActiveHomeFeedTab(false));
  if (visible && tabId !== 'footprint') loadHomeFeeds(true, tabId);
}

function focusActiveHomeFeedTab(smooth = false) {
  const tabs = homeSourceNav.querySelector('.feed-source-tabs');
  const active = tabs?.querySelector('.feed-source-tab.active');
  if (!tabs || !active || tabs.scrollWidth <= tabs.clientWidth + 1) return;
  const maxScroll = Math.max(0, tabs.scrollWidth - tabs.clientWidth);
  const padding = 8;
  const visibleLeft = tabs.scrollLeft + padding;
  const visibleRight = tabs.scrollLeft + tabs.clientWidth - padding;
  let target = tabs.scrollLeft;
  if (active.offsetLeft < visibleLeft) target = active.offsetLeft - padding;
  else if (active.offsetLeft + active.offsetWidth > visibleRight) target = active.offsetLeft + active.offsetWidth - tabs.clientWidth + padding;
  target = Math.min(maxScroll, Math.max(0, target));
  tabs.scrollTo({ left: target, behavior: smooth ? 'smooth' : 'auto' });
}
function updateHomeFeedOverflowControls() {
  const panel = homeSourceNav.querySelector('.feed-source-panel');
  const tabs = homeSourceNav.querySelector('.feed-source-tabs');
  const previous = homeSourceNav.querySelector('[data-feed-source-scroll="previous"]');
  const next = homeSourceNav.querySelector('[data-feed-source-scroll="next"]');
  if (!panel || !tabs || !previous || !next) return;
  const maxScroll = Math.max(0, tabs.scrollWidth - tabs.clientWidth);
  const hasOverflow = maxScroll > 1;
  const hasPrevious = tabs.scrollLeft > 1;
  const hasNext = tabs.scrollLeft < maxScroll - 1;
  panel.classList.toggle('has-feed-overflow', hasOverflow);
  panel.classList.toggle('has-feed-overflow-left', hasPrevious);
  panel.classList.toggle('has-feed-overflow-right', hasNext);
  previous.hidden = !hasPrevious;
  next.hidden = !hasNext;
}
function scrollHomeFeedTabs(direction) {
  const tabs = homeSourceNav.querySelector('.feed-source-tabs');
  if (!tabs) return;
  tabs.scrollBy({ left: direction * Math.max(120, Math.round(tabs.clientWidth * .72)), behavior: 'smooth' });
}

function feedText(value = '') { return String(value).replace(/<[^>]*>/g, ' ').replace(/!\[[^\]]*\]\([^)]*\)/g, ' ').replace(/\[([^\]]+)\]\([^)]*\)/g, '$1').replace(/&nbsp;/gi, ' ').replace(/\s+/g, ' ').trim(); }
function safeExternalUrl(value = '') {
  try { const url = new URL(value); return ['http:', 'https:'].includes(url.protocol) ? url.href : ''; } catch { return ''; }
}
function parseFeedTimestamp(value) {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  const raw = String(value || '').trim();
  if (!raw) return NaN;
  const hasExplicitZone = /(?:Z|[+-]\d{2}:?\d{2}|GMT|UTC)$/i.test(raw);
  const plain = raw.match(/^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})(?::(\d{2}))?$/);
  if (plain && !hasExplicitZone) {
    // rss2json drops the original GMT suffix from several feeds. Its plain
    // YYYY-MM-DD HH:mm:ss value is therefore UTC, not local device time.
    return Date.UTC(Number(plain[1]), Number(plain[2]) - 1, Number(plain[3]), Number(plain[4]), Number(plain[5]), Number(plain[6] || 0));
  }
  const normalized = raw.replace(/^(\d{4}-\d{2}-\d{2})\s+(\d{2}:\d{2}(?::\d{2})?)$/, '$1T$2');
  const parsed = Date.parse(normalized);
  if (Number.isFinite(parsed)) return parsed;
  return NaN;
}
function feedSource(item) { return RSS_SOURCES.find((source) => source.id === item?.source) || RSS_SOURCES[0]; }
function feedItemTimestamp(item) {
  const parsed = parseFeedTimestamp(item?.publishedAt);
  if (Number.isFinite(parsed)) return parsed;
  const value = Number(item?.publishedMs);
  return Number.isFinite(value) && value > 0 ? value : NaN;
}
function feedDate(value, item) {
  const timestamp = typeof value === 'object' ? feedItemTimestamp(value) : parseFeedTimestamp(value);
  if (!Number.isFinite(timestamp)) return '';
  const date = new Date(timestamp);
  return new Intl.DateTimeFormat(state.language === 'en' ? 'en-US' : 'zh-CN', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'Asia/Shanghai' }).format(date);
}
function saveHomeFeedRead() { saveStored(STORAGE.homeFeedRead, state.homeFeedRead); }
function markFeedRead(id) {
  if (!id || state.homeFeedRead[id]) return;
  state.homeFeedRead[id] = Date.now();
  saveHomeFeedRead();
}
function feedImageUrl(value) {
  const url = safeExternalUrl(value);
  if (!url) return '';
  if (url.includes('images.weserv.nl/')) return url;
  return 'https://images.weserv.nl/?url=' + encodeURIComponent(url);
}
function feedImageSource(item = {}) {
  const html = String(item.content || item.description || '');
  const embedded = html.match(/<img[^>]+src=["']([^"']+)["']/i)?.[1] || html.match(/!\[[^\]]*\]\((https?:\/\/[^)\s]+)[^)]*\)/i)?.[1] || '';
  const value = item.thumbnail || item.enclosure?.link || item.enclosure?.url || item.image || embedded;
  return safeExternalUrl(String(value).startsWith('//') ? 'https:' + value : value);
}
function normalizeFeedItem(item, source, overrides = {}) {
  const title = feedText(item.title || item.name); const link = safeExternalUrl(item.link || item.guid);
  if (!title || !link) return null;
  const thumbnail = feedImageSource(item);
  const publishedAt = item.pubDate || item.published || item.isoDate || item.date || '';
  return { id: source.id + ':' + link, source: source.id, title, link, description: feedText(item.description || item.content || '').slice(0, 180), thumbnail, publishedAt, publishedMs: parseFeedTimestamp(publishedAt), ...overrides };
}
function jinaReaderUrl(url) {
  const value = String(url || '').trim();
  if (!value) return '';
  const separator = value.includes('?') ? '&' : '?';
  const target = value.replace(/^https?:\/\//i, '');
  return 'https://r.jina.ai/http://' + target + separator + '_onebox=' + Date.now();
}
function jinaContent(value) {
  const text = String(value || '').trim();
  const marker = 'Markdown Content:';
  const content = text.includes(marker) ? text.slice(text.indexOf(marker) + marker.length).trim() : text;
  return content.replace(/^```(?:json|javascript|text)?\s*/i, '').replace(/\s*```\s*$/i, '').trim();
}
function jinaJson(value) {
  const content = jinaContent(value);
  try { return JSON.parse(content); } catch {
    const start = Math.min(...[content.indexOf('{'), content.indexOf('[')].filter((index) => index >= 0));
    const end = Math.max(content.lastIndexOf('}'), content.lastIndexOf(']'));
    if (Number.isFinite(start) && start >= 0 && end > start) {
      try { return JSON.parse(content.slice(start, end + 1)); } catch { return null; }
    }
    return null;
  }
}
function syntheticFeedTime(index) { return Date.now() - index * 60 * 1000; }
function hupuTimestamp(value, index) {
  const match = String(value || '').match(/(?:^|\s)(\d{1,2})-(\d{1,2})\s+(\d{1,2}):(\d{2})(?:\s|$)/);
  if (!match) return syntheticFeedTime(index);
  const now = new Date();
  const timestamp = new Date(now.getFullYear(), Number(match[1]) - 1, Number(match[2]), Number(match[3]), Number(match[4])).getTime();
  return timestamp > Date.now() + 7 * 24 * 60 * 60 * 1000 ? new Date(now.getFullYear() - 1, Number(match[1]) - 1, Number(match[2]), Number(match[3]), Number(match[4])).getTime() : timestamp;
}
function rssMarkdownItems(value, source) {
  const content = jinaContent(value);
  const headings = [...content.matchAll(/^#{2,6}\s+\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/gm)];
  if (headings.length) return headings.map((match, index) => {
    const blockStart = (match.index || 0) + match[0].length;
    const nextStart = headings[index + 1]?.index ?? content.length;
    return normalizeFeedItem({ title: match[1], link: match[2], description: content.slice(blockStart, nextStart) }, source, { approximate: true, publishedMs: syntheticFeedTime(index) });
  }).filter(Boolean);
  if (typeof DOMParser === 'undefined' || !/<(?:item|entry)\b/i.test(content)) return [];
  const documentFragment = new DOMParser().parseFromString(content, 'text/xml');
  const nodes = [...documentFragment.querySelectorAll('item, entry')];
  return nodes.map((node, index) => {
    const linkNode = node.querySelector('link');
    const link = linkNode?.getAttribute('href') || linkNode?.textContent || node.querySelector('guid')?.textContent || '';
    return normalizeFeedItem({
      title: node.querySelector('title')?.textContent,
      link,
      description: node.querySelector('description, summary, content')?.textContent,
      pubDate: node.querySelector('pubDate, published, updated')?.textContent,
      enclosure: { url: node.querySelector('enclosure')?.getAttribute('url') || '' },
    }, source, { approximate: false, publishedMs: parseFeedTimestamp(node.querySelector('pubDate, published, updated')?.textContent) || syntheticFeedTime(index) });
  }).filter(Boolean);
}
function hupuBbsItems(value, source) {
  const content = jinaContent(value);
  const matches = [...content.matchAll(/\[([^\]]+)\]\((https?:\/\/(?:www\.)?bbs\.hupu\.com\/\d+(?:-\d+)?\.html)\)([^\n]*)/g)];
  return matches.map((match, index) => normalizeFeedItem({
    title: match[1],
    link: match[2].replace(/^http:/i, 'https:'),
    description: feedText(match[3]).slice(0, 180),
  }, source, { approximate: false, publishedMs: hupuTimestamp(match[3], index) })).filter(Boolean);
}
function structuredHotItems(payload, source, kind) {
  if (!payload) return [];
  if (kind === 'zhihu-hot') {
    const values = Array.isArray(payload.hot_search_queries) ? payload.hot_search_queries : [];
    return values.map((item, index) => {
      const title = feedText(item.query || item.real_query || item.title);
      if (!title) return null;
      const link = 'https://www.zhihu.com/search?type=content&q=' + encodeURIComponent(title);
      return normalizeFeedItem({ title, link, description: item.hot_value ? '热度 ' + item.hot_value : '' }, source, { approximate: true, publishedMs: syntheticFeedTime(index) });
    }).filter(Boolean);
  }
  if (kind === 'bilibili-hot') {
    const values = Array.isArray(payload.data?.trending?.list) ? payload.data.trending.list : Array.isArray(payload.data?.list) ? payload.data.list : [];
    return values.map((item, index) => {
      const title = feedText(item.show_name || item.keyword || item.name);
      if (!title) return null;
      const link = 'https://search.bilibili.com/all?keyword=' + encodeURIComponent(title);
      const score = item.hot_value || item.score || item.heat;
      return normalizeFeedItem({ title, link, description: score ? '热度 ' + score : '' }, source, { approximate: true, publishedMs: syntheticFeedTime(index) });
    }).filter(Boolean);
  }
  if (kind === 'bilibili-hotword') {
    const values = Array.isArray(payload.list) ? payload.list : Array.isArray(payload.data?.list) ? payload.data.list : [];
    return values.map((item, index) => {
      const title = feedText(item.show_name || item.keyword);
      if (!title) return null;
      return normalizeFeedItem({ title, link: 'https://search.bilibili.com/all?keyword=' + encodeURIComponent(title), description: item.pos ? '热搜第 ' + item.pos + ' 名' : '' }, source, { approximate: true, publishedMs: syntheticFeedTime(index) });
    }).filter(Boolean);
  }
  if (kind === 'weibo-hot') {
    const values = Array.isArray(payload.data) ? payload.data : Array.isArray(payload.data?.list) ? payload.data.list : Array.isArray(payload.list) ? payload.list : [];
    const updateTime = payload.update_time || payload.data?.update_time || '';
    return values.map((item, index) => {
      const title = feedText(item.title || item.word || item.name);
      if (!title) return null;
      const link = 'https://s.weibo.com/weibo?q=' + encodeURIComponent(title) + '&xsort=hot&Refer=hotmore';
      return normalizeFeedItem({ title, link, description: item.hot ? '热度 ' + item.hot : '' }, source, { publishedAt: updateTime, publishedMs: parseFeedTimestamp(updateTime) || syntheticFeedTime(index) });
    }).filter(Boolean);
  }
  if (kind === 'weibo-hot-v2') {
    const values = Array.isArray(payload.data?.realtime) ? payload.data.realtime : Array.isArray(payload.data?.list) ? payload.data.list : Array.isArray(payload.data) ? payload.data : Array.isArray(payload.list) ? payload.list : [];
    return values.map((item, index) => {
      const title = feedText(item.word || item.note || item.title);
      if (!title) return null;
      const link = 'https://s.weibo.com/weibo?q=' + encodeURIComponent(title) + '&xsort=hot&Refer=hotmore';
      return normalizeFeedItem({ title, link, description: item.num ? '热度 ' + item.num : '' }, source, { approximate: true, publishedMs: syntheticFeedTime(index) });
    }).filter(Boolean);
  }
  if (kind === 'v2ex-latest') {
    const values = Array.isArray(payload) ? payload : [];
    return values.map((item, index) => normalizeFeedItem({
      title: item.title,
      link: item.url || (item.id ? 'https://www.v2ex.com/t/' + item.id : ''),
      description: item.content,
      image: item.member?.avatar_normal,
      publishedAt: item.last_modified || item.created ? new Date(Number(item.last_modified || item.created) * 1000).toISOString() : '',
    }, source, { publishedMs: parseFeedTimestamp(item.last_modified || item.created ? new Date(Number(item.last_modified || item.created) * 1000).toISOString() : '') || syntheticFeedTime(index) })).filter(Boolean);
  }
  return [];
}
function guanchaRelativeTimestamp(value, index) {
  const text = String(value || '');
  const match = text.match(/(\d+)\s*(分钟|小时|天)前/);
  if (match) {
    const unit = match[2] === '分钟' ? 60 * 1000 : match[2] === '小时' ? 60 * 60 * 1000 : 24 * 60 * 60 * 1000;
    return Date.now() - Number(match[1]) * unit;
  }
  if (/刚刚|刚才/.test(text)) return Date.now();
  if (/昨天/.test(text)) return Date.now() - 24 * 60 * 60 * 1000;
  return syntheticFeedTime(index);
}
function guanchaFengwenItems(value, source) {
  const content = jinaContent(value);
  const headings = [...content.matchAll(/#{2,6}\s+\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g)]
    .filter((match) => /\/main\/content(?:\?|$)/i.test(match[2]));
  if (!headings.length) return [];
  return headings.map((match, index) => {
    const blockStart = (match.index || 0) + match[0].length;
    const nextStart = headings[index + 1]?.index ?? content.length;
    const block = content.slice(blockStart, nextStart);
    const description = feedText(block)
      .replace(/^(?:置顶\s*)?(?:\d+\s*(?:分钟前|小时前|天前)|刚刚|刚才|昨天)\s*/i, '')
      .split(/\s+(?:分享|收藏|评论|赞)/)[0]
      .slice(0, 180);
    const link = match[2].replace(/^http:/i, 'https:');
    return normalizeFeedItem({ title: match[1], link, description, content: block }, source, {
      approximate: false,
      publishedMs: guanchaRelativeTimestamp(block, index),
    });
  }).filter(Boolean);
}
function mergeFeedItems(source, incoming) {
  const existing = (state.homeFeed.sources[source.id]?.items || []).map((item) => ({
    ...item,
    description: feedText(item.description || ''),
    thumbnail: item.thumbnail || feedImageSource(item),
  }));
  const merged = new Map(existing.map((item) => [item.id, item]));
  incoming.forEach((item) => merged.set(item.id, { ...merged.get(item.id), ...item }));
  const cutoff = Date.now() - RSS_RETENTION_MS;
  return [...merged.values()]
    .filter((item) => { const timestamp = feedItemTimestamp(item); return !Number.isFinite(timestamp) || timestamp >= cutoff; })
    .sort((a, b) => (feedItemTimestamp(b) || 0) - (feedItemTimestamp(a) || 0))
    .slice(0, RSS_MAX_ITEMS_PER_SOURCE);
}
async function fetchFeedSource(source) {
  const fetchers = Array.isArray(source.fetchers) ? source.fetchers : (source.urls || []).map((url) => ({ kind: 'rss', url }));
  const successful = [];
  for (const fetcher of fetchers) {
    try {
      const targetUrl = fetcher.direct ? fetcher.url : jinaReaderUrl(fetcher.url);
      const response = await fetchWithTimeout(targetUrl, { cache: 'no-store', headers: { Accept: 'text/plain, application/json, application/xml' } }, 14000);
      if (!response.ok) throw Error('HTTP ' + response.status);
      const text = await response.text();
      const payload = fetcher.kind === 'rss' || fetcher.kind === 'guancha-fengwen' ? null : jinaJson(text);
      const items = fetcher.kind === 'rss' ? rssMarkdownItems(text, source) : fetcher.kind === 'hupu-bbs' ? hupuBbsItems(text, source) : fetcher.kind === 'guancha-fengwen' ? guanchaFengwenItems(text, source) : structuredHotItems(payload, source, fetcher.kind);
      if (items.length) { successful.push({ items, feedUrl: fetcher.url }); break; }
    } catch { /* try the next source-specific fallback */ }
  }
  if (!successful.length) throw Error('Feed unavailable');
  const items = [...new Map(successful.flatMap((result) => result.items).map((item) => [item.id, item])).values()]
    .sort((a, b) => (feedItemTimestamp(b) || 0) - (feedItemTimestamp(a) || 0))
    .slice(0, RSS_MAX_ITEMS_PER_SOURCE);
  return { items, updatedAt: Date.now(), feedUrl: successful.map((result) => result.feedUrl).join(',') };
}
async function loadHomeFeeds(force = false, sourceId = '') {
  if (state.homeFeed.loading) return;
  const visibleSources = homeFeedSources();
  const hasItems = visibleSources.some((source) => state.homeFeed.sources[source.id]?.items?.length);
  const cacheIsCurrent = state.homeFeed.cacheVersion === APP_VERSION;
  if (!force && cacheIsCurrent && hasItems && Date.now() - state.homeFeed.updatedAt < RSS_REFRESH_INTERVAL) return;
  state.homeFeed.loading = true; state.homeFeed.errors = {}; state.homeFeed.stale = {}; const request = ++state.homeFeedRequest;
  if (state.section === 'home') render();
  const hadCachedItems = hasItems;
  let discoveredNewItems = false;
  const sourcesToLoad = sourceId && sourceId !== 'footprint' ? visibleSources.filter((source) => source.id === sourceId) : visibleSources;
  const results = await Promise.all(sourcesToLoad.map(async (source) => {
    try { return { source, result: await fetchFeedSource(source) }; }
    catch (error) { return { source, error: error?.message || 'RSS unavailable' }; }
  }));
  if (request !== state.homeFeedRequest) return;
  results.forEach(({ source, result, error }) => {
    if (result) {
      const previousIds = new Set((state.homeFeed.sources[source.id]?.items || []).map((item) => item.id));
      if (hadCachedItems && result.items.some((item) => !previousIds.has(item.id))) discoveredNewItems = true;
      state.homeFeed.sources[source.id] = { ...result, items: mergeFeedItems(source, result.items) };
    } else if (state.homeFeed.sources[source.id]?.items?.length) state.homeFeed.stale[source.id] = true;
    else state.homeFeed.errors[source.id] = error;
  });
  const hasFreshResult = results.some(({ result }) => Boolean(result));
  if (hasFreshResult) state.homeFeed.updatedAt = Date.now();
  state.homeFeed.loading = false;
  state.homeFeed.hasNew = state.section === 'home' ? false : state.homeFeed.hasNew || discoveredNewItems;
  state.homeFeed.cacheVersion = hasFreshResult ? APP_VERSION : '';
  saveStored(STORAGE.homeFeeds, { cacheVersion: hasFreshResult ? APP_VERSION : '', updatedAt: state.homeFeed.updatedAt, sources: state.homeFeed.sources });
  if (state.section === 'home') {
    render();
    requestAnimationFrame(() => focusActiveHomeFeedTab(false));
  } else renderBottomNav();
}
function renderFeedItem(item) {
  const source = feedSource(item);
  const rawThumbnail = safeExternalUrl(item.thumbnail);
  const thumbnail = feedImageUrl(rawThumbnail) || rawThumbnail;
  const image = rawThumbnail ? '<span class="feed-item-media"><img class="feed-item-image" src="' + escapeHtml(thumbnail) + '" data-fallback="' + escapeHtml(rawThumbnail) + '" alt="" loading="lazy" onerror="if(this.dataset.fallback && this.getAttribute(\'src\') !== this.dataset.fallback){this.src=this.dataset.fallback;return;}this.hidden=true"></span>' : '';
  const meta = '<div class="feed-item-meta"><span class="feed-source-tag ' + source.className + '"><b><img src="' + escapeHtml(source.icon) + '" alt="" loading="lazy" onerror="this.hidden=true;this.nextElementSibling.style.display=\'inline\'"><span class="feed-source-fallback">' + escapeHtml(source.badge) + '</span></b>' + escapeHtml(source.name) + '</span><time datetime="' + escapeHtml(new Date(feedItemTimestamp(item) || Date.now()).toISOString()) + '">' + escapeHtml(feedDate(item)) + '</time></div>';
  const read = Boolean(state.homeFeedRead[item.id]);
  return '<article class="feed-item ' + (thumbnail ? 'has-media ' : '') + (read ? 'is-read' : '') + '" data-feed-id="' + escapeHtml(item.id) + '" data-feed-link="' + escapeHtml(item.link) + '" tabindex="0" role="link"><div class="feed-item-body"><h2>' + escapeHtml(item.title) + '</h2>' + (item.description ? '<p>' + escapeHtml(item.description) + '</p>' : '') + meta + '</div>' + (image ? '<div class="feed-item-side">' + image + '</div>' : '') + '</article>';
}
function isMobileSurface() {
  return Boolean(navigator.standalone || window.matchMedia?.('(display-mode: standalone)').matches || /Android|iPhone|iPad|iPod/i.test(navigator.userAgent) || window.matchMedia?.('(max-width: 760px)').matches);
}
function mobileFeedLink(item) {
  const link = safeExternalUrl(item?.link);
  if (!link || !isMobileSurface()) return link;
  const source = feedSource(item);
  if (source.id === 'ithome') {
    try {
      const url = new URL(link);
      const match = url.pathname.match(/^\/(\d)\/(\d{3})\/(\d{3})\.htm$/i);
      if (match) return 'https://m.ithome.com/html/' + match[1] + match[2] + match[3] + '.htm';
      url.hostname = 'm.ithome.com';
      return url.href;
    } catch { return link; }
  }
  if (source.id === 'weibo') {
    try {
      const url = new URL(link);
      const query = url.searchParams.get('q') || url.searchParams.get('query') || url.pathname.split('/').filter(Boolean).pop() || '';
      return 'https://m.weibo.cn/search?containerid=100103type=61&q=' + encodeURIComponent(query);
    } catch { return link; }
  }
  if (source.id === 'bilibili') return link.replace('https://search.bilibili.com/all', 'https://m.bilibili.com/search');
  if (source.id === 'hupu') {
    try {
      const url = new URL(link);
      const match = url.pathname.match(/^\/(\d+)(-\d+)?\.html$/i);
      if (match) return 'https://m.hupu.com/bbs/' + match[1] + (match[2] || '') + '.html';
      url.hostname = 'm.hupu.com';
      return url.href;
    } catch { return link; }
  }
  if (!source.mobileHost) return link;
  try {
    const url = new URL(link);
    url.hostname = source.mobileHost;
    if ((source.id === 'zhihu' || source.id === 'huxiu') && document.documentElement.dataset.theme === 'dark') url.searchParams.set('theme', 'dark');
    return url.href;
  } catch { return link; }
}
function feedItemByLink(link) {
  return RSS_SOURCES.flatMap((source) => state.homeFeed.sources[source.id]?.items || []).find((item) => item.link === link) || recentFeedItems().find((item) => item.link === link) || { link };
}
function appScrollElement() {
  return (isIosSafariBrowser() || isStandalonePwa()) ? (document.scrollingElement || document.documentElement) : $('main');
}
function appScrollTop() {
  const scrollElement = appScrollElement();
  if (!scrollElement) return 0;
  return scrollElement === document.documentElement ? (window.scrollY || document.documentElement.scrollTop || 0) : scrollElement.scrollTop;
}
function scrollAppTo(top, behavior = 'auto') {
  const scrollElement = appScrollElement();
  if (!scrollElement) return;
  const targetTop = Math.max(0, Number(top) || 0);
  if (behavior === 'instant') {
    const previousBehavior = scrollElement.style.scrollBehavior;
    scrollElement.style.scrollBehavior = 'auto';
    scrollElement.scrollTop = targetTop;
    scrollElement.style.scrollBehavior = previousBehavior;
    return;
  }
  scrollElement.scrollTo({ top: targetTop, behavior });
}

// Page mascot ---------------------------------------------------------------
// page-mascot uses two aligned 3×3 sheets: one for the direction the
// character looks and one for the short reaction after a click. Keep that
// rendering model, but mount it as a dependency-free OneBox surface so it
// survives route renders and works in the static PWA.
const MASCOT_ASSETS = {
  directions: 'https://cdn.jsdelivr.net/gh/nilbuild/page-mascot@main/public/mascots/fox-directions.webp',
  reactions: 'https://cdn.jsdelivr.net/gh/nilbuild/page-mascot@main/public/mascots/fox-reactions.webp',
};
const MASCOT_DIRECTIONS = ['up-left', 'up', 'up-right', 'left', 'center', 'right', 'down-left', 'down', 'down-right'];
const MASCOT_REACTIONS = ['blink', 'heart', 'sparkle', 'surprised', 'wink', 'bashful', 'sleepy', 'dizzy', 'delighted'];
const MASCOT_CLOCKWISE = ['right', 'down-right', 'down', 'down-left', 'left', 'up-left', 'up', 'up-right'];
const MASCOT_SECTOR = (Math.PI * 2) / MASCOT_CLOCKWISE.length;
const MASCOT_HYSTERESIS = 0.12;
const MASCOT_DEAD_ZONE = 46;
const MASCOT_DOCK_DELAY = 3000;
const MASCOT_EDGE_SWIPE_DISTANCE = 34;
const MASCOT_IDLE_MIN = 5200;
const MASCOT_IDLE_MAX = 9800;
const MASCOT_IDLE_MESSAGES = ['今天也要轻轻松松哦', '我在这里陪你', '风吹过来啦', '摸摸我会有好运', '要不要看看今天的天气？'];
const MASCOT_DRAG_MESSAGES = ['抓到我啦', '轻一点，我会晃晕的', '放这里刚刚好', '我也想换个位置'];
const MASCOT_EDGE_MESSAGES = ['我先躲到边边～', '边边的位置刚刚好', '需要我时再叫我哦'];
const mascotRuntime = { root: null, button: null, panel: null, speech: null, directionLayer: null, reactionLayer: null, drag: null, dockTimer: 0, reactionTimer: 0, actionTimer: 0, idleTimer: 0, speechTimer: 0, singleClickTimer: 0, tapAt: 0, boopAt: 0, boops: 0, suppressClickUntil: 0, sector: -1, position: null, lastReaction: '', lastSpeech: '', topActionAnnounced: false, launchTimer: 0, ballTimer: 0 };
function mascotCellStyle(index) {
  return { backgroundPosition: (index % 3) * 50 + '% ' + Math.floor(index / 3) * 50 + '%' };
}
function mascotWrapAngle(angle) { return Math.atan2(Math.sin(angle), Math.cos(angle)); }
function mascotPositionValue() {
  const value = parseStored(STORAGE.mascotPosition, null);
  if (!value || !Number.isFinite(Number(value.left)) || !Number.isFinite(Number(value.top))) return null;
  return { left: Number(value.left), top: Number(value.top) };
}
function mascotClampPosition(left, top) {
  const root = mascotRuntime.root;
  const width = root?.offsetWidth || 82;
  const height = root?.offsetHeight || 82;
  return {
    left: Math.max(8, Math.min(Math.max(8, window.innerWidth - width - 8), Number(left) || 0)),
    top: Math.max(8, Math.min(Math.max(8, window.innerHeight - height - 8), Number(top) || 0)),
  };
}
function mascotSetPosition(left, top, persist = true) {
  const root = mascotRuntime.root;
  if (!root) return;
  const position = mascotClampPosition(left, top);
  mascotRuntime.position = position;
  root.style.left = position.left + 'px';
  root.style.top = position.top + 'px';
  root.style.right = 'auto';
  root.dataset.edge = position.left + (root.offsetWidth || 82) / 2 < window.innerWidth / 2 ? 'left' : 'right';
  if (persist) saveStored(STORAGE.mascotPosition, position);
}
function mascotSyncPanelSide() {
  const root = mascotRuntime.root;
  if (!root) return;
  const rect = root.getBoundingClientRect();
  root.dataset.panelSide = rect.left + rect.width / 2 < window.innerWidth / 2 ? 'left' : 'right';
}
function mascotClearDockTimer() {
  clearTimeout(mascotRuntime.dockTimer);
  mascotRuntime.dockTimer = 0;
}
function mascotScheduleDock() {
  mascotClearDockTimer();
  if (!mascotRuntime.root || !state.mascotVisible || !mascotRuntime.panel?.hidden || mascotRuntime.drag) return;
  mascotRuntime.dockTimer = window.setTimeout(() => {
    if (!mascotRuntime.drag && mascotRuntime.panel?.hidden) {
      mascotRuntime.root.classList.add('is-docked');
      mascotRuntime.root.classList.remove('is-top-action');
      mascotSetReaction('sleepy', 1500);
      mascotSetAction('dock', 900);
      syncMascotContext();
    }
  }, MASCOT_DOCK_DELAY);
}
function mascotReveal() {
  const wasDocked = mascotRuntime.root?.classList.contains('is-docked');
  mascotRuntime.root?.classList.remove('is-docked');
  mascotClearDockTimer();
  mascotSyncPanelSide();
  if (wasDocked) mascotSetAction('peek', 520);
}
function mascotSetAction(action = '', duration = 0) {
  const root = mascotRuntime.root;
  if (!root) return;
  clearTimeout(mascotRuntime.actionTimer);
  if (action) root.dataset.action = action;
  else delete root.dataset.action;
  if (action && duration > 0) mascotRuntime.actionTimer = window.setTimeout(() => { delete root.dataset.action; }, duration);
}
function mascotSetReaction(reaction = null, duration = null) {
  const root = mascotRuntime.root;
  if (!root) return;
  clearTimeout(mascotRuntime.reactionTimer);
  root.dataset.reaction = reaction || '';
  if (!reaction) return;
  const index = Math.max(0, MASCOT_REACTIONS.indexOf(reaction));
  mascotRuntime.reactionLayer.style.backgroundPosition = mascotCellStyle(index).backgroundPosition;
  const visibleFor = duration ?? (reaction === 'dizzy' ? 1100 : reaction === 'sleepy' ? 1500 : 760);
  mascotRuntime.reactionTimer = window.setTimeout(() => { root.dataset.reaction = ''; }, visibleFor);
}
function mascotRandomMessage(messages) {
  const pool = messages.filter((message) => message !== mascotRuntime.lastSpeech);
  return pool[Math.floor(Math.random() * pool.length)] || messages[0];
}
function mascotShowSpeech(message, duration = 2200, mood = '') {
  const root = mascotRuntime.root;
  const speech = mascotRuntime.speech;
  if (!root || !speech || !message) return;
  clearTimeout(mascotRuntime.speechTimer);
  mascotRuntime.lastSpeech = message;
  speech.textContent = message;
  root.dataset.speechMood = mood;
  speech.hidden = false;
  root.classList.add('has-speech');
  mascotRuntime.speechTimer = window.setTimeout(() => {
    speech.hidden = true;
    root.classList.remove('has-speech');
    delete root.dataset.speechMood;
  }, duration);
}
function syncMascotVisibility() {
  const root = mascotRuntime.root;
  if (!root) return;
  if (!state.mascotVisible) {
    mascotClearDockTimer();
    clearTimeout(mascotRuntime.idleTimer);
    mascotHideSpeech();
    if (mascotRuntime.panel) mascotRuntime.panel.hidden = true;
    root.classList.remove('has-briefing', 'is-top-action');
    root.hidden = true;
    return;
  }
  root.hidden = false;
  syncMascotContext();
  mascotScheduleDock();
  mascotScheduleIdle();
}
function mascotHideSpeech() {
  clearTimeout(mascotRuntime.speechTimer);
  if (mascotRuntime.speech) mascotRuntime.speech.hidden = true;
  mascotRuntime.root?.classList.remove('has-speech');
  if (mascotRuntime.root) delete mascotRuntime.root.dataset.speechMood;
}
function mascotPlayReaction(preferred = null) {
  const now = Date.now();
  const count = now - (mascotRuntime.boopAt || 0) < 1600 ? Number(mascotRuntime.boops || 0) + 1 : 1;
  mascotRuntime.boops = count >= 4 ? 0 : count;
  mascotRuntime.boopAt = now;
  const randomChoices = MASCOT_REACTIONS.filter((reaction) => reaction !== mascotRuntime.lastReaction);
  const randomReaction = randomChoices[Math.floor(Math.random() * randomChoices.length)] || 'blink';
  const reaction = preferred || (count >= 4 ? 'dizzy' : count === 2 ? 'heart' : count === 3 ? 'sparkle' : count === 1 ? 'blink' : randomReaction);
  mascotRuntime.lastReaction = reaction;
  mascotSetReaction(reaction);
  mascotSetAction(reaction === 'sleepy' ? 'sleep' : reaction === 'dizzy' ? 'dizzy' : 'happy', reaction === 'dizzy' ? 1100 : reaction === 'sleepy' ? 1500 : 820);
  return reaction;
}
function mascotScheduleIdle() {
  clearTimeout(mascotRuntime.idleTimer);
  if (!mascotRuntime.root) return;
  const delay = MASCOT_IDLE_MIN + Math.random() * (MASCOT_IDLE_MAX - MASCOT_IDLE_MIN);
  mascotRuntime.idleTimer = window.setTimeout(() => {
    if (!mascotRuntime.drag && mascotRuntime.panel?.hidden && !mascotRuntime.root.classList.contains('is-docked') && !mascotTopActionActive()) {
      mascotPlayReaction();
      mascotShowSpeech(mascotRandomMessage(MASCOT_IDLE_MESSAGES), 2200, 'idle');
    }
    mascotScheduleIdle();
  }, delay);
}
function mascotSetDirectionFromVector(dx, dy) {
  if (!mascotRuntime.directionLayer || Math.hypot(dx, dy) < 8) return;
  const angle = Math.atan2(dy, dx);
  const sector = (Math.round(angle / MASCOT_SECTOR) + MASCOT_CLOCKWISE.length) % MASCOT_CLOCKWISE.length;
  const direction = MASCOT_CLOCKWISE[sector];
  mascotRuntime.directionLayer.style.backgroundPosition = mascotCellStyle(MASCOT_DIRECTIONS.indexOf(direction)).backgroundPosition;
}
function mascotFutureSixHours(weather) {
  const times = weather?.hourly?.time || [];
  const start = currentHourIndex(weather);
  if (start < 0 || !times.length) return state.language === 'en' ? 'The next six hours look fairly steady.' : '未来 6 小时天气比较稳定，按计划安排就好。';
  const end = Math.min(times.length, start + 6);
  const codes = (weather.hourly.weather_code || []).slice(start, end).map(Number);
  const rainChance = Math.max(...(weather.hourly.precipitation_probability || []).slice(start, end).map((value) => Number(value) || 0), 0);
  const temperatures = (weather.hourly.temperature_2m || []).slice(start, end).map(Number).filter(Number.isFinite);
  const winds = (weather.hourly.wind_speed_10m || []).slice(start, end).map(Number).filter(Number.isFinite);
  const rainy = rainChance >= 50 || codes.some((code) => [51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82].includes(code));
  const wind = Math.max(...winds, 0);
  const temperatureDelta = temperatures.length > 1 ? temperatures[temperatures.length - 1] - temperatures[0] : 0;
  if (rainy) return state.language === 'en' ? 'A shower may arrive in the next six hours — keep an umbrella nearby.' : '未来 6 小时有下雨可能，出门记得带伞。';
  if (wind >= 30) return state.language === 'en' ? 'Wind may pick up in the next six hours — keep light items secure.' : '未来 6 小时风力可能增强，轻小物品要收好。';
  if (temperatureDelta >= 4) return state.language === 'en' ? 'It should warm up through the next six hours.' : '未来 6 小时会慢慢升温，早晚温差留意一下。';
  if (temperatureDelta <= -4) return state.language === 'en' ? 'It should cool down through the next six hours.' : '未来 6 小时会逐渐转凉，记得添衣。';
  return state.language === 'en' ? 'The next six hours look fairly steady — make plans with ease.' : '未来 6 小时天气比较稳定，按计划安排就好。';
}
function mascotHolidayMessage() {
  const now = new Date();
  const currentKey = dateKey(now);
  const currentHoliday = holidayFor(currentKey);
  const isWeekend = now.getDay() === 0 || now.getDay() === 6;
  if (currentHoliday?.isOffDay || (isWeekend && !currentHoliday)) return state.language === 'en' ? 'It is a rest day — take a proper break.' : '今天在放假，就好好休息一下哟！';
  for (let offset = 1; offset <= 3; offset += 1) {
    const candidate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + offset);
    const key = dateKey(candidate);
    const holiday = holidayFor(key);
    const restDay = holiday?.isOffDay || (!holiday && (candidate.getDay() === 0 || candidate.getDay() === 6));
    if (restDay) return state.language === 'en' ? (offset === 1 ? 'A day off is almost here — hang in there!' : 'A day off is coming soon — finish gently.') : (offset === 1 ? '马上就要放假了，再坚持一下！' : '快要放假了，把手头的事收个尾吧。');
  }
  return '';
}
function mascotDateLabel(date = new Date()) {
  const dateText = new Intl.DateTimeFormat(state.language === 'en' ? 'en-US' : 'zh-CN', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' }).format(date);
  if (state.language === 'en') return dateText;
  const lunar = lunarFor(date);
  if (!lunar) return dateText;
  const lunarMonth = lunar.monthText.replace(/^十一月$/, '冬月').replace(/^十二月$/, '腊月');
  return dateText + '（农历' + lunarMonth + lunar.dayText + '）';
}
function mascotReadingMarkup() {
  const book = [...(state.library || [])].filter((item) => Number(item.lastOpenedAt) > 0).sort((a, b) => Number(b.lastOpenedAt) - Number(a.lastOpenedAt))[0];
  if (!book) return '';
  const progress = typeof book.progress === 'number' ? book.progress : Number(book.progress?.percent || 0);
  const percent = Math.round(Math.min(1, Math.max(0, progress)) * 100);
  const readingLabel = state.language === 'en' ? 'Reading now' : '正在读';
  const bookName = book.name || (state.language === 'en' ? 'Untitled book' : '未命名文档');
  return '<button type="button" class="onebox-mascot-reading-line" data-mascot-action="reader" aria-label="' + escapeHtml(readingLabel + ' ' + bookName) + '"><span class="onebox-mascot-reading-content"><span class="onebox-mascot-reading-label"><span class="onebox-mascot-line-icon" aria-hidden="true">' + TOOL_DEFS.reader.icon + '</span><small>' + escapeHtml(readingLabel) + '</small></span><span class="onebox-mascot-reading-book"><strong>' + escapeHtml(bookName) + '</strong><em>' + percent + '%</em></span></span></button>';
}
function mascotWeatherMarkup() {
  const weather = state.weatherCards.find((item) => item.id === state.activeWeatherId) || state.weatherCards[0];
  if (!weather) return '<p class="onebox-mascot-empty">' + escapeHtml(state.language === 'en' ? 'Add a weather place first' : '还没有天气卡片') + '</p>';
  if (weather.loading && !weather.current) return '<p class="onebox-mascot-empty">' + escapeHtml(t('weatherLoading')) + '</p>';
  const current = weather.current || {};
  const condition = weatherCode(current.weather_code);
  const temp = Number.isFinite(Number(current.temperature_2m)) ? Math.round(Number(current.temperature_2m)) + '°' : '—';
  const place = weather.name || (state.language === 'en' ? 'Weather' : '天气');
  const meta = [condition[1], weatherWindLabel(current.wind_speed_10m), (state.language === 'en' ? 'Humidity ' : '湿度 ') + (current.relative_humidity_2m ?? '—') + '%', (state.language === 'en' ? 'Elevation ' : '海拔 ') + weatherElevationLabel(weather.elevation)].join(' · ');
  return '<div class="onebox-mascot-weather-inline"><div class="onebox-mascot-weather-now"><span class="onebox-mascot-weather-symbol" aria-hidden="true">' + condition[0] + '</span><span><strong>' + escapeHtml(place) + ' ' + escapeHtml(temp) + '</strong><span class="onebox-mascot-weather-condition"><span class="onebox-mascot-weather-meta">' + escapeHtml(meta) + '</span></span></span></div><p class="onebox-mascot-weather-insight">' + escapeHtml(mascotFutureSixHours(weather)) + '</p></div>';
}
function mascotActionButton(action, label, icon) {
  return '<button type="button" data-mascot-action="' + action + '" aria-label="' + escapeHtml(label) + '"><span class="onebox-mascot-action-icon" aria-hidden="true">' + icon + '</span><span>' + escapeHtml(label) + '</span></button>';
}
function mascotBriefingMarkup() {
  const todayLabel = mascotDateLabel();
  const language = state.language === 'en';
  const hello = language ? 'Today feels good' : '今天感觉不错';
  const hint = language ? 'Tap a little button, or double-tap me to see a surprise' : '点一点下面的小按钮，或者双击我看看惊喜';
  const holidayMessage = mascotHolidayMessage();
  const label = (zh, en) => language ? en : zh;
  const icon = (id) => TOOL_DEFS[id]?.icon || SECTION_DEFS[id]?.icon || '';
  const actionRows = '<div class="onebox-mascot-action-row onebox-mascot-action-row-primary">' + mascotActionButton('pat', label('摸摸头', 'Pat me'), '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.8 8.8c0 5.2-8.8 10-8.8 10s-8.8-4.8-8.8-10A4.8 4.8 0 0 1 12 6.1a4.8 4.8 0 0 1 8.8 2.7Z"/></svg>') + mascotActionButton('ball', label('玩玩球', 'Play ball'), '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8.5"/><path d="m8.5 5.1 1.1 4.2-3.4 2.5M15.5 5.1l-1.1 4.2 3.4 2.5M7.3 15.3h4.1l2.5 3.5M16.7 15.3h-4.1l-2.5 3.5"/></svg>') + '</div><div class="onebox-mascot-action-row onebox-mascot-action-row-tools">' + mascotActionButton('weather', label('天气', 'Weather'), icon('weather')) + mascotActionButton('calendar', label('日历', 'Calendar'), icon('calendar')) + mascotActionButton('reader', label('阅读', 'Reading'), icon('reader')) + mascotActionButton('navigation', label('导航', 'Navigation'), icon('navigation')) + mascotActionButton('calculator', label('计算', 'Calculator'), icon('calculator')) + '</div><div class="onebox-mascot-action-row onebox-mascot-action-row-sections">' + mascotActionButton('home', label('首页', 'Home'), icon('home')) + mascotActionButton('messages', label('消息', 'Messages'), icon('messages')) + mascotActionButton('mine', label('我的', 'Me'), icon('mine')) + '</div>';
  return '<div class="onebox-mascot-cloud"><div class="onebox-mascot-cloud-head"><div class="onebox-mascot-date"><div><strong>' + escapeHtml(hello) + '</strong><small>' + escapeHtml(todayLabel) + '</small></div></div><button type="button" class="onebox-mascot-cloud-close" data-close-mascot aria-label="' + escapeHtml(t('close')) + '">×</button></div><div class="onebox-mascot-cloud-story">' + mascotWeatherMarkup() + (holidayMessage ? '<p class="onebox-mascot-holiday-line"><span aria-hidden="true">✦</span>' + escapeHtml(holidayMessage) + '</p>' : '') + mascotReadingMarkup() + '</div><div class="onebox-mascot-cloud-actions">' + actionRows + '</div><p class="onebox-mascot-cloud-hint">' + escapeHtml(hint) + '</p></div>';
}
function refreshMascotBriefing() {
  if (mascotRuntime.panel && !mascotRuntime.panel.hidden) mascotRuntime.panel.innerHTML = mascotBriefingMarkup();
}
function closeMascotBriefing() {
  if (!mascotRuntime.panel) return;
  const wasOpen = !mascotRuntime.panel.hidden;
  mascotRuntime.panel.hidden = true;
  mascotRuntime.root?.classList.remove('has-briefing');
  mascotHideSpeech();
  if (wasOpen) mascotSetAction('peek', 480);
  mascotScheduleDock();
}
function openMascotBriefing() {
  if (!mascotRuntime.panel) return;
  mascotReveal();
  mascotHideSpeech();
  mascotRuntime.panel.innerHTML = mascotBriefingMarkup();
  mascotRuntime.panel.hidden = false;
  mascotRuntime.root.classList.add('has-briefing');
  mascotPlayReaction('delighted');
  const year = new Date().getFullYear();
  Promise.resolve(ensureHolidayYear(year)).then(() => { if (!mascotRuntime.panel?.hidden) refreshMascotBriefing(); }).catch(() => {});
}
function mascotPlayTrick() {
  closeMascotBriefing();
  mascotClearDockTimer();
  mascotSetReaction('dizzy');
  mascotSetAction('dizzy', 1100);
  mascotShowSpeech(state.language === 'en' ? 'Whoa, too fast!' : '哎呀，转晕啦！', 1800, 'dizzy');
}
function mascotTopActionActive() {
  return state.section === 'home' && appScrollTop() > 84 && !mascotRuntime.root?.classList.contains('is-docked');
}
function syncMascotContext() {
  const root = mascotRuntime.root;
  const button = mascotRuntime.button;
  if (!root || !button) return;
  const topAction = mascotTopActionActive();
  const wasTopAction = root.classList.contains('is-top-action');
  root.classList.toggle('is-top-action', topAction);
  button.setAttribute('aria-label', topAction ? (state.language === 'en' ? 'Back to top' : '回到顶部') : (state.language === 'en' ? 'Open today overview' : '查看今日速览'));
  if (topAction && !wasTopAction && !mascotRuntime.topActionAnnounced) {
    mascotRuntime.topActionAnnounced = true;
    mascotShowSpeech(state.language === 'en' ? 'Tap me to go back up!' : '点我就可以回到上方哟！', 2300, 'top');
  }
  if (!topAction) mascotRuntime.topActionAnnounced = false;
  mascotSyncPanelSide();
}
function updateMascotScrollState() {
  const scrollingHome = state.section === 'home';
  if (scrollingHome) {
    mascotReveal();
    mascotClearDockTimer();
  }
  const topAction = mascotTopActionActive();
  if (topAction && mascotRuntime.panel && !mascotRuntime.panel.hidden) {
    mascotRuntime.panel.hidden = true;
    mascotRuntime.root?.classList.remove('has-briefing');
    mascotClearDockTimer();
  }
  syncMascotContext();
  if (scrollingHome) mascotScheduleDock();
}
function mascotAim(pointer) {
  const root = mascotRuntime.root;
  if (!root || root.classList.contains('is-docked') || root.classList.contains('is-dragging')) return;
  const box = root.getBoundingClientRect();
  const dx = pointer.x - (box.left + box.width / 2);
  const dy = pointer.y - (box.top + box.height / 2);
  if (Math.hypot(dx, dy) < MASCOT_DEAD_ZONE) {
    mascotRuntime.sector = -1;
    mascotRuntime.directionLayer.style.backgroundPosition = '50% 50%';
    return;
  }
  const angle = Math.atan2(dy, dx);
  if (mascotRuntime.sector !== -1 && Math.abs(mascotWrapAngle(angle - mascotRuntime.sector * MASCOT_SECTOR)) < MASCOT_SECTOR / 2 + MASCOT_HYSTERESIS) return;
  mascotRuntime.sector = (Math.round(angle / MASCOT_SECTOR) + MASCOT_CLOCKWISE.length) % MASCOT_CLOCKWISE.length;
  const direction = MASCOT_CLOCKWISE[mascotRuntime.sector];
  mascotRuntime.directionLayer.style.backgroundPosition = mascotCellStyle(MASCOT_DIRECTIONS.indexOf(direction)).backgroundPosition;
}
function mascotFinishDrag(event) {
  const drag = mascotRuntime.drag;
  if (!drag || (event.pointerId != null && event.pointerId !== drag.pointerId)) return;
  const cancelled = event.type === 'pointercancel';
  mascotRuntime.drag = null;
  mascotRuntime.root.classList.remove('is-dragging');
  try { if (mascotRuntime.button.hasPointerCapture?.(drag.pointerId)) mascotRuntime.button.releasePointerCapture(drag.pointerId); } catch {}
  if (drag.moved) {
    mascotRuntime.suppressClickUntil = Date.now() + 500;
    const dx = event.clientX - drag.startX;
    const dy = event.clientY - drag.startY;
    const droppedAtBottom = event.clientY >= window.innerHeight - Math.max(72, (mascotRuntime.root.offsetHeight || 82) * .9);
    if (!cancelled && droppedAtBottom) {
      mascotLaunchRocket();
      return;
    }
    const isEdgeSwipe = Math.abs(dx) >= MASCOT_EDGE_SWIPE_DISTANCE && Math.abs(dx) > Math.abs(dy) * 1.2;
    if (isEdgeSwipe) {
      const width = mascotRuntime.root.offsetWidth || 82;
      const edge = dx < 0 ? 'left' : 'right';
      const left = edge === 'left' ? 8 : window.innerWidth - width - 8;
      const top = mascotClampPosition(mascotRuntime.position?.left ?? drag.left, mascotRuntime.position?.top ?? drag.top).top;
      mascotSetPosition(left, top);
      mascotRuntime.root.dataset.edge = edge;
      mascotRuntime.root.classList.add('is-docked');
      mascotSyncPanelSide();
      mascotClearDockTimer();
      mascotSetReaction('wink', 760);
      mascotSetAction('dock', 760);
      mascotShowSpeech(mascotRandomMessage(MASCOT_EDGE_MESSAGES), 1800, 'edge');
      return;
    }
    const position = mascotRuntime.position || { left: drag.left, top: drag.top };
    mascotSetPosition(position.left, position.top);
    mascotSyncPanelSide();
    mascotScheduleDock();
    mascotSetReaction('delighted', 760);
    mascotSetAction('land', 760);
    mascotShowSpeech(mascotRandomMessage(MASCOT_DRAG_MESSAGES), 1800, 'land');
    return;
  }
  if (!cancelled) {
    mascotSetReaction('blink', 520);
    mascotSetAction(mascotTopActionActive() ? 'hop' : 'tap', 520);
    mascotHandleTap();
  }
}
function mascotUpdateDrag(event) {
  const drag = mascotRuntime.drag;
  if (!drag || (event.pointerId != null && event.pointerId !== drag.pointerId)) return;
  const dx = event.clientX - drag.startX; const dy = event.clientY - drag.startY;
  if (!drag.moved && Math.hypot(dx, dy) < 6) return;
  drag.moved = true;
  if (event.cancelable) event.preventDefault();
  mascotSetAction('drag');
  mascotSetDirectionFromVector(dx, dy);
  mascotSetPosition(drag.left + dx, drag.top + dy, false);
}
function mascotHandleTap() {
  if (Date.now() < mascotRuntime.suppressClickUntil) return;
  const now = Date.now();
  clearTimeout(mascotRuntime.singleClickTimer);
  if (now - mascotRuntime.tapAt < 340) {
    mascotRuntime.tapAt = 0;
    mascotPlayTrick();
    return;
  }
  mascotRuntime.tapAt = now;
  mascotRuntime.singleClickTimer = window.setTimeout(() => {
    if (mascotTopActionActive()) { mascotSetAction('hop', 720); scrollAppTo(0, 'smooth'); return; }
    openMascotBriefing();
  }, 250);
}
function mascotLaunchRocket() {
  const root = mascotRuntime.root;
  if (!root) return;
  clearTimeout(mascotRuntime.launchTimer);
  closeMascotBriefing();
  mascotClearDockTimer();
  mascotReveal();
  root.classList.remove('is-playing-ball');
  root.classList.add('is-launching');
  mascotSetReaction('delighted', 1100);
  mascotSetAction('rocket', 1100);
  mascotShowSpeech(state.language === 'en' ? 'Rocket launch! Up we go!' : '咻——火箭发射，冲上去啦！', 1800, 'rocket');
  mascotRuntime.launchTimer = window.setTimeout(() => {
    root.classList.remove('is-launching');
    mascotSetAction('', 0);
    mascotScheduleDock();
  }, 1150);
}
function mascotPlayBall() {
  const root = mascotRuntime.root;
  if (!root) return;
  clearTimeout(mascotRuntime.ballTimer);
  closeMascotBriefing();
  mascotClearDockTimer();
  mascotReveal();
  root.classList.remove('is-launching');
  root.classList.add('is-playing-ball');
  mascotSetReaction('heart', 1200);
  mascotSetAction('ball', 1200);
  mascotShowSpeech(state.language === 'en' ? 'Catch it!' : '接住球球！', 1800, 'ball');
  mascotRuntime.ballTimer = window.setTimeout(() => {
    root.classList.remove('is-playing-ball');
    mascotSetAction('', 0);
    mascotScheduleDock();
  }, 1300);
}
function mountMascot() {
  if (mascotRuntime.root) return;
  const root = document.createElement('aside');
  root.id = 'oneboxMascotRoot'; root.className = 'onebox-mascot-root'; root.dataset.edge = 'right'; root.dataset.panelSide = 'right';
  root.innerHTML = '<span class="onebox-mascot-propeller" aria-hidden="true"><i></i><i></i><b></b></span><span class="onebox-mascot-rocket" aria-hidden="true">🚀</span><span class="onebox-mascot-ball" aria-hidden="true">⚽</span><div class="onebox-mascot-speech" role="status" aria-live="polite" hidden></div><div class="onebox-mascot-panel" hidden></div><button type="button" class="onebox-mascot-button" aria-label="查看今日速览"><span class="onebox-mascot-visual" aria-hidden="true"><span class="onebox-mascot-layer onebox-mascot-direction"></span><span class="onebox-mascot-layer onebox-mascot-reaction"></span><span class="onebox-mascot-fallback">🦊</span></span></button>';
  document.body.appendChild(root);
  mascotRuntime.root = root; mascotRuntime.button = $('.onebox-mascot-button', root); mascotRuntime.panel = $('.onebox-mascot-panel', root); mascotRuntime.speech = $('.onebox-mascot-speech', root); mascotRuntime.directionLayer = $('.onebox-mascot-direction', root); mascotRuntime.reactionLayer = $('.onebox-mascot-reaction', root);
  mascotRuntime.directionLayer.style.backgroundImage = 'url("' + MASCOT_ASSETS.directions + '")';
  mascotRuntime.reactionLayer.style.backgroundImage = 'url("' + MASCOT_ASSETS.reactions + '")';
  const saved = mascotPositionValue();
  if (saved) mascotSetPosition(saved.left, saved.top, false);
  else mascotSyncPanelSide();
  let loaded = 0;
  const markAssetLoaded = () => { loaded += 1; if (loaded === 2) root.classList.add('assets-loaded'); };
  const markAssetFailed = () => root.classList.add('assets-fallback');
  [MASCOT_ASSETS.directions, MASCOT_ASSETS.reactions].forEach((src) => { const image = new Image(); image.onerror = markAssetFailed; image.onload = markAssetLoaded; image.src = src; });
  root.addEventListener('pointerdown', (event) => {
    if (!event.target.closest?.('.onebox-mascot-button')) return;
    if (event.button != null && event.button !== 0) return;
    mascotReveal(); closeMascotBriefing();
    mascotHideSpeech();
    mascotSetAction('grab');
    const rect = root.getBoundingClientRect();
    mascotRuntime.drag = { pointerId: event.pointerId, startX: event.clientX, startY: event.clientY, left: rect.left, top: rect.top, moved: false };
    try { mascotRuntime.button.setPointerCapture?.(event.pointerId); } catch {}
  });
  mascotRuntime.button.addEventListener('pointermove', mascotUpdateDrag, { passive: false });
  mascotRuntime.button.addEventListener('pointerup', mascotFinishDrag, { passive: false });
  mascotRuntime.button.addEventListener('pointercancel', mascotFinishDrag, { passive: false });
  mascotRuntime.button.addEventListener('keydown', (event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); mascotHandleTap(); } });
  mascotRuntime.panel.addEventListener('click', (event) => {
    if (event.target.closest('[data-close-mascot]')) { closeMascotBriefing(); return; }
    const action = event.target.closest('[data-mascot-action]')?.dataset.mascotAction;
    if (action === 'pat') {
      closeMascotBriefing();
      mascotPlayReaction('heart');
      mascotShowSpeech(state.language === 'en' ? 'That tickles!' : '嘿嘿，好痒呀！', 1800, 'pat');
    }
    if (action === 'ball') mascotPlayBall();
    if (['weather', 'calendar', 'reader', 'navigation', 'calculator'].includes(action)) {
      closeMascotBriefing();
      mascotPlayReaction('sparkle');
      selectTool(action);
    }
    if (['home', 'messages', 'mine'].includes(action)) {
      closeMascotBriefing();
      mascotPlayReaction('sparkle');
      selectSection(action);
    }
  });
  document.addEventListener('pointerdown', (event) => { if (mascotRuntime.panel && mascotRuntime.root && !mascotRuntime.root.contains(event.target)) closeMascotBriefing(); }, true);
  if (window.matchMedia?.('(hover: hover) and (pointer: fine)').matches) window.addEventListener('pointermove', (event) => mascotAim({ x: event.clientX, y: event.clientY }), { passive: true });
  window.addEventListener('resize', () => { if (mascotRuntime.position) mascotSetPosition(mascotRuntime.position.left, mascotRuntime.position.top, false); mascotSyncPanelSide(); }, { passive: true });
  syncMascotVisibility();
}
let pendingNavigationRestore = null;
let navigationRestoreTimers = [];
function saveNavigationPosition() {
  try {
    const tabs = $('.feed-source-tabs');
    sessionStorage.setItem(NAVIGATION_SESSION_KEY, JSON.stringify({ hash: location.hash, section: state.section, tool: state.tool, homeFeedActive: state.homeFeed.active, mainScrollTop: appScrollTop(), sourceScrollLeft: tabs?.scrollLeft || 0, savedAt: Date.now() }));
  } catch { /* session storage may be disabled */ }
}
function clearNavigationRestoreTimers() {
  navigationRestoreTimers.forEach((timer) => clearTimeout(timer));
  navigationRestoreTimers = [];
}
function applyNavigationPosition(saved) {
  if (!saved || saved.hash !== location.hash) return;
  clearPageSwipeTrack();
  if (state.section === 'home' && homeTabIds().includes(saved.homeFeedActive) && state.homeFeed.active !== saved.homeFeedActive) {
    state.homeFeed.active = saved.homeFeedActive;
    render();
  }
  const tabs = $('.feed-source-tabs');
  const scrollElement = appScrollElement();
  if (scrollElement) {
    const requestedTop = Math.max(0, Number(saved.mainScrollTop) || 0);
    const maxTop = Math.max(0, scrollElement.scrollHeight - scrollElement.clientHeight);
    scrollAppTo(Math.min(requestedTop, maxTop), 'instant');
  }
  if (tabs) tabs.scrollLeft = Math.max(0, Number(saved.sourceScrollLeft) || 0);
  $('#bottomNav')?.classList.remove('is-blurred'); $('main')?.classList.remove('bottom-nav-blurred'); lastMainScrollTop = appScrollTop();
}
function restoreNavigationPosition() {
  let saved = null;
  try { saved = JSON.parse(sessionStorage.getItem(NAVIGATION_SESSION_KEY) || 'null'); sessionStorage.removeItem(NAVIGATION_SESSION_KEY); } catch { saved = null; }
  if (!saved || saved.hash !== location.hash || Date.now() - Number(saved.savedAt || 0) > 30 * 60 * 1000) return;
  clearNavigationRestoreTimers();
  pendingNavigationRestore = saved;
  const restore = () => {
    if (pendingNavigationRestore !== saved || saved.hash !== location.hash) return;
    applyNavigationPosition(saved);
  };
  requestAnimationFrame(restore);
  [100, 240, 420, 720, 1200, 1800].forEach((delay) => {
    navigationRestoreTimers.push(window.setTimeout(restore, delay));
  });
  navigationRestoreTimers.push(window.setTimeout(() => {
    if (pendingNavigationRestore === saved) pendingNavigationRestore = null;
    clearNavigationRestoreTimers();
  }, 2400));
}
let feedNavigationPending = false;
let feedNavigationTimer = null;
function clearFeedNavigationPending() {
  feedNavigationPending = false;
  clearTimeout(feedNavigationTimer);
  feedNavigationTimer = null;
  $$('.feed-item.is-opening').forEach((item) => {
    item.classList.remove('is-opening');
    item.removeAttribute('aria-busy');
  });
}
function recoverHomeLayoutAfterReturn() {
  syncOneBoxViewportMetrics();
  clearPageSwipeTrack();
  pageSwipeAnimationToken = 0;
  pageSwipeGesture = null;
  clearFeedNavigationPending();
  if (state.section !== 'home') return;
  const currentTop = pendingNavigationRestore ? Math.max(0, Number(pendingNavigationRestore.mainScrollTop) || 0) : appScrollTop();
  // A bfcache return should keep the already-rendered feed stable. Rebuild
  // only when the document lost its home view or there are no cached items;
  // otherwise the extra loading render is visible as a flash/jump.
  const hasCachedItems = homeFeedSources().some((source) => state.homeFeed.sources[source.id]?.items?.length);
  if (!workspace.querySelector('.home-page') || !hasCachedItems) render();
  else if (!state.homeFeed.loading) loadHomeFeeds();
  const restore = () => {
    syncOneBoxViewportMetrics();
    syncHomeFeedSurface();
    const scrollElement = appScrollElement();
    if (scrollElement) {
      const maxTop = Math.max(0, scrollElement.scrollHeight - scrollElement.clientHeight);
      const targetTop = Math.min(Math.max(0, currentTop), maxTop);
      if (Math.abs(scrollElement.scrollTop - targetTop) > 1) scrollAppTo(targetTop, 'instant');
    }
    $('main')?.classList.remove('bottom-nav-blurred');
    $('#bottomNav')?.classList.remove('is-blurred');
  };
  requestAnimationFrame(restore);
  window.setTimeout(restore, 180);
  window.setTimeout(restore, 420);
}
function openFeedLink(link) {
  const target = mobileFeedLink(feedItemByLink(link));
  if (!target) {
    toast(state.language === 'en' ? 'This article link is unavailable' : '这篇文章暂时没有可用链接', 'error');
    return false;
  }
  if (!navigator.onLine) {
    toast(state.language === 'en' ? 'You are offline. Please try again later.' : '当前处于离线状态，请联网后重试', 'error');
    return false;
  }
  if (feedNavigationPending) return false;
  const item = $$('.feed-item').find((node) => node.dataset.feedLink === link);
  item?.classList.add('is-opening');
  item?.setAttribute('aria-busy', 'true');
  feedNavigationPending = true;
  if (state.openMode === 'new-tab') {
    const opened = window.open(target, '_blank', 'noopener,noreferrer');
    clearFeedNavigationPending();
    if (!opened) toast(state.language === 'en' ? 'The new tab was blocked by the browser' : '浏览器拦截了新标签页，请允许后重试', 'error');
    return Boolean(opened);
  }
  saveNavigationPosition();
  feedNavigationTimer = window.setTimeout(() => {
    if (document.visibilityState === 'visible') {
      clearFeedNavigationPending();
      toast(state.language === 'en' ? 'The article could not be opened. Please try again.' : '文章页面暂时无法打开，请稍后重试', 'error');
    }
  }, 4200);
  try { window.location.assign(target); return true; }
  catch {
    clearFeedNavigationPending();
    toast(state.language === 'en' ? 'The article could not be opened' : '文章页面打开失败', 'error');
    return false;
  }
}
function homeSourceTabsMarkup() {
  const sources = homeFeedSources();
  const sourceTabs = sources.map((source, index) => '<button class="feed-source-tab ' + (state.homeFeed.active === source.id ? 'active' : '') + '" draggable="true" data-feed-source="' + source.id + '" data-feed-source-index="' + index + '">' + homeTabMarkMarkup(source) + '<span>' + escapeHtml(source.name) + '</span></button>').join('');
  const footprintTab = state.footprint ? '<button class="feed-source-tab ' + (state.homeFeed.active === 'footprint' ? 'active' : '') + '" data-feed-source="footprint" aria-label="' + t('footprint') + '">' + homeTabMarkMarkup({ id: 'footprint' }) + '<span>' + t('footprint') + '</span></button>' : '';
  return sourceTabs + footprintTab;
}
function homeSourcePickerMarkup() {
  const options = homeTabEntries().map((entry) => {
    const selected = homeTabIsVisible(entry.id);
    const actionLabel = selected ? t('homeSourceRemove') : t('homeSourceAdd');
    const actionIcon = selected ? '<path d="M6 12h12"/>' : '<path d="M12 6v12M6 12h12"/>';
    return '<div class="home-source-option ' + (selected ? 'is-selected' : '') + '"><span class="home-source-option-mark">' + homeTabMarkMarkup(entry) + '</span><span class="home-source-option-copy"><strong>' + escapeHtml(entry.name) + '</strong></span><button class="home-source-option-action" type="button" data-home-source-toggle="' + escapeHtml(entry.id) + '" aria-label="' + escapeHtml(actionLabel + ' ' + entry.name) + '"><svg viewBox="0 0 24 24" aria-hidden="true">' + actionIcon + '</svg></button></div>';
  }).join('');
  return '<div class="dialog-card home-source-dialog-card" role="dialog" aria-modal="true"><div class="dialog-head"><div><h2>' + escapeHtml(t('homeSourceManage')) + '</h2><p class="home-source-dialog-hint">' + escapeHtml(t('homeSourceManageHint')) + '</p></div><button class="icon-btn small" data-close-home-source aria-label="' + t('close') + '">×</button></div><div class="home-source-options">' + (options || '<p class="empty compact">' + escapeHtml(t('homeSourceEmpty')) + '</p>') + '</div></div>';
}
function renderHomeSourceDialog() {
  const dialog = $('#homeSourceDialog');
  if (!dialog) return;
  dialog.innerHTML = homeSourcePickerMarkup();
  dialog.hidden = !state.homeSourceDialogOpen;
}
function openHomeSourceDialog() {
  state.homeSourceDialogOpen = true;
  renderHomeSourceDialog();
}
function closeHomeSourceDialog() {
  const dialog = $('#homeSourceDialog');
  if (dialog) dialog.hidden = true;
  state.homeSourceDialogOpen = false;
}
function renderHomeSourceNav() {
  homeSourceNav.hidden = state.section !== 'home';
  const previousTabs = homeSourceNav.querySelector('.feed-source-tabs');
  const previousScrollLeft = previousTabs?.scrollLeft || 0;
  homeSourceNav.innerHTML = state.section === 'home' ? '<div class="feed-source-panel"><button class="feed-source-scroll-button" data-feed-source-scroll="previous" type="button" hidden aria-label="' + escapeHtml(t('feedTabPrevious')) + '"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5.25 8.25 12 15 18.75"/></svg></button><div class="feed-source-tabs" role="tablist" aria-label="RSS 来源">' + homeSourceTabsMarkup() + '</div><button class="feed-source-scroll-button" data-feed-source-scroll="next" type="button" hidden aria-label="' + escapeHtml(t('feedTabNext')) + '"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 5.25 15.75 12 9 18.75"/></svg></button><button class="feed-source-manage" type="button" data-open-home-source-picker aria-label="' + escapeHtml(t('homeSourceManage')) + '"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg></button></div>' : '';
  const nextTabs = homeSourceNav.querySelector('.feed-source-tabs');
  if (nextTabs) {
    nextTabs.scrollLeft = Math.min(previousScrollLeft, Math.max(0, nextTabs.scrollWidth - nextTabs.clientWidth));
    nextTabs.addEventListener('scroll', updateHomeFeedOverflowControls, { passive: true });
    requestAnimationFrame(updateHomeFeedOverflowControls);
  }
}
function renderHome() {
  const isFootprint = state.homeFeed.active === 'footprint';
  const sourceItems = isFootprint ? recentFeedItems() : (state.homeFeed.sources[state.homeFeed.active]?.items || []);
  const cutoff = Date.now() - RSS_RETENTION_MS;
  const items = sourceItems.filter((item) => { const timestamp = feedItemTimestamp(item); return !Number.isFinite(timestamp) || timestamp >= cutoff; });
  if (!isFootprint) items.sort((a, b) => (feedItemTimestamp(b) || 0) - (feedItemTimestamp(a) || 0));
  const visibleItems = items.slice(0, RSS_MAX_ITEMS_PER_SOURCE);
  const hasItems = visibleItems.length > 0;
  const errors = Object.keys(state.homeFeed.errors || {}).length;
  const feedBody = state.homeFeed.loading && !hasItems && !isFootprint ? '<div class="feed-loading"><span></span><span></span><span></span></div>' : hasItems ? '<div class="feed-list">' + visibleItems.map(renderFeedItem).join('') + '</div>' : '<p class="empty feed-empty">' + (isFootprint ? (state.language === 'en' ? 'No articles read yet.' : '还没有阅读过首页消息。') : t('feedEmpty')) + '</p>';
  // Keep cached rows in place while a background refresh is running. Showing
  // a new row above them makes the whole feed jump when returning from an
  // external article; only an empty feed needs the blocking loading state.
  const refreshState = state.homeFeed.loading && !hasItems ? '<div class="feed-refresh-state" role="status"><span></span>' + (state.language === 'en' ? 'Refreshing' : '正在刷新') + '</div>' : '';
  return '<div class="home-page feed-home"><section class="feed-panel">' + refreshState + (errors ? '<p class="feed-warning">' + t('feedPartial') + '</p>' : '') + feedBody + '<p class="feed-hint">' + t('feedProxyHint') + (state.homeFeed.updatedAt ? ' · ' + t('feedUpdated') + ' ' + escapeHtml(feedDate(state.homeFeed.updatedAt)) : '') + '</p></section></div>';
}
function navigationIconMarkup(site, extraClass = '') {
  const generatedSources = navigationIconSources(site?.url);
  const preferredIcon = site?.icon && !isNavigationIconServiceUrl(site.icon) ? site.icon : '';
  const preferGenerated = navigationUsesDesktopBrandIcon(site?.url) || navigationUsesOneBoxBrandIcon(site?.url);
  const sources = preferGenerated
    ? [...new Set([...generatedSources, preferredIcon].filter(Boolean))]
    : [...new Set([preferredIcon, ...generatedSources].filter(Boolean))];
  const icon = sources.shift() || '';
  const fallbackAttribute = sources.length ? ' data-fallback-sources="' + escapeHtml(sources.join('|')) + '"' : '';
  return '<span class="navigation-site-icon ' + extraClass + '"><img src="' + escapeHtml(icon) + '" alt="" loading="lazy" referrerpolicy="no-referrer"' + fallbackAttribute + ' onload="handleNavigationIconLoad(this)" onerror="handleNavigationIconError(this)"><span class="navigation-icon-fallback" hidden aria-hidden="true"><span class="navigation-fallback-glyph"><i></i><i></i><i></i><i></i></span></span></span>';
}
function advanceNavigationIcon(image, allowLowResolution = false) {
  if (!image?.dataset?.fallbackSources) return false;
  if (allowLowResolution && Number(image.naturalWidth || 0) >= 64) return false;
  const sources = image.dataset.fallbackSources.split('|').filter(Boolean);
  const next = sources.shift();
  image.dataset.fallbackSources = sources.join('|');
  if (!next) return false;
  image.src = next;
  return true;
}
function showNavigationIconFallback(image) {
  if (!image) return;
  image.hidden = true;
  image.nextElementSibling?.removeAttribute('hidden');
}
function handleNavigationIconLoad(image) {
  if (!image) return;
  if (Number(image.naturalWidth || 0) >= 64) return;
  if (advanceNavigationIcon(image, true)) return;
  showNavigationIconFallback(image);
}
function handleNavigationIconError(image) {
  if (advanceNavigationIcon(image)) return;
  showNavigationIconFallback(image);
}
function navigationItemMarkup(item, index = 0, folderId = '') {
  const folderAttribute = folderId ? ' data-navigation-folder-id="' + escapeHtml(folderId) + '"' : '';
  const indexAttribute = ' data-navigation-index="' + index + '"';
  const deleteButton = '<button class="navigation-delete-action" type="button" data-navigation-delete="' + escapeHtml(item.id) + '" aria-label="' + escapeHtml(t('navigationRemove') + ' ' + item.name) + '"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 12h12"/></svg></button>';
  const editButton = item.type === 'site' ? '<button class="navigation-edit-action" type="button" data-navigation-edit="' + escapeHtml(item.id) + '" aria-label="' + escapeHtml(t('navigationEdit') + ' ' + item.name) + '"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m5 16.5-.7 3.2 3.2-.7L18.8 7.7a2.2 2.2 0 0 0-3.1-3.1L5 16.5Z"/><path d="m14.5 6.5 3 3"/></svg></button>' : '';
  const openButton = '<button class="navigation-open-action" type="button" data-navigation-open-action aria-label="' + escapeHtml(t('navigationOpen') + ' ' + item.name) + '"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 17 17 7M9 7h8v8"/></svg></button>';
  const actionButtons = '<span class="navigation-card-actions" role="group" aria-label="' + escapeHtml(t('navigationTitle')) + '"><span class="navigation-primary-actions">' + openButton + '</span><span class="navigation-secondary-actions">' + editButton + deleteButton + '</span></span>';
  if (item.type === 'folder') {
    const preview = item.children.slice(0, 4).map((site) => navigationIconMarkup(site, 'navigation-folder-site-icon')).join('') || '<span class="navigation-folder-empty-icon">＋</span>';
    return '<article class="navigation-card navigation-folder-card" data-navigation-item data-navigation-type="folder" data-navigation-id="' + escapeHtml(item.id) + '"' + indexAttribute + '>' + actionButtons + '<button class="navigation-card-main" type="button" data-navigation-open-folder="' + escapeHtml(item.id) + '" aria-label="' + escapeHtml(item.name) + '"><span class="navigation-folder-preview">' + preview + '</span><strong>' + escapeHtml(item.name) + '</strong><small>' + escapeHtml(t('navigationSiteCount').replace('{count}', String(item.children.length))) + '</small></button></article>';
  }
  const target = state.openMode === 'new-tab' ? ' target="_blank" rel="noreferrer"' : '';
  return '<article class="navigation-card navigation-site-card" data-navigation-item data-navigation-type="site" data-navigation-id="' + escapeHtml(item.id) + '"' + folderAttribute + indexAttribute + '>' + actionButtons + '<a class="navigation-card-main" data-navigation-open-site draggable="false" href="' + escapeHtml(item.url) + '"' + target + ' aria-label="' + escapeHtml(t('navigationOpen') + ' ' + item.name) + '">' + navigationIconMarkup(item) + '<strong>' + escapeHtml(item.name) + '</strong></a></article>';
}
function navigationFindFolder(id) { return state.navigation.items.find((item) => item.type === 'folder' && item.id === id) || null; }
function navigationFindRootItem(id) { return state.navigation.items.find((item) => item.id === id) || null; }
function navigationFindSite(id, folderId = '') {
  if (folderId) return navigationFindFolder(folderId)?.children.find((site) => site.id === id) || null;
  return state.navigation.items.find((item) => item.type === 'site' && item.id === id) || null;
}
function navigationEverySite() {
  return state.navigation.items.flatMap((item) => item.type === 'folder' ? item.children : [item]).filter((item) => item.type === 'site');
}
function saveNavigation() { saveStored(STORAGE.navigation, state.navigation); }
function openNavigationSite(link) {
  const url = safeExternalUrl(link?.getAttribute('href'));
  if (!url) return false;
  if (link?.target === '_blank') {
    const opened = window.open(url, '_blank', 'noopener,noreferrer');
    if (!opened) {
      // Safari can return null for a successful tab open when opener access is
      // disabled. Keep a native-anchor fallback for browsers that reject the
      // scripted call, while still executing it inside the user's click.
      const fallback = document.createElement('a');
      fallback.href = url;
      fallback.target = '_blank';
      fallback.rel = 'noreferrer';
      fallback.hidden = true;
      document.body.appendChild(fallback);
      fallback.click();
      fallback.remove();
    }
    return true;
  }
  window.location.assign(url);
  return true;
}
function clearNavigationActionCards(except = null) {
  $$('#workspace[data-tool="navigation"] .navigation-card.navigation-actions-visible').forEach((card) => {
    if (card !== except) card.classList.remove('navigation-actions-visible');
  });
}
function navigationSettingsMarkup() {
  if (!state.navigationSettingsOpen) return '';
  const current = state.openMode === 'new-tab' ? 'new-tab' : 'current';
  const option = (value, label, icon) => '<button type="button" class="navigation-settings-option ' + (current === value ? 'is-selected' : '') + '" data-navigation-open-mode="' + value + '" aria-pressed="' + String(current === value) + '"><span class="navigation-settings-option-icon">' + icon + '</span><span>' + escapeHtml(label) + '</span><span class="navigation-settings-check" aria-hidden="true">' + (current === value ? '✓' : '') + '</span></button>';
  return '<div class="navigation-settings-popover" role="dialog" aria-label="' + escapeHtml(t('navigationSettings')) + '"><div class="navigation-settings-label">' + escapeHtml(t('navigationOpenModeHint')) + '</div><div class="navigation-settings-options">' + option('current', t('navigationOpenModeCurrent'), '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M12 5l7 7-7 7"/></svg>') + option('new-tab', t('navigationOpenModeNewTab'), '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 4h13v13M20 4 10 14"/><path d="M17 20H4V7"/></svg>') + '</div></div>';
}
function syncNavigationSettingsPopover(button = $('#workspace[data-tool="navigation"] [data-open-navigation-settings]')) {
  if (!button) return;
  button.setAttribute('aria-expanded', String(state.navigationSettingsOpen));
  const tools = button.closest('.navigation-page-tools');
  if (!tools) return;
  tools.querySelector('.navigation-settings-popover')?.remove();
  if (state.navigationSettingsOpen) button.insertAdjacentHTML('afterend', navigationSettingsMarkup());
}
function renderNavigation() {
  const items = state.navigation.items || [];
  const emptyBody = '<button class="navigation-card navigation-empty-add-card" type="button" data-open-navigation-add aria-label="' + escapeHtml(t('navigationAdd')) + '"><span class="navigation-add-glyph">＋</span><strong>' + escapeHtml(t('navigationAdd')) + '</strong><small>' + escapeHtml(t('navigationEmpty')) + '</small></button>';
  const body = items.length ? items.map((item, index) => navigationItemMarkup(item, index)).join('') + '<button class="navigation-card navigation-add-card" type="button" data-open-navigation-add aria-label="' + escapeHtml(t('navigationAdd')) + '"><span class="navigation-add-glyph">＋</span><strong>' + escapeHtml(t('navigationAdd')) + '</strong></button>' : emptyBody;
  const settingsButtonMarkup = '<button class="icon-btn header-icon navigation-settings-button" type="button" data-open-navigation-settings aria-expanded="' + String(state.navigationSettingsOpen) + '" aria-label="' + escapeHtml(t('navigationSettings')) + '"><svg class="header-line-icon settings-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h10M18 7h2M4 12h2M10 12h10M4 17h10M18 17h2"/><circle cx="16" cy="7" r="2"/><circle cx="8" cy="12" r="2"/><circle cx="16" cy="17" r="2"/></svg></button>';
  const toolbarCopy = '<div class="navigation-toolbar-copy"><strong class="navigation-toolbar-title">' + escapeHtml(t('navigationSettings')) + '</strong><span class="navigation-toolbar-caption">' + escapeHtml(t('navigationToolbarHint')) + '</span></div>';
  return '<div class="section-page navigation-page"><div class="navigation-page-toolbar">' + toolbarCopy + '<div class="navigation-page-tools">' + settingsButtonMarkup + navigationSettingsMarkup() + '</div></div><div class="navigation-grid">' + body + '</div></div>';
}
function renderNavigationAddDialog(folderId = '', site = null) {
  const dialog = $('#navigationDialog'); if (!dialog) return;
  const folder = folderId ? navigationFindFolder(folderId) : null;
  const editing = Boolean(site);
  const title = editing ? t('navigationEdit') : folder ? t('navigationAddToFolder') : t('navigationAdd');
  const url = site?.url || '';
  const name = site?.name || '';
  const preview = url ? navigationIconMarkup({ name, url, icon: site?.icon || navigationIconUrl(url) }, 'navigation-preview-icon') + '<span>' + escapeHtml(t('navigationIconHint')) + '</span>' : '<span class="navigation-preview-placeholder">' + escapeHtml(t('navigationIconHint')) + '</span>';
  const subtitle = folder && !editing ? '<p class="navigation-dialog-subtitle">' + escapeHtml(folder.name) + '</p>' : '';
  const action = editing ? t('navigationEditSave') : t('navigationSave');
  dialog.innerHTML = '<div class="dialog-card navigation-dialog-card" role="dialog" aria-modal="true"><div class="dialog-head"><div><h2>' + escapeHtml(title) + '</h2>' + subtitle + '</div><button class="icon-btn small" type="button" data-close-navigation-dialog aria-label="' + t('close') + '">×</button></div><form id="navigationSiteForm" class="navigation-form" data-navigation-mode="' + (editing ? 'edit' : 'add') + '" data-navigation-site-id="' + escapeHtml(site?.id || '') + '" data-navigation-folder-id="' + escapeHtml(folderId || '') + '"><div class="field navigation-url-field"><label for="navigationUrl">' + escapeHtml(t('navigationUrl')) + '</label><input id="navigationUrl" name="url" type="url" required inputmode="url" autocomplete="url" value="' + escapeHtml(url) + '" placeholder="' + escapeHtml(t('navigationUrlPlaceholder')) + '" autofocus></div><div class="field"><label for="navigationName">' + escapeHtml(t('navigationName')) + '</label><input id="navigationName" name="name" maxlength="40" value="' + escapeHtml(name) + '" placeholder="' + escapeHtml(t('navigationNamePlaceholder')) + '"></div><div class="navigation-icon-preview" data-navigation-icon-preview>' + preview + '</div><button class="primary full-width" type="submit">' + escapeHtml(action) + '</button></form></div>';
  dialog.hidden = false;
}
function renderNavigationFolderDialog(folderId = '') {
  const dialog = $('#navigationDialog'); const folder = navigationFindFolder(folderId); if (!dialog || !folder) return;
  const children = folder.children.length ? folder.children.map((site, index) => navigationItemMarkup(site, index, folder.id)).join('') : '<p class="empty compact">' + escapeHtml(t('navigationFolderEmpty')) + '</p>';
  const trashIcon = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 7h14M9 7V4h6v3m-8 0 1 13h8l1-13M10 11v5M14 11v5"/></svg>';
  dialog.innerHTML = '<div class="dialog-card navigation-dialog-card navigation-folder-dialog-card" role="dialog" aria-modal="true"><div class="navigation-folder-dialog-toolbar"><span class="navigation-folder-dialog-context">' + escapeHtml(t('navigationFolder')) + '</span><button class="icon-btn small navigation-folder-close-button" type="button" data-close-navigation-dialog aria-label="' + t('close') + '">×</button></div><form id="navigationFolderForm" class="navigation-folder-form"><div class="field navigation-folder-name-field"><label for="navigationFolderName">' + escapeHtml(t('navigationFolderName')) + '</label><input id="navigationFolderName" name="name" maxlength="30" value="' + escapeHtml(folder.name) + '" required></div><div class="navigation-folder-sites">' + children + '</div><div class="navigation-folder-actions"><button class="primary" type="submit">' + escapeHtml(t('navigationSaveFolder')) + '</button><button class="secondary" type="button" data-navigation-add-in-folder>' + escapeHtml(t('navigationFolderAdd')) + '</button><button class="secondary navigation-danger-button" type="button" data-navigation-delete-folder>' + trashIcon + '<span>' + escapeHtml(t('navigationFolderDelete')) + '</span></button></div></form></div>';
  dialog.hidden = false;
}
function renderNavigationCreateFolderDialog() {
  const dialog = $('#navigationDialog'); const draft = state.navigationFolderDraft; if (!dialog || !draft) return;
  const first = navigationFindRootItem(draft.firstId); const second = navigationFindRootItem(draft.secondId); if (!first || !second || first.type !== 'site' || second.type !== 'site') return closeNavigationDialog();
  dialog.innerHTML = '<div class="dialog-card navigation-dialog-card" role="dialog" aria-modal="true"><div class="dialog-head"><div><h2 class="navigation-create-folder-title"><span>' + escapeHtml(t('navigationCreateFolder')) + '</span><small>' + escapeHtml(t('navigationDropHint')) + '</small></h2></div><button class="icon-btn small" type="button" data-close-navigation-dialog aria-label="' + t('close') + '">×</button></div><form id="navigationCreateFolderForm" class="navigation-folder-form"><div class="field"><label for="navigationFolderName">' + escapeHtml(t('navigationFolderName')) + '</label><input id="navigationFolderName" name="name" maxlength="30" placeholder="' + escapeHtml(t('navigationFolderPlaceholder')) + '" autofocus></div><div class="navigation-folder-draft"><span>' + navigationIconMarkup(first) + '<strong>' + escapeHtml(first.name) + '</strong></span><span>' + navigationIconMarkup(second) + '<strong>' + escapeHtml(second.name) + '</strong></span></div><button class="primary full-width" type="submit">' + escapeHtml(t('navigationCreateFolder')) + '</button></form></div>';
  dialog.hidden = false;
}
function renderNavigationDialog() {
  const dialog = $('#navigationDialog'); if (!dialog) return;
  if (!state.navigationDialog) { dialog.hidden = true; return; }
  if (state.navigationDialog.kind === 'folder') renderNavigationFolderDialog(state.navigationDialog.folderId);
  else if (state.navigationDialog.kind === 'create-folder') renderNavigationCreateFolderDialog();
  else if (state.navigationDialog.kind === 'actions') renderNavigationActionsDialog(state.navigationDialog.siteId, state.navigationDialog.folderId || '');
  else if (state.navigationDialog.kind === 'edit') renderNavigationAddDialog(state.navigationDialog.folderId || '', navigationFindSite(state.navigationDialog.siteId, state.navigationDialog.folderId || ''));
  else renderNavigationAddDialog(state.navigationDialog.folderId || '');
}
function openNavigationAddDialog(folderId = '') { state.navigationDialog = { kind: 'add', folderId }; renderNavigationDialog(); }
function openNavigationEditDialog(siteId, folderId = '') {
  const site = navigationFindSite(siteId, folderId);
  if (!site) return;
  state.navigationDialog = { kind: 'edit', folderId, siteId };
  renderNavigationDialog();
}
function openNavigationFolderDialog(folderId) { state.navigationDialog = { kind: 'folder', folderId }; renderNavigationDialog(); }
function openNavigationCreateFolderDialog(firstId, secondId) { state.navigationFolderDraft = { firstId, secondId }; state.navigationDialog = { kind: 'create-folder' }; renderNavigationDialog(); }
function renderNavigationActionsDialog(siteId, folderId = '') {
  const dialog = $('#navigationDialog');
  const item = folderId ? navigationFindSite(siteId, folderId) : navigationFindRootItem(siteId);
  if (!dialog || !item) return closeNavigationDialog();
  const isFolder = item.type === 'folder';
  const icon = isFolder ? '<span class="navigation-action-folder-icon"><span></span><span></span><span></span><span></span></span>' : navigationIconMarkup(item, 'navigation-action-icon');
  const title = isFolder ? item.name : item.name;
  const subtitle = isFolder ? t('navigationFolder') : navigationNameFromUrl(item.url);
  const editLabel = isFolder ? t('navigationFolderEdit') : t('navigationActionEdit');
  const deleteLabel = isFolder ? t('navigationFolderDelete') : t('navigationActionDelete');
  dialog.innerHTML = '<div class="dialog-card navigation-actions-dialog" role="dialog" aria-modal="true"><div class="navigation-action-summary">' + icon + '<div><strong>' + escapeHtml(title) + '</strong><small>' + escapeHtml(subtitle) + '</small></div></div><div class="navigation-action-list"><button type="button" data-navigation-action="edit"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m5 16.5-.7 3.2 3.2-.7L18.8 7.7a2.2 2.2 0 0 0-3.1-3.1L5 16.5Z"/><path d="m14.5 6.5 3 3"/></svg><span>' + escapeHtml(editLabel) + '</span></button><button type="button" class="danger" data-navigation-action="delete"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 7h14M9 7V4h6v3m-8 0 1 13h8l1-13M10 11v5M14 11v5"/></svg><span>' + escapeHtml(deleteLabel) + '</span></button><button type="button" class="cancel" data-navigation-action="cancel">' + escapeHtml(t('navigationActionCancel')) + '</button></div></div>';
  dialog.hidden = false;
}
function openNavigationActionsDialog(siteId, folderId = '') {
  state.navigationDialog = { kind: 'actions', siteId, folderId };
  renderNavigationDialog();
}
function closeNavigationDialog() { state.navigationDialog = null; state.navigationFolderDraft = null; navigationSuppressClickUntil = 0; const dialog = $('#navigationDialog'); if (dialog) dialog.hidden = true; }
function addNavigationSite(urlValue, nameValue, folderId = '') {
  const url = navigationSafeUrl(urlValue);
  if (!url) return toast(t('navigationInvalidUrl'), 'error');
  if (navigationEverySite().some((site) => site.url === url)) return toast(t('navigationAlreadyExists'), 'error');
  const site = { id: 'site-' + uid(), type: 'site', name: String(nameValue || '').trim() || navigationNameFromUrl(url), url, icon: navigationIconUrl(url), createdAt: Date.now() };
  if (folderId) {
    const folder = navigationFindFolder(folderId); if (!folder) return toast(t('navigationInvalidUrl'), 'error');
    folder.children.push(site);
  } else state.navigation.items.push(site);
  saveNavigation(); closeNavigationDialog(); render(); toast(t('navigationAdded'));
}
function editNavigationSite(siteId, folderId, urlValue, nameValue) {
  const site = navigationFindSite(siteId, folderId);
  const url = navigationSafeUrl(urlValue);
  if (!site || !url) return toast(t('navigationInvalidUrl'), 'error');
  if (navigationEverySite().some((candidate) => candidate.id !== siteId && candidate.url === url)) return toast(t('navigationAlreadyExists'), 'error');
  site.url = url;
  site.name = String(nameValue || '').trim() || navigationNameFromUrl(url);
  site.icon = navigationIconUrl(url);
  saveNavigation(); closeNavigationDialog(); render(); toast(t('navigationEditSave'));
}
function deleteNavigationSite(siteId, folderId = '') {
  if (folderId) {
    const folder = navigationFindFolder(folderId); if (folder) folder.children = folder.children.filter((site) => site.id !== siteId);
  } else state.navigation.items = state.navigation.items.filter((item) => item.id !== siteId);
  saveNavigation(); closeNavigationDialog(); render(); toast(t('navigationDeleted'));
}
function deleteNavigationFolder(folderId) {
  const folderIndex = state.navigation.items.findIndex((item) => item.id === folderId && item.type === 'folder'); const folder = folderIndex >= 0 ? state.navigation.items[folderIndex] : null; if (!folder) return;
  if (!window.confirm(t('navigationFolderDeleteConfirm'))) return;
  state.navigation.items.splice(folderIndex, 1, ...folder.children);
  saveNavigation(); closeNavigationDialog(); render(); toast(t('navigationFolderDissolved'));
}
function moveNavigationSiteToFolder(siteId, folderId) {
  const siteIndex = state.navigation.items.findIndex((item) => item.id === siteId && item.type === 'site');
  const folder = navigationFindFolder(folderId); if (siteIndex < 0 || !folder) return;
  const [site] = state.navigation.items.splice(siteIndex, 1); folder.children.push(site);
  saveNavigation(); render(); toast(t('navigationMoved'));
}
function swapNavigationRootItems(firstId, secondId) {
  const first = state.navigation.items.findIndex((item) => item.id === firstId); const second = state.navigation.items.findIndex((item) => item.id === secondId);
  if (first < 0 || second < 0 || first === second) return;
  [state.navigation.items[first], state.navigation.items[second]] = [state.navigation.items[second], state.navigation.items[first]];
  saveNavigation(); render(); toast(t('navigationOrderSaved'));
}
function createNavigationFolder(nameValue, firstId, secondId) {
  const firstIndex = state.navigation.items.findIndex((item) => item.id === firstId && item.type === 'site'); const secondIndex = state.navigation.items.findIndex((item) => item.id === secondId && item.type === 'site');
  if (firstIndex < 0 || secondIndex < 0 || firstIndex === secondIndex) return closeNavigationDialog();
  const first = state.navigation.items[firstIndex]; const second = state.navigation.items[secondIndex]; const insertAt = Math.min(firstIndex, secondIndex);
  state.navigation.items = state.navigation.items.filter((item) => item.id !== firstId && item.id !== secondId);
  state.navigation.items.splice(insertAt, 0, { id: 'folder-' + uid(), type: 'folder', name: String(nameValue || '').trim() || t('navigationFolder'), children: [first, second], createdAt: Date.now() });
  saveNavigation(); closeNavigationDialog(); render(); toast(t('navigationFolderCreated'));
}
function notificationRowMarkup(item) {
  return '<div class="swipe-row notification-swipe-row" data-swipe-row><div class="notification-item swipe-content ' + (item.read ? '' : 'unread') + '"><div><strong>' + escapeHtml(item.text) + '</strong><small>' + new Intl.DateTimeFormat(state.language === 'en' ? 'en-US' : 'zh-CN', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(item.at)) + '</small></div></div><button class="swipe-delete" data-delete-notification="' + escapeHtml(item.id) + '" aria-label="' + t('close') + '">' + (state.language === 'en' ? 'Delete' : '删除') + '</button></div>';
}
function notificationItemsMarkup() {
  const items = [...state.notifications].sort((a, b) => Number(b.at) - Number(a.at));
  if (!items.length) return '<p class="empty compact">' + t('noMessages') + '</p>';
  return items.map(notificationRowMarkup).join('');
}
function renderMessages() {
  return '<div class="section-page message-page"><div class="message-panel"><div class="message-panel-head"><button class="secondary compact-action" data-mark-notifications-read>' + t('markRead') + '</button></div><div class="notification-list">' + notificationItemsMarkup() + '</div></div></div>';
}

function renderMine() {
  const githubStatus = state.github.user ? (state.github.user.login || 'GitHub') : t('githubNotConnected');
  const icon = (name) => ({
    settings: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h10M18 7h2M4 12h2M10 12h10M4 17h10M18 17h2"/><circle cx="16" cy="7" r="2"/><circle cx="8" cy="12" r="2"/><circle cx="16" cy="17" r="2"/></svg>',
    github: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 18h10a3.5 3.5 0 0 0 .5-6.96A5.5 5.5 0 0 0 7 9.5a4.25 4.25 0 0 0 0 8.5Z"/><path d="m12 12 2-2m-2 2-2-2m2 2v4"/></svg>',
    reading: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 4h8l3 3v5M14 4v4h4M9 12h3M9 16h3"/><circle cx="16.5" cy="16.5" r="3.5"/><path d="M16.5 14.8v1.9l1.2.7"/></svg>',
    agreement: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m12 3.5 7 2.6v5.1c0 4.7-3 8.1-7 9.3-4-1.2-7-4.6-7-9.3V6.1L12 3.5Z"/><path d="m8.7 12 2.2 2.2 4.5-4.5"/></svg>',
  })[name];
  const row = (action, glyph, title, description) => '<button class="mine-row" ' + action + '><span class="mine-row-icon">' + icon(glyph) + '</span><span class="mine-row-copy"><strong>' + title + '</strong><small class="mine-row-description">' + description + '</small></span><span>›</span></button>';
  const updateBusy = state.updateChecking || state.updateApplying;
  const updateStatus = state.updateApplying ? t('updateApplying') : state.updateChecking ? t('updating') : state.updateAvailable ? t('updateAvailable') : state.updateError ? t('updateCheckFailed') : t('upToDate');
  const updateProgress = updateBusy ? '<span class="update-progress" role="status" aria-label="' + escapeHtml(updateStatus) + '"><span class="update-progress-dots" aria-hidden="true"><i>.</i><i>.</i><i>.</i></span></span>' : '<span class="update-status-label">' + escapeHtml(updateStatus) + '</span>';
  const updateButton = state.updateAvailable ? '<button class="primary mine-update-button" data-apply-update ' + (state.updateApplying ? 'disabled' : '') + '>' + (state.updateApplying ? t('updateApplying') : t('applyUpdate')) + '</button>' : '<button class="primary mine-update-button" data-check-update ' + (state.updateChecking || state.updateApplying ? 'disabled' : '') + '>' + t('checkUpdate') + '</button>';
  const updateRow = '<div class="mine-row mine-update-row"><span class="mine-row-icon"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 4v10M8 10l4 4 4-4M5 19h14"/></svg></span><span class="mine-row-copy mine-update-copy"><strong>' + t('appUpdate') + '</strong><small class="mine-row-description">v' + APP_VERSION + (updateBusy ? ' ' : ' · ') + updateProgress + '</small></span><span class="mine-row-action">' + updateButton + '</span></div>';
  return '<div class="section-page mine-page"><div class="mine-list">' + row('data-open-settings-page', 'settings', t('settings'), state.language === 'en' ? 'Theme, language, color and display' : '主题、语言、颜色与显示设置') + row('data-open-github-page', 'github', 'GitHub', escapeHtml(githubStatus)) + updateRow + row('data-open-agreement-page', 'agreement', t('userAgreement'), state.language === 'en' ? 'Learn how OneBox handles data' : '了解 OneBox 如何处理数据') + '</div></div>';
}

function recentFeedItems() {
  const items = new Map();
  Object.values(state.homeFeed.sources || {}).forEach((source) => (source.items || []).forEach((item) => {
    const readAt = Number(state.homeFeedRead[item.id] || 0);
    if (readAt && !items.has(item.id)) items.set(item.id, { item, readAt });
  }));
  return [...items.values()].sort((a, b) => b.readAt - a.readAt).map(({ item }) => item);
}
function renderRecentReading() {
  const dialog = $('#recentReadingDialog');
  if (!dialog) return;
  const items = recentFeedItems();
  const body = items.length ? '<div class="feed-list recent-reading-list">' + items.map(renderFeedItem).join('') + '</div>' : '<p class="empty compact">' + (state.language === 'en' ? 'No articles read yet.' : '还没有阅读过首页消息。') + '</p>';
  dialog.innerHTML = '<div class="dialog-card recent-reading-dialog-card" role="dialog" aria-modal="true"><div class="dialog-head"><h2>' + (state.language === 'en' ? 'Recent reading' : '最近阅读') + '</h2><button class="icon-btn small" data-close-recent-reading aria-label="' + t('close') + '">×</button></div>' + body + '</div>';
  dialog.hidden = false;
  state.recentReadingOpen = true;
}
function closeRecentReading() {
  const dialog = $('#recentReadingDialog');
  if (dialog) dialog.hidden = true;
  state.recentReadingOpen = false;
}

// Reader --------------------------------------------------------------------
function saveLibrary() { saveStored(STORAGE.library, state.library.slice(0, 80)); }
function saveReaderLayout() { localStorage.setItem(STORAGE.readerLayout, state.readerLayout); }
function readerBookById(id) { return state.library.find((book) => book.id === id); }
function readerHeadingId(index) { return 'reader-heading-' + index; }
function readerTextToc(source) {
  const lines = String(source || '').replace(/\r\n?/g, '\n').split('\n');
  const items = [];
  const chapterPattern = /^(?:第\s*[0-9０-９零〇一二三四五六七八九十百千万两]+\s*[章回节卷部篇集话]|[一二三四五六七八九十百千万两]+[、.．]|chapter\s+\d+|part\s+[0-9ivxlc]+|序章|序言|前言|引子|楔子|尾声|后记|番外|附录)(?:\s+|[:：、.．-])?.{0,42}$/i;
  lines.forEach((line, index) => {
    const trimmed = line.trim();
    if (!trimmed) return;
    const markdown = trimmed.match(/^(#{1,6})\s+(.+?)\s*#*$/);
    if (markdown) {
      items.push({ id: readerHeadingId(items.length), label: markdown[2].trim(), depth: Math.min(3, markdown[1].length - 1), line: index, markdown: true });
      return;
    }
    if (trimmed.length <= 48 && chapterPattern.test(trimmed)) items.push({ id: readerHeadingId(items.length), label: trimmed, depth: 0, line: index });
  });
  return items;
}
function readerDecodeText(bytes) {
  try { return new TextDecoder('utf-8', { fatal: true }).decode(bytes); } catch {
    try { return new TextDecoder('gb18030').decode(bytes); } catch { return new TextDecoder().decode(bytes); }
  }
}
function markdownToHtml(source) {
  const sourceToc = readerTextToc(source);
  const markdownToc = sourceToc.filter((item) => item.markdown);
  let markdownHeadingIndex = 0;
  const blocks = String(source || '').replace(/\r\n?/g, '\n').split(/\n{2,}/).map((rawBlock, blockIndex) => {
    const block = escapeHtml(rawBlock);
    if (/^```/.test(rawBlock)) return '<pre><code>' + block.replace(/^```[^\n]*\n?/, '').replace(/```$/, '') + '</code></pre>';
    const heading = rawBlock.match(/^(#{1,6})\s+(.+?)\s*#*$/);
    if (heading) {
      const tocItem = markdownToc[markdownHeadingIndex++] || { id: readerHeadingId(blockIndex) };
      return '<h' + Math.min(3, heading[1].length) + ' id="' + tocItem.id + '">' + escapeHtml(heading[2].trim()) + '</h' + Math.min(3, heading[1].length) + '>';
    }
    if (/^> /.test(rawBlock)) return '<blockquote>' + block.replace(/^&gt; /gm, '') + '</blockquote>';
    if (/^(?:[-*] |\d+\. )/.test(block)) {
      const ordered = /^\d+\. /.test(rawBlock);
      const items = block.split('\n').map((line) => '<li>' + line.replace(/^(?:[-*] |\d+\. )/, '') + '</li>').join('');
      return '<' + (ordered ? 'ol' : 'ul') + '>' + items + '</' + (ordered ? 'ol' : 'ul') + '>';
    }
    return '<p>' + block.replace(/\n/g, '<br>') + '</p>';
  });
  return blocks.join('');
}
function textToHtml(source) {
  const lines = String(source || '').replace(/\r\n?/g, '\n').split('\n');
  const toc = readerTextToc(source);
  const chapters = new Map(toc.map((item) => [item.line, item]));
  const blocks = [];
  let paragraph = [];
  const flush = () => { if (paragraph.length) { blocks.push('<p>' + escapeHtml(paragraph.join('\n')).replace(/\n/g, '<br>') + '</p>'); paragraph = []; } };
  lines.forEach((line, index) => {
    const chapter = chapters.get(index);
    if (chapter) { flush(); blocks.push('<h2 id="' + chapter.id + '">' + escapeHtml(chapter.label) + '</h2>'); return; }
    if (!line.trim()) { flush(); return; }
    paragraph.push(line);
  });
  flush();
  return blocks.join('');
}
function sanitizeReaderMarkup(markup) {
  const documentFragment = new DOMParser().parseFromString(String(markup || ''), 'text/html');
  documentFragment.querySelectorAll('script,style,iframe,object,embed,form,link,meta').forEach((node) => node.remove());
  documentFragment.querySelectorAll('*').forEach((node) => [...node.attributes].forEach((attribute) => {
    if (/^on/i.test(attribute.name) || attribute.name === 'srcdoc') node.removeAttribute(attribute.name);
  }));
  return documentFragment.body.innerHTML;
}
function zipEntries(bytes) {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  let eocd = -1;
  for (let index = bytes.length - 22; index >= Math.max(0, bytes.length - 65557); index -= 1) {
    if (view.getUint32(index, true) === 0x06054b50) { eocd = index; break; }
  }
  if (eocd < 0) throw Error('Invalid EPUB archive');
  const count = view.getUint16(eocd + 10, true);
  const offset = view.getUint32(eocd + 16, true);
  const decoder = new TextDecoder(); const entries = new Map(); let cursor = offset;
  for (let index = 0; index < count; index += 1) {
    if (view.getUint32(cursor, true) !== 0x02014b50) break;
    const method = view.getUint16(cursor + 10, true);
    const compressedSize = view.getUint32(cursor + 20, true);
    const nameLength = view.getUint16(cursor + 28, true);
    const extraLength = view.getUint16(cursor + 30, true);
    const commentLength = view.getUint16(cursor + 32, true);
    const localOffset = view.getUint32(cursor + 42, true);
    const name = decoder.decode(bytes.slice(cursor + 46, cursor + 46 + nameLength));
    entries.set(name, { method, compressedSize, localOffset });
    cursor += 46 + nameLength + extraLength + commentLength;
  }
  return entries;
}
async function readZipEntry(bytes, entries, name) {
  const entry = entries.get(name); if (!entry) return null;
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const local = entry.localOffset;
  const nameLength = view.getUint16(local + 26, true);
  const extraLength = view.getUint16(local + 28, true);
  const start = local + 30 + nameLength + extraLength;
  const data = bytes.slice(start, start + entry.compressedSize);
  if (entry.method === 0) return data;
  if (entry.method !== 8 || !window.DecompressionStream) throw Error('This EPUB compression is not supported');
  const stream = new Blob([data]).stream().pipeThrough(new DecompressionStream('deflate-raw'));
  return new Uint8Array(await new Response(stream).arrayBuffer());
}
function xmlAttribute(tag, name) {
  return tag.match(new RegExp(`${name}\\s*=\\s*["']([^"']+)`, 'i'))?.[1] || '';
}
function readerPath(dir, href) {
  const rawPath = String(dir || '') + String(href || '').split('#')[0];
  let normalizedPath = rawPath;
  try { normalizedPath = decodeURIComponent(rawPath); } catch { /* keep the original path */ }
  const parts = normalizedPath.split('/');
  const resolved = [];
  parts.forEach((part) => { if (!part || part === '.') return; if (part === '..') resolved.pop(); else resolved.push(part); });
  return resolved.join('/');
}
function readerHrefParts(href) {
  const value = String(href || '');
  const hashIndex = value.indexOf('#');
  const queryIndex = value.indexOf('?');
  const pathEnd = [hashIndex, queryIndex].filter((index) => index >= 0).sort((a, b) => a - b)[0] ?? value.length;
  let anchor = hashIndex < 0 ? '' : value.slice(hashIndex + 1).split('?')[0];
  try { anchor = decodeURIComponent(anchor); } catch { /* keep the original anchor */ }
  return { path: value.slice(0, pathEnd), anchor };
}
function readerStripTags(value) { return String(value || '').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim(); }
const READER_COVER_MAX_BYTES = 180 * 1024;
function readerBytesToBase64(bytes) {
  let value = '';
  for (let index = 0; index < bytes.length; index += 0x8000) value += String.fromCharCode(...bytes.subarray(index, index + 0x8000));
  return btoa(value);
}
function readerImageMime(bytes, media = '', path = '') {
  if (!bytes?.length) return '';
  if (/^image\//i.test(media)) return media.split(';')[0].trim();
  const head = bytes.subarray(0, 16);
  let detected = '';
  if (head[0] === 0xff && head[1] === 0xd8 && head[2] === 0xff) detected = 'image/jpeg';
  else if (head[0] === 0x89 && head[1] === 0x50 && head[2] === 0x4e && head[3] === 0x47) detected = 'image/png';
  else if (head[0] === 0x47 && head[1] === 0x49 && head[2] === 0x46) detected = 'image/gif';
  else if (head[0] === 0x52 && head[1] === 0x49 && head[2] === 0x46 && head[8] === 0x57 && head[9] === 0x45 && head[10] === 0x42 && head[11] === 0x50) detected = 'image/webp';
  else if (/^\s*(?:<\?xml[^>]*>\s*)?<svg\b/i.test(new TextDecoder().decode(bytes.subarray(0, 600)))) detected = 'image/svg+xml';
  if (detected) return detected;
  const extension = String(path || '').split(/[?#]/)[0].split('.').pop()?.toLowerCase();
  return ({ jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', gif: 'image/gif', webp: 'image/webp', svg: 'image/svg+xml', avif: 'image/avif', bmp: 'image/bmp' })[extension] || '';
}
function readerImageDataUrl(bytes, media = '') {
  if (!bytes?.length || bytes.length > READER_COVER_MAX_BYTES) return '';
  const mime = readerImageMime(bytes, media);
  return mime ? 'data:' + mime + ';base64,' + readerBytesToBase64(bytes) : '';
}
const READER_EMBEDDED_IMAGE_MAX_BYTES = 8 * 1024 * 1024;
function readerImageObjectUrl(bytes, media = '', path = '') {
  if (!bytes?.length || bytes.length > READER_EMBEDDED_IMAGE_MAX_BYTES || typeof URL.createObjectURL !== 'function') return '';
  const mime = readerImageMime(bytes, media, path);
  if (!mime) return '';
  const url = URL.createObjectURL(new Blob([bytes], { type: mime }));
  state.readerAssetUrls.push(url);
  return url;
}
function releaseReaderAssets() {
  (state.readerAssetUrls || []).forEach((url) => { try { URL.revokeObjectURL(url); } catch {} });
  state.readerAssetUrls = [];
}
function readerDefineCover(book, data) {
  if (!book || !data) return;
  Object.defineProperty(book, '_coverData', { value: data, writable: true, configurable: true, enumerable: false });
}
function readerMarkdownCover(source) {
  const value = String(source || '');
  const data = value.match(/(?:!\[[^\]]*\]\(|<img\b[^>]*src\s*=\s*["'])(data:image\/[a-z0-9.+-]+;base64,[^\s)"']+)/i)?.[1] || '';
  return /^data:image\//i.test(data) && data.length <= Math.ceil(READER_COVER_MAX_BYTES * 1.38) ? data : '';
}
async function epubCoverData(bytes) {
  try {
    const entries = zipEntries(bytes); const decoder = new TextDecoder();
    const container = decoder.decode(await readZipEntry(bytes, entries, 'META-INF/container.xml') || new Uint8Array());
    const opfPath = container.match(/full-path\s*=\s*["']([^"']+)["']/i)?.[1];
    if (!opfPath) return '';
    const opf = decoder.decode(await readZipEntry(bytes, entries, opfPath) || new Uint8Array());
    const base = opfPath.includes('/') ? opfPath.slice(0, opfPath.lastIndexOf('/') + 1) : '';
    const manifest = {};
    [...opf.matchAll(/<item\b[^>]*>/gi)].forEach((match) => {
      const tag = match[0]; const id = xmlAttribute(tag, 'id');
      if (id) manifest[id] = { href: decodeURIComponent(xmlAttribute(tag, 'href')), media: xmlAttribute(tag, 'media-type'), properties: xmlAttribute(tag, 'properties') };
    });
    const coverId = opf.match(/<meta\b[^>]*name\s*=\s*["']cover["'][^>]*content\s*=\s*["']([^"']+)["'][^>]*>/i)?.[1];
    const candidates = [manifest[coverId], ...Object.values(manifest).filter((item) => /cover-image/i.test(item.properties || '') || /image\//i.test(item.media || '') && /cover|title/i.test(item.href || ''))].filter(Boolean);
    const seen = new Set();
    for (const item of candidates) {
      if (seen.has(item.href) || !/^image\//i.test(item.media || '')) continue;
      seen.add(item.href);
      const data = await readZipEntry(bytes, entries, readerPath(base, item.href));
      const url = readerImageDataUrl(data, item.media);
      if (url) return url;
    }
  } catch { /* an unsupported cover should not block importing the book */ }
  return '';
}
async function hydrateReaderBookCover(book) {
  if (!book || book.hasCover === false || book._coverData) return;
  if (book.type === 'md') {
    const markdownCover = readerMarkdownCover(book.content);
    if (markdownCover) { readerDefineCover(book, markdownCover); await oneBoxDbPut('book-covers', book.id, markdownCover); }
    book.hasCover = Boolean(markdownCover);
    saveLibrary();
    if (state.tool === 'reader' && state.readerMode === 'library') render();
    return;
  }
  const stored = await oneBoxDbGet('book-covers', book.id);
  if (stored) readerDefineCover(book, stored);
  if (!stored && book.type === 'epub') {
    const binary = await oneBoxDbGet('books', book.id);
    if (binary) {
      const cover = await epubCoverData(new Uint8Array(binary));
      if (cover) { readerDefineCover(book, cover); await oneBoxDbPut('book-covers', book.id, cover); }
    }
  }
  book.hasCover = Boolean(book._coverData);
  saveLibrary();
  if (state.tool === 'reader' && state.readerMode === 'library') render();
}
async function epubToHtml(bytes) {
  const entries = zipEntries(bytes); const decoder = new TextDecoder();
  const container = decoder.decode(await readZipEntry(bytes, entries, 'META-INF/container.xml') || new Uint8Array());
  const opfPath = container.match(/full-path\s*=\s*["']([^"']+)["']/i)?.[1];
  if (!opfPath) throw Error('EPUB package not found');
  const opf = decoder.decode(await readZipEntry(bytes, entries, opfPath) || new Uint8Array());
  const base = opfPath.includes('/') ? opfPath.slice(0, opfPath.lastIndexOf('/') + 1) : '';
  const manifest = {};
  [...opf.matchAll(/<item\b[^>]*>/gi)].forEach((match) => {
    const tag = match[0]; const id = xmlAttribute(tag, 'id');
    if (id) manifest[id] = { href: decodeURIComponent(xmlAttribute(tag, 'href')), media: xmlAttribute(tag, 'media-type'), properties: xmlAttribute(tag, 'properties') };
  });
  const manifestByPath = new Map(Object.values(manifest).map((item) => [readerPath(base, item.href), item]));
  const spine = [...opf.matchAll(/<itemref\b[^>]*>/gi)].map((match) => xmlAttribute(match[0], 'idref')).map((id) => manifest[id]).filter(Boolean);
  const spineEntries = [];
  const parts = [];
  const inferredToc = [];
  for (const item of spine) {
    if (!/html|xhtml/i.test(item.media)) continue;
    const path = readerPath(base, item.href);
    const html = decoder.decode(await readZipEntry(bytes, entries, path) || new Uint8Array());
    const body = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i)?.[1] || html;
    const section = spineEntries.length;
    spineEntries.push({ item, path, section });
    const sectionDocument = new DOMParser().parseFromString('<body>' + sanitizeReaderMarkup(body) + '</body>', 'text/html');
    const sectionBase = path.includes('/') ? path.slice(0, path.lastIndexOf('/') + 1) : '';
    for (const mediaNode of sectionDocument.body.querySelectorAll('img, image')) {
      const source = mediaNode.getAttribute('src') || mediaNode.getAttribute('data-src') || mediaNode.getAttribute('href') || mediaNode.getAttribute('xlink:href') || '';
      const sourcePath = readerHrefParts(source).path;
      if (!sourcePath || /^(?:data|blob|https?|file):/i.test(sourcePath)) continue;
      const assetPath = readerPath(sectionBase, sourcePath);
      const asset = await readZipEntry(bytes, entries, assetPath);
      const assetUrl = readerImageObjectUrl(asset, manifestByPath.get(assetPath)?.media || '', assetPath);
      if (!assetUrl) continue;
      if (mediaNode.localName === 'image') {
        mediaNode.setAttribute('href', assetUrl);
        mediaNode.setAttribute('xlink:href', assetUrl);
      } else {
        mediaNode.setAttribute('src', assetUrl);
        mediaNode.removeAttribute('srcset');
      }
      mediaNode.removeAttribute('data-src');
    }
    [...sectionDocument.body.querySelectorAll('h1,h2,h3,h4,h5,h6')].forEach((heading, headingIndex) => {
      if (!heading.id) heading.id = 'reader-epub-heading-' + section + '-' + headingIndex;
      const label = readerStripTags(heading.textContent);
      if (label) inferredToc.push({ id: readerHeadingId(inferredToc.length), label, depth: Math.min(3, Number(heading.tagName.slice(1)) - 1), section, anchor: heading.id });
    });
    const mediaNodes = sectionDocument.body.querySelectorAll('img,svg');
    const sectionText = readerStripTags(sectionDocument.body.textContent);
    const isCoverSection = section === 0 && mediaNodes.length === 1 && sectionText.length <= 80;
    const sectionClass = 'reader-epub-section' + (isCoverSection ? ' reader-epub-cover-section' : '');
    parts.push('<section class="' + sectionClass + '" id="reader-epub-section-' + section + '">' + sectionDocument.body.innerHTML + '</section>');
  }
  if (!parts.length) throw Error('EPUB has no readable chapters');
  const toc = [];
  const navItem = Object.values(manifest).find((item) => /\bnav\b/i.test(item.properties || ''));
  const ncxItem = spine.find((item) => /ncx/i.test(item.media || '')) || Object.values(manifest).find((item) => /ncx/i.test(item.media || ''));
  const tocFilePath = navItem ? readerPath(base, navItem.href) : ncxItem ? readerPath(base, ncxItem.href) : base;
  const tocDir = tocFilePath.replace(/[^/]*$/, '');
  const addTocLink = (label, href, depth = 0) => {
    const hrefParts = readerHrefParts(href);
    const targetPath = readerPath(tocDir, hrefParts.path);
    const match = spineEntries.find((entry) => entry.path === targetPath || entry.path.endsWith('/' + targetPath));
    if (!label || !match) return;
    const key = match.section + ':' + label;
    if (toc.some((item) => item.key === key)) return;
    toc.push({ id: readerHeadingId(toc.length), key, label, depth: Math.min(3, Number(depth) || 0), section: match.section, anchor: hrefParts.anchor });
  };
  if (navItem) {
    const navPath = readerPath(base, navItem.href);
    const navHtml = decoder.decode(await readZipEntry(bytes, entries, navPath) || new Uint8Array());
    const navBlocks = [...navHtml.matchAll(/<nav\b[\s\S]*?<\/nav>/gi)].map((match) => match[0]);
    const navBody = navBlocks.find((block) => /(?:epub:type|role)\s*=\s*["'][^"']*(?:toc|doc-toc)/i.test(block.match(/^<nav\b[^>]*>/i)?.[0] || '')) || navBlocks[0] || navHtml;
    [...navBody.matchAll(/<a\b[^>]*href\s*=\s*["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi)].forEach((match) => addTocLink(readerStripTags(match[2]), match[1], (match[0].match(/data-depth\s*=\s*["'](\d+)/i) || [])[1] || 0));
  }
  if (!toc.length && ncxItem) {
    const ncxPath = readerPath(base, ncxItem.href);
    const ncx = decoder.decode(await readZipEntry(bytes, entries, ncxPath) || new Uint8Array());
    [...ncx.matchAll(/<navPoint\b[^>]*>[\s\S]*?<text>([\s\S]*?)<\/text>[\s\S]*?<content\b[^>]*src\s*=\s*["']([^"']+)["'][\s\S]*?<\/navPoint>/gi)].forEach((match) => addTocLink(readerStripTags(match[1]), match[2]));
  }
  const finalToc = toc.length ? toc : inferredToc;
  const title = opf.match(/<dc:title[^>]*>([\s\S]*?)<\/dc:title>/i)?.[1]?.replace(/<[^>]+>/g, '').trim();
  return { title, html: parts.join('<hr>'), toc: finalToc.map(({ key, ...item }) => item) };
}
async function importReaderFiles(fileList) {
  const files = [...(fileList || [])]; if (!files.length) return;
  let addedCount = 0; let duplicateCount = 0;
  for (const file of files) {
    const extension = file.name.split('.').pop()?.toLowerCase();
    if (!['md', 'markdown', 'txt', 'pdf', 'epub'].includes(extension)) { toast(t('unsupportedFile'), 'error'); continue; }
    try {
      const id = uid(); const type = extension === 'markdown' ? 'md' : extension;
      const fingerprint = [type, file.name.trim().toLocaleLowerCase(), file.size, file.lastModified || 0].join('|');
      const duplicate = state.library.some((book) => book.fingerprint === fingerprint || (!book.fingerprint && book.type === type && book.name.trim().toLocaleLowerCase() === file.name.trim().toLocaleLowerCase() && Number(book.size) === file.size));
      if (duplicate) { duplicateCount += 1; continue; }
      const book = { id, name: file.name, type, size: file.size, fingerprint, createdAt: Date.now(), lastOpenedAt: 0, order: state.library.reduce((max, item) => Math.max(max, Number(item.order) || 0), 0) + 1, progress: 0, annotations: [], hasCover: false };
      let cover = '';
      if (book.type === 'md') {
        book.content = await file.text();
        cover = readerMarkdownCover(book.content);
      } else {
        const binary = await file.arrayBuffer();
        await oneBoxDbPut('books', id, binary);
        if (book.type === 'epub') cover = await epubCoverData(new Uint8Array(binary));
      }
      if (cover) { book.hasCover = true; readerDefineCover(book, cover); await oneBoxDbPut('book-covers', id, cover); }
      state.library.unshift(book); saveLibrary(); addedCount += 1;
    } catch { toast(t('importFailed'), 'error'); }
  }
  const input = $('#readerFileInput'); if (input) input.value = '';
  render();
  if (addedCount && duplicateCount) toast(state.language === 'en' ? addedCount + ' document(s) added; duplicates skipped' : '已添加 ' + addedCount + ' 个文档，已跳过重复文档');
  else if (addedCount) toast(state.language === 'en' ? 'Document added' : '文档已添加');
  else if (duplicateCount) toast(state.language === 'en' ? 'Document already exists' : '文档已添加过');
}
function readerAnnotationMarkup(book) {
  const notes = (book.annotations || []).slice().reverse();
  if (!notes.length) return '<p class="empty compact">' + t('noAnnotations') + '</p>';
  return notes.map((note) => '<div class="reader-note"><blockquote>' + escapeHtml(note.quote) + '</blockquote><p>' + escapeHtml(note.note) + '</p><button class="icon-btn small" data-delete-annotation="' + escapeHtml(note.id) + '" aria-label="' + t('close') + '">×</button></div>').join('');
}
let readerProgressFrame = 0;
let readerProgressTimer = null;
let readerRestoreTimer = null;
let readerPageLayoutFrame = 0;
let readerPageResizeObserver = null;
let readerPageResizeTarget = null;
let readerNativeFullscreen = false;
let readerMarkupRestoreTimer = null;
function readerUsesDocumentScroll() {
  return isIosSafariBrowser() && state.readerImmersive && state.readerMode === 'reading' && state.readerReadingMode !== 'pages' && document.documentElement.classList.contains('reader-focus');
}
function readerDocumentScrollMetrics(content) {
  if (!readerUsesDocumentScroll() || !content) return null;
  const rect = content.getBoundingClientRect();
  const documentTop = rect.top + (window.scrollY || window.pageYOffset || 0);
  const contentHeight = Math.max(content.scrollHeight, rect.height);
  const viewportHeight = Math.max(1, window.innerHeight || document.documentElement.clientHeight || 1);
  return {
    top: Math.max(0, (window.scrollY || window.pageYOffset || 0) - documentTop),
    max: Math.max(1, contentHeight - viewportHeight),
    documentTop,
  };
}
function readerScrollProgress(content) {
  if (!content) return 0;
  const documentMetrics = readerDocumentScrollMetrics(content);
  if (documentMetrics) return Math.min(1, Math.max(0, documentMetrics.top / documentMetrics.max));
  return Math.min(1, Math.max(0, content.scrollTop / Math.max(1, content.scrollHeight - content.clientHeight)));
}
function readerDocumentPageInfo(content) {
  if (!readerUsesDocumentScroll() || !content) return null;
  const metrics = readerDocumentScrollMetrics(content);
  if (!metrics) return null;
  const viewportHeight = Math.max(1, window.innerHeight || document.documentElement.clientHeight || 1);
  const contentHeight = Math.max(content.scrollHeight, content.getBoundingClientRect().height);
  const count = Math.max(1, Math.ceil(contentHeight / viewportHeight));
  return { current: Math.min(count, Math.floor(metrics.top / viewportHeight) + 1), count };
}
function scheduleReaderPositionRestore() {
  if (readerRestoreTimer) clearTimeout(readerRestoreTimer);
  requestAnimationFrame(() => requestAnimationFrame(() => {
    restoreReaderPosition();
    readerRestoreTimer = setTimeout(() => { readerRestoreTimer = null; restoreReaderPosition(); }, 140);
  }));
}
function scheduleReaderProgress(content) {
  const book = readerBookById(state.readerBookId); if (!book || !content || !content.scrollHeight) return;
  if (state.readerReadingMode === 'pages' && content.classList.contains('reader-page-viewport')) {
    const count = readerPageCount(content);
    book.progress = state.readerPage / Math.max(1, count - 1);
  } else {
    book.progress = readerScrollProgress(content);
  }
  if (!readerProgressFrame) readerProgressFrame = requestAnimationFrame(() => {
    readerProgressFrame = 0;
    if (state.readerReadingMode === 'pages' && content.classList.contains('reader-page-viewport')) updateReaderPager();
    else updateReaderReferenceChrome();
  });
  clearTimeout(readerProgressTimer);
  readerProgressTimer = setTimeout(() => { readerProgressTimer = null; saveLibrary(); }, 350);
}
function flushReaderProgress() {
  const book = readerBookById(state.readerBookId); const content = $('[data-reader-content]');
  if (!book || !content || !content.scrollHeight) return;
  if (state.readerReadingMode === 'pages' && content.classList.contains('reader-page-viewport')) {
    const count = readerPageCount(content);
    book.progress = Math.min(1, Math.max(0, state.readerPage / Math.max(1, count - 1)));
  } else {
    book.progress = readerScrollProgress(content);
  }
  saveLibrary();
}
function applyReaderPageLayout(preserveProgress = true) {
  const viewport = $('.reader-page-viewport');
  const flow = $('.reader-page-flow');
  if (!viewport || !flow || !viewport.clientWidth || !viewport.clientHeight) return;
  const previousCount = Number(viewport.dataset.readerLayoutPages) || readerPageCount(viewport);
  const progress = preserveProgress && previousCount > 1
    ? Math.min(1, Math.max(0, state.readerPage / Math.max(1, previousCount - 1)))
    : 0;
  applyReaderPageColumns(viewport, flow);
  requestAnimationFrame(() => {
    if (!viewport.isConnected || !flow.isConnected) return;
    const count = readerPageCount(viewport);
    setReaderPagePosition(Math.round(progress * Math.max(0, count - 1)), 'instant');
  });
}
function scheduleReaderPageLayout() {
  if (readerPageLayoutFrame) return;
  readerPageLayoutFrame = requestAnimationFrame(() => {
    readerPageLayoutFrame = 0;
    if (state.readerReadingMode === 'pages') applyReaderPageLayout(true);
  });
}
function syncReaderPageResizeObserver() {
  const viewport = state.readerReadingMode === 'pages' ? $('.reader-page-viewport') : null;
  if (readerPageResizeTarget === viewport) return;
  readerPageResizeObserver?.disconnect();
  readerPageResizeObserver = null;
  readerPageResizeTarget = viewport;
  if (!viewport || !window.ResizeObserver) return;
  readerPageResizeObserver = new ResizeObserver(scheduleReaderPageLayout);
  readerPageResizeObserver.observe(viewport);
}
function readerPageGeometry(viewport, flow = viewport?.querySelector('.reader-page-flow')) {
  const styles = flow ? getComputedStyle(flow) : null;
  const leftPadding = Math.max(0, Number.parseFloat(styles?.paddingLeft || 0) || 0);
  const rightPadding = Math.max(0, Number.parseFloat(styles?.paddingRight || 0) || 0);
  const pageWidth = Math.max(1, Math.round(viewport?.clientWidth || 1));
  const columnWidth = Math.max(1, pageWidth - Math.round(leftPadding + rightPadding));
  const columnGap = Math.max(0, Math.round(leftPadding + rightPadding));
  return { pageWidth, columnWidth, columnGap, horizontalPadding: leftPadding + rightPadding };
}
function applyReaderPageColumns(viewport, flow) {
  const geometry = readerPageGeometry(viewport, flow);
  delete viewport.dataset.readerPageMeasureKey;
  delete viewport.dataset.readerMeasuredPages;
  flow.style.columnWidth = geometry.columnWidth + 'px';
  flow.style.webkitColumnWidth = geometry.columnWidth + 'px';
  flow.style.columnGap = geometry.columnGap + 'px';
  flow.style.webkitColumnGap = geometry.columnGap + 'px';
  flow.style.columnFill = 'auto';
  flow.style.webkitColumnFill = 'auto';
  flow.style.height = Math.max(1, Math.round(viewport.clientHeight)) + 'px';
  return geometry;
}
function readerPageMeasureKey(viewport, flow, geometry) {
  return [
    viewport.clientWidth,
    viewport.clientHeight,
    geometry.columnWidth,
    geometry.columnGap,
    flow.scrollWidth,
    flow.scrollHeight,
    flow.childElementCount,
  ].join('|');
}
function readerMeasuredLastContentPage(viewport, flow, geometry) {
  const key = readerPageMeasureKey(viewport, flow, geometry);
  if (viewport.dataset.readerPageMeasureKey === key && viewport.dataset.readerMeasuredPages) {
    return Number(viewport.dataset.readerMeasuredPages) || 0;
  }

  // WebKit can expose one extra CSS column for the trailing padding. Counting
  // scrollWidth then makes the last page look real even though it contains no
  // content. Measure the last painted text line instead, with the track
  // transform temporarily removed so this also works after a page turn.
  const previousTransform = flow.style.transform;
  const previousWebkitTransform = flow.style.webkitTransform;
  flow.style.transform = 'none';
  flow.style.webkitTransform = 'none';
  let pages = 0;
  try {
    // WebKit may defer the column relayout caused by removing the page
    // transform. Read layout once before walking text ranges so the last
    // painted line is measured in the untransformed coordinate space.
    void flow.offsetWidth;
    const styles = getComputedStyle(flow);
    const leftPadding = Math.max(0, Number.parseFloat(styles.paddingLeft || 0) || 0);
    const flowRect = flow.getBoundingClientRect();
    const contentLeft = flowRect.left + leftPadding;
    const stride = Math.max(1, geometry.columnWidth + geometry.columnGap);
    const walker = document.createTreeWalker(flow, NodeFilter.SHOW_TEXT);
    let node;
    let lastRect = null;
    while ((node = walker.nextNode())) {
      if (!node.nodeValue?.trim()) continue;
      const range = document.createRange();
      try {
        range.selectNodeContents(node);
        const rects = [...range.getClientRects()].filter((rect) => rect.width > 0 && rect.height > 0);
        if (rects.length) lastRect = rects[rects.length - 1];
      } catch { /* Ignore detached or non-rendered text nodes. */ }
      finally { range.detach?.(); }
    }
    if (lastRect) {
      const column = Math.max(0, Math.floor((lastRect.left - contentLeft + 1) / stride));
      pages = column + 1;
    }
  } finally {
    flow.style.transform = previousTransform;
    flow.style.webkitTransform = previousWebkitTransform;
  }

  if (!pages) {
    const totalWidth = Math.max(geometry.columnWidth, flow.scrollWidth - geometry.horizontalPadding + geometry.columnGap);
    pages = Math.max(1, Math.ceil(totalWidth / Math.max(1, geometry.columnWidth + geometry.columnGap)));
  }
  viewport.dataset.readerPageMeasureKey = key;
  viewport.dataset.readerMeasuredPages = String(pages);
  return pages;
}
function readerPageCount(viewport) {
  const flow = viewport?.querySelector('.reader-page-flow');
  if (!viewport || !flow) return 1;
  const geometry = readerPageGeometry(viewport, flow);
  return readerMeasuredLastContentPage(viewport, flow, geometry);
}
function ensureReaderPageColumns(viewport, flow) {
  if (!viewport || !flow) return;
  const geometry = readerPageGeometry(viewport, flow);
  const height = Math.max(1, Math.round(viewport.clientHeight)) + 'px';
  if (flow.style.columnWidth !== geometry.columnWidth + 'px' || flow.style.columnGap !== geometry.columnGap + 'px' || flow.style.height !== height) {
    applyReaderPageColumns(viewport, flow);
  }
}
function readerPageForTarget(viewport, target) {
  const flow = viewport?.querySelector('.reader-page-flow');
  if (!viewport || !flow || !target || !viewport.clientWidth) return 0;
  ensureReaderPageColumns(viewport, flow);
  const geometry = readerPageGeometry(viewport, flow);
  const count = readerPageCount(viewport);
  const previousTransform = flow.style.transform;
  const previousWebkitTransform = flow.style.webkitTransform;
  flow.style.transform = 'none';
  flow.style.webkitTransform = 'none';
  let page = 0;
  try {
    // offsetLeft is relative to the nearest offset parent and is not a page
    // coordinate for nested EPUB sections or headings split by CSS columns.
    // Read the actual painted position with the track untransformed instead.
    void flow.offsetWidth;
    const styles = getComputedStyle(flow);
    const leftPadding = Math.max(0, Number.parseFloat(styles.paddingLeft || 0) || 0);
    const flowRect = flow.getBoundingClientRect();
    const targetRect = target.getBoundingClientRect();
    const firstColumnLeft = flowRect.left + leftPadding;
    const stride = Math.max(1, geometry.columnWidth + geometry.columnGap);
    page = Math.floor(Math.max(0, targetRect.left - firstColumnLeft + 1) / stride);
  } finally {
    flow.style.transform = previousTransform;
    flow.style.webkitTransform = previousWebkitTransform;
  }
  return Math.min(Math.max(0, page), Math.max(0, count - 1));
}
function setReaderPagePosition(page, behavior = 'smooth') {
  const viewport = $('.reader-page-viewport');
  const flow = $('.reader-page-flow');
  if (!viewport || !flow || !viewport.clientWidth) return 0;
  ensureReaderPageColumns(viewport, flow);
  const count = readerPageCount(viewport);
  const nextPage = Math.min(Math.max(0, Math.round(Number(page) || 0)), count - 1);
  state.readerPage = nextPage;
  const transform = 'translate3d(' + (-nextPage * viewport.clientWidth) + 'px, 0, 0)';
  const transition = behavior === 'smooth' ? 'transform .68s cubic-bezier(.22,.72,.24,1)' : 'none';
  flow.style.transition = transition;
  flow.style.webkitTransition = transition;
  flow.style.transform = transform;
  flow.style.webkitTransform = transform;
  const previousBehavior = viewport.style.scrollBehavior;
  viewport.style.scrollBehavior = 'auto';
  viewport.scrollLeft = 0;
  viewport.style.scrollBehavior = previousBehavior;
  if (behavior === 'smooth') {
    clearTimeout(flow.readerPageTransitionTimer);
    flow.readerPageTransitionTimer = setTimeout(() => {
      if (!flow.isConnected) return;
      flow.style.transition = '';
      flow.style.webkitTransition = '';
    }, 720);
  }
  updateReaderPager();
  return nextPage;
}
function updateReaderPager() {
  const viewport = $('.reader-page-viewport'); if (!viewport) return;
  const flow = $('.reader-page-flow');
  if (flow) ensureReaderPageColumns(viewport, flow);
  const count = readerPageCount(viewport);
  state.readerPage = Math.min(Math.max(0, Math.round(Number(state.readerPage) || 0)), count - 1);
  viewport.dataset.readerLayoutPages = String(count);
  if (flow) {
    const transform = 'translate3d(' + (-state.readerPage * viewport.clientWidth) + 'px, 0, 0)';
    flow.style.transform = transform;
    flow.style.webkitTransform = transform;
  }
  const current = $('[data-reader-page-current]'); const total = $('[data-reader-page-count]');
  if (current) current.textContent = String(state.readerPage + 1);
  if (total) total.textContent = String(count);
  const previous = $('[data-reader-page-prev]'); const next = $('[data-reader-page-next]');
  if (previous) previous.disabled = state.readerPage <= 0;
  if (next) next.disabled = state.readerPage >= count - 1;
  updateReaderReferenceChrome();
}
function restoreReaderPosition() {
  const book = readerBookById(state.readerBookId); const content = $('[data-reader-content]'); if (!book || !content) return;
  if (state.readerReadingMode === 'pages' && content.classList.contains('reader-page-viewport')) {
    const count = readerPageCount(content);
    const page = state.readerPage || Math.round((book.progress || 0) * Math.max(0, count - 1));
    setReaderPagePosition(page, 'instant');
  } else if (book.progress) {
    const progress = Math.min(1, Math.max(0, Number(book.progress) || 0));
    const documentMetrics = readerDocumentScrollMetrics(content);
    if (documentMetrics) {
      window.scrollTo({ top: documentMetrics.documentTop + documentMetrics.max * progress, behavior: 'auto' });
    } else {
      const maxScrollTop = Math.max(0, content.scrollHeight - content.clientHeight);
      content.scrollTop = maxScrollTop * progress;
    }
  }
  updateReaderReferenceChrome();
}
function readerFullscreenElement() { return document.fullscreenElement || document.webkitFullscreenElement || null; }
async function requestReaderFullscreen() {
  // iPhone Safari does not support element fullscreen for ordinary page
  // content. Skip the rejected/native path entirely so a transient WebKit
  // fullscreen event cannot undo the CSS immersive reader state.
  if (isIosSafariBrowser()) { readerNativeFullscreen = false; return false; }
  if (readerFullscreenElement()) { readerNativeFullscreen = true; return true; }
  const root = document.documentElement;
  const request = root.requestFullscreen || root.webkitRequestFullscreen;
  if (!request) { readerNativeFullscreen = false; return false; }
  try {
    await Promise.resolve(request.call(root, { navigationUI: 'hide' }));
    readerNativeFullscreen = Boolean(readerFullscreenElement());
    return readerNativeFullscreen;
  } catch {
    // iPhone Safari rejects element fullscreen for ordinary page content. The
    // CSS reader-focus fallback remains active in that case.
    readerNativeFullscreen = false;
    return false;
  }
}
function exitReaderFullscreen() {
  const exit = document.exitFullscreen || document.webkitExitFullscreen;
  readerNativeFullscreen = false;
  if (!readerFullscreenElement() || !exit) return Promise.resolve();
  try { return Promise.resolve(exit.call(document)).catch(() => {}); } catch { return Promise.resolve(); }
}
function updateReaderFullscreenControl() {
  const buttons = $$('.reader-fullscreen-tool'); if (!buttons.length) return;
  const active = state.readerImmersive || Boolean(readerFullscreenElement());
  const icon = active
    ? '<svg class="reader-fullscreen-icon reader-fullscreen-exit" viewBox="0 0 24 24" aria-hidden="true"><path d="M9 4v5H4M15 4v5h5M20 15h-5v5M9 20v-5H4"/></svg>'
    : '<svg class="reader-fullscreen-icon reader-fullscreen-enter" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9V4h5M15 4h5v5M20 15v5h-5M9 20H4v-5"/></svg>';
  buttons.forEach((button) => {
    button.innerHTML = icon + '<span>' + (active ? t('readerExitFullscreen') : t('readerFullscreen')) + '</span>';
    button.setAttribute('aria-label', active ? t('readerExitFullscreen') : t('readerFullscreen'));
  });
}
function ensureReaderFullscreenTool() {
  const header = $('.reader-reference-top');
  const topButton = header?.querySelector('[data-reader-fullscreen]');
  topButton?.classList.add('reader-fullscreen-tool', 'reader-reference-top-fullscreen');
  topButton?.setAttribute('aria-label', t('readerFullscreen'));
  const row = $('.reader-reference-tool-row');
  if (row && !row.querySelector('.reader-fullscreen-tool')) {
    const button = document.createElement('button');
    button.className = 'reader-reference-tool reader-fullscreen-tool';
    button.setAttribute('data-reader-fullscreen', '');
    button.setAttribute('aria-label', t('readerFullscreen'));
    button.innerHTML = '<span>' + t('readerFullscreen') + '</span>';
    const annotation = row.querySelector('.reader-annotate-button');
    row.insertBefore(button, annotation || null);
  }
}
function toggleReaderFullscreen() {
  const wasDocumentScroll = readerUsesDocumentScroll();
  const content = $('[data-reader-content]');
  const previousProgress = wasDocumentScroll ? readerScrollProgress(content) : null;
  state.readerImmersive = !state.readerImmersive;
  state.readerChromeHidden = state.readerImmersive;
  state.readerPreferences.fullscreenOnOpen = state.readerImmersive;
  saveReaderPreferences();
  if (state.readerImmersive) requestReaderFullscreen(); else exitReaderFullscreen();
  render();
  if (wasDocumentScroll && !state.readerImmersive && previousProgress != null) {
    requestAnimationFrame(() => {
      const nextContent = $('[data-reader-content]');
      if (nextContent) nextContent.scrollTop = previousProgress * Math.max(0, nextContent.scrollHeight - nextContent.clientHeight);
      window.scrollTo({ top: 0, behavior: 'auto' });
      updateReaderReferenceChrome();
    });
  }
}
function renderReaderView(content, hint = '', toc = [], readingMode = 'pages') {
  state.readerContent = content;
  state.readerHint = hint;
  state.readerToc = Array.isArray(toc) ? toc : [];
  state.readerMode = 'reading';
  state.readerReadingMode = readingMode === 'scroll' ? 'scroll' : 'pages';
  state.readerChromeHidden = state.readerImmersive;
  state.readerPage = 0;
  render();
  scheduleReaderPositionRestore();
}
async function openReaderBook(id) {
  const book = readerBookById(id); if (!book) return;
  releaseReaderAssets();
  state.readerImmersive = state.readerPreferences.fullscreenOnOpen === true;
  if (state.readerImmersive) requestReaderFullscreen(); else exitReaderFullscreen();
  state.readerBookId = id; state.readerSelectedText = ''; state.readerSelection = null; state.readerAnnotationDraft = null; book.lastOpenedAt = Date.now(); saveLibrary();
  try {
    let content = ''; let hint = ''; let toc = [];
    if (book.type === 'md') { content = markdownToHtml(book.content); toc = readerTextToc(book.content).map((item) => ({ ...item })); }
    else if (book.type === 'txt' && typeof book.content === 'string') { content = textToHtml(book.content); toc = readerTextToc(book.content).map((item) => ({ ...item })); hint = 'TXT · ' + Math.max(1, Math.round(book.size / 1024)) + ' KB'; }
    else {
      const data = await oneBoxDbGet('books', id); if (!data) throw Error();
      const bytes = new Uint8Array(data);
      if (book.type === 'txt') { const source = readerDecodeText(bytes); content = textToHtml(source); toc = readerTextToc(source).map((item) => ({ ...item })); hint = 'TXT · ' + Math.max(1, Math.round(book.size / 1024)) + ' KB'; }
      else if (book.type === 'epub') { const parsed = await epubToHtml(bytes); content = parsed.html; toc = parsed.toc || []; hint = parsed.title ? parsed.title + ' · ' + t('epubHint') : t('epubHint'); }
      else { state.readerUrl = URL.createObjectURL(new Blob([bytes], { type: 'application/pdf' })); content = '<iframe class="reader-pdf" title="' + escapeHtml(book.name) + '" src="' + state.readerUrl + '"></iframe>'; hint = t('pdfHint'); }
    }
    // Restore the user's last reading mode for both Safari and the PWA. The
    // mode is a device preference, not a per-open default.
    renderReaderView(content, hint, toc, state.readerPreferences.readingMode === 'pages' ? 'pages' : 'scroll');
  } catch { releaseReaderAssets(); toast(t('importFailed'), 'error'); state.readerBookId = null; }
}
function closeReader() {
  const wasDocumentScroll = readerUsesDocumentScroll();
  exitReaderFullscreen();
  if (state.readerUrl) URL.revokeObjectURL(state.readerUrl);
  releaseReaderAssets();
  flushReaderProgress();
  if (wasDocumentScroll) window.scrollTo({ top: 0, behavior: 'auto' });
  state.readerUrl = ''; state.readerBookId = null; state.readerContent = ''; state.readerHint = ''; state.readerToc = []; state.readerDialog = ''; state.readerChromeHidden = false; state.readerImmersive = false; state.readerMode = 'library'; state.readerReadingMode = 'scroll'; state.readerPage = 0; state.readerSelectedText = ''; state.readerSelection = null; state.readerAnnotationDraft = null;
  render();
}
const READER_THEME_VALUES = {
  paper: { bg: '#f4f0e7', panel: '#faf7ef', ink: '#2d3035', muted: '#74736d', line: '#d9d3c8' },
  sepia: { bg: '#e7e2d6', panel: '#eee9dd', ink: '#45423b', muted: '#777268', line: '#c9c2b5' },
  green: { bg: '#e7f1e7', panel: '#f5fbf5', ink: '#263b2e', muted: '#65756a', line: '#cbdcca' },
  dark: { bg: '#1d1f24', panel: '#25282f', ink: '#c5c8cf', muted: '#959aa5', line: '#3b3f49' },
};
const READER_FONT_VALUES = { system: 'var(--font-sans)', serif: 'Georgia, "Times New Roman", serif', mono: 'ui-monospace, SFMono-Regular, Menlo, monospace' };
function saveReaderPreferences() { saveStored(STORAGE.readerPreferences, state.readerPreferences); }
let readerSafariTintPulse = 0;
function pulseReaderSafariTint(color) {
  if (!isIosSafariReaderSurfaceActive()) return;
  const meta = $('meta[name="theme-color"]');
  if (!meta) return;
  const pulse = ++readerSafariTintPulse;
  meta.setAttribute('content', color);
  requestAnimationFrame(() => {
    if (pulse !== readerSafariTintPulse || !isIosSafariReaderSurfaceActive()) return;
    // Safari 26 may keep the previous sampled tint after a live CSS update.
    // A one-frame alpha variant wakes its tint observer; the clean color is
    // restored on the following frame without changing the visible page.
    meta.setAttribute('content', color + 'fe');
    requestAnimationFrame(() => {
      if (pulse === readerSafariTintPulse && isIosSafariReaderSurfaceActive()) meta.setAttribute('content', color);
    });
  });
}
function syncReaderSafariSurface() {
  const root = document.documentElement;
  const body = document.body;
  const active = isIosSafariReaderSurfaceActive();
  root.classList.toggle('reader-safari-surface', active);
  root.classList.toggle('reader-safari-page-surface', active && state.readerReadingMode === 'pages');
  const metas = $$('meta[name="theme-color"]');
  if (!active) {
    readerSafariTintPulse += 1;
    root.style.removeProperty('--onebox-reader-surface-bg');
    root.style.removeProperty('background');
    root.style.removeProperty('background-color');
    body?.style.removeProperty('background');
    body?.style.removeProperty('background-color');
    metas.forEach((meta) => {
      if (!meta.dataset.oneboxReaderThemeColor) return;
      meta.content = meta.dataset.oneboxReaderThemeColor;
      const media = meta.dataset.oneboxReaderThemeMedia;
      if (media) meta.setAttribute('media', media);
      else meta.removeAttribute('media');
      delete meta.dataset.oneboxReaderThemeColor;
      delete meta.dataset.oneboxReaderThemeMedia;
    });
    $('.reader-safari-edge-top')?.style.removeProperty('background');
    $('.reader-safari-edge-top')?.style.removeProperty('background-color');
    return;
  }
  const palette = READER_THEME_VALUES[state.readerPreferences.theme] || READER_THEME_VALUES.paper;
  root.style.setProperty('--onebox-reader-surface-bg', palette.bg);
  root.style.setProperty('background', palette.bg, 'important');
  root.style.setProperty('background-color', palette.bg, 'important');
  if (body) {
    body.style.setProperty('background', palette.bg, 'important');
    body.style.setProperty('background-color', palette.bg, 'important');
  }
  metas.forEach((meta, index) => {
    if (!meta.dataset.oneboxReaderThemeColor) {
      meta.dataset.oneboxReaderThemeColor = meta.content;
      meta.dataset.oneboxReaderThemeMedia = meta.getAttribute('media') || '';
    }
    // Safari can keep using the dark media-qualified tag after its content
    // changes. During the reader surface, expose one unconditional tag and
    // disable the original alternatives until the reader closes.
    if (index === 0) meta.removeAttribute('media');
    else meta.setAttribute('media', 'not all');
    meta.content = palette.bg;
  });
  const edge = $('.reader-safari-edge-top');
  edge?.style.setProperty('background', palette.bg, 'important');
  edge?.style.setProperty('background-color', palette.bg, 'important');
}
function applyReaderPreferences() {
  syncReaderSafariSurface();
  const shell = $('.reader-reference-shell, .reader-reading-shell'); if (!shell) return;
  const prefs = state.readerPreferences; const palette = READER_THEME_VALUES[prefs.theme] || READER_THEME_VALUES.paper;
  // Reader dialogs are mounted outside the reading shell. Their contrast must
  // follow the selected reading surface, not the app-wide theme, otherwise a
  // light note sheet can inherit light text from the global dark mode.
  const readerUiDark = prefs.theme === 'dark';
  const readerUiInk = readerUiDark ? '#ffffff' : '#000000';
  const readerUiMuted = readerUiDark ? '#bdbdbd' : '#606060';
  const readerUiPanel = palette.panel;
  const readerUiLine = palette.line;
  shell.dataset.readerTheme = prefs.theme;
  shell.style.setProperty('--reader-bg', palette.bg);
  shell.style.setProperty('--reader-panel', palette.panel);
  shell.style.setProperty('--reader-ink', palette.ink);
  shell.style.setProperty('--reader-muted', palette.muted);
  shell.style.setProperty('--reader-line', palette.line);
  shell.style.setProperty('--reader-font', READER_FONT_VALUES[prefs.fontFamily] || READER_FONT_VALUES.system);
  shell.style.setProperty('--reader-size', prefs.fontSize + 'px');
  shell.style.setProperty('--reader-line-height', prefs.lineHeight);
  shell.style.setProperty('--reader-paragraph-spacing', prefs.paragraphSpacing + 'px');
  shell.style.setProperty('--reader-letter-spacing', prefs.letterSpacing + 'px');
  // The dialogs are mounted outside the reader shell. Their surface follows
  // Mine > Settings > Theme and their text stays deliberately black/white;
  // the reading page itself keeps the selected paper/sepia/green/night ink.
  ['#readerDialog', '#annotationDialog'].forEach((selector) => {
    const dialog = $(selector); if (!dialog) return;
    dialog.dataset.readerTheme = prefs.theme;
    dialog.style.setProperty('--reader-bg', palette.bg);
    dialog.style.setProperty('--reader-panel', palette.panel);
    dialog.style.setProperty('--reader-ink', palette.ink);
    dialog.style.setProperty('--reader-muted', palette.muted);
    dialog.style.setProperty('--reader-line', palette.line);
    dialog.style.setProperty('--reader-ui-ink', readerUiInk);
    dialog.style.setProperty('--reader-ui-muted', readerUiMuted);
    dialog.style.setProperty('--reader-ui-panel', readerUiPanel);
    dialog.style.setProperty('--reader-ui-line', readerUiLine);
  });
  // Reapply after the reader variables and edge node are updated. This is
  // intentionally a second pass for iOS Safari, whose chrome samples the
  // viewport edge during style recalculation.
  if (isIosSafariReaderSurfaceActive()) {
    syncReaderSafariSurface();
    pulseReaderSafariTint(palette.bg);
    requestAnimationFrame(() => { if (isIosSafariReaderSurfaceActive()) syncReaderSafariSurface(); });
  }
}
function readerDialogMarkup(kind) {
  const dialog = $('#readerDialog'); if (!dialog) return;
  const prefs = state.readerPreferences;
  const closeButton = '<button class="reader-dialog-close" data-close-reader-dialog aria-label="' + t('close') + '"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m7 7 10 10M17 7 7 17"/></svg></button>';
  const title = (heading, hint) => '<div class="reader-dialog-title"><h2>' + heading + '</h2><small>' + hint + '</small></div>';
  const themeButton = (id, label) => '<button class="reader-theme-choice ' + (prefs.theme === id ? 'active' : '') + '" data-reader-theme="' + id + '"><span class="reader-theme-dot theme-' + id + '"></span>' + label + '</button>';
  const choiceButton = (group, value, label, current) => '<button type="button" class="reader-theme-choice reader-setting-choice ' + (String(current) === String(value) ? 'active' : '') + '" data-reader-choice="' + group + '" data-reader-choice-value="' + value + '">' + label + '</button>';
  const choiceGroup = (heading, group, current, choices, className) => '<div class="reader-setting-row"><h3>' + heading + '</h3><div class="reader-choice-grid ' + (className || '') + '">' + choices.map(([value, label]) => choiceButton(group, value, label, current)).join('') + '</div></div>';
  if (kind === 'toc') {
    const items = state.readerToc || [];
    const currentIndex = currentReaderChapterIndex();
    const body = items.length ? items.map((item, position) => '<button class="reader-toc-item depth-' + Math.min(3, Number(item.depth) || 0) + (position === currentIndex ? ' active' : '') + '" data-reader-toc-id="' + escapeHtml(item.id || '') + '" data-reader-toc-section="' + (item.section == null ? '' : item.section) + '" data-reader-toc-anchor="' + escapeHtml(item.anchor || '') + '"' + (position === currentIndex ? ' aria-current="true"' : '') + '><span>' + escapeHtml(item.label || '—') + '</span></button>').join('') : '<p class="empty compact reader-dialog-empty">' + t('readerNoContents') + '</p>';
    dialog.innerHTML = '<div class="reader-dialog-card reader-panel-card" role="dialog" aria-modal="true"><div class="dialog-head reader-dialog-head">' + title(t('readerContents'), t('readerTocHint')) + closeButton + '</div><div class="reader-toc-list">' + body + '</div></div>';
  } else if (kind === 'background') {
    dialog.innerHTML = '<div class="reader-dialog-card reader-panel-card reader-sheet-card" role="dialog" aria-modal="true"><div class="dialog-head reader-dialog-head">' + title(t('readerTheme'), t('readerSettingsHint')) + closeButton + '</div><div class="reader-sheet-body"><div class="reader-theme-grid reader-theme-grid-large">' + themeButton('paper', t('readerThemePaper')) + themeButton('sepia', t('readerThemeSepia')) + themeButton('green', t('readerThemeGreen')) + themeButton('dark', t('readerThemeDark')) + '</div></div></div>';
  } else if (kind === 'comments') {
    const comments = readerCommentEntries(readerBookById(state.readerBookId)).slice().reverse();
    const body = comments.length ? comments.map((item) => '<button type="button" class="reader-comment-item" data-reader-comment-item="' + escapeHtml(item.id || '') + '"><span class="reader-comment-item-number">' + escapeHtml(item.label) + '</span><span class="reader-comment-item-copy"><strong>' + escapeHtml(item.quote || '—') + '</strong><small>' + escapeHtml(item.note || '') + '</small></span></button>').join('') : '<p class="empty compact reader-dialog-empty">' + t('noAnnotations') + '</p>';
    dialog.innerHTML = '<div class="reader-dialog-card reader-panel-card reader-comments-card" role="dialog" aria-modal="true"><div class="dialog-head reader-dialog-head">' + title(t('readerComments'), t('readerNotesHint')) + closeButton + '</div><div class="reader-comments-list">' + body + '</div></div>';
  } else if (kind === 'animation') {
    const option = (value, label) => '<button class="reader-sheet-choice ' + (prefs.pageAnimation === value ? 'active' : '') + '" data-reader-animation="' + value + '"><span>' + label + '</span><i>' + (prefs.pageAnimation === value ? '✓' : '') + '</i></button>';
    dialog.innerHTML = '<div class="reader-dialog-card reader-panel-card reader-sheet-card" role="dialog" aria-modal="true"><div class="dialog-head reader-dialog-head">' + title(t('readerAnimation'), t('readerSettingsHint')) + closeButton + '</div><div class="reader-sheet-body reader-choice-list">' + option('slide', state.language === 'en' ? 'Smooth horizontal slide' : '水平平滑翻页') + option('none', t('readerAnimationNone')) + '</div></div>';
  } else {
    const nearestChoice = (value, choices) => choices.reduce((best, choice) => Math.abs(Number(choice) - Number(value)) < Math.abs(Number(best) - Number(value)) ? choice : best, choices[0]);
    const fontSizeValues = [16, 18, 20, 22, 24];
    const lineHeightValues = [1.6, 1.8, 2];
    const paragraphSpacingValues = [8, 14, 20];
    const letterSpacingValues = [0, .5, 1];
    const fontSizeCurrent = nearestChoice(prefs.fontSize, fontSizeValues);
    const lineHeightCurrent = nearestChoice(prefs.lineHeight, lineHeightValues);
    const paragraphSpacingCurrent = nearestChoice(prefs.paragraphSpacing, paragraphSpacingValues);
    const letterSpacingCurrent = nearestChoice(prefs.letterSpacing, letterSpacingValues);
    if (prefs.fontSize !== fontSizeCurrent || prefs.lineHeight !== lineHeightCurrent || prefs.paragraphSpacing !== paragraphSpacingCurrent || prefs.letterSpacing !== letterSpacingCurrent) {
      prefs.fontSize = fontSizeCurrent; prefs.lineHeight = lineHeightCurrent; prefs.paragraphSpacing = paragraphSpacingCurrent; prefs.letterSpacing = letterSpacingCurrent; saveReaderPreferences(); applyReaderPreferences();
    }
    const fullscreenChoice = choiceGroup(t('readerFullscreenOnOpen'), 'fullscreenOnOpen', prefs.fullscreenOnOpen ? 'true' : 'false', [['true', state.language === 'en' ? 'Fullscreen' : '全屏'], ['false', state.language === 'en' ? 'Windowed' : '非全屏']], 'reader-choice-grid-2');
    const readingCurrent = state.readerReadingMode === 'scroll' ? 'scroll' : 'pages';
    const readingChoices = choiceGroup(t('readerReadingMethod'), 'readingMode', readingCurrent, [['scroll', t('readerScroll')], ['pages', t('readerPages')]], 'reader-choice-grid-2');
    const fontSizeChoices = choiceGroup(t('readerFontSize'), 'fontSize', fontSizeCurrent, fontSizeValues.map((value) => [String(value), value + 'px']), 'reader-choice-grid-5');
    const fontChoices = choiceGroup(t('readerFontFamily'), 'fontFamily', prefs.fontFamily, [['system', '系统无衬线'], ['serif', '阅读衬线'], ['mono', '等宽字体']], 'reader-choice-grid-3');
    const lineHeightChoices = choiceGroup(t('readerLineHeight'), 'lineHeight', lineHeightCurrent, lineHeightValues.map((value) => [String(value), value.toFixed(1)]), 'reader-choice-grid-3');
    const paragraphSpacingChoices = choiceGroup(t('readerParagraphSpacing'), 'paragraphSpacing', paragraphSpacingCurrent, paragraphSpacingValues.map((value) => [String(value), value + 'px']), 'reader-choice-grid-3');
    const letterSpacingChoices = choiceGroup(t('readerLetterSpacing'), 'letterSpacing', letterSpacingCurrent, [['0', '标准'], ['0.5', '0.5px'], ['1', '1px']], 'reader-choice-grid-3');
    const themeChoices = '<div class="reader-setting-row"><h3>' + t('readerTheme') + '</h3><div class="reader-theme-grid reader-theme-grid-inline">' + themeButton('paper', t('readerThemePaper')) + themeButton('sepia', t('readerThemeSepia')) + themeButton('green', t('readerThemeGreen')) + themeButton('dark', t('readerThemeDark')) + '</div></div>';
    dialog.innerHTML = '<div class="reader-dialog-card reader-panel-card" role="dialog" aria-modal="true"><div class="dialog-head reader-dialog-head">' + title(t('settings'), t('readerSettingsHint')) + closeButton + '</div><div class="reader-settings-body">' + themeChoices + fullscreenChoice + readingChoices + fontSizeChoices + fontChoices + lineHeightChoices + paragraphSpacingChoices + letterSpacingChoices + '</div></div>';
  }
  dialog.hidden = false;
}
function closeReaderDialog() { const dialog = $('#readerDialog'); if (dialog) dialog.hidden = true; state.readerDialog = ''; }
function openReaderDialog(kind) { state.readerDialog = kind; readerDialogMarkup(kind); updateReaderReferenceChrome(); if (kind === 'toc') requestAnimationFrame(() => updateReaderTocActiveState(true)); }
function readerPreferenceLabel(key, value) {
  if (key === 'fontSize' || key === 'paragraphSpacing') return value + 'px';
  if (key === 'lineHeight') return Number(value).toFixed(2);
  if (key === 'letterSpacing') return Number(value).toFixed(1) + 'px';
  return String(value);
}
function readerPreferenceChanged(input) {
  const key = input.dataset.readerPreference; if (!key) return;
  const numeric = ['fontSize', 'lineHeight', 'paragraphSpacing', 'letterSpacing'].includes(key);
  state.readerPreferences[key] = numeric ? Number(input.value) : input.value;
  saveReaderPreferences(); applyReaderPreferences();
  const value = $('[data-reader-value="' + key + '"]', $('#readerDialog'));
  if (value) value.textContent = readerPreferenceLabel(key, state.readerPreferences[key]);
}
function setReaderReadingMode(mode) {
  const nextMode = mode === 'pages' ? 'pages' : 'scroll';
  if (state.readerMode === 'reading' && state.readerReadingMode !== nextMode) {
    const content = $('[data-reader-content]');
    const book = readerBookById(state.readerBookId);
    if (content && book) {
      book.progress = state.readerReadingMode === 'pages' && content.classList.contains('reader-page-viewport')
        ? Math.min(1, Math.max(0, state.readerPage / Math.max(1, readerPageCount(content) - 1)))
        : readerScrollProgress(content);
      saveLibrary();
    }
  }
  state.readerPreferences.readingMode = nextMode;
  saveReaderPreferences();
  state.readerReadingMode = nextMode;
  state.readerChromeHidden = state.readerImmersive;
  state.readerPage = 0;
  render();
  scheduleReaderPositionRestore();
}
function hideReaderSelectionMenu() {
  if (readerSelectionHideTimer) {
    clearTimeout(readerSelectionHideTimer);
    readerSelectionHideTimer = 0;
  }
  const menu = $('[data-reader-selection-menu]');
  if (menu) menu.hidden = true;
  const dock = $('[data-reader-selection-dock]');
  if (dock) dock.hidden = true;
  // A hidden menu means the native range is no longer an actionable reader
  // selection. Clearing this transient state prevents it from swallowing the
  // next tap on the reader controls or the page surface.
  if (Date.now() >= readerSelectionSuppressUntil) {
    state.readerSelection = null;
    state.readerSelectedText = '';
  }
}
function scheduleReaderSelectionMenuHide(delay = 180) {
  if (readerSelectionHideTimer) clearTimeout(readerSelectionHideTimer);
  readerSelectionHideTimer = setTimeout(() => {
    readerSelectionHideTimer = 0;
    if (window.getSelection?.()?.rangeCount && !window.getSelection().isCollapsed) return;
    if (Date.now() < readerSelectionSuppressUntil) {
      scheduleReaderSelectionMenuHide(Math.max(80, readerSelectionSuppressUntil - Date.now()));
      return;
    }
    hideReaderSelectionMenu();
  }, delay);
}
function suppressReaderPageGesture(duration = 900) {
  readerSelectionSuppressUntil = Math.max(readerSelectionSuppressUntil, Date.now() + duration);
}
function readerHasLiveSelection() {
  const selection = window.getSelection?.();
  return Boolean(state.readerSelection || (selection?.rangeCount && !selection.isCollapsed));
}
function readerNativeSelectionRange() {
  if (!state.readerBookId || state.readerMode !== 'reading') return null;
  const selection = window.getSelection?.();
  const content = $('[data-reader-content]');
  if (!selection || !content || selection.rangeCount === 0 || selection.isCollapsed) return null;
  const range = selection.getRangeAt(0);
  const inside = (node) => Boolean(node && (node === content || content.contains(node)));
  // WebKit can report the common ancestor as a document/column wrapper while
  // the actual endpoints are still inside the reader. Check both endpoints so
  // a valid iOS selection is not discarded before the action bar is shown.
  return inside(range.commonAncestorContainer) || (inside(range.startContainer) && inside(range.endContainer)) ? range : null;
}
function clearReaderSelectionState() {
  state.readerSelection = null;
  state.readerSelectedText = '';
  state.readerAnnotationDraft = null;
  window.getSelection?.()?.removeAllRanges();
}
function captureReaderPosition(content = $('[data-reader-content]')) {
  if (!content) return null;
  return {
    mode: state.readerReadingMode,
    page: state.readerPage,
    progress: readerScrollProgress(content),
    anchor: state.readerSelection ? { ...state.readerSelection } : null,
  };
}
function syncReaderBookProgressToSnapshot(book, position) {
  if (!book || !position) return;
  if (position.mode === 'pages') {
    const content = $('[data-reader-content]');
    const count = content?.classList.contains('reader-page-viewport') ? readerPageCount(content) : 1;
    book.progress = Math.min(1, Math.max(0, Number(position.page || 0) / Math.max(1, count - 1)));
  } else if (Number.isFinite(Number(position.progress))) {
    book.progress = Math.min(1, Math.max(0, Number(position.progress)));
  }
}
function restoreReaderSnapshotImmediately(position) {
  if (!position || state.readerMode !== 'reading') return;
  const content = $('[data-reader-content]');
  if (!content) return;
  if (position.mode === 'pages' && state.readerReadingMode === 'pages' && content.classList.contains('reader-page-viewport')) {
    state.readerPage = Math.max(0, Number(position.page) || 0);
    setReaderPagePosition(state.readerPage, 'instant');
    updateReaderPager();
    return;
  }
  const progress = Math.min(1, Math.max(0, Number(position.progress) || 0));
  const metrics = readerDocumentScrollMetrics(content);
  if (metrics) window.scrollTo({ top: metrics.documentTop + metrics.max * progress, behavior: 'auto' });
  else content.scrollTop = progress * Math.max(0, content.scrollHeight - content.clientHeight);
  updateReaderReferenceChrome();
}
function preserveReaderPositionAfterRender(position) {
  if (!position) return;
  // workspace.innerHTML is replaced synchronously by render(). Put the old
  // page/scroll position back before the browser paints that new DOM, then
  // keep the existing delayed pass for CSS columns that settle one frame later.
  restoreReaderSnapshotImmediately(position);
  requestAnimationFrame(() => requestAnimationFrame(() => {
    if (state.readerMode !== 'reading') return;
    const content = $('[data-reader-content]');
    if (!content) return;
    if (position.mode === 'pages' && state.readerReadingMode === 'pages' && content.classList.contains('reader-page-viewport')) {
      const fallbackPage = Math.max(0, Number(position.page) || 0);
      // Markup wrappers can change Range geometry while WebKit is rebuilding
      // CSS columns. The page the user was reading is the stable source of
      // truth here; restoring from a newly measured Range can incorrectly
      // move a third-page annotation back to page 2 or page 1.
      const restorePage = () => {
        if (state.readerMode !== 'reading' || state.readerReadingMode !== 'pages') return;
        state.readerPage = fallbackPage;
        setReaderPagePosition(fallbackPage, 'instant');
        updateReaderPager();
      };
      restorePage();
      // A newly wrapped selection can make WebKit report one fewer CSS column
      // for a frame. Retry after the column track settles so that transient
      // measurement cannot clamp the captured page and leave it there.
      clearTimeout(readerMarkupRestoreTimer);
      readerMarkupRestoreTimer = setTimeout(() => {
        readerMarkupRestoreTimer = null;
        restorePage();
      }, 220);
      return;
    }
    if (state.readerReadingMode === 'pages' && content.classList.contains('reader-page-viewport')) return;
    const range = position.anchor?.quote ? readerFindQuoteRange(content, position.anchor.quote) : null;
    const rangeRect = range?.getBoundingClientRect?.();
    const viewportHeight = Math.max(1, window.innerHeight || document.documentElement.clientHeight || content.clientHeight || 1);
    if (rangeRect && rangeRect.height) {
      if (readerUsesDocumentScroll()) {
        window.scrollTo({ top: Math.max(0, window.scrollY + rangeRect.top - viewportHeight * 0.3), behavior: 'auto' });
      } else {
        const contentRect = content.getBoundingClientRect();
        content.scrollTop = Math.max(0, content.scrollTop + rangeRect.top - contentRect.top - content.clientHeight * 0.3);
      }
    } else {
      const progress = Math.min(1, Math.max(0, Number(position.progress) || 0));
      const documentMetrics = readerDocumentScrollMetrics(content);
      if (documentMetrics) window.scrollTo({ top: documentMetrics.documentTop + documentMetrics.max * progress, behavior: 'auto' });
      else content.scrollTop = progress * Math.max(0, content.scrollHeight - content.clientHeight);
    }
    updateReaderReferenceChrome();
  }));
}
function preserveReaderPageAfterRender(page) {
  preserveReaderPositionAfterRender({ mode: 'pages', page: Number(page) || 0 });
}
function readerTextOffset(root, container, offset) {
  if (!root || !container) return -1;
  try {
    const range = document.createRange();
    range.selectNodeContents(root);
    range.setEnd(container, offset);
    return range.toString().length;
  } catch { return -1; }
}
function readerRangeAtTextOffsets(root, start, end) {
  if (!root || !Number.isFinite(start) || !Number.isFinite(end) || end <= start) return null;
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  let node; let cursor = 0; let startNode = null; let endNode = null; let startOffset = 0; let endOffset = 0;
  while ((node = walker.nextNode())) {
    const next = cursor + node.nodeValue.length;
    if (!startNode && start >= cursor && start <= next) { startNode = node; startOffset = Math.max(0, start - cursor); }
    if (end >= cursor && end <= next) { endNode = node; endOffset = Math.max(0, end - cursor); break; }
    cursor = next;
  }
  if (!startNode || !endNode) return null;
  const range = document.createRange();
  try { range.setStart(startNode, startOffset); range.setEnd(endNode, endOffset); return range; } catch { return null; }
}
function readerSelectionAnchor(root, range) {
  const start = readerTextOffset(root, range.startContainer, range.startOffset);
  const end = readerTextOffset(root, range.endContainer, range.endOffset);
  if (start < 0 || end <= start) return null;
  return { start, end, quote: range.toString().trim().slice(0, 1200) };
}
function readerSelectionMenuPosition(range) {
  const menu = $('[data-reader-selection-menu]'); const shell = $('.reader-reference-shell');
  if (!menu || !shell) return;
  menu.hidden = false;
  const shellRect = shell.getBoundingClientRect();
  const rects = [...range.getClientRects()].filter((item) => item.width > 0 && item.height > 0);
  const visibleRect = rects.find((item) => item.bottom >= shellRect.top && item.top <= shellRect.bottom && item.right >= shellRect.left && item.left <= shellRect.right);
  const rect = visibleRect || rects[0] || range.getBoundingClientRect();
  const menuRect = menu.getBoundingClientRect();
  const left = Math.min(Math.max(8, rect.left - shellRect.left + (rect.width - menuRect.width) / 2), shellRect.width - menuRect.width - 8);
  const above = rect.top - shellRect.top - menuRect.height - 8;
  const top = above >= 8 ? above : Math.min(shellRect.height - menuRect.height - 8, rect.bottom - shellRect.top + 8);
  menu.style.left = Math.max(8, left) + 'px';
  menu.style.top = Math.max(8, top) + 'px';
}
function readerShowSelectionMenu(range) {
  const root = $('[data-reader-content]');
  const inside = (node) => Boolean(node && (node === root || root?.contains(node)));
  if (!root || !range || !(inside(range.commonAncestorContainer) || (inside(range.startContainer) && inside(range.endContainer)))) return;
  const anchor = readerSelectionAnchor(root, range);
  if (!anchor || !anchor.quote) return hideReaderSelectionMenu();
  if (readerSelectionHideTimer) {
    clearTimeout(readerSelectionHideTimer);
    readerSelectionHideTimer = 0;
  }
  state.readerSelectedText = anchor.quote;
  state.readerSelection = anchor;
  suppressReaderPageGesture(1200);
  const menu = $('[data-reader-selection-menu]');
  if (menu) menu.hidden = false;
  // Keep the browser's live range intact. Clearing it here makes the native
  // selection highlight disappear on iOS/PWA and also breaks subsequent
  // copy/share actions. The OneBox menu is positioned independently.
  requestAnimationFrame(() => readerSelectionMenuPosition(range));
}
function syncReaderNativeSelectionMenu() {
  if (state.readerMode !== 'reading' || !state.readerBookId) return;
  const range = readerNativeSelectionRange();
  if (range) {
    suppressReaderPageGesture(1200);
    readerShowSelectionMenu(range);
  } else if (!state.readerSelection || Date.now() >= readerSelectionSuppressUntil) {
    scheduleReaderSelectionMenuHide();
  }
}
function scheduleReaderNativeSelectionMenuSync() {
  // iOS Safari can publish the final Range after pointerup/contextmenu. A
  // single immediate read races that hand-off, especially inside a CSS
  // column track, so keep a short bounded retry window.
  [60, 180, 360, 700, 1000].forEach((delay) => window.setTimeout(syncReaderNativeSelectionMenu, delay));
}
function readerFindQuoteRange(root, quote) {
  const text = String(quote || '').trim(); if (!text) return null;
  const start = root.textContent.indexOf(text);
  return start < 0 ? null : readerRangeAtTextOffsets(root, start, start + text.length);
}
function readerCommentEntries(book) {
  if (!book) return [];
  const comments = [];
  (book.annotations || []).filter((item) => item && item.note).forEach((item) => comments.push({ ...item, type: 'comment' }));
  (book.markups || []).filter((item) => item && item.type === 'comment' && !comments.some((comment) => comment.id === item.id)).forEach((item) => comments.push({ ...item }));
  comments.sort((a, b) => Number(a.createdAt || 0) - Number(b.createdAt || 0));
  return comments.map((item, index) => ({ ...item, label: index + 1 > 99 ? '..' : String(index + 1) }));
}
function applyReaderMarkups() {
  const root = $('[data-reader-content]'); const book = readerBookById(state.readerBookId);
  if (!root || !book || book.type === 'pdf') return;
  const markups = (book.markups || []).map((item) => ({ ...item, type: item.type === 'comment' ? 'comment' : item.type }));
  const comments = readerCommentEntries(book);
  const commentLabels = new Map(comments.map((item) => [item.id, item.label]));
  const entries = markups.concat(comments).filter((item) => item.type === 'underline' || item.type === 'highlight' || item.type === 'comment');
  entries.sort((a, b) => Number(b.start ?? -1) - Number(a.start ?? -1));
  entries.forEach((item) => {
    const range = Number.isFinite(Number(item.start)) && Number.isFinite(Number(item.end))
      ? readerRangeAtTextOffsets(root, Number(item.start), Number(item.end))
      : readerFindQuoteRange(root, item.quote);
    if (!range || range.collapsed) return;
    const wrapper = document.createElement(item.type === 'comment' ? 'span' : 'mark');
    wrapper.className = item.type === 'comment' ? 'reader-comment-anchor' : 'reader-' + item.type;
    if (item.id) wrapper.dataset.readerMarkupId = item.id;
    const fragment = range.extractContents();
    wrapper.appendChild(fragment);
    if (item.type === 'comment') {
      const badge = document.createElement('button');
      badge.className = 'reader-comment-badge';
      badge.type = 'button';
      badge.dataset.readerCommentId = item.id || '';
      badge.setAttribute('aria-label', state.language === 'en' ? 'Show comment' : '查看评论');
      badge.textContent = commentLabels.get(item.id) || '..';
      wrapper.appendChild(badge);
    }
    range.insertNode(wrapper);
  });
}
function showReaderCommentPopover(id, trigger) {
  const book = readerBookById(state.readerBookId); const note = (book?.annotations || []).find((item) => item.id === id);
  const popover = $('[data-reader-comment-popover]'); const shell = $('.reader-reference-shell');
  if (!note || !popover || !shell) return;
  popover.innerHTML = '<strong>' + (state.language === 'en' ? 'Comment' : '评论') + '</strong><p>' + escapeHtml(note.note || '') + '</p>';
  popover.hidden = false;
  const shellRect = shell.getBoundingClientRect(); const triggerRect = trigger.getBoundingClientRect(); const popoverRect = popover.getBoundingClientRect();
  const left = Math.min(Math.max(10, triggerRect.left - shellRect.left - 8), shellRect.width - popoverRect.width - 10);
  const top = Math.min(Math.max(10, triggerRect.bottom - shellRect.top + 8), shellRect.height - popoverRect.height - 10);
  popover.style.left = left + 'px'; popover.style.top = top + 'px';
}
function hideReaderCommentPopover() { const popover = $('[data-reader-comment-popover]'); if (popover) popover.hidden = true; }
async function copyReaderText(text) {
  if (navigator.clipboard?.writeText) return navigator.clipboard.writeText(text);
  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.setAttribute('readonly', '');
  textarea.style.position = 'fixed'; textarea.style.opacity = '0';
  document.body.appendChild(textarea); textarea.select();
  const copied = document.execCommand('copy');
  textarea.remove();
  if (!copied) throw Error('clipboard unavailable');
}
async function applyReaderSelectionAction(action) {
  const book = readerBookById(state.readerBookId); const selection = state.readerSelection;
  const position = captureReaderPosition();
  suppressReaderPageGesture(1200);
  hideReaderSelectionMenu();
  if (!book || !selection?.quote) return;
  if (action === 'comment') {
    // Moving focus into the note textarea collapses the native Range. Keep a
    // durable copy of the selection until the user explicitly saves/cancels;
    // otherwise delayed selection cleanup erases the note target while the
    // user is still typing.
    state.readerAnnotationDraft = {
      bookId: state.readerBookId,
      quote: selection.quote,
      start: selection.start,
      end: selection.end,
      position,
    };
    return renderAnnotationDialog();
  }
  if (action === 'copy' || action === 'share') {
    try {
      if (action === 'share' && navigator.share) await navigator.share({ title: book.name, text: selection.quote });
      else await copyReaderText(selection.quote);
      toast(state.language === 'en' ? (action === 'share' ? 'Shared' : 'Copied') : (action === 'share' ? '已分享' : '已复制'));
    } catch (error) {
      if (error?.name !== 'AbortError') toast(state.language === 'en' ? 'Copy failed' : '复制失败', 'error');
    }
    clearReaderSelectionState();
    return;
  }
  book.markups ||= [];
  book.markups.push({ id: uid(), type: action, start: selection.start, end: selection.end, quote: selection.quote, createdAt: Date.now() });
  syncReaderBookProgressToSnapshot(book, position);
  clearReaderSelectionState();
  saveLibrary(); render();
  preserveReaderPositionAfterRender(position);
}
function jumpToReaderToc(item) {
  closeReaderDialog();
  const content = $('[data-reader-content]'); if (!content || !item) return;
  const target = readerTocTarget(item);
  if (!target) return;
  if (state.readerReadingMode === 'pages' && content.classList.contains('reader-page-viewport')) {
    const page = readerPageForTarget(content, target);
    setReaderPagePosition(page, 'smooth');
  } else if (readerUsesDocumentScroll()) {
    const header = $('.reader-reference-top');
    const chromeVisible = !(state.readerImmersive && state.readerChromeHidden);
    const offset = chromeVisible ? Math.max(12, header?.getBoundingClientRect().height || 0) : 12;
    const top = target.getBoundingClientRect().top + (window.scrollY || window.pageYOffset || 0) - offset;
    window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
    setTimeout(() => { updateReaderReferenceChrome(); updateReaderTocActiveState(); }, 260);
  } else {
    const contentRect = content.getBoundingClientRect();
    const targetRect = target.getBoundingClientRect();
    const top = content.scrollTop + targetRect.top - contentRect.top - 12;
    content.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
    setTimeout(updateReaderReferenceChrome, 260);
  }
}
function readerTocTarget(item) {
  if (!item) return null;
  if (item.section == null) return document.getElementById(item.id);
  const section = document.getElementById('reader-epub-section-' + item.section);
  if (!section || !item.anchor) return section;
  return [...section.querySelectorAll('[id]')].find((node) => node.id === item.anchor) || section;
}
function jumpToReaderComment(id) {
  const target = $$('.reader-comment-anchor').find((node) => node.dataset.readerMarkupId === String(id || ''));
  if (!target) return closeReaderDialog();
  closeReaderDialog();
  const content = $('[data-reader-content]'); if (!content) return;
  if (state.readerReadingMode === 'pages' && content.classList.contains('reader-page-viewport')) {
    const page = readerPageForTarget(content, target);
    setReaderPagePosition(page, 'smooth');
  } else {
    target.scrollIntoView({ behavior: 'smooth', block: 'center' }); setTimeout(updateReaderReferenceChrome, 260);
  }
}
function currentReaderChapterIndex() {
  const content = $('[data-reader-content]'); if (!content || !state.readerToc.length) return -1;
  if (state.readerReadingMode === 'pages' && content.classList.contains('reader-page-viewport')) {
    const page = state.readerPage || 0; let index = 0;
    state.readerToc.forEach((item, position) => { const target = readerTocTarget(item); if (target && readerPageForTarget(content, target) <= page) index = position; });
    return index;
  }
  const header = $('.reader-reference-top');
  const chromeVisible = !(state.readerImmersive && state.readerChromeHidden);
  const top = readerUsesDocumentScroll()
    ? Math.max(24, chromeVisible ? (header?.getBoundingClientRect().height || 0) + 12 : 24)
    : content.getBoundingClientRect().top + 24;
  let index = 0;
  state.readerToc.forEach((item, position) => { const target = readerTocTarget(item); if (target && target.getBoundingClientRect().top <= top) index = position; });
  return index;
}
function updateReaderTocActiveState(reveal = false) {
  const currentIndex = currentReaderChapterIndex();
  const tocItems = $$('#readerDialog [data-reader-toc-id]');
  tocItems.forEach((node, index) => {
    const active = index === currentIndex;
    node.classList.toggle('active', active);
    if (active) node.setAttribute('aria-current', 'true');
    else node.removeAttribute('aria-current');
  });
  if (reveal) tocItems[currentIndex]?.scrollIntoView({ block: 'nearest' });
}
function updateReaderReferenceChrome() {
  const shell = $('.reader-reference-shell'); if (!shell) return;
  shell.classList.toggle('chrome-hidden', state.readerImmersive && state.readerChromeHidden);
  const index = currentReaderChapterIndex(); const item = state.readerToc[index];
  updateReaderTocActiveState();
  const name = $('[data-reader-chapter-name]'); const chapterIndex = $('[data-reader-chapter-index]');
  if (name) name.textContent = item?.label || '—';
  if (chapterIndex) chapterIndex.textContent = state.readerToc.length ? (index + 1) + '/' + state.readerToc.length : '0/0';
  const content = $('[data-reader-content]'); const label = $('[data-reader-progress-label]'); const slider = $('[data-reader-progress]');
  let progress = 0;
  let pageCount = 1;
  if (content) {
    if (state.readerReadingMode === 'pages' && content.classList.contains('reader-page-viewport')) {
      pageCount = readerPageCount(content);
      progress = state.readerPage / Math.max(1, pageCount - 1);
    } else progress = readerScrollProgress(content);
  }
  progress = Math.min(1, Math.max(0, progress));
  if (label) label.textContent = Math.round(progress * 100) + '%';
  if (slider && document.activeElement !== slider) slider.value = String(Math.round(progress * 100));
  const percent = Math.round(progress * 100);
  const pageInfo = $('[data-reader-page-info]');
  let currentPage = 1;
  if (content) {
    if (state.readerReadingMode === 'pages' && content.classList.contains('reader-page-viewport')) {
      currentPage = Math.min(pageCount, state.readerPage + 1);
    } else if (readerUsesDocumentScroll()) {
      const documentPage = readerDocumentPageInfo(content);
      if (documentPage) { currentPage = documentPage.current; pageCount = documentPage.count; }
    } else {
      pageCount = Math.max(1, Math.ceil(content.scrollHeight / Math.max(1, content.clientHeight)));
      currentPage = Math.min(pageCount, Math.floor(content.scrollTop / Math.max(1, content.clientHeight)) + 1);
    }
  }
  if (pageInfo) pageInfo.textContent = currentPage + ' / ' + pageCount;
  $$('[data-reader-progress-label]').forEach((node) => { node.textContent = percent + '%'; });
  $$('[data-reader-progress-ring]').forEach((ring) => {
    ring.style.setProperty('--reader-progress', percent + '%');
    const value = ring.querySelector('[data-reader-progress-value]');
    if (value) value.style.strokeDashoffset = String(56.55 * (1 - progress));
    ring.setAttribute('aria-label', t('readerProgress') + ' ' + percent + '%');
  });
  const fill = $('[data-reader-progress-fill]'); if (fill) fill.style.width = Math.round(progress * 100) + '%';
  const progressLine = $('[data-reader-progress-line]');
  if (progressLine) progressLine.setAttribute('aria-valuenow', String(percent));
  if (chapterIndex) chapterIndex.textContent = state.readerReadingMode === 'pages' && content?.classList.contains('reader-page-viewport') ? currentPage + ' / ' + pageCount : state.readerToc.length ? (index + 1) + ' / ' + state.readerToc.length : '—';
  const previous = $('[data-reader-chapter-prev]'); const next = $('[data-reader-chapter-next]');
  if (previous) previous.disabled = !state.readerToc.length || index <= 0;
  if (next) next.disabled = !state.readerToc.length || index >= state.readerToc.length - 1;
}
function goReaderChapter(step) {
  if (!state.readerToc.length) return toast(state.language === 'en' ? 'No contents available' : '本书暂无目录');
  const target = currentReaderChapterIndex() + step;
  if (target < 0 || target >= state.readerToc.length) return;
  jumpToReaderToc(state.readerToc[target]);
}
function toggleReaderChrome() {
  if (!state.readerImmersive) return;
  state.readerChromeHidden = !state.readerChromeHidden;
  updateReaderReferenceChrome();
}
function setReaderProgress(value) {
  const content = $('[data-reader-content]'); if (!content) return;
  const progress = Math.min(1, Math.max(0, Number(value) / 100));
  if (state.readerReadingMode === 'pages' && content.classList.contains('reader-page-viewport')) {
    const count = readerPageCount(content);
    setReaderPagePosition(Math.round(progress * Math.max(0, count - 1)), 'smooth');
  } else content.scrollTo({ top: progress * Math.max(0, content.scrollHeight - content.clientHeight), behavior: 'smooth' });
  updateReaderReferenceChrome();
}
function turnReaderPage(direction) {
  const viewport = $('.reader-page-viewport'); if (!viewport) return;
  updateReaderPager();
  const count = readerPageCount(viewport);
  const nextPage = Math.min(Math.max(0, state.readerPage + direction), count - 1);
  if (nextPage === state.readerPage) return;
  const prefersReducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  const behavior = state.readerPreferences.pageAnimation !== 'none' && !prefersReducedMotion ? 'smooth' : 'instant';
  // Keep one source of truth for the visible page. Moving the real column
  // track directly avoids the Safari/PWA desynchronisation caused by a
  // second animated overlay and gives the reader a calm horizontal slide.
  setReaderPagePosition(nextPage, behavior);
}
function renderAnnotationDialog() {
  if (!state.readerSelectedText) return;
  const dialog = $('#annotationDialog'); if (!dialog) return;
  dialog.innerHTML = '<div class="reader-dialog-card reader-panel-card reader-annotation-card" role="dialog" aria-modal="true"><div class="dialog-head reader-dialog-head"><div class="reader-dialog-title"><h2>' + t('addAnnotation') + '</h2><small>' + (state.language === 'en' ? 'Keep a note with this passage' : '为这段文字留下阅读笔记') + '</small></div><button class="reader-dialog-close" data-close-annotation aria-label="' + t('close') + '"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m7 7 10 10M17 7 7 17"/></svg></button></div><blockquote class="reader-annotation-quote">' + escapeHtml(state.readerSelectedText) + '</blockquote><label class="reader-annotation-field"><span>' + (state.language === 'en' ? 'Add note' : '添加笔记') + '</span><textarea id="annotationText" maxlength="500" placeholder="' + t('annotationPlaceholder') + '"></textarea></label><div class="reader-dialog-actions"><button type="button" class="reader-dialog-secondary" data-close-annotation>' + (state.language === 'en' ? 'Cancel' : '取消') + '</button><button type="button" class="reader-dialog-primary" data-save-annotation>' + t('saveAnnotation') + '</button></div></div>';
  dialog.hidden = false;
}
function readerReadingView(book) {
  const isPdf = book.type === 'pdf';
  const hint = state.readerHint || (book.type.toUpperCase() + ' · ' + Math.max(1, Math.round(book.size / 1024)) + ' KB');
  const contentClass = (isPdf ? 'reader-content reader-pdf-content' : state.readerReadingMode === 'pages' ? 'reader-content reader-page-viewport' : 'reader-content reader-scroll-content') + (book.type === 'epub' ? ' reader-epub-content' : '');
  const content = state.readerReadingMode === 'pages' && !isPdf ? '<div class="reader-page-flow">' + state.readerContent + '</div>' : state.readerContent;
  const chapter = state.readerToc[0]?.label || '—';
  const pageLabel = isPdf ? hint : (state.readerReadingMode === 'pages' ? '1 / 1' : hint);
  const icon = (path) => '<svg viewBox="0 0 24 24" aria-hidden="true">' + path + '</svg>';
  const tool = (action, path, label) => '<button class="reader-reference-tool" data-' + action + '>' + icon(path) + '<span>' + label + '</span></button>';
  const chromeClass = (state.readerImmersive && state.readerChromeHidden ? ' chrome-hidden' : '') + (state.readerImmersive ? '' : ' reader-windowed');
  const commentsIcon = '<path d="M6 4.5h9l3 3v12H6z"/><path d="M15 4.5v3h3M9 11h6M9 14h6M9 17h3"/>';
  const selectionActions = '<button type="button" data-reader-selection-action="copy">' + (state.language === 'en' ? 'Copy' : '复制') + '</button><button type="button" data-reader-selection-action="underline">' + (state.language === 'en' ? 'Underline' : '划线') + '</button><button type="button" data-reader-selection-action="highlight">' + (state.language === 'en' ? 'Highlight' : '高亮') + '</button><button type="button" data-reader-selection-action="comment">' + t('readerComments') + '</button><button type="button" data-reader-selection-action="share">' + (state.language === 'en' ? 'Share' : '分享') + '</button>';
  const pageCorners = state.readerReadingMode === 'pages' && !isPdf ? '<button type="button" class="reader-page-turn-corner reader-page-turn-corner-prev" data-reader-page-prev aria-label="' + (state.language === 'en' ? 'Previous page' : '上一页') + '"><span aria-hidden="true"></span></button><button type="button" class="reader-page-turn-corner reader-page-turn-corner-next" data-reader-page-next aria-label="' + (state.language === 'en' ? 'Next page' : '下一页') + '"><span aria-hidden="true"></span></button>' : '';
  return '<div class="reader-reference-shell' + chromeClass + '" data-reader-theme="' + escapeHtml(state.readerPreferences.theme) + '">' +
    '<div class="reader-safari-edge-top" aria-hidden="true"></div><header class="reader-reference-top"><button class="reader-ref-icon reader-fullscreen-tool reader-reference-top-fullscreen" data-reader-fullscreen aria-label="' + t('readerFullscreen') + '"></button><div class="reader-reference-title"><strong>' + escapeHtml(book.name) + '</strong><small>' + escapeHtml(hint) + '</small></div><div class="reader-reference-header-progress" data-reader-progress-line role="progressbar" aria-label="' + t('readerProgress') + '" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0"><span class="reader-reference-header-track"><i data-reader-progress-fill></i></span><b class="reader-reference-header-percent" data-reader-progress-label>0%</b></div></header>' +
    '<main class="reader-reference-body"><article class="' + contentClass + ' reader-reference-viewer" data-reader-content data-reader-surface>' + content + '</article>' + pageCorners + '</main>' +
    '<footer class="reader-reference-bottom"><div class="reader-reference-chapter"><span class="reader-reference-chapter-name" data-reader-chapter-name>' + escapeHtml(chapter) + '</span><span class="reader-reference-page-meta" data-reader-page-info>—</span></div>' +
    '<div class="reader-reference-tool-row"><button class="reader-reference-tool reader-shelf-tool" data-close-reader aria-label="' + t('bookshelf') + '">' + icon('<path d="m15 5-7 7 7 7"/>') + '<span>' + t('bookshelf') + '</span></button>' + tool('reader-toc', '<path d="M5 5h14M5 12h14M5 19h9"/>', t('readerContents')) + '<button class="reader-reference-tool reader-settings-tool" data-reader-settings>' + icon('<path d="M4 7h8M16 7h4M4 12h3M11 12h9M4 17h8M16 17h4"/><circle cx="14" cy="7" r="2"/><circle cx="9" cy="12" r="2"/><circle cx="14" cy="17" r="2"/>') + '<span>' + t('settings') + '</span></button>' + '<button class="reader-reference-tool reader-comments-tool" data-reader-comments aria-label="' + t('readerComments') + '">' + icon(commentsIcon) + '<span>' + t('readerComments') + '</span></button>' + '<button class="reader-reference-tool reader-fullscreen-tool" data-reader-fullscreen aria-label="' + t('readerFullscreen') + '"></button></div></footer><div class="reader-selection-menu" data-reader-selection-menu hidden role="menu">' + selectionActions + '</div><div class="reader-comment-popover" data-reader-comment-popover hidden></div></div>';
}
function readerFormatCoverMarkup(type) {
  const icons = {
    md: '<path d="M7 4.5h7l4 4v11H7z"/><path d="M14 4.5v4h4M9.5 12h5M9.5 15h5M9.5 18h3"/>',
    txt: '<path d="M6.5 4.5h11v15h-11z"/><path d="M9 9h6M9 12.5h6M9 16h4"/>',
    pdf: '<path d="M7 4.5h7l4 4v11H7z"/><path d="M14 4.5v4h4M9 15h2.5a1.5 1.5 0 0 0 0-3H9v5M13.5 12v5h1.2a2.5 2.5 0 0 0 0-5z"/>',
    epub: '<path d="M5.5 5.5c2.3-.9 4.3-.6 6.5 1v13c-2.2-1.6-4.2-1.9-6.5-1zM18.5 5.5c-2.3-.9-4.3-.6-6.5 1v13c2.2-1.6 4.2-1.9 6.5-1z"/><path d="M12 6.5v13"/>',
  };
  const key = icons[type] ? type : 'txt';
  return '<span class="reader-cover-fallback reader-cover-' + key + '"><svg viewBox="0 0 24 24" aria-hidden="true">' + icons[key] + '</svg><b>' + key.toUpperCase() + '</b><small>LOCAL</small></span>';
}
function readerBookCoverMarkup(book) {
  if (book._coverData && /^data:image\//i.test(book._coverData)) return '<img class="reader-book-cover-image" src="' + escapeHtml(book._coverData) + '" alt="" loading="lazy">';
  return readerFormatCoverMarkup(book.type);
}
function readerAddCardMarkup() {
  return '<button class="reader-empty-card reader-add-card" data-open-reader-file><span class="reader-empty-book"><svg viewBox="0 0 48 48" aria-hidden="true"><path d="M10 8.5h18.5l6 6v24H10z"/><path d="M28.5 8.5v7h6M16 24h13M16 30h9M16 36h6"/><path d="M37 24v10M32 29h10"/></svg></span><strong>' + t('addBook') + '</strong></button>';
}
function reader() {
  const activeBook = readerBookById(state.readerBookId);
  if (state.readerMode === 'reading' && activeBook) return readerReadingView(activeBook);
  const books = [...state.library].sort((a, b) => Number(b.order || 0) - Number(a.order || 0) || Number(b.lastOpenedAt || b.createdAt) - Number(a.lastOpenedAt || a.createdAt));
  books.forEach((book) => { if (book.hasCover !== false && !book._coverData) hydrateReaderBookCover(book); });
  const cards = books.map((book) => {
    const progress = typeof book.progress === 'number' ? book.progress : Number(book.progress?.percent || 0);
    return '<article class="book-card reader-book-card" data-reader-book-card data-reader-book-index="' + books.indexOf(book) + '" data-id="' + escapeHtml(book.id) + '"><button class="book-open reader-book-open" data-open-reader="' + escapeHtml(book.id) + '"><span class="book-cover reader-book-cover ' + book.type + '">' + readerBookCoverMarkup(book) + '</span><span class="book-copy reader-book-copy"><strong>' + escapeHtml(book.name) + '</strong><span class="reader-book-meta"><span>' + book.type.toUpperCase() + '</span><i></i><span>' + Math.max(1, Math.round(book.size / 1024)) + ' KB</span></span><span class="reader-book-progress"><span class="prog-bar"><i style="width:' + Math.round(progress * 100) + '%"></i></span><em>' + Math.round(progress * 100) + '%</em></span></span></button><button class="book-delete reader-book-delete" data-delete-book="' + escapeHtml(book.id) + '" aria-label="' + t('deleteBook') + '" title="' + t('deleteBook') + '"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 7h14M9 7V4h6v3M8 10v7M12 10v7M16 10v7M7 7l1 14h8l1-14"/></svg></button></article>';
  }).join('');
  const layoutClass = state.readerLayout === 'list' ? 'reader-book-list' : 'reader-book-grid-cards';
  const libraryBody = '<div class="reader-book-grid ' + layoutClass + (!books.length ? ' reader-book-grid-empty' : '') + '">' + (books.length ? cards : '') + readerAddCardMarkup() + '</div>';
  const layoutIcon = state.readerLayout === 'list' ? '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 6h14M5 12h14M5 18h14"/><path d="M5 6h.01M5 12h.01M5 18h.01"/></svg><span>宫格</span>' : '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="4" width="6" height="6" rx="1"/><rect x="14" y="4" width="6" height="6" rx="1"/><rect x="4" y="14" width="6" height="6" rx="1"/><rect x="14" y="14" width="6" height="6" rx="1"/></svg><span>列表</span>';
  return '<div class="reader-library-view"><section class="reader-library-panel"><div class="reader-library-head"><div class="reader-library-title-row"><h2>' + t('bookshelf') + ' <span class="reader-book-count">(' + books.length + ')</span></h2><small>' + t('readerHint') + '</small></div><div class="reader-library-actions"><button class="reader-layout-toggle" data-reader-layout-toggle aria-label="切换书架布局">' + layoutIcon + '</button></div></div>' + libraryBody + '</section><input id="readerFileInput" type="file" hidden multiple accept=".md,.markdown,.txt,.pdf,.epub,text/markdown,text/plain,application/pdf,application/epub+zip"></div>';
}

// Calendar data --------------------------------------------------------------
function eventsForDate(key) {
  const direct = [...(state.events[key] || [])];
  const directIds = new Set(direct.map((event) => event.id));
  const recurring = Object.values(state.events || {}).flat().filter((event) => !directIds.has(event.id) && eventMatchesDay(event, key));
  return direct.concat(recurring);
}
const holidayStore = { ...(window.ONEBOX_HOLIDAY_DATA || {}) };
const holidayLoaded = new Set(Object.keys(holidayStore).map(String));
const holidaySource = 'https://raw.githubusercontent.com/NateScarlet/holiday-cn/master';
async function ensureHolidayYear(year) {
  if (holidayLoaded.has(String(year))) return;
  holidayLoaded.add(String(year));
  const cached = parseStored(STORAGE.holidays + '.' + year, null);
  if (cached) holidayStore[year] = cached;
  try {
    const response = await fetch(holidaySource + '/' + year + '.json', { headers: { Accept: 'application/json' } });
    if (!response.ok) throw new Error();
    const data = await response.json();
    holidayStore[year] = Object.fromEntries((data.days || []).map((item) => [item.date, { name: item.name, isOffDay: Boolean(item.isOffDay) }]));
    saveStored(STORAGE.holidays + '.' + year, holidayStore[year]);
    if (state.tool === 'calendar' && state.month.getFullYear() === Number(year)) render();
  } catch { /* bundled data remains useful offline */ }
}
const holidayFor = (key) => holidayStore[key.slice(0, 4)]?.[key];
const lunarMonthNames = ['正月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'];
const lunarDayNames = ['', '初一', '初二', '初三', '初四', '初五', '初六', '初七', '初八', '初九', '初十', '十一', '十二', '十三', '十四', '十五', '十六', '十七', '十八', '十九', '二十', '廿一', '廿二', '廿三', '廿四', '廿五', '廿六', '廿七', '廿八', '廿九', '三十'];
const lunarFormatters = ['zh-CN-u-ca-chinese', 'zh-TW-u-ca-chinese', 'en-US-u-ca-chinese'].map((locale) => {
  try { return new Intl.DateTimeFormat(locale, { year: 'numeric', month: 'long', day: 'numeric' }); } catch { return null; }
}).filter(Boolean);
function chineseNumber(value) {
  let text = String(value || '').replace(/[月日]/g, '').replace(/^闰|^閏|^leap/i, '').replace(/^初/, '').trim();
  const numeric = text.match(/\d+/);
  if (numeric) return Number(numeric[0]);
  if (text === '廿') return 20;
  if (text === '卅') return 30;
  if (text.startsWith('廿')) return 20 + ({ 一: 1, 二: 2, 三: 3, 四: 4, 五: 5, 六: 6, 七: 7, 八: 8, 九: 9 }[text.slice(1)] || 0);
  if (text.startsWith('卅')) return 30 + ({ 一: 1, 二: 2, 三: 3, 四: 4, 五: 5, 六: 6, 七: 7, 八: 8, 九: 9 }[text.slice(1)] || 0);
  const digits = { 零: 0, 〇: 0, 一: 1, 二: 2, 两: 2, 兩: 2, 三: 3, 四: 4, 五: 5, 六: 6, 七: 7, 八: 8, 九: 9, 正: 1, 元: 1, 冬: 11, 腊: 12, 臘: 12 };
  if (text.includes('十')) {
    const pair = text.split('十');
    return (pair[0] ? digits[pair[0]] * 10 : 10) + (pair[1] ? digits[pair[1]] : 0);
  }
  return digits[text] ?? 0;
}
function lunarFor(date) {
  for (const formatter of lunarFormatters) {
    const parts = Object.fromEntries(formatter.formatToParts(date).filter((item) => item.type !== 'literal').map((item) => [item.type, item.value]));
    const rawMonth = parts.month || '';
    const month = chineseNumber(rawMonth);
    const day = chineseNumber(parts.day || '');
    if (!month || !day) continue;
    const leap = /闰|閏|leap/i.test(rawMonth);
    const monthText = (leap ? '闰' : '') + (lunarMonthNames[month - 1] || String(month) + '月');
    const festivals = { '1-1': '春节', '1-15': '元宵节', '5-5': '端午节', '7-7': '七夕', '7-15': '中元节', '8-15': '中秋节', '9-9': '重阳节', '12-8': '腊八节', '12-23': '小年', '12-24': '小年' };
    const festival = festivals[month + '-' + day] || (month === 12 && day >= 29 ? '除夕' : '');
    return { month, day, monthText, dayText: lunarDayNames[day] || String(day), yearName: parts.yearName || '', festival, text: monthText + (lunarDayNames[day] || String(day)) };
  }
  return null;
}
const solarTermNames = ['小寒', '大寒', '立春', '雨水', '惊蛰', '春分', '清明', '谷雨', '立夏', '小满', '芒种', '夏至', '小暑', '大暑', '立秋', '处暑', '白露', '秋分', '寒露', '霜降', '立冬', '小雪', '大雪', '冬至'];
const solarTermConstants21 = [5.4055, 20.12, 3.87, 18.73, 5.63, 20.646, 4.81, 20.1, 5.52, 21.04, 5.678, 21.37, 7.108, 22.83, 7.5, 23.13, 7.646, 23.042, 8.318, 23.438, 7.438, 22.36, 7.18, 21.94];
function solarTermsForYear(year) {
  const result = {};
  if (year < 1900 || year > 2099) return result;
  const y = year % 100;
  solarTermNames.forEach((name, index) => {
    const day = Math.floor(y * .2422 + solarTermConstants21[index]) - Math.floor((index < 4 ? y - 1 : y) / 4);
    const month = Math.floor(index / 2) + 1;
    result[year + '-' + pad(month) + '-' + pad(day)] = name;
  });
  return result;
}
const solarTermCache = {};
const solarTermFor = (key) => {
  const year = Number(key.slice(0, 4));
  solarTermCache[year] ||= solarTermsForYear(year);
  return solarTermCache[year][key] || '';
};
const zodiacFor = (yearName) => ({ 子: '鼠', 丑: '牛', 寅: '虎', 卯: '兔', 辰: '龙', 巳: '蛇', 午: '马', 未: '羊', 申: '猴', 酉: '鸡', 戌: '狗', 亥: '猪' }[yearName?.slice(-1)] || '');
function calendarMeta(key) {
  const lunar = lunarFor(dateFromKey(key));
  const holiday = holidayFor(key);
  const term = solarTermFor(key);
  return { lunar, holiday, term, label: term || (holiday ? (holiday.isOffDay ? holiday.name : t('makeUpWorkday')) : lunar?.festival || '') };
}

// Calculator -----------------------------------------------------------------
function tokenizeExpression(input) {
  const normalized = input.replace(/[xX]/g, '×').replace(/√/g, 'sqrt').replace(/\s+/g, '');
  const tokens = [];
  let index = 0;
  while (index < normalized.length) {
    const char = normalized[index];
    if (/[0-9.]/.test(char)) {
      const start = index; let dots = 0;
      while (index < normalized.length && /[0-9.eE+-]/.test(normalized[index])) {
        if (normalized[index] === '.') dots += 1;
        if (/[+-]/.test(normalized[index]) && index > start && !/[eE]/.test(normalized[index - 1])) break;
        index += 1;
      }
      const raw = normalized.slice(start, index);
      if (dots > 1 || raw === '.' || !Number.isFinite(Number(raw))) throw Error(state.language === 'en' ? 'Invalid number' : '数字格式不正确');
      tokens.push({ type: 'number', value: Number(raw) });
      continue;
    }
    if (/[a-zA-Zπ]/.test(char)) {
      const start = index;
      while (index < normalized.length && /[a-zA-Zπ]/.test(normalized[index])) index += 1;
      tokens.push({ type: 'identifier', value: normalized.slice(start, index).toLowerCase() });
      continue;
    }
    if ('+-−×÷*/%^(),!'.includes(char)) {
      tokens.push({ type: 'operator', value: char === '*' ? '×' : char === '/' ? '÷' : char }); index += 1; continue;
    }
    throw Error(state.language === 'en' ? 'Unsupported character' : '包含无法识别的字符');
  }
  return tokens;
}
function evaluateExpression(input) {
  const tokens = tokenizeExpression(input); if (!tokens.length) return 0;
  let position = 0;
  const peek = () => tokens[position];
  const take = () => tokens[position++];
  const match = (value) => { if (peek()?.value === value) { position += 1; return true; } return false; };
  const funcs = {
    sin: (v) => Math.sin(state.calcAngle === 'deg' ? v * Math.PI / 180 : v),
    cos: (v) => Math.cos(state.calcAngle === 'deg' ? v * Math.PI / 180 : v),
    tan: (v) => Math.tan(state.calcAngle === 'deg' ? v * Math.PI / 180 : v),
    asin: (v) => state.calcAngle === 'deg' ? Math.asin(v) * 180 / Math.PI : Math.asin(v),
    acos: (v) => state.calcAngle === 'deg' ? Math.acos(v) * 180 / Math.PI : Math.acos(v),
    atan: (v) => state.calcAngle === 'deg' ? Math.atan(v) * 180 / Math.PI : Math.atan(v),
    log: (v) => Math.log10(v), ln: (v) => Math.log(v), sqrt: (v) => Math.sqrt(v), abs: (v) => Math.abs(v), exp: (v) => Math.exp(v),
  };
  function primary() {
    if (match('(')) { const value = expression(); if (!match(')')) throw Error(state.language === 'en' ? 'Missing closing parenthesis' : '括号不匹配'); return value; }
    const token = take();
    if (!token) throw Error(state.language === 'en' ? 'Incomplete expression' : '表达式不完整');
    if (token.type === 'number') return token.value;
    if (token.type !== 'identifier') throw Error(state.language === 'en' ? 'Incomplete expression' : '表达式不完整');
    if (token.value === 'π' || token.value === 'pi') return Math.PI;
    if (token.value === 'e') return Math.E;
    if (!funcs[token.value] || !match('(')) throw Error(state.language === 'en' ? 'Unknown function' : '未知函数');
    const args = []; if (!match(')')) { args.push(expression()); while (match(',')) args.push(expression()); if (!match(')')) throw Error(state.language === 'en' ? 'Missing closing parenthesis' : '括号不匹配'); }
    if (args.length !== 1) throw Error(state.language === 'en' ? 'Functions take one argument' : '函数需要一个参数');
    return funcs[token.value](args[0]);
  }
  function postfix() {
    let value = primary();
    while (match('%') || match('!')) {
      const operator = tokens[position - 1].value;
      if (operator === '%') value /= 100;
      if (operator === '!') {
        if (value < 0 || value > 170 || !Number.isInteger(value)) throw Error(state.language === 'en' ? 'Factorial needs an integer from 0 to 170' : '阶乘只支持 0 到 170 的整数');
        let result = 1; for (let i = 2; i <= value; i += 1) result *= i; value = result;
      }
    }
    return value;
  }
  function power() { const left = postfix(); return match('^') ? left ** unary() : left; }
  function unary() { if (match('+')) return unary(); if (match('−') || match('-')) return -unary(); return power(); }
  function term() {
    let value = unary();
    while (peek() && ['×', '÷'].includes(peek().value)) { const operator = take().value; const right = unary(); if (operator === '÷' && right === 0) throw Error(state.language === 'en' ? 'Cannot divide by zero' : '不能除以零'); value = operator === '×' ? value * right : value / right; }
    return value;
  }
  function expression() {
    let value = term();
    while (peek() && ['+', '−', '-'].includes(peek().value)) { const operator = take().value; const right = term(); value = operator === '+' ? value + right : value - right; }
    return value;
  }
  const result = expression();
  if (position !== tokens.length || !Number.isFinite(result)) throw Error(state.language === 'en' ? 'Expression cannot be evaluated' : '表达式无法计算');
  return Number(result.toPrecision(12));
}
const calcPreview = () => { if (!state.calcExpr) return '0'; try { return formatNumber(evaluateExpression(state.calcExpr)); } catch { return '—'; } };
function saveCalculator() { saveStored(STORAGE.calculator, { expr: state.calcExpr, history: state.calcHistory.slice(0, 30), historyOpen: state.calcHistoryOpen === true }); }
function calculator() {
  const history = state.calcHistory.length ? state.calcHistory.slice(0, 8).map((item) => {
    const id = item.id || String(item.at || item.expression);
    return '<div class="swipe-row history-swipe-row" data-swipe-row><button class="history-item swipe-content" data-history-expression="' + escapeHtml(item.expression) + '"><span>' + escapeHtml(item.expression) + '</span><b>' + escapeHtml(item.result) + '</b></button><button class="swipe-delete" data-delete-calc-history="' + escapeHtml(id) + '">' + (state.language === 'en' ? 'Delete' : '删除') + '</button></div>';
  }).join('') : '<p class="empty compact">' + t('ready') + '</p>';
  const scienceButton = (label, key, extra = '') => '<button class="key calc-science-key" data-science-key="' + escapeHtml(key) + '" ' + extra + '>' + label + '</button>';
  const normalButton = (label, extra = '') => '<button class="key ' + (/[÷×−+%]/.test(label) ? 'op ' : '') + (label === '=' ? 'equal ' : '') + (label === 'CE' ? 'danger ' : '') + '" data-key="' + escapeHtml(label) + '" ' + extra + '>' + label + '</button>';
  const inverse = state.calcInverse;
  const angle = '<button class="key angle-toggle" data-toggle-angle aria-label="' + t('degree') + ' / ' + t('radian') + '"><span>Deg</span><i></i><span>Rad</span></button>';
  const keys = [
    angle, scienceButton('x!', '!'), normalButton('('), normalButton(')'), normalButton('%'), normalButton('CE'),
    '<button class="key calc-science-key" data-toggle-inverse aria-pressed="' + (inverse ? 'true' : 'false') + '">Inv</button>', scienceButton(inverse ? 'sin⁻¹' : 'sin', inverse ? 'asin(' : 'sin('), scienceButton('ln', 'ln('), normalButton('7'), normalButton('8'), normalButton('9'), normalButton('÷'),
    scienceButton('π', 'π'), scienceButton(inverse ? 'cos⁻¹' : 'cos', inverse ? 'acos(' : 'cos('), scienceButton('log', 'log('), normalButton('4'), normalButton('5'), normalButton('6'), normalButton('×'),
    scienceButton('e', 'e'), scienceButton(inverse ? 'tan⁻¹' : 'tan', inverse ? 'atan(' : 'tan('), scienceButton('√', 'sqrt('), normalButton('1'), normalButton('2'), normalButton('3'), normalButton('−'),
    '<button class="key calc-science-key" data-answer>Ans</button>', '<button class="key calc-science-key" data-key="EXP">EXP</button>', scienceButton('xʸ', '^'), normalButton('0'), normalButton('.'), normalButton('='), normalButton('+'),
  ].join('');
  const mobileKeys = [
    angle, scienceButton('x!', '!'), normalButton('CE'),
    '<button class="key calc-science-key" data-toggle-inverse aria-pressed="' + (inverse ? 'true' : 'false') + '">Inv</button>', scienceButton(inverse ? 'sin⁻¹' : 'sin', inverse ? 'asin(' : 'sin('), scienceButton('ln', 'ln('), normalButton('%'),
    scienceButton('π', 'π'), scienceButton(inverse ? 'cos⁻¹' : 'cos', inverse ? 'acos(' : 'cos('), scienceButton('log', 'log('), normalButton('('),
    scienceButton('e', 'e'), scienceButton(inverse ? 'tan⁻¹' : 'tan', inverse ? 'atan(' : 'tan('), scienceButton('√', 'sqrt('), normalButton(')'),
    '<button class="key calc-science-key" data-answer>Ans</button>', '<button class="key calc-science-key" data-key="EXP">EXP</button>', scienceButton('xʸ', '^'), normalButton('⌫'),
    normalButton('7'), normalButton('8'), normalButton('9'), normalButton('÷'),
    normalButton('4'), normalButton('5'), normalButton('6'), normalButton('×'),
    normalButton('1'), normalButton('2'), normalButton('3'), normalButton('−'),
    normalButton('0'), normalButton('.'), normalButton('='), normalButton('+'),
  ].join('');
  const answer = state.calcHistory[0]?.result || '0';
  return '<div class="calculator-layout"><div class="calculator-surface"><div class="display" aria-live="polite"><div class="display-meta"><button class="display-history-toggle" data-toggle-calc-history aria-expanded="' + (state.calcHistoryOpen ? 'true' : 'false') + '" aria-label="' + t('recentCalculations') + '"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3.5 12a8.5 8.5 0 1 0 2.5-6.4"/><path d="M3.5 4.5v5h5"/><path d="M12 7.5v4.8l3 1.8"/></svg></button><span>Ans = ' + escapeHtml(String(answer)) + '</span></div><div class="expression">' + (escapeHtml(state.calcExpr) || (state.language === 'en' ? 'Ready' : '准备计算')) + '</div><div class="result" aria-hidden="true">' + calcPreview() + '</div><div class="display-history" ' + (state.calcHistoryOpen ? '' : 'hidden') + '><div class="display-history-head"><span>' + t('recentCalculations') + '</span><button class="text-btn" data-clear-calc-history ' + (state.calcHistory.length ? '' : 'disabled') + '>' + t('clear') + '</button></div><div class="display-history-list">' + history + '</div></div></div>' +
    '<div class="calculator-keyboard"><div class="keys calculator-grid">' + keys + '</div><div class="keys calculator-mobile-grid">' + mobileKeys + '</div></div></div></div>';
}
function calculatorKey(key) {
  if (key === 'AC' || key === 'CE') { state.calcExpr = ''; state.calcJustEvaluated = false; }
  else if (key === '⌫') { state.calcExpr = state.calcExpr.slice(0, -1); state.calcJustEvaluated = false; }
  else if (key === 'EXP') { state.calcExpr += '×10^'; state.calcJustEvaluated = false; }
  else if (key === '=') {
    try { const result = evaluateExpression(state.calcExpr); if (state.calcExpr) state.calcHistory.unshift({ id: uid(), expression: state.calcExpr, result: formatNumber(result), at: Date.now() }); state.calcExpr = String(result); state.calcJustEvaluated = true; }
    catch (error) { toast(error.message, 'error'); }
  } else if (key === '±') { state.calcExpr = state.calcExpr.startsWith('-') ? state.calcExpr.slice(1) : '-' + (state.calcExpr || '0'); state.calcJustEvaluated = false; }
  else { if (state.calcJustEvaluated && (/[0-9.]/.test(key) || key === '(' || key === 'π')) state.calcExpr = ''; state.calcJustEvaluated = false; state.calcExpr += key; }
  saveCalculator(); render();
}

// Calendar -------------------------------------------------------------------
function calendar() {
  const year = state.month.getFullYear();
  const month = state.month.getMonth();
  const first = new Date(year, month, 1);
  const start = (first.getDay() + 6) % 7;
  const days = new Date(year, month + 1, 0).getDate();
  const cellCount = start + days > 35 ? 42 : 35;
  let cells = '';
  for (let index = 0; index < cellCount; index += 1) {
    const number = index - start + 1;
    const date = new Date(year, month, number);
    const key = dateKey(date);
    const outside = date.getMonth() !== month;
    const meta = calendarMeta(key);
    const eventCount = eventsForDate(key).length;
    const holidayClass = meta.holiday ? (meta.holiday.isOffDay ? 'holiday' : 'workday') : '';
    const termClass = meta.term ? 'term-day' : '';
    const label = meta.holiday && !meta.holiday.isOffDay ? t('makeUpWorkday') : (meta.term || meta.holiday?.name || meta.lunar?.festival || '');
    const hasPriorityLabel = Boolean(meta.term || meta.holiday);
    const lunarCell = !hasPriorityLabel && meta.lunar ? (meta.lunar.day === 1 ? meta.lunar.monthText + meta.lunar.dayText : meta.lunar.dayText) : '';
    const cellLabel = label || lunarCell;
    const eventBadge = eventCount ? (eventCount > 99 ? '…' : String(eventCount)) : '';
    cells += '<button class="day ' + (outside ? 'muted ' : '') + (key === dateKey(today) ? 'today ' : '') + (key === state.selectedDate ? 'selected ' : '') + holidayClass + ' ' + termClass + '" data-date="' + key + '" data-outside="' + outside + '" aria-label="' + escapeHtml(formatDate(key) + (cellLabel ? '，' + cellLabel : '') + (eventCount ? '，' + eventCount + ' 个日程' : '')) + '"><span>' + date.getDate() + '</span><small class="day-meta ' + (label ? 'priority' : '') + '">' + escapeHtml(cellLabel) + '</small>' + (eventCount ? '<i aria-label="' + eventCount + ' 个日程">' + eventBadge + '</i>' : '') + '</button>';
  }
  const selectedEvents = eventsForDate(state.selectedDate).sort((a, b) => {
    const left = a.time || '00:00:00'; const right = b.time || '00:00:00';
    return right.localeCompare(left) || Number(b.createdAt || 0) - Number(a.createdAt || 0);
  });
  const eventList = selectedEvents.length
    ? selectedEvents.map((item) => '<div class="swipe-row event-swipe-row" data-swipe-row><div class="event-item swipe-content"><div><strong>' + escapeHtml(item.title) + '</strong><small>' + (item.time ? escapeHtml(item.time) : (state.language === 'en' ? 'All day' : '全天')) + '</small></div></div><button class="swipe-delete" data-delete-event="' + escapeHtml(item.id) + '">' + (state.language === 'en' ? 'Delete' : '删除') + '</button></div>').join('')
    : '<p class="empty compact">' + t('noAgenda') + '</p>';
  const monthLabel = state.language === 'en' ? new Intl.DateTimeFormat('en-US', { month: 'long' }).format(first) + ' ' + year : year + ' 年 ' + (month + 1) + ' 月';
  const weekdays = state.language === 'en' ? ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] : ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];
  return heading(t('calendar'), t('calendarDesc')) +
    '<div class="calendar-layout"><div class="calendar-card"><div class="calendar-top"><button class="icon-btn" data-month="-1" aria-label="Previous month">←</button><div class="calendar-month"><strong>' + monthLabel + '</strong><button class="text-btn calendar-today" data-today>' + t('today') + '</button></div><button class="icon-btn" data-month="1" aria-label="Next month">→</button></div>' +
    '<div class="calendar-legend"><span><i class="dot off"></i>' + t('legalHoliday') + '</span><span><i class="dot work"></i>' + t('makeUpWorkday') + '</span><span><i class="dot term"></i>' + t('solarTerm') + '</span></div><div class="calendar-grid">' + weekdays.map((day) => '<div class="dow">' + day + '</div>').join('') + cells + '</div></div>' +
   '<aside class="agenda-panel"><div class="subhead"><h3>' + t('agenda') + '</h3></div><div class="event-list">' + eventList + '</div><button class="calendar-add-event" data-open-event-dialog><span aria-hidden="true">＋</span>' + t('addAgenda') + '</button></aside></div>';
}
function saveEvents() { saveStored(STORAGE.events, state.events); }

function eventDateTimeParts(selectedKey) {
  const validKey = /^\d{4}-\d{2}-\d{2}$/.test(String(selectedKey || ''));
  const date = validKey ? dateFromKey(selectedKey) : new Date();
  const now = new Date();
  const year = date.getFullYear(); const month = date.getMonth() + 1; const day = date.getDate();
  const hour = now.getHours(); const minute = now.getMinutes();
  const pad2 = (value) => String(value).padStart(2, '0');
  const dateValue = year + '-' + pad2(month) + '-' + pad2(day);
  const timeValue = pad2(hour) + ':' + pad2(minute);
  return { year, month, day, hour, minute, dateValue, timeValue, dateTimeValue: dateValue + 'T' + timeValue };
}
function eventDateTimeMarkup(selectedKey) {
  const parts = eventDateTimeParts(selectedKey);
  return {
    parts,
    control: '<span class="event-datetime-control"><span id="eventDateTimeDisplay" class="event-datetime-display" aria-hidden="true">' + escapeHtml(formatEventDateTimeDisplay(parts.dateTimeValue)) + '</span><svg class="event-datetime-icon" viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="5" width="16" height="15" rx="2"/><path d="M8 3v4M16 3v4M4 9h16"/></svg><input id="eventDateTime" class="event-datetime-input" type="datetime-local" value="' + parts.dateTimeValue + '" step="60" aria-label="' + escapeHtml(t('eventDateTime')) + '"></span>',
    hidden: '<input type="hidden" id="eventDate" value="' + parts.dateValue + '"><input type="hidden" id="eventTime" value="' + parts.timeValue + '">',
  };
}
function formatEventDateTimeDisplay(value) {
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/.exec(String(value || ''));
  return match ? match.slice(1, 4).join('/') + ' ' + match[4] + ':' + match[5] : String(value || '');
}
function updateEventDateTimeDisplay(value = $('#eventDateTime')?.value || '') {
  const display = $('#eventDateTimeDisplay');
  if (display) display.textContent = formatEventDateTimeDisplay(value);
}
function syncEventDateTimeFields() {
  const value = $('#eventDateTime')?.value || '';
  updateEventDateTimeDisplay(value);
  const match = /^(\d{4}-\d{2}-\d{2})T(\d{2}):(\d{2})$/.exec(value);
  if (!match) return;
  const date = $('#eventDate'); if (date) date.value = match[1];
  const time = $('#eventTime'); if (time) time.value = match[2] + ':' + match[3];
}
function renderEventDialog() {
  const dialog = $('#eventDialog');
  if (!dialog) return;
  const options = ['once', 'daily', 'workdays', 'restdays', 'weekly'].map((value) => '<option value="' + value + '">' + t(value === 'daily' ? 'everyDay' : value) + '</option>').join('');
  const eventWeekdayLabels = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];
  const weekdays = eventWeekdayLabels.map((label, index) => '<label class="weekday-option"><input type="checkbox" name="eventWeekday" value="' + index + '" ' + (index < 5 ? 'checked' : '') + '><span>' + (state.language === 'en' ? ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][index] : label) + '</span></label>').join('');
  const dateTime = eventDateTimeMarkup(state.selectedDate);
  dialog.setAttribute('aria-label', t('newReminder'));
  dialog.innerHTML = '<div class="dialog-card event-dialog-card" role="dialog" aria-modal="true"><div class="dialog-head"><h2>' + t('newReminder') + '</h2><button class="icon-btn small" data-close-event-dialog aria-label="' + t('close') + '">×</button></div><form id="eventForm" class="event-form"><div class="field"><label for="eventTitle">' + t('eventContent') + '</label><textarea id="eventTitle" rows="3" required maxlength="60" placeholder="' + t('eventPlaceholder') + '"></textarea></div><div class="field"><label>' + t('reminderSchedule') + '</label><div class="event-date-time-grid"><label class="event-date-time-field event-datetime-field">' + dateTime.control + '</label></div>' + dateTime.hidden + '</div><div class="field"><label for="eventRepeat">' + t('eventRepeat') + '</label><select id="eventRepeat">' + options + '</select></div><div class="field event-weekdays-field" hidden><label>' + t('weekdays') + '</label><div class="weekday-options">' + weekdays + '</div></div><button class="primary full-width" type="submit">' + t('addEvent') + '</button></form></div>';
  dialog.hidden = false;
}
function closeEventDialog() { const dialog = $('#eventDialog'); if (dialog) dialog.hidden = true; }
function renderLunarDialog(key) {
  const dialog = $('#lunarDialog');
  if (!dialog) return;
  const meta = calendarMeta(key);
  const lunar = meta.lunar;
  const lunarText = lunar ? lunar.monthText + lunar.dayText : (state.language === 'en' ? 'Lunar calendar unavailable' : '当前浏览器不支持农历格式');
  const zodiac = lunar?.yearName ? (state.language === 'en' ? 'Lunar ' + zodiacFor(lunar.yearName) + ' year' : '农历' + zodiacFor(lunar.yearName) + '年') : '';
  const extra = [zodiac, lunar?.festival, meta.term, meta.holiday ? (meta.holiday.isOffDay ? meta.holiday.name : t('makeUpWorkday')) : ''].filter(Boolean).join(' · ');
  dialog.innerHTML = '<div class="dialog-card lunar-dialog-card" role="dialog" aria-modal="true"><div class="dialog-head"><h2>' + escapeHtml(formatDate(key)) + '</h2><button class="icon-btn small" data-close-lunar-dialog aria-label="' + t('close') + '">×</button></div><div class="lunar-dialog-value">' + escapeHtml(lunarText) + '</div>' + (extra ? '<p class="lunar-dialog-extra">' + escapeHtml(extra) + '</p>' : '') + '<p class="lunar-dialog-note">' + (state.language === 'en' ? 'Double-tap any date to view its lunar details.' : '连续点击任意日期即可查看农历详情。') + '</p></div>';
  dialog.hidden = false;
  state.lunarDialogDate = key;
}
function closeLunarDialog() { const dialog = $('#lunarDialog'); if (dialog) dialog.hidden = true; state.lunarDialogDate = null; }

// Weather --------------------------------------------------------------------
const weatherCode = (code) => {
  if (code === 0) return ['☀️', state.language === 'en' ? 'Clear' : '晴'];
  if ([1, 2, 3].includes(code)) return ['⛅', state.language === 'en' ? 'Cloudy' : '多云'];
  if ([45, 48].includes(code)) return ['🌫️', state.language === 'en' ? 'Fog' : '雾'];
  if ([51, 53, 55, 56, 57].includes(code)) return ['🌦️', state.language === 'en' ? 'Drizzle' : '毛毛雨'];
  if ([61, 63, 65, 66, 67].includes(code)) return ['🌧️', state.language === 'en' ? 'Rain' : '降雨'];
  if ([71, 73, 75, 77].includes(code)) return ['🌨️', state.language === 'en' ? 'Snow' : '降雪'];
  if ([80, 81, 82].includes(code)) return ['🌦️', state.language === 'en' ? 'Showers' : '阵雨'];
  return ['⛈️', state.language === 'en' ? 'Thunderstorm' : '雷雨'];
};
const weatherUrl = (lat, lon) => 'https://api.open-meteo.com/v1/forecast?latitude=' + encodeURIComponent(lat) + '&longitude=' + encodeURIComponent(lon) + '&current=temperature_2m,apparent_temperature,weather_code,relative_humidity_2m,wind_speed_10m,precipitation&hourly=temperature_2m,apparent_temperature,weather_code,precipitation_probability,uv_index,wind_speed_10m,relative_humidity_2m&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,sunrise,sunset,uv_index_max,wind_speed_10m_max&wind_speed_unit=kmh&timezone=auto&past_days=3&forecast_days=16';
const weatherElevationUrl = (lat, lon) => 'https://api.open-meteo.com/v1/elevation?latitude=' + encodeURIComponent(lat) + '&longitude=' + encodeURIComponent(lon);
function saveWeatherCards() { saveStored(STORAGE.weatherCards, state.weatherCards); }
async function getWeatherData(lat, lon) {
  const response = await fetchWithTimeout(weatherUrl(lat, lon), { headers: { Accept: 'application/json' } }, 9000);
  if (!response.ok) throw Error(state.language === 'en' ? 'Weather service is unavailable' : '天气服务暂时不可用');
  const data = await response.json();
  if (!Number.isFinite(Number(data.elevation))) {
    try {
      const elevationResponse = await fetchWithTimeout(weatherElevationUrl(lat, lon), { headers: { Accept: 'application/json' } }, 5000);
      if (elevationResponse.ok) {
        const elevationData = await elevationResponse.json();
        const elevation = Number(elevationData.elevation?.[0]);
        if (Number.isFinite(elevation)) data.elevation = elevation;
      }
    } catch { /* Forecast data remains usable when the elevation endpoint is unavailable. */ }
  }
  return data;
}
async function addWeatherPlace(place) {
  const request = ++state.weatherRequest;
  const currentIndex = place.isCurrentLocation ? state.weatherCards.findIndex((item) => item.isCurrentLocation) : -1;
  const coordinateIndex = state.weatherCards.findIndex((item) => Math.abs(Number(item.latitude) - Number(place.latitude)) < .01 && Math.abs(Number(item.longitude) - Number(place.longitude)) < .01);
  const existingIndex = currentIndex >= 0 ? currentIndex : coordinateIndex;
  const cardId = existingIndex >= 0 ? state.weatherCards[existingIndex].id : uid();
  const created = existingIndex < 0;
  if (created) state.weatherCards.push({ id: cardId, ...place, isCurrentLocation: Boolean(place.isCurrentLocation), loading: true });
  else Object.assign(state.weatherCards[existingIndex], place, { isCurrentLocation: Boolean(place.isCurrentLocation || state.weatherCards[existingIndex].isCurrentLocation), loading: true });
  state.activeWeatherId = cardId; state.weatherSearchResults = []; state.weatherLoading = true; state.weatherError = ''; render();
  try {
    const data = await getWeatherData(place.latitude, place.longitude);
    if (request !== state.weatherRequest) return;
    const card = { ...data, id: cardId, name: place.name, admin1: place.admin1 || '', admin2: place.admin2 || '', country: place.country || '', latitude: place.latitude, longitude: place.longitude, isCurrentLocation: Boolean(place.isCurrentLocation), updatedAt: Date.now(), loading: false };
    const targetIndex = state.weatherCards.findIndex((item) => item.id === cardId);
    if (targetIndex >= 0) state.weatherCards[targetIndex] = card; else state.weatherCards.push(card);
    state.activeWeatherId = card.id; saveWeatherCards();
    toast(state.language === 'en' ? 'Weather card saved' : '天气卡片已保存');
  } catch (error) {
    const failedIndex = state.weatherCards.findIndex((item) => item.id === cardId);
    if (created && failedIndex >= 0) state.weatherCards.splice(failedIndex, 1);
    else if (failedIndex >= 0) state.weatherCards[failedIndex].loading = false;
    state.weatherError = error.message || (state.language === 'en' ? 'Weather search failed' : '天气获取失败');
  }
  finally { if (request === state.weatherRequest) { state.weatherLoading = false; render(); } }
}
async function refreshWeatherCard(card) {
  if (!card || state.weatherLoading) return;
  const request = ++state.weatherRequest; state.weatherLoading = true; state.weatherError = ''; card.loading = true;
  try {
    const data = await getWeatherData(card.latitude, card.longitude);
    if (request !== state.weatherRequest) return;
    Object.assign(card, data, { updatedAt: Date.now(), loading: false }); saveWeatherCards();
  } catch (error) {
    card.loading = false;
    state.weatherError = error.message || (state.language === 'en' ? 'Refresh failed' : '刷新失败');
  } finally {
    if (request === state.weatherRequest) { state.weatherLoading = false; render(); }
  }
}
async function searchWeather(query) {
  const value = query.trim();
  if (!value) return toast(state.language === 'en' ? 'Enter a city or district' : '请输入城市或区县名称', 'error');
  state.weatherLoading = true; state.weatherError = ''; state.weatherSearchResults = []; render();
  try {
    let results = [];
    try {
      const response = await fetchWithTimeout('https://geocoding-api.open-meteo.com/v1/search?name=' + encodeURIComponent(value) + '&count=8&language=' + (state.language === 'en' ? 'en' : 'zh') + '&format=json', { headers: { Accept: 'application/json' } }, 6000);
      const data = await response.json(); results = data.results || [];
    } catch { /* Photon below is the district-aware fallback. */ }
    if (!results.length) {
      const response = await fetchWithTimeout('https://photon.komoot.io/api/?q=' + encodeURIComponent(value) + '&limit=8', { headers: { Accept: 'application/json' } }, 6000);
      const data = await response.json();
      results = (data.features || []).map((feature) => {
        const properties = feature.properties || {}; const coordinates = feature.geometry?.coordinates || [];
        return { name: properties.name || properties.city || value, admin2: properties.city || properties.district || '', admin1: properties.state || '', country: properties.country || '', latitude: Number(coordinates[1]), longitude: Number(coordinates[0]) };
      }).filter((place) => Number.isFinite(place.latitude) && Number.isFinite(place.longitude));
    }
    state.weatherSearchResults = results;
    if (!state.weatherSearchResults.length) state.weatherError = t('noResults');
  } catch (error) { state.weatherError = error.message || (state.language === 'en' ? 'Place search failed' : '地点搜索失败'); }
  finally { state.weatherLoading = false; render(); }
}
function placeLabel(place) { return [place.name, place.admin2, place.admin1, place.country].filter(Boolean).join(' · '); }
async function reverseGeocode(latitude, longitude) {
  try {
    const response = await fetchWithTimeout('https://photon.komoot.io/reverse?lat=' + encodeURIComponent(latitude) + '&lon=' + encodeURIComponent(longitude), { headers: { Accept: 'application/json' } }, 5000);
    const data = await response.json(); const properties = data.features?.[0]?.properties || {};
    const district = properties.district || properties.county || '';
    const city = properties.city || properties.town || properties.municipality || '';
    return { latitude, longitude, name: district || city || properties.name || (state.language === 'en' ? 'Current location' : '当前位置'), admin2: city && city !== district ? city : '', admin1: properties.state || properties.region || '', country: properties.country || '', isCurrentLocation: true };
  } catch { return { latitude, longitude, name: state.language === 'en' ? 'Current location' : '当前位置', isCurrentLocation: true }; }
}
function currentHourIndex(weather) {
  const times = weather?.hourly?.time || []; if (!times.length) return -1;
  const now = Date.now();
  return times.reduce((best, time, index) => Math.abs(new Date(time).getTime() - now) < Math.abs(new Date(times[best]).getTime() - now) ? index : best, 0);
}
function weatherWindLevel(speed) {
  const kmh = Math.max(0, Number(speed) || 0);
  const levels = [
    { max: 1, force: 0, zh: '无风', en: 'Calm', zhAdvice: '几乎无风，户外活动基本不受影响。', enAdvice: 'Calm; outdoor activities are generally unaffected.' },
    { max: 5, force: 1, zh: '软风', en: 'Light air', zhAdvice: '风很轻，适合通勤和轻量户外活动。', enAdvice: 'Very light wind; suitable for commuting and gentle outdoor activity.' },
    { max: 11, force: 2, zh: '轻风', en: 'Light breeze', zhAdvice: '体感舒适，骑行或散步注意帽子等轻物。', enAdvice: 'Comfortable for most activities; secure hats and light items when cycling or walking.' },
    { max: 19, force: 3, zh: '和风', en: 'Gentle breeze', zhAdvice: '适合户外活动，骑行和晾晒通常没有问题。', enAdvice: 'Good for outdoor activity; cycling and drying laundry are usually fine.' },
    { max: 28, force: 4, zh: '清劲风', en: 'Moderate breeze', zhAdvice: '迎风行走会有阻力，骑行和高处作业请留意。', enAdvice: 'Walking against the wind takes effort; take care when cycling or working at height.' },
    { max: 38, force: 5, zh: '强风', en: 'Fresh breeze', zhAdvice: '不建议在树下、广告牌旁久留，户外运动适当减量。', enAdvice: 'Avoid lingering under trees or signs; reduce the intensity of outdoor exercise.' },
    { max: 49, force: 6, zh: '大风', en: 'Strong breeze', zhAdvice: '建议减少户外活动，固定阳台物品并注意高空坠物。', enAdvice: 'Limit outdoor activity, secure balcony items and watch for falling objects.' },
    { max: 61, force: 7, zh: '疾风', en: 'Near gale', zhAdvice: '尽量留在室内，避免靠近临时设施、树木和海边。', enAdvice: 'Stay indoors where possible; avoid temporary structures, trees and exposed waterfronts.' },
    { max: 74, force: 8, zh: '大风', en: 'Gale', zhAdvice: '不建议出行，关注当地大风预警和交通安排。', enAdvice: 'Avoid unnecessary travel and follow local wind warnings and transport updates.' },
    { max: Infinity, force: 9, zh: '烈风', en: 'Severe gale', zhAdvice: '强风风险很高，留在安全室内并关注官方预警。', enAdvice: 'Very hazardous winds; remain in a secure place and follow official warnings.' },
  ];
  const level = levels.find((item) => kmh <= item.max) || levels[levels.length - 1];
  return { ...level, speed: Math.round(kmh) };
}
function weatherElevationLabel(value) {
  const elevation = Number(value);
  if (!Number.isFinite(elevation)) return '—';
  return Math.round(elevation) + ' m';
}
function weatherWindLabel(value) {
  const level = weatherWindLevel(value);
  return state.language === 'en' ? 'Bft ' + level.force + ' · ' + level.en : level.force + '级 · ' + level.zh;
}
function weatherAdvice(weather, current) {
  const temperature = Number(current.temperature_2m ?? 20);
  const rain = Number(current.precipitation ?? 0);
  const probability = Number(weather.daily?.precipitation_probability_max?.[0] ?? 0);
  const wind = Number(current.wind_speed_10m ?? 0);
  const windLevel = weatherWindLevel(wind);
  const uv = Number(weather.daily?.uv_index_max?.[0] ?? 0);
  const code = Number(current.weather_code);
  const rainy = rain > .1 || probability >= 55 || [51, 53, 55, 61, 63, 65, 80, 81, 82].includes(code);
  return [
    { icon: '🚶', title: t('commute'), body: rainy ? (state.language === 'en' ? 'Take an umbrella and allow extra travel time.' : '有降雨可能，带伞并预留出行时间。') : (state.language === 'en' ? 'Good conditions for normal travel.' : '适合正常出行，路上注意安全。') },
    { icon: '🏃', title: t('sport'), body: wind > 35 || rainy ? (state.language === 'en' ? 'Consider an indoor workout.' : '风雨较明显，建议选择室内运动。') : (state.language === 'en' ? 'Suitable for outdoor exercise; hydrate.' : '适合户外运动，注意补水。') },
    { icon: '💨', title: t('windAdvice'), body: (state.language === 'en' ? 'Bft ' + windLevel.force + ' · ' + windLevel.en + ' · ' + windLevel.speed + ' km/h. ' + windLevel.enAdvice : windLevel.force + '级 · ' + windLevel.zh + ' · ' + windLevel.speed + ' km/h。' + windLevel.zhAdvice) },
    { icon: '🧥', title: t('clothing'), body: temperature < 10 ? (state.language === 'en' ? 'Layer up with a warm coat.' : '气温偏低，建议分层保暖。') : temperature > 28 ? (state.language === 'en' ? 'Light, breathable clothing is best.' : '天气偏热，穿轻薄透气衣物。') : (state.language === 'en' ? 'A light layer should be comfortable.' : '薄外套或长袖即可，体感舒适。') },
    { icon: '🕶️', title: t('sunscreen'), body: uv >= 6 ? (state.language === 'en' ? 'High UV: sunscreen, hat and sunglasses recommended.' : '紫外线偏强，建议防晒、戴帽和太阳镜。') : (state.language === 'en' ? 'UV is moderate; sunscreen is still useful.' : '紫外线中等，外出仍建议做好防晒。') },
    { icon: '🥾', title: t('hiking'), body: rainy || wind > 40 ? (state.language === 'en' ? 'Trail may be slippery or windy; check conditions first.' : '山路可能湿滑或风大，出发前确认路况。') : (state.language === 'en' ? 'Good for a short hike; bring water.' : '适合短途爬山，带足饮水。') },
  ];
}
function weather() {
  const active = state.weatherCards.find((item) => item.id === state.activeWeatherId) || state.weatherCards[0];
  const search = '<form id="weatherSearch" class="weather-search"><label class="sr-only" for="cityInput">' + t('searchPlace') + '</label><div class="weather-search-field"><input id="cityInput" placeholder="' + t('searchPlace') + '" autocomplete="off"><button class="weather-location-button" type="button" data-locate aria-label="' + t('currentLocation') + '"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="7"></circle><circle cx="12" cy="12" r="2"></circle><path d="M12 2v3M12 19v3M2 12h3M19 12h3"></path></svg></button></div><button class="primary" type="submit">' + t('weatherSearch') + '</button></form>';
  const results = state.weatherSearchResults.length ? '<div class="weather-search-results"><div class="search-results-head"><strong>' + (state.language === 'en' ? 'Search results' : '搜索结果') + '</strong><small>' + (state.language === 'en' ? 'Choose a place, then add it to weather cards' : '选择地点后再添加到天气卡片') + '</small></div>' + state.weatherSearchResults.map((place, index) => '<div class="weather-result"><span><strong>' + escapeHtml(place.name) + '</strong><small>' + escapeHtml(placeLabel(place)) + '</small></span><button class="secondary" data-weather-result-index="' + index + '">' + t('addCard') + '</button></div>').join('') + '</div>' : '';
  if (!active) return heading(t('weather'), t('weatherDesc')) + search + results + '<div class="empty weather-empty">' + (state.weatherLoading ? '<span class="loader"></span>' + t('weatherLoading') : t('noWeather')) + (state.weatherError ? '<strong class="error-text">' + escapeHtml(state.weatherError) + '</strong>' : '') + '</div>';
  const current = active.current || {};
  const cards = state.weatherCards.map((card, index) => {
    const item = card.loading && !card.current ? ['⏳', t('weatherLoading')] : weatherCode(card.current?.weather_code);
    const cardCurrent = card.current || {};
    const temperature = card.loading && !card.current ? '…' : Math.round(cardCurrent.temperature_2m ?? 0) + '°';
    const details = card.loading && !card.current ? '<span class="weather-card-meta-line">' + escapeHtml(t('weatherLoading')) + '</span>' : '<span class="weather-card-meta-line">' + escapeHtml((state.language === 'en' ? 'Feels ' : '体感 ') + Math.round(cardCurrent.apparent_temperature ?? cardCurrent.temperature_2m ?? 0) + '° · ' + (state.language === 'en' ? 'Humidity ' : '湿度 ') + (cardCurrent.relative_humidity_2m ?? '—') + '%') + '</span><span class="weather-card-meta-line weather-card-meta-secondary"><span>' + escapeHtml((state.language === 'en' ? 'Wind ' : '风力 ') + weatherWindLabel(cardCurrent.wind_speed_10m) + ' · ' + Math.round(cardCurrent.wind_speed_10m ?? 0) + ' km/h') + '</span><span>' + escapeHtml(t('elevation') + ' ' + weatherElevationLabel(card.elevation)) + '</span></span>';
    return '<button class="weather-card ' + (card.id === active.id ? 'active' : '') + (card.loading ? ' loading' : '') + '" draggable="true" data-weather-card="' + card.id + '" data-weather-index="' + index + '"><span class="weather-card-delete" data-delete-weather="' + escapeHtml(card.id) + '" role="button" tabindex="0" aria-label="' + (state.language === 'en' ? 'Delete weather card' : '删除天气卡片') + '">×</span><div class="weather-card-head"><span><strong>' + escapeHtml(card.name) + '</strong><small>' + escapeHtml([card.admin2, card.admin1].filter(Boolean).join(' · ') || card.country || '') + '</small></span><span class="weather-card-icon" aria-hidden="true">' + item[0] + '</span></div><div class="weather-card-main"><span class="weather-card-temp">' + temperature + '</span><span class="weather-card-condition">' + escapeHtml(item[1]) + '</span></div><span class="weather-card-meta">' + details + '</span></button>';
  }).join('');
  const title = [active.name, active.admin2, active.admin1, active.country].filter(Boolean).join(' · ');
  if (active.loading && !active.current) {
    return heading(t('weather'), escapeHtml(title)) + search + results + '<div class="weather-card-list">' + cards + '</div>';
  }
  const hourlyTimes = active.hourly?.time || [];
  const selectedHour = currentHourIndex(active);
  const currentHour = selectedHour >= 0 ? selectedHour : 0;
  const hourlyStart = Math.min(Math.max(0, currentHour - 12), Math.max(0, hourlyTimes.length - 24));
  const hourlyEnd = Math.min(hourlyTimes.length, hourlyStart + 24);
  const hourly = hourlyTimes.slice(hourlyStart, hourlyEnd).map((time, offset) => {
    const index = hourlyStart + offset; const item = weatherCode(active.hourly.weather_code[index]); const date = new Date(time); const isCurrent = index === currentHour;
    const label = isCurrent ? (state.language === 'en' ? 'Now' : '现在') : new Intl.DateTimeFormat(state.language === 'en' ? 'en-US' : 'zh-CN', { hour: '2-digit', minute: '2-digit' }).format(date);
    return '<div class="hour-card ' + (isCurrent ? 'current' : '') + '" ' + (isCurrent ? 'data-current-hour' : '') + '><small>' + label + '</small><strong>' + item[0] + '</strong><span>' + Math.round(active.hourly.temperature_2m[index]) + '°</span><small>' + (active.hourly.precipitation_probability?.[index] ?? 0) + '%</small></div>';
  }).join('');
  const dailyTimes = (active.daily?.time || []).slice(0, 19);
  const currentDay = String(active.current?.time || '').slice(0, 10) || dateKey(today);
  const days = dailyTimes.map((day, index) => {
    const item = weatherCode(active.daily.weather_code[index]);
    const isCurrent = day === currentDay;
    const label = isCurrent ? (state.language === 'en' ? 'Today' : '今天') : new Intl.DateTimeFormat(state.language === 'en' ? 'en-US' : 'zh-CN', { month: 'numeric', day: 'numeric', weekday: 'short' }).format(dateFromKey(day));
    return '<div class="forecast ' + (isCurrent ? 'current' : '') + '" ' + (isCurrent ? 'data-current-day' : '') + '><small>' + label + '</small><b>' + item[0] + '</b><span>' + Math.round(active.daily.temperature_2m_max[index]) + '° / ' + Math.round(active.daily.temperature_2m_min[index]) + '°</span><small>' + (active.daily.precipitation_probability_max?.[index] ?? 0) + '% ' + (state.language === 'en' ? 'rain' : '降水') + '</small></div>';
  }).join('');
  const advice = weatherAdvice(active, current).map((item) => '<article class="advice-card"><b>' + item.icon + ' ' + item.title + '</b><p>' + item.body + '</p></article>').join('');
  const updatedTime = active.updatedAt ? new Intl.DateTimeFormat(state.language === 'en' ? 'en-US' : 'zh-CN', { hour: '2-digit', minute: '2-digit' }).format(active.updatedAt) : '—';
  const weatherDataNote = t('weatherData').replace('{time}', updatedTime);
  setTimeout(() => {
    const activeCard = $$('.weather-card[data-weather-card]').find((card) => card.dataset.weatherCard === state.activeWeatherId);
    const cardList = $('.weather-card-list');
    if (activeCard && cardList) cardList.scrollTo({ left: Math.max(0, activeCard.offsetLeft - 2), behavior: 'smooth' });
    [['[data-current-hour]', '.hourly-strip'], ['[data-current-day]', '.weather-days']].forEach(([cardSelector, stripSelector]) => {
      const card = $(cardSelector); const strip = $(stripSelector); if (!card || !strip) return;
      // Keep the selected period at the leading edge. Centering the current
      // card made the strip jump on refresh and hid the beginning of the list.
      strip.scrollTo({ left: Math.max(0, card.offsetLeft - 2), behavior: 'smooth' });
    });
  }, 0);
  return heading(t('weather'), escapeHtml(title) + ' · ' + (state.language === 'en' ? 'updated' : '更新于') + ' ' + (active.updatedAt ? new Intl.DateTimeFormat(state.language === 'en' ? 'en-US' : 'zh-CN', { hour: '2-digit', minute: '2-digit' }).format(active.updatedAt) : (state.language === 'en' ? 'cached' : '本机缓存'))) +
    search + results + (state.weatherError ? '<div class="inline-alert">' + escapeHtml(state.weatherError) + '，' + (state.language === 'en' ? 'showing the last successful result' : '当前显示上次成功结果') + '。</div>' : '') +
    '<div class="weather-card-list">' + cards + '</div>' +
    '<div class="weather-section-heading"><h3 class="weather-section-title">' + t('hourly') + '</h3><p class="weather-data-note">' + escapeHtml(weatherDataNote) + '</p></div><div class="hourly-strip">' + hourly + '</div><h3 class="weather-section-title">' + t('advice') + '</h3><div class="advice-strip">' + advice + '</div><h3 class="weather-section-title">' + t('daily') + '</h3><div class="weather-days">' + days + '</div>';
}

// Converter ------------------------------------------------------------------
const units = {
  length: { name: '长度 / Length', units: [['米', 'm', 1], ['千米', 'km', 1000], ['厘米', 'cm', .01], ['毫米', 'mm', .001], ['微米', 'μm', 1e-6], ['纳米', 'nm', 1e-9], ['英寸', 'in', .0254], ['英尺', 'ft', .3048], ['码', 'yd', .9144], ['英里', 'mi', 1609.344], ['海里', 'nmi', 1852]] },
  weight: { name: '重量 / Weight', units: [['克', 'g', 1], ['毫克', 'mg', .001], ['千克', 'kg', 1000], ['吨', 't', 1e6], ['斤', '斤', 500], ['磅', 'lb', 453.59237], ['盎司', 'oz', 28.349523125], ['英石', 'st', 6350.29318]] },
  area: { name: '面积 / Area', units: [['平方米', 'm²', 1], ['平方千米', 'km²', 1e6], ['平方厘米', 'cm²', 1e-4], ['平方毫米', 'mm²', 1e-6], ['公顷', 'ha', 1e4], ['亩', '亩', 2000 / 3], ['平方英尺', 'ft²', .09290304], ['平方码', 'yd²', .83612736], ['英亩', 'acre', 4046.8564224], ['平方英里', 'mi²', 2589988.110336]] },
  volume: { name: '体积 / Volume', units: [['升', 'L', 1], ['微升', 'μL', 1e-6], ['毫升', 'mL', .001], ['立方厘米', 'cm³', .001], ['立方米', 'm³', 1000], ['茶匙', 'tsp', .00492892159375], ['汤匙', 'tbsp', .01478676478125], ['杯', 'cup', .2365882365], ['品脱', 'pt', .473176473], ['夸脱', 'qt', .946352946], ['美制加仑', 'gal', 3.785411784]] },
  speed: { name: '速度 / Speed', units: [['米/秒', 'm/s', 1], ['厘米/秒', 'cm/s', .01], ['千米/秒', 'km/s', 1000], ['千米/时', 'km/h', 1 / 3.6], ['英尺/秒', 'ft/s', .3048], ['英里/时', 'mph', .44704], ['节', 'kn', .514444444]] },
  time: { name: '时间 / Time', units: [['纳秒', 'ns', 1e-9], ['微秒', 'μs', 1e-6], ['毫秒', 'ms', .001], ['秒', 's', 1], ['分钟', 'min', 60], ['小时', 'h', 3600], ['天', 'd', 86400], ['周', 'wk', 604800]] },
  data: { name: '数据 / Data', units: [['比特', 'bit', .125], ['字节', 'B', 1], ['千字节', 'kB', 1000], ['千字节', 'KiB', 1024], ['兆字节', 'MB', 1e6], ['兆字节', 'MiB', 1024 ** 2], ['吉字节', 'GB', 1e9], ['吉字节', 'GiB', 1024 ** 3], ['太字节', 'TB', 1e12], ['太字节', 'TiB', 1024 ** 4], ['拍字节', 'PB', 1e15]] },
  pressure: { name: '压强 / Pressure', units: [['帕斯卡', 'Pa', 1], ['千帕', 'kPa', 1000], ['兆帕', 'MPa', 1e6], ['巴', 'bar', 100000], ['标准大气压', 'atm', 101325], ['毫米汞柱', 'mmHg', 133.322387415], ['磅力/平方英寸', 'psi', 6894.757293168]] },
  energy: { name: '能量 / Energy', units: [['焦耳', 'J', 1], ['千焦', 'kJ', 1000], ['卡路里', 'cal', 4.184], ['千卡', 'kcal', 4184], ['瓦时', 'Wh', 3600], ['千瓦时', 'kWh', 3600000], ['电子伏', 'eV', 1.602176634e-19]] },
  power: { name: '功率 / Power', units: [['瓦', 'W', 1], ['千瓦', 'kW', 1000], ['兆瓦', 'MW', 1e6], ['马力', 'hp', 745.699871582]] },
  force: { name: '力 / Force', units: [['牛顿', 'N', 1], ['千牛', 'kN', 1000], ['千克力', 'kgf', 9.80665], ['磅力', 'lbf', 4.4482216152605]] },
  angle: { name: '角度 / Angle', units: [['弧度', 'rad', 1], ['度', '°', Math.PI / 180], ['百分度', 'grad', Math.PI / 200], ['角分', 'arcmin', Math.PI / 10800], ['角秒', 'arcsec', Math.PI / 648000]] },
  frequency: { name: '频率 / Frequency', units: [['赫兹', 'Hz', 1], ['千赫兹', 'kHz', 1000], ['兆赫兹', 'MHz', 1e6], ['吉赫兹', 'GHz', 1e9]] },
  torque: { name: '扭矩 / Torque', units: [['牛顿·米', 'N·m', 1], ['千克力·米', 'kgf·m', 9.80665], ['磅力·英尺', 'lbf·ft', 1.355817948]] },
  temperature: { name: '温度 / Temperature', units: [['摄氏度', '°C', 'C'], ['华氏度', '°F', 'F'], ['开尔文', 'K', 'K']] },
};
const conversion = { category: 'length', from: 0, to: 1, value: '1' };
function convertedValue() {
  const category = units[conversion.category]; const value = Number(conversion.value);
  if (!Number.isFinite(value)) return NaN;
  const from = category.units[conversion.from]; const to = category.units[conversion.to];
  if (conversion.category === 'temperature') {
    const celsius = from[2] === 'F' ? (value - 32) * 5 / 9 : from[2] === 'K' ? value - 273.15 : value;
    return to[2] === 'F' ? celsius * 9 / 5 + 32 : to[2] === 'K' ? celsius + 273.15 : celsius;
  }
  return value * from[2] / to[2];
}
function unitOptions(category, selected) {
  return category.units.map((unit, index) => '<option value="' + index + '" ' + (index === selected ? 'selected' : '') + '>' + unit[0] + ' (' + unit[1] + ')</option>').join('');
}
function conversionMarkup() {
  const category = units[conversion.category];
  const categories = Object.entries(units).map(([key, item]) => '<option value="' + key + '" ' + (key === conversion.category ? 'selected' : '') + '>' + item.name + '</option>').join('');
  return '<div class="converter-card"><div class="converter-category field"><select id="conversionCategory" aria-label="' + t('converterType') + '">' + categories + '</select></div><div class="conversion-layout">' +
    '<div class="conversion-pane conversion-source-pane"><label for="fromUnit">' + t('from') + '</label><select id="fromUnit" aria-label="' + t('from') + '">' + unitOptions(category, conversion.from) + '</select><input id="conversionValue" type="number" step="any" inputmode="decimal" value="' + escapeHtml(conversion.value) + '" aria-label="' + t('from') + '"></div>' +
    '<button class="swap" data-swap aria-label="' + t('swap') + '">⇄</button><div class="conversion-pane conversion-target-pane"><label for="toUnit">' + t('to') + '</label><select id="toUnit" aria-label="' + t('to') + '">' + unitOptions(category, conversion.to) + '</select><div class="conversion-result" aria-live="polite"><small>' + t('result') + '</small><strong>' + formatNumber(convertedValue()) + '</strong><span>' + category.units[conversion.to][1] + '</span><button class="conversion-copy" data-copy-conversion aria-label="' + t('copyResult') + '" title="' + t('copyResult') + '"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="8" y="8" width="11" height="12" rx="2"/><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h2"/></svg></button></div></div></div><span class="copy-status sr-only" id="copyStatus" aria-live="polite"></span></div>';
}
function convert() { return '<section class="language-tool-card converter-panel"><div class="language-tool-head"><h2>' + t('unitConvert') + '</h2><p>' + t('convertDesc') + '</p></div>' + conversionMarkup() + '</section>'; }

// Translation ---------------------------------------------------------------
const languageOptions = [['auto', '自动检测 / Auto'], ['zh', '中文 / Chinese'], ['en', 'English'], ['ja', '日本語 / Japanese'], ['ko', '한국어 / Korean']];
const translateEndpoints = ['https://translate.argosopentech.com/translate', 'https://translate.astian.org/translate', 'https://libretranslate.com/translate'];
async function fetchWithTimeout(url, options, timeout = 7000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);
  try { return await fetch(url, { ...options, signal: controller.signal }); } finally { clearTimeout(timer); }
}
function saveTranslationHistory() { saveStored(STORAGE.translationHistory, state.translationHistory.slice(0, 30)); }
function recordTranslation(input, result) {
  state.translation.result = result;
  state.translationHistory.unshift({ id: uid(), source: state.translation.source, target: state.translation.target, input, result, createdAt: Date.now() });
  saveTranslationHistory();
}
async function translateText() {
  const input = state.translation.input.trim();
  if (!input) return toast(state.language === 'en' ? 'Enter text to translate' : '请输入要翻译的内容', 'error');
  if (state.translation.source !== 'auto' && state.translation.source === state.translation.target) { recordTranslation(input, input); return render(); }
  state.translation.loading = true; state.translation.error = ''; render();
  try {
    let translated = '';
    for (const endpoint of translateEndpoints) {
      try {
        const response = await fetchWithTimeout(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify({ q: input, source: state.translation.source, target: state.translation.target, format: 'text' }) }, 4500);
        if (!response.ok) throw new Error();
        const data = await response.json(); translated = data.translatedText || data.translation || ''; if (translated) break;
      } catch { /* try next open instance */ }
    }
    if (!translated) {
      const source = state.translation.source === 'auto' ? (/^[\s\d\p{P}\p{S}]*[\u4e00-\u9fff]/u.test(input) ? 'zh-CN' : 'en') : state.translation.source;
      const target = state.translation.target === 'zh' ? 'zh-CN' : state.translation.target === 'auto' ? 'en' : state.translation.target;
      const fallbackUrl = 'https://api.mymemory.translated.net/get?q=' + encodeURIComponent(input) + '&langpair=' + encodeURIComponent(source + '|' + target);
      const response = await fetchWithTimeout(fallbackUrl, { headers: { Accept: 'application/json' } }, 6000);
      if (response.ok) { const data = await response.json(); translated = data.responseData?.translatedText || ''; }
    }
    if (!translated) throw Error(state.language === 'en' ? 'Translation service unavailable' : '翻译服务暂时不可用');
    recordTranslation(input, translated);
  } catch (error) { state.translation.error = error.message; }
  finally { state.translation.loading = false; render(); }
}
function translateView() {
  const history = state.translationHistory.length
    ? state.translationHistory.slice(0, 12).map((item) => '<div class="swipe-row translation-swipe-row" data-swipe-row><button class="translation-history-item swipe-content" data-translation-history="' + escapeHtml(item.id) + '"><b>' + escapeHtml(item.input.slice(0, 70)) + '</b><small>' + escapeHtml(item.result.slice(0, 100)) + '</small></button><button class="swipe-delete" data-delete-translation="' + escapeHtml(item.id) + '">' + (state.language === 'en' ? 'Delete' : '删除') + '</button></div>').join('')
    : '<p class="empty compact">' + t('noHistory') + '</p>';
  const options = (selected) => languageOptions.map(([value, label]) => '<option value="' + value + '" ' + (selected === value ? 'selected' : '') + '>' + label + '</option>').join('');
  const result = state.translation.loading ? (state.language === 'en' ? 'Translating…' : '翻译中…') : state.translation.result || (state.language === 'en' ? 'Translate' : '翻译');
  const resultMarkup = state.translation.result
    ? '<span class="translation-result-text">' + escapeHtml(result) + '</span><button class="translation-copy-button" data-copy-translation aria-label="' + t('copyResult') + '" title="' + t('copyResult') + '"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="8" y="8" width="11" height="12" rx="2"/><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h2"/></svg></button>'
    : '<span class="translation-result-text">' + escapeHtml(result) + '</span>';
  return '<div class="translation-layout"><div class="translation-card"><div class="translation-toolbar"><div class="field field-inline"><label for="translationSource">' + t('source') + '</label><select id="translationSource">' + options(state.translation.source) + '</select></div><button class="swap" data-swap-language aria-label="' + t('swap') + '">⇄</button><div class="field field-inline"><label for="translationTarget">' + t('target') + '</label><select id="translationTarget">' + options(state.translation.target) + '</select></div></div>' +
    '<div class="translation-content-grid"><div class="translation-input-pane"><div class="field"><label for="translationInput">' + t('translationInput') + '</label><div class="translation-input-wrap"><textarea id="translationInput" maxlength="5000" placeholder="' + (state.language === 'en' ? 'Type or paste text here…' : '输入或粘贴文字…') + '">' + escapeHtml(state.translation.input) + '</textarea><div class="translation-input-actions"><button class="input-action" data-translate-submit ' + (state.translation.loading ? 'disabled' : '') + ' aria-label="' + t('translateNow') + '"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m4 12 16-8-5 16-3-6-8-2Z"/><path d="m12 14 4-4"/></svg></button></div></div></div></div><div class="translation-result-pane"><div class="translation-pane-title">' + t('translationResult') + '</div><div class="translation-result translation-result-panel"><div class="translation-result-head"><button class="display-history-toggle translation-history-toggle" data-toggle-translation-history aria-expanded="' + (state.translationHistoryOpen ? 'true' : 'false') + '" aria-label="' + t('translationHistory') + '"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3.5 12a8.5 8.5 0 1 0 2.5-6.4"/><path d="M3.5 4.5v5h5"/><path d="M12 7.5v4.8l3 1.8"/></svg></button></div><div class="translation-result-current ' + (state.translation.result ? '' : 'placeholder') + '">' + resultMarkup + '</div><div class="translation-result-history" ' + (state.translationHistoryOpen ? '' : 'hidden') + '><div class="display-history-head"><span>' + t('translationHistory') + '</span><button class="text-btn" data-clear-translation-history ' + (state.translationHistory.length ? '' : 'disabled') + '>' + t('clear') + '</button></div><div class="translation-history-list">' + history + '</div></div></div></div></div>' + (state.translation.error ? '<p class="inline-alert">' + escapeHtml(state.translation.error) + '</p>' : '') + '</div></div>';
}
function translateConvertView() {
  return '<div class="translate-convert-page"><section class="language-tool-card translation-panel"><div class="language-tool-head"><h2>' + t('translate') + '</h2><p>' + t('translateDesc') + '</p></div>' + translateView() + '</section>' + convert() + '</div>';
}

// Notifications and calendar reminders -------------------------------------
function saveNotifications() { saveStored(STORAGE.notifications, state.notifications.slice(0, 80)); }
let alertAudioContext = null;
function unlockAlertAudio() {
  if (alertAudioContext || !window.AudioContext) return;
  try { alertAudioContext = new AudioContext(); alertAudioContext.resume().catch(() => {}); } catch { alertAudioContext = null; }
}
function playAlertChime() {
  if (!alertAudioContext) return;
  try {
    const oscillator = alertAudioContext.createOscillator(); const gain = alertAudioContext.createGain();
    oscillator.type = 'sine'; oscillator.frequency.setValueAtTime(880, alertAudioContext.currentTime); oscillator.frequency.exponentialRampToValueAtTime(660, alertAudioContext.currentTime + .22);
    gain.gain.setValueAtTime(.001, alertAudioContext.currentTime); gain.gain.exponentialRampToValueAtTime(.18, alertAudioContext.currentTime + .02); gain.gain.exponentialRampToValueAtTime(.001, alertAudioContext.currentTime + .48);
    oscillator.connect(gain).connect(alertAudioContext.destination); oscillator.start(); oscillator.stop(alertAudioContext.currentTime + .5);
  } catch { /* audio is optional */ }
}
function eventMatchesDay(event, key) {
  const weekday = (dateFromKey(key).getDay() + 6) % 7;
  if (!event.repeat || event.repeat === 'once') return false;
  if (event.repeat === 'daily') return true;
  if (event.repeat === 'workdays') return isWorkdayKey(key);
  if (event.repeat === 'restdays') return !isWorkdayKey(key);
  return event.repeat === 'weekly' && (event.weekdays || [weekday]).map(Number).includes(weekday);
}
function syncAgendaReminders() {
  const agendaItems = [];
  Object.entries(state.events || {}).forEach(([day, events]) => (events || []).forEach((event) => {
    if (!event.time) return;
    if (!event.repeat || event.repeat === 'once') {
      const at = new Date(day + 'T' + event.time).getTime();
      if (Number.isFinite(at)) agendaItems.push({ id: 'agenda:' + day + ':' + event.id, text: event.title, at, read: true, delivered: false, source: 'agenda', eventId: event.id });
      return;
    }
    for (let offset = 0; offset < 16; offset += 1) {
      const candidate = new Date(Date.now() + offset * 86400000); const key = dateKey(candidate);
      if (!eventMatchesDay(event, key)) continue;
      const at = new Date(key + 'T' + event.time).getTime();
      if (Number.isFinite(at) && at > Date.now() - 60000) agendaItems.push({ id: 'agenda:' + event.id + ':' + key, text: event.title, at, read: true, delivered: false, source: 'agenda', eventId: event.id });
    }
  }));
  const reminderIds = new Set(agendaItems.map((item) => item.id));
  state.notifications = state.notifications.filter((item) => item.source !== 'agenda' || reminderIds.has(item.id));
  agendaItems.forEach((item) => {
    const existing = state.notifications.find((entry) => entry.id === item.id);
    if (existing) { existing.text = item.text; existing.at = item.at; }
    else if (item.at > Date.now() - 86400000) state.notifications.push(item);
  });
  saveNotifications();
}
let notificationTimer = null;
function scheduleNotificationCheck() {
  clearTimeout(notificationTimer);
  const now = Date.now();
  const next = state.notifications.filter((item) => !item.delivered && Number.isFinite(Number(item.at)) && Number(item.at) > now).sort((a, b) => Number(a.at) - Number(b.at))[0];
  if (!next) return;
  notificationTimer = setTimeout(checkNotifications, Math.min(Math.max(Number(next.at) - now, 250), 2147483647));
}
async function showNativeNotification(item) {
  if (!('Notification' in window) || Notification.permission !== 'granted') return;
  try {
    const registration = await navigator.serviceWorker?.ready;
    const options = { body: item.text, tag: item.id, icon: 'icons/bell-192.png', badge: 'icons/bell-192.png', renotify: true, silent: false, requireInteraction: true, timestamp: Number(item.at) || Date.now(), data: { notificationId: item.id } };
    if (registration?.showNotification) await registration.showNotification('OneBox', options);
    else new Notification('OneBox', options);
  } catch { /* browser blocked notifications */ }
}
function checkNotifications() {
  syncAgendaReminders();
  const due = state.notifications.filter((item) => !item.delivered && item.at && item.at <= Date.now());
  due.forEach((item) => {
    item.delivered = true; item.read = false; showNativeNotification(item); playAlertChime(); toast(item.text);
  });
  if (due.length) saveNotifications();
  updateNotificationBadge();
  if (state.notificationOpen) renderNotifications();
  scheduleNotificationCheck();
}
function updateNotificationBadge() {
  const count = state.notifications.filter((item) => !item.read).length;
  const badge = $('#notificationCount');
  if (badge) { badge.textContent = count > 99 ? '99+' : String(count); badge.hidden = count === 0; }
}
function renderNotifications() {
  const panel = $('#notificationPanel');
  const items = [...state.notifications].sort((a, b) => Number(b.at) - Number(a.at));
  const list = items.length ? items.map(notificationRowMarkup).join('') : '<p class="empty compact">' + t('noNotifications') + '</p>';
  panel.innerHTML = '<div class="notification-dialog-card" role="dialog" aria-modal="true" aria-label="' + t('notifications') + '"><div class="dialog-head notification-head"><h2>' + t('notifications') + '</h2><div class="notification-head-actions"><button class="text-btn" data-mark-notifications-read>' + t('markRead') + '</button><button class="icon-btn small" data-close-notifications aria-label="' + t('close') + '">×</button></div></div><div class="notification-list">' + list + '</div></div>';
  panel.hidden = false;
}
function closeNotifications() {
  state.notificationOpen = false;
  const panel = $('#notificationPanel'); if (panel) panel.hidden = true;
  $('#notifyBtn')?.setAttribute('aria-expanded', 'false');
}
function isStandalonePwa() { return window.matchMedia?.('(display-mode: standalone)').matches || window.navigator.standalone === true; }
function isIosDevice() { return /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1); }
function isIosSafariBrowser() {
  const userAgent = navigator.userAgent || '';
  return isIosDevice() && !isStandalonePwa() && /Safari\//.test(userAgent) && !/(CriOS|FxiOS|EdgiOS|OPiOS|GSA\/)/.test(userAgent);
}
function isIosSafariReaderSurfaceActive() {
  return isIosSafariBrowser() && state.section === 'tools' && state.tool === 'reader' && state.readerMode === 'reading' && state.readerImmersive;
}
function syncOneBoxViewportMetrics() {
  const visualViewport = window.visualViewport;
  const height = Math.max(1, Math.round(visualViewport?.height || window.innerHeight || document.documentElement.clientHeight));
  const top = Math.max(0, Math.round(visualViewport?.offsetTop || 0));
  const root = document.documentElement;
  root.style.setProperty('--onebox-visual-height', height + 'px');
  root.style.setProperty('--onebox-visual-top', top + 'px');
  root.classList.toggle('ios-safari-browser', isIosSafariBrowser());
}
function refreshOneBoxViewportMetrics() {
  syncOneBoxViewportMetrics();
  requestAnimationFrame(() => syncOneBoxViewportMetrics());
  window.setTimeout(() => syncOneBoxViewportMetrics(), 120);
  window.setTimeout(() => syncOneBoxViewportMetrics(), 420);
}
function syncHomeFeedSurface() {
  const main = document.querySelector('main');
  const panel = workspace.querySelector('.feed-panel');
  if (!main || !panel || state.section !== 'home') return;
  if (window.innerWidth > 760 || isStandalonePwa()) {
    panel.style.removeProperty('min-height');
    return;
  }
  const mainRect = main.getBoundingClientRect();
  const panelRect = panel.getBoundingClientRect();
  const panelLayoutTop = panelRect.top - mainRect.top + main.scrollTop;
  const viewportHeight = Math.max(main.clientHeight, window.innerHeight || 0, Math.round(window.visualViewport?.height || 0));
  const availableHeight = Math.max(0, viewportHeight - panelLayoutTop);
  if (availableHeight > 0) panel.style.minHeight = Math.ceil(availableHeight) + 'px';
}
function scheduleHomeFeedSurfaceSync() {
  requestAnimationFrame(syncHomeFeedSurface);
  window.setTimeout(syncHomeFeedSurface, 120);
  window.setTimeout(syncHomeFeedSurface, 420);
}
document.documentElement.classList.toggle('standalone-pwa', isStandalonePwa());
syncOneBoxViewportMetrics();
window.addEventListener('resize', syncOneBoxViewportMetrics, { passive: true });
window.visualViewport?.addEventListener('resize', syncOneBoxViewportMetrics, { passive: true });
window.visualViewport?.addEventListener('scroll', syncOneBoxViewportMetrics, { passive: true });
window.addEventListener('resize', scheduleReaderPageLayout, { passive: true });
window.visualViewport?.addEventListener('resize', scheduleReaderPageLayout, { passive: true });
window.addEventListener('orientationchange', scheduleReaderPageLayout, { passive: true });
window.addEventListener('resize', syncHomeFeedSurface, { passive: true });
window.visualViewport?.addEventListener('resize', syncHomeFeedSurface, { passive: true });
async function requestNotifications() {
  if (!('Notification' in window)) return toast(state.language === 'en' ? 'This browser does not support notifications' : '当前浏览器不支持通知', 'error');
  if (isIosDevice() && !isStandalonePwa()) return toast(state.language === 'en' ? 'Add OneBox to the Home Screen before enabling iPhone notifications' : '请先将 OneBox 添加到主屏幕，再开启 iPhone 消息通知', 'error');
  const permission = await Notification.requestPermission();
  state.notificationPreference = permission === 'granted' ? 'allow' : permission === 'denied' ? 'deny' : state.notificationPreference;
  saveStored(STORAGE.notificationPreference, state.notificationPreference);
  if (permission === 'granted') await showNativeNotification({ id: 'permission-test', text: state.language === 'en' ? 'OneBox notifications are enabled.' : 'OneBox 消息通知已开启。' });
  toast(permission === 'granted' ? (state.language === 'en' ? 'Notifications enabled' : '通知已开启') : (state.language === 'en' ? 'Notification permission was not granted' : '通知权限未开启'), permission === 'granted' ? 'info' : 'error');
  if (state.settingsOpen) renderSettings();
}
function notificationPermissionText() {
  if (!('Notification' in window)) return state.language === 'en' ? 'Not supported by this browser' : '当前浏览器不支持';
  const permission = (state.language === 'en' ? 'Permission: ' : '权限：') + Notification.permission;
  return isIosDevice() && !isStandalonePwa() ? permission + (state.language === 'en' ? ' · Add to Home Screen first' : ' · 请先添加到主屏幕') : permission;
}

// GitHub Device Flow and private Gist sync ----------------------------------
function saveGithub() { saveStored(STORAGE.github, state.github); }
function githubHeaders() {
  return { Accept: 'application/vnd.github+json', Authorization: 'Bearer ' + state.github.token, 'X-GitHub-Api-Version': '2022-11-28', 'Content-Type': 'application/json' };
}
function syncPayload() {
  return {
    app: 'OneBox', version: APP_VERSION, savedAt: new Date().toISOString(), theme: state.theme, color: state.color, languageMode: state.languageMode, language: state.language,
    toolOrder: state.toolOrder, calculator: parseStored(STORAGE.calculator, {}), events: state.events,
    weatherCards: state.weatherCards, translationHistory: state.translationHistory, notifications: state.notifications, library: state.library,
    layoutMode: state.layoutMode, topDisplay: state.topDisplay, footprint: state.footprint, mascotVisible: state.mascotVisible, homeFeedOrder: state.homeFeed.order, homeFeedVisibility: state.homeFeed.visible, navigation: state.navigation, navigationLocation: state.navigationLocation, openMode: state.openMode,
  };
}
function githubBrowserError(error) {
  const message = String(error?.message || '');
  if (/Failed to fetch|NetworkError|Load failed/i.test(message)) {
    state.github.manualTokenOpen = true;
    renderGithubDialog();
    return t('githubBrowserFlowError');
  }
  return message;
}
async function githubLogin() {
  const clientId = ($('#githubClientId')?.value || state.github.clientId).trim();
  if (!clientId) return toast(state.language === 'en' ? 'Enter a GitHub OAuth Client ID first' : '请先填写 GitHub OAuth Client ID', 'error');
  state.github.clientId = clientId; saveGithub();
  try {
    const response = await fetch('https://github.com/login/device/code', { method: 'POST', headers: { Accept: 'application/json', 'Content-Type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams({ client_id: clientId, scope: 'gist read:user' }) });
    const data = await response.json();
    if (!response.ok || !data.device_code) throw Error(data.error_description || (state.language === 'en' ? 'Unable to start GitHub login' : '无法启动 GitHub 登录'));
    Object.assign(state.github, { deviceCode: data.device_code, userCode: data.user_code, verificationUri: data.verification_uri || 'https://github.com/login/device', expiresAt: Date.now() + Number(data.expires_in || 900) * 1000, interval: Number(data.interval || 5) });
    renderGithubDialog();
    window.open(state.github.verificationUri, '_blank', 'noopener,noreferrer');
    toast(state.language === 'en' ? 'Enter the code in GitHub, then keep this page open' : '请在 GitHub 页面输入验证码，并保持此页面打开');
    pollGithubLogin();
  } catch (error) { toast(githubBrowserError(error) || (state.language === 'en' ? 'Unable to start GitHub login' : '无法启动 GitHub 登录'), 'error'); }
}
async function pollGithubLogin() {
  while (state.github.deviceCode && Date.now() < state.github.expiresAt) {
    await sleep(state.github.interval * 1000);
    if (!state.github.deviceCode) return;
    try {
      const response = await fetch('https://github.com/login/oauth/access_token', { method: 'POST', headers: { Accept: 'application/json', 'Content-Type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams({ client_id: state.github.clientId, device_code: state.github.deviceCode, grant_type: 'urn:ietf:params:oauth:grant-type:device_code' }) });
      const data = await response.json();
      if (data.access_token) {
        state.github.token = data.access_token; state.github.deviceCode = '';
        const userResponse = await fetch('https://api.github.com/user', { headers: githubHeaders() });
        state.github.user = await userResponse.json(); saveGithub(); renderGithubDialog();
        toast(state.language === 'en' ? 'GitHub connected' : 'GitHub 已连接'); return;
      }
      if (data.error === 'slow_down') state.github.interval += 5;
      if (['access_denied', 'expired_token', 'unsupported_grant_type', 'incorrect_client_credentials'].includes(data.error)) throw Error(data.error_description || data.error);
    } catch (error) { state.github.deviceCode = ''; const message = githubBrowserError(error); renderGithubDialog(); toast(message || (state.language === 'en' ? 'GitHub login failed' : 'GitHub 登录失败'), 'error'); return; }
  }
  state.github.deviceCode = ''; renderGithubDialog(); toast(state.language === 'en' ? 'GitHub verification expired' : 'GitHub 验证已过期', 'error');
}
async function githubUseAccessToken() {
  const token = ($('#githubAccessToken')?.value || '').trim();
  if (!token) return toast(t('githubTokenMissing'), 'error');
  const previousToken = state.github.token;
  const previousUser = state.github.user;
  state.github.token = token;
  try {
    const response = await fetch('https://api.github.com/user', { headers: githubHeaders() });
    const data = await response.json();
    if (!response.ok || !data.login) throw Error(t('githubTokenInvalid'));
    state.github.user = data;
    state.github.manualTokenOpen = false;
    saveGithub(); renderGithubDialog();
    toast(t('githubTokenConnected'));
  } catch (error) {
    state.github.token = previousToken;
    state.github.user = previousUser;
    renderGithubDialog();
    toast(error.message || t('githubTokenInvalid'), 'error');
  }
}
async function findOrCreateGist() {
  if (state.github.gistId) return state.github.gistId;
  const response = await fetch('https://api.github.com/gists?per_page=100', { headers: githubHeaders() });
  if (!response.ok) throw Error();
  const gists = await response.json();
  const found = gists.find((item) => item.description === 'OneBox settings sync' && item.files?.['onebox-settings.json']);
  if (found) { state.github.gistId = found.id; saveGithub(); return found.id; }
  const created = await fetch('https://api.github.com/gists', { method: 'POST', headers: githubHeaders(), body: JSON.stringify({ description: 'OneBox settings sync', public: false, files: { 'onebox-settings.json': { content: JSON.stringify(syncPayload(), null, 2) } } }) });
  if (!created.ok) throw Error();
  const gist = await created.json(); state.github.gistId = gist.id; saveGithub(); return gist.id;
}
async function githubUpload() {
  if (!state.github.token) return toast(state.language === 'en' ? 'Connect GitHub first' : '请先连接 GitHub', 'error');
  try {
    const id = await findOrCreateGist();
    const response = await fetch('https://api.github.com/gists/' + id, { method: 'PATCH', headers: githubHeaders(), body: JSON.stringify({ files: { 'onebox-settings.json': { content: JSON.stringify(syncPayload(), null, 2) } } }) });
    if (!response.ok) throw Error();
    toast(state.language === 'en' ? 'Settings uploaded to GitHub' : '设置已上传到 GitHub');
  } catch { toast(state.language === 'en' ? 'GitHub upload failed' : 'GitHub 上传失败', 'error'); }
}
async function githubDownload() {
  if (!state.github.token) return toast(state.language === 'en' ? 'Connect GitHub first' : '请先连接 GitHub', 'error');
  try {
    const id = await findOrCreateGist();
    const response = await fetch('https://api.github.com/gists/' + id, { headers: githubHeaders() });
    if (!response.ok) throw Error();
    const gist = await response.json(); const content = gist.files?.['onebox-settings.json']?.content;
    if (!content) throw Error();
    const remote = JSON.parse(content);
    if (['light', 'dark', 'dark-gray', 'system'].includes(remote.theme)) state.theme = remote.theme;
    if (['mono', 'purple', 'blue', 'green', 'yellow'].includes(remote.color)) { state.color = remote.color; saveColorPreference(); }
    if (remote.languageMode || remote.language) state.languageMode = ['zh', 'en', 'system'].includes(remote.languageMode || remote.language) ? (remote.languageMode || remote.language) : 'system';
    const remoteNavigationLocation = remote.navigationLocation === 'tools' ? 'tools' : remote.navigationLocation === 'main' ? 'main' : null;
    if (Array.isArray(remote.toolOrder)) state.toolOrder = normalizeToolOrder(remote.toolOrder, remoteNavigationLocation === 'tools', remoteNavigationLocation === 'tools');
    if (remote.calculator) saveStored(STORAGE.calculator, remote.calculator);
    if (remote.events) { state.events = remote.events; saveEvents(); }
    if (Array.isArray(remote.weatherCards)) { state.weatherCards = remote.weatherCards; state.activeWeatherId = state.weatherCards[0]?.id || null; saveWeatherCards(); }
    if (Array.isArray(remote.translationHistory)) { state.translationHistory = remote.translationHistory; saveTranslationHistory(); }
    if (Array.isArray(remote.notifications)) { state.notifications = remote.notifications; saveNotifications(); }
    if (Array.isArray(remote.library)) { state.library = remote.library; saveLibrary(); }
    if (remote.layoutMode === 'simple' || remote.layoutMode === 'classic') { state.layoutMode = remote.layoutMode; saveLayoutPreference(); }
    if (remote.topDisplay && typeof remote.topDisplay === 'object') { state.topDisplay = { theme: remote.topDisplay.theme !== false, language: remote.topDisplay.language !== false, messages: remote.topDisplay.messages !== false }; saveTopDisplay(); }
    if (Array.isArray(remote.homeFeedOrder)) { state.homeFeed.order = normalizeHomeFeedOrder(remote.homeFeedOrder); saveHomeFeedOrder(); }
    if (Array.isArray(remote.homeFeedVisibility)) { state.homeFeed.visible = normalizeHomeFeedVisibility(remote.homeFeedVisibility); saveHomeFeedVisibility(); }
    if (remote.navigation && Array.isArray(remote.navigation.items)) { state.navigation = normalizeNavigation(remote.navigation); saveNavigation(); }
    if (remoteNavigationLocation) {
      state.navigationLocation = remoteNavigationLocation;
      state.toolOrder = normalizeToolOrder(state.toolOrder, state.navigationLocation === 'tools', state.navigationLocation === 'tools');
      localStorage.setItem(STORAGE.navigationLocation, state.navigationLocation);
      saveToolOrder();
      if (state.navigationLocation === 'tools' && state.section === 'navigation') state.section = 'tools', state.tool = 'navigation';
      if (state.navigationLocation === 'main' && state.section === 'tools' && state.tool === 'navigation') state.section = 'navigation';
    }
    if (typeof remote.footprint === 'boolean') { state.footprint = remote.footprint; saveFootprintPreference(); }
    if (typeof remote.mascotVisible === 'boolean') { state.mascotVisible = remote.mascotVisible; saveMascotVisibility(); }
    state.github.gistId = id; saveGithub(); applyLanguage(); renderNav(); render(); renderGithubDialog();
    toast(state.language === 'en' ? 'Settings restored from GitHub' : '已从 GitHub 恢复设置');
  } catch { toast(state.language === 'en' ? 'GitHub restore failed' : 'GitHub 恢复失败', 'error'); }
}
function disconnectGithub() {
  state.github = { clientId: state.github.clientId, token: '', user: null, gistId: '', deviceCode: '', userCode: '', verificationUri: '', expiresAt: 0, interval: 5, manualTokenOpen: false };
  saveGithub(); renderGithubDialog(); toast(state.language === 'en' ? 'GitHub disconnected' : '已退出 GitHub');
}
function renderAgreementDialog() {
  const dialog = $('#agreementDialog');
  if (!dialog) return;
  const sections = ['agreementIntro', 'agreementLocal', 'agreementNetwork', 'agreementGithub', 'agreementPermissions', 'agreementDisclaimer'];
  const body = sections.map((key, index) => index === 0 ? '<p class="agreement-intro">' + escapeHtml(t(key)) + '</p>' : '<section class="agreement-section"><h3>' + escapeHtml(t(key).split('：')[0].split(':')[0]) + '</h3><p>' + escapeHtml(t(key)) + '</p></section>').join('');
  dialog.innerHTML = '<div class="dialog-card agreement-dialog-card" role="dialog" aria-modal="true"><div class="dialog-head"><div><h2>' + t('agreementTitle') + '</h2></div><button class="icon-btn small" data-close-agreement aria-label="' + t('close') + '">×</button></div><div class="agreement-body">' + body + '</div><p class="settings-note agreement-updated">' + t('agreementUpdated') + ' · OneBox ' + APP_VERSION + '</p></div>';
  dialog.hidden = false;
}
function closeAgreementDialog() { const dialog = $('#agreementDialog'); if (dialog) dialog.hidden = true; }
function renderGithubDialog() {
  const dialog = $('#githubDialog');
  if (!dialog) return;
  const connected = Boolean(state.github.token && state.github.user);
  const account = connected
    ? '<div class="github-status-card is-connected"><span class="github-status-icon github-avatar"><img src="' + escapeHtml(state.github.user.avatar_url || '') + '" alt="" onerror="this.hidden=true;this.parentElement.classList.add(\'is-fallback\')"></span><span class="github-status-copy"><strong>' + escapeHtml(state.github.user.login || 'GitHub') + '</strong><small>' + t('githubConnected') + '</small></span><span class="github-status-badge">✓</span></div>'
    : '<div class="github-status-card"><span class="github-status-icon"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 18h10a3.5 3.5 0 0 0 .5-6.96A5.5 5.5 0 0 0 7 9.5a4.25 4.25 0 0 0 0 8.5Z"/><path d="m12 12 2-2m-2 2-2-2m2 2v4"/></svg></span><span class="github-status-copy"><strong>' + t('githubNotConnected') + '</strong><small>' + t('githubNotConnectedHint') + '</small></span></div>';
  const code = state.github.userCode ? '<div class="device-code"><div><small>' + (state.language === 'en' ? 'Enter this code at GitHub' : '请在 GitHub 验证页面输入') + '</small><strong>' + escapeHtml(state.github.userCode) + '</strong></div><a class="secondary github-device-link" href="' + escapeHtml(state.github.verificationUri || 'https://github.com/login/device') + '" target="_blank" rel="noreferrer">' + t('openDevice') + '</a></div>' : '';
  const manualToken = state.github.manualTokenOpen && !connected ? '<section class="github-manual-token"><label for="githubAccessToken">' + t('githubAccessToken') + '</label><input id="githubAccessToken" type="password" placeholder="github_pat_…" autocomplete="off"><p>' + t('githubTokenHint') + '</p><button class="secondary" data-github-token>' + t('githubUseToken') + '</button></section>' : '';
  const actions = connected
    ? '<div class="github-action-grid"><button class="primary" data-github-upload>' + t('upload') + '</button><button class="secondary" data-github-download>' + t('download') + '</button></div><button class="text-btn github-disconnect" data-github-logout>' + t('githubLogout') + '</button>'
    : '<button class="primary github-connect" data-github-login>' + t('githubLogin') + '</button>';
  const clientHint = t('githubClientHint') + ' <a class="github-help-link" href="https://github.com/settings/developers" target="_blank" rel="noreferrer">' + t('githubDeveloperSettings') + '</a>';
  dialog.innerHTML = '<div class="dialog-card github-dialog-card" role="dialog" aria-modal="true"><div class="dialog-head github-dialog-head"><div><h2>GitHub</h2></div><button class="icon-btn small github-dialog-close" data-close-github aria-label="' + t('close') + '">×</button></div><div class="github-dialog-body"><section class="github-status-section"><div class="github-section-label"><h3>' + t('githubSync') + '</h3></div>' + account + '</section><p class="github-dialog-note">' + escapeHtml(t('githubDescription')) + '</p><section class="github-credentials"><label for="githubClientId">' + t('githubClientId') + '</label><input id="githubClientId" value="' + escapeHtml(state.github.clientId) + '" placeholder="Iv1.xxxxxxxxxxxxx" autocomplete="off"><p>' + clientHint + '</p></section>' + code + manualToken + '<section class="github-actions">' + actions + '</section></div></div>';
  dialog.hidden = false; state.githubDialogOpen = true;
}
function closeGithubDialog() { const dialog = $('#githubDialog'); if (dialog) dialog.hidden = true; state.githubDialogOpen = false; }
function renderSettings() {
  const dialog = $('#settingsDialog');
  const notificationPreference = state.notificationPreference === 'deny' ? 'deny' : 'allow';
  const openMode = '<div class="settings-preference-row"><h3>' + t('openMode') + '</h3><div class="settings-preference-control"><select id="settingsOpenMode"><option value="current" ' + (state.openMode === 'current' ? 'selected' : '') + '>' + t('openCurrent') + '</option><option value="new-tab" ' + (state.openMode === 'new-tab' ? 'selected' : '') + '>' + t('openNewTab') + '</option></select></div></div>';
  const homeFeeds = '';
  const topDisplay = state.layoutMode === 'classic' ? '<div class="settings-preference-row settings-top-display-row"><h3>' + t('topDisplay') + '</h3><div class="settings-preference-control settings-top-display-control"><label class="setting-toggle"><input type="checkbox" data-top-display="theme" ' + (state.topDisplay.theme ? 'checked' : '') + '><span>' + t('theme') + '</span></label><label class="setting-toggle"><input type="checkbox" data-top-display="language" ' + (state.topDisplay.language ? 'checked' : '') + '><span>' + t('language') + '</span></label></div></div>' : '';
  dialog.innerHTML = '<div class="dialog-card settings-dialog-card" role="dialog" aria-modal="true"><div class="dialog-head"><h2>' + t('settings') + '</h2><button class="icon-btn small" data-close-settings aria-label="' + t('close') + '">×</button></div>' +
    '<div class="settings-preferences"><div class="settings-preference-row"><h3>' + t('layout') + '</h3><div class="settings-preference-control"><select id="settingsLayout"><option value="classic" ' + (state.layoutMode === 'classic' ? 'selected' : '') + '>' + t('classicLayout') + '</option><option value="simple" ' + (state.layoutMode === 'simple' ? 'selected' : '') + '>' + t('simpleLayout') + '</option></select></div></div>' + topDisplay + '<div class="settings-preference-row"><h3>' + t('theme') + '</h3><div class="settings-preference-control"><select id="settingsTheme"><option value="system" ' + (state.theme === 'system' ? 'selected' : '') + '>' + t('system') + '</option><option value="light" ' + (state.theme === 'light' ? 'selected' : '') + '>' + t('light') + '</option><option value="dark" ' + (state.theme === 'dark' ? 'selected' : '') + '>' + t('dark') + '</select></div></div><div class="settings-preference-row"><h3>' + t('color') + '</h3><div class="settings-preference-control"><select id="settingsColor"><option value="mono" ' + (state.color === 'mono' ? 'selected' : '') + '>' + t('blackWhite') + '</option><option value="purple" ' + (state.color === 'purple' ? 'selected' : '') + '>' + t('noblePurple') + '</option><option value="blue" ' + (state.color === 'blue' ? 'selected' : '') + '>' + t('skyBlue') + '</option><option value="green" ' + (state.color === 'green' ? 'selected' : '') + '>' + t('notBananaGreen') + '</option><option value="yellow" ' + (state.color === 'yellow' ? 'selected' : '') + '>' + t('meituanYellow') + '</option></select></div></div><div class="settings-preference-row"><h3>' + t('language') + '</h3><div class="settings-preference-control"><select id="settingsLanguage"><option value="system" ' + (state.languageMode === 'system' ? 'selected' : '') + '>' + t('system') + '</option><option value="zh" ' + (state.languageMode === 'zh' ? 'selected' : '') + '>中文</option><option value="en" ' + (state.languageMode === 'en' ? 'selected' : '') + '>English</option></select></div></div><div class="settings-preference-row"><h3>' + t('messages') + '</h3><div class="settings-preference-control"><select id="settingsNotifications"><option value="allow" ' + (notificationPreference === 'allow' ? 'selected' : '') + '>' + t('enableNotifications') + '</option><option value="deny" ' + (notificationPreference === 'deny' ? 'selected' : '') + '>' + t('disableNotifications') + '</option></select></div></div><div class="settings-preference-row"><h3>' + t('footprint') + '</h3><div class="settings-preference-control"><select id="settingsFootprint"><option value="hide" ' + (!state.footprint ? 'selected' : '') + '>' + t('hideFootprint') + '</option><option value="show" ' + (state.footprint ? 'selected' : '') + '>' + t('showFootprint') + '</option></select></div></div>' + homeFeeds + openMode + '</div>';
  const mascotRow = document.createElement('div');
  mascotRow.className = 'settings-preference-row';
  mascotRow.innerHTML = '<h3>' + t('mascot') + '</h3><div class="settings-preference-control"><select id="settingsMascotVisibility"><option value="show">' + t('showMascot') + '</option><option value="hide">' + t('hideMascot') + '</option></select></div>';
  mascotRow.querySelector('select').value = state.mascotVisible ? 'show' : 'hide';
  dialog.querySelector('#settingsFootprint')?.closest('.settings-preference-row')?.after(mascotRow);
  const layoutRow = dialog.querySelector('#settingsLayout')?.closest('.settings-preference-row');
  if (layoutRow) {
    const navigationRow = document.createElement('div');
    navigationRow.className = 'settings-preference-row';
    navigationRow.innerHTML = '<h3>' + t('navigationLocation') + '</h3><div class="settings-preference-control"><select id="settingsNavigationLocation"><option value="main">' + t('navigationLocationMain') + '</option><option value="tools">' + t('navigationLocationTools') + '</option></select></div>';
    navigationRow.querySelector('select').value = state.navigationLocation;
    layoutRow.after(navigationRow);
  }
  dialog.querySelector('.settings-home-feeds-row')?.remove();
  dialog.querySelector('#settingsFootprint')?.closest('.settings-preference-row')?.remove();
  dialog.hidden = false; state.settingsOpen = true;
  const themeSelect = $('#settingsTheme');
  if (themeSelect && !themeSelect.querySelector('option[value="dark-gray"]')) {
    const option = document.createElement('option'); option.value = 'dark-gray'; option.textContent = t('darkGray'); themeSelect.append(option);
  }
  if (themeSelect) themeSelect.value = state.theme;
}
function closeSettings() { $('#settingsDialog').hidden = true; state.settingsOpen = false; }
function refreshUpdateIndicator() {
  const button = $('#updateBtn');
  if (!button) return;
  button.hidden = !state.updateAvailable || state.layoutMode === 'simple';
  button.setAttribute('aria-label', state.updateAvailable ? t('applyUpdate') : t('checkUpdate'));
  button.dataset.updateAvailable = state.updateAvailable ? 'true' : 'false';
}
function markUpdateAvailable() {
  state.updateAvailable = true;
  state.updateError = false;
  refreshUpdateIndicator();
  if (state.settingsOpen) renderSettings();
  if (state.section === 'mine') render();
}
function observeUpdateWorker(registration) {
  return new Promise((resolve) => {
    let settled = false;
    let timeout = null;
    const finish = (worker) => {
      if (settled) return;
      settled = true;
      if (timeout) clearTimeout(timeout);
      resolve(worker || registration.waiting || null);
    };
    const watch = (worker) => {
      if (!worker) return;
      if (worker.state === 'installed') return finish(worker);
      if (worker.state === 'redundant' || worker.state === 'activated') return finish(null);
      worker.addEventListener('statechange', () => {
        if (worker.state === 'installed') finish(worker);
        else if (worker.state === 'redundant' || worker.state === 'activated') finish(null);
      }, { once: false });
    };
    if (registration.waiting) return finish(registration.waiting);
    if (registration.installing) watch(registration.installing);
    registration.addEventListener('updatefound', () => watch(registration.installing), { once: true });
    timeout = setTimeout(() => finish(registration.waiting), 15000);
  });
}
function versionedServiceWorkerUrl(version = APP_VERSION) {
  const url = new URL('sw.js', document.baseURI);
  url.searchParams.set('version', version);
  return url.href;
}
function registerVersionedServiceWorker(version = APP_VERSION) {
  return navigator.serviceWorker.register(versionedServiceWorkerUrl(version), { updateViaCache: 'none' });
}
async function getAppServiceWorkerRegistration() {
  const existing = await navigator.serviceWorker.getRegistration();
  return existing || registerVersionedServiceWorker();
}
async function updateServiceWorkerRegistration(registration) {
  let lastError = null;
  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      await Promise.race([registration.update(), sleep(9000).then(() => { throw Error('Update check timed out'); })]);
      return;
    } catch (error) {
      lastError = error;
      if (attempt === 0) await sleep(350);
    }
  }
  throw lastError || Error('Update check failed');
}
function compareAppVersions(left, right) {
  const parse = (value) => String(value || '').split('.').map((part) => Number(part.match(/\d+/)?.[0] || 0));
  const leftParts = parse(left);
  const rightParts = parse(right);
  const length = Math.max(leftParts.length, rightParts.length, 3);
  for (let index = 0; index < length; index += 1) {
    const difference = (leftParts[index] || 0) - (rightParts[index] || 0);
    if (difference !== 0) return difference;
  }
  return 0;
}
async function fetchLatestAppVersion() {
  const versionUrl = new URL('app.js', document.baseURI);
  versionUrl.searchParams.set('update-check', Date.now() + '-' + Math.random().toString(36).slice(2));
  const response = await Promise.race([
    fetch(versionUrl.href, { cache: 'no-store', credentials: 'same-origin' }),
    sleep(8000).then(() => { throw Error('Version check timed out'); }),
  ]);
  if (!response.ok) throw Error('Version check failed');
  const source = await response.text();
  const match = source.match(/const\s+APP_VERSION\s*=\s*['"]([^'"]+)['"]/);
  if (!match) throw Error('Version marker missing');
  return match[1];
}
async function checkForUpdate() {
  if (state.updateChecking || state.updateApplying) return;
  let registration = state.swRegistration || await navigator.serviceWorker?.getRegistration();
  if (!registration) return toast(state.language === 'en' ? 'Updates are unavailable in this browser' : '当前浏览器暂不支持更新检查', 'error');
  state.swRegistration = registration;
  state.updateError = false;
  state.updateChecking = true;
  if (state.settingsOpen) renderSettings();
  if (state.section === 'mine') render();
  try {
    const latestVersion = await fetchLatestAppVersion().catch(() => null);
    const remoteNewer = latestVersion ? compareAppVersions(latestVersion, APP_VERSION) > 0 : false;
    if (latestVersion && !remoteNewer) {
      state.updateAvailable = false;
      state.updateError = false;
      refreshUpdateIndicator();
      if (state.settingsOpen) renderSettings();
      if (state.section === 'mine') render();
      toast(t('upToDate'));
      return;
    }
    if (remoteNewer) {
      registration = await registerVersionedServiceWorker(latestVersion);
      state.swRegistration = registration;
    }
    const installingBeforeCheck = registration.installing;
    const workerPromise = observeUpdateWorker(registration);
    await updateServiceWorkerRegistration(registration);
    let worker = registration.waiting;
    if (!worker) {
      const newWorkerStarted = registration.installing && registration.installing !== installingBeforeCheck;
      const waitMilliseconds = remoteNewer || newWorkerStarted || registration.installing ? 15000 : 2500;
      worker = await Promise.race([workerPromise, sleep(waitMilliseconds).then(() => null)]);
    }
    if (!worker && remoteNewer) {
      const retryWorkerPromise = observeUpdateWorker(registration);
      await updateServiceWorkerRegistration(registration);
      worker = registration.waiting || await Promise.race([retryWorkerPromise, sleep(15000).then(() => null)]);
    }
    if (worker || registration.waiting || registration.installing?.state === 'installed') markUpdateAvailable();
    else if (remoteNewer) throw Error('The latest app version did not install');
    else { state.updateAvailable = false; state.updateError = false; refreshUpdateIndicator(); if (state.settingsOpen) renderSettings(); if (state.section === 'mine') render(); toast(t('upToDate')); }
  } catch {
    state.updateError = true;
    toast(state.language === 'en' ? 'Update check failed. Please try again.' : '更新检查失败，请重试', 'error');
  }
  finally { state.updateChecking = false; if (state.settingsOpen) renderSettings(); if (state.section === 'mine') render(); }
}
function waitForServiceWorkerActivation(registration, worker, timeoutMs = 15000) {
  return new Promise((resolve) => {
    let settled = false;
    let timeout = null;
    const finish = (activated) => {
      if (settled) return;
      settled = true;
    if (timeout) clearTimeout(timeout);
    worker.removeEventListener('statechange', onStateChange);
    navigator.serviceWorker.removeEventListener('controllerchange', onControllerChange);
    resolve(activated);
  };
  const onStateChange = () => {
    if (worker.state === 'activated' || registration.active === worker) finish(true);
    else if (worker.state === 'redundant') finish(false);
  };
  const onControllerChange = () => {
    if (worker.state === 'activated' || registration.active === worker) finish(true);
  };
  if (worker.state === 'activated' || registration.active === worker) return finish(true);
  worker.addEventListener('statechange', onStateChange);
  navigator.serviceWorker.addEventListener('controllerchange', onControllerChange);
  timeout = setTimeout(() => finish(worker.state === 'activated' || registration.active === worker), timeoutMs);
});
}
function requestAppReload() {
  if (state.updateReloading) return;
  state.updateReloading = true;
  window.location.reload();
}
async function applyUpdate() {
  if (state.updateApplying) return;
  let worker = state.swRegistration?.waiting;
  if (!worker) {
    await checkForUpdate();
    worker = state.swRegistration?.waiting;
    if (!worker) return;
  }
  state.updateApplying = true;
  if (state.settingsOpen) renderSettings();
  if (state.section === 'mine') render();
  try {
    worker.postMessage({ type: 'SKIP_WAITING' });
    const activated = await waitForServiceWorkerActivation(state.swRegistration, worker);
    if (!activated) throw Error('The update worker did not activate');
    requestAppReload();
  } catch {
    state.updateApplying = false;
    state.updateError = true;
    if (state.settingsOpen) renderSettings();
    if (state.section === 'mine') render();
    toast(state.language === 'en' ? 'The update could not be applied' : '更新应用失败，请重试', 'error');
  }
}
function setupServiceWorker() {
  if (!('serviceWorker' in navigator)) return;
  let controllerReady = Boolean(navigator.serviceWorker.controller);
  let didReload = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (!controllerReady) { controllerReady = true; return; }
    if (!state.updateApplying && !state.updateAvailable) return;
    if (didReload) return;
    didReload = true;
    requestAppReload();
  });
  getAppServiceWorkerRegistration().then((registration) => {
    state.swRegistration = registration;
    if (registration.waiting) {
      if (!navigator.serviceWorker.controller) registration.waiting.postMessage({ type: 'SKIP_WAITING' });
    }
    registration.addEventListener('updatefound', () => {
      const worker = registration.installing;
      if (!worker) return;
      worker.addEventListener('statechange', () => {
        if (worker.state !== 'installed') return;
        if (!navigator.serviceWorker.controller) worker.postMessage({ type: 'SKIP_WAITING' });
      });
    });
  }).catch(() => {});
}

// Rendering and interaction --------------------------------------------------
function render() {
  // A page swipe preview is transient. Clear it before any route/content
  // render so iOS Safari/PWA cannot retain the old 200% stage and expose an
  // empty lower half after returning from an external feed page.
  if (pageSwipeTrackState || pageSwipeStage.classList.contains('is-active')) clearPageSwipeTrack();
  applyLanguage();
  if (state.section === 'home') loadHomeFeeds();
  nav.hidden = state.section !== 'tools';
  const renderers = { calculator, calendar, weather, convert, translate: translateConvertView, reader, navigation: renderNavigation };
  workspace.dataset.tool = state.section === 'tools' ? state.tool : state.section;
  workspace.innerHTML = state.section === 'home' ? renderHome() : state.section === 'navigation' ? renderNavigation() : state.section === 'messages' ? renderMessages() : state.section === 'mine' ? renderMine() : (renderers[state.tool] || calculator)();
  renderHomeSourceNav();
  document.documentElement.classList.toggle('reader-focus', state.section === 'tools' && state.tool === 'reader' && state.readerMode === 'reading' && state.readerImmersive);
  syncReaderSafariSurface();
  if (state.section === 'tools' && state.tool === 'reader' && state.readerMode === 'reading') {
    requestAnimationFrame(() => { ensureReaderFullscreenTool(); applyReaderPreferences(); applyReaderMarkups(); updateReaderFullscreenControl(); syncReaderPageResizeObserver(); scheduleReaderPageLayout(); scheduleReaderPositionRestore(); if (state.readerDialog) { readerDialogMarkup(state.readerDialog); updateReaderReferenceChrome(); } });
  } else if (!state.readerDialog) {
    const readerDialog = $('#readerDialog'); if (readerDialog) readerDialog.hidden = true;
  }
  if (state.section === 'tools' && state.tool === 'calendar') ensureHolidayYear(state.month.getFullYear());
  renderBottomNav();
  requestAnimationFrame(() => { updateToolTabOverflowControls(); focusActiveToolTab(false); });
  updateNotificationBadge();
  syncMascotContext();
  if (state.recentReadingOpen) renderRecentReading();
  if (state.navigationDialog) renderNavigationDialog();
  if (state.section === 'home') scheduleHomeFeedSurfaceSync();
}
function swapWeatherCards(from, to) {
  if (from === to || from == null || to == null) return;
  [state.weatherCards[from], state.weatherCards[to]] = [state.weatherCards[to], state.weatherCards[from]];
  state.activeWeatherId = state.weatherCards[to]?.id || state.activeWeatherId;
  saveWeatherCards(); render();
  toast(state.language === 'en' ? 'Weather order saved' : '天气卡片顺序已保存');
}
let reorderTimer = null;
let reorderTarget = null;
let reorderDrag = null;
let reorderSuppressClickUntil = 0;
let swipeGesture = null;
let swipeSuppressClickUntil = 0;
let tabSwipeGesture = null;
let tabSwipeSuppressClickUntil = 0;
let pageSwipeGesture = null;
let pageSwipeAnimationToken = 0;
let pageSwipeSuppressClickUntil = 0;
let pageSwipeTrackState = null;
let pageSwipeNavState = null;
let readerSurfaceGesture = null;
let readerSelectionSuppressUntil = 0;
let readerSelectionHideTimer = 0;
let readerBookDrag = null;
let readerBookSuppressClickUntil = 0;
let navigationPressTimer = null;
let navigationDrag = null;
let navigationDialogPressTimer = null;
let navigationDialogPress = null;
let navigationSuppressClickUntil = 0;
function clearNavigationCombineTimer(drag = navigationDrag) {
  if (!drag) return;
  clearTimeout(drag.combineTimer);
  drag.combineTimer = null;
  if (drag.combineOver) drag.combineOver.classList.remove('navigation-combine-ready');
  drag.combineOver = null;
  drag.combineTarget = null;
}
function clearNavigationDragClasses() {
  $$('.navigation-card.navigation-dragging, .navigation-card.navigation-long-pressed').forEach((card) => card.classList.remove('navigation-dragging', 'navigation-long-pressed'));
  $$('.navigation-card.navigation-drop-target, .navigation-card.navigation-combine-ready').forEach((card) => card.classList.remove('navigation-drop-target', 'navigation-combine-ready'));
}
function startNavigationLongPress(target, event) {
  clearTimeout(navigationPressTimer);
  navigationDrag = { target, pointerId: event.pointerId, startX: event.clientX, startY: event.clientY, longPressed: false, active: false, over: null, folderTarget: null, combineOver: null, combineTarget: null, combineTimer: null, placeholder: null, ghost: null, parent: null, reordered: false };
  navigationPressTimer = setTimeout(() => {
    if (!navigationDrag || navigationDrag.target !== target) return;
    navigationDrag.longPressed = true;
    target.classList.add('navigation-long-pressed');
  }, 520);
}
function endNavigationLongPress() { clearTimeout(navigationPressTimer); navigationPressTimer = null; }
function startNavigationDialogLongPress(target, event) {
  clearTimeout(navigationDialogPressTimer);
  navigationDialogPress = { target, pointerId: event.pointerId, startX: event.clientX, startY: event.clientY, longPressed: false };
  navigationDialogPressTimer = setTimeout(() => {
    if (!navigationDialogPress || navigationDialogPress.target !== target) return;
    navigationDialogPress.longPressed = true;
  }, 520);
}
function updateNavigationDialogLongPress(event) {
  const press = navigationDialogPress;
  if (!press || (press.pointerId != null && event.pointerId !== press.pointerId)) return;
  if (Math.hypot(event.clientX - press.startX, event.clientY - press.startY) > 10 && !press.longPressed) {
    clearTimeout(navigationDialogPressTimer); navigationDialogPressTimer = null; navigationDialogPress = null;
  }
}
function finishNavigationDialogLongPress(event = null) {
  const press = navigationDialogPress;
  if (!press || (event?.pointerId != null && press.pointerId != null && event.pointerId !== press.pointerId)) return false;
  clearTimeout(navigationDialogPressTimer); navigationDialogPressTimer = null; navigationDialogPress = null;
  if (!press.longPressed) return false;
  navigationSuppressClickUntil = Date.now() + 550;
  const card = press.target;
  openNavigationActionsDialog(card.dataset.navigationId, card.dataset.navigationFolderId || '');
  return true;
}
function cancelNavigationDialogLongPress() { clearTimeout(navigationDialogPressTimer); navigationDialogPressTimer = null; navigationDialogPress = null; }
function animateNavigationReorder(container, mutate) {
  const before = new Map([...container.querySelectorAll('[data-navigation-item]')].map((card) => [card.dataset.navigationId, card.getBoundingClientRect()]));
  mutate();
  const moved = [...container.querySelectorAll('[data-navigation-item]')];
  moved.forEach((card) => {
    const oldRect = before.get(card.dataset.navigationId); if (!oldRect) return;
    const rect = card.getBoundingClientRect(); const dx = oldRect.left - rect.left; const dy = oldRect.top - rect.top;
    if (Math.abs(dx) < 1 && Math.abs(dy) < 1) return;
    card.style.transition = 'none'; card.style.transform = 'translate(' + dx + 'px, ' + dy + 'px)';
    requestAnimationFrame(() => { card.style.transition = 'transform 190ms cubic-bezier(.2,.75,.25,1)'; card.style.transform = ''; window.setTimeout(() => { card.style.transition = ''; }, 210); });
  });
}
function createNavigationDragOverlay(drag, event) {
  const target = drag.target; const rect = target.getBoundingClientRect(); const parent = target.parentElement;
  if (!parent) return;
  drag.parent = parent;
  const placeholder = document.createElement('article');
  placeholder.className = 'navigation-card navigation-drag-placeholder';
  placeholder.style.width = rect.width + 'px'; placeholder.style.height = rect.height + 'px';
  placeholder.setAttribute('aria-hidden', 'true');
  target.replaceWith(placeholder); drag.placeholder = placeholder;
  const ghost = target.cloneNode(true);
  ghost.className = 'navigation-card navigation-drag-ghost';
  ghost.style.width = rect.width + 'px'; ghost.style.height = rect.height + 'px';
  ghost.style.left = event.clientX + 'px'; ghost.style.top = event.clientY + 'px';
  document.body.appendChild(ghost); drag.ghost = ghost;
  try { workspace.setPointerCapture?.(drag.pointerId); drag.captureTarget = workspace; } catch {}
}
function restoreNavigationDrag(drag) {
  clearNavigationCombineTimer(drag);
  if (drag.over) drag.over.classList.remove('navigation-drop-target', 'navigation-combine-ready');
  if (drag.placeholder?.isConnected) drag.placeholder.replaceWith(drag.target);
  drag.ghost?.remove();
  try { if (drag.captureTarget?.hasPointerCapture?.(drag.pointerId)) drag.captureTarget.releasePointerCapture(drag.pointerId); } catch {}
  drag.target.classList.remove('navigation-dragging', 'navigation-long-pressed');
  drag.placeholder = null; drag.ghost = null;
}
function positionNavigationPlaceholder(drag, over, clientX, clientY) {
  const placeholder = drag.placeholder; const parent = over?.parentElement;
  if (!placeholder || !over || !parent || over === placeholder || over.dataset.navigationFolderId) return false;
  const rect = over.getBoundingClientRect();
  const horizontal = Math.abs(clientX - (rect.left + rect.width / 2)) >= Math.abs(clientY - (rect.top + rect.height / 2));
  const centered = Math.abs(clientX - (rect.left + rect.width / 2)) < rect.width * .22 && Math.abs(clientY - (rect.top + rect.height / 2)) < rect.height * .22;
  const after = centered && drag.target.dataset.navigationType !== 'site' ? true : horizontal ? clientX > rect.left + rect.width / 2 : clientY > rect.top + rect.height / 2;
  const next = after ? over.nextElementSibling : over;
  if (next === placeholder) return false;
  animateNavigationReorder(parent, () => parent.insertBefore(placeholder, next));
  drag.reordered = true;
  return true;
}
function persistNavigationDomOrder(drag) {
  const parent = drag.parent; if (!parent) return;
  const ids = [...parent.querySelectorAll('[data-navigation-item]')].map((card) => card.dataset.navigationId);
  const byId = new Map(state.navigation.items.map((item) => [item.id, item]));
  if (ids.length !== state.navigation.items.length) return;
  state.navigation.items = ids.map((id) => byId.get(id)).filter(Boolean);
  saveNavigation(); render(); toast(t('navigationOrderSaved'));
}
function updateNavigationDrag(event) {
  const drag = navigationDrag;
  if (!drag || (drag.pointerId != null && event.pointerId !== drag.pointerId)) return;
  const dx = event.clientX - drag.startX; const dy = event.clientY - drag.startY;
  if (!drag.longPressed) {
    if (Math.hypot(dx, dy) > 10) { endNavigationLongPress(); navigationDrag = null; }
    return;
  }
  if (!drag.active) {
    if (Math.hypot(dx, dy) < 8) return;
    drag.active = true;
    drag.target.classList.add('navigation-dragging'); drag.target.classList.remove('navigation-long-pressed');
    createNavigationDragOverlay(drag, event);
  }
  if (drag.ghost) { drag.ghost.style.left = event.clientX + 'px'; drag.ghost.style.top = event.clientY + 'px'; }
  const hit = document.elementFromPoint?.(event.clientX, event.clientY) || event.target;
  const over = hit?.closest?.('[data-navigation-item]');
  if (drag.over && drag.over !== over) drag.over.classList.remove('navigation-drop-target', 'navigation-combine-ready');
  drag.over = over && over !== drag.target ? over : null;
  if (!drag.over) { clearNavigationCombineTimer(drag); drag.folderTarget = null; }
  else if (drag.over.dataset.navigationFolderId || drag.over.dataset.navigationType === 'folder') {
    clearNavigationCombineTimer(drag); drag.folderTarget = drag.over; drag.over.classList.add('navigation-drop-target');
  } else {
    drag.folderTarget = null;
    const rect = drag.over.getBoundingClientRect();
    const centered = Math.abs(event.clientX - (rect.left + rect.width / 2)) < rect.width * .22 && Math.abs(event.clientY - (rect.top + rect.height / 2)) < rect.height * .22;
    if (centered && drag.target.dataset.navigationType === 'site' && drag.over.dataset.navigationType === 'site') {
      if (drag.combineOver !== drag.over) {
        clearNavigationCombineTimer(drag); drag.combineOver = drag.over; drag.combineTarget = drag.over; drag.over.classList.add('navigation-drop-target', 'navigation-combine-ready');
      }
    } else {
      clearNavigationCombineTimer(drag); drag.over.classList.add('navigation-drop-target'); positionNavigationPlaceholder(drag, drag.over, event.clientX, event.clientY);
    }
  }
  if (event.cancelable) event.preventDefault();
}
function finishNavigationDrag(event = null) {
  const drag = navigationDrag;
  if (!drag || (event?.pointerId != null && drag.pointerId != null && event.pointerId !== drag.pointerId)) return false;
  navigationDrag = null; endNavigationLongPress();
  const targetId = drag.target.dataset.navigationId;
  const wasActive = drag.active;
  const wasLongPressed = drag.longPressed;
  const over = drag.over;
  const combineTarget = drag.combineTarget;
  const folderTarget = drag.folderTarget;
  if (wasLongPressed) navigationSuppressClickUntil = Date.now() + 550;
  if (!wasActive) {
    restoreNavigationDrag(drag);
    if (wasLongPressed) openNavigationActionsDialog(targetId, drag.target.dataset.navigationFolderId || '');
    return wasLongPressed;
  }
  if (over && over.dataset.navigationType === 'site' && !combineTarget && !folderTarget) positionNavigationPlaceholder(drag, over, event?.clientX ?? drag.startX, event?.clientY ?? drag.startY);
  const overId = over?.dataset.navigationId;
  const source = navigationFindRootItem(targetId); const destination = navigationFindRootItem(overId);
  if (combineTarget && source?.type === 'site' && destination?.type === 'site') {
    restoreNavigationDrag(drag); render(); openNavigationCreateFolderDialog(source.id, destination.id); return true;
  }
  if (folderTarget && source?.type === 'site' && folderTarget.dataset.navigationType === 'folder') {
    const folderId = folderTarget.dataset.navigationId; restoreNavigationDrag(drag); moveNavigationSiteToFolder(source.id, folderId); return true;
  }
  if (source && destination && source.id !== destination.id && !drag.reordered && source.type !== 'site' && destination.type !== 'site') {
    restoreNavigationDrag(drag); swapNavigationRootItems(source.id, destination.id); return true;
  }
  restoreNavigationDrag(drag); if (drag.reordered) persistNavigationDomOrder(drag);
  return true;
}
function startLongPress(target, type, index, pointerEvent = null) {
  clearTimeout(reorderTimer);
  if (readerBookDrag?.active) finishReaderBookDrag(pointerEvent);
  readerBookDrag = type === 'book' ? { target, type, index, pointerId: pointerEvent?.pointerId, startX: pointerEvent?.clientX || 0, startY: pointerEvent?.clientY || 0, active: false } : null;
  reorderDrag = type !== 'book' && pointerEvent?.pointerType !== 'mouse' ? { target, type, index, pointerId: pointerEvent?.pointerId, startX: pointerEvent?.clientX || 0, startY: pointerEvent?.clientY || 0, longPressed: false, active: false, over: null } : null;
  reorderTarget = { target, type, index, pointerId: pointerEvent?.pointerId };
  reorderTimer = setTimeout(() => {
    target.classList.add('reorder-hold'); target.dataset.longPressed = 'true';
    if (type === 'weather') target.classList.add('weather-delete-ready');
    else if (type === 'book') { target.classList.add('reader-delete-ready'); if (readerBookDrag) readerBookDrag.longPressed = true; }
    if (reorderDrag) reorderDrag.longPressed = true;
    if (type !== 'weather' && type !== 'book' && !reorderDrag) toast(state.language === 'en' ? 'Reorder mode: tap another item' : '排序模式：再点一下目标位置');
  }, 520);
}
function endLongPress() { clearTimeout(reorderTimer); reorderTimer = null; }
function reorderDragSelector(type) {
  if (type === 'tool') return '[data-tool]';
  if (type === 'feed') return '[data-feed-source-index]';
  return '[data-weather-card]';
}
function reorderDragContainer(type) {
  if (type === 'tool') return nav;
  if (type === 'feed') return homeSourceNav.querySelector('.feed-source-tabs');
  return workspace.querySelector('.weather-card-list');
}
function captureReorderPointer(drag) {
  if (!drag || drag.pointerId == null) return;
  try { drag.target.setPointerCapture?.(drag.pointerId); } catch {}
}
function releaseReorderPointer(drag) {
  if (!drag || drag.pointerId == null) return;
  try { if (drag.target.hasPointerCapture?.(drag.pointerId)) drag.target.releasePointerCapture(drag.pointerId); } catch {}
}
function updateReorderDrag(event) {
  const drag = reorderDrag;
  if (!drag || (drag.pointerId != null && event.pointerId !== drag.pointerId)) return;
  const dx = event.clientX - drag.startX; const dy = event.clientY - drag.startY;
  if (!drag.longPressed) {
    if (Math.hypot(dx, dy) > 10) { endLongPress(); reorderTarget = null; reorderDrag = null; }
    return;
  }
  if (!drag.active) {
    if (Math.hypot(dx, dy) < 8) return;
    drag.active = true;
    captureReorderPointer(drag);
    drag.target.classList.add('reorder-dragging');
    drag.target.classList.remove('reorder-hold', 'weather-delete-ready');
  }
  const hit = document.elementFromPoint?.(event.clientX, event.clientY) || event.target;
  const over = hit?.closest?.(reorderDragSelector(drag.type));
  if (drag.over && drag.over !== over) drag.over.classList.remove('reorder-over');
  drag.over = over && over !== drag.target ? over : null;
  if (!drag.over || !drag.over.parentElement) {
    if (event.cancelable) event.preventDefault();
    return;
  }
  drag.over.classList.add('reorder-over');
  const rect = drag.over.getBoundingClientRect();
  const centerX = rect.left + rect.width / 2; const centerY = rect.top + rect.height / 2;
  const horizontal = drag.type === 'feed' || Math.abs(event.clientX - centerX) > Math.abs(event.clientY - centerY);
  const insertAfter = horizontal ? event.clientX > centerX : event.clientY > centerY;
  const parent = drag.over.parentElement;
  if (insertAfter) {
    if (drag.over.nextElementSibling !== drag.target) parent.insertBefore(drag.target, drag.over.nextElementSibling);
  } else if (drag.over !== drag.target.nextElementSibling) {
    parent.insertBefore(drag.target, drag.over);
  }
  if (event.cancelable) event.preventDefault();
}
function finishReorderDrag(event = null) {
  const drag = reorderDrag;
  if (!drag || (event?.pointerId != null && drag.pointerId != null && event.pointerId !== drag.pointerId)) return false;
  if (drag.over) drag.over.classList.remove('reorder-over');
  const wasActive = drag.active;
  if (!wasActive) { reorderDrag = null; return false; }
  drag.target.classList.remove('reorder-dragging', 'reorder-hold', 'weather-delete-ready');
  delete drag.target.dataset.longPressed;
  releaseReorderPointer(drag);
  const container = reorderDragContainer(drag.type);
  const items = container ? [...container.querySelectorAll(reorderDragSelector(drag.type))] : [];
  if (drag.type === 'tool') {
    state.toolOrder = normalizeToolOrder(items.map((item) => item.dataset.tool), state.navigationLocation === 'tools');
    saveToolOrder(); renderNav();
  } else if (drag.type === 'feed') {
    const visibleIds = items.map((item) => item.dataset.feedSource).filter(Boolean);
    const visibleSet = new Set(visibleIds); let cursor = 0;
    state.homeFeed.order = state.homeFeed.order.map((id) => visibleSet.has(id) ? visibleIds[cursor++] : id);
    saveHomeFeedOrder(); render();
  } else {
    const cards = items.map((item) => state.weatherCards.find((card) => card.id === item.dataset.weatherCard)).filter(Boolean);
    state.weatherCards = cards; saveWeatherCards(); render();
  }
  reorderSuppressClickUntil = Date.now() + 500;
  reorderTarget = null; reorderDrag = null;
  toast(state.language === 'en' ? 'Order saved' : '顺序已保存');
  return true;
}
function cancelReorderDrag() {
  if (reorderDrag?.over) reorderDrag.over.classList.remove('reorder-over');
  if (reorderDrag?.target) {
    releaseReorderPointer(reorderDrag);
    reorderDrag.target.classList.remove('reorder-dragging', 'reorder-hold', 'weather-delete-ready');
    delete reorderDrag.target.dataset.longPressed;
  }
  if (reorderTarget && reorderTarget.type !== 'book') {
    reorderTarget.target.classList.remove('reorder-hold', 'weather-delete-ready');
    delete reorderTarget.target.dataset.longPressed;
    reorderTarget = null;
  }
  reorderDrag = null;
}
function readerBookCardsInDom() {
  return [...document.querySelectorAll('[data-reader-book-card]')];
}
function releaseReaderBookPointer(drag) {
  if (!drag || drag.type !== 'book' || drag.pointerId == null) return;
  try { if (drag.target.hasPointerCapture?.(drag.pointerId)) drag.target.releasePointerCapture(drag.pointerId); } catch {}
}
function updateReaderBookDrag(event) {
  const drag = readerBookDrag;
  if (!drag || (drag.pointerId != null && event.pointerId !== drag.pointerId)) return;
  const dx = event.clientX - drag.startX; const dy = event.clientY - drag.startY;
  if (!drag.active) {
    if (!drag.longPressed) {
      if (Math.hypot(dx, dy) > 10) { endLongPress(); reorderTarget = null; readerBookDrag = null; }
      return;
    }
    if (Math.hypot(dx, dy) < 8) return;
    drag.active = true;
    drag.target.classList.add('reader-book-dragging');
    drag.target.classList.remove('reader-delete-ready');
    if (event.cancelable) event.preventDefault();
  }
  const hit = document.elementFromPoint?.(event.clientX, event.clientY) || event.target;
  const over = hit?.closest?.('[data-reader-book-card]');
  if (drag.over && drag.over !== over) drag.over.classList.remove('reorder-over');
  drag.over = over && over !== drag.target ? over : null;
  if (!drag.over || !drag.over.parentElement) {
    if (event.cancelable) event.preventDefault();
    return;
  }
  drag.over.classList.add('reorder-over');
  const rect = drag.over.getBoundingClientRect();
  const insertAfter = event.clientY > rect.top + rect.height / 2;
  const parent = drag.over.parentElement;
  if (insertAfter) {
    if (drag.over.nextElementSibling !== drag.target) parent.insertBefore(drag.target, drag.over.nextElementSibling);
  } else if (drag.over !== drag.target.nextElementSibling) {
    parent.insertBefore(drag.target, drag.over);
  }
  if (event.cancelable) event.preventDefault();
}
function finishReaderBookDrag(event = null) {
  const drag = readerBookDrag;
  if (!drag || (event?.pointerId != null && drag.pointerId != null && event.pointerId !== drag.pointerId)) return false;
  const wasActive = drag.active;
  if (wasActive) {
    if (drag.over) drag.over.classList.remove('reorder-over');
    const cards = readerBookCardsInDom();
    const books = cards.map((card) => readerBookById(card.dataset.id)).filter(Boolean);
    books.forEach((book, index) => { book.order = books.length - index; });
    saveLibrary();
    readerBookSuppressClickUntil = Date.now() + 500;
    drag.target.classList.remove('reader-book-dragging');
    reorderTarget = null;
    releaseReaderBookPointer(drag);
    render();
    toast(state.language === 'en' ? 'Shelf order saved' : '书架顺序已保存');
  } else {
    releaseReaderBookPointer(drag);
  }
  readerBookDrag = null;
  return wasActive;
}
function clearReaderDeleteMode() {
  endLongPress();
  readerBookDrag?.over?.classList.remove('reorder-over');
  releaseReaderBookPointer(readerBookDrag);
  $$('.reader-book-card.reader-delete-ready, .reader-book-card.reorder-hold').forEach((card) => {
    card.classList.remove('reader-delete-ready', 'reorder-hold');
    delete card.dataset.longPressed;
  });
  $$('.reader-book-card.reader-book-dragging').forEach((card) => card.classList.remove('reader-book-dragging'));
  readerBookDrag = null;
  if (reorderTarget?.type === 'book') reorderTarget = null;
}
function handleReorderClick(target, type, index) {
  if (!reorderTarget || reorderTarget.type !== type || !reorderTarget.target.dataset.longPressed) return false;
  if (type === 'book') {
    target.classList.add('reader-delete-ready'); delete target.dataset.longPressed; reorderTarget = null;
    return true;
  }
  if (reorderTarget.index !== index) type === 'tool' ? swapToolOrder(reorderTarget.index, index) : type === 'feed' ? swapHomeFeedSources(reorderTarget.index, index) : swapWeatherCards(reorderTarget.index, index);
  reorderTarget.target.classList.remove('reorder-hold'); delete reorderTarget.target.dataset.longPressed; reorderTarget = null;
  return true;
}
function pageSwipeNavSelector(container) {
  return container?.dataset.tabRail === 'tools' ? '[data-tool]' : '[data-feed-source]';
}
function clearPageSwipeNav() {
  if (!pageSwipeNavState) return;
  pageSwipeNavState.container.classList.remove('page-swipe-nav-dragging');
  pageSwipeNavState.indicator.remove();
  pageSwipeNavState = null;
}
function setPageSwipeNavProgress(progress) {
  const swipe = pageSwipeNavState;
  if (!swipe) return;
  const amount = Math.max(0, Math.min(1, progress));
  // The rail stays outside the moving page stage. Capture its geometry once
  // when the gesture starts; reading layout on every pointermove can cause
  // Safari to reflow the rail and make the underline wobble after direction
  // has already been established.
  const left = swipe.fromLeft + (swipe.toLeft - swipe.fromLeft) * amount;
  const width = swipe.fromWidth + (swipe.toWidth - swipe.fromWidth) * amount;
  swipe.indicator.style.transition = 'none';
  swipe.indicator.style.transform = `translate3d(${left - swipe.fromLeft}px, 0, 0)`;
  swipe.indicator.style.width = Math.max(8, width) + 'px';
}
function beginPageSwipeNav(container, direction) {
  if (!container) return null;
  clearPageSwipeNav();
  const tabs = [...container.querySelectorAll(pageSwipeNavSelector(container))];
  const currentIndex = tabs.findIndex((tab) => tab.classList.contains('active'));
  const targetIndex = currentIndex + direction;
  if (currentIndex < 0 || targetIndex < 0 || targetIndex >= tabs.length) return null;
  const containerRect = container.getBoundingClientRect();
  const fromRect = tabs[currentIndex].getBoundingClientRect();
  const toRect = tabs[targetIndex].getBoundingClientRect();
  const fromLeft = fromRect.left - containerRect.left + container.scrollLeft;
  const toLeft = toRect.left - containerRect.left + container.scrollLeft;
  const indicator = document.createElement('i');
  indicator.className = 'page-swipe-nav-indicator';
  indicator.setAttribute('aria-hidden', 'true');
  indicator.style.transition = 'none';
  indicator.style.left = fromLeft + 'px';
  indicator.style.width = Math.max(8, fromRect.width) + 'px';
  container.classList.add('page-swipe-nav-dragging');
  container.appendChild(indicator);
  pageSwipeNavState = {
    container,
    from: tabs[currentIndex],
    to: tabs[targetIndex],
    indicator,
    fromLeft,
    toLeft,
    fromWidth: fromRect.width,
    toWidth: toRect.width,
    navDistance: Math.max(1, Math.abs(toLeft - fromLeft))
  };
  setPageSwipeNavProgress(0);
  return pageSwipeNavState;
}
function settlePageSwipeNav(committed) {
  if (!pageSwipeNavState) return;
  // The page itself has the settle animation. The underline should snap to
  // the resolved tab once, instead of running a second animation that can
  // continue to move after the page has landed.
  pageSwipeNavState.indicator.style.transition = 'none';
  setPageSwipeNavProgress(committed ? 1 : 0);
}
function beginTabSwipe(container, event) {
  if (!container || event.pointerType === 'mouse') return;
  tabSwipeGesture = { container, startX: event.clientX, startY: event.clientY, dx: 0, dy: 0, cancelled: false };
}
function updateTabSwipe(event) {
  if (!tabSwipeGesture) return;
  tabSwipeGesture.dx = event.clientX - tabSwipeGesture.startX;
  tabSwipeGesture.dy = event.clientY - tabSwipeGesture.startY;
  if (Math.abs(tabSwipeGesture.dy) > Math.abs(tabSwipeGesture.dx) + 12 && Math.abs(tabSwipeGesture.dy) > 8) {
    tabSwipeGesture.cancelled = true;
    endLongPress();
    return;
  }
  if (Math.abs(tabSwipeGesture.dx) > 12) endLongPress();
  if (Math.abs(tabSwipeGesture.dx) > 12 && !pageSwipeNavState) {
    const direction = tabSwipeGesture.dx < 0 ? 1 : -1;
    beginPageSwipeNav(tabSwipeGesture.container, direction);
  }
  if (pageSwipeNavState) {
    const distance = Math.max(1, pageSwipeNavState.container.clientWidth * .18);
    setPageSwipeNavProgress(Math.abs(tabSwipeGesture.dx) / distance);
  }
}
function finishTabSwipe() {
  const gesture = tabSwipeGesture;
  tabSwipeGesture = null;
  if (!gesture || gesture.cancelled || Math.abs(gesture.dx) < 52 || Math.abs(gesture.dx) <= Math.abs(gesture.dy) + 12) {
    settlePageSwipeNav(false);
    clearPageSwipeNav();
    return;
  }
  const isToolRail = gesture.container.dataset.tabRail === 'tools';
  const selector = isToolRail ? '[data-tool]' : '[data-feed-source]';
  const tabs = [...gesture.container.querySelectorAll(selector)];
  const currentIndex = tabs.findIndex((tab) => tab.classList.contains('active'));
  const nextIndex = currentIndex + (gesture.dx < 0 ? 1 : -1);
  if (currentIndex < 0 || nextIndex < 0 || nextIndex >= tabs.length) {
    settlePageSwipeNav(false);
    clearPageSwipeNav();
    return;
  }
  const nextTab = tabs[nextIndex];
  tabSwipeSuppressClickUntil = Date.now() + 420;
  settlePageSwipeNav(true);
  clearPageSwipeNav();
  if (isToolRail) selectTool(nextTab.dataset.tool);
  else selectHomeFeedSource(nextTab.dataset.feedSource);
  requestAnimationFrame(() => gesture.container.querySelector('.active')?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' }));
}

function pageSwipeItems() {
  if (state.section === 'home') {
    return homeTabIds().map((id) => ({ kind: 'home', id }));
  }
  if (state.section === 'tools') return (state.navigationLocation === 'tools' ? state.toolOrder : state.toolOrder.filter((id) => id !== 'navigation')).map((id) => ({ kind: 'tool', id }));
  return [];
}
function pageSwipeIndex(items) {
  const currentId = state.section === 'home' ? state.homeFeed.active : state.section === 'navigation' ? 'navigation' : state.tool;
  return items.findIndex((item) => item.id === currentId);
}
function pageSwipeTarget(event) {
  const main = event.target.closest('main');
  if (!main || event.pointerType === 'mouse' || pageSwipeAnimationToken) return null;
  if (event.target.closest('[data-reader-surface], .reader-reference-shell, [data-reader-book-card], [data-swipe-row], .navigation-page, input, textarea, select, [contenteditable="true"], .weather-card-list, .weather-days, .hourly-strip, .advice-strip, .translation-history-list')) return null;
  const items = pageSwipeItems();
  const index = pageSwipeIndex(items);
  if (index < 0 || items.length < 2) return null;
  return { main, items, index, pointerId: event.pointerId, startX: event.clientX, startY: event.clientY, dx: 0, dy: 0, cancelled: false, dragging: false };
}
function beginPageSwipe(event) {
  pageSwipeGesture = pageSwipeTarget(event);
}
function pageSwipeMarkup(item) {
  if (item.kind === 'home') {
    const previousSource = state.homeFeed.active;
    state.homeFeed.active = item.id;
    const markup = renderHome();
    state.homeFeed.active = previousSource;
    return { tool: 'home', markup };
  }
  const previousTool = state.tool;
  state.tool = item.id;
  const renderers = { calculator, calendar, weather, convert, translate: translateConvertView, reader, navigation: renderNavigation };
  const markup = (renderers[item.id] || calculator)();
  state.tool = previousTool;
  return { tool: item.id, markup };
}
function clearPageSwipeTrack() {
  pageSwipeStage.querySelector('.page-swipe-preview')?.remove();
  pageSwipeStage.className = 'page-swipe-stage';
  pageSwipeStage.style.transform = '';
  workspace.classList.remove('page-swipe-dragging', 'page-swipe-settling');
  workspace.style.transform = '';
  clearPageSwipeNav();
  pageSwipeTrackState = null;
}
function preparePageSwipeTrack(gesture, direction) {
  const nextIndex = gesture.index + direction;
  if (nextIndex < 0 || nextIndex >= gesture.items.length) {
    clearPageSwipeTrack();
    return null;
  }
  const target = gesture.items[nextIndex];
  if (pageSwipeTrackState?.target?.id === target.id && pageSwipeTrackState.direction === direction) return pageSwipeTrackState;
  clearPageSwipeTrack();
  const rendered = pageSwipeMarkup(target);
  const preview = document.createElement('section');
  preview.id = 'workspace';
  preview.className = 'workspace page-swipe-preview';
  preview.dataset.tool = rendered.tool;
  preview.setAttribute('aria-hidden', 'true');
  preview.innerHTML = rendered.markup;
  preview.scrollTop = workspace.scrollTop;
  pageSwipeStage.appendChild(preview);
  const pageWidth = Math.max(1, workspace.getBoundingClientRect().width);
  pageSwipeStage.classList.add('is-active', direction === 1 ? 'forward' : 'backward');
  pageSwipeStage.style.transform = 'translate3d(' + (direction === 1 ? 0 : -pageWidth) + 'px, 0, 0)';
  const navContainer = target.kind === 'tool' ? nav : homeSourceNav.querySelector('.feed-source-tabs');
  pageSwipeTrackState = { target, direction, pageWidth, nav: beginPageSwipeNav(navContainer, direction) };
  return pageSwipeTrackState;
}
function resetPageSwipeTransform() {
  if (pageSwipeTrackState) clearPageSwipeTrack();
  else {
    workspace.classList.remove('page-swipe-dragging');
    workspace.style.transform = '';
  }
}
function settlePageSwipeBack() {
  const token = ++pageSwipeAnimationToken;
  const track = pageSwipeTrackState;
  settlePageSwipeNav(false);
  if (track) {
    pageSwipeStage.classList.remove('page-swipe-dragging');
    pageSwipeStage.classList.add('page-swipe-settling');
    pageSwipeStage.style.transform = 'translate3d(' + (track.direction === 1 ? 0 : -track.pageWidth) + 'px, 0, 0)';
  } else {
    workspace.classList.remove('page-swipe-dragging');
    workspace.classList.add('page-swipe-settling');
    workspace.style.transform = 'translate3d(0, 0, 0)';
  }
  window.setTimeout(() => {
    if (token !== pageSwipeAnimationToken) return;
    pageSwipeAnimationToken = 0;
    clearPageSwipeTrack();
  }, 300);
}
function selectPageSwipeItem(item) {
  if (item.kind === 'tool') return selectTool(item.id);
  return selectHomeFeedSource(item.id);
}
function settlePageSwipe(target, direction) {
  const token = ++pageSwipeAnimationToken;
  const track = pageSwipeTrackState;
  if (!track) return settlePageSwipeBack();
  settlePageSwipeNav(true);
  pageSwipeStage.classList.remove('page-swipe-dragging');
  pageSwipeStage.classList.add('page-swipe-settling');
  pageSwipeStage.style.transform = 'translate3d(' + (direction === 1 ? -track.pageWidth : 0) + 'px, 0, 0)';
  window.setTimeout(() => {
    if (token !== pageSwipeAnimationToken) return;
    pageSwipeAnimationToken = 0;
    clearPageSwipeTrack();
    selectPageSwipeItem(target);
  }, 300);
}
function updatePageSwipe(event) {
  const gesture = pageSwipeGesture;
  if (!gesture || (gesture.pointerId != null && event.pointerId !== gesture.pointerId)) return;
  gesture.dx = event.clientX - gesture.startX;
  gesture.dy = event.clientY - gesture.startY;
  if (Math.abs(gesture.dy) > Math.abs(gesture.dx) + 10 && Math.abs(gesture.dy) > 8) {
    gesture.cancelled = true;
    endLongPress();
    resetPageSwipeTransform();
    return;
  }
  if (Math.abs(gesture.dx) <= 10 || Math.abs(gesture.dx) <= Math.abs(gesture.dy) + 8) return;
  gesture.dragging = true;
  endLongPress();
  if (event.cancelable) event.preventDefault();
  const direction = gesture.dx < 0 ? 1 : -1;
  const track = preparePageSwipeTrack(gesture, direction);
  if (!track) {
    const visualDx = gesture.dx * 0.2;
    workspace.classList.add('page-swipe-dragging');
    workspace.style.transform = 'translate3d(' + visualDx + 'px, 0, 0)';
    return;
  }
  pageSwipeStage.classList.add('page-swipe-dragging');
  const baseOffset = direction === 1 ? 0 : -track.pageWidth;
  pageSwipeStage.style.transform = 'translate3d(' + (baseOffset + gesture.dx) + 'px, 0, 0)';
  const swipeThreshold = Math.max(56, Math.min(112, window.innerWidth * 0.18));
  const indicatorDistance = Math.min(swipeThreshold, track.nav?.navDistance || swipeThreshold);
  setPageSwipeNavProgress(Math.abs(gesture.dx) / indicatorDistance);
}
function finishPageSwipe(event) {
  const gesture = pageSwipeGesture;
  pageSwipeGesture = null;
  if (!gesture || (gesture.pointerId != null && event.pointerId !== gesture.pointerId)) return;
  if (gesture.cancelled || !gesture.dragging) return;
  pageSwipeSuppressClickUntil = Date.now() + 460;
  tabSwipeSuppressClickUntil = pageSwipeSuppressClickUntil;
  const direction = gesture.dx < 0 ? 1 : -1;
  const distance = Math.abs(gesture.dx);
  const threshold = Math.max(56, Math.min(112, window.innerWidth * 0.18));
  const track = pageSwipeTrackState;
  const target = track?.direction === direction && distance >= threshold ? track.target : null;
  if (target) settlePageSwipe(target, direction);
  else settlePageSwipeBack();
}

workspace.addEventListener('pointerdown', (event) => {
  const row = event.target.closest('[data-swipe-row]');
  if (!row || event.target.closest('.swipe-delete')) {
    if (!row) $$('.swipe-row.swiped').forEach((item) => item.classList.remove('swiped'));
    swipeGesture = null;
    return;
  }
  swipeGesture = { row, startX: event.clientX, startY: event.clientY, dx: 0, dy: 0, dragging: false, cancelled: false };
});
$('#notificationPanel').addEventListener('pointerdown', (event) => {
  const row = event.target.closest('[data-swipe-row]');
  if (!row || event.target.closest('.swipe-delete')) { if (!row) $$('.swipe-row.swiped').forEach((item) => item.classList.remove('swiped')); swipeGesture = null; return; }
  swipeGesture = { row, startX: event.clientX, startY: event.clientY, dx: 0, dy: 0, dragging: false, cancelled: false };
});
workspace.addEventListener('pointermove', (event) => {
  if (!swipeGesture) return;
  swipeGesture.dx = event.clientX - swipeGesture.startX; swipeGesture.dy = event.clientY - swipeGesture.startY;
  if (Math.abs(swipeGesture.dy) > Math.abs(swipeGesture.dx) + 10 && Math.abs(swipeGesture.dy) > 8) { swipeGesture.cancelled = true; return; }
  if (Math.abs(swipeGesture.dx) > 14) swipeGesture.dragging = true;
});
document.addEventListener('pointerup', () => {
  const gesture = swipeGesture; swipeGesture = null;
  if (!gesture || gesture.cancelled) return;
  if (gesture.dx < -52 && Math.abs(gesture.dx) > Math.abs(gesture.dy) + 12) {
    $$('.swipe-row.swiped').forEach((row) => { if (row !== gesture.row) row.classList.remove('swiped'); });
    gesture.row.classList.add('swiped'); swipeSuppressClickUntil = Date.now() + 350;
  } else if (gesture.dx > 24) gesture.row.classList.remove('swiped');
}, { passive: true });

nav.addEventListener('pointerdown', (event) => { const tab = event.target.closest('[data-tool]'); if (tab) { startLongPress(tab, 'tool', Number(tab.dataset.toolIndex), event); beginTabSwipe(nav.querySelector('.tool-tabs') || nav, event); } });
nav.addEventListener('pointerup', endLongPress);
nav.addEventListener('pointercancel', endLongPress);
nav.addEventListener('click', (event) => {
  const scrollButton = event.target.closest('[data-tool-scroll]');
  if (scrollButton) {
    event.preventDefault();
    scrollToolTabs(scrollButton.dataset.toolScroll === 'previous' ? -1 : 1);
    return;
  }
  const tab = event.target.closest('[data-tool]'); if (!tab) return;
  if (Date.now() < reorderSuppressClickUntil || Date.now() < tabSwipeSuppressClickUntil || Date.now() < pageSwipeSuppressClickUntil) { event.preventDefault(); return; }
  if (handleReorderClick(tab, 'tool', Number(tab.dataset.toolIndex))) { event.preventDefault(); return; }
  selectTool(tab.dataset.tool);
  requestAnimationFrame(() => focusActiveToolTab(true));
  if (tab.dataset.tool === 'weather') refreshWeatherCard(state.weatherCards.find((card) => card.id === state.activeWeatherId));
});
nav.addEventListener('dragstart', (event) => { const tab = event.target.closest('[data-tool]'); if (tab) event.dataTransfer.setData('text/plain', tab.dataset.toolIndex); });
nav.addEventListener('dragover', (event) => { if (event.target.closest('[data-tool]')) event.preventDefault(); });
  nav.addEventListener('drop', (event) => { event.preventDefault(); const tab = event.target.closest('[data-tool]'); if (tab) swapToolOrder(Number(event.dataTransfer.getData('text/plain')), Number(tab.dataset.toolIndex)); });

homeSourceNav.addEventListener('pointerdown', (event) => {
  const source = event.target.closest('[data-feed-source]');
  if (source?.dataset.feedSourceIndex != null) startLongPress(source, 'feed', Number(source.dataset.feedSourceIndex), event);
});
homeSourceNav.addEventListener('pointerup', endLongPress);
homeSourceNav.addEventListener('pointercancel', endLongPress);
homeSourceNav.addEventListener('click', (event) => {
  if (event.target.closest('[data-open-home-source-picker]')) {
    event.preventDefault();
    openHomeSourceDialog();
    return;
  }
  const scrollButton = event.target.closest('[data-feed-source-scroll]');
  if (scrollButton) {
    event.preventDefault();
    scrollHomeFeedTabs(scrollButton.dataset.feedSourceScroll === 'previous' ? -1 : 1);
    return;
  }
  const feedSource = event.target.closest('[data-feed-source]');
  if (!feedSource) return;
  if (Date.now() < reorderSuppressClickUntil || Date.now() < tabSwipeSuppressClickUntil || Date.now() < pageSwipeSuppressClickUntil) { event.preventDefault(); return; }
  if (feedSource.dataset.feedSourceIndex != null && handleReorderClick(feedSource, 'feed', Number(feedSource.dataset.feedSourceIndex))) { event.preventDefault(); return; }
  selectHomeFeedSource(feedSource.dataset.feedSource);
});
homeSourceNav.addEventListener('dragstart', (event) => { const source = event.target.closest('[data-feed-source]'); if (source) event.dataTransfer.setData('text/plain', source.dataset.feedSourceIndex); });
homeSourceNav.addEventListener('dragover', (event) => { if (event.target.closest('[data-feed-source]')) event.preventDefault(); });
homeSourceNav.addEventListener('drop', (event) => { event.preventDefault(); const source = event.target.closest('[data-feed-source]'); if (source) swapHomeFeedSources(Number(event.dataTransfer.getData('text/plain')), Number(source.dataset.feedSourceIndex)); });

workspace.addEventListener('pointerdown', (event) => { const card = event.target.closest('[data-weather-card]'); if (card) startLongPress(card, 'weather', Number(card.dataset.weatherIndex), event); });
workspace.addEventListener('pointerdown', (event) => { const source = event.target.closest('[data-feed-source]'); if (source?.dataset.feedSourceIndex != null) startLongPress(source, 'feed', Number(source.dataset.feedSourceIndex), event); });
workspace.addEventListener('pointerdown', (event) => {
  const navigationVisible = state.section === 'navigation' || (state.section === 'tools' && state.tool === 'navigation');
  if (!navigationVisible) return;
  const card = event.target.closest('[data-navigation-item]');
  if (card && !event.target.closest('[data-navigation-open-action], [data-navigation-delete], [data-navigation-edit]')) startNavigationLongPress(card, event);
});
$('#navigationDialog').addEventListener('pointerdown', (event) => {
  const card = event.target.closest('.navigation-folder-sites [data-navigation-item]');
  if (card && !event.target.closest('[data-navigation-open-action], [data-navigation-delete], [data-navigation-edit]')) startNavigationDialogLongPress(card, event);
});
workspace.addEventListener('pointerdown', (event) => {
  const book = event.target.closest('[data-reader-book-card]');
  if (book && event.target.closest('[data-delete-book]')) return;
  if (book) {
    startLongPress(book, 'book', Number(book.dataset.readerBookIndex), event);
    try { if (event.pointerId != null) book.setPointerCapture?.(event.pointerId); } catch {}
  }
  else if (state.tool === 'reader' && state.readerMode === 'library') clearReaderDeleteMode();
});
workspace.addEventListener('pointerup', endLongPress);
workspace.addEventListener('pointercancel', endLongPress);
document.addEventListener('pointermove', updateReorderDrag, { passive: false });
document.addEventListener('pointermove', updateReaderBookDrag, { passive: false });
document.addEventListener('pointermove', updateNavigationDrag, { passive: false });
document.addEventListener('pointermove', updateNavigationDialogLongPress, { passive: true });
document.addEventListener('pointerup', (event) => { if (finishReorderDrag(event) || finishReaderBookDrag(event)) endLongPress(); }, { passive: false });
document.addEventListener('pointerup', (event) => { finishNavigationDrag(event); }, { passive: false });
document.addEventListener('pointerup', (event) => { finishNavigationDialogLongPress(event); }, { passive: false });
document.addEventListener('pointerdown', (event) => {
  if (state.tool !== 'reader' || state.readerMode !== 'library') return;
  if (event.target.closest('[data-reader-book-card], [data-reader-layout-toggle], [data-open-reader-file]')) return;
  clearReaderDeleteMode();
}, true);
document.querySelector('main')?.addEventListener('pointerdown', beginPageSwipe);
document.addEventListener('pointermove', updatePageSwipe, { passive: false });
document.addEventListener('pointerup', finishPageSwipe, { passive: true });
document.addEventListener('pointercancel', () => {
  tabSwipeGesture = null; pageSwipeGesture = null;
  if (readerSurfaceGesture?.dragging) settleReaderPageDrag(readerSurfaceGesture, 0, true);
  readerSurfaceGesture = null;
  endLongPress(); cancelReorderDrag();
  if (navigationDrag) { restoreNavigationDrag(navigationDrag); navigationDrag = null; }
  endNavigationLongPress(); cancelNavigationDialogLongPress(); clearNavigationDragClasses(); swipeGesture = null; resetPageSwipeTransform();
  if (readerBookDrag) {
    releaseReaderBookPointer(readerBookDrag);
    readerBookDrag.over?.classList.remove('reorder-over');
    readerBookDrag.target.classList.remove('reader-book-dragging', 'reader-delete-ready', 'reorder-hold');
    readerBookDrag = null;
    if (reorderTarget?.type === 'book') reorderTarget = null;
  }
}, { passive: true });
workspace.addEventListener('pointerdown', (event) => {
  const surface = event.target.closest('[data-reader-surface]');
  if (state.readerMode === 'reading' && surface) {
    state.readerSelectionInput = event.pointerType === 'touch' ? 'touch' : 'mouse';
    readerSurfaceGesture = { surface, x: event.clientX, y: event.clientY, pointerId: event.pointerId, pointerType: event.pointerType, startedAt: Date.now() };
    // Do not capture a touch pointer on selectable reader text. iOS Safari
    // uses the native target to complete long-press selection; capturing it
    // here retargets the selection/callout sequence to the article and makes
    // the browser's copy menu disappear. The document-level pointerup below
    // still receives the gesture when it leaves the surface.
  }
});
workspace.addEventListener('touchstart', (event) => {
  if (readerSurfaceGesture || state.readerMode !== 'reading') return;
  const surface = event.target.closest('[data-reader-surface]');
  const touch = event.touches[0];
  if (surface && touch) readerSurfaceGesture = { surface, x: touch.clientX, y: touch.clientY, pointerId: null, pointerType: 'touch', startedAt: Date.now() };
}, { passive: true });
let readerSurfaceTapSuppressClickUntil = 0;
function suppressReaderPageNativePan(event) {
  const gesture = readerSurfaceGesture;
  if (!gesture || state.readerMode !== 'reading' || state.readerReadingMode !== 'pages') return;
  const pointerType = event.pointerType || gesture.pointerType;
  if (pointerType !== 'touch') return;
  // iOS Safari owns long-press text selection. Do not cancel a touch move
  // that started on reader text; even small finger drift before the long-press
  // threshold can otherwise abort WebKit's selection/callout pipeline.
  if (isIosSafariBrowser() && event.target.closest?.('[data-reader-content]')) return;
  const point = event.touches?.[0] || event;
  const dx = point.clientX - gesture.x;
  const dy = point.clientY - gesture.y;
  // Let a held text selection take over after the long-press threshold. Before
  // that, only cancel a clearly vertical drift; cancelling every move also
  // cancels WebKit's native long-press selection pipeline.
  if (Date.now() - gesture.startedAt < 320 && Math.abs(dy) > 8 && Math.abs(dy) > Math.abs(dx) + 4 && event.cancelable) {
    event.preventDefault();
  }
}
function readerPageDragOffset(gesture, dx) {
  const viewport = gesture.viewport || gesture.surface?.closest('.reader-page-viewport');
  const flow = gesture.flow || viewport?.querySelector('.reader-page-flow');
  if (!viewport || !flow) return null;
  const width = gesture.width || Math.max(1, viewport.clientWidth);
  const count = gesture.count || readerPageCount(viewport);
  const current = gesture.page;
  const limit = width * .96;
  let movement = Math.max(-limit, Math.min(limit, dx));
  if ((current <= 0 && movement > 0) || (current >= count - 1 && movement < 0)) movement *= .22;
  return { viewport, flow, width, count, offset: -current * width + movement };
}
let readerPageDragFrame = 0;
let readerPageDragPending = null;
function flushReaderPageDrag() {
  readerPageDragFrame = 0;
  const pending = readerPageDragPending;
  readerPageDragPending = null;
  const gesture = readerSurfaceGesture;
  if (!pending || !gesture || gesture !== pending.gesture || !gesture.dragging || gesture.cancelled) return;
  const drag = readerPageDragOffset(gesture, pending.dx);
  if (!drag) return;
  const transform = 'translate3d(' + drag.offset + 'px, 0, 0)';
  // Keep the gesture on the compositor. Safari can dispatch several input
  // events before a paint; coalescing them prevents duplicate style commits.
  drag.flow.style.transform = transform;
}
function updateReaderPageDrag(event) {
  const gesture = readerSurfaceGesture;
  if (!gesture || gesture.pointerType !== 'touch' || state.readerMode !== 'reading' || state.readerReadingMode !== 'pages') return;
  if (gesture.pointerId != null && event.pointerId != null && event.pointerId !== gesture.pointerId) return;
  const point = event.touches?.[0] || event;
  const dx = point.clientX - gesture.x; const dy = point.clientY - gesture.y;
  if (readerHasLiveSelection()) {
    if (!gesture.cancelled) {
      if (gesture.dragging) setReaderPagePosition(gesture.page, 'smooth');
      gesture.cancelled = true;
    }
    return;
  }
  if (!gesture.dragging) {
    if (Date.now() - gesture.startedAt > 320) return;
    if (Math.abs(dy) > Math.abs(dx) + 10 && Math.abs(dy) > 8) { gesture.cancelled = true; return; }
    if (Math.abs(dx) < 10 || Math.abs(dx) <= Math.abs(dy) + 8) return;
    const viewport = gesture.surface?.closest('.reader-page-viewport');
    const flow = viewport?.querySelector('.reader-page-flow');
    if (!viewport || !flow) return;
    ensureReaderPageColumns(viewport, flow);
    gesture.page = state.readerPage;
    gesture.viewport = viewport;
    gesture.flow = flow;
    gesture.width = Math.max(1, viewport.clientWidth);
    gesture.count = readerPageCount(viewport);
    gesture.dragging = true;
    gesture.dragStartedAt = Date.now();
  }
  const drag = readerPageDragOffset(gesture, dx);
  if (!drag) return;
  if (!gesture.dragFramePrepared) {
    drag.flow.style.transition = 'none';
    drag.flow.style.webkitTransition = 'none';
    gesture.dragFramePrepared = true;
  }
  readerPageDragPending = { gesture, dx };
  if (!readerPageDragFrame) readerPageDragFrame = requestAnimationFrame(flushReaderPageDrag);
  if (event.cancelable) event.preventDefault();
}
function settleReaderPageDrag(gesture, dx, cancelled = false) {
  if (!gesture?.dragging) return false;
  if (readerPageDragPending?.gesture === gesture) {
    readerPageDragPending = null;
    if (readerPageDragFrame) cancelAnimationFrame(readerPageDragFrame);
    readerPageDragFrame = 0;
  }
  const drag = readerPageDragOffset(gesture, dx);
  if (!drag) return false;
  const elapsed = Math.max(1, Date.now() - (gesture.dragStartedAt || gesture.startedAt));
  const velocity = Math.abs(dx) / elapsed;
  const threshold = Math.max(56, Math.min(112, drag.width * .18));
  const direction = dx < 0 ? 1 : -1;
  const targetPage = gesture.page + direction;
  const commit = !cancelled && (Math.abs(dx) >= threshold || (velocity >= .55 && Math.abs(dx) >= 18)) && targetPage >= 0 && targetPage < drag.count;
  swipeSuppressClickUntil = Date.now() + 520;
  const prefersReducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  const behavior = state.readerPreferences.pageAnimation !== 'none' && !prefersReducedMotion ? 'smooth' : 'instant';
  setReaderPagePosition(commit ? targetPage : gesture.page, behavior);
  return true;
}
workspace.addEventListener('pointermove', suppressReaderPageNativePan, { passive: false });
document.addEventListener('pointermove', updateReaderPageDrag, { passive: false });
// iOS Safari with Pointer Events also emits touchmove for the same gesture.
// Listening to both paths makes one finger movement update the track twice.
// Keep touchmove only for older engines without Pointer Events.
if (!('PointerEvent' in window)) {
  workspace.addEventListener('touchmove', suppressReaderPageNativePan, { passive: false });
  document.addEventListener('touchmove', updateReaderPageDrag, { passive: false });
}
function finishReaderSurfaceGesture(clientX, clientY, target) {
  const gesture = readerSurfaceGesture; readerSurfaceGesture = null;
  if (!gesture || state.readerMode !== 'reading') return;
  const dx = clientX - gesture.x; const dy = clientY - gesture.y;
  if (gesture.dragging) {
    settleReaderPageDrag(gesture, dx, readerHasLiveSelection());
    return;
  }
  const targetElement = target instanceof Element ? target : null;
  const onInteractiveControl = targetElement?.closest('a,button,input,textarea,select,[data-reader-comment-id],[data-reader-selection-menu],[data-reader-comment-popover]');
  // A native text selection can move more than a tap while its handles are
  // being adjusted. Never reinterpret that gesture as a page turn.
  if (onInteractiveControl || readerHasLiveSelection() || Date.now() < readerSelectionSuppressUntil) return;
  if (state.readerReadingMode === 'scroll' && isIosSafariBrowser() && state.readerImmersive && Math.abs(dx) <= 12 && Math.abs(dy) <= 12) {
    readerSurfaceTapSuppressClickUntil = Date.now() + 500;
    toggleReaderChrome();
    return;
  }
  if (state.readerReadingMode !== 'pages') return;
  if (Math.abs(dx) <= 12 && Math.abs(dy) <= 12) {
    // A tap is a chrome toggle in paged reading. Page turns are deliberately
    // reserved for a horizontal swipe (or the explicit corner buttons), so a
    // light tap can never become a vertical browser scroll or a fake turn.
    readerSurfaceTapSuppressClickUntil = Date.now() + 500;
    if (state.readerImmersive) toggleReaderChrome();
    else toggleReaderFullscreen();
    return;
  }
  if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) + 15) {
    // Always swallow the synthetic click produced at the end of a drag. This
    // is essential for mouse text selection, where no page turn is scheduled
    // but the click would otherwise toggle the reader chrome.
    swipeSuppressClickUntil = Date.now() + 500;
    // A mouse drag over text is a selection gesture, not a page swipe. On
    // touch, a long press followed by movement is likewise selection; only a
    // short touch drag is eligible for page navigation.
    if (gesture.pointerType !== 'touch' || Date.now() - gesture.startedAt > 300) return;
    // Safari dispatches selectionchange just after pointerup for a drag that
    // started on selectable text. Suppress the synthetic click immediately,
    // then decide whether this was a page swipe after the selection has had a
    // chance to settle.
    const direction = dx < 0 ? 1 : -1;
    window.setTimeout(() => {
      if (readerHasLiveSelection() || Date.now() < readerSelectionSuppressUntil) return;
      if (state.readerMode === 'reading' && state.readerReadingMode === 'pages') turnReaderPage(direction);
    }, 70);
  }
}
document.addEventListener('pointerup', (event) => {
  finishReaderSurfaceGesture(event.clientX, event.clientY, event.target);
  // WebKit queues selectionchange after pointerup. Give that native range a
  // few bounded ticks to settle, then mirror it into the OneBox action bar.
  scheduleReaderNativeSelectionMenuSync();
}, { passive: true });
document.addEventListener('touchend', () => {
  // Some iOS versions complete the native Range on touchend without a
  // corresponding pointerup after the page gesture recognizer intervenes.
  scheduleReaderNativeSelectionMenuSync();
}, { capture: true, passive: true });
workspace.addEventListener('touchend', (event) => {
  if (!readerSurfaceGesture || readerSurfaceGesture.pointerId !== null) return;
  const touch = event.changedTouches[0];
  if (touch) finishReaderSurfaceGesture(touch.clientX, touch.clientY, event.target);
  scheduleReaderNativeSelectionMenuSync();
}, { passive: true });
workspace.addEventListener('dragstart', (event) => { const card = event.target.closest('[data-weather-card]'); if (card) event.dataTransfer.setData('text/plain', card.dataset.weatherIndex); });
workspace.addEventListener('dragover', (event) => { if (event.target.closest('[data-weather-card]')) event.preventDefault(); });
workspace.addEventListener('drop', (event) => { event.preventDefault(); const card = event.target.closest('[data-weather-card]'); if (card) swapWeatherCards(Number(event.dataTransfer.getData('text/plain')), Number(card.dataset.weatherIndex)); });
workspace.addEventListener('dragstart', (event) => { const source = event.target.closest('[data-feed-source]'); if (source) event.dataTransfer.setData('text/plain', source.dataset.feedSourceIndex); });
workspace.addEventListener('dragover', (event) => { if (event.target.closest('[data-feed-source]')) event.preventDefault(); });
workspace.addEventListener('drop', (event) => { event.preventDefault(); const source = event.target.closest('[data-feed-source]'); if (source) swapHomeFeedSources(Number(event.dataTransfer.getData('text/plain')), Number(source.dataset.feedSourceIndex)); });
workspace.addEventListener('contextmenu', (event) => {
  const navigationItem = event.target.closest('[data-navigation-item]');
  if (navigationItem && (state.section === 'navigation' || (state.section === 'tools' && state.tool === 'navigation'))) {
    // Navigation cards own the long-press gesture. Prevent Safari/Chrome from
    // replacing the app action sheet with their native callout menu.
    event.preventDefault();
    event.stopPropagation();
    return;
  }
  if (state.readerMode !== 'reading') return;
  const selection = window.getSelection();
  // Safari may retarget the long-press contextmenu to the fixed reader shell
  // rather than the text node that owns the native Range. Resolve the reader
  // root independently and only intercept when the live selection belongs to
  // it; otherwise leave Safari's native selection callout untouched.
  const content = $('[data-reader-content]');
  const range = selection?.rangeCount && !selection.isCollapsed ? selection.getRangeAt(0) : null;
  const inside = (node) => Boolean(node && content && (node === content || content.contains(node)));
  const hasSelection = Boolean(range && content && (inside(range.commonAncestorContainer) || (inside(range.startContainer) && inside(range.endContainer))));
  // Do not cancel an empty contextmenu on Safari. iOS uses this event as part
  // of the long-press-to-select sequence; cancelling it before a Range exists
  // removes the native selection handles and leaves no action bar to use.
  if (!hasSelection) return;
  event.preventDefault();
  event.stopPropagation();
  readerShowSelectionMenu(range);
  scheduleReaderNativeSelectionMenuSync();
});
workspace.addEventListener('click', async (event) => {
  if (Date.now() < reorderSuppressClickUntil || Date.now() < pageSwipeSuppressClickUntil) { event.preventDefault(); return; }
  const navigationPage = state.section === 'navigation' || (state.section === 'tools' && state.tool === 'navigation');
  if (navigationPage && !event.target.closest('[data-navigation-item]')) clearNavigationActionCards();
  if (Date.now() < navigationSuppressClickUntil && event.target.closest('[data-navigation-item]') && !event.target.closest('[data-navigation-delete], [data-navigation-edit]')) { event.preventDefault(); return; }
  if (Date.now() < readerBookSuppressClickUntil && event.target.closest('[data-reader-book-card]')) { event.preventDefault(); return; }
  if (Date.now() < swipeSuppressClickUntil && event.target.closest('[data-swipe-row]') && !event.target.closest('.swipe-delete')) return;
  if (Date.now() < swipeSuppressClickUntil && state.readerMode === 'reading') { event.preventDefault(); event.stopPropagation(); return; }
  const readerSelectionControl = event.target.closest('[data-reader-selection-action], [data-reader-comment-popover], [data-reader-comment-id]');
  const readerSelectionSafeControl = event.target.closest('[data-reader-settings], [data-reader-toc], [data-reader-comments], [data-reader-fullscreen], [data-close-reader], [data-reader-page-prev], [data-reader-page-next], [data-reader-chapter-prev], [data-reader-chapter-next]');
  if (state.readerMode === 'reading' && readerHasLiveSelection() && !readerSelectionControl && !readerSelectionSafeControl) {
    // Safari may leave the application anchor alive for one selectionchange
    // tick after the native range has collapsed. Do not let that stale anchor
    // block the next toolbar tap; an actual native range still protects the
    // selection from accidental page gestures.
    if (!readerNativeSelectionRange() && $('[data-reader-selection-menu]')?.hidden !== false) {
      clearReaderSelectionState();
      hideReaderSelectionMenu();
    } else {
      event.preventDefault(); event.stopPropagation(); return;
    }
  }
  if (state.tool === 'reader' && state.readerMode === 'library' && !event.target.closest('[data-reader-book-card]')) clearReaderDeleteMode();
  const section = event.target.closest('[data-section]');
  if (section) return selectSection(section.dataset.section);
  const homeTool = event.target.closest('[data-home-tool]');
  if (homeTool) return selectTool(homeTool.dataset.homeTool);
  if (event.target.closest('[data-open-navigation-settings]')) {
    state.navigationSettingsOpen = !state.navigationSettingsOpen;
    clearNavigationActionCards();
    return syncNavigationSettingsPopover(event.target.closest('[data-open-navigation-settings]'));
  }
  const navigationOpenMode = event.target.closest('[data-navigation-open-mode]');
  if (navigationOpenMode) {
    state.openMode = navigationOpenMode.dataset.navigationOpenMode === 'new-tab' ? 'new-tab' : 'current';
    saveStored(STORAGE.openMode, state.openMode);
    state.navigationSettingsOpen = false;
    // The opening mode is part of each card's anchor markup. Re-render the
    // navigation surface so target="_blank" is applied immediately instead
    // of only taking effect after a later route change.
    return render();
  }
  if (event.target.closest('[data-open-navigation-add]')) return openNavigationAddDialog();
  const navigationOpenAction = event.target.closest('[data-navigation-open-action]');
  if (navigationOpenAction) {
    event.preventDefault(); event.stopPropagation();
    const card = navigationOpenAction.closest('[data-navigation-item]');
    state.navigationSettingsOpen = false;
    if (card?.dataset.navigationType === 'folder') return openNavigationFolderDialog(card.dataset.navigationId);
    const link = card?.querySelector('[data-navigation-open-site]');
    if (link) return openNavigationSite(link);
    return;
  }
  const navigationPrimary = event.target.closest('[data-navigation-open-site], [data-navigation-open-folder]');
  if (navigationPrimary) {
    if (navigationPrimary.matches('[data-navigation-open-site]') && navigationPrimary.target === '_blank') {
      state.navigationSettingsOpen = false;
      // Let the real anchor perform the new-tab navigation. Safari treats
      // this native user-gesture path more reliably than a delegated
      // preventDefault() followed by window.open().
      return;
    }
    event.preventDefault(); event.stopPropagation();
    const card = navigationPrimary.closest('[data-navigation-item]');
    if (navigationPrimary.matches('[data-navigation-open-folder]')) return openNavigationFolderDialog(card.dataset.navigationId);
    return openNavigationSite(card.querySelector('[data-navigation-open-site]') || navigationPrimary);
  }
  const navigationEdit = event.target.closest('[data-navigation-edit]');
  if (navigationEdit) {
    event.preventDefault(); event.stopPropagation();
    return openNavigationEditDialog(navigationEdit.dataset.navigationEdit, navigationEdit.closest('[data-navigation-folder-id]')?.dataset.navigationFolderId || '');
  }
  const navigationDelete = event.target.closest('[data-navigation-delete]');
  if (navigationDelete) {
    event.preventDefault(); event.stopPropagation();
    return deleteNavigationSite(navigationDelete.dataset.navigationDelete, navigationDelete.closest('[data-navigation-folder-id]')?.dataset.navigationFolderId || '');
  }
  const navigationSiteLink = event.target.closest('[data-navigation-open-site]');
  if (navigationSiteLink) {
    if (navigationSiteLink.target === '_blank') return;
    event.preventDefault(); event.stopPropagation();
    state.navigationSettingsOpen = false;
    return openNavigationSite(navigationSiteLink);
  }
  const navigationFolder = event.target.closest('[data-navigation-open-folder]');
  if (navigationFolder) {
    event.preventDefault(); event.stopPropagation();
    state.navigationSettingsOpen = false;
    return openNavigationFolderDialog(navigationFolder.dataset.navigationOpenFolder);
  }
  if (event.target.closest('[data-reader-layout-toggle]')) {
    state.readerLayout = state.readerLayout === 'list' ? 'grid' : 'list';
    saveReaderLayout(); return render();
  }
  const feedSource = event.target.closest('[data-feed-source]');
  if (feedSource) {
    if (Date.now() < tabSwipeSuppressClickUntil) { event.preventDefault(); return; }
    if (feedSource.dataset.feedSourceIndex != null && handleReorderClick(feedSource, 'feed', Number(feedSource.dataset.feedSourceIndex))) { event.preventDefault(); return; }
    return selectHomeFeedSource(feedSource.dataset.feedSource);
  }
  if (event.target.closest('[data-refresh-feeds]')) return loadHomeFeeds(true);
  const feedItem = event.target.closest('[data-feed-link]');
  const feedLink = feedItem?.dataset.feedLink;
  if (feedItem) {
    if (feedLink) {
      if (openFeedLink(feedLink)) { markFeedRead(feedItem.dataset.feedId); feedItem.classList.add('is-read'); }
    } else toast(state.language === 'en' ? 'This article link is unavailable' : '这篇文章暂时没有可用链接', 'error');
    return;
  }
  if (state.readerMode === 'reading') {
    const selectionAction = event.target.closest('[data-reader-selection-action]');
    if (selectionAction) { await applyReaderSelectionAction(selectionAction.dataset.readerSelectionAction); return; }
    const commentMarker = event.target.closest('[data-reader-comment-id]');
    if (commentMarker) { showReaderCommentPopover(commentMarker.dataset.readerCommentId, commentMarker); return; }
    if (!event.target.closest('[data-reader-comment-popover]')) hideReaderCommentPopover();
    if (event.target.closest('[data-reader-chapter-prev]')) { goReaderChapter(-1); return; }
    if (event.target.closest('[data-reader-chapter-next]')) { goReaderChapter(1); return; }
    if (event.target.closest('[data-reader-background]')) { openReaderDialog('background'); return; }
    if (event.target.closest('[data-reader-animation]')) { openReaderDialog('animation'); return; }
    if (event.target.closest('[data-reader-comments]')) { openReaderDialog('comments'); return; }
    if (event.target.closest('[data-reader-fullscreen]')) { toggleReaderFullscreen(); return; }
    const surface = event.target.closest('[data-reader-surface]');
    if (surface && !event.target.closest('a,button,input,textarea,select')) {
      if (Date.now() < readerSurfaceTapSuppressClickUntil) return;
      if (Date.now() < swipeSuppressClickUntil) return;
      /* Safari webpage fullscreen has no native reader chrome layer. A tap
         on the reading surface must therefore be the same chrome toggle as
         the standalone PWA, even when the book is using the paged renderer;
         horizontal page turns remain available through an actual swipe. */
      if (isIosSafariBrowser() && state.readerImmersive) {
        toggleReaderChrome();
      } else if (state.readerReadingMode === 'pages' && surface.classList.contains('reader-page-viewport')) {
        const rect = surface.getBoundingClientRect(); const x = event.clientX - rect.left;
        if (x < rect.width * .32) turnReaderPage(-1);
        else if (x > rect.width * .68) turnReaderPage(1);
        else if (state.readerImmersive) toggleReaderChrome();
        else toggleReaderFullscreen();
      } else if (state.readerImmersive) toggleReaderChrome();
      else toggleReaderFullscreen();
      return;
    }
  }
  if (event.target.closest('[data-open-reader-file]')) { $('#readerFileInput')?.click(); return; }
  if (event.target.closest('[data-reader-toc]')) { openReaderDialog('toc'); return; }
  if (event.target.closest('[data-reader-settings]')) { openReaderDialog('settings'); return; }
  if (event.target.closest('[data-close-reader]')) return closeReader();
  const readerMode = event.target.closest('[data-reader-mode]');
  if (readerMode) {
    setReaderReadingMode(readerMode.dataset.readerMode);
    return;
  }
  const readerPageButton = event.target.closest('[data-reader-page-prev], [data-reader-page-next]');
  if (readerPageButton) {
    const direction = readerPageButton.hasAttribute('data-reader-page-next') ? 1 : -1;
    turnReaderPage(direction);
    return;
  }
  const deleteBook = event.target.closest('[data-delete-book]');
  if (deleteBook) {
    event.preventDefault();
    event.stopPropagation();
    if (!window.confirm(t('deleteConfirm'))) return;
    state.library = state.library.filter((book) => book.id !== deleteBook.dataset.deleteBook); await oneBoxDbDelete('books', deleteBook.dataset.deleteBook); saveLibrary(); render(); return;
  }
  const bookCard = event.target.closest('[data-reader-book-card]');
  if (bookCard && handleReorderClick(bookCard, 'book', Number(bookCard.dataset.readerBookIndex))) { event.preventDefault(); return; }
  // A touch drag keeps pointer capture on the card so the browser cannot
  // steal the gesture for page scrolling. In that case the synthetic click
  // can target the article instead of its inner open button; resolve the
  // button from the card as a fallback so a normal tap still opens the book.
  const openReader = event.target.closest('[data-open-reader]') || event.target.closest('[data-reader-book-card]')?.querySelector('[data-open-reader]');
  if (openReader) return openReaderBook(openReader.dataset.openReader);
  if (event.target.closest('[data-annotate-selection]')) return renderAnnotationDialog();
  const deleteAnnotation = event.target.closest('[data-delete-annotation]');
  if (deleteAnnotation) {
    const book = readerBookById(state.readerBookId); if (book) { book.annotations = (book.annotations || []).filter((note) => note.id !== deleteAnnotation.dataset.deleteAnnotation); saveLibrary(); render(); }
    return;
  }
  if (event.target.closest('[data-open-settings-page]')) return renderSettings();
  if (event.target.closest('[data-check-update]')) return checkForUpdate();
  if (event.target.closest('[data-apply-update]')) return applyUpdate();
  if (event.target.closest('[data-open-github-page]')) return renderGithubDialog();
  if (event.target.closest('[data-open-recent-reading]')) return renderRecentReading();
  if (event.target.closest('[data-open-agreement-page]')) return renderAgreementDialog();
  const messageDelete = event.target.closest('[data-delete-notification]');
  if (messageDelete) { state.notifications = state.notifications.filter((item) => item.id !== messageDelete.dataset.deleteNotification); saveNotifications(); render(); return; }
  if (event.target.closest('[data-mark-notifications-read]')) { state.notifications.forEach((item) => { item.read = true; }); saveNotifications(); render(); return; }
  const key = event.target.closest('[data-key]');
  if (key) return calculatorKey(key.dataset.key);
  const scienceKey = event.target.closest('[data-science-key]');
  if (scienceKey) { state.calcJustEvaluated = false; state.calcExpr += scienceKey.dataset.scienceKey; saveCalculator(); return render(); }
  if (event.target.closest('[data-answer]')) { state.calcJustEvaluated = false; state.calcExpr += state.calcHistory[0]?.result || calcPreview(); saveCalculator(); return render(); }
  if (event.target.closest('[data-toggle-inverse]')) { state.calcInverse = !state.calcInverse; return render(); }
  if (event.target.closest('[data-toggle-calc-history]')) { state.calcHistoryOpen = !state.calcHistoryOpen; saveCalculator(); return render(); }
  if (event.target.closest('[data-toggle-angle]')) { state.calcAngle = state.calcAngle === 'deg' ? 'rad' : 'deg'; return render(); }
  const history = event.target.closest('[data-history-expression]');
  if (history) { state.calcExpr = history.dataset.historyExpression || ''; state.calcJustEvaluated = false; saveCalculator(); return render(); }
  const deleteCalcHistory = event.target.closest('[data-delete-calc-history]');
  if (deleteCalcHistory) { state.calcHistory = state.calcHistory.filter((item) => String(item.id || item.at || item.expression) !== deleteCalcHistory.dataset.deleteCalcHistory); saveCalculator(); return render(); }
  if (event.target.closest('[data-clear-calc-history]')) { state.calcHistory = []; saveCalculator(); return render(); }
  if (event.target.closest('[data-open-event-dialog]')) return renderEventDialog();
  const month = event.target.closest('[data-month]');
  if (month) { state.month = new Date(state.month.getFullYear(), state.month.getMonth() + Number(month.dataset.month), 1); return render(); }
  if (event.target.closest('[data-today]')) { state.month = new Date(today.getFullYear(), today.getMonth(), 1); state.selectedDate = dateKey(today); return render(); }
  const day = event.target.closest('[data-date]');
  if (day) {
    const now = Date.now();
    const repeated = state.lastCalendarTap.key === day.dataset.date && now - state.lastCalendarTap.at < 650;
    state.lastCalendarTap = { key: day.dataset.date, at: now };
    state.selectedDate = day.dataset.date;
    if (day.dataset.outside === 'true') { const date = dateFromKey(day.dataset.date); state.month = new Date(date.getFullYear(), date.getMonth(), 1); }
    render();
    if (repeated) renderLunarDialog(day.dataset.date);
    return;
  }
  const deleteEvent = event.target.closest('[data-delete-event]');
  if (deleteEvent) {
    Object.keys(state.events).forEach((day) => { state.events[day] = (state.events[day] || []).filter((item) => item.id !== deleteEvent.dataset.deleteEvent); if (!state.events[day].length) delete state.events[day]; });
    saveEvents(); syncAgendaReminders(); scheduleNotificationCheck(); return render();
  }
  const weatherResult = event.target.closest('[data-weather-result-index]');
  if (weatherResult) return addWeatherPlace(state.weatherSearchResults[Number(weatherResult.dataset.weatherResultIndex)]);
  const deleteWeather = event.target.closest('[data-delete-weather]');
  if (deleteWeather) {
    event.preventDefault(); event.stopPropagation();
    const id = deleteWeather.dataset.deleteWeather;
    state.weatherCards = state.weatherCards.filter((card) => card.id !== id);
    if (state.activeWeatherId === id) state.activeWeatherId = state.weatherCards[0]?.id || null;
    reorderTarget = null; saveWeatherCards(); return render();
  }
  const weatherCard = event.target.closest('[data-weather-card]');
  if (weatherCard) {
    if (handleReorderClick(weatherCard, 'weather', Number(weatherCard.dataset.weatherIndex))) { event.preventDefault(); return; }
    state.activeWeatherId = weatherCard.dataset.weatherCard; return render();
  }
  if (event.target.closest('[data-add-weather-card]')) { $('#cityInput')?.focus(); return toast(state.language === 'en' ? 'Search a city or district to add a card' : '搜索城市或区县即可添加天气卡片'); }
  if (event.target.closest('[data-locate]')) {
    if (!navigator.geolocation) return toast(state.language === 'en' ? 'Geolocation is unavailable' : '当前浏览器不支持定位', 'error');
    state.weatherLoading = true; render();
    return navigator.geolocation.getCurrentPosition(async (position) => addWeatherPlace(await reverseGeocode(position.coords.latitude, position.coords.longitude)), () => { state.weatherLoading = false; state.weatherError = state.language === 'en' ? 'Location permission was denied' : '无法获取当前位置，请检查浏览器权限'; render(); });
  }
  if (event.target.closest('[data-swap]')) { [conversion.from, conversion.to] = [conversion.to, conversion.from]; return render(); }
  if (event.target.closest('[data-swap-language]')) {
    const source = state.translation.source === 'auto' ? 'en' : state.translation.source;
    const target = state.translation.target === 'auto' ? 'en' : state.translation.target;
    state.translation.source = target; state.translation.target = source; return render();
  }
  if (event.target.closest('[data-copy-conversion]')) {
    const value = formatNumber(convertedValue()) + ' ' + units[conversion.category].units[conversion.to][1];
    try { await navigator.clipboard.writeText(value); const copyStatus = $('#copyStatus'); if (copyStatus) copyStatus.textContent = t('copied'); } catch { toast(state.language === 'en' ? 'Clipboard access was denied' : '浏览器不允许访问剪贴板，请手动复制', 'error'); }
    return;
  }
  if (event.target.closest('[data-copy-translation]')) {
    if (!state.translation.result) return;
    try { await navigator.clipboard.writeText(state.translation.result); toast(t('copied')); } catch { toast(state.language === 'en' ? 'Clipboard access was denied' : '浏览器不允许访问剪贴板，请手动复制', 'error'); }
    return;
  }
  if (event.target.closest('[data-translate-submit]')) return translateText();
  if (event.target.closest('[data-toggle-translation-history]')) { state.translationHistoryOpen = !state.translationHistoryOpen; saveStored(STORAGE.translationHistoryOpen, state.translationHistoryOpen); return render(); }
  const translationHistory = event.target.closest('[data-translation-history]');
  if (translationHistory) {
    const item = state.translationHistory.find((entry) => entry.id === translationHistory.dataset.translationHistory);
    if (item) { state.translation.source = item.source; state.translation.target = item.target; state.translation.input = item.input; state.translation.result = item.result; render(); }
    return;
  }
  const deleteTranslation = event.target.closest('[data-delete-translation]');
  if (deleteTranslation) { state.translationHistory = state.translationHistory.filter((item) => item.id !== deleteTranslation.dataset.deleteTranslation); saveTranslationHistory(); return render(); }
  if (event.target.closest('[data-clear-translation-history]')) { state.translationHistory = []; saveTranslationHistory(); return render(); }
});
document.addEventListener('click', (event) => {
  const navigationPage = state.section === 'navigation' || (state.section === 'tools' && state.tool === 'navigation');
  if (!navigationPage || event.target.closest('#workspace[data-tool="navigation"] [data-navigation-item], #workspace[data-tool="navigation"] [data-open-navigation-add], [data-open-navigation-settings], .navigation-settings-popover, #navigationDialog')) return;
  if (state.navigationSettingsOpen) { state.navigationSettingsOpen = false; syncNavigationSettingsPopover(); }
  clearNavigationActionCards();
});
workspace.addEventListener('dblclick', (event) => {
  const day = event.target.closest('[data-date]');
  if (day && state.section === 'tools' && state.tool === 'calendar') { event.preventDefault(); renderLunarDialog(day.dataset.date); }
});
workspace.addEventListener('input', (event) => {
  if (event.target.id === 'conversionValue') { conversion.value = event.target.value; const output = $('.conversion-result strong'); if (output) output.textContent = formatNumber(convertedValue()); }
  if (event.target.id === 'translationInput') state.translation.input = event.target.value;
});
workspace.addEventListener('change', (event) => {
  if (event.target.id === 'readerFileInput') { importReaderFiles(event.target.files); return; }
  if (event.target.id === 'conversionCategory') { conversion.category = event.target.value; conversion.from = 0; conversion.to = 1; return render(); }
  if (event.target.id === 'fromUnit') { conversion.from = Number(event.target.value); return render(); }
  if (event.target.id === 'toUnit') { conversion.to = Number(event.target.value); return render(); }
  if (event.target.id === 'translationSource') { state.translation.source = event.target.value; return render(); }
  if (event.target.id === 'translationTarget') { state.translation.target = event.target.value; return render(); }
});
workspace.addEventListener('submit', (event) => {
  event.preventDefault();
  if (event.target.id === 'weatherSearch') {
    const query = $('#cityInput')?.value.trim() || '';
    return query ? searchWeather(query) : refreshWeatherCard(state.weatherCards.find((item) => item.id === state.activeWeatherId));
  }
});

$('#eventDialog').addEventListener('click', (event) => {
  if (event.target === $('#eventDialog') || event.target.closest('[data-close-event-dialog]')) closeEventDialog();
});
$('#eventDialog').addEventListener('change', (event) => {
  if (event.target.id === 'eventDateTime') syncEventDateTimeFields();
  if (event.target.id === 'eventRepeat') {
    const weekly = $('.event-weekdays-field', $('#eventDialog')); if (weekly) weekly.hidden = event.target.value !== 'weekly';
    const time = $('#eventTime'); if (time) time.required = event.target.value !== 'once';
  }
});
$('#eventDialog').addEventListener('input', (event) => {
  if (event.target.id === 'eventDateTime') syncEventDateTimeFields();
});
$('#eventDialog').addEventListener('submit', (event) => {
  event.preventDefault();
  if (event.target.id !== 'eventForm') return;
  syncEventDateTimeFields();
  const title = $('#eventTitle').value.trim(); if (!title) return;
  const key = $('#eventDate').value || state.selectedDate; const repeat = $('#eventRepeat')?.value || 'once'; const time = $('#eventTime').value;
  if (repeat !== 'once' && !time) return toast(state.language === 'en' ? 'Choose a reminder time for a repeating event' : '周期性日程需要选择提醒时间', 'error');
  const weekdays = repeat === 'weekly' ? $$('input[name="eventWeekday"]', $('#eventDialog')).filter((input) => input.checked).map((input) => Number(input.value)) : [];
  if (repeat === 'weekly' && !weekdays.length) return toast(state.language === 'en' ? 'Choose at least one weekday' : '请至少选择一个星期', 'error');
  state.events[key] ||= [];
  state.events[key].push({ id: uid(), title, time, repeat, weekdays, createdAt: Date.now() });
  state.selectedDate = key;
  const selectedDate = dateFromKey(key); state.month = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
  saveEvents(); syncAgendaReminders(); scheduleNotificationCheck(); closeEventDialog(); render(); toast(state.language === 'en' ? 'Event added' : '日程已添加');
});

$('#lunarDialog').addEventListener('click', (event) => {
  if (event.target === $('#lunarDialog') || event.target.closest('[data-close-lunar-dialog]')) closeLunarDialog();
});

function applyReaderDialogChoice(choice) {
  const group = choice.dataset.readerChoice; const value = choice.dataset.readerChoiceValue;
  if (group === 'readingMode') {
    setReaderReadingMode(value);
    closeReaderDialog();
  } else if (group === 'fontSize') {
    state.readerPreferences.fontSize = Math.min(26, Math.max(15, Number(value) || 18)); saveReaderPreferences(); applyReaderPreferences(); readerDialogMarkup('settings');
  } else if (group === 'lineHeight' || group === 'paragraphSpacing' || group === 'letterSpacing') {
    state.readerPreferences[group] = Number(value); saveReaderPreferences(); applyReaderPreferences(); readerDialogMarkup('settings');
  } else if (group === 'fullscreenOnOpen') {
    state.readerPreferences.fullscreenOnOpen = value === 'true'; saveReaderPreferences(); readerDialogMarkup('settings');
  } else if (group === 'fontFamily' || group === 'pageAnimation') {
    state.readerPreferences[group] = value; saveReaderPreferences(); applyReaderPreferences(); readerDialogMarkup('settings');
  }
  return true;
}

// Fullscreen is also handled during capture. Safari can retarget a click from
// the fixed reader footer while its browser chrome is moving; handling the
// control before the workspace delegation keeps both reader fullscreen entry
// points reliable.
document.addEventListener('click', (event) => {
  const fullscreen = event.target.closest?.('[data-reader-fullscreen]');
  if (!fullscreen) return;
  event.preventDefault();
  event.stopPropagation();
  toggleReaderFullscreen();
}, true);

// Keep settings choices reliable on installed PWAs as well as desktop. Some
// WebKit builds retarget a click from a freshly-rendered modal button to the
// modal surface, so handle the choice during capture before that retargeting
// can swallow the delegated listener below.
document.addEventListener('click', (event) => {
  const dialog = $('#readerDialog');
  const choice = event.target.closest?.('[data-reader-choice]');
  if (!dialog || !choice || !dialog.contains(choice)) return;
  event.preventDefault();
  event.stopImmediatePropagation();
  applyReaderDialogChoice(choice);
}, true);

// Page corners sit above the reading surface and need to remain a direct,
// reliable control on WebKit as well as desktop browsers. Handle them during
// capture so a surface gesture or a retargeted click cannot swallow the turn.
document.addEventListener('click', (event) => {
  const pageButton = event.target.closest?.('[data-reader-page-prev], [data-reader-page-next]');
  if (!pageButton || pageButton.disabled || state.readerMode !== 'reading' || state.readerReadingMode !== 'pages') return;
  event.preventDefault();
  event.stopImmediatePropagation();
  turnReaderPage(pageButton.hasAttribute('data-reader-page-next') ? 1 : -1);
}, true);

$('#readerDialog').addEventListener('click', (event) => {
  if (event.target === $('#readerDialog')) return closeReaderDialog();
  if (event.target.closest('[data-close-reader]')) return closeReader();
  if (event.target.closest('[data-close-reader-dialog]')) return closeReaderDialog();
  const tocItem = event.target.closest('[data-reader-toc-id]');
  if (tocItem) {
    const item = (state.readerToc || []).find((entry) => entry.id === tocItem.dataset.readerTocId && String(entry.section ?? '') === String(tocItem.dataset.readerTocSection ?? '')) || (state.readerToc || []).find((entry) => entry.id === tocItem.dataset.readerTocId);
    return jumpToReaderToc(item);
  }
  const commentItem = event.target.closest('[data-reader-comment-item]');
  if (commentItem) return jumpToReaderComment(commentItem.dataset.readerCommentItem);
  const theme = event.target.closest('[data-reader-theme]');
  if (theme) { state.readerPreferences.theme = theme.dataset.readerTheme; saveReaderPreferences(); applyReaderPreferences(); return readerDialogMarkup(state.readerDialog === 'background' ? 'background' : 'settings'); }
  const choice = event.target.closest('[data-reader-choice]');
  if (choice) return applyReaderDialogChoice(choice);
  const animation = event.target.closest('[data-reader-animation]');
  if (animation) { state.readerPreferences.pageAnimation = animation.dataset.readerAnimation; saveReaderPreferences(); closeReaderDialog(); return; }
  if (event.target.closest('[data-annotate-selection]')) return renderAnnotationDialog();
  const deleteAnnotation = event.target.closest('[data-delete-annotation]');
  if (deleteAnnotation) {
    const book = readerBookById(state.readerBookId); if (book) { book.annotations = (book.annotations || []).filter((note) => note.id !== deleteAnnotation.dataset.deleteAnnotation); saveLibrary(); render(); }
  }
});
$('#readerDialog').addEventListener('input', (event) => { if (event.target.matches('[data-reader-preference]')) readerPreferenceChanged(event.target); });
$('#readerDialog').addEventListener('change', (event) => {
  if (event.target.matches('[data-reader-preference]')) readerPreferenceChanged(event.target);
  if (event.target.matches('[data-reader-reading-mode]')) { closeReaderDialog(); setReaderReadingMode(event.target.value); }
});
workspace.addEventListener('scroll', (event) => {
  scheduleReaderProgress(event.target.closest('[data-reader-content]'));
}, true);
window.addEventListener('scroll', () => {
  if (readerUsesDocumentScroll()) scheduleReaderProgress($('[data-reader-content]'));
}, { passive: true });
$('#annotationDialog').addEventListener('click', (event) => {
  if (event.target === $('#annotationDialog') || event.target.closest('[data-close-annotation]')) { $('#annotationDialog').hidden = true; clearReaderSelectionState(); suppressReaderPageGesture(700); hideReaderSelectionMenu(); return; }
  if (!event.target.closest('[data-save-annotation]')) return;
  const draft = state.readerAnnotationDraft;
  const book = readerBookById(draft?.bookId || state.readerBookId); const note = $('#annotationText')?.value.trim();
  const selectedText = draft?.quote || state.readerSelectedText;
  if (!book || !selectedText || !note) return toast(state.language === 'en' ? 'Write a note first' : '请先写下标注内容', 'error');
  const position = draft?.position || captureReaderPosition();
  const selection = draft || state.readerSelection || {};
  book.annotations ||= []; book.annotations.push({ id: uid(), kind: 'comment', quote: selectedText, note, start: selection.start, end: selection.end, createdAt: Date.now() });
  syncReaderBookProgressToSnapshot(book, position);
  clearReaderSelectionState(); suppressReaderPageGesture(1200); hideReaderSelectionMenu(); saveLibrary(); $('#annotationDialog').hidden = true; render(); preserveReaderPositionAfterRender(position);
});
document.addEventListener('selectionchange', () => {
  if (!state.readerBookId || state.readerMode !== 'reading') return;
  const range = readerNativeSelectionRange();
  if (!range) {
    // WebKit can briefly collapse the Range after the long-press menu event
    // and restore it on the next selection tick. Keep the OneBox bar alive
    // during that hand-off instead of hiding it permanently.
    if (state.readerSelection && Date.now() < readerSelectionSuppressUntil) return;
    scheduleReaderSelectionMenuHide();
    return;
  }
  suppressReaderPageGesture(1200);
  readerShowSelectionMenu(range);
});
document.addEventListener('selectstart', () => {
  if (state.readerMode !== 'reading') return;
  scheduleReaderNativeSelectionMenuSync();
}, { passive: true });

$('#bottomNav').addEventListener('click', (event) => {
  const tab = event.target.closest('[data-section]');
  if (!tab) return;
  if (tab.dataset.section === 'home' && event.detail >= 2) {
    if (state.section !== 'home') selectSection('home');
    toast(state.language === 'en' ? 'Refreshing home…' : '正在刷新首页…');
    loadHomeFeeds(true);
    return;
  }
  selectSection(tab.dataset.section);
});
$('#layoutNav').addEventListener('click', (event) => {
  const tab = event.target.closest('[data-section]');
  if (!tab) return;
  if (tab.dataset.section === 'home' && event.detail >= 2) {
    if (state.section !== 'home') selectSection('home');
    toast(state.language === 'en' ? 'Refreshing home…' : '正在刷新首页…');
    loadHomeFeeds(true);
    return;
  }
  selectSection(tab.dataset.section);
});
$('#brandLink').addEventListener('click', (event) => { event.preventDefault(); selectSection('home'); });
$('#languagePicker').addEventListener('change', (event) => { state.languageMode = event.target.value; saveThemeLanguage(); applyLanguage(); renderNav(); render(); if (state.settingsOpen) renderSettings(); });
let lastMainScrollTop = 0;
function handleAppScroll(current) {
  const bottomNav = $('#bottomNav');
  if (!bottomNav || state.layoutMode !== 'classic') return;
  if (current <= 8 || current < lastMainScrollTop - 4) bottomNav.classList.remove('is-blurred');
  else if (current > lastMainScrollTop + 4) bottomNav.classList.add('is-blurred');
  $('main')?.classList.toggle('bottom-nav-blurred', bottomNav.classList.contains('is-blurred'));
  lastMainScrollTop = current;
}
$('main').addEventListener('scroll', (event) => { handleAppScroll(event.currentTarget.scrollTop); updateMascotScrollState(); }, { passive: true });
window.addEventListener('scroll', () => {
  if (isIosSafariBrowser()) handleAppScroll(appScrollTop());
  updateMascotScrollState();
}, { passive: true });

document.addEventListener('keydown', (event) => {
  if (state.readerMode === 'reading' && !event.target.matches('input, textarea, select')) {
    if (event.key === 'ArrowLeft') { event.preventDefault(); turnReaderPage(-1); return; }
    if (event.key === 'ArrowRight') { event.preventDefault(); turnReaderPage(1); return; }
    if (event.key === 'Escape') { if (state.readerDialog) closeReaderDialog(); else closeReader(); return; }
  }
  if (state.tool !== 'calculator' || event.target.matches('input, textarea, select')) return;
  const keyMap = { Enter: '=', Escape: 'AC', Backspace: '⌫', '*': '×', '/': '÷', '-': '−' };
  const key = keyMap[event.key] || event.key;
  if (/^[0-9.+()%,]$/.test(key) || ['=', 'AC', '⌫', '×', '÷', '−'].includes(key)) { event.preventDefault(); calculatorKey(key === ',' ? '.' : key); }
});

$('#themeBtn').addEventListener('click', cycleTheme);
$('#languageBtn').addEventListener('click', cycleLanguage);
$('#settingsBtn').addEventListener('click', () => renderSettings());
$('#notifyBtn').addEventListener('click', () => {
  state.notificationOpen = !state.notificationOpen;
  if (state.notificationOpen) { state.notifications.forEach((item) => { if (item.at <= Date.now()) item.read = true; }); saveNotifications(); renderNotifications(); }
  else closeNotifications();
  $('#notifyBtn').setAttribute('aria-expanded', String(state.notificationOpen));
});
$('#updateBtn')?.addEventListener('click', applyUpdate);
$('#installBtn').addEventListener('click', async () => { if (!window.installPrompt) return; window.installPrompt.prompt(); await window.installPrompt.userChoice; window.installPrompt = null; $('#installBtn').hidden = true; });
$('#settingsDialog').addEventListener('click', (event) => {
  if (event.target === $('#settingsDialog') || event.target.closest('[data-close-settings]')) return closeSettings();
  if (event.target.closest('[data-open-agreement]')) return renderAgreementDialog();
  if (event.target.closest('[data-check-update]')) return checkForUpdate();
  if (event.target.closest('[data-apply-update]')) return applyUpdate();
  if (event.target.closest('[data-request-notifications]')) return requestNotifications();
  if (event.target.closest('[data-github-login]')) return githubLogin();
  if (event.target.closest('[data-github-upload]')) return githubUpload();
  if (event.target.closest('[data-github-download]')) return githubDownload();
  if (event.target.closest('[data-github-logout]')) return disconnectGithub();
});
$('#homeSourceDialog').addEventListener('click', (event) => {
  if (event.target === $('#homeSourceDialog') || event.target.closest('[data-close-home-source]')) return closeHomeSourceDialog();
  const toggle = event.target.closest('[data-home-source-toggle]');
  if (toggle) return setHomeTabVisibility(toggle.dataset.homeSourceToggle, !homeTabIsVisible(toggle.dataset.homeSourceToggle));
});
$('#navigationDialog').addEventListener('contextmenu', (event) => {
  if (!event.target.closest('.navigation-folder-sites [data-navigation-item]')) return;
  event.preventDefault();
  event.stopPropagation();
});
$('#navigationDialog').addEventListener('click', (event) => {
  if (event.target === $('#navigationDialog') || event.target.closest('[data-close-navigation-dialog]')) return closeNavigationDialog();
  if (Date.now() < navigationSuppressClickUntil && event.target.closest('.navigation-folder-sites [data-navigation-item]')) { event.preventDefault(); return; }
  const action = event.target.closest('[data-navigation-action]');
  if (action) {
    const { siteId, folderId = '' } = state.navigationDialog || {};
    if (action.dataset.navigationAction === 'cancel') return closeNavigationDialog();
    if (action.dataset.navigationAction === 'edit') return folderId ? openNavigationEditDialog(siteId, folderId) : (navigationFindRootItem(siteId)?.type === 'folder' ? openNavigationFolderDialog(siteId) : openNavigationEditDialog(siteId));
    if (action.dataset.navigationAction === 'delete') return folderId ? deleteNavigationSite(siteId, folderId) : (navigationFindRootItem(siteId)?.type === 'folder' ? deleteNavigationFolder(siteId) : deleteNavigationSite(siteId));
  }
  if (event.target.closest('[data-navigation-add-in-folder]')) return openNavigationAddDialog(state.navigationDialog?.folderId || '');
  const navigationOpenAction = event.target.closest('[data-navigation-open-action]');
  if (navigationOpenAction) {
    event.preventDefault(); event.stopPropagation();
    const card = navigationOpenAction.closest('[data-navigation-item]');
    const link = card?.querySelector('[data-navigation-open-site]');
    if (link) return openNavigationSite(link);
  }
  const navigationSiteLink = event.target.closest('[data-navigation-open-site]');
  if (navigationSiteLink) {
    if (navigationSiteLink.target === '_blank') return;
    event.preventDefault(); event.stopPropagation(); return openNavigationSite(navigationSiteLink);
  }
  const edit = event.target.closest('[data-navigation-edit]');
  if (edit) return openNavigationEditDialog(edit.dataset.navigationEdit, edit.closest('[data-navigation-folder-id]')?.dataset.navigationFolderId || state.navigationDialog?.folderId || '');
  const remove = event.target.closest('[data-navigation-delete]');
  if (remove) return deleteNavigationSite(remove.dataset.navigationDelete, remove.closest('[data-navigation-folder-id]')?.dataset.navigationFolderId || '');
  if (event.target.closest('[data-navigation-delete-folder]')) return deleteNavigationFolder(state.navigationDialog?.folderId || '');
});
$('#navigationDialog').addEventListener('input', (event) => {
  if (event.target.id !== 'navigationUrl') return;
  const preview = $('[data-navigation-icon-preview]', $('#navigationDialog')); if (!preview) return;
  const url = navigationSafeUrl(event.target.value); preview.innerHTML = url ? navigationIconMarkup({ name: navigationNameFromUrl(url), url, icon: navigationIconUrl(url) }, 'navigation-preview-icon') + '<span>' + escapeHtml(t('navigationIconHint')) + '</span>' : '<span class="navigation-preview-placeholder">' + escapeHtml(t('navigationIconHint')) + '</span>';
});
$('#navigationDialog').addEventListener('submit', (event) => {
  event.preventDefault();
  if (event.target.id === 'navigationSiteForm') {
    const folderId = event.target.dataset.navigationFolderId || '';
    if (event.target.dataset.navigationMode === 'edit') return editNavigationSite(event.target.dataset.navigationSiteId, folderId, $('#navigationUrl', event.target)?.value, $('#navigationName', event.target)?.value);
    return addNavigationSite($('#navigationUrl', event.target)?.value, $('#navigationName', event.target)?.value, folderId);
  }
  if (event.target.id === 'navigationFolderForm') {
    const folder = navigationFindFolder(state.navigationDialog?.folderId || ''); if (!folder) return closeNavigationDialog();
    folder.name = $('#navigationFolderName', event.target)?.value.trim() || folder.name; saveNavigation(); closeNavigationDialog(); render(); return;
  }
  if (event.target.id === 'navigationCreateFolderForm') return createNavigationFolder($('#navigationFolderName', event.target)?.value, state.navigationFolderDraft?.firstId, state.navigationFolderDraft?.secondId);
});
$('#settingsDialog').addEventListener('change', (event) => {
  if (event.target.id === 'settingsLayout') { state.layoutMode = event.target.value === 'simple' ? 'simple' : 'classic'; saveLayoutPreference(); render(); renderSettings(); }
  if (event.target.id === 'settingsNavigationLocation') {
    state.navigationLocation = event.target.value === 'tools' ? 'tools' : 'main';
    localStorage.setItem(STORAGE.navigationLocation, state.navigationLocation);
    state.toolOrder = normalizeToolOrder(state.toolOrder, state.navigationLocation === 'tools', state.navigationLocation === 'tools');
    saveToolOrder();
    if (state.navigationLocation === 'tools') state.section = 'tools', state.tool = 'navigation';
    if (state.navigationLocation === 'main' && state.section === 'tools' && state.tool === 'navigation') state.section = 'navigation';
    const route = state.section === 'tools' ? state.tool : state.section;
    if (location.hash.slice(1) !== route) history.replaceState(null, '', '#' + route);
    renderNav(); renderBottomNav(); render(); renderSettings();
  }
  if (event.target.id === 'settingsTheme') { state.theme = event.target.value; saveThemeLanguage(); applyTheme(); render(); }
  if (event.target.id === 'settingsColor') { state.color = ['mono', 'purple', 'blue', 'green', 'yellow'].includes(event.target.value) ? event.target.value : 'mono'; saveColorPreference(); applyTheme(); render(); renderSettings(); }
  if (event.target.id === 'settingsLanguage') { state.languageMode = event.target.value; saveThemeLanguage(); applyLanguage(); renderNav(); render(); renderSettings(); }
  if (event.target.id === 'settingsNotifications') { state.notificationPreference = event.target.value; saveStored(STORAGE.notificationPreference, state.notificationPreference); if (state.notificationPreference === 'allow') requestNotifications(); }
  if (event.target.id === 'settingsOpenMode') { state.openMode = event.target.value === 'new-tab' ? 'new-tab' : 'current'; saveStored(STORAGE.openMode, state.openMode); }
  if (event.target.id === 'settingsMascotVisibility') { state.mascotVisible = event.target.value !== 'hide'; saveMascotVisibility(); syncMascotVisibility(); renderSettings(); }
  if (event.target.dataset.topDisplay) { state.topDisplay[event.target.dataset.topDisplay] = event.target.checked; saveTopDisplay(); renderHeaderControls(); renderSettings(); }
});
$('#settingsDialog').addEventListener('input', () => {});
$('#agreementDialog').addEventListener('click', (event) => {
  if (event.target === $('#agreementDialog') || event.target.closest('[data-close-agreement]')) closeAgreementDialog();
});
$('#recentReadingDialog').addEventListener('click', (event) => {
  if (event.target === $('#recentReadingDialog') || event.target.closest('[data-close-recent-reading]')) return closeRecentReading();
  const feedItem = event.target.closest('[data-feed-link]');
  if (!feedItem) return;
  if (openFeedLink(feedItem.dataset.feedLink)) {
    markFeedRead(feedItem.dataset.feedId);
    feedItem.classList.add('is-read');
  }
});
$('#githubDialog').addEventListener('click', (event) => {
  if (event.target === $('#githubDialog') || event.target.closest('[data-close-github]')) return closeGithubDialog();
  if (event.target.closest('[data-github-login]')) return githubLogin();
  if (event.target.closest('[data-github-token]')) return githubUseAccessToken();
  if (event.target.closest('[data-github-upload]')) return githubUpload();
  if (event.target.closest('[data-github-download]')) return githubDownload();
  if (event.target.closest('[data-github-logout]')) return disconnectGithub();
});
$('#githubDialog').addEventListener('input', (event) => { if (event.target.id === 'githubClientId') { state.github.clientId = event.target.value.trim(); saveGithub(); } });
$('#notificationPanel').addEventListener('click', (event) => {
  if (event.target === $('#notificationPanel') || event.target.closest('[data-close-notifications]')) return closeNotifications();
  const deleteNotification = event.target.closest('[data-delete-notification]');
  if (deleteNotification) { state.notifications = state.notifications.filter((item) => item.id !== deleteNotification.dataset.deleteNotification); saveNotifications(); renderNotifications(); updateNotificationBadge(); }
  if (event.target.closest('[data-mark-notifications-read]')) { state.notifications.forEach((item) => { item.read = true; }); saveNotifications(); renderNotifications(); updateNotificationBadge(); }
});
document.addEventListener('click', (event) => {
  if (state.notificationOpen && !event.target.closest('#notificationPanel, #notifyBtn')) closeNotifications();
});
document.addEventListener('pointerdown', unlockAlertAudio, { once: true, passive: true });
window.addEventListener('pagehide', () => {
  // openFeedLink() already captured the real scrollTop before navigation.
  // Safari may reset the document to 0 while dispatching pagehide; do not
  // overwrite the saved position with that transient value.
  if (!feedNavigationPending) saveNavigationPosition();
  // Do not let a request that was in flight before the page was hidden keep
  // the cached homepage in an endless loading state when iOS restores it.
  state.homeFeedRequest += 1;
  state.homeFeed.loading = false;
  clearFeedNavigationPending();
  flushReaderProgress(); clearTimeout(persistenceTimer); writePersistentSnapshot();
});
window.addEventListener('pageshow', (event) => {
  let returningToHome = event.persisted;
  try {
    const saved = JSON.parse(sessionStorage.getItem(NAVIGATION_SESSION_KEY) || 'null');
    returningToHome ||= Boolean(saved && saved.hash === location.hash && Date.now() - Number(saved.savedAt || 0) <= 30 * 60 * 1000);
  } catch { /* session storage may be disabled */ }
  // iOS Safari/PWA can restore the old swipe transform and viewport-sized
  // bottom inset from the external page. Clear those transient styles before
  // restoring the user's exact tab and scroll position.
  pageSwipeAnimationToken = 0;
  pageSwipeGesture = null;
  clearPageSwipeTrack();
  if (returningToHome) {
    refreshOneBoxViewportMetrics();
    scheduleHomeFeedSurfaceSync();
  } else syncOneBoxViewportMetrics();
  clearFeedNavigationPending();
  restoreNavigationPosition();
  if (returningToHome) window.setTimeout(recoverHomeLayoutAfterReturn, 360);
});
window.addEventListener('beforeinstallprompt', (event) => { event.preventDefault(); window.installPrompt = event; $('#installBtn').hidden = false; });
window.addEventListener('online', () => { $('#connectionStatus').textContent = t('online'); toast(state.language === 'en' ? 'Back online' : '网络已恢复'); });
window.addEventListener('offline', () => { $('#connectionStatus').textContent = t('offline'); toast(state.language === 'en' ? 'Offline mode' : '已切换到离线模式'); });
window.addEventListener('hashchange', () => {
  const route = location.hash.slice(1);
  if (['home', 'navigation', 'messages', 'mine'].includes(route)) selectSection(route);
  else selectTool(route);
});
window.matchMedia?.('(prefers-color-scheme: dark)').addEventListener?.('change', () => { if (state.theme === 'system') applyTheme(); });
document.addEventListener('visibilitychange', () => { if (!document.hidden) { state.swRegistration?.update().catch(() => {}); if (state.section === 'home') scheduleHomeFeedSurfaceSync(); } });
window.addEventListener('focus', () => { state.swRegistration?.update().catch(() => {}); if (state.section === 'home') scheduleHomeFeedSurfaceSync(); });
const handleReaderFullscreenChange = () => {
  const active = Boolean(readerFullscreenElement());
  if (active) {
    readerNativeFullscreen = true;
    updateReaderFullscreenControl();
  } else if (readerNativeFullscreen && state.readerMode === 'reading' && state.readerImmersive) {
    readerNativeFullscreen = false;
    state.readerImmersive = false; render();
  } else updateReaderFullscreenControl();
};
document.addEventListener('fullscreenchange', handleReaderFullscreenChange);
document.addEventListener('webkitfullscreenchange', handleReaderFullscreenChange);
let homeFeedPollTimer = null;
function scheduleHomeFeedPolling() {
  if (homeFeedPollTimer) return;
  homeFeedPollTimer = setInterval(() => {
    if (!document.hidden) loadHomeFeeds(true);
  }, RSS_REFRESH_INTERVAL);
}
function bootApp() {
  try { history.scrollRestoration = 'manual'; } catch { /* unsupported */ }
  mountMascot();
  setInterval(checkNotifications, 30000);
  applyLanguage(); renderNav(); render(); checkNotifications(); scheduleHomeFeedPolling(); loadHomeFeeds();
  setupServiceWorker();
}
restorePersistentSnapshot().then((restored) => {
  if (restored) { window.location.reload(); return; }
  bootApp();
}).catch(bootApp);
