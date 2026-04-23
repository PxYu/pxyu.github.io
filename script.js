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
    whoami: () => ['guest'],
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
      const fallbacks = [
        ['"The best way to predict the future is to invent it."', 'Alan Kay'],
        ['"Programs must be written for people to read, and only incidentally for machines to execute."', 'Harold Abelson'],
        ['"Simplicity is the ultimate sophistication."', 'Leonardo da Vinci'],
        ['"Make it work, make it right, make it fast."', 'Kent Beck'],
        ['"The best time to plant a tree was 20 years ago. The second best time is now."', 'Chinese Proverb'],
        ['"Any fool can write code that a computer can understand. Good programmers write code that humans can understand."', 'Martin Fowler'],
        ['"First, solve the problem. Then, write the code."', 'John Johnson'],
      ];
      const showFallback = () => {
        const [q, a] = fallbacks[Math.floor(Math.random() * fallbacks.length)];
        appendLine(q);
        appendLine(`<span class="tc-date">— ${a}</span>`);
        terminalBody.scrollTop = terminalBody.scrollHeight;
      };
      fetch('https://api.quotable.io/quotes/random')
        .then(r => r.json())
        .then(([d]) => {
          appendLine(`"${d.content}"`);
          appendLine(`<span class="tc-date">— ${d.author}</span>`);
          terminalBody.scrollTop = terminalBody.scrollHeight;
        })
        .catch(showFallback);
      return ['<span class="tc-date">fetching fortune...</span>'];
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
  const picks = easterEggs.sort(() => Math.random() - 0.5).slice(0, 4);
  const hintLine = document.createElement('div');
  hintLine.className = 'tc-output-line tc-hint';
  hintLine.innerHTML = `<span class="tc-date"># try: help · ${picks.join(' · ')}</span>`;
  terminalCommits.appendChild(hintLine);

  makePrompt();

  terminalBody.addEventListener('click', () => hiddenInput.focus());

  hiddenInput.addEventListener('input', () => {
    if (inputMirror) inputMirror.textContent = hiddenInput.value;
  });

  hiddenInput.addEventListener('keydown', (e) => {
    if (e.key !== 'Enter') return;

    const raw = hiddenInput.value.trim();
    const cmd = raw.toLowerCase();
    hiddenInput.value = '';
    if (inputMirror) inputMirror.textContent = '';

    if (raw !== '') {
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
  canvas.width = 160 * dpr;
  canvas.height = 160 * dpr;

  const ctx = canvas.getContext('2d');
  const S = canvas.width;
  const cx = S / 2, cy = S / 2;
  const R = S / 2 - 4 * dpr;

  let visitorLat = 37.77, visitorLng = -122.42;
  let rot = -visitorLng * Math.PI / 180;
  let landFeature = null;

  fetch('./land-110m.json')
    .then(r => r.json())
    .then(world => { landFeature = topojson.feature(world, world.objects.land); })
    .catch(() => {});

  const drawRing = (ring) => {
    let penDown = false;
    ring.forEach(([lng, lat]) => {
      const la = lat * Math.PI / 180;
      const effLng = lng * Math.PI / 180 + rot;
      const x = cx + R * Math.cos(la) * Math.sin(effLng);
      const y = cy - R * Math.sin(la);
      if (Math.cos(effLng) > 0) {
        penDown ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
        penDown = true;
      } else {
        penDown = false;
      }
    });
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

    const ocean = ctx.createRadialGradient(cx - R * 0.35, cy - R * 0.35, 0, cx, cy, R);
    if (dark) {
      ocean.addColorStop(0, '#1c3550');
      ocean.addColorStop(1, '#08141f');
    } else {
      ocean.addColorStop(0, '#c5e2f4');
      ocean.addColorStop(1, '#68aed8');
    }

    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, R, 0, Math.PI * 2);
    ctx.fillStyle = ocean;
    ctx.fill();
    ctx.clip();

    ctx.strokeStyle = dark ? 'rgba(100,170,230,0.13)' : 'rgba(40,90,170,0.1)';
    ctx.lineWidth = 0.8 * dpr;

    for (let l = 0; l < Math.PI * 2; l += Math.PI / 6) {
      const eff = l + rot;
      if (Math.cos(eff) < 0) continue;
      ctx.beginPath();
      for (let a = -Math.PI / 2; a <= Math.PI / 2; a += 0.06) {
        const x = cx + R * Math.cos(a) * Math.sin(eff);
        const y = cy - R * Math.sin(a);
        a === -Math.PI / 2 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.stroke();
    }

    [-Math.PI / 3, -Math.PI / 6, 0, Math.PI / 6, Math.PI / 3].forEach(lat => {
      const yl = cy - R * Math.sin(lat);
      const xl = R * Math.cos(lat);
      ctx.beginPath();
      ctx.moveTo(cx - xl, yl);
      ctx.lineTo(cx + xl, yl);
      ctx.stroke();
    });

    if (landFeature) {
      ctx.beginPath();
      const geom = landFeature.geometry;
      (geom.type === 'MultiPolygon' ? geom.coordinates : [geom.coordinates])
        .forEach(poly => poly.forEach(drawRing));
      ctx.fillStyle = dark ? 'rgba(55,95,62,0.75)' : 'rgba(162,212,148,0.78)';
      ctx.fill();
      ctx.strokeStyle = dark ? 'rgba(88,168,95,0.55)' : 'rgba(72,142,62,0.6)';
      ctx.lineWidth = 0.6 * dpr;
      ctx.stroke();
    }

    if (visitorLat !== null) {
      const la = visitorLat * Math.PI / 180;
      const effLng = visitorLng * Math.PI / 180 + rot;
      if (Math.cos(effLng) > 0) {
        const mx = cx + R * Math.cos(la) * Math.sin(effLng);
        const my = cy - R * Math.sin(la);
        const p = (Math.sin(Date.now() / 500) + 1) / 2;

        ctx.beginPath();
        ctx.arc(mx, my, (5 + p * 4) * dpr, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(232,137,106,${0.18 + p * 0.18})`;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(mx, my, 3.5 * dpr, 0, Math.PI * 2);
        ctx.fillStyle = '#e8896a';
        ctx.fill();
        ctx.strokeStyle = 'rgba(255,255,255,0.65)';
        ctx.lineWidth = dpr;
        ctx.stroke();
      }
    }

    ctx.restore();

    const edge = ctx.createRadialGradient(cx, cy, R * 0.6, cx, cy, R + dpr);
    edge.addColorStop(0, 'transparent');
    edge.addColorStop(1, dark ? 'rgba(0,0,0,0.55)' : 'rgba(5,20,60,0.16)');
    ctx.beginPath();
    ctx.arc(cx, cy, R, 0, Math.PI * 2);
    ctx.fillStyle = edge;
    ctx.fill();

    const spec = ctx.createRadialGradient(cx - R * 0.4, cy - R * 0.4, 0, cx - R * 0.3, cy - R * 0.3, R * 0.55);
    spec.addColorStop(0, 'rgba(255,255,255,0.18)');
    spec.addColorStop(1, 'transparent');
    ctx.beginPath();
    ctx.arc(cx, cy, R, 0, Math.PI * 2);
    ctx.fillStyle = spec;
    ctx.fill();

    rot += 0.003;
    requestAnimationFrame(draw);
  };

  draw();
})();
