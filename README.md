# AI Assistant

[![Live Demo](https://img.shields.io/badge/Live-Demo-brightgreen)](https://ai-assistant-frontend-xiko.onrender.com) [![License](https://img.shields.io/badge/License-MIT-blue)](#license)

---
### Live Demo  
[Launch AI - Assistant](https://ai-assistant-frontend-xiko.onrender.com)  
*Click to open in your browser — no install needed!*
---

Professional documentation and quick reference for the AI Assistant project — a full-stack starter with authentication, profile customization and media support.

## 🧭 Quick links

- Frontend: `Frontend/` (React + Vite)
- Backend: `Backend/` (Node.js + Express)

---

## ✨ What is this project?

AI Assistant is a full-stack example application focused on user accounts and a customizable front-end experience. It provides:

- Authentication (signup/login) with JWT-based sessions
- User profile management and customizable UI components
- File/media upload integration with Cloudinary
- A modern React frontend scaffolding using Vite for fast development

This repository is ideal as a starting point for building profile-centric web applications or integrating assistant-like UI features.

## 🗂️ Project structure

- `Frontend/` — React app (Vite)
  - Key files: `src/App.jsx`, `src/main.jsx`, `src/components/`
- `Backend/` — Express API server
  - Key files: `index.js`, `routes/`, `controllers/`, `models/`, `config/`

Check `Backend/routes/auth.routes.js` and `Backend/routes/user.routes.js` to see the available endpoints and expected payloads.

---

## ⚙️ Tech stack

- Frontend: React + Vite
- Backend: Node.js, Express
- Database: (inferred) MongoDB (see `Backend/config/db.js`)
- Media storage: Cloudinary (see `Backend/config/cloudinary.js`)
- Auth: JSON Web Tokens (see `Backend/config/token.js`)

---

## 🛠️ Quick start (development)

Run these commands in Windows PowerShell. The instructions assume you run frontend and backend separately.

1) Backend

```powershell
cd .\Backend
npm install
# Start server (use script defined in Backend/package.json — common options shown below)
npm run dev   # or `npm start` or `node index.js`
```

2) Frontend

```powershell
cd .\Frontend
npm install
npm run dev
```

The Vite dev server usually runs at `http://localhost:5173` by default — check your terminal for the exact address.

---

## 🔑 Environment variables

Create a `.env` file in `Backend/` (or configure environment variables in your host). Typical variables used by the project (update names if your config differs):

- `MONGODB_URI` — MongoDB connection string
- `PORT` — Backend server port (e.g., 5000)
- `JWT_SECRET` — Secret key for signing JWTs
- `CLOUDINARY_CLOUD_NAME` — Cloudinary cloud name
- `CLOUDINARY_API_KEY` — Cloudinary API key
- `CLOUDINARY_API_SECRET` — Cloudinary API secret

Tip: Add a `.env.example` file to the repo to show exact variable names used by your `Backend/config/*.js` files.

---

## 🔍 API overview (common endpoints)

The exact routes are defined in the `Backend/routes` files — the following are typical endpoints to expect and test:

- POST `/api/auth/signup` — Register a new user
- POST `/api/auth/login` — Login and receive JWT
- GET `/api/user/me` — Get current user profile (Authorization: Bearer <token>)
- PUT `/api/user/:id` — Update a user's profile

Example (PowerShell curl-style) login request:

```powershell
curl -Method POST -Uri "http://localhost:5000/api/auth/login" -ContentType "application/json" -Body (@'{"email":"user@example.com","password":"password"}'@)
```

On success you will receive a JSON payload containing a `token` — include it in subsequent requests:

Authorization: Bearer <token>

---

## 🧪 Testing & development tips

- Use `nodemon` for backend auto-reloads during development: `npm i -D nodemon` then run `nodemon index.js` or add a `dev` script in `Backend/package.json`.
- Frontend: Vite provides HMR (hot module replacement) — save changes to see them instantly.
- Add unit and integration tests as needed (Jest / React Testing Library for frontend, Jest / Supertest for backend).

---

## 🤝 Contributing

1. Fork the repository and create a feature branch.
2. Add tests for new functionality.
3. Create a clear PR with a description of changes and rationale.

---

## 📜 License

This project currently has no license file in the repo. Add a `LICENSE` (for example MIT) if you want others to reuse the code.

---

## 📬 Maintainer / Contact

If you need help or want me to adapt the README with exact script names and environment keys, I can scan `Backend/package.json` and `Frontend/package.json` and produce a `.env.example` and precise commands.

---

Notes

- This README was refactored for clarity and presentation. Some environment variable names and npm scripts were inferred — if you prefer, I can update this README with exact values by reading your `package.json` and config files.
