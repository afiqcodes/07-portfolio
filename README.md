# Afiq — Personal Portfolio

A responsive portfolio about web development, networking, Linux, and containers. Built with HTML5,
CSS3, and vanilla JavaScript, with local SVG illustrations and a paper-origami theme in the original
green palette. There are no package dependencies, frontend frameworks, external fonts, or build
step.

## Preview locally

From the repository root:

```bash
python3 -m http.server 8080 --directory frontend-web
```

Open http://localhost:8080. Press Ctrl+C to stop. Python is an optional preview tool, not an
application dependency.

## Preview with Docker

```bash
docker build -t personal-landing .
docker run --rm -p 8081:80 personal-landing
```

Open http://localhost:8081. Press Ctrl+C to stop. This uses the existing Nginx/Alpine Dockerfile; no
deployment configuration was changed.

## Make it yours

- `frontend-web/profile.js`: public email, GitHub, LinkedIn, résumé path, and project source/demo
  links. Empty values remain hidden. Web links should use full HTTPS URLs. For a résumé, place your
  PDF in `frontend-web` and set `resume` to its filename. Configuration is public; never include
  secrets.
- `frontend-web/index.html`: introduction, about text, skills, project summaries, title, search
  description, social sharing text, and Person structured data.
- `frontend-web/script.js`: expanded project descriptions and interactive behaviour.
- `frontend-web/style.css`: base colours, typography, responsive layouts, and dark/light themes.
- `frontend-web/origami.css`: paper texture, folded corners, sheet shadows, city colours, and
  responsive origami styling. The inline city artwork is in `frontend-web/index.html`.
- `frontend-web/favicon.svg`: browser icon.

Contact information is intentionally unset. The résumé button appears only after a path is supplied;
no résumé or personal details have been invented. Project illustrations are conceptual; add real
screenshots and verified project results when available. For a social preview image, add a raster
image and an `og:image` meta tag using its full hosted URL.

The Projects gallery includes flow (03), TM API Marketplace (04), HugeGraph Portal (05), and Gibble
(06), alongside the existing portfolio, networking, and homelab cards. Descriptions are based on the
local project documentation. Add public source or demo URLs to the matching keys in `profile.js`
when available.

To add another project, duplicate a `project-card` article inside `project-gallery` in `index.html`,
give its button a unique `data-project` key, and add the matching details to the `projects` object
in `script.js`. Use `data-category="web"` or `"systems"` for the existing filters. The total count
updates automatically when JavaScript runs; update the HTML count and initial status text as well
for the initial page. Card artwork lives in `frontend-web/assets/`.

## Source formatting

Source comments identify the main page sections, the matching project keys, and the gallery, theme,
and dialog behavior. HTML attributes and nested content are expanded for easier editing. The
formatting rules live in `.prettierrc.json`; generated output and dependencies are excluded by
`.prettierignore`.

With Node.js and npm available, run these commands from the repository root:

```bash
npx --yes prettier@3.9.10 --write .
npx --yes prettier@3.9.10 --check .
```

The first command formats supported files, including SVG artwork. The second checks formatting
without changing files. Prettier is an optional development tool; previewing and serving the
portfolio still require no npm installation or frontend build.

## Features

- An original SVG origami city, a layered skyline background, folded-paper cards, and a gently
  drifting paper plane. The artwork follows dark/light mode and respects reduced-motion preferences.

- Responsive navigation with keyboard support and an Escape-to-close menu.
- Dark/light theme selection, saved locally when browser storage is available.
- Interactive explanation of the browser, frontend, Nginx, and Docker layers.
- A horizontally scrolling project gallery with responsive card widths, touch swiping, Previous/Next
  controls, and Left/Right/Home/End keyboard navigation when the gallery is focused. Filters reset
  the gallery to its first matching card; navigation controls hide when all matches fit.
- Accessible project filters and native modal project details with keyboard focus management.
- Configurable contact, social, project, and résumé links; email copying on supported secure
  contexts.
- Skip link, visible focus indicators, reduced-motion support, and semantic sections.
- Search and social metadata, structured data, a local favicon, and system fonts.

## Hosting

The existing Dockerfile still serves `frontend-web` directly. No CI/CD, registry, hosting, or
deployment changes have been made. No commit, push, or live deployment is part of this redesign.
Your hosting provider can continue building the same Dockerfile from its configured Git branch when
you choose to publish.
