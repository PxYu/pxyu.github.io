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
      themeToggleLabel.textContent = isDark ? 'Dark' : 'Light';
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

const sections = [...document.querySelectorAll('main section[id]')];
const navLinks = [...document.querySelectorAll('.section-nav a')];

if (sections.length && navLinks.length) {
  const linkById = new Map(
    navLinks.map((link) => [link.getAttribute('href')?.slice(1), link])
  );

  const setActiveLink = (id) => {
    navLinks.forEach((link) => {
      const isActive = link.getAttribute('href') === `#${id}`;
      link.classList.toggle('active', isActive);
    });
  };

  const observer = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((first, second) => second.intersectionRatio - first.intersectionRatio)[0];

      if (visible) {
        setActiveLink(visible.target.id);
      }
    },
    {
      rootMargin: '-20% 0px -55% 0px',
      threshold: [0.2, 0.4, 0.6],
    }
  );

  sections.forEach((section) => observer.observe(section));

  navLinks.forEach((link) => {
    link.addEventListener('click', () => {
      const id = link.getAttribute('href')?.slice(1);
      if (id && linkById.has(id)) {
        setActiveLink(id);
      }
    });
  });
}

const terminalCommits = document.getElementById('terminal-commits');
const terminalCursor = document.getElementById('terminal-cursor');

if (terminalCommits) {
  const commits = [
    { hash: 'a3f9c2b', ref: '(HEAD → main)', msg: 'SWE @ Snowflake Inc.', date: '2024 – now' },
    { hash: '7d1e834', ref: null, msg: 'Ph.D. in CS @ UMass Amherst', date: '2021 – 2024' },
    { hash: '4c8a012', ref: null, msg: 'Research Intern @ Dataminr', date: '2023' },
    { hash: '9b2f567', ref: null, msg: 'Research Intern @ Amazon Alexa', date: '2022' },
    { hash: 'e5a3d91', ref: null, msg: 'M.S. in CS @ UMass Amherst', date: '2018 – 2021' },
    { hash: '2f7c845', ref: null, msg: 'Research Intern @ Baidu Research', date: '2020' },
    { hash: '8d4e123', ref: null, msg: 'B.Eng. in Software Eng @ Wuhan University', date: '2014 – 2018' },
  ];

  const makeLine = ({ hash, ref, msg, date }) => {
    const line = document.createElement('div');
    line.className = 'tc-line';
    line.innerHTML =
      `<span class="tc-left">` +
        `<span class="tc-star">*</span>` +
        ` <span class="tc-hash">${hash}</span>` +
        (ref ? ` <span class="tc-ref">${ref}</span>` : '') +
        ` <span class="tc-msg">${msg}</span>` +
      `</span>` +
      `<span class="tc-date">${date}</span>`;
    return line;
  };

  let started = false;
  const startAnimation = () => {
    if (started) return;
    started = true;
    commits.forEach((commit, i) => {
      setTimeout(() => {
        terminalCommits.appendChild(makeLine(commit));
        if (i === commits.length - 1) {
          if (terminalCursor) terminalCursor.classList.add('visible');
          setTimeout(setupInteractiveTerminal, 700);
        }
      }, 200 + i * 160);
    });
  };

  const terminalObserver = new IntersectionObserver(
    ([entry]) => { if (entry.isIntersecting) { startAnimation(); terminalObserver.disconnect(); } },
    { threshold: 0.1 }
  );
  terminalObserver.observe(terminalCommits.closest('.panel'));
}

