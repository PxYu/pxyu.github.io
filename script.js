const themeToggle = document.querySelector('.theme-toggle');
const themeToggleLabel = document.querySelector('.theme-toggle-label');
const themeStorageKey = 'theme-preference';
const systemDarkMode = window.matchMedia('(prefers-color-scheme: dark)');

const applyTheme = (theme) => {
  document.body.classList.toggle('dark-theme', theme === 'dark');
  document.body.classList.toggle('light-theme', theme === 'light');

  if (themeToggle) {
    const isDark = theme === 'dark';
    themeToggle.setAttribute('aria-pressed', String(isDark));
    if (themeToggleLabel) {
      // Label names the action a click performs (switch to the other
      // mode), not the mode you're currently in.
      themeToggleLabel.textContent = isDark ? 'Light' : 'Dark';
    }
  }
};

const getPreferredTheme = () => {
  const savedTheme = localStorage.getItem(themeStorageKey);
  if (savedTheme === 'dark' || savedTheme === 'light') {
    return savedTheme;
  }

  return systemDarkMode.matches ? 'dark' : 'light';
};

applyTheme(getPreferredTheme());

if (themeToggle) {
  themeToggle.addEventListener('click', () => {
    const icon = themeToggle.querySelector('.theme-toggle-icon');
    if (icon) {
      icon.classList.add('spin');
      setTimeout(() => icon.classList.remove('spin'), 400);
    }
    const nextTheme = document.body.classList.contains('dark-theme') ? 'light' : 'dark';
    localStorage.setItem(themeStorageKey, nextTheme);
    applyTheme(nextTheme);
  });
}

systemDarkMode.addEventListener('change', (event) => {
  if (!localStorage.getItem(themeStorageKey)) {
    applyTheme(event.matches ? 'dark' : 'light');
  }
});

