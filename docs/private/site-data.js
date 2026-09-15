/**
 * 網站內容的唯一資料來源（講師專用，不進版控）。
 * scripts/build-site.js 讀取此檔產生 index.html 與 docs/private/seed.sql，
 * 因此畫面上的每一筆資料都與參考解答、種子資料完全一致。
 * 練習情境的「今天」固定為 2026-09-16。
 */
const TODAY = '2026-09-16';

const newsCategories = [
  { id: 1, name: '系所公告', sort_order: 1 },
  { id: 2, name: '招生資訊', sort_order: 2 },
  { id: 3, name: '競賽活動', sort_order: 3 },
  { id: 4, name: '就業實習', sort_order: 4 },
  { id: 5, name: '學術演講', sort_order: 5 },
];

const news = [
  { id: 1, category_id: 1, title: '115 學年度第 1 學期選課注意事項', is_top: 1, published_at: '2026-08-25 09:00:00', expired_at: '2026-09-30 23:59:00', view_count: 1250,
    content: '本學期加退選自 9/14（一）起至 9/25（五）止，請同學於期限內完成選課並確認課表。逾期加簽需經授課教師與系主任同意。' },
  { id: 2, category_id: 2, title: '116 學年度碩士班甄試招生說明會', is_top: 1, published_at: '2026-09-01 10:00:00', expired_at: '2026-10-15 23:59:00', view_count: 863,
    content: '本系將於 9/24（四）下午 2 時於資訊大樓 IB301 舉辦碩士班甄試招生說明會，介紹研究方向、修業規定與獎學金，歡迎大四同學與校外人士參加。' },
  { id: 3, category_id: 3, title: '2026 全國大專校院資訊應用服務創新競賽 徵件開始', is_top: 0, published_at: '2026-09-05 14:30:00', expired_at: '2026-11-01 23:59:00', view_count: 412,
    content: '競賽分為資訊應用、AI 創新與永續發展三大組別，各組首獎獎金 10 萬元。有意參賽的專題組別請於 10/31 前向指導教授登記。' },
  { id: 4, category_id: 4, title: '暑期實習成果發表會圓滿落幕', is_top: 0, published_at: '2026-09-08 16:00:00', expired_at: null, view_count: 305,
    content: '本系 26 位同學於暑假期間至 14 家企業實習，9/8 於國際會議廳舉辦成果發表，感謝各合作企業的支持與指導。' },
  { id: 5, category_id: 1, title: '資訊大樓電梯年度保養停用公告', is_top: 0, published_at: '2026-09-10 08:30:00', expired_at: '2026-09-12 18:00:00', view_count: 198,
    content: '資訊大樓兩部電梯將於 9/12（六）09:00 至 18:00 進行年度保養，期間暫停使用，請改走樓梯，造成不便敬請見諒。' },
  { id: 6, category_id: 3, title: '第 12 屆資管盃程式設計競賽得獎名單', is_top: 0, published_at: '2026-09-12 11:00:00', expired_at: null, view_count: 677,
    content: '恭喜獲獎同學！第一名：資管三 A「Null 就是空」隊；第二名：資管二 B「SELECT 星星」隊；第三名：資管四 A「JOIN 我們」隊。完整名單詳見附件。' },
  { id: 7, category_id: 4, title: '智星科技 2027 校園徵才職缺資訊', is_top: 0, published_at: '2026-09-14 09:30:00', expired_at: '2026-12-31 23:59:00', view_count: 154,
    content: '智星科技開放 2027 年校園徵才，職缺包含後端工程師、資料分析師與 MIS 工程師，歡迎應屆畢業生投遞履歷。' },
  { id: 8, category_id: 2, title: '116 學年度大學部轉學考招生簡章公告', is_top: 0, published_at: '2026-09-15 17:00:00', expired_at: '2026-10-31 23:59:00', view_count: 89,
    content: '本系 116 學年度轉學考招收二年級 5 名、三年級 3 名，報名日期為 10/20 至 10/28，考試科目為程式設計與資料庫系統。簡章與報名表請見附件。' },
];

const newsAttachments = [
  { id: 1, news_id: 1, file_name: '115-1_選課時程表.pdf', file_size_kb: 512 },
  { id: 2, news_id: 1, file_name: '選課系統操作手冊.pdf', file_size_kb: 2048 },
  { id: 3, news_id: 2, file_name: '碩士班甄試簡章.pdf', file_size_kb: 1536 },
  { id: 4, news_id: 6, file_name: '資管盃得獎名單.xlsx', file_size_kb: 86 },
  { id: 5, news_id: 8, file_name: '轉學考招生簡章.pdf', file_size_kb: 1280 },
  { id: 6, news_id: 8, file_name: '轉學考報名表.docx', file_size_kb: 64 },
];

const tags = [
  { id: 1, name: '招生' },
  { id: 2, name: '競賽' },
  { id: 3, name: '獎學金' },
  { id: 4, name: '講座' },
  { id: 5, name: '實習' },
];

