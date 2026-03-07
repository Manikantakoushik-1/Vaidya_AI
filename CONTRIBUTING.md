# Contributing to VaidyaAI 🩺

Thank you for helping bring AI healthcare to rural India! Every contribution matters.

## Table of Contents
- [Getting Started](#getting-started)
- [Backend Setup](#backend-setup)
- [Frontend Setup](#frontend-setup)
- [Code Standards](#code-standards)
- [Pull Request Guidelines](#pull-request-guidelines)
- [Reporting Issues](#reporting-issues)

---

## Getting Started

1. **Fork** the repository on GitHub
2. **Clone** your fork locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/Vaidya_AI.git
   cd Vaidya_AI
   ```
3. **Add upstream** remote:
   ```bash
   git remote add upstream https://github.com/ORIGINAL_OWNER/Vaidya_AI.git
   ```
4. **Create a branch** for your feature/fix:
   ```bash
   git checkout -b feature/your-feature-name
   ```

---

## Backend Setup

```bash
cd backend

# Create and activate virtual environment
python -m venv .venv
source .venv/bin/activate        # Linux/macOS
# .venv\Scripts\activate         # Windows

# Install dependencies
pip install -r requirements.txt

# Set environment variables
cp .env.example .env
# Edit .env and add your GEMINI_API_KEY

# Run the development server
uvicorn main:app --reload --port 8000
```

The API will be available at `http://localhost:8000`. Swagger docs at `http://localhost:8000/docs`.

---

## Frontend Setup

```bash
cd frontend

# Install dependencies
npm install --legacy-peer-deps

# Set environment variables
cp .env.example .env.local
# Edit .env.local: NEXT_PUBLIC_BACKEND_URL=http://localhost:8000

# Run the development server
npm run dev
```

The app will be available at `http://localhost:3000`.

---

## Code Standards

### Python (Backend)
- Follow **PEP 8** style guide
- Use **type hints** for all function signatures
- Write **docstrings** for public functions and classes
- Run `black` for formatting and `flake8` for linting

### TypeScript/JavaScript (Frontend)
- Use **TypeScript** with strict mode enabled
- Follow **ESLint** rules configured in the project
- Use **Prettier** for code formatting
- Prefer functional components with React hooks

### General
- Keep commits atomic and focused
- Write clear, descriptive commit messages
- Add tests for new functionality where applicable
- Update documentation when changing behavior

---

## Pull Request Guidelines

1. **Sync your fork** before submitting:
   ```bash
   git fetch upstream
   git rebase upstream/main
   ```
2. **Test your changes** thoroughly — both backend and frontend
3. **Describe your PR** clearly:
   - What problem does it solve?
   - How was it tested?
   - Any breaking changes?
4. **Link related issues** using `Closes #issue_number`
5. Keep PRs **focused** — one feature/fix per PR
6. Be responsive to review feedback

### PR Title Format
```
feat: add Telugu voice recognition improvement
fix: correct hospital distance calculation
docs: update API reference for /consultation endpoint
chore: upgrade Next.js to v14
```

---

## Reporting Issues

When reporting bugs, please include:

- **Environment**: OS, Node.js version, Python version, browser
- **Steps to reproduce** the issue
- **Expected behavior** vs **actual behavior**
- **Screenshots or logs** if applicable
- **Browser console errors** for frontend issues

Use the GitHub Issues page and apply appropriate labels:
- `bug` — something is broken
- `enhancement` — new feature request
- `documentation` — docs improvement
- `good first issue` — beginner-friendly tasks
- `help wanted` — contributions welcome

---

## Medical Disclaimer

VaidyaAI is an **AI-assisted health information tool**, not a replacement for professional medical advice. Please ensure any health-related features you contribute include appropriate disclaimers and do not provide definitive diagnoses.

---

Thank you for making healthcare accessible to rural India! 🙏
