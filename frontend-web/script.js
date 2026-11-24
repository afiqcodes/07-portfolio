'use strict';

// profile.js loads first; blank configuration keeps optional contact links hidden.
const profile = window.portfolioProfile || {};
const nav = document.querySelector('.nav');
const menuButton = document.querySelector('.menu-button');
const themeButton = document.querySelector('.theme-toggle');
const dialog = document.querySelector('.project-dialog');

// Mobile navigation: keep the visible menu and its accessibility state in sync.
function setMenu(open) {
  nav.classList.toggle('open', open);
  menuButton.setAttribute('aria-expanded', String(open));
  menuButton.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
}

menuButton.addEventListener('click', () =>
  setMenu(menuButton.getAttribute('aria-expanded') !== 'true'),
);
nav.addEventListener('click', (event) => {
  if (event.target.closest('a')) setMenu(false);
});
document.addEventListener('click', (event) => {
  if (!event.target.closest('.site-header')) setMenu(false);
});
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && menuButton.getAttribute('aria-expanded') === 'true') {
    setMenu(false);
    menuButton.focus();
  }
});
window.matchMedia('(min-width: 601px)').addEventListener('change', (event) => {
  if (event.matches) setMenu(false);
});

// Apply a theme to the page, toggle label, and browser toolbar color together.
function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
  const label = `Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`;
  themeButton.setAttribute('aria-label', label);
  themeButton.title = label;
  document.querySelector('meta[name="theme-color"]').content =
    theme === 'dark' ? '#101513' : '#f6f8f4';
}

// Browser storage is optional; the theme toggle also works when storage is blocked.
try {
  const savedTheme = localStorage.getItem('portfolio-theme');
  if (savedTheme === 'dark' || savedTheme === 'light') applyTheme(savedTheme);
} catch {
  /* Theme switching still works when browser storage is unavailable. */
}

themeButton.addEventListener('click', () => {
  const theme = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
  applyTheme(theme);
  try {
    localStorage.setItem('portfolio-theme', theme);
  } catch {
    /* Optional persistence. */
  }
});

document.getElementById('year').textContent = new Date().getFullYear();

// Each key matches both a data-node button and a data-city-layer SVG group.
const nodeDescriptions = {
  browser: 'It starts here. Your browser brings the code to life.',
  web: 'HTML gives it structure. CSS sets the style. JavaScript adds interaction.',
  server: 'Nginx serves the website files when your browser asks for them.',
  container: 'Docker packages the website and Nginx into a portable environment.',
};

document.querySelectorAll('[data-node]').forEach((button) => {
  button.addEventListener('click', () => {
    document.querySelectorAll('[data-node]').forEach((node) => {
      const selected = node === button;
      node.classList.toggle('selected', selected);
      node.setAttribute('aria-pressed', String(selected));
    });
    document.querySelectorAll('[data-city-layer]').forEach((building) => {
      building.classList.toggle('is-active', building.dataset.cityLayer === button.dataset.node);
    });
    document.getElementById('node-description').textContent = nodeDescriptions[button.dataset.node];
  });
});

// Gallery controls share the same scrolling behavior, including both edge arrows.
const projectGallery = document.querySelector('.projects-grid');
const projectCards = Array.from(projectGallery.querySelectorAll('.project-card'));
const projectNavigation = document.querySelector('.project-navigation');
const previousProjectButton = projectNavigation.querySelector('[data-project-scroll="-1"]');
const nextProjectButton = projectNavigation.querySelector('[data-project-scroll="1"]');
const galleryNextButton = document.querySelector('.project-gallery-next');
const galleryPreviousButton = document.querySelector('.project-gallery-previous');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

document.querySelector('[data-project-count]').textContent = projectCards.length;
document.getElementById('filter-status').textContent =
  `Showing all ${projectCards.length} projects.`;

// Allow two pixels of rounding at each end when checking responsive card widths.
function updateProjectNavigation() {
  const maximumScroll = Math.max(0, projectGallery.scrollWidth - projectGallery.clientWidth);
  previousProjectButton.disabled = projectGallery.scrollLeft <= 2;
  nextProjectButton.disabled = projectGallery.scrollLeft >= maximumScroll - 2;
  galleryPreviousButton.disabled = previousProjectButton.disabled;
  galleryPreviousButton.hidden = maximumScroll <= 2;
  galleryNextButton.disabled = nextProjectButton.disabled;
  galleryNextButton.hidden = maximumScroll <= 2;
  projectNavigation.hidden = maximumScroll <= 2;
  projectGallery.tabIndex = maximumScroll > 2 ? 0 : -1;
}

