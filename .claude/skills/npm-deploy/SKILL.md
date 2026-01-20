---
name: npm-deploy
description: Publish the @magnet-ai/magnet-mcp-server package to NPM with version bumping and git tagging. Use when user says "publish to npm", "npm publish", "deploy to npm", "release to npm", "publish package", "bump version and publish", or "release new version".
---

# NPM Deployment Skill

This skill guides users through correctly publishing the `@magnet-ai/magnet-mcp-server` package to NPM, including version management and git operations.

## When to Use This Skill

Use this skill when the user requests:
- Publishing the package to NPM
- Releasing a new version
- Bumping the version and deploying
- Creating a new NPM release

## Instructions

### Step 1: Verify Git Status

Check that the working directory is clean and on the correct branch:

```bash
git status
git branch --show-current
```

**Requirements:**
- Working directory must be clean (no uncommitted changes)
- Should typically be on `main` branch for releases

If there are uncommitted changes, inform the user and ask them to commit or stash changes first.

### Step 2: Sync with Remote

Ensure local branch is up to date:

```bash
git fetch origin
git status
```

If behind remote, pull the latest changes:
```bash
git pull origin main
```

### Step 3: Install Dependencies

Ensure dependencies are current:

```bash
pnpm install
```

### Step 4: Run Build and Validation

Build the TypeScript project and verify:

```bash
pnpm build
```

Run type checking:
```bash
pnpm tsc --noEmit
```

Verify the build output exists:
```bash
ls -la dist/index.js
```

If the build fails, stop and inform the user about the errors.

### Step 5: Security Audit

**Critical:** Before publishing, verify no sensitive data will be leaked in the package.

#### 5a: Preview Package Contents

Run npm pack in dry-run mode to see exactly what will be published:

```bash
npm pack --dry-run 2>&1
```

Review the file list carefully. The output shows all files that will be included in the tarball.

#### 5b: Check for Sensitive Files

Verify these sensitive files are NOT in the pack output:
- `.env` (contains API keys)
- `.mcp.json` (contains API keys)
- `.claude/settings.local.json` (local settings)
- Any `*secret*`, `*credential*`, or `*private*` files

```bash
# This should return nothing or only show .env.sample
npm pack --dry-run 2>&1 | grep -E "\.env|\.mcp\.json|settings\.local|secret|credential|private" || echo "No sensitive files found"
```

If `.env` (without .sample) or `.mcp.json` appears, **STOP** and fix `.gitignore` before proceeding.

#### 5c: Scan for Hardcoded Secrets

Check source files for hardcoded API keys or secrets (UUID pattern commonly used for API keys):

```bash
# Check for UUID-like strings in source files (potential API keys)
grep -rE "[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}" src/ dist/ --include="*.ts" --include="*.js" 2>/dev/null || echo "No hardcoded UUIDs found"

# Check for common secret patterns
grep -riE "(api[_-]?key|secret|password|token|credential)\s*[:=]\s*['\"][^'\"]{8,}['\"]" src/ --include="*.ts" 2>/dev/null || echo "No hardcoded secrets found"
```

If any hardcoded secrets are found, **STOP** and remove them before proceeding.

#### 5d: Verify .gitignore Coverage

Confirm sensitive files are properly excluded:

```bash
# Check .gitignore has necessary entries
grep -E "^\.env|^\.mcp\.json|settings\.local" .gitignore
```

Expected entries:
- `.env*` (with `!.env.sample` exception)
- `.mcp.json`
- `.claude/settings.local.json`

#### 5e: Report Security Audit Results

Display a summary to the user:

```
Security Audit Results:
✓ Package contents reviewed (X files)
✓ No sensitive files in package
✓ No hardcoded secrets in source
✓ .gitignore properly configured

Safe to proceed with publishing.
```

If any check fails, inform the user and **do not proceed** until issues are resolved.

### Step 6: Check Current Version

Read the current version from package.json:

```bash
node -p "require('./package.json').version"
```

Display the current version to the user.

### Step 7: Select Version Bump Type

Use AskUserQuestion to determine the version bump type:

Question: "What type of version bump is this release?"
Options:
- "Patch (x.x.X)" - Bug fixes, documentation updates
- "Minor (x.X.0)" - New features, backwards compatible changes
- "Major (X.0.0)" - Breaking changes

Calculate the new version based on current version and selected bump type.

### Step 8: Update package.json Version

Update the version in package.json:

```bash
npm version <patch|minor|major> --no-git-tag-version
```

Note: We use `--no-git-tag-version` because we'll handle git operations ourselves for more control.

Verify the new version:
```bash
node -p "require('./package.json').version"
```

### Step 9: Commit and Push Version Bump

Commit the version change to git and push to remote **before publishing**. This ensures the working tree is clean for the publish step.

```bash
git add package.json
git commit -m "v{version}"
git push origin main
```

### Step 10: Verify NPM Authentication

Check that the user is logged into NPM:

```bash
npm whoami
```

If not logged in, inform the user:
- "You need to log in to NPM first. Run `npm login` and authenticate."
- They should be logged into an account with publish access to `@magnet-ai` scope

### Step 11: Confirm Before Publishing

Use AskUserQuestion for final confirmation:

Question: "Ready to publish version {new_version} to NPM?"
Options:
- "Yes, publish now" - Proceed with publishing
- "No, abort" - Cancel the release

### Step 12: Publish to NPM

Publish the package:

```bash
pnpm publish --access public
```

