# N7 Web development project

Our project is a file sharing app where you upload and share files with others easily.

## Features

- e2e encryption with user-provided password (optional, using `aes-256-gcm`)
- ephemeral uploads (optional, file gets deleted after download)
- uploads expiration after a user-provider duration
- on-server file compression using `node:zlib`
- multi-files uploads
- qr-code generation for easier code sharing

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
