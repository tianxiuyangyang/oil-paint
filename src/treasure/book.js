// The catalogue: what has been found and what has not, as a page laid over the picture. E (or the little count in
// the corner) opens it; E, Esc or a click on the dark closes it. It knows nothing of the world — the treasures hand
// it a set of found ids and all the text there is.
const STORE = 'oil-paint.treasures.v1';

export const SCENE_LABEL = {
  aurora: '极光雪岭 · Aurora',
  autumn: '秋日林间 · Autumn wood',
};

/** Everything found, in both pictures: { aurora: [ids], autumn: [ids] }. */
export function readFound() {
  try { return JSON.parse(localStorage.getItem(STORE)) ?? {}; } catch { return {}; }
}

export function writeFound(all) {
  try { localStorage.setItem(STORE, JSON.stringify(all)); } catch {}
}

export function createBook({ sceneName, items, found, other = [], onOpen, onClose }) {
  let open = false;
  let resetArmed = false;
  let flashTimer = 0;

  const bag = document.createElement('button');
  bag.id = 'bag';
  bag.type = 'button';
  bag.innerHTML = '<span>宝藏图鉴</span><kbd>E</kbd><b id="bag-count">0 / 0</b>';
  bag.title = 'Treasures · E';
  bag.addEventListener('click', () => toggle());
  document.body.appendChild(bag);

  const toast = document.createElement('div');
  toast.id = 'toast';
  document.body.appendChild(toast);

  const el = document.createElement('div');
  el.id = 'book';
  el.hidden = true;
  el.setAttribute('role', 'dialog');
  el.setAttribute('aria-label', '宝藏图鉴 · Treasures');
  el.innerHTML = `
    <div class="page">
      <header>
        <div>
          <h2>宝藏图鉴</h2>
          <p class="sub">Treasures · ${SCENE_LABEL[sceneName] ?? sceneName}</p>
        </div>
        <button id="book-close" type="button" aria-label="关闭">×</button>
      </header>
      <section class="found">
        <h3>已寻得 <span id="book-got-count"></span></h3>
        <div class="cards" id="book-got"></div>
      </section>
      <section class="lost">
        <h3>尚未寻得 <span id="book-lost-count"></span></h3>
        <div class="cards" id="book-lost"></div>
      </section>
      <footer>
        <span id="book-hint">按 <kbd>E</kbd> 或 <kbd>Esc</kbd> 关闭</span>
        <span id="book-other"></span>
        <button id="book-reset" type="button">清空记录</button>
      </footer>
    </div>`;
  el.addEventListener('mousedown', (e) => { if (e.target === el) close(); });
  document.body.appendChild(el);

  const gotEl = el.querySelector('#book-got');
  const lostEl = el.querySelector('#book-lost');
  const otherEl = el.querySelector('#book-other');
  const resetEl = el.querySelector('#book-reset');
  el.querySelector('#book-close').addEventListener('click', close);

  const card = (item, got) => {
    const d = document.createElement('div');
    d.className = got ? 'card' : 'card lost';
    const dot = got
      ? `<i class="dot" style="--c:${item.tint}"></i>`
      : '<i class="dot locked">?</i>';
    d.innerHTML = `${dot}<b>${got ? item.zh : '？？？'}</b><em>${got ? item.en : 'not yet found'}</em>
      <p>${got ? item.text : item.hint}</p>`;
    return d;
  };

  function render() {
    const got = items.filter((i) => found.has(i.id));
    const lost = items.filter((i) => !found.has(i.id));
    el.querySelector('#book-got-count').textContent = `${got.length} / ${items.length}`;
    el.querySelector('#book-lost-count').textContent = lost.length ? `${lost.length} 件` : '都找到了';
    gotEl.replaceChildren(...got.map((i) => card(i, true)));
    lostEl.replaceChildren(...lost.map((i) => card(i, false)));
    if (!got.length) {
      const empty = document.createElement('p');
      empty.className = 'empty';
      empty.textContent = '还什么也没有。走出这条山脊，四下看看。';
      gotEl.append(empty);
    }
    if (!lost.length) {
      const done = document.createElement('p');
      done.className = 'empty';
      done.textContent = '这幅画里的东西都齐了。';
      lostEl.append(done);
    }
    bag.querySelector('#bag-count').textContent = `${got.length} / ${items.length}`;
    bag.classList.toggle('full', got.length === items.length);
    renderOther();
  }

  function renderOther() {
    // what the other picture still holds: a reason to go back to the two buttons in the corner
    const all = readFound();
    otherEl.textContent = other
      .map(({ key, zh, total }) => `${zh} ${(all[key] ?? []).length} / ${total}`)
      .join(' · ');
  }

  function refresh() {
    render();
    resetEl.textContent = '清空记录';
    resetArmed = false;
  }

  function openBook() {
    if (open) return;
    open = true;
    refresh();
    el.hidden = false;
    document.exitPointerLock?.();
    onOpen?.();
  }

  function close() {
    if (!open) return;
    open = false;
    el.hidden = true;
    resetEl.textContent = '清空记录';
    resetArmed = false;
    onClose?.();
  }

  const toggle = () => (open ? close() : openBook());

  addEventListener('keydown', (e) => {
    if (e.repeat) return;
    if (e.code === 'KeyE') { e.preventDefault(); toggle(); }
    else if (e.code === 'Escape' && open) { e.preventDefault(); close(); }
  });

  resetEl.addEventListener('click', () => {
    if (!resetArmed) {
      resetArmed = true;
      resetEl.textContent = '再点一次：清空';
      return;
    }
    const all = readFound();
    delete all[sceneName];
    writeFound(all);
    location.reload();
  });

  /** A line at the top of the picture for a moment: what was just picked up. */
  function flash(zh, en) {
    toast.innerHTML = `拾得 · <b>${zh}</b> <em>${en}</em>`;
    toast.classList.add('on');
    clearTimeout(flashTimer);
    flashTimer = setTimeout(() => toast.classList.remove('on'), 2600);
  }

  render();
  return {
    el, bag, flash, refresh, open: openBook, close, toggle,
    get isOpen() { return open; },
  };
}
