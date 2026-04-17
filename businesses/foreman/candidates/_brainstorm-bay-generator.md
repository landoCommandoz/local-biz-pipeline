# Brainstorm: Bay generator

*Brief: take new charter + state, produce a new bay block in the dashboard that matches the yard aesthetic. Cut onboarding from hours to minutes. $0 cost.*

Divergent list (12 considered):

1. **Plop.js** — file generator with handlebars templates. MIT. Node-native. Tiny.
2. **Hygen** — fast code scaffolder with markdown-driven templates. MIT.
3. **Yeoman** — legacy scaffolder. BSD-2. Heavier than modern options.
4. **sao** — Egoist's scaffolder. MIT. Less maintained.
5. **degit** — clone-and-strip scaffolder. MIT. Not a template engine.
6. **cookiecutter** — Python-based templating. BSD. Wrong ecosystem.
7. **handlebars** — just the template engine, pair with a tiny runner script. MIT.
8. **eta** — lightweight template engine, faster than EJS. MIT.
9. **ejs** — old-school template engine. Apache-2.0.
10. **Hand-rolled generator script** — reads charter.md + state.json, emits a `<div class="bay">` block with bespoke CSS slotting, using template literals. No deps.
11. **Nunjucks** — Jinja-like for JS. BSD-2. Heavier than eta.
12. **Mustache.js** — logic-less templating. MIT. Works but Handlebars is the common evolution.

Shortlist (top 3 for full dossier):
- **Plop.js** — purpose-built for generators, prompts + handlebars, CLI-ready, small footprint
- **Hygen** — markdown front-matter driven, very fast to author new generators, active
- **Hand-rolled eta-based script** — zero generator framework, just a template engine + fs.writeFile. Maximum control, minimum surface area. Aligned with Brewington ethos.

Dropped:
- Yeoman (legacy, heavy generator ecosystem)
- sao (stale)
- degit (not a template engine)
- cookiecutter (Python)
- raw handlebars (Plop wraps this better)
- ejs (Apache-2.0 fine but eta is strictly smaller/faster)
- Nunjucks (feature-rich but overkill)
- Mustache (logic-less is too restrictive for bay composition)