const newsTags = [
  { news_id: 2, tag_id: 1 },
  { news_id: 3, tag_id: 2 },
  { news_id: 3, tag_id: 3 },
  { news_id: 4, tag_id: 5 },
  { news_id: 6, tag_id: 2 },
  { news_id: 7, tag_id: 5 },
  { news_id: 8, tag_id: 1 },
];

const downloadCategories = [
  { id: 1, name: '表單下載' },
  { id: 2, name: '課程資料' },
  { id: 3, name: '軟體資源' },
];

const downloads = [
  { id: 1, category_id: 1, title: '學生請假單', file_name: 'leave-form.docx', file_size_kb: 48, download_count: 1320, updated_at: '2026-02-10' },
  { id: 2, category_id: 1, title: '專題指導教授同意書', file_name: 'project-consent.pdf', file_size_kb: 120, download_count: 864, updated_at: '2026-06-01' },
  { id: 3, category_id: 1, title: '畢業離校程序單', file_name: 'graduation-checklist.pdf', file_size_kb: 96, download_count: 455, updated_at: '2026-05-20' },
  { id: 4, category_id: 2, title: '115 學年度課程地圖', file_name: 'course-map-115.pdf', file_size_kb: 3072, download_count: 2210, updated_at: '2026-08-20' },
  { id: 5, category_id: 2, title: '資料庫系統課程大綱', file_name: 'db-syllabus.pdf', file_size_kb: 256, download_count: 978, updated_at: '2026-09-01' },
  { id: 6, category_id: 3, title: 'HeidiSQL 安裝與連線說明', file_name: 'heidisql-install.pdf', file_size_kb: 1843, download_count: 1502, updated_at: '2026-09-10' },
];

const events = [
  { id: 1, title: '新生始業式', location: '國際會議廳', start_at: '2026-09-07 09:00:00', end_at: '2026-09-07 12:00:00', registration_deadline: null,
    description: '大一新生必到，介紹系所修業規定、導師制度與校園資源。' },
  { id: 2, title: '碩士班甄試招生說明會', location: '資訊大樓 IB301', start_at: '2026-09-24 14:00:00', end_at: '2026-09-24 16:00:00', registration_deadline: '2026-09-22',
    description: '介紹研究方向、修業規定與獎學金，並開放 Q&A。' },
  { id: 3, title: '業界講座：資料工程師的一天', location: '資訊大樓 IB201', start_at: '2026-10-01 13:30:00', end_at: '2026-10-01 15:30:00', registration_deadline: '2026-09-29',
    description: '邀請系友分享資料管線建置與 SQL 效能調校的實務經驗。' },
  { id: 4, title: '資管週專題成果展', location: '學生活動中心 1F', start_at: '2026-10-19 09:00:00', end_at: '2026-10-21 17:00:00', registration_deadline: null,
    description: '大四專題組別成果展示，開放全校師生參觀並投票選出人氣獎。' },
  { id: 5, title: '系友回娘家餐會', location: '第一餐廳 2F', start_at: '2026-11-14 18:00:00', end_at: '2026-11-14 21:00:00', registration_deadline: '2026-11-06',
    description: '歡迎歷屆系友返校敘舊，餐會後有系友職涯分享時段。' },
];

const staffTitles = [
  { id: 1, name: '教授', sort_order: 1 },
  { id: 2, name: '副教授', sort_order: 2 },
  { id: 3, name: '助理教授', sort_order: 3 },
  { id: 4, name: '講師', sort_order: 4 },
];

const staff = [
  { id: 1, name: '王志明', title_id: 1, position: '系主任', office: 'IB512', extension: '3101', email: 'cmwang@im.example.edu.tw', expertise: '資料庫系統、資料倉儲', sort_order: 1 },
  { id: 2, name: '林美惠', title_id: 1, position: null, office: 'IB513', extension: '3102', email: 'mhlin@im.example.edu.tw', expertise: '人工智慧、機器學習', sort_order: 2 },
  { id: 3, name: '陳建宏', title_id: 2, position: null, office: 'IB515', extension: '3105', email: 'chchen@im.example.edu.tw', expertise: '資訊安全、網路管理', sort_order: 3 },
  { id: 4, name: '張淑芬', title_id: 2, position: null, office: 'IB516', extension: '3106', email: 'sfchang@im.example.edu.tw', expertise: '電子商務、專案管理', sort_order: 4 },
  { id: 5, name: '李俊傑', title_id: 3, position: null, office: 'IB520', extension: '3110', email: 'cjlee@im.example.edu.tw', expertise: '網頁程式設計、雲端服務', sort_order: 5 },
  { id: 6, name: '黃雅婷', title_id: 4, position: null, office: 'IB522', extension: null, email: 'ythuang@im.example.edu.tw', expertise: '統計分析、資料視覺化', sort_order: 6 },
];

const albums = [
  { id: 1, title: '2026 資管週專題成果展', description: '大四專題成果展示與頒獎典禮花絮。', shot_date: '2026-05-13' },
  { id: 2, title: '2025 系友回娘家', description: '歷屆系友返校餐敘與職涯分享。', shot_date: '2025-11-15' },
];

