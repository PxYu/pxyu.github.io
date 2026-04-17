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
    { hash: '7d1e834', ref: null, msg: 'Ph.D. in CS · UMass Amherst', date: '2021 – 2024' },
    { hash: '4c8a012', ref: null, msg: 'Research Intern · Dataminr', date: '2023' },
    { hash: '9b2f567', ref: null, msg: 'Research Intern · Amazon Alexa', date: '2022' },
    { hash: 'e5a3d91', ref: null, msg: 'M.S. in CS · UMass Amherst', date: '2018 – 2021' },
    { hash: '2f7c845', ref: null, msg: 'Research Intern · Baidu Research', date: '2020' },
    { hash: '8d4e123', ref: null, msg: 'B.Eng. in Software Eng · Wuhan University', date: '2014 – 2018' },
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
        if (i === commits.length - 1 && terminalCursor) {
          terminalCursor.classList.add('visible');
        }
      }, 200 + i * 160);
    });
  };

  const terminalObserver = new IntersectionObserver(
    ([entry]) => { if (entry.isIntersecting) { startAnimation(); terminalObserver.disconnect(); } },
    { threshold: 0.4 }
  );
  terminalObserver.observe(terminalCommits.closest('.panel'));
}
