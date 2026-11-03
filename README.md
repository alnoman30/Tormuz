<div align="center">

<img src="https://alnoman30.github.io/Tormuz/assets/images/hero-tormuz-logo.svg" alt="Tormuz Logo" width="320" />

### The Modern Startup Success Partner

A clean, responsive, multi-page website for startups, SaaS companies and digital agencies, built with HTML, Tailwind CSS and Vite.

[![Live Demo](https://img.shields.io/badge/Live%20Demo-alnoman30.github.io%2FTormuz-000000?style=for-the-badge&logo=githubpages&logoColor=white)](https://alnoman30.github.io/Tormuz/)

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat-square&logo=html5&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.x-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-7.x-646CFF?style=flat-square&logo=vite&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat-square&logo=javascript&logoColor=black)
![License](https://img.shields.io/badge/License-ISC-blue?style=flat-square)
![GitHub Pages](https://img.shields.io/badge/Deployed%20on-GitHub%20Pages-222?style=flat-square&logo=github)

</div>

---

## Preview

<div align="center">

[![Tormuz Preview](https://alnoman30.github.io/Tormuz/assets/images/navbar-featured.webp)](https://alnoman30.github.io/Tormuz/)

**[Open the live site](https://alnoman30.github.io/Tormuz/)**

</div>

<table>
  <tr>
    <td><img src="https://alnoman30.github.io/Tormuz/assets/images/banner-slider-1.webp" alt="Banner 1" /></td>
    <td><img src="https://alnoman30.github.io/Tormuz/assets/images/banner-slider-2.webp" alt="Banner 2" /></td>
    <td><img src="https://alnoman30.github.io/Tormuz/assets/images/banner-slider-4.webp" alt="Banner 3" /></td>
  </tr>
  <tr>
    <td><img src="https://alnoman30.github.io/Tormuz/assets/images/service-thumbnail-1.webp" alt="Service thumbnail" /></td>
    <td><img src="https://alnoman30.github.io/Tormuz/assets/images/blog-thumbnail-1.webp" alt="Blog thumbnail" /></td>
    <td><img src="https://alnoman30.github.io/Tormuz/assets/images/service-thumbnail-3.webp" alt="Service thumbnail" /></td>
  </tr>
</table>

---

## Table of Contents

- [About](#about)
- [Features](#features)
- [Pages](#pages)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Available Scripts](#available-scripts)
- [Customization](#customization)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)
- [Credits](#credits)

---

## About

**Tormuz** is a modern business and startup-agency website. It presents a company as a strategic growth partner, with showcase sections for case studies, services, testimonials, FAQs and insights articles, all in a polished, responsive layout.

It is a static site: there is no backend, and every page is plain HTML styled with Tailwind CSS, so it is fast, easy to host and simple to customize.

## Features

- **Responsive design** that adapts across mobile, tablet and desktop.
- **Multi-page structure** with listing and detail pages for projects, services, team and blog.
- **Hero section** with logo branding and a scrolling banner slider.
- **Business case studies** section highlighting featured work.
- **Services showcase** covering Business Strategy, Brand Identity, Growth Consulting and Digital Marketing.
- **Impact statistics** such as client growth and trusted-partner counters.
- **Testimonials slider** with ratings and client profiles.
- **FAQ section** with common questions and answers.
- **Insights / blog preview** cards on the home page.
- **Newsletter subscription** form and social links in the footer.
- **Optimized assets** using WebP images and SVG icons and logos.
- **Tailwind CSS v4 pipeline** with minified production CSS.

## Pages

| Page | File | Description |
| --- | --- | --- |
| Home | `index.html` | Hero, about, case studies, services, stats, testimonials, FAQ, blog preview |
| About | `about.html` | Company story and information |
| Projects | `project.html` | Project / case study listing |
| Project Detail | `project-single.html` | Single case study page |
| Services | `service.html` | Service listing |
| Service Detail | `service-single.html` | Single service page |
| Team | `team.html` | Team members listing |
| Team Member | `team-single.html` | Single team member profile |
| Blog | `blog.html` | Article listing |
| Blog Post | `blog-single.html` | Single article page |
| Contact | `contact.html` | Contact page |

## Tech Stack

- **HTML5** for markup
- **[Tailwind CSS 4](https://tailwindcss.com/)** for styling
- **[PostCSS](https://postcss.org/)** and **[Autoprefixer](https://github.com/postcss/autoprefixer)** for CSS processing
- **[Vite 7](https://vite.dev/)** for the dev server and bundling
- **JavaScript** for sliders and interactions
- **GitHub Pages** for hosting

## Project Structure

```
Tormuz/
├── assets/                  # CSS, JavaScript, images, icons, fonts
│   └── css/
│       ├── tailwind.css     # Tailwind source (input)
│       └── style.css        # Compiled, minified CSS (output)
├── index.html               # Home page
├── about.html
├── project.html
├── project-single.html
├── service.html
├── service-single.html
├── team.html
├── team-single.html
├── blog.html
├── blog-single.html
├── contact.html
├── package.json
├── package-lock.json
└── .gitignore
```

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) 18 or later
- npm (included with Node.js)

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/alnoman30/Tormuz.git

# 2. Move into the project folder
cd Tormuz

# 3. Install dependencies
npm install

# 4. Start the development server
npm start
```

Vite will print a local URL, usually `http://localhost:5173`. Open it in your browser.

> **Tip:** if you edit Tailwind classes while developing, run `npm run watch` in a second terminal so `assets/css/style.css` rebuilds automatically.

## Available Scripts

| Command | What it does |
| --- | --- |
| `npm start` | Starts the Vite development server |
| `npm run watch` | Watches your files and rebuilds `assets/css/style.css` on every change |
| `npm run build` | Compiles and minifies Tailwind CSS into `assets/css/style.css` |
| `npm run dev` | Runs `vite build` to produce a bundled build |

## Customization

1. **Content:** edit the text, headings and links directly in the `.html` files.
2. **Images:** replace files in `assets/images/`, keeping the same file names or updating the `src` paths.
3. **Branding:** swap the logos (`nav-logo.svg`, `hero-tormuz-logo.svg`, `footer-logo.svg`) with your own.
4. **Styles:** edit `assets/css/tailwind.css`, then run `npm run build` to regenerate `style.css`.
5. **Social and contact links:** update the placeholder `#` links in the footer and contact sections.

## Deployment

### GitHub Pages

1. Push your changes to the `main` branch.
2. Go to **Settings → Pages** in your repository.
3. Under **Build and deployment**, choose **Deploy from a branch**.
4. Select the `main` branch and the `/ (root)` folder, then click **Save**.
5. Your site will be live at `https://<your-username>.github.io/Tormuz/`.

Because the site is static, it also deploys easily to **Netlify**, **Vercel**, **Cloudflare Pages** or any static host.

## Contributing

Contributions, issues and feature requests are welcome.

1. Fork the project
2. Create your feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m "Add amazing feature"`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## License

This project is distributed under the **ISC License**, as declared in `package.json`. Please also review the licensing terms of the original template listed in the credits below before using it commercially.

## Credits

- Template design: **Widflow**
- HTML / Tailwind conversion and development: **[Noman](https://alnoman.vercel.app/)**
- Built with [Tailwind CSS](https://tailwindcss.com/) and [Vite](https://vite.dev/)

---

<div align="center">

If you find this project useful, consider giving it a ⭐ on [GitHub](https://github.com/alnoman30/Tormuz).

</div>
