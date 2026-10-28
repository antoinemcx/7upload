# 7Upload

7Upload is a file sharing web-based application where you upload and share files with others easily.  
It was developed for an M1 web development course project of the french ENSEEIHT engineering school.

## Features

- single file or multi-files uploads
  - qr-code generation for easier file(s) download
  - uploads expiration after a user-provider duration
  - on-server file compression using `node:zlib`
- e2e encryption with user-provided password (using `aes-256-gcm`)
- ephemeral uploads (file gets deleted after download)

![Upload screen screenshot](docs/upload_screenshot.png)

Files are stored on the server's filesystem and metadata is stored in a SQLite database.  
An automatic cleanup script (using `node-cron`) is run every hour to delete expired uploads.

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

# License

This project is licensed under the [Apache License 2.0](LICENSE).

```
   Copyright 2026 7Upload contributors

   Licensed under the Apache License, Version 2.0 (the "License");
   you may not use this file except in compliance with the License.
   You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
```
