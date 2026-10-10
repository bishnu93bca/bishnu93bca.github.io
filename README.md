# Bishnu Ray — Professional Portfolio

Source for **[bishnu93bca.github.io](https://bishnu93bca.github.io/)**: a LinkedIn-inspired personal portfolio for Bishnu Ray, Senior Software Developer (Laravel · Zend · CodeIgniter · CakePHP · SocialEngine · WordPress · JavaScript · Open Source).

## Features

- Animated, multi-colour networking background in the hero (HTML5 Canvas, vanilla JavaScript)
- Light and dark themes, switched automatically by time of day (light 06:00–18:00) or chosen with the header toggle
- Sections: Home, About, Experience & Education, Networking, Skills, Projects, Contact
- Contact form that opens the visitor's email app (no backend needed)
- Responsive on desktop, tablet and phone; respects `prefers-reduced-motion`
- No frameworks or build step: plain HTML, CSS and JavaScript

## Structure

```
index.html              Page markup, SEO metadata and inline SVG icons
404.html                "Page not found" page
assets/css/style.css    All styles (light and dark themes)
assets/js/main.js       Theme toggle, navigation, scroll effects, contact form, network animation
assets/images/          Favicon, profile placeholder, social preview image, project thumbnails
.github/workflows/      GitHub Pages deployment
```

## Editing your details

Search `index.html` for `EDIT:` comments. They mark the placeholders to fill in:

- **Profile photo:** add your photo as `assets/images/profile.jpg` (square, about 800×800) and change the three `assets/images/profile.svg` references in `index.html` to it.
- **Experience:** company name, dates and location; copy the `<li>` to add more roles.
- **Education and certifications.**
- **Project links:** replace the GitHub profile links with each project's repository URL.

## Run locally

```bash
python3 -m http.server 8000
# then open http://localhost:8000
```

## Deployment

Every push to `main` deploys automatically with GitHub Actions (`.github/workflows/static.yml`). In the repository's **Settings → Pages**, **Source** must be set to **GitHub Actions**.

## Contact

- Email: [bishnu99bca@gmail.com](mailto:bishnu99bca@gmail.com)
- LinkedIn: [linkedin.com/in/bishnuray](https://linkedin.com/in/bishnuray)
- GitHub: [@bishnu93bca](https://github.com/bishnu93bca)