(function () {
  const log = document.getElementById('terminal-log');
  const terminalBody = document.querySelector('.terminal-body');
  if (!log || !terminalBody) return;

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const lineCount = log.querySelectorAll('.tc-line').length;
  const stagger = 160;
  const initialDelay = 200;

  const esc = (s) => String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  const stripSlash = (s) => s.replace(/\/+$/, '');

  const setupInteractiveTerminal = () => {
    if (terminalBody.dataset.interactive) return;
    terminalBody.dataset.interactive = '1';

    const easterEggs = ['whoami', 'sudo hire-me', 'git blame life', 'fortune', 'man pxyu', 'ping pxyu.github.io', 'vim', 'uname -a'];

    const hint = document.createElement('div');
    hint.className = 'tc-hint';

    const output = document.createElement('div');
    output.id = 'terminal-output';
    output.setAttribute('aria-live', 'polite');

    const prompt = document.createElement('form');
    prompt.className = 'tc-interactive-prompt';
    prompt.setAttribute('action', '#');
    prompt.innerHTML = '<span class="tc-prompt" aria-hidden="true">~</span>';

    const input = document.createElement('input');
    input.id = 'terminal-input';
    input.className = 'tc-input';
    input.type = 'text';
    input.autocomplete = 'off';
    input.autocapitalize = 'none';
    input.autocorrect = 'off';
    input.spellcheck = false;
    input.setAttribute('enterkeyhint', 'go');
    input.setAttribute('aria-label', 'Terminal command');
    prompt.appendChild(input);

    terminalBody.append(output, hint, prompt);

    const refreshHint = () => {
      const pool = easterEggs.slice();
      for (let i = pool.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [pool[i], pool[j]] = [pool[j], pool[i]];
      }
      hint.innerHTML = `<span class="tc-date"># try: help · ${pool.slice(0, 4).join(' · ')}</span>`;
    };
    refreshHint();

    const scrollToPrompt = () => {
      prompt.scrollIntoView({ block: 'nearest' });
    };

    const appendLines = (lines, cls = 'tc-output-line') => {
      if (!lines || !lines.length) return;
      lines.forEach((html) => {
        const div = document.createElement('div');
        div.className = cls;
        div.innerHTML = html;
        output.appendChild(div);
      });
      scrollToPrompt();
    };

    const listLatest = () => Array.from(document.querySelectorAll('.latest-list li')).map((li) => {
      const tag = li.querySelector('.tag')?.textContent.trim() || '';
      const title = li.querySelector('a')?.textContent.trim() || '';
      const venue = li.querySelector('.venue')?.textContent.trim() || '';
      return `<span class="tc-hash">${esc(tag)}</span>  ${esc(title)}${venue ? `  <span class="tc-date">${esc(venue)}</span>` : ''}`;
    });

    const openTarget = (name) => {
      const targets = {
        email: 'mailto:pxyuwhu@gmail.com',
        scholar: 'https://scholar.google.com/citations?user=S102tmcAAAAJ',
        linkedin: 'https://www.linkedin.com/in/pxyu',
        twitter: 'https://twitter.com/pxyumass',
        github: 'https://github.com/PxYu',
        papers: '#latest',
        bio: '#about',
        contact: '.contact-links',
      };
      const href = targets[name];
      if (!href) return null;
      if (href.startsWith('#') || href.startsWith('.')) {
        document.querySelector(href)?.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth' });
        return [`<span class="tc-msg">scrolling to ${esc(name)}...</span>`];
      }
      if (href.startsWith('mailto:')) {
        window.location.href = href;
        return ['<span class="tc-msg">opening email client...</span>'];
      }
      window.open(href, '_blank', 'noopener,noreferrer');
      return [`<span class="tc-msg">opening ${esc(name)}...</span>`];
    };

    const localFortunes = [
      ['grep: soul: No such file or directory', 'Have you tried stemming?'],
      ['Your query is underspecified.', "So is everyone else's."],
      ['Citation needed.', 'Including this one.'],
      ['过拟合了童年，泛化不了星期一。', 'Overfit the childhood set. Mondays are OOD.'],
      ['The index is always one update behind the truth.', 'So are we.'],
      ['未检索到相关结果。', 'Try a longer query, or a shorter life plan.'],
      ['rm: /: Permission denied', 'The universe keeps backups.'],
      ['This incident will be reported.', 'It never is.'],
      ['三人行，必有我师焉。', 'When I walk with two others, one of them can be my teacher. — Analects'],
      ['欲速则不达。', 'More haste, less speed.'],
      ['知彼知己，百战不殆。', 'Know the other and know yourself, and you need not fear a hundred battles. — Sun Tzu'],
      ['人无远虑，必有近忧。', 'Without thought for what is distant, sorrow is near at hand. — Analects'],
      ['授人以鱼不如授人以渔。', 'Give a fish and you feed them a day; teach them to fish and you feed them for life.'],
      ['学如逆水行舟，不进则退。', 'Learning is rowing upstream: stop, and you drift back.'],
      ['千里之行，始于足下。', 'A journey of a thousand miles begins with a single step. — Laozi'],
      ['不入虎穴，焉得虎子。', "How do you catch a tiger cub without entering the tiger's den?"],
    ];

    const recentFortuneKeys = [];
    const recentFortuneLimit = 8;
    let fortuneQueue = Promise.resolve();

    const fortuneKey = (pair) => String(pair && pair[0] || '').trim();

    const rememberFortune = (pair) => {
      const key = fortuneKey(pair);
      if (!key) return;
      const prev = recentFortuneKeys.indexOf(key);
      if (prev !== -1) recentFortuneKeys.splice(prev, 1);
      recentFortuneKeys.push(key);
      if (recentFortuneKeys.length > recentFortuneLimit) recentFortuneKeys.shift();
    };

    const localFortune = () => {
      const last = recentFortuneKeys[recentFortuneKeys.length - 1];
      const blocked = new Set(recentFortuneKeys);
      let pool = localFortunes.filter((row) => !blocked.has(fortuneKey(row)));
      if (!pool.length) {
        pool = localFortunes.filter((row) => fortuneKey(row) !== last);
      }
      if (!pool.length) pool = localFortunes;
      return pool[Math.floor(Math.random() * pool.length)];
    };

    const fetchJson = async (url) => {
      const ctrl = new AbortController();
      const timer = window.setTimeout(() => ctrl.abort(), 2000);
      try {
        const res = await fetch(url, { signal: ctrl.signal, credentials: 'omit' });
        if (!res.ok) throw new Error('bad status');
        return await res.json();
      } finally {
        window.clearTimeout(timer);
      }
    };

    const remoteFortunes = [
      async () => {
        const d = await fetchJson('https://v1.jinrishici.com/all.json');
        const text = (d && d.content || '').trim();
        if (!text) throw new Error('empty');
        const by = [d.author, d.origin].filter(Boolean).join(' · ');
        return [text, by ? `— ${by}` : ''];
      },
      async () => {
        const d = await fetchJson('https://v1.hitokoto.cn/?encode=json&charset=utf-8&c=d&c=i&c=k');
        const text = (d && d.hitokoto || '').trim();
        if (text.length < 8 || text.length > 72) throw new Error('skip');
        const by = [d.from_who, d.from].filter(Boolean).join(' · ');
        return [text, by ? `— ${by}` : ''];
      },
      async () => {
        const d = await fetchJson('https://official-joke-api.appspot.com/jokes/programming/random');
        const joke = Array.isArray(d) ? d[0] : d;
        if (!joke || !joke.setup || !joke.punchline) throw new Error('empty');
        return [String(joke.setup), String(joke.punchline)];
      },
      async () => {
        const d = await fetchJson('https://uselessfacts.jsph.pl/api/v2/facts/random?language=en');
        const text = (d && d.text || '').trim();
        if (text.length < 20 || text.length > 160) throw new Error('skip');
        return [text, '— useless fact'];
      },
    ];

    const pickFortune = async () => {
      const blocked = new Set(recentFortuneKeys);
      const fresh = (pair) => pair && fortuneKey(pair) && !blocked.has(fortuneKey(pair));

      if (Math.random() < 0.4) return localFortune();
      const order = remoteFortunes.slice();
      for (let i = order.length - 1; i > 0; i -= 1) {
        const j = Math.floor(Math.random() * (i + 1));
        const tmp = order[i];
        order[i] = order[j];
        order[j] = tmp;
      }
      for (const src of order.slice(0, 2)) {
        try {
          const pair = await src();
          if (fresh(pair)) return pair;
        } catch {
          // try the other source, then an unused local line
        }
      }
      return localFortune();
    };

    const renderFortune = (el, pair) => {
      const line = pair && pair[0] ? String(pair[0]) : '';
      const extra = pair && pair[1] ? String(pair[1]) : '';
      el.textContent = line;
      if (extra) {
        const sub = document.createElement('div');
        sub.className = 'tc-output-line';
        const span = document.createElement('span');
        span.className = 'tc-date';
        span.textContent = extra;
        sub.appendChild(span);
        el.after(sub);
      }
    };

    const printFortune = () => {
      const pending = document.createElement('div');
      pending.className = 'tc-output-line';
      pending.innerHTML = '<span class="tc-date">consulting /dev/oracle...</span>';
      output.appendChild(pending);
      scrollToPrompt();
      fortuneQueue = fortuneQueue.catch(() => {}).then(async () => {
        let pair;
        try {
          pair = await pickFortune();
        } catch {
          pair = localFortune();
        }
        rememberFortune(pair);
        renderFortune(pending, pair);
        scrollToPrompt();
      });
    };

    const helpLines = () => [
      '<span class="tc-hash">available commands:</span>',
      '  <span class="tc-ref">whoami</span>                 who is this person',
      '  <span class="tc-ref">ls</span> [papers|bio|contact]  list files',
      '  <span class="tc-ref">cat bio.txt</span>            full bio',
      '  <span class="tc-ref">cat papers</span>             latest work',
      '  <span class="tc-ref">open</span> email|scholar|github',
      '  <span class="tc-ref">cd</span> papers|bio|contact    jump to a section',
      '  <span class="tc-ref">clear</span>                   clear output',
      `<span class="tc-date">hint: try \`${easterEggs[Math.floor(Math.random() * easterEggs.length)]}\`</span>`,
    ];

    const exactCommands = {
      'sudo hire-me': () => [
        '<span class="tc-error">you are not in the sudoers file.</span>',
        '<span class="tc-error">This incident will be reported.</span>',
      ],
      'rm -rf /': () => ['<span class="tc-error">Permission denied. Nice try.</span>'],
      'git blame life': () => [
        '<span class="tc-hash">a1b2c3d</span> (Universe 10000000 00:00:00) 1) things happen',
        '<span class="tc-hash">a1b2c3d</span> (Universe 10000000 00:00:00) 2) deal with it',
      ],
      'echo $shell': () => ['/bin/zsh'],
      'echo $home': () => ['/home/pxyu'],
      'uname -a': () => ['Linux pxyu.github.io 6.0 #1 SMP x86_64 GNU/Linux'],
      'ping pxyu.github.io': () => [
        'PING pxyu.github.io: 56 data bytes',
        '64 bytes: icmp_seq=0 ttl=60 time=12.4 ms',
        '64 bytes: icmp_seq=1 ttl=60 time=11.8 ms',
        '<span class="tc-msg">2 packets transmitted, 2 received, 0% packet loss</span>',
      ],
      'man pxyu': () => [
        '<span class="tc-hash">PXYU(1)                User Commands               PXYU(1)</span>',
        '',
        '<span class="tc-ref">NAME</span>',
        '    pxyu — senior software engineer and researcher',
        '',
        '<span class="tc-ref">SYNOPSIS</span>',
        '    pxyu [--email] [--scholar] [--linkedin] [--twitter]',
        '',
        '<span class="tc-ref">DESCRIPTION</span>',
        '    Builds AI and search systems at Snowflake. Ph.D. in CS.',
      ],
    };

    const run = (raw) => {
      const line = raw.trim().replace(/\s+/g, ' ');
      if (!line) return;
      const lower = line.toLowerCase();
      const originalArgs = line.split(' ').slice(1);

      if (exactCommands[lower]) {
        appendLines(exactCommands[lower]());
        return;
      }

      const [cmd, ...args] = lower.split(' ');
      const flags = args.filter((a) => a.startsWith('-'));
      const positional = args.filter((a) => !a.startsWith('-')).map(stripSlash);

      switch (cmd) {
        case 'help':
        case '?':
          appendLines(helpLines());
          return;
        case 'whoami':
          appendLines([
            'guest',
            '<span class="tc-date">（but aren\'t we all just guests on this pale blue dot?）</span>',
          ]);
          return;
        case 'pwd':
          appendLines(['/home/pxyu']);
          return;
        case 'clear':
          output.replaceChildren();
          return;
        case 'ls': {
          const long = flags.some((f) => f.includes('l'));
          const target = positional[0] || '';
          if (!target) {
            appendLines(long
              ? [
                'total 3',
                'drwxr-xr-x  <span class="tc-ref">bio/</span>',
                'drwxr-xr-x  <span class="tc-ref">papers/</span>',
                'drwxr-xr-x  <span class="tc-ref">contact/</span>',
              ]
              : ['<span class="tc-ref">bio/</span>  <span class="tc-ref">papers/</span>  <span class="tc-ref">contact/</span>']);
            return;
          }
          if (target === 'papers') {
            appendLines(listLatest());
            return;
          }
          if (target === 'bio') {
            appendLines(['bio.txt']);
            return;
          }
          if (target === 'contact') {
            appendLines(['email  scholar  linkedin  twitter  github']);
            return;
          }
          appendLines([`<span class="tc-error">ls: ${esc(target)}: No such file or directory</span>`]);
          return;
        }
        case 'cat': {
          const file = stripSlash((positional.join(' ') || '').replace(/^\.\//, ''));
          if (!file) {
            appendLines(['<span class="tc-error">cat: missing file operand</span>']);
            return;
          }
          if (file === 'bio.txt' || file === 'bio') {
            appendLines([
              'Building AI and search systems at Snowflake Inc.',
              'Ph.D. from Manning CICS, UMass Amherst.',
              'Research @ CIIR, advised by James Allan &amp; Negin Rahimi.',
              'Prev: Dataminr · Amazon Alexa · Baidu Research.',
            ]);
            return;
          }
          if (file === 'papers' || file === 'papers.txt') {
            appendLines(listLatest());
            return;
          }
          appendLines([`<span class="tc-error">cat: ${esc(file)}: No such file or directory</span>`]);
          return;
        }
        case 'cd': {
          const dest = positional[0] || '';
          if (!dest || dest === '~' || dest === '.' || dest === '/home/pxyu') return;
          const jumped = openTarget(dest);
          if (jumped) {
            appendLines(jumped);
            return;
          }
          appendLines([`<span class="tc-error">cd: no such file or directory: ${esc(args[0] || dest)}</span>`]);
          return;
        }
        case 'open': {
          const name = positional[0];
          if (!name) {
            appendLines([
              '<span class="tc-error">open: missing operand</span>',
              '<span class="tc-date">usage: open email | scholar | linkedin | twitter | github | papers | bio</span>',
            ]);
            return;
          }
          const result = openTarget(name);
          if (result) {
            appendLines(result);
            return;
          }
          appendLines([`<span class="tc-error">open: unknown target: ${esc(name)}</span>`]);
          return;
        }
        case 'echo': {
          if (args[0] === '$shell') {
            appendLines(['/bin/zsh']);
            return;
          }
          if (args[0] === '$home') {
            appendLines(['/home/pxyu']);
            return;
          }
          appendLines([esc(originalArgs.join(' '))]);
          return;
        }
        case 'git': {
          const gitLine = args.join(' ');
          if (gitLine === 'log' || gitLine === 'log --oneline --graph') {
            appendLines(['<span class="tc-date">already displayed above.</span>']);
            return;
          }
          appendLines([`<span class="tc-error">git: '${esc(gitLine)}' is not a pxyu command</span>`]);
          return;
        }
        case 'vim':
          appendLines([
            '<span class="tc-date">VIM - Vi IMproved 9.1</span>',
            '~',
            '~',
            '<span class="tc-date">To exit: Esc → :q! → Enter</span>',
          ]);
          return;
        case 'nano':
          appendLines(['<span class="tc-date">GNU nano 7.2  [New File]</span>', '^X Exit']);
          return;
        case 'fortune':
          printFortune();
          return;
        case 'exit':
          appendLines(["There is no escape. You're already here."]);
          return;
        default:
          appendLines([`<span class="tc-error">zsh: command not found: ${esc(line)}</span>`]);
      }
    };

    const history = [];
    let historyIndex = -1;
    let draft = '';

    const submit = () => {
      const raw = input.value;
      input.value = '';
      const collapsed = raw.trim().replace(/\s+/g, ' ');
      if (collapsed) {
        if (history[0] !== collapsed) history.unshift(collapsed);
        historyIndex = -1;
        draft = '';
        appendLines([`<span class="tc-prompt">~</span>  <span class="tc-msg">${esc(collapsed)}</span>`], 'tc-output-line tc-echo');
        refreshHint();
      }
      run(collapsed);
      scrollToPrompt();
    };

    terminalBody.addEventListener('click', (e) => {
      if (e.target.closest('a, input, button, textarea')) return;
      const sel = window.getSelection && String(window.getSelection());
      if (sel) return;
      input.focus();
    });

    prompt.addEventListener('submit', (e) => {
      e.preventDefault();
      submit();
    });

    input.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'l') {
        e.preventDefault();
        output.replaceChildren();
        return;
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (!history.length) return;
        if (historyIndex === -1) draft = input.value;
        historyIndex = Math.min(historyIndex + 1, history.length - 1);
        input.value = history[historyIndex];
        return;
      }
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (historyIndex === -1) return;
        if (historyIndex === 0) {
          historyIndex = -1;
          input.value = draft;
          return;
        }
        historyIndex--;
        input.value = history[historyIndex];
      }
    });
  };

  const play = () => {
    if (log.classList.contains('is-played') || log.classList.contains('is-playing')) return;
    if (reducedMotion) {
      log.classList.add('is-played');
      setupInteractiveTerminal();
      return;
    }
    log.classList.add('is-playing');
    const doneIn = initialDelay + Math.max(lineCount - 1, 0) * stagger + 320;
    window.setTimeout(() => {
      log.classList.add('is-played');
      log.classList.remove('is-playing');
      setupInteractiveTerminal();
    }, doneIn);
  };

  const panel = terminalBody.closest('.panel') || terminalBody;
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          play();
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(panel);
  } else {
    play();
  }
})();

