import { defineConfig } from "oxfmt";

// Adapted from workleap/wl-app's oxfmt.config.ts.
export default defineConfig({
    // Prose and YAML are left alone: reflowing them is churn. `.claude/` holds vendored skills.
    ignorePatterns: ["**/*.md", "**/*.yml", "**/*.yaml", ".claude/", "agent-skills/", "skills-lock.json"],
    printWidth: 300,
    tabWidth: 4,
    singleQuote: false,
    jsxSingleQuote: false,
    semi: true,
    trailingComma: "none",
    arrowParens: "avoid",
    bracketSpacing: true,
    bracketSameLine: false,
    quoteProps: "as-needed",
    sortPackageJson: {
        sortScripts: false
    }
});
