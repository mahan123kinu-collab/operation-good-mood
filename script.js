(() => {
  'use strict';
  const $ = (id) => document.getElementById(id);
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const T = reduced ? 0.05 : 1;
  const faNum = (n) => String(n).replace(/\d/g, (d) => '۰۱۲۳۴۵۶۷۸۹'[d]);

  const STEPS = [
    { emoji: '🎀', title: 'یه مأموریت کوچولو برات داریم!',
      desc: 'این چندتا مرحله فقط برای اینه که یه لبخند کوچولو بیاد روی صورتت. آماده‌ای؟',
      btn: 'بزن بریم! ✨' },
    { emoji: '🩺', title: 'خب خانوم مریض! بیا گزارش بدیم 😂',
      desc: 'اول از همه بگو چند وقته حالت خوب نیست؟', key: 'duration',
      options: ['🤧 از امروز شروع شده', '🥲 چند روزه درگیرشم', '😵 بیشتر از چند روزه'],
      btn: 'ادامه', flash: 'ممنون که گفتی 💗 الان مراقبتم!' },
    { emoji: '🌷', title: 'الان حالت چطوره؟',
      desc: 'راحت‌ترین جواب رو انتخاب کن؛ لازم نیست الکی بگی خوبی.', key: 'mood',
      options: ['😊 یه کم بهترم', '🤒 هنوز خوب نیستم', '😴 بیشتر از همه استراحت می‌خوام', '🫠 حوصله هیچ‌چیزی رو ندارم'],
      btn: 'ادامه', flash: 'هر جوابی که دادی کاملاً اوکیه 🌸' },
    { emoji: '☕', title: 'نسخهٔ حالِ بهترت چیه؟',
      desc: 'اگه همین الان می‌تونستی یکی رو انتخاب کنی، کدوم بیشتر می‌چسبید؟', key: 'comfort',
      options: ['🛌 یه خواب حسابی', '🍵 یه نوشیدنی گرم', '🎬 یه فیلم یا سریال خوب', '😂 یکی بیاد بخندوندم'],
      note: 'این انتخاب فقط برای حال خوبه؛ برای توصیه‌های پزشکی از پزشک یا یک بزرگ‌تر مورد اعتماد کمک بگیر. 💗',
      btn: 'ادامه', flash: 'انتخاب قشنگیه! ☕' },
    { emoji: '💊', title: 'یه یادآوری کوچولو',
      desc: 'وقتی مریضی، لازم نیست همیشه پرانرژی باشی یا وانمود کنی حالت خوبه.',
      box: 'آب کافی، استراحت و گوش دادن به بدنت مهمه. اگه حالت بدتر شد یا نگرانی داشتی، به یکی از بزرگ‌ترها بگو و از پزشک کمک بگیر. 💗',
      btn: 'باشه، حواسم هست 🌸' },
    { emoji: '💌', title: 'یه پیام از طرف سازندهٔ این مأموریت',
      desc: 'این برنامه فقط یه بهونه‌ست که یه چیز خوب بهت بگه:',
      box: 'امیدوارم زودتر حالت بهتر بشه و روزهای قشنگ‌تری در انتظارت باشه. فعلاً به خودت سخت نگیر؛ حتی یه لبخند کوچولو هم کافیه. 🩷',
      btn: 'بریم سراغ سورپرایز؟ 👀' },
    { emoji: '🎁', title: 'سورپرایز آخر!',
      desc: 'اسم خودت رو وارد کن تا پیام آخر مخصوص خودت بشه.', input: true,
      btn: 'سورپرایزمو ببین 💝' }
  ];

  const SECRET = 'پوپولی';
  const state = { step: 0, answers: {}, busy: false, started: false, flash: '', attempts: 0 };
  const norm = (v) => v.replace(/[\u200c\u200b\s]/g, '').replace(/ي/g, 'ی').replace(/ك/g, 'ک').trim();
  let timers = [];
  let heartTimer = null;
  const later = (fn, ms) => { const t = setTimeout(fn, ms * T); timers.push(t); return t; };

  const el = {
    intro: $('intro'), env: $('envelope'), app: $('app'), final: $('final'),
    step: $('step'), emoji: $('emoji'), title: $('title'), desc: $('desc'), flash: $('flash'),
    extra: $('extra'), options: $('options'), note: $('note'), next: $('next'),
    bar: $('bar'), counter: $('counter'), progress: document.querySelector('.progress'),
    finalMsg: $('finalMsg'), restart: $('restart'), hearts: $('hearts')
  };

  /* ---------- floating hearts ---------- */
  function spawnHeart(burst) {
    if (reduced || el.hearts.childElementCount > (burst ? 60 : 18)) return;
    const h = document.createElement('span');
    h.className = 'fh';
    h.textContent = ['💗', '🩷', '✨', '💜', '⭐'][Math.floor(Math.random() * 5)];
    h.style.left = Math.random() * 100 + '%';
    h.style.fontSize = 12 + Math.random() * 18 + 'px';
    const d = 7 + Math.random() * 6;
    h.style.animationDuration = d + 's';
    h.addEventListener('animationend', () => h.remove());
    el.hearts.appendChild(h);
  }
  function startHearts() {
    stopHearts();
    heartTimer = setInterval(() => spawnHeart(false), 900);
    for (let i = 0; i < 6; i++) setTimeout(() => spawnHeart(false), i * 150);
  }
  function stopHearts() { clearInterval(heartTimer); el.hearts.innerHTML = ''; }

  /* ---------- intro ---------- */
  function openEnvelope() {
    if (state.started) return;          // prevents duplicate triggers
    state.started = true;
    el.env.disabled = true;
    el.env.classList.add('opened', 'open');
    el.intro.classList.add('started');
    later(() => el.env.classList.add('out'), 900);          // letter emerges
    later(() => el.env.classList.add('fade'), 3200);        // envelope fades
    later(() => {                                            // zoom in the app
      el.intro.classList.add('leaving');
      el.app.hidden = false;
      el.app.classList.add('zoom');
      renderStep(false);
    }, 5600);
    later(() => {
      el.intro.hidden = true;
      el.app.classList.remove('zoom');
      el.app.classList.add('ready');                         // enable interaction
    }, 6700);
  }
  el.env.addEventListener('click', openEnvelope);

  /* ---------- steps ---------- */
  function mk(tag, cls, text) {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text !== undefined) n.textContent = text;
    return n;
  }

  function fill() {
    const s = STEPS[state.step];
    el.emoji.textContent = s.emoji;
    el.title.textContent = s.title;
    el.desc.textContent = s.desc;
    el.flash.textContent = state.flash;
    el.flash.classList.toggle('show', !!state.flash);
    el.note.textContent = s.note || '';
    el.extra.replaceChildren();
    el.options.replaceChildren();
    el.next.textContent = s.btn;

    if (s.box) el.extra.appendChild(mk('div', 'msgbox', s.box));
    if (s.input) {
      const inp = mk('input', 'name-in');
      inp.type = 'text'; inp.id = 'nameInput'; inp.maxLength = 30;
      inp.placeholder = 'اسمت رو اینجا بنویس...';
      inp.setAttribute('aria-label', 'اسم شما');
      inp.autocomplete = 'off';
      inp.value = state.answers.name || '';
      inp.addEventListener('input', () => { state.answers.name = inp.value; });
      inp.addEventListener('keydown', (e) => { if (e.key === 'Enter') goNext(); });
      el.extra.appendChild(inp);
      const fb = mk('p', 'name-fb');
      fb.id = 'nameFb';
      fb.setAttribute('role', 'alert');
      el.extra.appendChild(fb);
      if (state.attempts > 0) showNameError(false);
    }
    if (s.options) {
      el.options.setAttribute('aria-label', s.title);
      s.options.forEach((label) => {
        const b = mk('button', 'opt', label);
        b.type = 'button';
        const sel = state.answers[s.key] === label;
        if (sel) b.classList.add('selected');
        b.setAttribute('aria-pressed', sel);
        b.addEventListener('click', () => choose(s.key, label));
        el.options.appendChild(b);
      });
      el.next.disabled = !state.answers[s.key];
    } else {
      el.next.disabled = false;
    }

    const n = state.step + 1;
    el.bar.style.width = (n / STEPS.length) * 100 + '%';
    el.progress.setAttribute('aria-valuenow', n);
    el.counter.textContent = `مرحله ${faNum(n)} از ${faNum(STEPS.length)}`;
  }

  function renderStep(animate = true) {
    if (!animate) { fill(); return; }
    state.busy = true;
    el.step.classList.add('exit');
    later(() => {
      fill();
      el.step.classList.remove('exit');
      el.step.classList.add('enter');
      void el.step.offsetWidth;
      el.step.classList.remove('enter');
      state.busy = false;
    }, 350);
  }

  function choose(key, label) {
    state.answers[key] = label;
    el.options.querySelectorAll('.opt').forEach((b) => {
      const on = b.textContent === label;
      b.classList.toggle('selected', on);
      b.setAttribute('aria-pressed', on);
    });
    el.next.disabled = false;
  }

  function goNext() {
    if (state.busy || el.next.disabled) return;
    const s = STEPS[state.step];
    if (s.key && !state.answers[s.key]) return;
    if (s.input) {
      const typed = state.answers.name || '';
      if (norm(typed) === norm(SECRET)) { showFinal(); return; }
      state.attempts += 1;
      showNameError(true);
      return;
    }
    state.flash = s.flash || '';
    state.step += 1;
    renderStep(true);
  }
  el.next.addEventListener('click', goNext);

  function showNameError(shake) {
    const fb = $('nameFb'), inp = $('nameInput');
    if (!fb) return;
    fb.textContent = state.attempts > 2
      ? '💡 راهنمایی: «خوشگله» من همیشه چی صدات می‌کنم؟ 🩷'
      : 'اوه، این اسم من نیست! دوباره امتحان کن 🙈';
    fb.classList.add('show');
    fb.classList.toggle('hint', state.attempts > 2);
    if (shake && inp) {
      inp.classList.remove('shake'); void inp.offsetWidth; inp.classList.add('shake');
      inp.focus();
    }
  }

  /* ---------- final ---------- */
  function showFinal() {
    state.busy = true;
    const name = SECRET;
    el.finalMsg.replaceChildren();
    el.finalMsg.appendChild(mk('p', 'nm', `${name} جان 🩷`));   // textContent = safe from HTML injection
    el.finalMsg.appendChild(mk('p', '', 'این برنامه رو ساختم که یه لبخند کوچولو بیاد روی صورتت. امیدوارم خیلی زود حالت بهتر بشه و دوباره با انرژی همیشگیت بدرخشی! 🌷'));
    el.finalMsg.appendChild(mk('p', '', 'مراقب خودت باش، باشه؟'));
    const card = el.final.querySelector('.card');
    card.querySelectorAll('.sparkle').forEach((n) => n.remove());
    ['✨', '⭐', '💫', '✨', '🌟'].forEach((c, i) => {
      const sp = mk('span', 'sparkle', c);
      sp.style.top = 8 + Math.random() * 80 + '%';
      sp.style.left = i % 2 ? Math.random() * 10 - 4 + '%' : 92 + Math.random() * 8 + '%';
      sp.style.animationDelay = i * 0.35 + 's';
      card.appendChild(sp);
    });
    el.app.classList.remove('ready');
    el.app.hidden = true;
    el.final.hidden = false;
    for (let i = 0; i < 25; i++) setTimeout(() => spawnHeart(true), i * 120);
    state.busy = false;
  }

  /* ---------- restart ---------- */
  function restart() {
    timers.forEach(clearTimeout); timers = [];
    state.step = 0; state.attempts = 0; state.answers = {}; state.busy = false; state.started = false; state.flash = '';
    el.final.hidden = true;
    el.app.hidden = true;
    el.app.classList.remove('ready', 'zoom');
    el.step.classList.remove('exit', 'enter');
    el.intro.classList.remove('leaving', 'started');
    el.intro.hidden = false;
    el.env.classList.remove('opened', 'open', 'out', 'fade');
    el.env.disabled = false;
    startHearts();
  }
  el.restart.addEventListener('click', restart);

  startHearts();
})();