// Paper tooltips
(function () {
  const tip = document.createElement('div');
  tip.className = 'paper-tooltip';
  document.body.appendChild(tip);

  let hideTimer;

  const show = (anchor) => {
    clearTimeout(hideTimer);
    const abstract = anchor.dataset.abstract || '';
    const venue = anchor.dataset.venue || '';
    tip.replaceChildren();
    if (venue) {
      const venueEl = document.createElement('div');
      venueEl.className = 'paper-tooltip-venue';
      venueEl.textContent = venue;
      tip.appendChild(venueEl);
    }
    const abstractEl = document.createElement('div');
    abstractEl.className = 'paper-tooltip-abstract';
    abstractEl.textContent = abstract;
    tip.appendChild(abstractEl);
    tip.style.display = 'block';

    const rect = anchor.getBoundingClientRect();
    const sx = window.scrollX, sy = window.scrollY;
    tip.style.opacity = '0';
    tip.style.left = '0';
    tip.style.top = '0';

    requestAnimationFrame(() => {
      const tw = tip.offsetWidth, th = tip.offsetHeight;
      let left = rect.left + sx;
      let top = rect.top + sy - th - 10;

      if (left + tw > window.innerWidth + sx - 12) left = window.innerWidth + sx - tw - 12;
      if (left < sx + 8) left = sx + 8;
      if (top < sy + 8) top = rect.bottom + sy + 10;

      tip.style.left = left + 'px';
      tip.style.top = top + 'px';
      tip.style.opacity = '1';
    });
  };

  const hide = () => {
    hideTimer = setTimeout(() => {
      tip.style.opacity = '0';
      setTimeout(() => { tip.style.display = 'none'; }, 180);
    }, 80);
  };

  tip.addEventListener('mouseenter', () => clearTimeout(hideTimer));
  tip.addEventListener('mouseleave', hide);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') hide();
  });

  document.querySelectorAll('a[data-abstract]').forEach(el => {
    el.addEventListener('mouseenter', () => show(el));
    el.addEventListener('mouseleave', hide);
    el.addEventListener('focus', () => show(el));
    el.addEventListener('blur', hide);
  });
})();

