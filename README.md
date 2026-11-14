# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

## UTM naming for outreach

Links in cold outreach carry four params. `src/lib/utm.js` reads them from the landing URL, keeps them for the browser session, adds them to the booking link when it is clicked (once `CALENDLY_URL` in `src/designs/content.jsx` is set; the email fallback is left alone), and `getUtm()` supplies them for the contact form payload (`utm` object, which `api/contact.js` prints in the email). Vercel Web Analytics records the full landing URL, so visits are counted by lane.

| Param | Values | Meaning |
| --- | --- | --- |
| `utm_source` | `smartlead`, `contactform`, `linkedin` | the tool or channel that sent it |
| `utm_medium` | `email`, `form`, `dm` | the kind of message |
| `utm_campaign` | `<lane>`, e.g. `local-dentists`, `local-shops` | the audience list, lowercase, hyphenated |
| `utm_content` | optional, e.g. `step1`, `followup` | which message in the sequence |

Example: `https://www.sparktechstudio.com/local?utm_source=smartlead&utm_medium=email&utm_campaign=local-dentists&utm_content=step1`
