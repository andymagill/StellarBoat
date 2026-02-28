# Husky & Lint-Staged Configuration

This project uses **Husky** and **lint-staged** to automatically lint and format code changes before commits, ensuring code quality and consistency across the codebase.

## What is Husky?

[Husky](https://github.com/typicode/husky) is a modern Git hook manager that allows you to run scripts before or after Git events (like commits, pushes, etc.). We use it to enforce code quality automatically.

## What is lint-staged?

[lint-staged](https://github.com/okonet/lint-staged) runs linters and formatters only on staged files before they're committed. This is more efficient than running tools on the entire codebase and prevents committing broken code.

## How It Works

### On `npm install`

The `prepare` script in `package.json` automatically runs:

```bash
npx husky
```

This sets up Git hooks from the `.husky/` directory.

### On `git commit`

1. The pre-commit hook in `.husky/pre-commit` runs:
   ```bash
   npx lint-staged
   ```

2. lint-staged applies configured tools to staged files:
   - **ESLint with auto-fix** on TypeScript files (`*.{js,mjs,cjs,ts}`)
   - **Prettier formatting** on all relevant files (`*.{astro,js,mjs,cjs,ts,json,md}`)

3. Fixed files are added back to the staging area automatically
4. If any unfixable issues remain (ESLint errors that can't be auto-fixed), the commit is blocked

### Configuration

The lint-staged configuration is in `package.json`:

```json
"lint-staged": {
  "*.{js,mjs,cjs,ts}": "eslint --fix",
  "*.{astro,js,mjs,cjs,ts,json,md}": "prettier --write"
}
```

The Husky pre-commit hook is in `.husky/pre-commit` and simply calls `npx lint-staged`.

## Common Scenarios

### Commit is blocked due to ESLint errors

If your commit fails, ESLint found errors that it cannot automatically fix. Review the error messages and fix them manually:

```bash
# Fix the errors
npm run lint

# Stage the fixed files
git add .

# Try committing again
git commit -m "your message"
```

### You want to skip the hook

If you absolutely need to bypass the hook (not recommended), use:

```bash
git commit --no-verify -m "your message"
```

### You want to run linting/formatting manually

```bash
# Run ESLint + Prettier (same as pre-commit)
npm run lint && npm run format

# Run only ESLint
npm run lint

# Run only Prettier
npm run format
```

### First-time setup after cloning

If you clone the repository on a new machine:

```bash
npm install
```

This automatically runs the `prepare` script, which initializes Husky hooks. You're all set!

## Troubleshooting

### Husky hook didn't run

- Verify Husky is installed: `npm list husky`
- Check that `.husky/pre-commit` exists and is executable
- On Windows, if using Git Bash: ensure `core.hooksPath` is set correctly:
  ```bash
  git config core.hooksPath .husky
  ```

### Prettier/ESLint formatting conflicts

If you're getting conflicting changes between ESLint and Prettier, check that both are configured similarly. The project uses:
- ESLint configuration in `eslint.config.mjs`
- Prettier configuration in `.prettierrc`

### Pre-commit hook hanging

If the hook seems to hang, check for large files or performance issues:

```bash
# Run lint-staged with debug output
npm install -g lint-staged
lint-staged --debug
```

## See Also

- [ESLint Rules](eslint.config.mjs)
- [Prettier Rules](.prettierrc)
- [Contributing Guidelines](CONTRIBUTING.md)
- [Husky Documentation](https://typicode.github.io/husky/)
- [lint-staged Documentation](https://github.com/okonet/lint-staged)
