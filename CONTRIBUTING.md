# Contributing to RoomGrub

First off — **thank you for being here!** Whether you're fixing a typo, reporting a bug, or building a brand-new feature, every contribution matters. RoomGrub is built by people like you, and we're genuinely excited to have you join us.

---

## You Belong Here

No contribution is too small. You don't need to be an expert. If something confused you, it'll confuse others — and your fix will help everyone. We welcome:

- Bug reports and fixes
- New feature ideas and implementations
- UI/UX improvements
- Documentation updates
- Test coverage improvements
- Translations or accessibility enhancements

---

## Getting Started

### Prerequisites

- **Node.js 18+** and npm
- **A running RoomGrub backend.** This app has no database of its own — it needs [RoomGrub-backend](https://github.com/Broccly/RoomGrub-backend). Follow that repo's README to get it running locally (by default on `http://localhost:8000`).

### Setup

1. **Fork** [sambhusankar/RoomGrub](https://github.com/sambhusankar/RoomGrub) on GitHub (the *Fork* button, top right).
2. **Clone your fork** and add the original repo as `upstream` so you can pull in future changes:
   ```bash
   git clone https://github.com/<your-username>/RoomGrub.git
   cd RoomGrub
   git remote add upstream https://github.com/sambhusankar/RoomGrub.git
   ```
3. **Install** dependencies and create your env file:
   ```bash
   npm install
   cp .env.example .env.local   # then fill in the values — see below
   ```
4. **Create a branch** for your work:
   ```bash
   git checkout -b feat/your-feature-name
   ```
5. **Start** the dev server:
   ```bash
   npm run dev
   ```
   Open http://localhost:3001 and sign in with Google.

### Environment variables

| Variable | Required | Description |
|---|---|---|
| `NEXT_PUBLIC_BACKEND_URL` | Yes | Backend base URL, without `/api/v1` (default `http://localhost:8000`) |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | Yes | Google OAuth Web client ID — must match the backend's `GOOGLE_CLIENT_ID` |
| `NEXT_PUBLIC_SITE_URL` | Yes | Public URL of this app (`http://localhost:3001` locally); used for invite links, sitemap, etc. |

### Scripts

```bash
npm run dev            # Dev server on http://localhost:3001
npm run build          # Production build
npm start              # Serve the production build on port 3001
npm run lint           # next lint — ESLint isn't configured yet, so this starts the setup prompt
npm test               # Jest unit/component tests (test/components, test/domain, test/utils)
npm run test:watch     # Jest in watch mode
npm run test:coverage  # Jest with coverage
npm run test:e2e       # Playwright end-to-end tests (test/e2e)
```

**End-to-end tests** don't need the real backend: `playwright.config.js` starts a mock backend (`test/e2e/mock-backend.js`) on port 8000 and a production build of the app on port 3001. Make sure nothing else is using those ports, and install the browser once with `npx playwright install chromium`.

CI (`.github/workflows/ci.yml`) runs `npm test` on every push and on pull requests to `main`.

See the [README](README.md) for the architecture, project structure and key concepts.

---

## Making Changes

- Keep changes focused — one feature or fix per pull request
- Follow the existing code style: mostly JavaScript/JSX (TypeScript used selectively), MUI Joy UI components with Tailwind utilities, Next.js App Router conventions
- If your change needs new data or business rules, that belongs in [RoomGrub-backend](https://github.com/Broccly/RoomGrub-backend) — open the backend change first
- Write clear, descriptive commit messages
- Run `npm test` before submitting (add tests under `test/` where it makes sense)

---

## Submitting a Pull Request

1. Push your branch to your fork
2. Open a Pull Request against the `main` branch
3. Fill in the PR description — what you changed and why
4. A maintainer will review it as soon as possible

Don't worry if you get feedback — it's part of the process, not a rejection. We're here to collaborate, not gatekeep.

---

## Reporting Bugs

Found something broken? Please [open an issue](https://github.com/sambhusankar/RoomGrub/issues) and include:

- What you expected to happen
- What actually happened
- Steps to reproduce it
- Screenshots if relevant

---

## Code of Conduct

Be kind. Be respectful. We're all here to build something useful together. Harassment, discrimination, or hostile behavior of any kind will not be tolerated.

---

## Questions?

Not sure where to start? Open a [GitHub Discussion](https://github.com/sambhusankar/RoomGrub/discussions) or raise an issue — we're happy to help you find your footing.

**Happy contributing! We're glad you're here.** 🙌
