# N7 Web development project

Our project is a file sharing app where you upload and share files with others easily.

## Installation

1. Install pnpm and run:

```bash
pnpm install
```

2. Copy the example env files and configure them as needed.

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

3. Generate the Prisma client:

```bash
pnpm -r db:generate
```

4. Initialize your SQLite database with:

```bash
pnpm -r db:migrate
```

5. Start the app:

```bash
pnpm dev
```
