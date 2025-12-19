# Moodlyst

Moodlyst is a compassionate wellbeing companion that helps people log their moods, stay consistent, explore live city mood data, and discover events that match how they feel. It blends Firebase persistence, Google Gemini insights, and location-aware discovery into a single experience.

## Tech stack
- **Framework:** React 19 + Vite for a fast, modular SPA shell.
- **Styling:** PostCSS + Tailwind (via @tailwindcss/vite) with custom gradients, animations, and the Poppins font.
- **State & Routing:** React hooks paired with React Router v7 to split public landing pages from protected dashboards.
- **Integrations:** Firebase Auth & Firestore, Google Gemini (via @google/generative-ai), Ticketmaster, OpenStreetMap tiles, Framer Motion, Leaflet (React-Leaflet), and react-icons.

## Experiences & pages
1. **Home / Marketing:** Hero, dual-value sections, features, and mood education components that explain what Moodlyst stands for and drive people toward logging in.
2. **Dashboard:** Tracks morning/evening/anytime check-ins, enforces a 5-log-per-day cap, shows streaks, the latest mood, timeline, and location status. Users can open the `MoodLogModal`, refresh moods, and generate AI insights powered by Gemini.
3. **Map:** Fullscreen Leaflet map that listens to the `cityMoods` Firestore collection, displays mood clusters with color-coded markers, and centers on the user when geolocation is allowed.
4. **Events:** Ticketmaster-powered discovery with search, category/date/distance filters, mood-aware sorting, an event detail modal, and graceful fallbacks to curated demo events when the API key or user location is missing.
5. **Authentication flow:** Firebase Auth guards `/dashboard`, `/map`, and `/events`. Unauthenticated visitors are redirected to `/login`, and authenticated users see profile dropdowns and logout controls.

## Services summary
| Service | Role |
| --- | --- |
| `aiService.js` | Formats the last five mood logs, sends them to Google Gemini (`gemini-2.5-flash`), and returns a structured JSON insight payload. Future providers (Bedrock/OpenAI) can be plugged in via the `AI_PROVIDER` switch. |
| `eventsService.js` | Queries Ticketmaster’s Discovery API with location/radius/category parameters, exposes mood-based recommendations, and ships demo data for environments without a key. |
| `moodService.js` | Handles mood log persistence, streak calculations, today’s check-ins, timeline feeds, city aggregates, event aggregates, and helper queries for the map listener. It also reverse-geocodes coordinates using BigDataCloud to enrich location metadata. |

## Getting started
1. Install dependencies: `yarn install` (or `npm install`).
2. Add a `.env` file (kept out of Git) with the required env vars described below.
3. Run `yarn dev` (`npm run dev`) and open `http://localhost:5174` to explore the experience.
4. Build for production with `yarn build` (`npm run build`) and test previews via `yarn preview`.

## Required environment variables
| Name | Purpose |
| --- | --- |
| `VITE_TICKETMASTER_API_KEY` | Enables the Ticketmaster-powered event discovery experience on `/events`. If it’s missing, the app falls back to demo events. |
| `VITE_GEMINI_API_KEY` | Powers the AI insights flow on the dashboard by allowing `aiService.js` to call Google Gemini. |

## Deployment & workflow
- The repository links to Netlify so every push builds with Vite and deploys automatically. Keep the environment variables above configured under **Site settings → Build & deploy → Environment** so the live site can access Ticketmaster and Gemini.
- When you rotate any secret, update it in Netlify and trigger a deploy either by pushing a commit (even an empty one) or hitting “Trigger deploy” in the dashboard. Deploys typically finish within 1–3 minutes.

## Quality & tooling
- ESLint with `@eslint/js`, React plugins, and `eslint-plugin-react-refresh` keeps modern syntax in check; run `yarn lint` (`npm run lint`).
- Tailwind’s utility classes are bundled via `@tailwindcss/postcss` + `@tailwindcss/vite`.
- There are no automated tests yet—manual QA and linting are the current guardrails.

## What’s next
- Expand AI providers (Bedrock/OpenAI) through `aiService.js`’s provider switch.
- Add onboarding or reminder flows inside the dashboard to nudge streaks.
