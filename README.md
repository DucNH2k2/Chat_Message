# 💬 Chat Message App (Fullstack – React + Express)

A real-time chat application including both **client (React)** and **server (Express, Socket.io, MongoDB, Redis)** in a single repository. Requires Node.js 18+ and Docker.

## Requirement

```
node 18+

## Directory Structure

```
/
├── client/    # React + Vite + TypeScript
│   ├── src/   # Main source code for client
│   │   ├── app/
│   │   ├── components/
│   │   ├── features/
│   │   ├── hooks/
│   │   ├── models/
│   │   ├── services/
│   │   ├── utils/
│   │   ├── main.css
│   │   ├── main.tsx
│   │   └── vite-env.d.ts
│   ├── .env
│   ├── .gitignore
│   ├── package-lock.json
│   ├── package.json
│   ├── tsconfig.json
│   ├── tsconfig.app.json
│   └── vite.config.ts
│
└── server/    # Express + Socket.io + MongoDB + Redis
    ├── src/   # Main source code for server
    │   ├── config/
    │   ├── Controllers/
    │   ├── Middlewares/
    │   ├── Models/
    │   ├── Repositories/
    │   ├── Routes/
    │   ├── Services/
    │   ├── types/
    │   └── app.ts
    ├── .env
    ├── firebase.json   # Firebase credentials configuration
    ├── server.ts       # Main server entry file
    ├── package.json
    ├── tsconfig.json
    ├── .dockerignore
    └── .gitignore



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