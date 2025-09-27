# Chess Roadmap

This repository contains the work-in-progress Chess Roadmap platform. The initial commit establishes the pnpm workspace,
Next.js 15 app scaffold, linting infrastructure, and developer tooling required for the remaining roadmap tasks.

## Pushing the Repository to GitHub

The execution environment used to generate this repository does not have credentials for your personal Git remotes, so the
project has not been pushed upstream. Use your own workstation to publish the code to GitHub:

1. **Create an empty GitHub repository** (for example `github.com/<you>/chess-roadmap`). Do not initialize it with a README
   or other files so the history from this project stays intact.
2. **Add the GitHub remote in your local clone.**
   ```bash
   git remote add origin git@github.com:<you>/chess-roadmap.git
   # or, using HTTPS
   # git remote add origin https://github.com/<you>/chess-roadmap.git
   git remote -v   # confirm the remote URL
   ```
3. **Verify you are on the branch you wish to publish.** This project currently uses the `work` branch.
   ```bash
   git status -sb
   ```
4. **Run the pre-push checks** (optional but recommended to match the Husky hook configuration).
   ```bash
   pnpm test && pnpm e2e && pnpm link:check && pnpm build
   ```
5. **Push the branch to GitHub.**
   ```bash
   git push -u origin work
   ```

After the initial push, subsequent pushes can use `git push` without extra flags. Replace the remote URL or branch name if
you are following a different workflow.