// Visitor globe
(function () {
  const canvas = document.getElementById('visitor-globe');
  if (!canvas) return;

  const dpr = window.devicePixelRatio || 1;
  canvas.width = 320 * dpr;
  canvas.height = 320 * dpr;

  const ctx = canvas.getContext('2d');
  const S = canvas.width;
  const cx = S / 2, cy = S / 2;
  const R = S / 2 - 18 * dpr;

  const TILT = 23.5 * Math.PI / 180;

  let visitorLat = 37.77, visitorLng = -122.42;
  let rot = -visitorLng * Math.PI / 180;
  let landFeature = null;
  let wuhanScreen = null;
  let visitorScreen = null;
  let paused = false;
  let visible = true;
  const reducedMotionMQ = window.matchMedia('(prefers-reduced-motion: reduce)');

  fetch('./land-110m.json')
    .then(r => r.json())
    .then(world => {
      const fc = topojson.feature(world, world.objects.land);
      landFeature = fc.features ? fc.features[0] : fc;
    })
    .catch(() => {});

  const project = (lat_deg, lng_deg) => {
    const la = lat_deg * Math.PI / 180;
    const lo = lng_deg * Math.PI / 180 + rot;
    const x0 = Math.cos(la) * Math.sin(lo);
    const y0 = Math.sin(la);
    const z  = Math.cos(la) * Math.cos(lo);
    const x = x0 * Math.cos(TILT) - y0 * Math.sin(TILT);
    const y = x0 * Math.sin(TILT) + y0 * Math.cos(TILT);
    return { sx: cx + R * x, sy: cy - R * y, vis: z > 0, z };
  };

  // Snap a linearly-interpolated limb point onto the globe circle.
  // Raw interpolation lands slightly inside the circle; snapping ensures
  // ctx.arc() starts exactly where lineTo ended — no spurious connector line.
  const limbSnap = (a, b) => {
    const t = a.z / (a.z - b.z);
    const rx = a.sx + t * (b.sx - a.sx) - cx;
    const ry = a.sy + t * (b.sy - a.sy) - cy;
    const ang = Math.atan2(ry, rx);
    return { sx: cx + R * Math.cos(ang), sy: cy + R * Math.sin(ang), ang };
  };

  const drawRing = (ring) => {
    const pts = ring.map(([lng, lat]) => project(lat, lng));
    const n = pts.length;
    if (!pts.some(p => p.vis)) return;

    // Start from the first invis→vis transition so entryAngle is always known.
    // Without this, a ring whose vertex #0 is already visible would get
    // entryAngle=NaN and canvas fill would close with a straight chord.
    let start = 0;
    for (let i = 0; i < n; i++) {
      if (pts[i].vis && !pts[(i + n - 1) % n].vis) { start = i; break; }
    }

    let penDown = false;
    let entryAngle = NaN;

    for (let ii = 0; ii < n; ii++) {
      const i   = (start + ii) % n;
      const cur = pts[i];
      const prv = pts[(i + n - 1) % n];

      if (cur.vis) {
        if (!penDown) {
          if (!prv.vis) {
            const lp = limbSnap(prv, cur);
            entryAngle = lp.ang;
            ctx.moveTo(lp.sx, lp.sy);
          } else {
            entryAngle = NaN;
            ctx.moveTo(cur.sx, cur.sy);
          }
          penDown = true;
        }
        ctx.lineTo(cur.sx, cur.sy);
      } else if (penDown) {
        const lp = limbSnap(prv, cur);
        ctx.lineTo(lp.sx, lp.sy);
        if (!isNaN(entryAngle)) {
          let da = entryAngle - lp.ang;
          while (da >  Math.PI) da -= 2 * Math.PI;
          while (da < -Math.PI) da += 2 * Math.PI;
          ctx.arc(cx, cy, R, lp.ang, entryAngle, da < 0);
        }
        penDown = false;
      }
    }
    if (penDown) ctx.closePath();
  };

  // ISO 3166-1 alpha-2 -> flag emoji (regional indicator symbols).
  const countryFlag = code => code
    ? String.fromCodePoint(...[...code.toUpperCase()].map(c => 127397 + c.charCodeAt(0)))
    : '';

  // "City, ST, USA" for the US (state abbreviation); "City, 🇨🇳" elsewhere.
  const formatCityLocation = (city, regionCode, countryCode) => countryCode === 'US'
    ? `${city}, ${regionCode}, USA`
    : `${city}, ${countryFlag(countryCode)}`;

  fetch('https://ipapi.co/json/')
    .then(r => r.json())
    .then(d => {
      if (!d.latitude) return;
      visitorLat = d.latitude;
      visitorLng = d.longitude;
      rot = -visitorLng * Math.PI / 180;
      const label = document.getElementById('globe-city');
      if (label && d.city) label.textContent = formatCityLocation(d.city, d.region_code, d.country_code);
    })
    .catch(() => {});

  const isDark = () =>
    document.body.classList.contains('dark-theme') ||
    (!document.body.classList.contains('light-theme') &&
      window.matchMedia('(prefers-color-scheme: dark)').matches);

  const draw = () => {
    ctx.clearRect(0, 0, S, S);
    const dark = isDark();

    // Ocean — flat + rim shadow, saturated cartoon colors
    const ocean = ctx.createRadialGradient(cx - R * 0.25, cy - R * 0.3, R * 0.1, cx, cy, R);
    if (dark) {
      ocean.addColorStop(0, '#1a4a7a');
      ocean.addColorStop(1, '#0a1e35');
    } else {
      ocean.addColorStop(0, '#5bbde4');
      ocean.addColorStop(1, '#1e7ec8');
    }

    // Rotation axis — drawn behind globe, poles extend beyond sphere
    const ext = 14 * dpr;
    const nax = cx - (R + ext) * Math.sin(TILT);
    const nay = cy - (R + ext) * Math.cos(TILT);
    const sax = cx + (R + ext) * Math.sin(TILT);
    const say = cy + (R + ext) * Math.cos(TILT);
    const axisColor = dark ? 'rgba(180,210,255,0.85)' : 'rgba(30,60,160,0.75)';

    ctx.save();
    ctx.strokeStyle = axisColor;
    ctx.lineWidth = 3.5 * dpr;
    ctx.setLineDash([5 * dpr, 4 * dpr]);
    ctx.beginPath();
    ctx.moveTo(nax, nay);
    ctx.lineTo(sax, say);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = axisColor;
    ctx.beginPath();
    ctx.arc(nax, nay, 5 * dpr, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(sax, say, 5 * dpr, 0, Math.PI * 2);
    ctx.fill();

    ctx.font = `bold ${15 * dpr}px monospace`;
    ctx.fillStyle = axisColor;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const labelOff = 12 * dpr;
    ctx.fillText('N', nax - labelOff * Math.cos(TILT), nay + labelOff * Math.sin(TILT));
    ctx.fillText('S', sax + labelOff * Math.cos(TILT), say - labelOff * Math.sin(TILT));
    ctx.restore();

    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, R, 0, Math.PI * 2);
    ctx.fillStyle = ocean;
    ctx.fill();
    ctx.clip();

    // Grid lines — dashed
    ctx.setLineDash([3 * dpr, 5 * dpr]);
    ctx.strokeStyle = dark ? 'rgba(130,200,255,0.38)' : 'rgba(255,255,255,0.55)';
    ctx.lineWidth = 1.8 * dpr;

    for (let l = 0; l < 360; l += 30) {
      ctx.beginPath();
      let first = true;
      for (let a = -90; a <= 90; a += 3) {
        const { sx, sy, vis } = project(a, l);
        if (vis) { first ? ctx.moveTo(sx, sy) : ctx.lineTo(sx, sy); first = false; }
        else { first = true; }
      }
      ctx.stroke();
    }

    [-60, -30, 0, 30, 60].forEach(lat => {
      ctx.beginPath();
      let first = true;
      for (let l = 0; l <= 361; l += 3) {
        const { sx, sy, vis } = project(lat, l);
        if (vis) { first ? ctx.moveTo(sx, sy) : ctx.lineTo(sx, sy); first = false; }
        else { first = true; }
      }
      ctx.stroke();
    });

    ctx.setLineDash([]);

    // Land — bold flat fill + thick outline (cel-shading)
    if (landFeature) {
      ctx.beginPath();
      const geom = landFeature.geometry;
      (geom.type === 'MultiPolygon' ? geom.coordinates : [geom.coordinates])
        .forEach(poly => poly.forEach(drawRing));
      ctx.fillStyle = dark ? '#2d7a42' : '#5ecf72';
      ctx.fill();
      ctx.strokeStyle = dark ? '#163320' : '#1d5c2a';
      ctx.lineWidth = 3.5 * dpr;
      ctx.stroke();
    }

    // Map-pin helper: tip at (px, py), head above
    const drawPin = (px, py, hr, fillColor, ringColor, pulse) => {
      const headY = py - hr * 2.2;
      const alpha = 0.88;

      // Cartoon pulse: expanding stroke ring (no fill, no blur)
      ctx.beginPath();
      ctx.arc(px, headY, hr + pulse * 10 * dpr, 0, Math.PI * 2);
      ctx.strokeStyle = ringColor;
      ctx.lineWidth = 2.5 * dpr;
      ctx.stroke();

      // Pin body
      ctx.beginPath();
      ctx.arc(px, headY, hr, Math.PI / 2 - alpha, Math.PI / 2 + alpha, true);
      ctx.lineTo(px, py);
      ctx.closePath();
      ctx.fillStyle = fillColor;
      ctx.fill();

      // Bold flat outline
      ctx.beginPath();
      ctx.arc(px, headY, hr, Math.PI / 2 - alpha, Math.PI / 2 + alpha, true);
      ctx.lineTo(px, py);
      ctx.closePath();
      ctx.strokeStyle = dark ? 'rgba(0,0,0,0.75)' : 'rgba(0,0,0,0.65)';
      ctx.lineWidth = 3 * dpr;
      ctx.lineJoin = 'round';
      ctx.stroke();

      // Inner white dot
      ctx.beginPath();
      ctx.arc(px, headY, hr * 0.36, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255,255,255,0.9)';
      ctx.fill();
    };

    // Hometown pin — Wuhan
    const wuhan = project(30.59, 114.31);
    const wuhanHR = 9 * dpr;
    wuhanScreen = wuhan.vis ? { sx: wuhan.sx, sy: wuhan.sy - wuhanHR * 2.2 } : null;
    if (wuhan.vis) {
      const p2 = reducedMotionMQ.matches ? 0 : (Math.sin(Date.now() / 600 + 1.5) + 1) / 2;
      drawPin(wuhan.sx, wuhan.sy, wuhanHR, '#f5c400', `rgba(245,196,0,${0.55 - p2 * 0.45})`, p2);

      const distFromCenter = Math.hypot(wuhan.sx - cx, wuhan.sy - cy);
      if (distFromCenter < R * 0.82) {
        ctx.font = `bold ${14 * dpr}px ui-monospace, monospace`;
        ctx.fillStyle = dark ? '#ffe040' : '#6b4700';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        // white knockout behind text for readability
        ctx.strokeStyle = dark ? 'rgba(0,0,0,0.7)' : 'rgba(255,255,255,0.8)';
        ctx.lineWidth = 4 * dpr;
        ctx.lineJoin = 'round';
        ctx.strokeText('Wuhan', wuhan.sx + wuhanHR + 6 * dpr, wuhan.sy - wuhanHR * 2.2);
        ctx.fillText('Wuhan', wuhan.sx + wuhanHR + 6 * dpr, wuhan.sy - wuhanHR * 2.2);
      }
    }

    // Visitor pin
    const visitorHR = 9 * dpr;
    if (visitorLat !== null) {
      const vp = project(visitorLat, visitorLng);
      visitorScreen = vp.vis ? { sx: vp.sx, sy: vp.sy - visitorHR * 2.2 } : null;
      if (vp.vis) {
        const p = reducedMotionMQ.matches ? 0 : (Math.sin(Date.now() / 450) + 1) / 2;
        drawPin(vp.sx, vp.sy, visitorHR, '#ff3a2e', `rgba(255,60,40,${0.55 - p * 0.45})`, p);
      }
    }

    ctx.restore();

    // Globe border — bold flat stroke
    ctx.beginPath();
    ctx.arc(cx, cy, R, 0, Math.PI * 2);
    ctx.strokeStyle = dark ? '#000' : '#0a1a3a';
    ctx.lineWidth = 4.5 * dpr;
    ctx.stroke();

    if (!reducedMotionMQ.matches && !paused) {
      rot += 0.008;
    }
    if (visible) requestAnimationFrame(draw);
  };

  draw();

  // Pause the redraw loop while the globe is scrolled out of view, and
  // resume with a fresh frame when it scrolls back in.
  const visibilityObserver = new IntersectionObserver(([entry]) => {
    const wasVisible = visible;
    visible = entry.isIntersecting;
    if (visible && !wasVisible) requestAnimationFrame(draw);
  }, { threshold: 0.01 });
  visibilityObserver.observe(canvas);

  canvas.addEventListener('mouseenter', () => { paused = true; });
  canvas.addEventListener('mouseleave', () => { paused = false; });

  // Hover tooltips for both pins
  const tooltip = document.getElementById('globe-tooltip');
  if (tooltip) {
    canvas.addEventListener('mousemove', e => {
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      const mx = (e.clientX - rect.left) * scaleX;
      const my = (e.clientY - rect.top) * scaleY;
      const hitR = 14 * dpr;
      const lx = e.clientX - rect.left + 10;
      const ly = e.clientY - rect.top - 28;

      if (wuhanScreen && Math.hypot(mx - wuhanScreen.sx, my - wuhanScreen.sy) < hitR) {
        tooltip.textContent = `🏠 Wuhan, ${countryFlag('CN')}`;
        tooltip.style.left = lx + 'px';
        tooltip.style.top = ly + 'px';
        tooltip.style.opacity = '1';
      } else if (visitorScreen && Math.hypot(mx - visitorScreen.sx, my - visitorScreen.sy) < hitR) {
        const cityText = document.getElementById('globe-city')?.textContent;
        tooltip.textContent = cityText ? `📍 ${cityText}` : '📍 Your location';
        tooltip.style.left = lx + 'px';
        tooltip.style.top = ly + 'px';
        tooltip.style.opacity = '1';
      } else {
        tooltip.style.opacity = '0';
      }
    });
    canvas.addEventListener('mouseleave', () => { tooltip.style.opacity = '0'; });
  }
})();

