/* OneBox 2.0 — dependency-free, mobile-first PWA application layer. */
const APP_VERSION = '2.15.5';
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
  events: 'onebox.events',
  holidays: 'onebox.holidays',
  weatherCards: 'onebox.weather-cards',
  legacyWeather: 'onebox.weather',
  translationHistory: 'onebox.translation-history',
  notifications: 'onebox.notifications',
  alarms: 'onebox.alarms',
  library: 'onebox.library',
  headerVisibility: 'onebox.header-visibility',
  bottomNavAutoHide: 'onebox.bottom-nav-auto-hide',
  github: 'onebox.github',
};
const TOOL_DEFS = {
  calculator: { icon: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="3" width="16" height="18" rx="3"/><path d="M8 7h8M8 11h2m2 0h2m-4 4h2m2 0h2m-6 4h2m2 0h2"/></svg>', key: 'calculator' },
  calendar: { icon: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3.5" y="5" width="17" height="16" rx="3"/><path d="M7 3v4M17 3v4M4 9h16M8 13h.01M12 13h.01M16 13h.01M8 17h.01M12 17h.01M16 17h.01"/></svg>', key: 'calendar' },
  weather: { icon: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>', key: 'weather' },
  convert: { icon: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h13l-3-3M20 17H7l3 3M4 4v6M20 14v6"/></svg>', key: 'convert' },
  translate: { icon: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m4 17 4-11 4 11M5.5 13h5M14 6h6M14 10h5M14 14h6M14 18h4"/></svg>', key: 'translate' },
  reader: { icon: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 4.5A2.5 2.5 0 0 1 7.5 2H19v17H7.5A2.5 2.5 0 0 0 5 21.5zM5 4.5v17M8 6h8M8 10h8M8 14h6"/></svg>', key: 'reader' },
};
const DEFAULT_TOOL_ORDER = Object.keys(TOOL_DEFS);
const nav = $('#toolNav');
const workspace = $('#workspace');
const parseStored = (key, fallback) => {
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; }
};
let persistenceTimer = null;
let oneBoxDbPromise = null;
function openOneBoxDb() {
  if (oneBoxDbPromise || !window.indexedDB) return oneBoxDbPromise;
  oneBoxDbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open('onebox-local-data', 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains('snapshot')) db.createObjectStore('snapshot');
      if (!db.objectStoreNames.contains('books')) db.createObjectStore('books');
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
    calculator: '计算', calendar: '日历', weather: '天气', convert: '转换', translate: '翻译', reader: '阅读',
    online: '在线', offline: '离线', install: '安装应用', settings: '设置', notifications: '消息提示',
    heroSubtitle: '快速、清爽、可离线。你的数据优先保存在当前设备。',
    calculatorDesc: '支持括号、百分比、科学函数和键盘输入，并自动保留最近计算记录。',
    calendarDesc: '公历、农历、节气、节假日、补班和个人日程集中查看。',
    weatherDesc: '搜索区县，查看实时、小时级和未来 15 天天气趋势。',
    convertDesc: '覆盖长度、重量、面积、体积、速度、时间、数据和温度。',
    translateDesc: '使用开源 LibreTranslate 接口，翻译结果可保存在本机。',
    recentCalculations: '最近计算', clear: '清除', ready: '完成的计算会显示在这里。',
    scientific: '科学计算', collapse: '收起', expand: '展开', degree: '度', radian: '弧度',
    keyboard: '键盘：数字、+ − × ÷、括号、Enter 等号、Esc 清空',
    today: '今天', off: '休', work: '补班', normalCalendar: '工作日历',
    legalHoliday: '法定休息', makeUpWorkday: '补班', solarTerm: '节气', selectedDay: '选中日期',
    noAgenda: '这一天还没有安排。', agenda: '日程', addAgenda: '新增日程', newReminder: '新增提醒', eventContent: '日程内容', eventPlaceholder: '请输入你的日程信息', addEvent: '添加日程', addToDay: '添加日程', eventDate: '日期', eventTime: '时间（精确到秒）', reminderSchedule: '提醒日程', eventRepeat: '重复方式',
    noteOptional: '备注（可选）', weatherSearch: '搜索', currentLocation: '当前位置',
    refresh: '刷新', searchPlace: '搜索城市或区县',
    noWeather: '天气需要联网，搜索一个城市或区县开始。', weatherLoading: '正在获取天气…',
    weatherData: '天气数据来自 Open-Meteo；最近一次成功结果会保存在本机，离线时仍可查看。',
    sortWeather: '长按天气卡片可调整顺序', hourly: '前后 12 小时', daily: '前 3 天 · 今天 · 未来 15 天', advice: '天气建议',
    commute: '出行', sport: '运动', clothing: '穿衣', sunscreen: '防晒', hiking: '爬山',
    addCard: '添加', noResults: '没有找到匹配地点，请换个关键词。',
    home: '首页', tools: '工具', messages: '消息', mine: '我的', quickTools: '常用工具', openSettings: '打开设置', noMessages: '还没有消息。',
    converterType: '换算类型', from: '从', to: '到', result: '结果', swap: '交换单位', copyResult: '复制结果',
    copied: '已复制', translationInput: '输入待翻译内容', translateNow: '开始翻译', saveTranslation: '保存到本机',
    source: '源语言', target: '目标语言', translationResult: '翻译结果', translationHistory: '最近翻译',
    noTranslation: '翻译结果会显示在这里。', noHistory: '还没有保存翻译。',
    githubSync: 'GitHub 云同步', githubDescription: '使用 GitHub Gist 保存设置、日历、翻译和天气卡片。令牌只保存在当前设备。',
    githubClientId: 'GitHub OAuth Client ID', githubClientHint: '首次使用需在 GitHub OAuth App 中开启 Device Flow，并填入 Client ID。',
    githubLogin: '连接 GitHub', githubLogout: '退出 GitHub', upload: '上传到 GitHub', download: '从 GitHub 恢复',
    githubConnected: '已连接', githubNotConnected: '尚未连接', openDevice: '打开验证页面',
    appUpdate: '应用更新', checkUpdate: '更新', updateAvailable: '有新版本可用', upToDate: '已是最新版本', updating: '正在检查…', applyUpdate: '立即更新', topDisplay: '顶部显示',
    notificationsPermission: '消息通知', enableNotifications: '允许通知', notificationDescription: 'iPhone 需要先将 OneBox 添加到主屏幕并允许消息通知；应用关闭后的后台提醒仍需要 Push 服务端。',
    userAgreement: '用户协议', viewAgreement: '查看协议', agreementTitle: 'OneBox 用户协议', agreementBody: 'OneBox 是一款本地优先的日常工具应用。计算记录、日程、翻译历史和天气卡片默认保存在当前设备；使用 GitHub 云同步时，数据会写入你自己的私有 Gist。天气和翻译功能会请求对应的开源服务，服务商可能记录必要的请求信息。请在使用提醒、定位和消息通知功能前确认已授予相应权限。',
    addReminder: '添加提醒', reminderText: '提醒内容', remindAt: '提醒时间', noNotifications: '还没有提醒。', alarm: '闹钟', addAlarm: '添加闹钟', alarmContent: '闹钟内容', alarmPlaceholder: '请输入闹钟内容', alarmAt: '提醒时间', alarmRepeat: '重复方式', once: '指定时间', everyDay: '每天', workdays: '工作日', restdays: '非工作日', weekly: '每周', weekdays: '重复星期', noAlarms: '还没有闹钟。', alarmHint: '闹钟支持指定日期、工作日、非工作日和每周重复。', enabled: '已开启', disabled: '已关闭',
    markRead: '全部已读', close: '关闭', system: '跟随系统', light: '浅色', dark: '深色',
    language: '语言', theme: '主题', bottomTab: '底部 Tab', autoHideBottomNav: '自动隐藏，滑动显示', reorderHint: '长按工具标签可以调整顺序',
    languagePending: '日语、韩语语言包已预留，当前版本先提供中文和英文。',
    bookshelf: '书架', addBook: '添加文档', noBooks: '还没有本地文档。', readerHint: '支持 Markdown、PDF、EPUB；文档仅保存在当前设备。', openBook: '打开阅读', deleteBook: '删除文档', annotations: '标注', addAnnotation: '添加标注', annotationPlaceholder: '写下你的标注…', saveAnnotation: '保存标注', annotationHint: '选择文字后长按或点击标注按钮。', noAnnotations: '还没有标注。', reading: '正在阅读', closeReader: '关闭阅读', unsupportedFile: '请选择 .md、.markdown、.pdf 或 .epub 文件。', importFailed: '文档读取失败，请重试。', deleteConfirm: '确定删除这本文档吗？', pdfHint: 'PDF 使用浏览器原生阅读器打开。', epubHint: 'EPUB 已转换为适合 OneBox 的连续阅读视图。',
  },
  en: {
    calculator: 'Calculator', calendar: 'Calendar', weather: 'Weather', convert: 'Convert', translate: 'Translate', reader: 'Reader',
    online: 'Online', offline: 'Offline', install: 'Install', settings: 'Settings', notifications: 'Notifications',
    heroSubtitle: 'Fast, calm and offline-ready. Your data stays on this device first.',
    calculatorDesc: 'Parentheses, percentages, scientific functions, keyboard input and history.',
    calendarDesc: 'Gregorian, lunar, solar terms, holidays, make-up workdays and personal events.',
    weatherDesc: 'Search cities and districts for current, hourly and 15-day forecasts.',
    convertDesc: 'Length, weight, area, volume, speed, time, data and temperature.',
    translateDesc: 'Powered by an open-source LibreTranslate endpoint; results can be saved locally.',
    recentCalculations: 'Recent calculations', clear: 'Clear', ready: 'Completed calculations appear here.',
    scientific: 'Scientific', collapse: 'Hide', expand: 'Show', degree: 'DEG', radian: 'RAD',
    keyboard: 'Keyboard: numbers, + − × ÷, parentheses, Enter and Escape',
    today: 'Today', off: 'Off', work: 'Make-up workday', normalCalendar: 'Work calendar',
    legalHoliday: 'Public holiday', makeUpWorkday: 'Make-up workday', solarTerm: 'Solar term', selectedDay: 'Selected day',
    noAgenda: 'Nothing planned for this day.', agenda: 'Events', addAgenda: 'New event', newReminder: 'New reminder', eventContent: 'Event details', eventPlaceholder: 'Enter your event details', addEvent: 'Add event', addToDay: 'Add event', eventDate: 'Date', eventTime: 'Time (to the second)', reminderSchedule: 'Reminder time', eventRepeat: 'Repeat',
    noteOptional: 'Note (optional)', weatherSearch: 'Search', currentLocation: 'Current location',
    refresh: 'Refresh', searchPlace: 'Search city or district',
    noWeather: 'Search a city or district to get weather.', weatherLoading: 'Loading weather…',
    weatherData: 'Weather by Open-Meteo. The last successful result is cached locally for offline use.',
    sortWeather: 'Long-press a weather card to reorder', hourly: '12 hours before and after', daily: '3 days before · today · next 15 days', advice: 'Advice',
    commute: 'Travel', sport: 'Sport', clothing: 'Clothing', sunscreen: 'Sun care', hiking: 'Hiking',
    addCard: 'Add', noResults: 'No matching place. Try another query.',
    home: 'Home', tools: 'Tools', messages: 'Messages', mine: 'Me', quickTools: 'Quick tools', openSettings: 'Open settings', noMessages: 'No messages yet.',
    converterType: 'Conversion', from: 'From', to: 'To', result: 'Result', swap: 'Swap units', copyResult: 'Copy result',
    copied: 'Copied', translationInput: 'Text to translate', translateNow: 'Translate', saveTranslation: 'Save locally',
    source: 'Source', target: 'Target', translationResult: 'Translation', translationHistory: 'Recent translations',
    noTranslation: 'Your translation will appear here.', noHistory: 'No saved translations yet.',
    githubSync: 'GitHub cloud sync', githubDescription: 'Save settings, calendar, translations and weather cards in a GitHub Gist. The token stays on this device.',
    githubClientId: 'GitHub OAuth Client ID', githubClientHint: 'Enable Device Flow in a GitHub OAuth App and paste its Client ID here once.',
    githubLogin: 'Connect GitHub', githubLogout: 'Disconnect GitHub', upload: 'Upload to GitHub', download: 'Restore from GitHub',
    githubConnected: 'Connected', githubNotConnected: 'Not connected', openDevice: 'Open verification page',
    appUpdate: 'App update', checkUpdate: 'Update', updateAvailable: 'A new version is ready', upToDate: 'You are up to date', updating: 'Checking…', applyUpdate: 'Update now', topDisplay: 'Show at top',
    notificationsPermission: 'Message notifications', enableNotifications: 'Allow notifications', notificationDescription: 'On iPhone, add OneBox to the Home Screen and allow notifications first; background alerts after the app is closed still require a Push server.',
    userAgreement: 'User agreement', viewAgreement: 'View agreement', agreementTitle: 'OneBox user agreement', agreementBody: 'OneBox is a local-first daily tools app. Calculator history, events, translation history and weather cards stay on this device by default; when GitHub sync is enabled, they are written to your own private Gist. Weather and translation features request open-source services, which may record necessary request metadata. Review the permissions before enabling reminders, location or message notifications.',
    addReminder: 'Add reminder', reminderText: 'Reminder', remindAt: 'When', noNotifications: 'No reminders yet.', alarm: 'Alarms', addAlarm: 'Add alarm', alarmContent: 'Alarm label', alarmPlaceholder: 'Enter an alarm label', alarmAt: 'Reminder time', alarmRepeat: 'Repeat', once: 'Once', everyDay: 'Every day', workdays: 'Workdays', restdays: 'Rest days', weekly: 'Weekly', weekdays: 'Weekdays', noAlarms: 'No alarms yet.', alarmHint: 'Alarms support a date, workdays, rest days and weekly repeats.', enabled: 'On', disabled: 'Off',
    markRead: 'Mark all read', close: 'Close', system: 'System', light: 'Light', dark: 'Dark',
    language: 'Language', theme: 'Theme', bottomTab: 'Bottom tabs', autoHideBottomNav: 'Auto-hide; reveal while scrolling', reorderHint: 'Long-press a tool tab to reorder',
    languagePending: 'Japanese and Korean are reserved for a future language pack. Chinese and English are available now.',
    bookshelf: 'Bookshelf', addBook: 'Add document', noBooks: 'No local documents yet.', readerHint: 'Supports Markdown, PDF and EPUB. Files stay on this device.', openBook: 'Open', deleteBook: 'Delete', annotations: 'Notes', addAnnotation: 'Add note', annotationPlaceholder: 'Write a note…', saveAnnotation: 'Save note', annotationHint: 'Select text, long-press or use the note button.', noAnnotations: 'No notes yet.', reading: 'Reading', closeReader: 'Close reader', unsupportedFile: 'Choose a .md, .markdown, .pdf or .epub file.', importFailed: 'Could not read this document.', deleteConfirm: 'Delete this document?', pdfHint: 'PDF opens in the browser native reader.', epubHint: 'EPUB is converted into a continuous OneBox reading view.',
  },
};
const t = (key) => DICT[state.language]?.[key] || DICT.zh[key] || key;
const toolName = (id) => t(TOOL_DEFS[id]?.key || id);
const storedTheme = localStorage.getItem(STORAGE.theme);
const storedLanguage = localStorage.getItem(STORAGE.language) || 'system';
const resolveLanguageMode = (mode) => mode === 'en' || mode === 'zh' ? mode : ((navigator.language || '').toLowerCase().startsWith('en') ? 'en' : 'zh');
const storedCalculator = parseStored(STORAGE.calculator, { expr: '', history: [] });
const DEFAULT_HEADER_VISIBILITY = { notifications: true, theme: true, language: false, settings: true, update: false };
const storedHeaderVisibility = parseStored(STORAGE.headerVisibility, {});
const storedAlarms = parseStored(STORAGE.alarms, []);
const storedLibrary = parseStored(STORAGE.library, []);
const rawWeatherCards = parseStored(STORAGE.weatherCards, []);
const legacyWeather = parseStored(STORAGE.legacyWeather, null);
const normalizeToolOrder = (value) => {
  const order = Array.isArray(value) ? value.filter((id) => TOOL_DEFS[id]) : [];
  return [...new Set(order.concat(Object.keys(TOOL_DEFS)))].slice(0, Object.keys(TOOL_DEFS).length);
};
const initialWeatherCards = (Array.isArray(rawWeatherCards) && rawWeatherCards.length ? rawWeatherCards : legacyWeather ? [legacyWeather] : []).map((item) => ({
  ...item,
  isCurrentLocation: Boolean(item.isCurrentLocation || item.name === '当前位置' || item.name === 'Current location'),
})).filter((item, index, cards) => !item.isCurrentLocation || cards.findIndex((candidate) => candidate.isCurrentLocation) === index);
const state = {
  tool: Object.keys(TOOL_DEFS).includes(location.hash.slice(1)) ? location.hash.slice(1) : 'calculator',
  section: location.hash.slice(1) === 'home' ? 'home' : 'tools',
  theme: ['light', 'dark', 'system'].includes(storedTheme) ? storedTheme : 'system',
  languageMode: ['zh', 'en', 'system'].includes(storedLanguage) ? storedLanguage : 'system',
  language: resolveLanguageMode(storedLanguage),
  toolOrder: normalizeToolOrder(parseStored(STORAGE.toolOrder, DEFAULT_TOOL_ORDER)),
  calcExpr: storedCalculator.expr || '', calcHistory: Array.isArray(storedCalculator.history) ? storedCalculator.history : [],
  calcJustEvaluated: false, calcScientific: false, calcAngle: 'deg',
  month: new Date(today.getFullYear(), today.getMonth(), 1), selectedDate: dateKey(today),
  events: parseStored(STORAGE.events, {}) || {},
  weatherCards: initialWeatherCards.map((item) => ({ ...item, id: item.id || uid() })),
  activeWeatherId: initialWeatherCards[0]?.id || null, weatherLoading: false, weatherError: '', weatherRequest: 0, weatherSearchResults: [],
  lunarDialogDate: null, lastCalendarTap: { key: '', at: 0 },
  translation: { source: 'auto', target: 'zh', input: '', result: '', loading: false, error: '' },
  translationHistory: parseStored(STORAGE.translationHistory, []),
  alarms: Array.isArray(storedAlarms) ? storedAlarms : [],
  library: (Array.isArray(storedLibrary) ? storedLibrary : []).filter((book) => book && book.id && book.name),
  readerBookId: null, readerUrl: '', readerSelectedText: '', annotationBookId: null,
  notifications: parseStored(STORAGE.notifications, []), notificationOpen: false, settingsOpen: false, githubDialogOpen: false,
  headerVisibility: { ...DEFAULT_HEADER_VISIBILITY, ...(storedHeaderVisibility && typeof storedHeaderVisibility === 'object' ? storedHeaderVisibility : {}) },
  bottomNavAutoHide: Boolean(parseStored(STORAGE.bottomNavAutoHide, false)),
  swRegistration: null, updateAvailable: false, updateChecking: false, updateApplying: false,
  github: (() => { const value = parseStored(STORAGE.github, {}) || {}; return { clientId: value.clientId || '', token: value.token || '', user: value.user || null, gistId: value.gistId || '', deviceCode: '', userCode: '', verificationUri: '', expiresAt: 0, interval: 5 }; })(),
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
function applyTheme() {
  const resolved = state.theme === 'system' ? (window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light') : state.theme;
  document.documentElement.dataset.theme = resolved;
  document.documentElement.dataset.themeMode = state.theme;
  document.documentElement.style.colorScheme = resolved;
  const meta = $('meta[name="theme-color"]');
  if (meta) meta.content = resolved === 'dark' ? '#0d0f14' : '#f3f5fa';
  const appleStatusBar = $('meta[name="apple-mobile-web-app-status-bar-style"]');
  if (appleStatusBar) appleStatusBar.content = resolved === 'dark' ? 'black-translucent' : 'default';
  const button = $('#themeBtn');
  if (button) {
    button.innerHTML = themeIcon(resolved);
    button.setAttribute('aria-label', t('theme') + '：' + t(state.theme));
    button.dataset.themeMode = state.theme;
    button.dataset.resolvedTheme = resolved;
  }
}
function renderHeaderControls() {
  const visibility = state.headerVisibility;
  ['notifyBtn', 'themeBtn', 'settingsBtn'].forEach((id) => { const button = $('#' + id); if (button) button.hidden = !visibility[id === 'notifyBtn' ? 'notifications' : id === 'themeBtn' ? 'theme' : 'settings']; });
  const languageControl = $('#languageControl');
  const languagePicker = $('#languagePicker');
  if (languageControl) languageControl.hidden = !visibility.language;
  if (languagePicker) languagePicker.value = state.languageMode;
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
function saveHeaderPreferences() { saveStored(STORAGE.headerVisibility, state.headerVisibility); saveStored(STORAGE.bottomNavAutoHide, state.bottomNavAutoHide); }
function cycleTheme() {
  state.theme = state.theme === 'system' ? 'light' : state.theme === 'light' ? 'dark' : 'system';
  saveThemeLanguage(); applyTheme(); render();
}

function heading(title, subtitle, actions = '') {
  return actions ? '<div class="tool-head"><div class="tool-actions">' + actions + '</div></div>' : '';
}
const SECTION_DEFS = {
  home: { key: 'home', icon: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1V10Z"/></svg>' },
  tools: { key: 'tools', icon: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="4" width="6" height="6" rx="1"/><rect x="14" y="4" width="6" height="6" rx="1"/><rect x="4" y="14" width="6" height="6" rx="1"/><rect x="14" y="14" width="6" height="6" rx="1"/></svg>' },
  messages: { key: 'messages', icon: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4"/></svg>' },
  mine: { key: 'mine', icon: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8" r="3.5"/><path d="M5 20a7 7 0 0 1 14 0"/></svg>' },
};
function renderNav() {
  nav.innerHTML = state.toolOrder.map((id, index) => {
    const item = TOOL_DEFS[id];
    return '<button class="tab ' + (state.tool === id ? 'active' : '') + '" draggable="true" data-tool="' + id + '" data-tool-index="' + index + '" aria-current="' + (state.tool === id ? 'page' : 'false') + '"><span aria-hidden="true">' + item.icon + '</span>' + toolName(id) + '</button>';
  }).join('');
  nav.title = t('reorderHint');
}
function renderBottomNav() {
  const bottomNav = $('#bottomNav');
  if (!bottomNav) return;
  const unread = state.notifications.filter((item) => !item.read).length;
  bottomNav.classList.toggle('auto-hide-enabled', state.bottomNavAutoHide);
  if (!state.bottomNavAutoHide || $('main')?.scrollTop <= 8) bottomNav.classList.remove('is-hidden');
  bottomNav.innerHTML = Object.values(SECTION_DEFS).map((item) => '<button class="bottom-tab ' + (state.section === item.key ? 'active' : '') + '" data-section="' + item.key + '" aria-current="' + (state.section === item.key ? 'page' : 'false') + '"><span class="bottom-tab-icon" aria-hidden="true">' + item.icon + '</span><span>' + t(item.key) + '</span>' + (item.key === 'messages' && unread ? '<sup>' + (unread > 99 ? '99+' : unread) + '</sup>' : '') + '</button>').join('');
}
function selectTool(id) {
  if (!TOOL_DEFS[id]) id = 'calculator';
  state.section = 'tools';
  state.tool = id;
  if (location.hash.slice(1) !== id) history.replaceState(null, '', '#' + id);
  renderNav(); renderBottomNav(); render();
}
function selectSection(section) {
  if (!SECTION_DEFS[section]) section = 'tools';
  state.section = section;
  if (section === 'tools' && !TOOL_DEFS[state.tool]) state.tool = 'calculator';
  renderNav(); renderBottomNav(); render();
}
function saveToolOrder() { saveStored(STORAGE.toolOrder, state.toolOrder); }
function swapToolOrder(from, to) {
  if (from === to || from == null || to == null) return;
  [state.toolOrder[from], state.toolOrder[to]] = [state.toolOrder[to], state.toolOrder[from]];
  saveToolOrder(); renderNav();
  toast(state.language === 'en' ? 'Tool order saved' : '工具顺序已保存');
}

function renderHome() {
  const tools = state.toolOrder.map((id) => '<button class="home-tool-card" data-home-tool="' + id + '"><span class="home-tool-icon" aria-hidden="true">' + TOOL_DEFS[id].icon + '</span><span><strong>' + toolName(id) + '</strong><small>' + (state.language === 'en' ? 'Open tool' : '打开工具') + '</small></span><span class="home-tool-arrow" aria-hidden="true">›</span></button>').join('');
  return '<div class="home-page"><div class="home-intro"><span class="section-kicker">ONEBOX</span><h1>' + (state.language === 'en' ? 'Everything you use, in one box.' : '每天要用的工具，都在一个盒子里。') + '</h1><p>' + (state.language === 'en' ? 'A calm workspace for quick calculations, dates, weather and conversions.' : '计算、日历、天气、转换与翻译，打开就能用。') + '</p></div><section class="home-section"><div class="subhead"><h2>' + t('quickTools') + '</h2><button class="text-btn" data-section="tools">' + t('tools') + '</button></div><div class="home-tool-grid">' + tools + '</div></section></div>';
}
function notificationItemsMarkup() {
  const items = [...state.notifications].sort((a, b) => Number(b.at) - Number(a.at));
  if (!items.length) return '<p class="empty compact">' + t('noMessages') + '</p>';
  return items.map((item) => '<div class="notification-item ' + (item.read ? '' : 'unread') + '"><div><strong>' + escapeHtml(item.text) + '</strong><small>' + new Intl.DateTimeFormat(state.language === 'en' ? 'en-US' : 'zh-CN', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(item.at)) + '</small></div><button class="icon-btn small" data-delete-notification="' + escapeHtml(item.id) + '" aria-label="' + t('close') + '">×</button></div>').join('');
}
function renderMessages() {
  return '<div class="section-page message-page"><div class="page-title-row"><div><span class="section-kicker">ONEBOX</span><h1>' + t('messages') + '</h1></div><button class="secondary" data-mark-notifications-read>' + t('markRead') + '</button></div><div class="message-panel"><div class="notification-list">' + notificationItemsMarkup() + '</div></div></div>';
}
function renderMine() {
  const githubStatus = state.github.user ? (state.github.user.login || 'GitHub') : t('githubNotConnected');
  return '<div class="section-page mine-page"><div class="page-title-row"><div><span class="section-kicker">ONEBOX</span><h1>' + t('mine') + '</h1></div></div><div class="mine-list"><button class="mine-row" data-open-settings-page><span class="mine-row-icon"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6 7 7M17 17l1.4 1.4M18.4 5.6 17 7M7 17l-1.4 1.4"/><circle cx="12" cy="12" r="4"/></svg></span><span><strong>' + t('settings') + '</strong><small>' + (state.language === 'en' ? 'Theme, language, updates and display' : '主题、语言、更新与显示设置') + '</small></span><span>›</span></button><button class="mine-row" data-open-github-page><span class="mine-row-icon"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3a9 9 0 0 0-2.8 17.55c.45.08.62-.2.62-.43v-1.52c-2.52.55-3.05-1.06-3.05-1.06-.41-1.05-1-1.33-1-1.33-.82-.56.06-.55.06-.55.9.06 1.37.93 1.37.93.8 1.37 2.1.98 2.61.75.08-.58.31-.98.57-1.2-2.01-.23-4.13-1-4.13-4.45 0-.98.35-1.77.93-2.39-.09-.23-.4-1.13.09-2.36 0 0 .76-.24 2.48.91a8.6 8.6 0 0 1 4.5 0c1.72-1.15 2.48-.91 2.48-.91.49 1.23.18 2.13.09 2.36.58.62.93 1.41.93 2.39 0 3.46-2.12 4.22-4.14 4.45.32.27.6.8.6 1.61v2.38c0 .23.16.51.62.42A9 9 0 0 0 12 3Z"/></svg></span><span><strong>GitHub</strong><small>' + escapeHtml(githubStatus) + '</small></span><span>›</span></button><button class="mine-row" data-open-agreement-page><span class="mine-row-icon"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 3h9l3 3v15H6zM15 3v4h4M9 12h6M9 16h6"/></svg></span><span><strong>' + t('userAgreement') + '</strong><small>' + (state.language === 'en' ? 'Learn how OneBox handles data' : '了解 OneBox 如何处理数据') + '</small></span><span>›</span></button></div></div>';
}

// Reader --------------------------------------------------------------------
function saveLibrary() { saveStored(STORAGE.library, state.library.slice(0, 80)); }
function readerBookById(id) { return state.library.find((book) => book.id === id); }
function markdownToHtml(source) {
  const safe = escapeHtml(String(source || '').replace(/\r\n?/g, '\n'));
  const blocks = safe.split(/\n{2,}/).map((block) => {
    if (/^```/.test(block)) return '<pre><code>' + block.replace(/^```[^\n]*\n?/, '').replace(/```$/, '') + '</code></pre>';
    if (/^### /.test(block)) return '<h3>' + block.slice(4) + '</h3>';
    if (/^## /.test(block)) return '<h2>' + block.slice(3) + '</h2>';
    if (/^# /.test(block)) return '<h1>' + block.slice(2) + '</h1>';
    if (/^> /.test(block)) return '<blockquote>' + block.replace(/^> /gm, '') + '</blockquote>';
    if (/^(?:[-*] |\d+\. )/.test(block)) {
      const ordered = /^\d+\. /.test(block);
      const items = block.split('\n').map((line) => '<li>' + line.replace(/^(?:[-*] |\d+\. )/, '') + '</li>').join('');
      return '<' + (ordered ? 'ol' : 'ul') + '>' + items + '</' + (ordered ? 'ol' : 'ul') + '>';
    }
    return '<p>' + block.replace(/\n/g, '<br>') + '</p>';
  });
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
    if (id) manifest[id] = { href: decodeURIComponent(xmlAttribute(tag, 'href')), media: xmlAttribute(tag, 'media-type') };
  });
  const spine = [...opf.matchAll(/<itemref\b[^>]*>/gi)].map((match) => xmlAttribute(match[0], 'idref')).map((id) => manifest[id]).filter(Boolean);
  const parts = [];
  for (const item of spine) {
    if (!/html|xhtml/i.test(item.media)) continue;
    const path = base + item.href.replace(/^\.\//, '');
    const html = decoder.decode(await readZipEntry(bytes, entries, path) || new Uint8Array());
    const body = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i)?.[1] || html;
    parts.push('<section>' + sanitizeReaderMarkup(body) + '</section>');
  }
  if (!parts.length) throw Error('EPUB has no readable chapters');
  const title = opf.match(/<dc:title[^>]*>([\s\S]*?)<\/dc:title>/i)?.[1]?.replace(/<[^>]+>/g, '').trim();
  return { title, html: parts.join('<hr>') };
}
async function importReaderFiles(fileList) {
  const files = [...(fileList || [])]; if (!files.length) return;
  for (const file of files) {
    const extension = file.name.split('.').pop()?.toLowerCase();
    if (!['md', 'markdown', 'pdf', 'epub'].includes(extension)) { toast(t('unsupportedFile'), 'error'); continue; }
    try {
      const id = uid(); const book = { id, name: file.name, type: extension === 'markdown' ? 'md' : extension, size: file.size, createdAt: Date.now(), lastOpenedAt: 0, progress: 0, annotations: [] };
      if (book.type === 'md') book.content = await file.text();
      else await oneBoxDbPut('books', id, await file.arrayBuffer());
      state.library.unshift(book); saveLibrary();
    } catch { toast(t('importFailed'), 'error'); }
  }
  const input = $('#readerFileInput'); if (input) input.value = '';
  render(); toast(state.language === 'en' ? 'Document added' : '文档已添加');
}
function readerAnnotationMarkup(book) {
  const notes = (book.annotations || []).slice().reverse();
  if (!notes.length) return '<p class="empty compact">' + t('noAnnotations') + '</p>';
  return notes.map((note) => '<div class="reader-note"><blockquote>' + escapeHtml(note.quote) + '</blockquote><p>' + escapeHtml(note.note) + '</p><button class="icon-btn small" data-delete-annotation="' + escapeHtml(note.id) + '" aria-label="' + t('close') + '">×</button></div>').join('');
}
function renderReaderDialog(content, hint = '') {
  const book = readerBookById(state.readerBookId); const dialog = $('#readerDialog'); if (!book || !dialog) return;
  dialog.innerHTML = '<div class="reader-dialog-card" role="dialog" aria-modal="true"><div class="dialog-head"><div><h2>' + escapeHtml(book.name) + '</h2><small class="reader-file-meta">' + escapeHtml(hint || (book.type.toUpperCase() + ' · ' + Math.max(1, Math.round(book.size / 1024)) + ' KB')) + '</small></div><div class="reader-head-actions"><button class="secondary reader-annotate-button" data-annotate-selection hidden>' + t('addAnnotation') + '</button><button class="icon-btn small" data-close-reader aria-label="' + t('closeReader') + '">×</button></div></div><article class="reader-content" data-reader-content>' + content + '</article><section class="reader-annotations"><div class="subhead"><h3>' + t('annotations') + '</h3><small>' + t('annotationHint') + '</small></div><div class="reader-note-list">' + readerAnnotationMarkup(book) + '</div></section></div>';
  dialog.hidden = false;
}
async function openReaderBook(id) {
  const book = readerBookById(id); if (!book) return;
  state.readerBookId = id; state.readerSelectedText = ''; book.lastOpenedAt = Date.now(); saveLibrary();
  try {
    let content = ''; let hint = '';
    if (book.type === 'md') content = markdownToHtml(book.content);
    else {
      const data = await oneBoxDbGet('books', id); if (!data) throw Error();
      const bytes = new Uint8Array(data);
      if (book.type === 'epub') { const parsed = await epubToHtml(bytes); content = parsed.html; hint = parsed.title ? parsed.title + ' · ' + t('epubHint') : t('epubHint'); }
      else { state.readerUrl = URL.createObjectURL(new Blob([bytes], { type: 'application/pdf' })); content = '<iframe class="reader-pdf" title="' + escapeHtml(book.name) + '" src="' + state.readerUrl + '"></iframe>'; hint = t('pdfHint'); }
    }
    renderReaderDialog(content, hint);
    setTimeout(() => { const node = $('[data-reader-content]'); if (node && book.progress) node.scrollTop = node.scrollHeight * book.progress; }, 0);
  } catch { toast(t('importFailed'), 'error'); state.readerBookId = null; }
}
function closeReader() {
  if (state.readerUrl) URL.revokeObjectURL(state.readerUrl);
  state.readerUrl = ''; state.readerBookId = null; state.readerSelectedText = '';
  const dialog = $('#readerDialog'); if (dialog) dialog.hidden = true;
}
function renderAnnotationDialog() {
  if (!state.readerSelectedText) return;
  const dialog = $('#annotationDialog'); if (!dialog) return;
  dialog.innerHTML = '<div class="dialog-card annotation-dialog-card" role="dialog" aria-modal="true"><div class="dialog-head"><h2>' + t('addAnnotation') + '</h2><button class="icon-btn small" data-close-annotation aria-label="' + t('close') + '">×</button></div><blockquote class="annotation-quote">' + escapeHtml(state.readerSelectedText) + '</blockquote><textarea id="annotationText" maxlength="500" placeholder="' + t('annotationPlaceholder') + '"></textarea><button class="primary full-width" data-save-annotation>' + t('saveAnnotation') + '</button></div>';
  dialog.hidden = false;
}
function reader() {
  const books = [...state.library].sort((a, b) => Number(b.lastOpenedAt || b.createdAt) - Number(a.lastOpenedAt || a.createdAt));
  const cards = books.length ? books.map((book) => '<article class="book-card"><button class="book-open" data-open-reader="' + escapeHtml(book.id) + '"><span class="book-cover ' + book.type + '">' + book.type.toUpperCase() + '</span><span class="book-copy"><strong>' + escapeHtml(book.name) + '</strong><small>' + (book.lastOpenedAt ? t('reading') : t('openBook')) + ' · ' + Math.max(1, Math.round(book.size / 1024)) + ' KB</small></span></button><button class="icon-btn small book-delete" data-delete-book="' + escapeHtml(book.id) + '" aria-label="' + t('deleteBook') + '">×</button></article>').join('') : '<p class="empty compact">' + t('noBooks') + '</p>';
  return heading(t('reader'), t('readerHint')) + '<div class="reader-shell"><div class="reader-toolbar"><div><h2>' + t('bookshelf') + '</h2><p>' + t('readerHint') + '</p></div><button class="primary" data-open-reader-file>＋ ' + t('addBook') + '</button><input id="readerFileInput" type="file" hidden multiple accept=".md,.markdown,.pdf,.epub,text/markdown,application/pdf,application/epub+zip"></div><div class="bookshelf-grid">' + cards + '</div></div>';
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
const calcKeys = ['AC', '⌫', '(', ')', '7', '8', '9', '÷', '4', '5', '6', '×', '1', '2', '3', '−', '0', '.', '%', '+', '±', '00', '=', 'ƒx'];
const scienceKeys = [['sin', 'sin('], ['cos', 'cos('], ['tan', 'tan('], ['ln', 'ln('], ['log', 'log('], ['√', 'sqrt('], ['x²', '^2'], ['xʸ', '^'], ['π', 'π'], ['e', 'e'], ['sin⁻¹', 'asin('], ['cos⁻¹', 'acos('], ['tan⁻¹', 'atan('], ['abs', 'abs('], ['exp', 'exp('], ['!', '!']];
const calcPreview = () => { if (!state.calcExpr) return '0'; try { return formatNumber(evaluateExpression(state.calcExpr)); } catch { return '—'; } };
function saveCalculator() { saveStored(STORAGE.calculator, { expr: state.calcExpr, history: state.calcHistory.slice(0, 30) }); }
function calculator() {
  const history = state.calcHistory.length ? state.calcHistory.slice(0, 8).map((item) => {
    const id = item.id || String(item.at || item.expression);
    return '<div class="swipe-row history-swipe-row" data-swipe-row><button class="history-item swipe-content" data-history-expression="' + escapeHtml(item.expression) + '"><span>' + escapeHtml(item.expression) + '</span><b>' + escapeHtml(item.result) + '</b></button><button class="swipe-delete" data-delete-calc-history="' + escapeHtml(id) + '">' + (state.language === 'en' ? 'Delete' : '删除') + '</button></div>';
  }).join('') : '<p class="empty compact">' + t('ready') + '</p>';
  const science = '<button class="science-key angle-toggle" data-toggle-angle>' + (state.calcAngle === 'deg' ? t('degree') : t('radian')) + '</button>' + scienceKeys.map(([label, key]) => '<button class="science-key" data-science-key="' + escapeHtml(key) + '">' + label + '</button>').join('');
  const basic = calcKeys.map((key) => key === 'ƒx'
    ? '<button class="key scientific-toggle" data-toggle-scientific aria-pressed="' + (state.calcScientific ? 'true' : 'false') + '" aria-label="' + t('scientific') + '">ƒx</button>'
    : '<button class="key ' + (/[÷×−+%]/.test(key) ? 'op' : '') + ' ' + (key === '=' ? 'equal' : '') + ' ' + (key === 'AC' ? 'danger' : '') + '" data-key="' + key + '">' + key + '</button>').join('');
  return heading(t('calculator'), t('calculatorDesc')) +
    '<div class="calculator-layout"><div class="calculator-surface"><div class="display" aria-live="polite"><div class="expression">' + (escapeHtml(state.calcExpr) || (state.language === 'en' ? 'Ready' : '准备计算')) + '</div><div class="result">' + calcPreview() + '</div><div class="display-history"><div class="display-history-head"><span>' + t('recentCalculations') + '</span><button class="text-btn" data-clear-calc-history ' + (state.calcHistory.length ? '' : 'disabled') + '>' + t('clear') + '</button></div><div class="display-history-list">' + history + '</div></div></div>' +
    '<div class="calculator-keyboard"><div class="scientific-bar" ' + (state.calcScientific ? '' : 'hidden') + '>' + science + '</div><div class="keys">' + basic + '</div></div><p class="keyboard-hint">' + t('keyboard') + '</p></div></div>';
}
function calculatorKey(key) {
  if (key === 'AC') { state.calcExpr = ''; state.calcJustEvaluated = false; }
  else if (key === '⌫') { state.calcExpr = state.calcExpr.slice(0, -1); state.calcJustEvaluated = false; }
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
    ? selectedEvents.map((item) => '<div class="swipe-row event-swipe-row" data-swipe-row><div class="event-item swipe-content"><div><strong>' + escapeHtml(item.title) + '</strong><small>' + (item.time ? escapeHtml(item.time) : (state.language === 'en' ? 'All day' : '全天')) + '</small></div><button class="swipe-delete" data-delete-event="' + escapeHtml(item.id) + '">' + (state.language === 'en' ? 'Delete' : '删除') + '</button></div></div>').join('')
    : '<p class="empty compact">' + t('noAgenda') + '</p>';
  const monthLabel = state.language === 'en' ? new Intl.DateTimeFormat('en-US', { month: 'long' }).format(first) + ' ' + year : year + ' 年 ' + (month + 1) + ' 月';
  const weekdays = state.language === 'en' ? ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] : ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];
  const alarmMarkup = renderAlarmPanel();
  return heading(t('calendar'), t('calendarDesc')) +
    '<div class="calendar-layout"><div class="calendar-card"><div class="calendar-top"><button class="icon-btn" data-month="-1" aria-label="Previous month">←</button><div class="calendar-month"><strong>' + monthLabel + '</strong><button class="text-btn calendar-today" data-today>' + t('today') + '</button></div><button class="icon-btn" data-month="1" aria-label="Next month">→</button></div>' +
    '<div class="calendar-legend"><span><i class="dot off"></i>' + t('legalHoliday') + '</span><span><i class="dot work"></i>' + t('makeUpWorkday') + '</span><span><i class="dot term"></i>' + t('solarTerm') + '</span><button class="calendar-add-event" data-open-event-dialog><span aria-hidden="true">＋</span>' + t('addAgenda') + '</button></div><div class="calendar-grid">' + weekdays.map((day) => '<div class="dow">' + day + '</div>').join('') + cells + '</div></div>' +
   '<aside class="agenda-panel"><div class="subhead"><h3>' + t('agenda') + '</h3><button class="calendar-add-event" data-open-event-dialog><span aria-hidden="true">＋</span>' + t('addAgenda') + '</button></div><div class="event-list">' + eventList + '</div></aside></div>' + alarmMarkup;
}
function saveEvents() { saveStored(STORAGE.events, state.events); }

function renderEventDialog() {
  const dialog = $('#eventDialog');
  if (!dialog) return;
  const options = ['once', 'daily', 'workdays', 'restdays', 'weekly'].map((value) => '<option value="' + value + '">' + t(value === 'daily' ? 'everyDay' : value) + '</option>').join('');
  const weekdays = alarmWeekdayLabels.map((label, index) => '<label class="weekday-option"><input type="checkbox" name="eventWeekday" value="' + index + '" ' + (index < 5 ? 'checked' : '') + '><span>' + (state.language === 'en' ? ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][index] : label) + '</span></label>').join('');
  dialog.innerHTML = '<div class="dialog-card event-dialog-card" role="dialog" aria-modal="true"><div class="dialog-head"><h2>' + t('newReminder') + '</h2><button class="icon-btn small" data-close-event-dialog aria-label="' + t('close') + '">×</button></div><form id="eventForm" class="event-form"><div class="field"><label for="eventTitle">' + t('eventContent') + '</label><input id="eventTitle" required maxlength="60" placeholder="' + t('eventPlaceholder') + '"></div><div class="field"><label>' + t('reminderSchedule') + '</label><div class="event-date-time-grid"><input id="eventDate" type="date" value="' + escapeHtml(state.selectedDate) + '" aria-label="' + t('eventDate') + '" required><input id="eventTime" type="time" step="1" aria-label="' + t('eventTime') + '"></div></div><div class="field"><label for="eventRepeat">' + t('eventRepeat') + '</label><select id="eventRepeat">' + options + '</select></div><div class="field event-weekdays-field" hidden><label>' + t('weekdays') + '</label><div class="weekday-options">' + weekdays + '</div></div><button class="primary full-width" type="submit">' + t('addEvent') + '</button></form></div>';
  dialog.hidden = false;
}
function closeEventDialog() { const dialog = $('#eventDialog'); if (dialog) dialog.hidden = true; }
const alarmRepeatOptions = ['once', 'daily', 'workdays', 'restdays', 'weekly'];
const alarmWeekdayLabels = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];
function saveAlarms() { saveStored(STORAGE.alarms, state.alarms.slice(0, 40)); }
function isWorkdayKey(key) {
  const holiday = holidayFor(key);
  if (holiday) return !holiday.isOffDay;
  const day = dateFromKey(key).getDay();
  return day !== 0 && day !== 6;
}
function alarmMatchesDay(alarm, key) {
  const weekday = (dateFromKey(key).getDay() + 6) % 7;
  if (alarm.repeat === 'daily') return true;
  if (alarm.repeat === 'workdays') return isWorkdayKey(key);
  if (alarm.repeat === 'restdays') return !isWorkdayKey(key);
  if (alarm.repeat === 'weekly') return (alarm.weekdays || [weekday]).map(Number).includes(weekday);
  return false;
}
function nextRecurringAlarmAt(alarm, from = Date.now()) {
  const start = new Date(from);
  for (let offset = 0; offset <= 14; offset += 1) {
    const candidate = new Date(start.getFullYear(), start.getMonth(), start.getDate() + offset);
    const key = dateKey(candidate);
    if (!alarmMatchesDay(alarm, key) || !alarm.time) continue;
    const value = new Date(key + 'T' + alarm.time).getTime();
    if (Number.isFinite(value) && value > from + 250) return value;
  }
  return 0;
}
function alarmDisplayRepeat(alarm) {
  if (alarm.repeat === 'once') return new Intl.DateTimeFormat(state.language === 'en' ? 'en-US' : 'zh-CN', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(alarm.at));
  if (alarm.repeat === 'daily') return t('everyDay') + ' · ' + alarm.time;
  if (alarm.repeat === 'workdays') return t('workdays') + ' · ' + alarm.time;
  if (alarm.repeat === 'restdays') return t('restdays') + ' · ' + alarm.time;
  const days = (alarm.weekdays || []).map((day) => state.language === 'en' ? ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][Number(day)] : alarmWeekdayLabels[Number(day)]).filter(Boolean).join('、');
  return t('weekly') + ' · ' + (days || (state.language === 'en' ? 'Mon' : '周一')) + ' · ' + alarm.time;
}
function renderAlarmPanel() {
  const alarms = [...state.alarms].sort((a, b) => Number(b.createdAt || 0) - Number(a.createdAt || 0));
  const list = alarms.length ? alarms.map((alarm) => '<div class="alarm-item ' + (alarm.enabled === false ? 'disabled' : '') + '"><button class="alarm-toggle" data-toggle-alarm="' + escapeHtml(alarm.id) + '" aria-pressed="' + (alarm.enabled !== false ? 'true' : 'false') + '"><span class="alarm-toggle-dot"></span></button><div class="alarm-item-copy"><strong>' + escapeHtml(alarm.title) + '</strong><small>' + escapeHtml(alarmDisplayRepeat(alarm)) + '</small></div><button class="icon-btn small" data-delete-alarm="' + escapeHtml(alarm.id) + '" aria-label="' + t('close') + '">×</button></div>').join('') : '<p class="empty compact">' + t('noAlarms') + '</p>';
  return '<section class="alarm-panel"><div class="subhead"><div><h3>' + t('alarm') + '</h3><small class="settings-note">' + t('alarmHint') + '</small></div><button class="calendar-add-event" data-open-alarm-dialog><span aria-hidden="true">＋</span>' + t('addAlarm') + '</button></div><div class="alarm-list">' + list + '</div></section>';
}
function renderAlarmDialog() {
  const dialog = $('#alarmDialog');
  if (!dialog) return;
  const defaultAt = Date.now() + 3600000;
  const weekdays = alarmWeekdayLabels.map((label, index) => '<label class="weekday-option"><input type="checkbox" name="alarmWeekday" value="' + index + '" ' + (index < 5 ? 'checked' : '') + '><span>' + (state.language === 'en' ? ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][index] : label) + '</span></label>').join('');
  dialog.innerHTML = '<div class="dialog-card alarm-dialog-card" role="dialog" aria-modal="true"><div class="dialog-head"><h2>' + t('addAlarm') + '</h2><button class="icon-btn small" data-close-alarm-dialog aria-label="' + t('close') + '">×</button></div><form id="alarmForm" class="event-form"><div class="field"><label for="alarmTitle">' + t('alarmContent') + '</label><input id="alarmTitle" required maxlength="60" placeholder="' + t('alarmPlaceholder') + '"></div><div class="field"><label for="alarmRepeat">' + t('alarmRepeat') + '</label><select id="alarmRepeat">' + alarmRepeatOptions.map((value) => '<option value="' + value + '">' + t(value === 'daily' ? 'everyDay' : value) + '</option>').join('') + '</select></div><div class="field alarm-once-field"><label for="alarmAt">' + t('alarmAt') + '</label><input id="alarmAt" type="datetime-local" step="1" value="' + escapeHtml(localDateTimeValue(defaultAt)) + '" required></div><div class="field alarm-repeat-field" hidden><label for="alarmTime">' + t('alarmAt') + '</label><input id="alarmTime" type="time" step="1" value="08:00:00"></div><div class="field alarm-weekdays-field" hidden><label>' + t('weekdays') + '</label><div class="weekday-options">' + weekdays + '</div></div><button class="primary full-width" type="submit">' + t('addAlarm') + '</button></form></div>';
  dialog.hidden = false;
}
function closeAlarmDialog() { const dialog = $('#alarmDialog'); if (dialog) dialog.hidden = true; }
function syncAlarmReminders() {
  const now = Date.now();
  state.alarms.filter((alarm) => alarm.enabled !== false).forEach((alarm) => {
    const at = alarm.repeat === 'once' ? Number(alarm.at) : nextRecurringAlarmAt(alarm, now);
    if (!Number.isFinite(at) || !at || (alarm.repeat === 'once' && at < now - 86400000)) return;
    const id = 'alarm:' + alarm.id + ':' + at;
    if (!state.notifications.some((item) => item.id === id)) state.notifications.push({ id, text: alarm.title, at, read: true, delivered: false, source: 'alarm', alarmId: alarm.id });
  });
  saveNotifications();
}
function createAlarmFromForm() {
  const title = $('#alarmTitle')?.value.trim();
  const repeat = $('#alarmRepeat')?.value || 'once';
  if (!title) return;
  const alarm = { id: uid(), title, repeat, enabled: true, createdAt: Date.now() };
  if (repeat === 'once') {
    const at = new Date($('#alarmAt').value).getTime();
    if (!Number.isFinite(at) || at <= Date.now()) return toast(state.language === 'en' ? 'Choose a future time' : '请选择未来的提醒时间', 'error');
    alarm.at = at;
  } else {
    alarm.time = $('#alarmTime').value;
    if (!alarm.time) return toast(state.language === 'en' ? 'Choose a reminder time' : '请选择提醒时间', 'error');
    alarm.weekdays = repeat === 'weekly' ? $$('input[name="alarmWeekday"]', $('#alarmDialog')).filter((input) => input.checked).map((input) => Number(input.value)) : [];
    if (repeat === 'weekly' && !alarm.weekdays.length) return toast(state.language === 'en' ? 'Choose at least one weekday' : '请至少选择一个星期', 'error');
    if (!nextRecurringAlarmAt(alarm)) return toast(state.language === 'en' ? 'No upcoming alarm time' : '没有可用的下一次提醒时间', 'error');
  }
  state.alarms.unshift(alarm); saveAlarms(); syncAlarmReminders(); scheduleNotificationCheck(); closeAlarmDialog(); render(); toast(state.language === 'en' ? 'Alarm added' : '闹钟已添加');
}
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
const weatherUrl = (lat, lon) => 'https://api.open-meteo.com/v1/forecast?latitude=' + encodeURIComponent(lat) + '&longitude=' + encodeURIComponent(lon) + '&current=temperature_2m,apparent_temperature,weather_code,relative_humidity_2m,wind_speed_10m,precipitation&hourly=temperature_2m,apparent_temperature,weather_code,precipitation_probability,uv_index,wind_speed_10m,relative_humidity_2m&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,sunrise,sunset,uv_index_max,wind_speed_10m_max&timezone=auto&past_days=3&forecast_days=16';
function saveWeatherCards() { saveStored(STORAGE.weatherCards, state.weatherCards); }
async function getWeatherData(lat, lon) {
  const response = await fetchWithTimeout(weatherUrl(lat, lon), { headers: { Accept: 'application/json' } }, 9000);
  if (!response.ok) throw Error(state.language === 'en' ? 'Weather service is unavailable' : '天气服务暂时不可用');
  return response.json();
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
  if (!card) return;
  const request = ++state.weatherRequest; state.weatherLoading = true; state.weatherError = ''; render();
  try { const data = await getWeatherData(card.latitude, card.longitude); if (request !== state.weatherRequest) return; Object.assign(card, data, { updatedAt: Date.now() }); saveWeatherCards(); }
  catch (error) { state.weatherError = error.message || (state.language === 'en' ? 'Refresh failed' : '刷新失败'); }
  finally { if (request === state.weatherRequest) { state.weatherLoading = false; render(); } }
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
function weatherAdvice(weather, current) {
  const temperature = Number(current.temperature_2m ?? 20);
  const rain = Number(current.precipitation ?? 0);
  const probability = Number(weather.daily?.precipitation_probability_max?.[0] ?? 0);
  const wind = Number(current.wind_speed_10m ?? 0);
  const uv = Number(weather.daily?.uv_index_max?.[0] ?? 0);
  const code = Number(current.weather_code);
  const rainy = rain > .1 || probability >= 55 || [51, 53, 55, 61, 63, 65, 80, 81, 82].includes(code);
  return [
    { icon: '🚶', title: t('commute'), body: rainy ? (state.language === 'en' ? 'Take an umbrella and allow extra travel time.' : '有降雨可能，带伞并预留出行时间。') : (state.language === 'en' ? 'Good conditions for normal travel.' : '适合正常出行，路上注意安全。') },
    { icon: '🏃', title: t('sport'), body: wind > 35 || rainy ? (state.language === 'en' ? 'Consider an indoor workout.' : '风雨较明显，建议选择室内运动。') : (state.language === 'en' ? 'Suitable for outdoor exercise; hydrate.' : '适合户外运动，注意补水。') },
    { icon: '🧥', title: t('clothing'), body: temperature < 10 ? (state.language === 'en' ? 'Layer up with a warm coat.' : '气温偏低，建议分层保暖。') : temperature > 28 ? (state.language === 'en' ? 'Light, breathable clothing is best.' : '天气偏热，穿轻薄透气衣物。') : (state.language === 'en' ? 'A light layer should be comfortable.' : '薄外套或长袖即可，体感舒适。') },
    { icon: '🕶️', title: t('sunscreen'), body: uv >= 6 ? (state.language === 'en' ? 'High UV: sunscreen, hat and sunglasses recommended.' : '紫外线偏强，建议防晒、戴帽和太阳镜。') : (state.language === 'en' ? 'UV is moderate; sunscreen is still useful.' : '紫外线中等，外出仍建议做好防晒。') },
    { icon: '🥾', title: t('hiking'), body: rainy || wind > 40 ? (state.language === 'en' ? 'Trail may be slippery or windy; check conditions first.' : '山路可能湿滑或风大，出发前确认路况。') : (state.language === 'en' ? 'Good for a short hike; bring water.' : '适合短途爬山，带足饮水。') },
  ];
}
function weather() {
  const active = state.weatherCards.find((item) => item.id === state.activeWeatherId) || state.weatherCards[0];
  const search = '<form id="weatherSearch" class="weather-search"><label class="sr-only" for="cityInput">' + t('searchPlace') + '</label><div class="weather-search-field"><input id="cityInput" placeholder="' + t('searchPlace') + '" autocomplete="off"></div><button class="weather-location-button" type="button" data-locate aria-label="' + t('currentLocation') + '"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="7"></circle><circle cx="12" cy="12" r="2"></circle><path d="M12 2v3M12 19v3M2 12h3M19 12h3"></path></svg></button><button class="primary" type="submit">' + t('weatherSearch') + '</button><button class="secondary" type="button" data-refresh-weather>' + t('refresh') + '</button></form>';
  const results = state.weatherSearchResults.length ? '<div class="weather-search-results"><div class="search-results-head"><strong>' + (state.language === 'en' ? 'Search results' : '搜索结果') + '</strong><small>' + (state.language === 'en' ? 'Choose a place, then add it to weather cards' : '选择地点后再添加到天气卡片') + '</small></div>' + state.weatherSearchResults.map((place, index) => '<div class="weather-result"><span><strong>' + escapeHtml(place.name) + '</strong><small>' + escapeHtml(placeLabel(place)) + '</small></span><button class="secondary" data-weather-result-index="' + index + '">' + t('addCard') + '</button></div>').join('') + '</div>' : '';
  if (!active) return heading(t('weather'), t('weatherDesc')) + search + results + '<div class="empty weather-empty">' + (state.weatherLoading ? '<span class="loader"></span>' + t('weatherLoading') : t('noWeather')) + (state.weatherError ? '<strong class="error-text">' + escapeHtml(state.weatherError) + '</strong>' : '') + '</div>';
  const current = active.current || {};
  const cards = state.weatherCards.map((card, index) => {
    const item = card.loading && !card.current ? ['⏳', t('weatherLoading')] : weatherCode(card.current?.weather_code);
    const cardCurrent = card.current || {};
    const temperature = card.loading && !card.current ? '…' : Math.round(cardCurrent.temperature_2m ?? 0) + '°';
    const details = card.loading && !card.current ? t('weatherLoading') : (state.language === 'en' ? 'Feels ' : '体感 ') + Math.round(cardCurrent.apparent_temperature ?? cardCurrent.temperature_2m ?? 0) + '° · ' + (state.language === 'en' ? 'Humidity ' : '湿度 ') + (cardCurrent.relative_humidity_2m ?? '—') + '% · ' + (state.language === 'en' ? 'Wind ' : '风速 ') + Math.round(cardCurrent.wind_speed_10m ?? 0) + ' km/h';
    return '<button class="weather-card ' + (card.id === active.id ? 'active' : '') + (card.loading ? ' loading' : '') + '" draggable="true" data-weather-card="' + card.id + '" data-weather-index="' + index + '"><div class="weather-card-head"><span><strong>' + escapeHtml(card.name) + '</strong><small>' + escapeHtml([card.admin2, card.admin1].filter(Boolean).join(' · ') || card.country || '') + '</small></span><span class="weather-card-icon" aria-hidden="true">' + item[0] + '</span></div><div class="weather-card-main"><span class="weather-card-temp">' + temperature + '</span><span class="weather-card-condition">' + escapeHtml(item[1]) + '</span></div><span class="weather-card-meta">' + escapeHtml(details) + '</span></button>';
  }).join('');
  const title = [active.name, active.admin2, active.admin1, active.country].filter(Boolean).join(' · ');
  if (active.loading && !active.current) {
    return heading(t('weather'), escapeHtml(title)) + search + results + '<p class="weather-sort-hint">' + t('sortWeather') + '</p><div class="weather-card-list">' + cards + '</div>';
  }
  const hourlyTimes = active.hourly?.time || [];
  const selectedHour = currentHourIndex(active);
  const currentHour = selectedHour >= 0 ? selectedHour : 0;
  const hourlyStart = Math.max(0, currentHour - 12);
  const hourlyEnd = Math.min(hourlyTimes.length, currentHour + 13);
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
  setTimeout(() => {
    [['[data-current-hour]', '.hourly-strip'], ['[data-current-day]', '.weather-days']].forEach(([cardSelector, stripSelector]) => {
      const card = $(cardSelector); const strip = $(stripSelector); if (!card || !strip) return;
      strip.scrollTo({ left: Math.max(0, card.offsetLeft - (strip.clientWidth - card.offsetWidth) / 2), behavior: 'smooth' });
    });
  }, 0);
  return heading(t('weather'), escapeHtml(title) + ' · ' + (state.language === 'en' ? 'updated' : '更新于') + ' ' + (active.updatedAt ? new Intl.DateTimeFormat(state.language === 'en' ? 'en-US' : 'zh-CN', { hour: '2-digit', minute: '2-digit' }).format(active.updatedAt) : (state.language === 'en' ? 'cached' : '本机缓存'))) +
    search + results + (state.weatherError ? '<div class="inline-alert">' + escapeHtml(state.weatherError) + '，' + (state.language === 'en' ? 'showing the last successful result' : '当前显示上次成功结果') + '。</div>' : '') +
    '<p class="weather-sort-hint">' + t('sortWeather') + '</p><div class="weather-card-list">' + cards + '</div>' +
    '<h3 class="weather-section-title">' + t('hourly') + '</h3><div class="hourly-strip">' + hourly + '</div><h3 class="weather-section-title">' + t('advice') + '</h3><div class="advice-strip">' + advice + '</div><h3 class="weather-section-title">' + t('daily') + '</h3><div class="weather-days">' + days + '</div><p class="note">' + t('weatherData') + '</p>';
}

// Converter ------------------------------------------------------------------
const units = {
  length: { name: '长度 / Length', units: [['米', 'm', 1], ['千米', 'km', 1000], ['厘米', 'cm', .01], ['毫米', 'mm', .001], ['英寸', 'in', .0254], ['英尺', 'ft', .3048], ['英里', 'mi', 1609.344]] },
  weight: { name: '重量 / Weight', units: [['克', 'g', 1], ['千克', 'kg', 1000], ['斤', '斤', 500], ['磅', 'lb', 453.59237], ['盎司', 'oz', 28.349523125]] },
  area: { name: '面积 / Area', units: [['平方米', 'm²', 1], ['平方千米', 'km²', 1e6], ['公顷', 'ha', 1e4], ['亩', '亩', 2000 / 3], ['平方英尺', 'ft²', .09290304]] },
  volume: { name: '体积 / Volume', units: [['升', 'L', 1], ['毫升', 'mL', .001], ['立方米', 'm³', 1000], ['美制加仑', 'gal', 3.785411784]] },
  speed: { name: '速度 / Speed', units: [['米/秒', 'm/s', 1], ['千米/时', 'km/h', 1 / 3.6], ['英里/时', 'mph', .44704], ['节', 'kn', .514444]] },
  time: { name: '时间 / Time', units: [['秒', 's', 1], ['分钟', 'min', 60], ['小时', 'h', 3600], ['天', 'd', 86400], ['周', 'wk', 604800]] },
  data: { name: '数据 / Data', units: [['字节', 'B', 1], ['千字节', 'KB', 1024], ['兆字节', 'MB', 1024 ** 2], ['吉字节', 'GB', 1024 ** 3], ['太字节', 'TB', 1024 ** 4]] },
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
function convert() {
  const category = units[conversion.category];
  const categories = Object.entries(units).map(([key, item]) => '<option value="' + key + '" ' + (key === conversion.category ? 'selected' : '') + '>' + item.name + '</option>').join('');
  return heading(t('convert'), t('convertDesc')) +
    '<div class="converter-card"><div class="field field-inline"><label for="conversionCategory">' + t('converterType') + '</label><select id="conversionCategory">' + categories + '</select></div><div class="conversion-row">' +
    '<div class="field field-inline"><label for="fromUnit">' + t('from') + '</label><select id="fromUnit">' + unitOptions(category, conversion.from) + '</select><input id="conversionValue" type="number" step="any" inputmode="decimal" value="' + escapeHtml(conversion.value) + '" aria-label="' + t('from') + '"></div>' +
    '<button class="swap" data-swap aria-label="' + t('swap') + '">⇄</button><div class="field field-inline"><label for="toUnit">' + t('to') + '</label><select id="toUnit">' + unitOptions(category, conversion.to) + '</select><div class="conversion-result" aria-live="polite"><small>' + t('result') + '</small><strong>' + formatNumber(convertedValue()) + '</strong><span>' + category.units[conversion.to][1] + '</span></div></div></div>' +
    '<button class="secondary copy-button" data-copy-conversion>' + t('copyResult') + '</button><span class="copy-status" id="copyStatus"></span></div>';
}

// Translation ---------------------------------------------------------------
const languageOptions = [['auto', '自动检测 / Auto'], ['zh', '中文 / Chinese'], ['en', 'English'], ['ja', '日本語 / Japanese'], ['ko', '한국어 / Korean']];
const translateEndpoints = ['https://translate.argosopentech.com/translate', 'https://translate.astian.org/translate', 'https://libretranslate.com/translate'];
async function fetchWithTimeout(url, options, timeout = 7000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);
  try { return await fetch(url, { ...options, signal: controller.signal }); } finally { clearTimeout(timer); }
}
function saveTranslationHistory() { saveStored(STORAGE.translationHistory, state.translationHistory.slice(0, 30)); }
async function translateText() {
  const input = state.translation.input.trim();
  if (!input) return toast(state.language === 'en' ? 'Enter text to translate' : '请输入要翻译的内容', 'error');
  if (state.translation.source !== 'auto' && state.translation.source === state.translation.target) { state.translation.result = input; return render(); }
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
    state.translation.result = translated;
    state.translationHistory.unshift({ id: uid(), source: state.translation.source, target: state.translation.target, input, result: translated, createdAt: Date.now() });
    saveTranslationHistory();
  } catch (error) { state.translation.error = error.message; }
  finally { state.translation.loading = false; render(); }
}
function translateView() {
  const history = state.translationHistory.length
    ? state.translationHistory.slice(0, 12).map((item) => '<div class="swipe-row translation-swipe-row" data-swipe-row><button class="translation-history-item swipe-content" data-translation-history="' + escapeHtml(item.id) + '"><b>' + escapeHtml(item.input.slice(0, 70)) + '</b><small>' + escapeHtml(item.result.slice(0, 100)) + '</small></button><button class="swipe-delete" data-delete-translation="' + escapeHtml(item.id) + '">' + (state.language === 'en' ? 'Delete' : '删除') + '</button></div>').join('')
    : '<p class="empty compact">' + t('noHistory') + '</p>';
  const options = (selected) => languageOptions.map(([value, label]) => '<option value="' + value + '" ' + (selected === value ? 'selected' : '') + '>' + label + '</option>').join('');
  const result = state.translation.loading ? (state.language === 'en' ? 'Translating…' : '翻译中…') : state.translation.result || t('noTranslation');
  return heading(t('translate'), t('translateDesc')) +
    '<div class="translation-layout"><div class="translation-card"><div class="translation-toolbar"><div class="field field-inline"><label for="translationSource">' + t('source') + '</label><select id="translationSource">' + options(state.translation.source) + '</select></div><button class="swap" data-swap-language aria-label="' + t('swap') + '">⇄</button><div class="field field-inline"><label for="translationTarget">' + t('target') + '</label><select id="translationTarget">' + options(state.translation.target) + '</select></div></div>' +
    '<div class="field"><label for="translationInput">' + t('translationInput') + '</label><div class="translation-input-wrap"><textarea id="translationInput" maxlength="5000" placeholder="' + (state.language === 'en' ? 'Type or paste text here…' : '输入或粘贴文字…') + '">' + escapeHtml(state.translation.input) + '</textarea><div class="translation-input-actions"><button class="input-action" data-translate-submit ' + (state.translation.loading ? 'disabled' : '') + ' aria-label="' + t('translateNow') + '"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m4 12 16-8-5 16-3-6-8-2Z"/><path d="m12 14 4-4"/></svg></button><button class="input-action" data-save-translation aria-label="' + t('saveTranslation') + '"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 4h11l3 3v13H5zM8 4v6h8V4M8 16h8"/></svg></button></div></div></div><h3 class="weather-section-title">' + t('translationResult') + '</h3><div class="translation-result ' + (state.translation.result ? '' : 'placeholder') + '">' + escapeHtml(result) + '</div>' + (state.translation.error ? '<p class="inline-alert">' + escapeHtml(state.translation.error) + '</p>' : '') + '</div>' +
    '<aside class="translation-history"><div class="subhead"><h3>' + t('translationHistory') + '</h3><button class="text-btn" data-clear-translation-history>' + t('clear') + '</button></div><div class="translation-history-list">' + history + '</div></aside></div>';
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
  syncAlarmReminders();
  const due = state.notifications.filter((item) => !item.delivered && item.at && item.at <= Date.now());
  due.forEach((item) => {
    item.delivered = true; item.read = false; showNativeNotification(item); playAlertChime(); toast(item.text);
    if (item.source === 'alarm') {
      try { navigator.vibrate?.([180, 100, 180]); } catch { /* vibration is optional */ }
      const alarm = state.alarms.find((entry) => entry.id === item.alarmId);
      if (alarm?.repeat === 'once') { alarm.enabled = false; alarm.triggered = true; }
    }
  });
  if (due.length) saveNotifications();
  if (due.some((item) => item.source === 'alarm')) saveAlarms();
  if (due.length) syncAlarmReminders();
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
  const list = items.length ? items.map((item) => '<div class="notification-item ' + (item.read ? '' : 'unread') + '"><div><strong>' + escapeHtml(item.text) + '</strong><small>' + new Intl.DateTimeFormat(state.language === 'en' ? 'en-US' : 'zh-CN', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(item.at)) + '</small></div><button class="icon-btn small" data-delete-notification="' + escapeHtml(item.id) + '" aria-label="Delete">×</button></div>').join('') : '<p class="empty compact">' + t('noNotifications') + '</p>';
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
async function requestNotifications() {
  if (!('Notification' in window)) return toast(state.language === 'en' ? 'This browser does not support notifications' : '当前浏览器不支持通知', 'error');
  if (isIosDevice() && !isStandalonePwa()) return toast(state.language === 'en' ? 'Add OneBox to the Home Screen before enabling iPhone notifications' : '请先将 OneBox 添加到主屏幕，再开启 iPhone 消息通知', 'error');
  const permission = await Notification.requestPermission();
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
    app: 'OneBox', version: APP_VERSION, savedAt: new Date().toISOString(), theme: state.theme, languageMode: state.languageMode, language: state.language,
    toolOrder: state.toolOrder, calculator: parseStored(STORAGE.calculator, {}), events: state.events,
    weatherCards: state.weatherCards, translationHistory: state.translationHistory, notifications: state.notifications, alarms: state.alarms, library: state.library,
    headerVisibility: state.headerVisibility, bottomNavAutoHide: state.bottomNavAutoHide,
  };
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
  } catch (error) { toast(error.message, 'error'); }
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
    } catch (error) { state.github.deviceCode = ''; renderGithubDialog(); toast(error.message, 'error'); return; }
  }
  state.github.deviceCode = ''; renderGithubDialog(); toast(state.language === 'en' ? 'GitHub verification expired' : 'GitHub 验证已过期', 'error');
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
    if (remote.theme) state.theme = remote.theme;
    if (remote.languageMode || remote.language) state.languageMode = ['zh', 'en', 'system'].includes(remote.languageMode || remote.language) ? (remote.languageMode || remote.language) : 'system';
    if (Array.isArray(remote.toolOrder)) state.toolOrder = normalizeToolOrder(remote.toolOrder);
    if (remote.calculator) saveStored(STORAGE.calculator, remote.calculator);
    if (remote.events) { state.events = remote.events; saveEvents(); }
    if (Array.isArray(remote.weatherCards)) { state.weatherCards = remote.weatherCards; state.activeWeatherId = state.weatherCards[0]?.id || null; saveWeatherCards(); }
    if (Array.isArray(remote.translationHistory)) { state.translationHistory = remote.translationHistory; saveTranslationHistory(); }
    if (Array.isArray(remote.notifications)) { state.notifications = remote.notifications; saveNotifications(); }
    if (Array.isArray(remote.alarms)) { state.alarms = remote.alarms; saveAlarms(); }
    if (Array.isArray(remote.library)) { state.library = remote.library; saveLibrary(); }
    if (remote.headerVisibility && typeof remote.headerVisibility === 'object') { state.headerVisibility = { ...DEFAULT_HEADER_VISIBILITY, ...remote.headerVisibility }; saveStored(STORAGE.headerVisibility, state.headerVisibility); }
    if (typeof remote.bottomNavAutoHide === 'boolean') { state.bottomNavAutoHide = remote.bottomNavAutoHide; saveStored(STORAGE.bottomNavAutoHide, state.bottomNavAutoHide); }
    state.github.gistId = id; saveGithub(); applyLanguage(); renderNav(); render(); renderGithubDialog();
    toast(state.language === 'en' ? 'Settings restored from GitHub' : '已从 GitHub 恢复设置');
  } catch { toast(state.language === 'en' ? 'GitHub restore failed' : 'GitHub 恢复失败', 'error'); }
}
function disconnectGithub() {
  state.github = { clientId: state.github.clientId, token: '', user: null, gistId: '', deviceCode: '', userCode: '', verificationUri: '', expiresAt: 0, interval: 5 };
  saveGithub(); renderGithubDialog(); toast(state.language === 'en' ? 'GitHub disconnected' : '已退出 GitHub');
}
function renderAgreementDialog() {
  const dialog = $('#agreementDialog');
  if (!dialog) return;
  dialog.innerHTML = '<div class="dialog-card agreement-dialog-card" role="dialog" aria-modal="true"><div class="dialog-head"><h2>' + t('agreementTitle') + '</h2><button class="icon-btn small" data-close-agreement aria-label="' + t('close') + '">×</button></div><p class="agreement-copy">' + t('agreementBody') + '</p><p class="settings-note">' + (state.language === 'en' ? 'Last updated with app version ' : '随应用版本更新：') + APP_VERSION + '</p></div>';
  dialog.hidden = false;
}
function closeAgreementDialog() { const dialog = $('#agreementDialog'); if (dialog) dialog.hidden = true; }
function headerVisibilityToggle(key) {
  return '<label class="setting-toggle"><input type="checkbox" data-header-visibility="' + key + '" ' + (state.headerVisibility[key] ? 'checked' : '') + '><span>' + t('topDisplay') + '</span></label>';
}
function renderGithubDialog() {
  const dialog = $('#githubDialog');
  if (!dialog) return;
  const connected = Boolean(state.github.token && state.github.user);
  const account = connected
    ? '<div class="github-user"><img src="' + escapeHtml(state.github.user.avatar_url || '') + '" alt=""><div><strong>' + escapeHtml(state.github.user.login || 'GitHub') + '</strong><small>' + t('githubConnected') + '</small></div></div>'
    : '<span class="settings-note">' + t('githubNotConnected') + '</span>';
  const code = state.github.userCode ? '<div class="device-code"><small>' + (state.language === 'en' ? 'Enter this code at GitHub' : '请在 GitHub 验证页面输入') + '</small><strong>' + escapeHtml(state.github.userCode) + '</strong><p><a href="' + escapeHtml(state.github.verificationUri || 'https://github.com/login/device') + '" target="_blank" rel="noreferrer">' + t('openDevice') + '</a></p></div>' : '';
  dialog.innerHTML = '<div class="dialog-card github-dialog-card" role="dialog" aria-modal="true"><div class="dialog-head"><h2>GitHub</h2><button class="icon-btn small" data-close-github aria-label="' + t('close') + '">×</button></div><p class="settings-note">' + t('githubDescription') + '</p><div class="settings-row github-account-row"><h3>' + t('githubSync') + '</h3>' + account + '</div><div class="field"><label for="githubClientId">' + t('githubClientId') + '</label><input id="githubClientId" value="' + escapeHtml(state.github.clientId) + '" placeholder="Iv1.xxxxxxxxxxxxx"></div>' + code + '<div class="settings-actions">' + (connected ? '<button class="secondary" data-github-upload>' + t('upload') + '</button><button class="secondary" data-github-download>' + t('download') + '</button><button class="text-btn" data-github-logout>' + t('githubLogout') + '</button>' : '<button class="primary" data-github-login>' + t('githubLogin') + '</button>') + '</div></div>';
  dialog.hidden = false; state.githubDialogOpen = true;
}
function closeGithubDialog() { const dialog = $('#githubDialog'); if (dialog) dialog.hidden = true; state.githubDialogOpen = false; }
function renderSettings() {
  const dialog = $('#settingsDialog');
  const updateStatus = state.updateAvailable ? t('updateAvailable') : (state.updateChecking ? t('updating') : t('upToDate'));
  const updateAction = state.updateAvailable ? '<button class="primary" data-apply-update>' + t('applyUpdate') + '</button>' : '';
  dialog.innerHTML = '<div class="dialog-card settings-dialog-card" role="dialog" aria-modal="true"><div class="dialog-head"><h2>' + t('settings') + '</h2><button class="icon-btn small" data-close-settings aria-label="' + t('close') + '">×</button></div>' +
    '<div class="settings-preferences"><div class="settings-preference-row"><h3>' + t('theme') + '</h3><div class="settings-preference-control"><select id="settingsTheme"><option value="system" ' + (state.theme === 'system' ? 'selected' : '') + '>' + t('system') + '</option><option value="light" ' + (state.theme === 'light' ? 'selected' : '') + '>' + t('light') + '</option><option value="dark" ' + (state.theme === 'dark' ? 'selected' : '') + '>' + t('dark') + '</option></select>' + headerVisibilityToggle('theme') + '</div></div><div class="settings-preference-row"><h3>' + t('language') + '</h3><div class="settings-preference-control"><select id="settingsLanguage"><option value="system" ' + (state.languageMode === 'system' ? 'selected' : '') + '>' + t('system') + '</option><option value="zh" ' + (state.languageMode === 'zh' ? 'selected' : '') + '>中文</option><option value="en" ' + (state.languageMode === 'en' ? 'selected' : '') + '>English</option></select>' + headerVisibilityToggle('language') + '</div></div><div class="settings-preference-row"><h3>' + t('notifications') + '</h3><div class="settings-preference-control">' + headerVisibilityToggle('notifications') + '</div></div><div class="settings-preference-row"><h3>' + t('settings') + '</h3><div class="settings-preference-control">' + headerVisibilityToggle('settings') + '</div></div><div class="settings-preference-row"><h3>' + t('bottomTab') + '</h3><div class="settings-preference-control"><label class="setting-toggle"><input type="checkbox" id="bottomNavAutoHide" ' + (state.bottomNavAutoHide ? 'checked' : '') + '><span>' + t('autoHideBottomNav') + '</span></label></div></div></div>' +
    '<section class="settings-section"><div class="settings-row"><h3>' + t('appUpdate') + ' <small class="settings-version">v' + APP_VERSION + ' · ' + updateStatus + '</small></h3><div class="settings-preference-control"><button class="secondary" data-check-update ' + (state.updateChecking ? 'disabled' : '') + '>' + t('checkUpdate') + '</button>' + updateAction + headerVisibilityToggle('update') + '</div></div></section>' +
    '<section class="settings-section"><div class="settings-row"><h3>' + t('notificationsPermission') + '</h3><button class="secondary" data-request-notifications>' + t('enableNotifications') + '</button></div><small class="settings-note">' + notificationPermissionText() + '</small></section></div>';
  dialog.hidden = false; state.settingsOpen = true;
}
function closeSettings() { $('#settingsDialog').hidden = true; state.settingsOpen = false; }
function refreshUpdateIndicator() {
  const button = $('#updateBtn');
  if (!button) return;
  button.hidden = !state.headerVisibility.update;
  button.setAttribute('aria-label', state.updateAvailable ? t('applyUpdate') : t('checkUpdate'));
  button.dataset.updateAvailable = state.updateAvailable ? 'true' : 'false';
}
function markUpdateAvailable() {
  state.updateAvailable = true;
  refreshUpdateIndicator();
  if (state.settingsOpen) renderSettings();
}
async function checkForUpdate() {
  const registration = state.swRegistration || await navigator.serviceWorker?.getRegistration();
  if (!registration) return toast(state.language === 'en' ? 'Updates are unavailable in this browser' : '当前浏览器暂不支持更新检查', 'error');
  state.swRegistration = registration;
  state.updateChecking = true;
  if (state.settingsOpen) renderSettings();
  try {
    await registration.update();
    if (registration.waiting) markUpdateAvailable();
    else { state.updateAvailable = false; refreshUpdateIndicator(); if (state.settingsOpen) renderSettings(); toast(t('upToDate')); }
  } catch { toast(state.language === 'en' ? 'Update check failed' : '更新检查失败', 'error'); }
  finally { state.updateChecking = false; if (state.settingsOpen) renderSettings(); }
}
function applyUpdate() {
  const worker = state.swRegistration?.waiting;
  if (!worker) return checkForUpdate();
  state.updateApplying = true;
  worker.postMessage({ type: 'SKIP_WAITING' });
}
function setupServiceWorker() {
  if (!('serviceWorker' in navigator)) return;
  let controllerReady = Boolean(navigator.serviceWorker.controller);
  let didReload = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (!controllerReady) { controllerReady = true; return; }
    if (didReload) return;
    didReload = true;
    window.location.reload();
  });
  navigator.serviceWorker.register('sw.js', { updateViaCache: 'none' }).then((registration) => {
    state.swRegistration = registration;
    if (registration.waiting) markUpdateAvailable();
    registration.addEventListener('updatefound', () => {
      const worker = registration.installing;
      if (!worker) return;
      worker.addEventListener('statechange', () => {
        if (worker.state === 'installed' && navigator.serviceWorker.controller) markUpdateAvailable();
      });
    });
    registration.update().catch(() => {});
  }).catch(() => {});
}

// Rendering and interaction --------------------------------------------------
function render() {
  applyLanguage();
  const bottomNav = $('#bottomNav');
  if (bottomNav) bottomNav.hidden = false;
  nav.hidden = state.section !== 'tools';
  const renderers = { calculator, calendar, weather, convert, translate: translateView, reader };
  workspace.dataset.tool = state.section === 'tools' ? state.tool : state.section;
  workspace.innerHTML = state.section === 'home' ? renderHome() : state.section === 'messages' ? renderMessages() : state.section === 'mine' ? renderMine() : (renderers[state.tool] || calculator)();
  if (state.section === 'tools' && state.tool === 'calendar') ensureHolidayYear(state.month.getFullYear());
  renderBottomNav();
  updateNotificationBadge();
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
let swipeGesture = null;
function startLongPress(target, type, index) {
  clearTimeout(reorderTimer);
  reorderTarget = { target, type, index };
  reorderTimer = setTimeout(() => {
    target.classList.add('reorder-hold'); target.dataset.longPressed = 'true';
    toast(state.language === 'en' ? 'Reorder mode: tap another item' : '排序模式：再点一下目标位置');
  }, 520);
}
function endLongPress() { clearTimeout(reorderTimer); reorderTimer = null; }
function handleReorderClick(target, type, index) {
  if (!reorderTarget || reorderTarget.type !== type || !reorderTarget.target.dataset.longPressed) return false;
  if (reorderTarget.index !== index) type === 'tool' ? swapToolOrder(reorderTarget.index, index) : swapWeatherCards(reorderTarget.index, index);
  reorderTarget.target.classList.remove('reorder-hold'); delete reorderTarget.target.dataset.longPressed; reorderTarget = null;
  return true;
}

workspace.addEventListener('pointerdown', (event) => {
  const row = event.target.closest('[data-swipe-row]');
  if (row) swipeGesture = { row, startX: event.clientX, startY: event.clientY, moved: false };
});
workspace.addEventListener('pointermove', (event) => {
  if (!swipeGesture) return;
  const dx = event.clientX - swipeGesture.startX; const dy = event.clientY - swipeGesture.startY;
  if (Math.abs(dy) > Math.abs(dx) || Math.abs(dx) < 8) return;
  swipeGesture.moved = true;
  if (dx < -28) swipeGesture.row.classList.add('swiped');
  if (dx > 18) swipeGesture.row.classList.remove('swiped');
});
document.addEventListener('pointerup', () => { swipeGesture = null; }, { passive: true });

nav.addEventListener('pointerdown', (event) => { const tab = event.target.closest('[data-tool]'); if (tab) startLongPress(tab, 'tool', Number(tab.dataset.toolIndex)); });
nav.addEventListener('pointerup', endLongPress);
nav.addEventListener('pointercancel', endLongPress);
nav.addEventListener('click', (event) => {
  const tab = event.target.closest('[data-tool]'); if (!tab) return;
  if (handleReorderClick(tab, 'tool', Number(tab.dataset.toolIndex))) { event.preventDefault(); return; }
  selectTool(tab.dataset.tool);
});
nav.addEventListener('dragstart', (event) => { const tab = event.target.closest('[data-tool]'); if (tab) event.dataTransfer.setData('text/plain', tab.dataset.toolIndex); });
nav.addEventListener('dragover', (event) => { if (event.target.closest('[data-tool]')) event.preventDefault(); });
  nav.addEventListener('drop', (event) => { event.preventDefault(); const tab = event.target.closest('[data-tool]'); if (tab) swapToolOrder(Number(event.dataTransfer.getData('text/plain')), Number(tab.dataset.toolIndex)); });

workspace.addEventListener('pointerdown', (event) => { const card = event.target.closest('[data-weather-card]'); if (card) startLongPress(card, 'weather', Number(card.dataset.weatherIndex)); });
workspace.addEventListener('pointerup', endLongPress);
workspace.addEventListener('pointercancel', endLongPress);
workspace.addEventListener('dragstart', (event) => { const card = event.target.closest('[data-weather-card]'); if (card) event.dataTransfer.setData('text/plain', card.dataset.weatherIndex); });
workspace.addEventListener('dragover', (event) => { if (event.target.closest('[data-weather-card]')) event.preventDefault(); });
workspace.addEventListener('drop', (event) => { event.preventDefault(); const card = event.target.closest('[data-weather-card]'); if (card) swapWeatherCards(Number(event.dataTransfer.getData('text/plain')), Number(card.dataset.weatherIndex)); });
workspace.addEventListener('click', async (event) => {
  const section = event.target.closest('[data-section]');
  if (section) return selectSection(section.dataset.section);
  const homeTool = event.target.closest('[data-home-tool]');
  if (homeTool) return selectTool(homeTool.dataset.homeTool);
  if (event.target.closest('[data-open-reader-file]')) { $('#readerFileInput')?.click(); return; }
  const openReader = event.target.closest('[data-open-reader]');
  if (openReader) return openReaderBook(openReader.dataset.openReader);
  const deleteBook = event.target.closest('[data-delete-book]');
  if (deleteBook) {
    if (!window.confirm(t('deleteConfirm'))) return;
    state.library = state.library.filter((book) => book.id !== deleteBook.dataset.deleteBook); await oneBoxDbDelete('books', deleteBook.dataset.deleteBook); saveLibrary(); render(); return;
  }
  if (event.target.closest('[data-annotate-selection]')) return renderAnnotationDialog();
  const deleteAnnotation = event.target.closest('[data-delete-annotation]');
  if (deleteAnnotation) {
    const book = readerBookById(state.readerBookId); if (book) { book.annotations = (book.annotations || []).filter((note) => note.id !== deleteAnnotation.dataset.deleteAnnotation); saveLibrary(); renderReaderDialog($('[data-reader-content]')?.innerHTML || ''); }
    return;
  }
  if (event.target.closest('[data-open-settings-page]')) return renderSettings();
  if (event.target.closest('[data-open-github-page]')) return renderGithubDialog();
  if (event.target.closest('[data-open-agreement-page]')) return renderAgreementDialog();
  const messageDelete = event.target.closest('[data-delete-notification]');
  if (messageDelete) { state.notifications = state.notifications.filter((item) => item.id !== messageDelete.dataset.deleteNotification); saveNotifications(); render(); return; }
  if (event.target.closest('[data-mark-notifications-read]')) { state.notifications.forEach((item) => { item.read = true; }); saveNotifications(); render(); return; }
  const key = event.target.closest('[data-key]');
  if (key) return calculatorKey(key.dataset.key);
  const scienceKey = event.target.closest('[data-science-key]');
  if (scienceKey) { state.calcJustEvaluated = false; state.calcExpr += scienceKey.dataset.scienceKey; saveCalculator(); return render(); }
  if (event.target.closest('[data-toggle-scientific]')) { state.calcScientific = !state.calcScientific; return render(); }
  if (event.target.closest('[data-toggle-angle]')) { state.calcAngle = state.calcAngle === 'deg' ? 'rad' : 'deg'; return render(); }
  const history = event.target.closest('[data-history-expression]');
  if (history) { state.calcExpr = history.dataset.historyExpression || ''; state.calcJustEvaluated = false; saveCalculator(); return render(); }
  const deleteCalcHistory = event.target.closest('[data-delete-calc-history]');
  if (deleteCalcHistory) { state.calcHistory = state.calcHistory.filter((item) => String(item.id || item.at || item.expression) !== deleteCalcHistory.dataset.deleteCalcHistory); saveCalculator(); return render(); }
  if (event.target.closest('[data-clear-calc-history]')) { state.calcHistory = []; saveCalculator(); return render(); }
  if (event.target.closest('[data-open-event-dialog]')) return renderEventDialog();
  if (event.target.closest('[data-open-alarm-dialog]')) return renderAlarmDialog();
  const toggleAlarm = event.target.closest('[data-toggle-alarm]');
  if (toggleAlarm) {
    const alarm = state.alarms.find((item) => item.id === toggleAlarm.dataset.toggleAlarm);
    if (alarm) { alarm.enabled = alarm.enabled === false; saveAlarms(); syncAlarmReminders(); scheduleNotificationCheck(); render(); }
    return;
  }
  const deleteAlarm = event.target.closest('[data-delete-alarm]');
  if (deleteAlarm) {
    state.alarms = state.alarms.filter((item) => item.id !== deleteAlarm.dataset.deleteAlarm);
    state.notifications = state.notifications.filter((item) => item.source !== 'alarm' || item.alarmId !== deleteAlarm.dataset.deleteAlarm || item.delivered);
    saveAlarms(); saveNotifications(); scheduleNotificationCheck(); render();
    return;
  }
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
  if (event.target.closest('[data-refresh-weather]')) return refreshWeatherCard(state.weatherCards.find((item) => item.id === state.activeWeatherId));
  if (event.target.closest('[data-swap]')) { [conversion.from, conversion.to] = [conversion.to, conversion.from]; return render(); }
  if (event.target.closest('[data-swap-language]')) {
    const source = state.translation.source === 'auto' ? 'en' : state.translation.source;
    const target = state.translation.target === 'auto' ? 'en' : state.translation.target;
    state.translation.source = target; state.translation.target = source; return render();
  }
  if (event.target.closest('[data-copy-conversion]')) {
    const value = formatNumber(convertedValue()) + ' ' + units[conversion.category].units[conversion.to][1];
    try { await navigator.clipboard.writeText(value); $('#copyStatus').textContent = t('copied'); } catch { toast(state.language === 'en' ? 'Clipboard access was denied' : '浏览器不允许访问剪贴板，请手动复制', 'error'); }
    return;
  }
  if (event.target.closest('[data-translate-submit]')) return translateText();
  if (event.target.closest('[data-save-translation]')) {
    if (!state.translation.result) return toast(state.language === 'en' ? 'Translate something first' : '请先完成翻译', 'error');
    state.translationHistory.unshift({ id: uid(), source: state.translation.source, target: state.translation.target, input: state.translation.input, result: state.translation.result, createdAt: Date.now() });
    saveTranslationHistory(); return toast(state.language === 'en' ? 'Translation saved locally' : '翻译已保存到本机');
  }
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
  if (event.target.id === 'weatherSearch') searchWeather($('#cityInput').value);
});

$('#eventDialog').addEventListener('click', (event) => {
  if (event.target === $('#eventDialog') || event.target.closest('[data-close-event-dialog]')) closeEventDialog();
});
$('#eventDialog').addEventListener('change', (event) => {
  if (event.target.id === 'eventRepeat') {
    const weekly = $('.event-weekdays-field', $('#eventDialog')); if (weekly) weekly.hidden = event.target.value !== 'weekly';
    const time = $('#eventTime'); if (time) time.required = event.target.value !== 'once';
  }
});
$('#eventDialog').addEventListener('submit', (event) => {
  event.preventDefault();
  if (event.target.id !== 'eventForm') return;
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

$('#alarmDialog').addEventListener('click', (event) => {
  if (event.target === $('#alarmDialog') || event.target.closest('[data-close-alarm-dialog]')) closeAlarmDialog();
});
$('#alarmDialog').addEventListener('change', (event) => {
  if (event.target.id !== 'alarmRepeat') return;
  const recurring = event.target.value !== 'once';
  const onceField = $('.alarm-once-field', $('#alarmDialog'));
  const repeatField = $('.alarm-repeat-field', $('#alarmDialog'));
  const weekdaysField = $('.alarm-weekdays-field', $('#alarmDialog'));
  if (onceField) onceField.hidden = recurring;
  if (repeatField) repeatField.hidden = !recurring;
  if (weekdaysField) weekdaysField.hidden = event.target.value !== 'weekly';
  const alarmAt = $('#alarmAt'); if (alarmAt) alarmAt.required = !recurring;
  const alarmTime = $('#alarmTime'); if (alarmTime) alarmTime.required = recurring;
});
$('#alarmDialog').addEventListener('submit', (event) => {
  event.preventDefault();
  if (event.target.id === 'alarmForm') createAlarmFromForm();
});

$('#lunarDialog').addEventListener('click', (event) => {
  if (event.target === $('#lunarDialog') || event.target.closest('[data-close-lunar-dialog]')) closeLunarDialog();
});

$('#readerDialog').addEventListener('click', (event) => {
  if (event.target === $('#readerDialog') || event.target.closest('[data-close-reader]')) return closeReader();
  if (event.target.closest('[data-annotate-selection]')) return renderAnnotationDialog();
  const deleteAnnotation = event.target.closest('[data-delete-annotation]');
  if (deleteAnnotation) {
    const book = readerBookById(state.readerBookId); if (book) { book.annotations = (book.annotations || []).filter((note) => note.id !== deleteAnnotation.dataset.deleteAnnotation); saveLibrary(); renderReaderDialog($('[data-reader-content]')?.innerHTML || ''); }
  }
});
$('#readerDialog').addEventListener('scroll', (event) => {
  const book = readerBookById(state.readerBookId); const content = event.target.closest('[data-reader-content]');
  if (!book || !content || !content.scrollHeight) return;
  book.progress = Math.min(1, content.scrollTop / Math.max(1, content.scrollHeight - content.clientHeight)); saveLibrary();
}, true);
$('#annotationDialog').addEventListener('click', (event) => {
  if (event.target === $('#annotationDialog') || event.target.closest('[data-close-annotation]')) { $('#annotationDialog').hidden = true; return; }
  if (!event.target.closest('[data-save-annotation]')) return;
  const book = readerBookById(state.readerBookId); const note = $('#annotationText')?.value.trim();
  if (!book || !state.readerSelectedText || !note) return toast(state.language === 'en' ? 'Write a note first' : '请先写下标注内容', 'error');
  book.annotations ||= []; book.annotations.push({ id: uid(), quote: state.readerSelectedText, note, createdAt: Date.now() }); saveLibrary(); $('#annotationDialog').hidden = true; renderReaderDialog($('[data-reader-content]')?.innerHTML || '');
});
document.addEventListener('selectionchange', () => {
  if (!state.readerBookId) return;
  const selection = window.getSelection(); const text = selection?.toString().trim() || '';
  if (text) state.readerSelectedText = text.slice(0, 1000);
  const button = $('[data-annotate-selection]', $('#readerDialog'));
  if (button) button.hidden = !state.readerSelectedText;
});

$('#bottomNav').addEventListener('click', (event) => {
  const tab = event.target.closest('[data-section]');
  if (tab) selectSection(tab.dataset.section);
});
$('#brandLink').addEventListener('click', (event) => { event.preventDefault(); selectSection('home'); });
$('#languagePicker').addEventListener('change', (event) => { state.languageMode = event.target.value; saveThemeLanguage(); applyLanguage(); renderNav(); render(); if (state.settingsOpen) renderSettings(); });
let lastMainScrollTop = 0;
$('main').addEventListener('scroll', (event) => {
  const main = event.currentTarget;
  const bottomNav = $('#bottomNav');
  if (!bottomNav || !state.bottomNavAutoHide) return;
  const current = main.scrollTop;
  if (current <= 8 || current < lastMainScrollTop - 4) bottomNav.classList.remove('is-hidden');
  else if (current > lastMainScrollTop + 4) bottomNav.classList.add('is-hidden');
  lastMainScrollTop = current;
}, { passive: true });

document.addEventListener('keydown', (event) => {
  if (state.tool !== 'calculator' || event.target.matches('input, textarea, select')) return;
  const keyMap = { Enter: '=', Escape: 'AC', Backspace: '⌫', '*': '×', '/': '÷', '-': '−' };
  const key = keyMap[event.key] || event.key;
  if (/^[0-9.+()%,]$/.test(key) || ['=', 'AC', '⌫', '×', '÷', '−'].includes(key)) { event.preventDefault(); calculatorKey(key === ',' ? '.' : key); }
});

$('#themeBtn').addEventListener('click', cycleTheme);
$('#settingsBtn').addEventListener('click', () => renderSettings());
$('#notifyBtn').addEventListener('click', () => {
  state.notificationOpen = !state.notificationOpen;
  if (state.notificationOpen) { state.notifications.forEach((item) => { if (item.at <= Date.now()) item.read = true; }); saveNotifications(); renderNotifications(); }
  else closeNotifications();
  $('#notifyBtn').setAttribute('aria-expanded', String(state.notificationOpen));
});
$('#updateBtn').addEventListener('click', applyUpdate);
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
$('#settingsDialog').addEventListener('change', (event) => {
  if (event.target.id === 'settingsTheme') { state.theme = event.target.value; saveThemeLanguage(); applyTheme(); render(); }
  if (event.target.id === 'settingsLanguage') { state.languageMode = event.target.value; saveThemeLanguage(); applyLanguage(); renderNav(); render(); renderSettings(); }
  const visibility = event.target.dataset.headerVisibility;
  if (visibility) { state.headerVisibility[visibility] = event.target.checked; saveHeaderPreferences(); renderHeaderControls(); }
  if (event.target.id === 'bottomNavAutoHide') { state.bottomNavAutoHide = event.target.checked; saveHeaderPreferences(); renderBottomNav(); }
});
$('#settingsDialog').addEventListener('input', () => {});
$('#agreementDialog').addEventListener('click', (event) => {
  if (event.target === $('#agreementDialog') || event.target.closest('[data-close-agreement]')) closeAgreementDialog();
});
$('#githubDialog').addEventListener('click', (event) => {
  if (event.target === $('#githubDialog') || event.target.closest('[data-close-github]')) return closeGithubDialog();
  if (event.target.closest('[data-github-login]')) return githubLogin();
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
window.addEventListener('pagehide', () => { clearTimeout(persistenceTimer); writePersistentSnapshot(); });
window.addEventListener('beforeinstallprompt', (event) => { event.preventDefault(); window.installPrompt = event; $('#installBtn').hidden = false; });
window.addEventListener('online', () => { $('#connectionStatus').textContent = t('online'); toast(state.language === 'en' ? 'Back online' : '网络已恢复'); });
window.addEventListener('offline', () => { $('#connectionStatus').textContent = t('offline'); toast(state.language === 'en' ? 'Offline mode' : '已切换到离线模式'); });
window.addEventListener('hashchange', () => selectTool(location.hash.slice(1)));
window.matchMedia?.('(prefers-color-scheme: dark)').addEventListener?.('change', () => { if (state.theme === 'system') applyTheme(); });
document.addEventListener('visibilitychange', () => { if (!document.hidden) state.swRegistration?.update().catch(() => {}); });
window.addEventListener('focus', () => state.swRegistration?.update().catch(() => {}));
function bootApp() {
  setInterval(checkNotifications, 30000);
  applyLanguage(); renderNav(); render(); checkNotifications();
  setupServiceWorker();
}
restorePersistentSnapshot().then((restored) => {
  if (restored) { window.location.reload(); return; }
  bootApp();
}).catch(bootApp);