function setupInteractiveTerminal() {
  if (!terminalCommits) return;
  const terminalBody = terminalCommits.closest('.terminal-body');
  if (!terminalBody) return;

  if (terminalCursor) terminalCursor.style.display = 'none';

  const hiddenInput = document.createElement('input');
  hiddenInput.type = 'text';
  hiddenInput.setAttribute('autocomplete', 'off');
  hiddenInput.setAttribute('autocorrect', 'off');
  hiddenInput.setAttribute('spellcheck', 'false');
  hiddenInput.style.cssText = 'position:fixed;opacity:0;pointer-events:none;left:-9999px;top:-9999px;width:1px;height:1px;';
  document.body.appendChild(hiddenInput);

  let currentPromptEl = null;
  let inputMirror = null;
  const history = [];
  let historyIndex = -1;

  const makePrompt = () => {
    const div = document.createElement('div');
    div.className = 'tc-interactive-prompt';
    div.innerHTML = '<span class="tc-prompt">~</span>&nbsp;<span class="tc-input-mirror"></span><span class="terminal-cursor visible">█</span>';
    terminalCommits.appendChild(div);
    currentPromptEl = div;
    inputMirror = div.querySelector('.tc-input-mirror');
  };

  const appendLine = (html, cls = 'tc-output-line') => {
    const div = document.createElement('div');
    div.className = cls;
    div.innerHTML = html;
    terminalCommits.insertBefore(div, currentPromptEl);
  };

  const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  const commands = {
    help: () => [
      '<span class="tc-hash">available commands:</span>',
      '  <span class="tc-ref">whoami</span>           who is this person',
      '  <span class="tc-ref">ls</span>               list sections',
      '  <span class="tc-ref">cat bio.txt</span>      full bio',
      '  <span class="tc-ref">pwd</span>              print directory',
      '  <span class="tc-ref">open email</span>       contact via email',
      '  <span class="tc-ref">clear</span>            clear terminal',
      '<span class="tc-date">hint: try sudo hire-me</span>',
    ],
    '?': () => commands.help(),
    whoami: () => [
      'guest',
      '<span class="tc-date">（but aren\'t we all just guests on this pale blue dot?）</span>',
    ],
    ls: () => ['<span class="tc-ref">bio/</span>  <span class="tc-ref">papers/</span>  <span class="tc-ref">contact/</span>'],
    'ls -la': () => [
      'total 3',
      'drwxr-xr-x  <span class="tc-ref">bio/</span>',
      'drwxr-xr-x  <span class="tc-ref">papers/</span>',
      'drwxr-xr-x  <span class="tc-ref">contact/</span>',
    ],
    'cat bio.txt': () => [
      'Building AI and search systems at Snowflake Inc.',
      'Ph.D. from Manning CICS, UMass Amherst.',
      'Research @ CIIR, advised by James Allan &amp; Negin Rahimi.',
      'Prev: Dataminr · Amazon Alexa · Baidu Research.',
    ],
    pwd: () => ['/home/pxyu'],
    'open email': () => {
      window.open('mailto:pxyuwhu@gmail.com');
      return ['<span class="tc-msg">opening email client...</span>'];
    },
    'echo $shell': () => ['/bin/zsh'],
    'echo $home': () => ['/home/pxyu'],
    'uname -a': () => ['Linux pxyu.github.io 6.0 #1 SMP x86_64 GNU/Linux'],
    'sudo hire-me': () => [
      '<span style="color:#ff5f56">you are not in the sudoers file.</span>',
      '<span style="color:#ff5f56">This incident will be reported.</span>',
    ],
    'rm -rf /': () => ['<span style="color:#ff5f56">Permission denied. Nice try.</span>'],
    exit: () => ["There is no escape. You're already here."],
    vim: () => [
      '<span class="tc-date">VIM - Vi IMproved 9.1</span>',
      '~',
      '~',
      '<span class="tc-date">To exit: Esc → :q! → Enter</span>',
    ],
    nano: () => ['<span class="tc-date">GNU nano 7.2  [New File]</span>', '^X Exit'],
    'git blame life': () => [
      '<span class="tc-hash">a1b2c3d</span> (Universe 10000000 00:00:00) 1) things happen',
      '<span class="tc-hash">a1b2c3d</span> (Universe 10000000 00:00:00) 2) deal with it',
    ],
    'ping pxyu.github.io': () => [
      'PING pxyu.github.io: 56 data bytes',
      '64 bytes: icmp_seq=0 ttl=60 time=12.4 ms',
      '64 bytes: icmp_seq=1 ttl=60 time=11.8 ms',
      '<span class="tc-msg">2 packets transmitted, 2 received, 0% packet loss</span>',
    ],
    fortune: () => {
      const proverbs = [
        ['千里之行，始于足下。', 'A journey of a thousand miles begins with a single step.'],
        ['活到老，学到老。', 'Live until old, learn until old.'],
        ['失败乃成功之母。', 'Failure is the mother of success.'],
        ['三人行，必有我师焉。', 'Among three people walking, there is always one I can learn from.'],
        ['欲速则不达。', 'More haste, less speed.'],
        ['知己知彼，百战不殆。', 'Know yourself and know your enemy, and you will never be defeated.'],
        ['滴水穿石。', 'Dripping water can pierce through stone.'],
        ['人无远虑，必有近忧。', 'One who does not plan for the future will find trouble at their doorstep.'],
        ['一寸光阴一寸金，寸金难买寸光阴。', 'An inch of time is worth an inch of gold, but gold cannot buy time.'],
        ['鱼和熊掌不可兼得。', 'You cannot have both the fish and the bear\'s paw.'],
        ['学如逆水行舟，不进则退。', 'Learning is like rowing upstream: not to advance is to fall behind.'],
        ['书山有路勤为径，学海无涯苦作舟。', 'The road up the mountain of books is paved with diligence; the sea of learning has no shore but hard work as your boat.'],
        ['众人拾柴火焰高。', 'When everyone gathers firewood, the flames burn high.'],
        ['不入虎穴，焉得虎子。', 'How can you catch tiger cubs without entering the tiger\'s lair?'],
        ['授人以鱼不如授人以渔。', 'Give a man a fish and you feed him for a day; teach him to fish and you feed him for a lifetime.'],
      ];
      const [zh, en] = proverbs[Math.floor(Math.random() * proverbs.length)];
      return [zh, `<span class="tc-date">${en}</span>`];
    },
    'man pxyu': () => [
      '<span class="tc-hash">PXYU(1)                User Commands               PXYU(1)</span>',
      '',
      '<span class="tc-ref">NAME</span>',
      '    pxyu — software engineer and researcher',
      '',
      '<span class="tc-ref">SYNOPSIS</span>',
      '    pxyu [--email] [--scholar] [--linkedin] [--twitter]',
      '',
      '<span class="tc-ref">DESCRIPTION</span>',
      '    Builds AI and search systems at Snowflake. Ph.D. in CS.',
    ],
    clear: () => null,
  };

  const easterEggs = ['whoami', 'sudo hire-me', 'git blame life', 'fortune', 'man pxyu', 'ping pxyu.github.io', 'vim', 'uname -a'];
  for (let i = easterEggs.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [easterEggs[i], easterEggs[j]] = [easterEggs[j], easterEggs[i]];
  }
  const picks = easterEggs.slice(0, 4);
  const hintLine = document.createElement('div');
  hintLine.className = 'tc-output-line tc-hint';
  hintLine.innerHTML = `<span class="tc-date"># try: help · ${picks.join(' · ')}</span>`;
  terminalCommits.appendChild(hintLine);

  makePrompt();

  terminalBody.addEventListener('click', () => hiddenInput.focus());

  document.addEventListener('keydown', (e) => {
    if (e.key !== 'ArrowUp' && e.key !== 'ArrowDown') return;
    if (document.activeElement === hiddenInput) return;
    const rect = terminalBody.getBoundingClientRect();
    if (rect.bottom > 0 && rect.top < window.innerHeight) {
      e.preventDefault();
      hiddenInput.focus();
      hiddenInput.dispatchEvent(new KeyboardEvent('keydown', { key: e.key, bubbles: true }));
    }
  });

  hiddenInput.addEventListener('input', () => {
    if (inputMirror) inputMirror.textContent = hiddenInput.value;
  });

  hiddenInput.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (history.length === 0) return;
      historyIndex = Math.min(historyIndex + 1, history.length - 1);
      hiddenInput.value = history[historyIndex];
      if (inputMirror) inputMirror.textContent = hiddenInput.value;
      return;
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex <= 0) { historyIndex = -1; hiddenInput.value = ''; if (inputMirror) inputMirror.textContent = ''; return; }
      historyIndex--;
      hiddenInput.value = history[historyIndex];
      if (inputMirror) inputMirror.textContent = hiddenInput.value;
      return;
    }
    if (e.key !== 'Enter') return;

    const raw = hiddenInput.value.trim();
    const cmd = raw.toLowerCase();
    hiddenInput.value = '';
    if (inputMirror) inputMirror.textContent = '';

    if (raw !== '') {
      history.unshift(raw);
      historyIndex = -1;
      appendLine(`<span class="tc-prompt">~</span>&nbsp;<span class="tc-msg">${esc(raw)}</span>`, 'tc-output-line tc-echo');
    }

    if (cmd === 'clear') {
      terminalCommits.querySelectorAll('.tc-output-line, .tc-echo').forEach(el => el.remove());
    } else if (cmd !== '') {
      const handler = commands[cmd];
      if (handler) {
        const lines = handler();
        if (lines) lines.forEach(line => appendLine(line));
      } else {
        appendLine(`<span style="color:#ff5f56">zsh: command not found: ${esc(raw)}</span>`);
      }
    }

    terminalBody.scrollTop = terminalBody.scrollHeight;
  });
}

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
    const authors = (anchor.dataset.authors || '')
      .split(',')
      .map(a => a.trim())
      .map(a => a === 'Puxuan Yu' ? `<strong>${a}</strong>` : a)
      .join(', ');
    tip.innerHTML =
      (venue ? `<div class="paper-tooltip-venue">${venue}</div>` : '') +
      (authors ? `<div class="paper-tooltip-authors">${authors}</div>` : '') +
      `<div class="paper-tooltip-abstract">${abstract}</div>`;
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
  const R = S / 2 - 4 * dpr;

  const TILT = 23.5 * Math.PI / 180;

  let visitorLat = 37.77, visitorLng = -122.42;
  let rot = -visitorLng * Math.PI / 180;
  let landFeature = null;
  let wuhanScreen = null;
  let visitorScreen = null;

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

  fetch('https://ip-api.com/json/?fields=lat,lon,city,country')
    .then(r => r.json())
    .then(d => {
      if (!d.lat) return;
      visitorLat = d.lat;
      visitorLng = d.lon;
      rot = -visitorLng * Math.PI / 180;
      const label = document.getElementById('globe-city');
      if (label && d.city) label.textContent = `${d.city}, ${d.country}`;
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
      const p2 = (Math.sin(Date.now() / 600 + 1.5) + 1) / 2;
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
        const p = (Math.sin(Date.now() / 450) + 1) / 2;
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

    // Specular — small glint in upper-left corner only
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, R - 2 * dpr, 0, Math.PI * 2);
    ctx.clip();
    ctx.beginPath();
    ctx.ellipse(cx - R * 0.55, cy - R * 0.55, R * 0.12, R * 0.07, -0.5, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255,255,255,0.45)';
    ctx.fill();
    ctx.restore();

    // Rotation axis — diagonal line showing 23.5° tilt
    // North Pole on screen: (cx - R·sin(TILT), cy - R·cos(TILT))
    const ext = 16 * dpr;
    const nax = cx - (R + ext) * Math.sin(TILT);
    const nay = cy - (R + ext) * Math.cos(TILT);
    const sax = cx + (R + ext) * Math.sin(TILT);
    const say = cy + (R + ext) * Math.cos(TILT);
    const axisColor = dark ? 'rgba(180,210,255,0.85)' : 'rgba(30,60,160,0.75)';

    ctx.save();
    // Line through the globe (dashed inside)
    ctx.strokeStyle = axisColor;
    ctx.lineWidth = 2 * dpr;
    ctx.setLineDash([5 * dpr, 4 * dpr]);
    ctx.beginPath();
    ctx.moveTo(nax, nay);
    ctx.lineTo(sax, say);
    ctx.stroke();
    ctx.setLineDash([]);

    // Pole tip circles
    ctx.fillStyle = axisColor;
    ctx.beginPath();
    ctx.arc(nax, nay, 4 * dpr, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(sax, say, 4 * dpr, 0, Math.PI * 2);
    ctx.fill();

    // N / S labels
    ctx.font = `bold ${11 * dpr}px monospace`;
    ctx.fillStyle = axisColor;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const labelOff = 9 * dpr;
    // nudge labels perpendicular to axis (axis direction: sin(TILT) left, cos(TILT) up)
    ctx.fillText('N', nax - labelOff * Math.cos(TILT), nay + labelOff * Math.sin(TILT));
    ctx.fillText('S', sax + labelOff * Math.cos(TILT), say - labelOff * Math.sin(TILT));
    ctx.restore();

    rot += 0.008;
    requestAnimationFrame(draw);
  };

  draw();

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
        tooltip.textContent = '🏠 Wuhan, China';
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