// Latest list pagination
(function () {
  const list = document.querySelector('.latest-list');
  if (!list) return;

  const items = Array.from(list.children);
  const perPage = 10;
  const pageCount = Math.ceil(items.length / perPage);

  const markEdges = (start, end) => {
    items.forEach((item, i) => {
      item.classList.toggle('is-first-visible', i === start);
      item.classList.toggle('is-last-visible', i === end);
    });
  };

  if (pageCount <= 1) {
    markEdges(0, items.length - 1);
    return;
  }

  const nav = document.createElement('div');
  nav.className = 'latest-pagination';
  nav.innerHTML =
    '<button type="button" class="latest-page-btn" data-dir="-1" aria-label="Previous page">&lsaquo;</button>' +
    '<span class="latest-page-indicator" aria-live="polite"></span>' +
    '<button type="button" class="latest-page-btn" data-dir="1" aria-label="Next page">&rsaquo;</button>';
  list.after(nav);

  const indicator = nav.querySelector('.latest-page-indicator');
  const prevBtn = nav.querySelector('[data-dir="-1"]');
  const nextBtn = nav.querySelector('[data-dir="1"]');

  let page = 0;

  const render = () => {
    const start = page * perPage;
    const end = Math.min(start + perPage, items.length) - 1;
    items.forEach((item, i) => {
      item.style.display = (i >= start && i <= end) ? '' : 'none';
    });
    markEdges(start, end);
    indicator.textContent = `${page + 1} / ${pageCount}`;

    const prevDisabled = page === 0;
    const nextDisabled = page === pageCount - 1;
    if (document.activeElement === prevBtn && prevDisabled) nextBtn.focus();
    if (document.activeElement === nextBtn && nextDisabled) prevBtn.focus();
    prevBtn.disabled = prevDisabled;
    nextBtn.disabled = nextDisabled;
  };

  prevBtn.addEventListener('click', () => { if (page > 0) { page--; render(); } });
  nextBtn.addEventListener('click', () => { if (page < pageCount - 1) { page++; render(); } });

  render();
})();

// Scroll-reveal observer
(function () {
  const reveals = document.querySelectorAll('.reveal');
  if (!reveals.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -20px 0px' }
  );

  reveals.forEach(el => observer.observe(el));
})();
