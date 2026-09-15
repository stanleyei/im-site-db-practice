-- 參考 schema 與種子資料（MariaDB 10.4+）
-- 由 scripts/build-site.js 產生，內容與 index.html 畫面完全一致。
-- 這是「一種可接受的設計」，不是唯一解；外鍵約束可依課程階段自行省略。
-- 練習情境的「今天」為 2026-09-16。

CREATE DATABASE IF NOT EXISTS im_site CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE im_site;

-- ===== 最新消息 =====
CREATE TABLE news_categories (
  id         INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  name       VARCHAR(50) NOT NULL,
  sort_order INT NOT NULL DEFAULT 0
);

CREATE TABLE news (
  id           INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  category_id  INT UNSIGNED NOT NULL,
  title        VARCHAR(200) NOT NULL,
  content      TEXT NOT NULL,
  is_top       TINYINT(1) NOT NULL DEFAULT 0,
  published_at DATETIME NOT NULL,
  expired_at   DATETIME NULL,              -- NULL 代表無期限
  view_count   INT UNSIGNED NOT NULL DEFAULT 0,
  FOREIGN KEY (category_id) REFERENCES news_categories(id)
);

CREATE TABLE news_attachments (
  id           INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  news_id      INT UNSIGNED NOT NULL,
  file_name    VARCHAR(255) NOT NULL,
  file_size_kb INT UNSIGNED NOT NULL,
  FOREIGN KEY (news_id) REFERENCES news(id)
);