// The distance between visible cards includes the CSS gap and respects filtering.
function scrollProjects(direction) {
  const visibleCards = projectCards.filter((card) => !card.hidden);
  const distance =
    visibleCards.length > 1
      ? visibleCards[1].offsetLeft - visibleCards[0].offsetLeft
      : projectGallery.clientWidth;
  projectGallery.scrollBy({
    left: direction * distance,
    behavior: reducedMotion.matches ? 'instant' : 'smooth',
  });
}

document.querySelectorAll('[data-project-scroll]').forEach((button) => {
  button.addEventListener('click', () => scrollProjects(Number(button.dataset.projectScroll)));
});

projectGallery.addEventListener('scroll', updateProjectNavigation, { passive: true });
projectGallery.addEventListener('keydown', (event) => {
  // Let focused card buttons and links keep their normal keyboard behavior.
  if (event.target !== projectGallery) return;
  if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
    event.preventDefault();
    scrollProjects(event.key === 'ArrowRight' ? 1 : -1);
  } else if (event.key === 'Home' || event.key === 'End') {
    event.preventDefault();
    projectGallery.scrollTo({
      left: event.key === 'Home' ? 0 : projectGallery.scrollWidth,
      behavior: reducedMotion.matches ? 'instant' : 'smooth',
    });
  }
});

// Recalculate control states when the gallery changes size at a breakpoint.
if ('ResizeObserver' in window) {
  const galleryObserver = new ResizeObserver(updateProjectNavigation);
  galleryObserver.observe(projectGallery);
} else {
  window.addEventListener('resize', updateProjectNavigation);
}
updateProjectNavigation();

// Filtering keeps matching cards in one row and returns to the first result.
document.querySelectorAll('[data-filter]').forEach((button) => {
  button.addEventListener('click', () => {
    const filter = button.dataset.filter;
    let visible = 0;
    projectCards.forEach((card) => {
      card.hidden = filter !== 'all' && card.dataset.category !== filter;
      if (!card.hidden) visible++;
    });
    document.querySelectorAll('[data-filter]').forEach((item) => {
      item.classList.toggle('active', item === button);
      item.setAttribute('aria-pressed', String(item === button));
    });
    document.getElementById('filter-status').textContent =
      `Showing ${visible} ${visible === 1 ? 'project' : 'projects'}.`;
    projectGallery.scrollTo({ left: 0, behavior: 'instant' });
    updateProjectNavigation();
  });
});

