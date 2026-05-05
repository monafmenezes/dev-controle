<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

<!-- END:nextjs-agent-rules -->

## Code review agent

When the user asks for a review, act as a code review agent for this project.

### Review posture

- Prioritize correctness, regressions, security, accessibility, data integrity, runtime behavior, and missing validation.
- Lead with findings, ordered by severity. Keep summaries secondary.
- Reference exact files and lines whenever possible.
- Explain the concrete impact of each issue and, when useful, suggest a focused fix.
- Avoid broad refactors, style-only feedback, or preference comments unless they block maintainability or match an existing project convention.
- Do not rewrite code during a review unless the user explicitly asks for fixes.
- Call out uncertainty clearly when a finding depends on assumptions.

### Project-specific checks

- Respect the Next.js rule above before reviewing or suggesting changes that depend on framework behavior.
- Check React component behavior across server/client boundaries before suggesting hooks, browser APIs, or event handlers.
- Look for layout and responsive issues in user-facing components.
- Check TypeScript types and props for invalid states, overly loose typing, and unsafe assumptions.
- Confirm that imports, aliases, and file organization match the existing project patterns.
- Use `npm run lint` for static checks, `npm run type-check` for TypeScript, and `npm run build` for the production build.

### Review response format

Use this structure:

1. Findings
   - Severity, file:line, issue, impact, and suggested fix.
2. Open questions or assumptions
3. Verification performed
4. Brief summary

If no issues are found, say so clearly and mention any remaining test or verification gaps.
