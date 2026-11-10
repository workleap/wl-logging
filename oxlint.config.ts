import { defineConfig } from "oxlint";

// Adapted from workleap/wl-app's oxlint.config.ts, without its custom wl/* rules and app-specific overrides.
export default defineConfig({
    // `.claude/` holds vendored skills, `agent-skills/` and `docs/` are prose.
    ignorePatterns: [".claude/**", "agent-skills/**", "docs/**"],
    // Setting `plugins` overwrites oxlint's default plugin set (eslint, typescript, unicorn, oxc),
    // so the defaults must be listed explicitly alongside the extras we want enabled.
    plugins: ["eslint", "typescript", "unicorn", "oxc", "react", "import", "jsx-a11y", "promise", "vitest"],
    // Type-aware rules run through oxlint-tsgolint.
    options: { typeAware: true },
    categories: {
        suspicious: "warn",
        perf: "warn"
    },
    rules: {
        "eslint/array-callback-return": "warn",
        "eslint/curly": "warn",
        "eslint/eqeqeq": ["warn", "smart"],
        "eslint/no-caller": "warn",
        "eslint/no-console": "off",
        "eslint/no-eval": "warn",
        "eslint/no-extend-native": "warn",
        "eslint/no-extra-bind": "warn",
        "eslint/no-lone-blocks": "warn",
        "eslint/no-loop-func": "warn",
        "eslint/no-new-wrappers": "warn",
        "eslint/no-param-reassign": "warn",
        "eslint/no-script-url": "warn",
        "eslint/no-self-compare": "warn",
        "eslint/no-sequences": "warn",
        "eslint/no-template-curly-in-string": "warn",
        "eslint/no-throw-literal": "warn",
        "eslint/no-unneeded-ternary": "warn",
        "eslint/no-useless-computed-key": "warn",
        "eslint/no-useless-concat": "warn",
        "eslint/no-useless-constructor": "warn",
        "eslint/no-useless-rename": "warn",
        "eslint/no-var": "warn",
        "eslint/prefer-const": "warn",
        // It replaces a spread by Object.assign which often breaks the behavior since it update the source object rather than cloning.
        "oxc/no-map-spread": "off",
        "import/no-cycle": "warn",
        "import/no-duplicates": "warn",
        "import/no-self-import": "warn",
        "import/no-unassigned-import": "off",
        "react/button-has-type": "warn",
        "react/jsx-key": "warn",
        "react/jsx-no-constructed-context-values": "warn",
        "react/jsx-no-duplicate-props": "warn",
        "react/no-array-index-key": "warn",
        "react/react-in-jsx-scope": "off",
        "react/rules-of-hooks": "warn",
        "react/exhaustive-deps": "warn",
        "typescript/consistent-type-imports": "warn",
        "typescript/no-import-type-side-effects": "error",
        "typescript/no-explicit-any": "warn",
        // Off in @workleap/eslint-configs, which this config replaces: logged values are `unknown` by design.
        "typescript/no-base-to-string": "off",
        "typescript/restrict-template-expressions": "off",
        // Flags every narrowing `as`.
        "typescript/no-unsafe-type-assertion": "off",
        "typescript/return-await": "warn",
        // A `default` branch is a deliberate catch-all; only a switch that can fall through is a finding.
        "typescript/switch-exhaustiveness-check": ["warn", { considerDefaultExhaustiveForUnions: true }],
        "typescript/use-unknown-in-catch-callback-variable": "warn"
    },
    overrides: [
        {
            files: ["*.test.ts", "*.test.tsx"],
            rules: {
                "typescript/no-explicit-any": "off",
                // `expect(spy.method)` reads the method unbound by design.
                "typescript/unbound-method": "off"
            }
        }
    ]
});