// Project dialog content. Match these keys to data-project in index.html and
// projects in profile.js; the HTML card contains the shorter gallery summary.
const projects = {
  flow: {
    title: 'flow',
    category: 'FULL-STACK / PERSONAL WORKSPACE',
    paragraphs: [
      'A personal workspace built with Flask, Jinja templates, vanilla JavaScript, and PostgreSQL. It brings a home dashboard, prioritized tasks, searchable notes, project records, and a daily logbook into a shared two-window interface.',
      'Finance features include income and expense tracking, monthly budgets, subscription billing, and payment history. Bookmarks, a calendar with Malaysian public holidays, an API workspace, and local file conversion tools round out the app. Docker Compose runs the application and its persistent PostgreSQL database.',
    ],
    tags: ['Python', 'Flask', 'Jinja', 'PostgreSQL', 'JavaScript', 'Docker Compose'],
    note: 'A personal local-development application. The card artwork illustrates its workspace rather than showing a screenshot.',
  },
  marketplace: {
    title: 'TM API Marketplace',
    category: 'WEB APPLICATION / API SANDBOX',
    paragraphs: [
      'A multi-page API marketplace prototype with a public overview and account-based access to a member dashboard, API catalog, solutions, subscriptions, and contact pages. Express handles authentication and server routes; PostgreSQL stores accounts, sessions, demo subscriptions, and sandbox attempt counts.',
      'Members can browse eight API sandboxes with fictional customer data, request access, and compare demo subscription plans. The frontend is built with Vite and vanilla JavaScript. Plan selection demonstrates the flow without charging money or granting production API access.',
    ],
    tags: ['JavaScript', 'Express', 'PostgreSQL', 'Vite', 'REST APIs'],
    note: 'A marketplace prototype with mock API responses and demo plans. The card artwork is illustrative.',
  },
  hugegraph: {
    title: 'HugeGraph Portal',
    category: 'DATA EXPLORATION / GRAPH DATABASES',
    paragraphs: [
      'A local research portal that connects to Apache HugeGraph through an Express REST adapter. The React interface lists available graphs and uses Cytoscape.js to visualize their vertices, directed edges, labels, and properties.',
      'The workspace supports node search, incoming and outgoing connection browsing, paginated vertex and edge tables, and interactive graph layouts. Live database access and a separate bundled demo mode let the interface distinguish real data from examples. Creating an empty graph is available when the configured server supports and permits it.',
    ],
    tags: ['React', 'Cytoscape.js', 'Apache HugeGraph', 'Express', 'Vite'],
    note: 'A local research tool. Live integration depends on the configured HugeGraph server; the card artwork is illustrative.',
  },
  gibble: {
    title: 'Gibble',
    category: 'SQL WORKSPACE / DATA VISUALIZATION',
    paragraphs: [
      'A local SQL-to-graph portal built with React, Express, and PostgreSQL. A Monaco editor runs SQL against a database workspace, while tables and charts offer different ways to inspect the resulting data.',
      'Cytoscape.js turns rows into vertices and foreign-key relationships into directed edges, including supported junction-table relationships. The interface adds graph search, property inspection, sortable tables with TanStack Table, and ECharts visualizations. Its paper-inspired identity includes an origami dinosaur and forest landing page.',
    ],
    tags: ['React', 'Express', 'PostgreSQL', 'Cytoscape.js', 'Monaco', 'TanStack Table', 'ECharts'],
    note: 'A trusted, single-user local workspace. Graph, table, and chart snapshots sample up to 500 rows per table; the card artwork is illustrative.',
  },
  web: {
    title: 'Docker Web Server',
    category: 'WEB DEVELOPMENT / CONTAINERS',
    paragraphs: [
      'This portfolio brings the frontend and its web server together in a Docker image. HTML, CSS, and JavaScript provide the interface; Nginx serves the static files.',
      'The Dockerfile starts with nginx:alpine and copies the website into the server’s document directory. It is a practical way to explore how a website moves from local files to a hosted environment.',
    ],
    tags: ['HTML5', 'CSS3', 'JavaScript', 'Docker', 'Nginx', 'Alpine Linux'],
    note: 'This is the website you are browsing. Its visual preview is an illustration of the project.',
  },
  network: {
    title: 'Network Simulation',
    category: 'NETWORKING / LEARNING EXPLORATION',
    paragraphs: [
      'An exploration of routing protocols and network performance using ns-3, a network simulator.',
      'The focus is understanding how devices communicate and how network behaviour can be studied through experiments. Project results and supporting materials will be added as they are documented.',
    ],
    tags: ['ns-3', 'Networking', 'Routing protocols'],
    note: 'The topology shown on the card is conceptual. It does not represent measured simulation results.',
  },
  lab: {
    title: 'Home Server Lab',
    category: 'LINUX / LEARNING EXPLORATION',
    paragraphs: [
      'A personal environment for exploring Linux, self-hosting, storage, containers, and infrastructure.',
      'The lab is a space to connect ideas from different parts of computing and learn through practical experiments. Setup notes and documented experiments will be added over time.',
    ],
    tags: ['Linux', 'Containers', 'Storage', 'Self-hosting'],
    note: 'The terminal and server artwork is illustrative. Hardware details and project resources have not been published yet.',
  },
};

// Optional links may be relative or absolute, but must resolve to HTTP or HTTPS.
function webUrl(value) {
  if (typeof value !== 'string' || !value.trim()) return null;
  try {
    const url = new URL(value, window.location.href);
    return ['http:', 'https:'].includes(url.protocol) ? url.href : null;
  } catch {
    return null;
  }
}

