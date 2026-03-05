# chatMesh

Real-time chat application built with Node.js, Next.js, Socket.IO and Redis Pub/Sub.

## Stack

- Monorepo: Turborepo with Yarn workspaces
- Backend:  Node.js, Express, Socket.IO v4
- Broker:   Redis Pub/Sub via ioredis
- Uploads:  Multer with disk storage
- Frontend: Next.js 14, React 18, Tailwind CSS

## Getting started

```bash
yarn install
cp apps/server/.env.example apps/server/.env
cp apps/web/.env.example    apps/web/.env
yarn dev
```

Set REDIS_URL in apps/server/.env before starting the server.