const photos = [
  { id: 1, album_id: 1, file_name: 'album-expo-1.webp', caption: '專題組別向來賓介紹作品', is_cover: 1 },
  { id: 2, album_id: 1, file_name: 'album-expo-2.webp', caption: 'App 展示與現場試用', is_cover: 0 },
  { id: 3, album_id: 1, file_name: 'album-expo-3.webp', caption: '頒獎典禮大合照', is_cover: 0 },
  { id: 4, album_id: 2, file_name: 'album-alumni-1.webp', caption: '系友與師長餐敘', is_cover: 0 },
  { id: 5, album_id: 2, file_name: 'album-alumni-2.webp', caption: '業界系友經驗分享', is_cover: 1 },
  { id: 6, album_id: 2, file_name: 'album-alumni-3.webp', caption: '校園草地大合照', is_cover: 0 },
];

const faqCategories = [
  { id: 1, name: '選課問題', sort_order: 1 },
  { id: 2, name: '畢業門檻', sort_order: 2 },
];

const faqs = [
  { id: 1, category_id: 1, question: '加退選期間可以加選其他系的課嗎？', answer: '可以，外系課程依該系規定加選，最多可承認 12 學分為選修學分。', sort_order: 1, is_visible: 1 },
  { id: 2, category_id: 1, question: '必修課衝堂該怎麼處理？', answer: '請先向系辦登記，系辦將協調開課教師調整時段，或安排下學期補修。', sort_order: 2, is_visible: 1 },
  { id: 3, category_id: 1, question: '人工加簽單要找誰簽？', answer: '此答案尚在修訂中，暫不對外顯示。', sort_order: 3, is_visible: 0 },
  { id: 4, category_id: 2, question: '畢業前需要通過哪些英文門檻？', answer: '需取得 TOEIC 550 分以上或同等級證明，未達標者可修習英文補強課程抵免。', sort_order: 1, is_visible: 1 },
  { id: 5, category_id: 2, question: '專題成果需要在什麼時候完成發表？', answer: '大四下學期資管週成果展前完成，並繳交專題報告書與系統原始碼。', sort_order: 2, is_visible: 1 },
];

const linkCategories = [
  { id: 1, name: '校內單位' },
  { id: 2, name: '相關資源' },
];

const links = [
  { id: 1, category_id: 1, name: '教務處', url: 'https://www.example.edu.tw/academic', open_new_window: 0, sort_order: 1 },
  { id: 2, category_id: 1, name: '學務處', url: 'https://www.example.edu.tw/student', open_new_window: 0, sort_order: 2 },
  { id: 3, category_id: 1, name: '圖書館', url: 'https://lib.example.edu.tw', open_new_window: 1, sort_order: 3 },
  { id: 4, category_id: 2, name: 'MariaDB 官方文件', url: 'https://mariadb.com/kb/en/', open_new_window: 1, sort_order: 1 },
  { id: 5, category_id: 2, name: 'drawSQL', url: 'https://drawsql.app', open_new_window: 1, sort_order: 2 },
  { id: 6, category_id: 2, name: 'HeidiSQL', url: 'https://www.heidisql.com', open_new_window: 1, sort_order: 3 },
];

const contactMessages = [
  { id: 1, name: '吳同學', email: 'wu.student@example.com', subject: '轉學考報名問題', content: '想請問轉學考可以同時報名二年級與三年級嗎？', status: '已回覆', created_at: '2026-09-02 10:12:00', replied_at: '2026-09-03 09:30:00' },
  { id: 2, name: '陳家長', email: 'chen.parent@example.com', subject: '新生住宿申請', content: '孩子今年入學，請問住宿申請的時程與方式？', status: '已回覆', created_at: '2026-09-05 15:40:00', replied_at: '2026-09-05 17:05:00' },
  { id: 3, name: '劉先生', email: 'liu@brightstar.example.com', subject: '校園徵才合作洽詢', content: '本公司希望於 11 月至貴系舉辦徵才說明會，請問聯絡窗口為何？', status: '未處理', created_at: '2026-09-11 09:20:00', replied_at: null },
  { id: 4, name: '林同學', email: 'lin.student@example.com', subject: '選課系統無法登入', content: '輸入學號密碼後一直顯示系統忙碌，已重試多次。', status: '處理中', created_at: '2026-09-14 08:05:00', replied_at: null },
  { id: 5, name: '匿名', email: 'anon@example.com', subject: '資訊大樓電梯異音', content: '左側電梯上升時有明顯異音，建議儘速檢修。', status: '未處理', created_at: '2026-09-15 20:48:00', replied_at: null },
];

module.exports = {
  TODAY,
  newsCategories, news, newsAttachments, tags, newsTags,
  downloadCategories, downloads, events, staffTitles, staff,
  albums, photos, faqCategories, faqs, linkCategories, links, contactMessages,
};
