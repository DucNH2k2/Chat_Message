# 💬 Chat Message App (Fullstack – React + Express)

A real-time chat application including both **client (React)** and **server (Express, Socket.io, MongoDB, Redis)** in a single repository. Requires Node.js 18+ and Docker.

## Requirement

```
node 18+

## Directory Structure

```
- `client/` – React + Vite + TypeScript
  - `src/`
    - `app/`
    - `components/`
    - ...
  - `.env`, `vite.config.ts`, `tsconfig.json`, etc.

- `server/` – Express + MongoDB + Redis + Socket.io
  - `src/`
    - `Controllers/`
    - `Models/`
    - ...
  - `server.ts`, `.env`, `firebase.json`


## ⚙️ Setup & Run the Project

```bash
# Install client dependencies
cd client
npm install
cp .env.template .env
# 👉 Edit .env file with correct values

# Install server dependencies
cd ../server
# → Place your Firebase credentials JSON file in this folder
cp .env.template .env
# 👉 Edit .env file with correct values
docker compose up -d
npm install

# Run the client
cd ../client
npm run dev