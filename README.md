# Microbial Biology Lab Website

A static academic research website built with [Astro](https://astro.build/) and [Tailwind CSS](https://tailwindcss.com/), designed for deployment to [Cloudflare Pages](https://pages.cloudflare.com/).

The laboratory investigates the genomics, physiology, and evolutionary cell biology of:

- _**Pseudomonas**_ (opportunistic pathogenesis, secondary metabolism, and environmental adaptations)
- _**Escherichia coli**_ (fundamental molecular genetics and stress responses)
- _**Asgard archaea**_ (eukaryogenesis, conserved cell-biological machinery, and evolutionary transitions)

---

## 📁 Project Structure

```text
├── .vscode/                 # Editor configurations and recommended extensions
├── public/                  # Static assets (favicons, lab logos, robots.txt)
│   └── favicon.svg          # Favicon placeholder
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── Nav.astro        # Navigation header placeholder
│   │   └── Footer.astro     # Site footer placeholder
│   ├── content/             # Markdown and data collections (projects, publications, members)
│   │   └── .gitkeep
│   ├── layouts/             # Page layouts
│   │   └── Layout.astro     # Base layout (<head> meta tags, Nav, slot, Footer)
│   ├── pages/               # File-based routing (pages to be developed)
│   │   └── index.astro      # Scaffold landing page
│   └── styles/              # Global styles and Tailwind configuration
│       └── global.css       # Tailwind CSS v4 entrypoint (@import "tailwindcss";)
├── .prettierignore          # Files ignored by Prettier
├── .prettierrc.json         # Prettier formatting config (with Astro & Tailwind plugins)
├── astro.config.mjs         # Astro project configuration with Tailwind Vite plugin
├── eslint.config.js         # ESLint flat config with eslint-plugin-astro
├── package.json             # Project dependencies and npm scripts
├── tsconfig.json            # TypeScript configuration
└── README.md                # Project documentation
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js**: `v22.12.0` or higher (compatible with Node 24)
- **npm**: `v10.0.0` or higher

### Local Setup

1. **Clone the repository and install dependencies:**

   ```bash
   npm install
   ```

2. **Start the local development server:**

   ```bash
   npm run dev
   ```

   The site will be available at `http://localhost:4321/` with Hot Module Replacement (HMR).

3. **Check linting and formatting:**

   ```bash
   # Run ESLint across the project
   npm run lint

   # Format code using Prettier (with Astro and Tailwind plugins)
   npm run format

   # Check formatting without writing
   npm run format:check
   ```

4. **Build for production:**

   ```bash
   npm run build
   ```

   This generates pre-rendered, high-performance static files in the `dist/` directory.

5. **Preview the production build locally:**
   ```bash
   npm run preview
   ```

---

## ☁️ Deployment to Cloudflare Pages

This site is statically generated (`output: 'static'` by default in Astro), making it ideal for Cloudflare Pages with near-instant global edge CDN delivery.

### Option 1: Git Integration (Recommended)

1. Push this repository to **GitHub** or **GitLab**.
2. Log in to the [Cloudflare Dashboard](https://dash.cloudflare.com/) and navigate to **Compute (Workers & Pages)** > **Create application** > **Pages** > **Connect to Git**.
3. Select your repository and configure the build settings:
   - **Project name**: `lab-website` (or your preferred name)
   - **Production branch**: `main`
   - **Framework preset**: `Astro`
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
   - **Root directory**: `/`
4. Under **Environment variables**, set:
   - `NODE_VERSION`: `22` (or `24`)
5. Click **Save and Deploy**. Cloudflare Pages will build and deploy every commit automatically with preview environments for pull requests.

### Option 2: Direct Upload via Wrangler CLI

You can also deploy directly from the command line using Cloudflare's Wrangler tool:

```bash
# 1. Build the production output
npm run build

# 2. Deploy the dist folder to Cloudflare Pages
npx wrangler pages deploy dist --project-name=lab-website
```

---

## 🧬 Development Guidelines

- **Base Layout**: `src/layouts/Layout.astro` manages `<head>` metadata (title, description, responsive viewport, generator tags) and slots your page content between `<Nav />` and `<Footer />`.
- **Styling**: Tailwind CSS v4 is integrated directly via `@tailwindcss/vite` in `astro.config.mjs` and `@import "tailwindcss";` in `src/styles/global.css`. Utility classes are sorted automatically by Prettier.
- **Content Collections**: Place Markdown, MDX, or structured YAML/JSON data files for lab research publications, protocols, and team bios in `src/content/`.
