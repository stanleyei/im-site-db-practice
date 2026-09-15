// 單頁多畫面：每個 <section class="screen"> 對應一個 hash，一次只顯示一個。
// 沒有 JS 時所有畫面會依序堆疊顯示，內容仍完整可讀。
const screens = Array.from(document.querySelectorAll('.screen'));
const navTabs = Array.from(document.querySelectorAll('[data-nav]'));
const DEFAULT_SCREEN = 'home';

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

function showScreen(id, { scroll = true } = {}) {
  const target = screens.find((s) => s.id === id) ? id : DEFAULT_SCREEN;
  screens.forEach((s) => { s.hidden = s.id !== target; });
  navTabs.forEach((a) => {
    const isCurrent = a.getAttribute('href') === `#${target}`;
    if (isCurrent) a.setAttribute('aria-current', 'page');
    else a.removeAttribute('aria-current');
  });
  if (scroll) {
    window.scrollTo({ top: 0, behavior: reduceMotion.matches ? 'auto' : 'smooth' });
  }
}

function currentHash() {
  return window.location.hash.replace(/^#/, '') || DEFAULT_SCREEN;
}

if (screens.length) {
  // 初次載入不捲動，避免瀏覽器還原捲動位置後又跳回頂端
  showScreen(currentHash(), { scroll: false });
  window.addEventListener('hashchange', () => showScreen(currentHash()));
}

// 最新消息分類篩選：<button data-filter="all|分類名"> 對應 <li data-category="分類名">
const filterButtons = Array.from(document.querySelectorAll('[data-filter]'));
const newsItems = Array.from(document.querySelectorAll('[data-category]'));
const emptyNote = document.getElementById('news-empty');

filterButtons.forEach((btn) => {
  btn.addEventListener('click', () => {
    const key = btn.dataset.filter;
    filterButtons.forEach((b) => b.setAttribute('aria-pressed', String(b === btn)));
    let visible = 0;
    newsItems.forEach((li) => {
      const match = key === 'all' || li.dataset.category === key;
      li.hidden = !match;
      if (match) visible += 1;
    });
    if (emptyNote) emptyNote.hidden = visible > 0;
  });
});

// 意見信箱為靜態示意，送出只顯示提示文字
const contactForm = document.getElementById('contact-form');
const contactNote = document.getElementById('contact-note');
if (contactForm && contactNote) {
  contactForm.addEventListener('submit', (event) => {
    event.preventDefault();
    contactNote.hidden = false;
    contactNote.focus();
  });
}

// 回到頂部
const goTop = document.getElementById('go-top');
if (goTop) {
  window.addEventListener('scroll', () => {
    goTop.classList.toggle('hidden', window.scrollY < 600);
  }, { passive: true });
  goTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: reduceMotion.matches ? 'auto' : 'smooth' });
  });
}
