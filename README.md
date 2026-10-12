# N7 Web development project

Our project is a file sharing app where you upload and share files with others easily.

## Installation

1. Install pnpm and run:

```bash
pnpm install
```

2. Copy **backend/.env.example** to **backend/.env** and configure it as needed.

```bash
cp backend/.env.example backend/.env
```

3. Initialize your SQLite database with:

```bash
pnpm -r db:migrate
```

3. Start the app:

```bash
pnpm dev
```
