# ⚙️ Flow Backend - Modular Monolith API

The backbone of the Flow ecosystem, built as a scalable **Modular Monolith** using Node.js and Drizzle ORM.

---

## 🏗️ Technical Architecture
Flow's backend is designed for high performance and strict separation of concerns.

<!-- Space for an Architecture Diagram -->
![Architecture Diagram](https://via.placeholder.com/800x400?text=Modular+Monolith+Architecture+Diagram)

- **Modules**: Auth, Users, Workspaces, Docs, Uploads.
- **Data Persistence**: PostgreSQL with **Drizzle ORM** for type-safe queries.
- **Security**: RBAC (Role-Based Access Control) and stateless JWT authentication.
- **Real-time**: Event-driven communication via **Socket.io**.
- **Tasks**: Distributed job processing with **BullMQ** and **Redis**.

---

## 📡 API Reference

### **Authentication** (`/api/v1/auth`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/signup` | Register a new account |
| `POST` | `/login` | Authenticate and receive session tokens |
| `GET` | `/google` | Initiate Google OAuth 2.0 flow |
| `GET` | `/me` | Get currently authenticated user data |
| `POST` | `/logout` | Revoke session and clear cookies |

### **Documents** (`/api/v1/docs`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/` | Create a new document |
| `GET` | `/:id` | Fetch document details & content |
| `PATCH` | `/:id` | Update document title or content |
| `GET` | `/workspace/:id` | List all documents in a workspace |
| `POST` | `/import` | Convert and import external files |
| `GET` | `/:id/versions` | List document snapshots (Version History) |
| `POST` | `/:id/chat` | Send collaborative chat message |

### **Workspaces** (`/api/v1/workspace`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/` | List all user workspaces |
| `POST` | `/` | Create a new workspace |
| `GET` | `/:slug` | Get workspace details by slug |
| `PATCH` | `/:id` | Update workspace settings |
| `GET` | `/:id/members` | List workspace team members |

---

## 🔧 Infrastructure Details

### **Database Schema (Drizzle)**
We use a relational schema optimized for collaboration.
- `users`: Core identity and profile data.
- `workspaces`: Multi-tenant containers for documentation.
- `documents`: Collaborative units with real-time state.
- `versions`: Historical snapshots for data integrity.

### **Real-time Engine**
The real-time engine handles cursor presence, collaborative editing (via Yjs/Tiptap), and instant messaging. Scalability is achieved using a **Redis Adapter**.

---

## 🚀 Environment Setup

Copy `.env.sample` to `.env` and configure:
```env
PORT=5000
DATABASE_URL=postgres://...
JWT_SECRET=your_secret
REDIS_URL=redis://...
R2_ACCESS_KEY=...
R2_SECRET_KEY=...
R2_BUCKET_NAME=...
GOOGLE_CLIENT_ID=...
```

---

## 🛠️ Commands
- `npm run dev`: Start development server (with ts-node-dev)
- `npm run build`: Compile TypeScript to JavaScript
- `npm start`: Run production build
- `npx drizzle-kit push`: Sync schema to database
