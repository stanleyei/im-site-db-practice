#!/usr/bin/env node

/**
 * 由 docs/private/site-data.js 產生：
 *   1. index.html          — 練習用網站畫面（純靜態，不含任何欄位名稱）
 *   2. docs/private/seed.sql — 參考 schema 與種子資料（MariaDB），供講師示範
 *
 * 執行：npm run site
 * site-data.js 不進版控，所以此腳本在沒有該檔的環境會直接中止。
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const DATA_PATH = path.join(ROOT, 'docs', 'private', 'site-data.js');

if (!fs.existsSync(DATA_PATH)) {
  console.error('找不到 docs/private/site-data.js（講師專用資料檔，不在版控內）');
  process.exit(1);
}

const D = require(DATA_PATH);
const ASSET_VERSION = process.env.ASSET_VERSION || '20260916-01';

// ---------- 工具 ----------

const esc = (s) => String(s ?? '')
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const byId = (list) => Object.fromEntries(list.map((x) => [x.id, x]));
const dateOf = (dt) => dt.slice(0, 10);
const timeOf = (dt) => dt.slice(11, 16);
const dtOf = (dt) => `${dateOf(dt)} ${timeOf(dt)}`;
const isPast = (dt) => dt.slice(0, 10) < D.TODAY;
const isExpired = (n) => n.expired_at && n.expired_at.slice(0, 10) < D.TODAY;

const fmtSize = (kb) => (kb >= 1024 ? `${(kb / 1024).toFixed(1)} MB` : `${kb} KB`);
const extOf = (name) => name.split('.').pop().toUpperCase();
const fmtNum = (n) => n.toLocaleString('en-US');

const cats = byId(D.newsCategories);
const tagsById = byId(D.tags);
const dlCats = byId(D.downloadCategories);
const titles = byId(D.staffTitles);
const faqCats = byId(D.faqCategories);
const linkCats = byId(D.linkCategories);

const attachmentsOf = (id) => D.newsAttachments.filter((a) => a.news_id === id);
const tagsOf = (id) => D.newsTags.filter((t) => t.news_id === id).map((t) => tagsById[t.tag_id]);

const publicNews = D.news
  .filter((n) => !isExpired(n))
  .sort((a, b) => (b.is_top - a.is_top) || b.published_at.localeCompare(a.published_at));

// ---------- 片段 ----------

function tagChips(newsId) {
  const list = tagsOf(newsId);
  if (!list.length) return '';
  return `<ul class="flex flex-wrap gap-1.5" aria-label="標籤">${list
    .map((t) => `<li><span class="badge-tag">#${esc(t.name)}</span></li>`).join('')}</ul>`;
}

function newsRow(n, { detailLink = false } = {}) {
  const att = attachmentsOf(n.id);
  const title = detailLink
    ? `<a href="#news-detail" class="font-semibold text-brand-navy underline-offset-2 hover:underline">${esc(n.title)}</a>`
    : `<span class="font-semibold text-brand-navy">${esc(n.title)}</span>`;
  return `
      <li data-category="${esc(cats[n.category_id].name)}" class="card flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div class="min-w-0 space-y-2">
          <div class="flex flex-wrap items-center gap-2">
            ${n.is_top ? '<span class="badge-top">置頂</span>' : ''}
            <span class="badge-cat">${esc(cats[n.category_id].name)}</span>
            <span class="meta">發布日期 ${dateOf(n.published_at)}</span>
          </div>
          <p class="text-lg leading-snug">${title}</p>
          ${tagChips(n.id)}
        </div>
        <dl class="flex shrink-0 gap-5 text-sm text-muted sm:flex-col sm:items-end sm:gap-1">
          <div><dt class="sr-only">點閱數</dt><dd>點閱 ${fmtNum(n.view_count)}</dd></div>
          ${att.length ? `<div><dt class="sr-only">附件數</dt><dd>附件 ${att.length} 個</dd></div>` : ''}
        </dl>
      </li>`;
}

// ---------- 畫面 ----------

function screenHome() {
  const tops = publicNews.filter((n) => n.is_top);
  const latest = publicNews.filter((n) => !n.is_top).slice(0, 4);
  const upcoming = D.events.filter((e) => !isPast(e.start_at)).sort((a, b) => a.start_at.localeCompare(b.start_at)).slice(0, 3);
  const hotDownloads = [...D.downloads].sort((a, b) => b.download_count - a.download_count).slice(0, 3);

  return `
    <section id="home" class="screen pt-0" aria-labelledby="home-title">
      <div class="relative isolate overflow-hidden bg-brand-navy text-white">
        <img src="./images/photo/hero.webp" alt="" width="1536" height="1024" class="absolute inset-0 -z-10 size-full object-cover opacity-40" />
        <div class="container-site py-20 sm:py-28">
          <p class="text-sm font-medium tracking-widest text-white/80">DEPARTMENT OF INFORMATION MANAGEMENT</p>
          <h1 id="home-title" class="mt-3 text-4xl font-bold sm:text-5xl">資訊管理系</h1>
          <p class="mt-4 max-w-xl text-lg text-white/90">結合資訊科技與管理知識，培育能以資料驅動決策、以系統解決問題的實務人才。</p>
          <div class="mt-8 flex flex-wrap gap-3">
            <a href="#news" class="btn-primary">最新消息</a>
            <a href="#events" class="btn border border-white/70 text-white hover:bg-white/10">近期活動</a>
          </div>
        </div>
      </div>

      <div class="container-site mt-12 grid gap-10 lg:grid-cols-3">
        <div class="lg:col-span-2 space-y-10">
          <div>
            <h2 class="section-title">置頂公告</h2>
            <ul class="space-y-4">${tops.map((n) => newsRow(n)).join('')}</ul>
          </div>
          <div>
            <div class="flex items-center justify-between">
              <h2 class="section-title">最新消息</h2>
              <a href="#news" class="text-sm font-medium text-brand-blue hover:underline">更多消息</a>
            </div>
            <ul class="space-y-4">${latest.map((n) => newsRow(n, { detailLink: n.id === 8 })).join('')}</ul>
          </div>
        </div>

        <aside class="space-y-10">
          <div>
            <h2 class="section-title">近期活動</h2>
            <ul class="space-y-3">
              ${upcoming.map((e) => `
              <li class="card flex gap-4">
                <div class="flex w-14 shrink-0 flex-col items-center rounded-lg bg-brand-blue/10 py-2 text-brand-navy">
                  <span class="text-eyebrow font-semibold">${e.start_at.slice(5, 7)} 月</span>
                  <span class="text-2xl font-bold leading-none">${e.start_at.slice(8, 10)}</span>
                </div>
                <div class="min-w-0">
                  <p class="font-semibold text-brand-navy">${esc(e.title)}</p>
                  <p class="meta mt-1">${timeOf(e.start_at)} 起 ・ ${esc(e.location)}</p>
                </div>
              </li>`).join('')}
            </ul>
          </div>
          <div>
            <h2 class="section-title">熱門下載</h2>
            <ol class="card divide-y divide-line p-0">
              ${hotDownloads.map((d, i) => `
              <li class="flex items-center gap-3 px-5 py-3">
                <span class="text-xl font-bold text-brand-orange">${i + 1}</span>
                <div class="min-w-0 flex-1">
                  <p class="truncate font-medium">${esc(d.title)}</p>
                  <p class="meta">下載 ${fmtNum(d.download_count)} 次</p>
                </div>
              </li>`).join('')}
            </ol>
          </div>
        </aside>
      </div>
    </section>`;
}

function screenNews() {
  const counts = Object.fromEntries(D.newsCategories.map((c) => [c.id, publicNews.filter((n) => n.category_id === c.id).length]));
  return `
    <section id="news" class="screen" aria-labelledby="news-title">
      <div class="container-site">
        <h1 id="news-title" class="section-title">最新消息</h1>
        <div class="mb-6 flex flex-wrap gap-2" role="group" aria-label="依分類篩選">
          <button type="button" class="chip" data-filter="all" aria-pressed="true">全部（${publicNews.length}）</button>
          ${[...D.newsCategories].sort((a, b) => a.sort_order - b.sort_order)
            .map((c) => `<button type="button" class="chip" data-filter="${esc(c.name)}" aria-pressed="false">${esc(c.name)}（${counts[c.id]}）</button>`).join('')}
        </div>
        <ul class="space-y-4">${publicNews.map((n) => newsRow(n, { detailLink: n.id === 8 })).join('')}</ul>
        <p id="news-empty" class="card text-center text-muted" hidden>此分類目前沒有公告。</p>
      </div>
    </section>`;
}

function screenNewsDetail() {
  const n = D.news.find((x) => x.id === 8);
  const att = attachmentsOf(n.id);
  return `
    <section id="news-detail" class="screen" aria-labelledby="detail-title">
      <div class="container-site max-w-3xl">
        <nav aria-label="麵包屑" class="meta mb-4"><a href="#home" class="hover:underline">首頁</a> ／ <a href="#news" class="hover:underline">最新消息</a> ／ ${esc(cats[n.category_id].name)}</nav>
        <article class="card p-6 sm:p-8">
          <div class="flex flex-wrap items-center gap-2">
            <span class="badge-cat">${esc(cats[n.category_id].name)}</span>
            ${tagChips(n.id)}
          </div>
          <h1 id="detail-title" class="mt-3 text-2xl font-bold text-brand-navy sm:text-3xl">${esc(n.title)}</h1>
          <p class="meta mt-3">發布時間 ${dtOf(n.published_at)} ・ 點閱 ${fmtNum(n.view_count)} ・ 公告編號 ${n.id}</p>
          <div class="mt-6 leading-relaxed">${esc(n.content)}</div>
          <h2 class="mt-8 text-lg font-bold text-brand-navy">附件下載</h2>
          <ul class="mt-3 divide-y divide-line rounded-lg border border-line">
            ${att.map((a) => `
            <li class="flex items-center justify-between gap-4 px-4 py-3">
              <span class="min-w-0 truncate"><span class="mr-2 rounded bg-surface px-1.5 py-0.5 text-eyebrow font-semibold text-muted">${extOf(a.file_name)}</span>${esc(a.file_name)}</span>
              <span class="meta shrink-0">${fmtSize(a.file_size_kb)}</span>
            </li>`).join('')}
          </ul>
          <p class="meta mt-6">本公告展示至 ${dateOf(n.expired_at)}</p>
        </article>
        <p class="mt-6"><a href="#news" class="btn-outline">回列表</a></p>
      </div>
    </section>`;
}

function screenDownloads() {
  return `
    <section id="downloads" class="screen" aria-labelledby="downloads-title">
      <div class="container-site space-y-10">
        <h1 id="downloads-title" class="section-title">下載專區</h1>
        ${D.downloadCategories.map((c) => {
          const rows = D.downloads.filter((d) => d.category_id === c.id);
          return `
        <div>
          <h2 class="mb-3 text-xl font-bold text-brand-navy">${esc(c.name)}</h2>
          <div class="table-wrap">
            <table class="table">
              <thead><tr><th scope="col">檔案名稱</th><th scope="col">格式</th><th scope="col" class="num">大小</th><th scope="col" class="num">下載次數</th><th scope="col">更新日期</th><th scope="col"><span class="sr-only">操作</span></th></tr></thead>
              <tbody>
              ${rows.map((d) => `
                <tr>
                  <td><p class="font-medium">${esc(d.title)}</p><p class="meta">${esc(d.file_name)}</p></td>
                  <td>${extOf(d.file_name)}</td>
                  <td class="num">${fmtSize(d.file_size_kb)}</td>
                  <td class="num">${fmtNum(d.download_count)}</td>
                  <td class="whitespace-nowrap">${d.updated_at}</td>
                  <td><a href="#downloads" class="btn-outline py-1 text-sm" aria-label="下載 ${esc(d.title)}">下載</a></td>
                </tr>`).join('')}
              </tbody>
            </table>
          </div>
        </div>`;
        }).join('')}
      </div>
    </section>`;
}

function screenEvents() {
  const list = [...D.events].sort((a, b) => a.start_at.localeCompare(b.start_at));
  return `
    <section id="events" class="screen" aria-labelledby="events-title">
      <div class="container-site">
        <h1 id="events-title" class="section-title">活動行事曆</h1>
        <p class="meta mb-6">以下為 2026 年下半年活動，日期以台灣時間為準。</p>
        <ol class="space-y-4">
          ${list.map((e) => {
            const sameDay = dateOf(e.start_at) === dateOf(e.end_at);
            const when = sameDay
              ? `${dateOf(e.start_at)} ${timeOf(e.start_at)} – ${timeOf(e.end_at)}`
              : `${dtOf(e.start_at)} 起至 ${dtOf(e.end_at)}`;
            const past = isPast(e.start_at);
            return `
          <li class="card flex flex-col gap-4 sm:flex-row">
            <div class="flex w-20 shrink-0 flex-col items-center rounded-lg ${past ? 'bg-surface text-state-off' : 'bg-brand-blue/10 text-brand-navy'} py-3">
              <span class="text-eyebrow font-semibold">${e.start_at.slice(0, 4)}/${e.start_at.slice(5, 7)}</span>
              <span class="text-3xl font-bold leading-none">${e.start_at.slice(8, 10)}</span>
            </div>
            <div class="min-w-0 flex-1">
              <div class="flex flex-wrap items-center gap-2">
                <h2 class="text-lg font-bold text-brand-navy">${esc(e.title)}</h2>
                ${past ? '<span class="badge-off">已結束</span>' : ''}
              </div>
              <dl class="mt-2 grid gap-x-6 gap-y-1 text-sm text-muted sm:grid-cols-2">
                <div class="flex gap-2"><dt class="shrink-0 font-medium">時間</dt><dd>${when}</dd></div>
                <div class="flex gap-2"><dt class="shrink-0 font-medium">地點</dt><dd>${esc(e.location)}</dd></div>
                <div class="flex gap-2"><dt class="shrink-0 font-medium">報名</dt><dd>${e.registration_deadline ? `${e.registration_deadline} 截止` : '免報名，自由入場'}</dd></div>
              </dl>
              <p class="mt-3 text-sm">${esc(e.description)}</p>
            </div>
          </li>`;
          }).join('')}
        </ol>
      </div>
    </section>`;
}

function screenStaff() {
  const list = [...D.staff].sort((a, b) => a.sort_order - b.sort_order);
  return `
    <section id="staff" class="screen" aria-labelledby="staff-title">
      <div class="container-site">
        <h1 id="staff-title" class="section-title">師資介紹</h1>
        <ul class="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          ${list.map((s) => `
          <li class="card flex gap-4">
            <span aria-hidden="true" class="flex size-14 shrink-0 items-center justify-center rounded-full bg-brand-navy text-xl font-bold text-white">${esc(s.name.slice(0, 1))}</span>
            <div class="min-w-0">
              <div class="flex flex-wrap items-center gap-2">
                <h2 class="text-lg font-bold text-brand-navy">${esc(s.name)}</h2>
                <span class="badge-cat">${esc(titles[s.title_id].name)}</span>
                ${s.position ? `<span class="badge-top">${esc(s.position)}</span>` : ''}
              </div>
              <dl class="mt-2 space-y-1 text-sm text-muted">
                <div class="flex gap-2"><dt class="shrink-0 font-medium">專長</dt><dd>${esc(s.expertise)}</dd></div>
                <div class="flex gap-2"><dt class="shrink-0 font-medium">研究室</dt><dd>${esc(s.office)}</dd></div>
                <div class="flex gap-2"><dt class="shrink-0 font-medium">分機</dt><dd>${s.extension ? esc(s.extension) : '（未提供）'}</dd></div>
                <div class="flex gap-2"><dt class="shrink-0 font-medium">信箱</dt><dd class="break-all">${esc(s.email)}</dd></div>
              </dl>
            </div>
          </li>`).join('')}
        </ul>
      </div>
    </section>`;
}

function screenAlbums() {
  return `
    <section id="albums" class="screen" aria-labelledby="albums-title">
      <div class="container-site space-y-12">
        <div>
          <h1 id="albums-title" class="section-title">系所相簿</h1>
          <ul class="grid gap-5 sm:grid-cols-2">
            ${D.albums.map((al) => {
              const ph = D.photos.filter((p) => p.album_id === al.id);
              const cover = ph.find((p) => p.is_cover) || ph[0];
              return `
            <li class="card overflow-hidden p-0">
              <a href="#album-${al.id}" class="block">
                <img src="./images/photo/${cover.file_name}" alt="${esc(al.title)}封面：${esc(cover.caption)}" width="384" height="256" class="aspect-[3/2] w-full object-cover" loading="lazy" />
              </a>
              <div class="p-5">
                <h2 class="text-lg font-bold text-brand-navy"><a href="#album-${al.id}" class="hover:underline">${esc(al.title)}</a></h2>
                <p class="meta mt-1">拍攝日期 ${al.shot_date} ・ 共 ${ph.length} 張</p>
                <p class="mt-2 text-sm">${esc(al.description)}</p>
              </div>
            </li>`;
            }).join('')}
          </ul>
        </div>
        ${D.albums.map((al) => {
          const ph = D.photos.filter((p) => p.album_id === al.id);
          return `
        <div id="album-${al.id}">
          <h2 class="mb-1 text-xl font-bold text-brand-navy">${esc(al.title)}</h2>
          <p class="meta mb-4">${al.shot_date} ・ ${ph.length} 張照片</p>
          <ul class="grid gap-4 sm:grid-cols-3">
            ${ph.map((p) => `
            <li class="card overflow-hidden p-0">
              <img src="./images/photo/${p.file_name}" alt="${esc(p.caption)}" width="384" height="256" class="aspect-[3/2] w-full object-cover" loading="lazy" />
              <figcaption class="flex items-center justify-between gap-2 px-4 py-3 text-sm"><span>${esc(p.caption)}</span>${p.is_cover ? '<span class="badge-tag">封面</span>' : ''}</figcaption>
            </li>`).join('')}
          </ul>
        </div>`;
        }).join('')}
      </div>
    </section>`;
}

function screenFaq() {
  return `
    <section id="faq" class="screen" aria-labelledby="faq-title">
      <div class="container-site max-w-3xl space-y-10">
        <h1 id="faq-title" class="section-title">常見問題</h1>
        ${[...D.faqCategories].sort((a, b) => a.sort_order - b.sort_order).map((c) => {
          const rows = D.faqs.filter((f) => f.category_id === c.id && f.is_visible).sort((a, b) => a.sort_order - b.sort_order);
          return `
        <div>
          <h2 class="mb-3 text-xl font-bold text-brand-navy">${esc(c.name)}</h2>
          <div class="space-y-3">
            ${rows.map((f, i) => `
            <details class="card group p-0">
              <summary class="flex min-h-11 cursor-pointer items-start gap-3 px-5 py-4 font-medium marker:content-none">
                <span class="text-brand-orange">Q${i + 1}</span><span>${esc(f.question)}</span>
              </summary>
              <p class="border-t border-line px-5 py-4 text-sm leading-relaxed text-muted">${esc(f.answer)}</p>
            </details>`).join('')}
          </div>
        </div>`;
        }).join('')}
      </div>
    </section>`;
}

function screenContact() {
  return `
    <section id="contact" class="screen" aria-labelledby="contact-title">
      <div class="container-site grid gap-10 lg:grid-cols-3">
        <div class="lg:col-span-2">
          <h1 id="contact-title" class="section-title">意見信箱</h1>
          <form id="contact-form" class="card space-y-5" novalidate>
            <div class="grid gap-5 sm:grid-cols-2">
              <label class="block text-sm font-medium">姓名<input type="text" name="name" class="field" autocomplete="name" /></label>
              <label class="block text-sm font-medium">電子郵件<input type="email" name="email" class="field" autocomplete="email" /></label>
            </div>
            <label class="block text-sm font-medium">主旨<input type="text" name="subject" class="field" /></label>
            <label class="block text-sm font-medium">內容<textarea name="content" rows="5" class="field"></textarea></label>
            <p class="meta">送出後系辦將於 3 個工作日內回覆，處理狀態可電洽系辦查詢。</p>
            <button type="submit" class="btn-primary">送出意見</button>
            <p id="contact-note" class="rounded-lg bg-state-ok/10 px-4 py-3 text-sm text-state-ok" tabindex="-1" hidden>此為練習用示意頁面，表單不會真正送出。</p>
          </form>
        </div>
        <aside class="card self-start">
          <h2 class="text-lg font-bold text-brand-navy">系辦公室</h2>
          <dl class="mt-3 space-y-2 text-sm text-muted">
            <div class="flex gap-2"><dt class="shrink-0 font-medium">地址</dt><dd>潮港市海濱路 100 號 資訊大樓 5 樓</dd></div>
            <div class="flex gap-2"><dt class="shrink-0 font-medium">電話</dt><dd>(07) 123-4567 轉 3100</dd></div>
            <div class="flex gap-2"><dt class="shrink-0 font-medium">信箱</dt><dd>im@im.example.edu.tw</dd></div>
            <div class="flex gap-2"><dt class="shrink-0 font-medium">時間</dt><dd>週一至週五 08:30 – 17:00</dd></div>
          </dl>
        </aside>
      </div>
    </section>`;
}

function screenAdmin() {
  const allNews = [...D.news].sort((a, b) => a.id - b.id);
  const tagUse = (id) => D.newsTags.filter((t) => t.tag_id === id).length;
  const catUse = (id) => D.news.filter((n) => n.category_id === id).length;
  const statusBadge = (s) => (s === '已回覆' ? 'badge-ok' : s === '處理中' ? 'badge-warn' : 'badge-off');

  return `
    <section id="admin" class="screen" aria-labelledby="admin-title">
      <div class="container-site space-y-12">
        <div>
          <h1 id="admin-title" class="section-title">後台管理</h1>
          <p class="card border-brand-orange/40 bg-brand-orange/5 text-sm">此頁模擬網站管理員登入後看到的畫面，會顯示前台隱藏的資料（已下架公告、未顯示的問答、留言處理狀態）。</p>
        </div>

        <div>
          <h2 class="mb-3 text-xl font-bold text-brand-navy">公告管理</h2>
          <div class="table-wrap">
            <table class="table">
              <thead><tr>
                <th scope="col" class="num">編號</th><th scope="col">標題</th><th scope="col">分類</th><th scope="col">標籤</th><th scope="col">置頂</th>
                <th scope="col">發布時間</th><th scope="col">下架時間</th><th scope="col" class="num">點閱</th><th scope="col" class="num">附件</th><th scope="col">狀態</th>
              </tr></thead>
              <tbody>
              ${allNews.map((n) => `
                <tr>
                  <td class="num">${n.id}</td>
                  <td class="min-w-56">${esc(n.title)}</td>
                  <td class="whitespace-nowrap">${esc(cats[n.category_id].name)}</td>
                  <td class="whitespace-nowrap">${tagsOf(n.id).map((t) => esc(t.name)).join('、') || '—'}</td>
                  <td>${n.is_top ? '是' : '否'}</td>
                  <td class="whitespace-nowrap">${dtOf(n.published_at)}</td>
                  <td class="whitespace-nowrap">${n.expired_at ? dtOf(n.expired_at) : '無期限'}</td>
                  <td class="num">${fmtNum(n.view_count)}</td>
                  <td class="num">${attachmentsOf(n.id).length}</td>
                  <td>${isExpired(n) ? '<span class="badge-off">已下架</span>' : '<span class="badge-ok">上架中</span>'}</td>
                </tr>`).join('')}
              </tbody>
            </table>
          </div>
        </div>

        <div class="grid gap-8 lg:grid-cols-2">
          <div>
            <h2 class="mb-3 text-xl font-bold text-brand-navy">公告分類管理</h2>
            <div class="table-wrap">
              <table class="table">
                <thead><tr><th scope="col">分類名稱</th><th scope="col" class="num">顯示順序</th><th scope="col" class="num">公告數</th></tr></thead>
                <tbody>
                ${[...D.newsCategories].sort((a, b) => a.sort_order - b.sort_order).map((c) => `
                  <tr><td>${esc(c.name)}</td><td class="num">${c.sort_order}</td><td class="num">${catUse(c.id)}</td></tr>`).join('')}
                </tbody>
              </table>
            </div>
          </div>
          <div>
            <h2 class="mb-3 text-xl font-bold text-brand-navy">標籤管理</h2>
            <div class="table-wrap">
              <table class="table">
                <thead><tr><th scope="col">標籤名稱</th><th scope="col" class="num">使用於幾則公告</th></tr></thead>
                <tbody>
                ${D.tags.map((t) => `<tr><td>#${esc(t.name)}</td><td class="num">${tagUse(t.id)}</td></tr>`).join('')}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div>
          <h2 class="mb-3 text-xl font-bold text-brand-navy">常見問題管理</h2>
          <div class="table-wrap">
            <table class="table">
              <thead><tr><th scope="col">分類</th><th scope="col" class="num">排序</th><th scope="col">問題</th><th scope="col">答案</th><th scope="col">前台顯示</th></tr></thead>
              <tbody>
              ${D.faqs.map((f) => `
                <tr>
                  <td class="whitespace-nowrap">${esc(faqCats[f.category_id].name)}</td>
                  <td class="num">${f.sort_order}</td>
                  <td class="min-w-48">${esc(f.question)}</td>
                  <td class="min-w-64 text-muted">${esc(f.answer)}</td>
                  <td>${f.is_visible ? '<span class="badge-ok">顯示</span>' : '<span class="badge-off">隱藏</span>'}</td>
                </tr>`).join('')}
              </tbody>
            </table>
          </div>
        </div>

        <div>
          <h2 class="mb-3 text-xl font-bold text-brand-navy">留言管理</h2>
          <div class="table-wrap">
            <table class="table">
              <thead><tr>
                <th scope="col" class="num">編號</th><th scope="col">姓名</th><th scope="col">電子郵件</th><th scope="col">主旨</th><th scope="col">內容</th>
                <th scope="col">留言時間</th><th scope="col">狀態</th><th scope="col">回覆時間</th>
              </tr></thead>
              <tbody>
              ${D.contactMessages.map((m) => `
                <tr>
                  <td class="num">${m.id}</td>
                  <td class="whitespace-nowrap">${esc(m.name)}</td>
                  <td>${esc(m.email)}</td>
                  <td class="min-w-32">${esc(m.subject)}</td>
                  <td class="min-w-56 text-muted">${esc(m.content)}</td>
                  <td class="whitespace-nowrap">${dtOf(m.created_at)}</td>
                  <td><span class="${statusBadge(m.status)}">${esc(m.status)}</span></td>
                  <td class="whitespace-nowrap">${m.replied_at ? dtOf(m.replied_at) : '—'}</td>
                </tr>`).join('')}
              </tbody>
            </table>
          </div>
        </div>

        <div>
          <h2 class="mb-3 text-xl font-bold text-brand-navy">友善連結管理</h2>
          <div class="table-wrap">
            <table class="table">
              <thead><tr><th scope="col">分類</th><th scope="col" class="num">排序</th><th scope="col">名稱</th><th scope="col">網址</th><th scope="col">另開視窗</th></tr></thead>
              <tbody>
              ${D.links.map((l) => `
                <tr>
                  <td class="whitespace-nowrap">${esc(linkCats[l.category_id].name)}</td>
                  <td class="num">${l.sort_order}</td>
                  <td class="whitespace-nowrap">${esc(l.name)}</td>
                  <td class="break-all">${esc(l.url)}</td>
                  <td>${l.open_new_window ? '是' : '否'}</td>
                </tr>`).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>`;
}

function footer() {
  return `
  <footer class="mt-16 bg-brand-navy text-white">
    <div class="container-site grid gap-8 py-12 sm:grid-cols-3">
      ${D.linkCategories.map((c) => `
      <nav aria-labelledby="footer-links-${c.id}">
        <h2 id="footer-links-${c.id}" class="mb-3 font-bold">${esc(c.name)}</h2>
        <ul class="space-y-2 text-sm text-white/85">
          ${D.links.filter((l) => l.category_id === c.id).sort((a, b) => a.sort_order - b.sort_order).map((l) => `
          <li><a href="${esc(l.url)}" class="inline-flex min-h-11 items-center hover:underline"${l.open_new_window ? ' target="_blank" rel="noopener"' : ''}>${esc(l.name)}${l.open_new_window ? '<span class="sr-only">（另開新視窗）</span><span aria-hidden="true" class="ml-1 text-white/60">↗</span>' : ''}</a></li>`).join('')}
        </ul>
      </nav>`).join('')}
      <div class="text-sm text-white/85">
        <h2 class="mb-3 font-bold">資訊管理系</h2>
        <p>潮港市海濱路 100 號 資訊大樓 5 樓</p>
        <p class="mt-1">(07) 123-4567 轉 3100</p>
        <p class="mt-4 text-white/60">本網站為資料庫課程練習用的虛構系所網站，所有人物、單位與資料皆為虛構。</p>
      </div>
    </div>
  </footer>`;
}

// ---------- 組合 index.html ----------

const NAV = [
  ['home', '首頁'], ['news', '最新消息'], ['downloads', '下載專區'], ['events', '活動行事曆'],
  ['staff', '師資介紹'], ['albums', '系所相簿'], ['faq', '常見問題'], ['contact', '意見信箱'],
];

const html = `<!DOCTYPE html>
<html lang="zh-Hant">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
  <meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self'; style-src 'self' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; img-src 'self' data:; media-src 'self'; connect-src 'self'; object-src 'none'; frame-src 'none'; base-uri 'self'; form-action 'self'; upgrade-insecure-requests" />
  <title>資訊管理系｜資料庫設計練習網站</title>
  <meta name="description" content="供資料庫課程練習「看畫面設計資料表」的虛構系所網站，含最新消息、下載專區、活動、師資、相簿、常見問題與後台管理畫面。" />
  <meta name="author" content="資料庫課程" />
  <meta property="og:site_name" content="資訊管理系 練習網站" />
  <meta property="og:title" content="資訊管理系｜資料庫設計練習網站" />
  <meta property="og:image" content="./images/og.jpg" />
  <meta property="og:image:alt" content="資訊大樓外觀與資訊管理系字樣" />
  <meta property="og:description" content="看畫面設計資料庫：從網站畫面反推資料表與欄位，再以 SQL 驗證設計。" />

  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+TC:wght@400;500;700&display=swap" rel="stylesheet" />
  <link rel="icon" type="image/png" sizes="48x48" href="./favicon.ico" />
  <link rel="stylesheet" href="./css/style.css?v=${ASSET_VERSION}" />
</head>
<body>
  <a href="#main" class="sr-only z-60 rounded-lg bg-brand-orange px-6 py-3 font-bold text-white focus:not-sr-only focus:fixed focus:left-4 focus:top-4">跳至主要內容</a>

  <header class="bg-brand-navy text-white">
    <div class="container-site flex flex-wrap items-center gap-y-2 py-3">
      <a href="#home" class="flex min-h-11 items-center gap-3">
        <span aria-hidden="true" class="flex size-10 items-center justify-center rounded-lg bg-white font-bold text-brand-navy">資</span>
        <span><span class="block text-eyebrow text-white/70">潮港科技大學</span><span class="block text-lg font-bold leading-tight">資訊管理系</span></span>
      </a>
      <nav aria-label="主選單" class="-mx-4 w-[calc(100%+2rem)] overflow-x-auto px-4 sm:mx-0 sm:ml-auto sm:w-auto sm:px-0">
        <ul class="flex gap-1 whitespace-nowrap">
          ${NAV.map(([id, label]) => `<li><a href="#${id}" data-nav class="nav-tab">${label}</a></li>`).join('')}
        </ul>
      </nav>
      <a href="#admin" data-nav class="nav-tab border border-white/40 sm:ml-4">後台管理</a>
    </div>
  </header>

  <main id="main">
    ${screenHome()}
    ${screenNews()}
    ${screenNewsDetail()}
    ${screenDownloads()}
    ${screenEvents()}
    ${screenStaff()}
    ${screenAlbums()}
    ${screenFaq()}
    ${screenContact()}
    ${screenAdmin()}
  </main>
  ${footer()}

  <button id="go-top" class="fixed bottom-4 right-4 z-50 hidden size-14 cursor-pointer items-center justify-center rounded-full bg-brand-orange shadow-2xl transition hover:-translate-y-1 sm:bottom-8 sm:right-8" aria-label="回到頂部">
    <img src="./images/icon/icon-arrow-up.svg" alt="" width="24" height="24" class="size-6" />
  </button>

  <script src="./js/main.js?v=${ASSET_VERSION}" defer></script>
</body>
</html>
`;

fs.writeFileSync(path.join(ROOT, 'index.html'), html);
console.log('✅ index.html 已產生');

// ---------- seed.sql ----------

const sqlStr = (v) => (v === null || v === undefined ? 'NULL' : `'${String(v).replace(/\\/g, '\\\\').replace(/'/g, "''")}'`);
const sqlVal = (v) => (typeof v === 'number' ? String(v) : sqlStr(v));
const insert = (table, rows) => {
  const cols = Object.keys(rows[0]);
  return `INSERT INTO \`${table}\` (${cols.map((c) => `\`${c}\``).join(', ')}) VALUES\n${rows
    .map((r) => `  (${cols.map((c) => sqlVal(r[c])).join(', ')})`).join(',\n')};\n`;
};

const seed = `-- 參考 schema 與種子資料（MariaDB 10.4+）
-- 由 scripts/build-site.js 產生，內容與 index.html 畫面完全一致。
-- 這是「一種可接受的設計」，不是唯一解；外鍵約束可依課程階段自行省略。
-- 練習情境的「今天」為 ${D.TODAY}。

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
CREATE TABLE contact_messages (
  id         INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  name       VARCHAR(50) NOT NULL,
  email      VARCHAR(100) NOT NULL,
  subject    VARCHAR(200) NOT NULL,
  content    TEXT NOT NULL,
  status     ENUM('未處理', '處理中', '已回覆') NOT NULL DEFAULT '未處理',
  created_at DATETIME NOT NULL,
  replied_at DATETIME NULL
);

-- ===== 種子資料 =====
${insert('news_categories', D.newsCategories)}
${insert('news', D.news)}
${insert('news_attachments', D.newsAttachments)}
${insert('tags', D.tags)}
${insert('news_tags', D.newsTags)}
${insert('download_categories', D.downloadCategories)}
${insert('downloads', D.downloads)}
${insert('events', D.events)}
${insert('staff_titles', D.staffTitles)}
${insert('staff', D.staff)}
${insert('albums', D.albums)}
${insert('photos', D.photos)}
${insert('faq_categories', D.faqCategories)}
${insert('faqs', D.faqs)}
${insert('link_categories', D.linkCategories)}
${insert('links', D.links)}
${insert('contact_messages', D.contactMessages)}`;

fs.writeFileSync(path.join(ROOT, 'docs', 'private', 'seed.sql'), seed);
console.log('✅ docs/private/seed.sql 已產生');

const total = [
  D.newsCategories, D.news, D.newsAttachments, D.tags, D.newsTags, D.downloadCategories, D.downloads, D.events,
  D.staffTitles, D.staff, D.albums, D.photos, D.faqCategories, D.faqs, D.linkCategories, D.links, D.contactMessages,
].reduce((sum, t) => sum + t.length, 0);
console.log(`   17 張表、${total} 筆資料`);
