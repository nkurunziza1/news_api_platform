# News Platform API

## ONLINE LINK FOR TESTING FUNCTIONALITY VIA SWAGGER
https://news-api-platform.onrender.com

RESTful API for a Medium-style news platform. Node.js, TypeScript, Express, MongoDB, Zod, JWT, bcrypt, Cloudinary.

## Setup

```bash
cp .env.example .env
# Edit .env with your MONGODB_URI, JWT_SECRET,
npm install
npm run dev
```


## Scripts

- `npm run dev` – Start with ts-node-dev
- `npm run build` – Compile TypeScript
- `npm start` – Run compiled `dist/index.js`
- `npm test` – Run Jest tests (uses in-memory MongoDB)

## API Base

- Base URL: `http://localhost:3000/api`
- Swagger UI: `http://localhost:3000/api-docs`

## Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | /api/auth/register | No | Register user |
| POST | /api/auth/login | No | Login, returns JWT |
| GET | /api/posts | No | List posts (paginated, filter by status/author) |
| GET | /api/posts/slug/:slug | No | Get published post by slug |
| GET | /api/posts/:id | No | Get post by ID |
| POST | /api/posts | Bearer | Create post (title, description, image optional) |
| PATCH | /api/posts/:id | Bearer | Update own post |
| DELETE | /api/posts/:id | Bearer | Delete own post |
| GET | /api/posts/:id/like | No | Get like status (likesCount, hasLiked when authenticated) |
| POST | /api/posts/:id/like | Bearer | Toggle like (like / unlike) |
| GET | /api/posts/:id/comments | No | List comments (paginated) |
| POST | /api/posts/:id/comments | Bearer | Add comment |
| DELETE | /api/posts/:id/comments/:commentId | Bearer | Delete own comment |

## Structure

```
backend/
├── src/
│   ├── config/       # env, db, logger, cloudinary, swagger
│   ├── controllers/  # auth, post
│   ├── middleware/   # auth, validate, errorHandler, upload
│   ├── models/       # User, Post, Like, Comment (Mongoose)
│   ├── routes/       # auth.routes, post.routes
│   ├── services/     # auth, user, post, upload, like, comment
│   ├── validators/   # Zod schemas (auth, post, comment)
│   ├── __tests__/    # Jest tests
│   ├── app.ts
│   └── index.ts
├── .env.example
├── .gitignore
├── docker-compose.yml
├── Dockerfile
├── jest.config.js
├── package.json
├── tsconfig.json
└── README.md
```

## Env

- `NODE_ENV` – development | test | production
- `PORT` – server port (default 3000)
- `MONGODB_URI` – MongoDB connection string
- `JWT_SECRET` – min 16 chars
- `JWT_EXPIRES_IN` – e.g. 7d
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`

## Docker

All config comes from `.env` (copy from `.env.example` and set `MONGODB_URI`, `JWT_SECRET`, etc.). No need to pass `-e` flags.

**Using docker-compose** (from `backend/`):

```bash
cp .env.example .env
# Edit .env with your Atlas MONGODB_URI, JWT_SECRET, Cloudinary, etc.
docker compose up -d
```

**Using plain docker run** — use `--env-file` so you don't list each variable:

```bash
docker build -t news-platform-api .
docker run -p 3000:3000 --env-file .env news-platform-api
```

API: `http://localhost:3000/api`, Swagger: `http://localhost:3000/api-docs`.
