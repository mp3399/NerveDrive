# NerveDrive Repository Governance and Development Rules

## 1. Global Punctuation Guardrail: Zero Em Dashes
The **em dash (`—`) is strictly prohibited** throughout the entire NerveDrive project and any related assets. This is a non-negotiable rule and must be enforced consistently across all files, code comments, documentation, UI copy, commit messages, and PR summaries.

### Absolute Rule
- **Never generate or use the Unicode em dash (`—`) anywhere.**
- Avoid automatically inserting the en dash (`–`) unless it is required for a legitimate numeric range (for example: `7-10 days` should use a standard hyphen).
- When writing, always use one of the following instead:
  - Standard hyphen (`-`)
  - Colon (`:`)
  - Comma (`,`)
  - Parentheses (`()`)
  - Period (`.`)
  - Semicolon (`;`)
  - Rewrite the sentence entirely if needed.

---

## 2. Safe Branching and Development Workflow
No code modifications may be committed directly to `master`. All development must follow this strict branch and PR workflow.

### Workflow Steps
1. **Checkout a Feature Branch:** Always check out a branch from the latest `master` (e.g.: `git checkout -b feature/your-feature-name`).
2. **Implement Changes:** Write clean, modular, and maintainable code inside the feature branch.
3. **Local Testing:** Test functionality, build completeness, and regression impacts.
4. **Compile and Build:** Run production compilation checks locally.
5. **Pull Request Submission:** Create a Pull Request against `master` via GitHub CLI or Web UI.
6. **Human Approval:** Wait for explicit administrator review and approval.
7. **Merge:** Squash and merge the approved PR into `master`.

---

## 3. Mandatory Testing Standards
Before submitting any Pull Request, you must verify the changes against the following tests.

### Functional Testing
Verify that:
- Ingestion flows accept health files correctly.
- Telemetry parsers process data without data loss.
- Core analytics algorithms run properly.
- All visualization charts render smoothly.
- User layouts respond correctly on Mobile, Tablet, and Desktop resolutions.
- Theme switching works seamlessly (Light and Dark modes).

### Regression Testing
Validate that new features do not negatively impact:
- Existing ZIP upload flows.
- The Interactive Body Systems Map rendering.
- AI Prediction Center calculations.
- Local storage or on-device privacy mechanisms.

### Build and Compilation Testing
Run the following build checks:
- Verify there are no TypeScript compiler errors.
- Ensure Vite compilation builds without critical warnings.
- Confirm there are no console errors or warnings in the browser.

---

## 4. Git Identity and Privacy Protection
All commits in this repository must belong exclusively to **mp3399**.

### Strict Constraints
- No work-related GitHub identities (such as `work-account`) or work-related emails may author any commit.
- Before committing, verify git configuration settings locally using `git config user.name` and `git config user.email`.

---

## 5. Logo and Animation Guidelines
The NerveDrive logo represents the neural, cardiovascular, and respiratory pathways. Any branding asset must align with these criteria:

- **Style:** Minimal, premium, and clinical.
- **Animation:** Neural activity should be represented by a subtle heartbeat pulse or synaptic wave animation. The animation must be elegant and non-distracting.
- **SVG Standards:** Animation keys must be self-contained within `<style>` blocks in the SVG code to ensure portability across landing pages, dashboards, and GitHub README files.