CREATE TABLE tags (
  id   INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE news_tags (
  news_id INT UNSIGNED NOT NULL,
  tag_id  INT UNSIGNED NOT NULL,
  PRIMARY KEY (news_id, tag_id),
  FOREIGN KEY (news_id) REFERENCES news(id),
  FOREIGN KEY (tag_id) REFERENCES tags(id)
);

-- ===== 下載專區 =====
CREATE TABLE download_categories (
  id   INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(50) NOT NULL
);

CREATE TABLE downloads (
  id             INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  category_id    INT UNSIGNED NOT NULL,
  title          VARCHAR(200) NOT NULL,
  file_name      VARCHAR(255) NOT NULL,
  file_size_kb   INT UNSIGNED NOT NULL,
  download_count INT UNSIGNED NOT NULL DEFAULT 0,
  updated_at     DATE NOT NULL,
  FOREIGN KEY (category_id) REFERENCES download_categories(id)
);

-- ===== 活動行事曆 =====
CREATE TABLE events (
  id                    INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  title                 VARCHAR(200) NOT NULL,
  location              VARCHAR(100) NOT NULL,
  start_at              DATETIME NOT NULL,
  end_at                DATETIME NOT NULL,
  registration_deadline DATE NULL,        -- NULL 代表免報名
  description           TEXT NOT NULL
);

-- ===== 師資介紹 =====
CREATE TABLE staff_titles (
  id         INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  name       VARCHAR(50) NOT NULL,
  sort_order INT NOT NULL DEFAULT 0
);

CREATE TABLE staff (
  id         INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  name       VARCHAR(50) NOT NULL,
  title_id   INT UNSIGNED NOT NULL,
  position   VARCHAR(50) NULL,            -- 行政職，如系主任
  office     VARCHAR(20) NOT NULL,
  extension  VARCHAR(10) NULL,
  email      VARCHAR(100) NOT NULL,
  expertise  VARCHAR(200) NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  FOREIGN KEY (title_id) REFERENCES staff_titles(id)
);

-- ===== 系所相簿 =====
CREATE TABLE albums (
  id          INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  title       VARCHAR(200) NOT NULL,
  description TEXT NOT NULL,
  shot_date   DATE NOT NULL
);

CREATE TABLE photos (
  id        INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  album_id  INT UNSIGNED NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  caption   VARCHAR(200) NOT NULL,
  is_cover  TINYINT(1) NOT NULL DEFAULT 0,
  FOREIGN KEY (album_id) REFERENCES albums(id)
);

-- ===== 常見問題 =====
CREATE TABLE faq_categories (
  id         INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  name       VARCHAR(50) NOT NULL,
  sort_order INT NOT NULL DEFAULT 0
);

CREATE TABLE faqs (
  id          INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  category_id INT UNSIGNED NOT NULL,
  question    VARCHAR(300) NOT NULL,
  answer      TEXT NOT NULL,
  sort_order  INT NOT NULL DEFAULT 0,
  is_visible  TINYINT(1) NOT NULL DEFAULT 1,
  FOREIGN KEY (category_id) REFERENCES faq_categories(id)
);

-- ===== 友善連結 =====
CREATE TABLE link_categories (
  id   INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(50) NOT NULL
);

CREATE TABLE links (
  id              INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  category_id     INT UNSIGNED NOT NULL,
  name            VARCHAR(100) NOT NULL,
  url             VARCHAR(500) NOT NULL,
  open_new_window TINYINT(1) NOT NULL DEFAULT 0,
  sort_order      INT NOT NULL DEFAULT 0,
  FOREIGN KEY (category_id) REFERENCES link_categories(id)
);

-- ===== 意見信箱 =====
CREATE TABLE message_statuses (
  id         INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  name       VARCHAR(20) NOT NULL,
  sort_order INT NOT NULL DEFAULT 0
);

CREATE TABLE contact_messages (
  id         INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  name       VARCHAR(50) NOT NULL,
  email      VARCHAR(100) NOT NULL,
  subject    VARCHAR(200) NOT NULL,
  content    TEXT NOT NULL,
  status_id  INT UNSIGNED NOT NULL DEFAULT 1,
  created_at DATETIME NOT NULL,
  replied_at DATETIME NULL,
  FOREIGN KEY (status_id) REFERENCES message_statuses(id)
);

-- ===== 種子資料 =====
INSERT INTO `news_categories` (`id`, `name`, `sort_order`) VALUES
  (1, '系所公告', 1),
  (2, '招生資訊', 2),
  (3, '競賽活動', 3),
  (4, '就業實習', 4),
  (5, '學術演講', 5);

INSERT INTO `news` (`id`, `category_id`, `title`, `is_top`, `published_at`, `expired_at`, `view_count`, `content`) VALUES
  (1, 1, '115 學年度第 1 學期選課注意事項', 1, '2026-08-25 09:00:00', '2026-09-30 23:59:00', 1250, '本學期加退選自 9/14（一）起至 9/25（五）止，請同學於期限內完成選課並確認課表。逾期加簽需經授課教師與系主任同意。'),
  (2, 2, '116 學年度碩士班甄試招生說明會', 1, '2026-09-01 10:00:00', '2026-10-15 23:59:00', 863, '本系將於 9/24（四）下午 2 時於資訊大樓 IB301 舉辦碩士班甄試招生說明會，介紹研究方向、修業規定與獎學金，歡迎大四同學與校外人士參加。'),
  (3, 3, '2026 全國大專校院資訊應用服務創新競賽 徵件開始', 0, '2026-09-05 14:30:00', '2026-11-01 23:59:00', 412, '競賽分為資訊應用、AI 創新與永續發展三大組別，各組首獎獎金 10 萬元。有意參賽的專題組別請於 10/31 前向指導教授登記。'),
  (4, 4, '暑期實習成果發表會圓滿落幕', 0, '2026-09-08 16:00:00', NULL, 305, '本系 26 位同學於暑假期間至 14 家企業實習，9/8 於國際會議廳舉辦成果發表，感謝各合作企業的支持與指導。'),
  (5, 1, '資訊大樓電梯年度保養停用公告', 0, '2026-09-10 08:30:00', '2026-09-12 18:00:00', 198, '資訊大樓兩部電梯將於 9/12（六）09:00 至 18:00 進行年度保養，期間暫停使用，請改走樓梯，造成不便敬請見諒。'),
  (6, 3, '第 12 屆資管盃程式設計競賽得獎名單', 0, '2026-09-12 11:00:00', NULL, 677, '恭喜獲獎同學！第一名：資管三 A「Null 就是空」隊；第二名：資管二 B「SELECT 星星」隊；第三名：資管四 A「JOIN 我們」隊。完整名單詳見附件。'),
  (7, 4, '智星科技 2027 校園徵才職缺資訊', 0, '2026-09-14 09:30:00', '2026-12-31 23:59:00', 154, '智星科技開放 2027 年校園徵才，職缺包含後端工程師、資料分析師與 MIS 工程師，歡迎應屆畢業生投遞履歷。'),
  (8, 2, '116 學年度大學部轉學考招生簡章公告', 0, '2026-09-15 17:00:00', '2026-10-31 23:59:00', 89, '本系 116 學年度轉學考招收二年級 5 名、三年級 3 名，報名日期為 10/20 至 10/28，考試科目為程式設計與資料庫系統。簡章與報名表請見附件。');

INSERT INTO `news_attachments` (`id`, `news_id`, `file_name`, `file_size_kb`) VALUES
  (1, 1, '115-1_選課時程表.pdf', 512),
  (2, 1, '選課系統操作手冊.pdf', 2048),
  (3, 2, '碩士班甄試簡章.pdf', 1536),
  (4, 6, '資管盃得獎名單.xlsx', 86),
  (5, 8, '轉學考招生簡章.pdf', 1280),
  (6, 8, '轉學考報名表.docx', 64);

INSERT INTO `tags` (`id`, `name`) VALUES
  (1, '招生'),
  (2, '競賽'),
  (3, '獎學金'),
  (4, '講座'),
  (5, '實習');

INSERT INTO `news_tags` (`news_id`, `tag_id`) VALUES
  (2, 1),
  (3, 2),
  (3, 3),
  (4, 5),
  (6, 2),
  (7, 5),
  (8, 1);

INSERT INTO `download_categories` (`id`, `name`) VALUES
  (1, '表單下載'),
  (2, '課程資料'),
  (3, '軟體資源');

INSERT INTO `downloads` (`id`, `category_id`, `title`, `file_name`, `file_size_kb`, `download_count`, `updated_at`) VALUES
  (1, 1, '學生請假單', 'leave-form.docx', 48, 1320, '2026-02-10'),
  (2, 1, '專題指導教授同意書', 'project-consent.pdf', 120, 864, '2026-06-01'),
  (3, 1, '畢業離校程序單', 'graduation-checklist.pdf', 96, 455, '2026-05-20'),
  (4, 2, '115 學年度課程地圖', 'course-map-115.pdf', 3072, 2210, '2026-08-20'),
  (5, 2, '資料庫系統課程大綱', 'db-syllabus.pdf', 256, 978, '2026-09-01'),
  (6, 3, 'HeidiSQL 安裝與連線說明', 'heidisql-install.pdf', 1843, 1502, '2026-09-10');

INSERT INTO `events` (`id`, `title`, `location`, `start_at`, `end_at`, `registration_deadline`, `description`) VALUES
  (1, '新生始業式', '國際會議廳', '2026-09-07 09:00:00', '2026-09-07 12:00:00', NULL, '大一新生必到，介紹系所修業規定、導師制度與校園資源。'),
  (2, '碩士班甄試招生說明會', '資訊大樓 IB301', '2026-09-24 14:00:00', '2026-09-24 16:00:00', '2026-09-22', '介紹研究方向、修業規定與獎學金，並開放 Q&A。'),
  (3, '業界講座：資料工程師的一天', '資訊大樓 IB201', '2026-10-01 13:30:00', '2026-10-01 15:30:00', '2026-09-29', '邀請系友分享資料管線建置與 SQL 效能調校的實務經驗。'),
  (4, '資管週專題成果展', '學生活動中心 1F', '2026-10-19 09:00:00', '2026-10-21 17:00:00', NULL, '大四專題組別成果展示，開放全校師生參觀並投票選出人氣獎。'),
  (5, '系友回娘家餐會', '第一餐廳 2F', '2026-11-14 18:00:00', '2026-11-14 21:00:00', '2026-11-06', '歡迎歷屆系友返校敘舊，餐會後有系友職涯分享時段。');

INSERT INTO `staff_titles` (`id`, `name`, `sort_order`) VALUES
  (1, '教授', 1),
  (2, '副教授', 2),
  (3, '助理教授', 3),
  (4, '講師', 4);

INSERT INTO `staff` (`id`, `name`, `title_id`, `position`, `office`, `extension`, `email`, `expertise`, `sort_order`) VALUES
  (1, '王志明', 1, '系主任', 'IB512', '3101', 'cmwang@im.example.edu.tw', '資料庫系統、資料倉儲', 1),
  (2, '林美惠', 1, NULL, 'IB513', '3102', 'mhlin@im.example.edu.tw', '人工智慧、機器學習', 2),
  (3, '陳建宏', 2, NULL, 'IB515', '3105', 'chchen@im.example.edu.tw', '資訊安全、網路管理', 3),
  (4, '張淑芬', 2, NULL, 'IB516', '3106', 'sfchang@im.example.edu.tw', '電子商務、專案管理', 4),
  (5, '李俊傑', 3, NULL, 'IB520', '3110', 'cjlee@im.example.edu.tw', '網頁程式設計、雲端服務', 5),
  (6, '黃雅婷', 4, NULL, 'IB522', NULL, 'ythuang@im.example.edu.tw', '統計分析、資料視覺化', 6);

INSERT INTO `albums` (`id`, `title`, `description`, `shot_date`) VALUES
  (1, '2026 資管週專題成果展', '大四專題成果展示與頒獎典禮花絮。', '2026-05-13'),
  (2, '2025 系友回娘家', '歷屆系友返校餐敘與職涯分享。', '2025-11-15');

INSERT INTO `photos` (`id`, `album_id`, `file_name`, `caption`, `is_cover`) VALUES
  (1, 1, 'album-expo-1.webp', '專題組別向來賓介紹作品', 1),
  (2, 1, 'album-expo-2.webp', 'App 展示與現場試用', 0),
  (3, 1, 'album-expo-3.webp', '頒獎典禮大合照', 0),
  (4, 2, 'album-alumni-1.webp', '系友與師長餐敘', 0),
  (5, 2, 'album-alumni-2.webp', '業界系友經驗分享', 1),
  (6, 2, 'album-alumni-3.webp', '校園草地大合照', 0);

INSERT INTO `faq_categories` (`id`, `name`, `sort_order`) VALUES
  (1, '選課問題', 1),
  (2, '畢業門檻', 2);

INSERT INTO `faqs` (`id`, `category_id`, `question`, `answer`, `sort_order`, `is_visible`) VALUES
  (1, 1, '加退選期間可以加選其他系的課嗎？', '可以，外系課程依該系規定加選，最多可承認 12 學分為選修學分。', 1, 1),
  (2, 1, '必修課衝堂該怎麼處理？', '請先向系辦登記，系辦將協調開課教師調整時段，或安排下學期補修。', 2, 1),
  (3, 1, '人工加簽單要找誰簽？', '此答案尚在修訂中，暫不對外顯示。', 3, 0),
  (4, 2, '畢業前需要通過哪些英文門檻？', '需取得 TOEIC 550 分以上或同等級證明，未達標者可修習英文補強課程抵免。', 1, 1),
  (5, 2, '專題成果需要在什麼時候完成發表？', '大四下學期資管週成果展前完成，並繳交專題報告書與系統原始碼。', 2, 1);

INSERT INTO `link_categories` (`id`, `name`) VALUES
  (1, '校內單位'),
  (2, '相關資源');

INSERT INTO `links` (`id`, `category_id`, `name`, `url`, `open_new_window`, `sort_order`) VALUES
  (1, 1, '教務處', 'https://www.example.edu.tw/academic', 0, 1),
  (2, 1, '學務處', 'https://www.example.edu.tw/student', 0, 2),
  (3, 1, '圖書館', 'https://lib.example.edu.tw', 1, 3),
  (4, 2, 'MariaDB 官方文件', 'https://mariadb.com/kb/en/', 1, 1),
  (5, 2, 'drawSQL', 'https://drawsql.app', 1, 2),
  (6, 2, 'HeidiSQL', 'https://www.heidisql.com', 1, 3);

INSERT INTO `message_statuses` (`id`, `name`, `sort_order`) VALUES
  (1, '未處理', 1),
  (2, '處理中', 2),
  (3, '已回覆', 3);

INSERT INTO `contact_messages` (`id`, `name`, `email`, `subject`, `content`, `status_id`, `created_at`, `replied_at`) VALUES
  (1, '吳同學', 'wu.student@example.com', '轉學考報名問題', '想請問轉學考可以同時報名二年級與三年級嗎？', 3, '2026-09-02 10:12:00', '2026-09-03 09:30:00'),
  (2, '陳家長', 'chen.parent@example.com', '新生住宿申請', '孩子今年入學，請問住宿申請的時程與方式？', 3, '2026-09-05 15:40:00', '2026-09-05 17:05:00'),
  (3, '劉先生', 'liu@brightstar.example.com', '校園徵才合作洽詢', '本公司希望於 11 月至貴系舉辦徵才說明會，請問聯絡窗口為何？', 1, '2026-09-11 09:20:00', NULL),
  (4, '林同學', 'lin.student@example.com', '選課系統無法登入', '輸入學號密碼後一直顯示系統忙碌，已重試多次。', 2, '2026-09-14 08:05:00', NULL),
  (5, '匿名', 'anon@example.com', '資訊大樓電梯異音', '左側電梯上升時有明顯異音，建議儘速檢修。', 1, '2026-09-15 20:48:00', NULL);
