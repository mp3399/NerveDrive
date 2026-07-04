# Global Writing Guardrail: Zero Em Dashes

From this point forward, the **em dash (`—`) is strictly prohibited** throughout the entire NerveDrive project and any related assets.

This is a non-negotiable rule and must be enforced consistently across all existing content, future content, generated files, documentation, UI copy, marketing material, commit messages, and code comments.

## Absolute Rule
**Never generate or use the Unicode em dash (`—`) anywhere.**

Likewise, avoid automatically inserting the en dash (`–`) unless it is required for a legitimate numeric range (for example, `7-10 days` should use a standard hyphen unless typography specifically requires otherwise).

When writing naturally, always use one of the following instead:
- Standard hyphen (`-`)
- Colon (`:`)
- Comma (`,`)
- Parentheses (`()`)
- Period (`.`)
- Semicolon (`;`)
- Rewrite the sentence entirely if needed.

## Writing Philosophy
The project should read like professionally written American English.
The writing should feel:
- Clean
- Minimal
- Modern
- Premium
- Human

It should never look like AI-generated typography. Avoid punctuation habits commonly associated with LLM-generated text, especially excessive em dash usage.

## Quality Control Checklist
Before generating any content, silently verify:
- No em dashes (`—`) exist.
- No unnecessary en dashes (`–`) exist.
- If any em dash is detected, rewrite the sentence before presenting the output.

**Zero tolerance. Zero exceptions.**

## Safe Branching Rule
**Agents must NEVER commit directly to `master`.**
Before making any code changes, agents must always checkout a new latest branch from `master`.
Example: `git checkout -b feature/your-feature-name`
All changes must be done on this feature branch.
