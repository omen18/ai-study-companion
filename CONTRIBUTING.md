# Contributing

Thanks for your interest in contributing! 🎉

## Development setup

```bash
git clone https://github.com/<you>/ai-study-companion.git
cd ai-study-companion
make install   # installs backend + frontend deps
make dev       # runs both dev servers
```

## Guidelines

- Keep PRs focused — one logical change per PR.
- Add a test when you fix a bug or add behavior (`backend/tests/` for backend changes).
- Run `make test` and `make fmt` before pushing.
- Follow the existing code style. If you change the style, explain why in the PR.
- Write clear commit messages (imperative mood — "Add flashcard review" not "Added…").

## Reporting bugs

Open an issue with:

1. What you expected to happen
2. What actually happened
3. Steps to reproduce
4. Your environment (OS, Python version, Node version)

## Feature requests

Open an issue labeled `enhancement` and describe the use case. PRs for new features
are welcome, but please open an issue first so we can discuss direction.

## Code of conduct

Be kind, be constructive, and assume good faith.
