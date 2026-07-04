# Contributing to NerveDrive

Welcome! Thank you for your interest in contributing to **NerveDrive**. This document outlines our open source philosophy, coding standards, and how you can get involved.

## Introduction
NerveDrive is designed to provide a premium, private, and cohesive experience for analyzing Apple Health data natively in the browser. Our core goals are:
- **Zero-knowledge Privacy:** Data never leaves the device.
- **Premium Aesthetics:** Beautiful, calm, and performant UI.
- **Scientific Rigor:** Health insights must be backed by accurate correlation math and deep telemetry tracking.

## Local Development

### Prerequisites
- Node.js (v20+)
- npm

### Setup
1. **Clone the repository:**
   ```bash
   git clone https://github.com/mp3399/NerveDrive.git
   cd NerveDrive
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Run the development server:**
   ```bash
   npm run dev
   ```

### Scripts
- `npm run dev` - Starts the Vite dev server.
- `npm run build` - Builds for production.
- `npm run lint` - Lints code with ESLint.
- `npm run typecheck` - Validates TypeScript definitions.
- `npm run test` - Runs Vitest suites.

## Coding Standards
We treat NerveDrive as a flagship product. Please adhere to the following guidelines:
- **Clean Architecture:** Keep components modular and single-responsibility.
- **Type Safety:** Strict TypeScript must be used. Avoid `any`.
- **Styling:** Use Tailwind CSS utility classes. Maintain the design system defined in `theme.ts` and `index.css`.
- **Aesthetics First:** We default to **Light Mode**. Ensure your contributions look flawless in both Light and Dark themes.
- **Performance:** For heavy data operations, utilize the Web Worker (`parser.worker.ts`) to avoid main-thread blocking.
- **Comments:** Comment only when necessary to explain *why* something is done, not *what* is done.

## Pull Request Guidelines
1. **Branching:** Create feature branches off `master` (e.g., `feature/new-health-metric` or `bugfix/chart-rendering`).
2. **Commit Messages:** Keep commits focused, atomized, and write meaningful messages.
3. **CI Checks:** Ensure your branch passes all GitHub Action checks (linting, typechecking, build).
4. **Approval:** Pull Requests require at least 1 approval before they can be merged. Direct pushes to `master` are blocked.
5. **Documentation:** If you add a feature, update the `README.md` and inline comments where necessary.

## Issue Reporting
If you spot a bug or have a feature idea, please use the GitHub Issues tab.
- **Bug Reports:** Include steps to reproduce, browser version, and console logs.
- **Feature Requests:** Outline the use-case and why it benefits the wider NerveDrive community.
- **UI Improvements:** Please attach screenshots or mockups of your proposed changes!

## Code of Conduct
We are building a welcoming community. Please:
- Practice respectful and constructive communication.
- Focus on evidence-based health and engineering discussions.
- Be inclusive and collaborative. 

## Community Contact
If you'd like to discuss the architecture, collaborate on health analytics research, or pitch major ideas, I'd love to chat!

Please reach out to me via X (Twitter):
**[https://x.com/_mp3399](https://x.com/_mp3399)**