// Add new-tab behavior only when a link leaves this website.
function externalLink(label, value, className = 'text-link') {
  const href = webUrl(value);
  if (!href) return null;
  const link = document.createElement('a');
  link.textContent = label;
  link.href = href;
  link.className = className;
  if (new URL(href).origin !== window.location.origin) {
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.setAttribute('aria-label', `${label} (opens in a new tab)`);
  }
  return link;
}

// Reuse one native dialog for every card. Build text nodes rather than HTML
// so project descriptions and tags are always treated as plain text.
document.querySelectorAll('[data-project]').forEach((button) => {
  button.addEventListener('click', () => {
    const key = button.dataset.project;
    const project = projects[key];
    document.getElementById('dialog-title').textContent = project.title;
    document.getElementById('dialog-category').textContent = project.category;
    document.getElementById('dialog-description').replaceChildren(
      ...project.paragraphs.map((text) => {
        const paragraph = document.createElement('p');
        paragraph.textContent = text;
        return paragraph;
      }),
    );
    document.getElementById('dialog-tags').replaceChildren(
      ...project.tags.map((text) => {
        const tag = document.createElement('li');
        tag.textContent = text;
        return tag;
      }),
    );
    const resources = profile.projects?.[key] || {};
    const links = [
      externalLink('View source', resources.source),
      externalLink('Visit project', resources.demo),
    ].filter(Boolean);
    document.getElementById('dialog-links').replaceChildren(...links);
    document.getElementById('dialog-note').textContent = project.note;
    dialog.showModal();
    document.body.classList.add('modal-open');
  });
});
document.querySelector('.dialog-close').addEventListener('click', () => dialog.close());
dialog.addEventListener('close', () => document.body.classList.remove('modal-open'));
// A click outside the dialog's rectangle dismisses its backdrop.
dialog.addEventListener('click', (event) => {
  if (event.target !== dialog) return;
  const bounds = dialog.getBoundingClientRect();
  if (
    event.clientX < bounds.left ||
    event.clientX > bounds.right ||
    event.clientY < bounds.top ||
    event.clientY > bounds.bottom
  )
    dialog.close();
});

// Reveal contact actions only when a valid email is configured. Clipboard access
// is optional; the mail link remains available if copying is unsupported.
const email = typeof profile.email === 'string' ? profile.email.trim() : '';
if (/^[^\s@?&#]+@[^\s@?&#]+\.[^\s@?&#]+$/.test(email)) {
  const emailLink = document.querySelector('.contact-email');
  emailLink.href = `mailto:${encodeURIComponent(email).replace('%40', '@')}`;
  emailLink.hidden = false;
  document.querySelector('.contact-pending').hidden = true;
  const copyButton = document.querySelector('.copy-email');
  if (navigator.clipboard?.writeText) {
    copyButton.hidden = false;
    copyButton.addEventListener('click', async () => {
      const status = document.getElementById('copy-status');
      try {
        await navigator.clipboard.writeText(email);
        status.textContent = 'Email address copied.';
      } catch {
        status.textContent = `Copy this address: ${email}`;
      }
    });
  }
}

// Social profiles and the resume are optional; empty values stay hidden.
const socialLinks = [
  externalLink('GitHub', profile.github),
  externalLink('LinkedIn', profile.linkedin),
].filter(Boolean);
if (socialLinks.length) {
  const socials = document.querySelector('.social-links');
  socials.replaceChildren(...socialLinks);
  socials.hidden = false;
}
const resumeUrl = webUrl(profile.resume);
if (resumeUrl) {
  const resumeLink = document.querySelector('.resume-link');
  resumeLink.href = resumeUrl;
  resumeLink.hidden = false;
}

// Mark the navigation link for the section currently in view, when supported.
if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver(
    (entries) => {
      const current = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (!current) return;
      nav.querySelectorAll('a').forEach((link) => {
        if (link.hash === `#${current.target.id}`) link.setAttribute('aria-current', 'location');
        else link.removeAttribute('aria-current');
      });
    },
    { rootMargin: '-10% 0px -35% 0px', threshold: [0, 0.2, 0.5] },
  );
  document.querySelectorAll('main section[id]').forEach((section) => observer.observe(section));
}