The `prepublishOnly` script will automatically run `pnpm build` before publishing.

Verify the publish succeeded by checking the npm registry:
```bash
npm view @magnet-ai/magnet-mcp-server version
```

### Step 13: Create and Push Git Tag

Create a git tag for the release and push it:

```bash
git tag v{version}
git push origin v{version}
```

### Step 14: Display Success Summary

Inform the user of the successful release:

- New version: `{version}`
- NPM package URL: https://www.npmjs.com/package/@magnet-ai/magnet-mcp-server
- Git tag: `v{version}`
- Commit pushed to: `main`

## Error Handling

### Dirty Git Working Directory

If `git status` shows uncommitted changes:
1. Inform the user they have uncommitted changes
2. Suggest: `git stash` to temporarily save changes, or `git commit` to commit them
3. Do not proceed until working directory is clean

### Build Failures

If `pnpm build` fails:
1. Display the error output
2. Common issues:
   - TypeScript errors in source files
   - Missing dependencies (run `pnpm install`)
3. Do not proceed until build succeeds

### Security Audit Failures

If the security audit detects issues:

**Sensitive file in package:**
1. Identify which file is being included (e.g., `.env`, `.mcp.json`)
2. Check if `.gitignore` has the correct entry
3. If using `files` field in package.json, ensure sensitive files aren't listed
4. Re-run `npm pack --dry-run` to verify fix

**Hardcoded secrets found:**
1. Identify the file and line containing the secret
2. Remove the hardcoded value
3. Replace with environment variable reference
4. Commit the fix before proceeding

**Missing .gitignore entries:**
1. Add the missing entries to `.gitignore`:
   ```
   .env*
   !.env.sample
   .mcp.json
   .claude/settings.local.json
   ```
2. Verify with `npm pack --dry-run`

### NPM Not Logged In

If `npm whoami` fails:
1. Inform user they need to authenticate
2. Run `npm login`
3. Ensure they use an account with `@magnet-ai` scope access
4. Verify with `npm whoami` before proceeding

### Publish Fails - 403 Forbidden

If publish returns 403:
1. User may not have publish permissions for `@magnet-ai` scope
2. Check: `npm access ls-collaborators @magnet-ai/magnet-mcp-server`
3. Contact a maintainer (nico-pal, zachcaceres, juliankrispel) for access

### Tag Already Exists

If `git tag` fails because tag exists:
1. Verify the tag: `git tag -l v{version}`
2. If it exists from a failed previous attempt, delete it:
   - Local: `git tag -d v{version}`
   - Remote (if pushed): `git push origin :refs/tags/v{version}`
3. Re-run the tag creation

### Push Rejected

If `git push` is rejected:
1. Someone may have pushed to main since you started
2. Run `git pull --rebase origin main`
3. Resolve any conflicts
4. Re-push

## Examples

### Example 1: Standard Patch Release

User: "Publish the latest bug fixes to npm"

Actions:
1. Verify git status is clean and on main
2. Pull latest changes
3. Run `pnpm build` and type check
4. **Security audit**: run `npm pack --dry-run`, verify no sensitive files, scan for hardcoded secrets
5. Show current version (e.g., 0.2.7)
6. Ask for version type → User selects "Patch"
7. Bump to 0.2.8
8. Commit and push: "v0.2.8"
9. Verify npm login
10. Confirm publishing
11. Run `pnpm publish --access public`
12. Tag v0.2.8 and push tag
13. Display success with NPM URL

### Example 2: Minor Release with New Features

User: "We added new tools, let's release a new version"

Actions:
1. Verify git status and sync with remote
2. Build and validate
3. **Security audit**: verify package contents and scan for secrets
4. Show current version (e.g., 0.2.8)
5. Ask for version type → User selects "Minor"
6. Bump to 0.3.0
7. Commit and push version bump
8. Verify npm login
9. Confirm publishing
10. Publish to npm
11. Tag and push tag
12. Display success

### Example 3: Recovering from Failed Publish

User: "The last publish failed halfway, can you help?"

Actions:
1. Check git status for any partial changes
2. Check if version was bumped: `node -p "require('./package.json').version"`
3. Check if version commit was pushed: `git log origin/main --oneline -1`
4. Check if tag exists: `git tag -l v{version}`
5. Check npm registry: `npm view @magnet-ai/magnet-mcp-server version`
6. Based on state:
   - If version is bumped but not committed: commit and push, then publish, then tag
   - If version is committed but not on npm: publish, then tag and push tag
   - If npm has the version but no tag: just create tag and push it
   - If nothing was done: start fresh

## Notes

- **Commit before publish** - The version bump is committed and pushed before publishing to NPM. This ensures a clean working tree and avoids needing `--no-git-checks`.
- **Security audit is mandatory** - Never skip the security checks. A leaked API key requires rotation and can compromise user data.
- **Always verify build before publishing** - the `prepublishOnly` script runs build automatically, but checking first catches errors early
- **Scoped package** - `@magnet-ai/magnet-mcp-server` requires `--access public` for public visibility
- **Version format** - Uses semantic versioning (MAJOR.MINOR.PATCH)
- **Git tags** - Always prefixed with `v` (e.g., `v0.2.8`)
- **Maintainers** - Current npm maintainers: nico-pal, zachcaceres, juliankrispel
- **No automated CI/CD** - Publishing is manual via this skill
- **Sensitive files to watch** - `.env`, `.mcp.json`, `settings.local.json`, and any files with secrets/credentials/keys
