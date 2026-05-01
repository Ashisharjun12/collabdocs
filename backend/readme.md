#  CollabDocs Backend - Modular Monolith API

The core of the CollabDocs ecosystem, built as a high-performance **Modular Monolith** using Node.js, Express, and Drizzle ORM. This backend handles everything from identity management to complex real-time document synchronization.

---

## Technical Architecture

CollabDocs utilizes a hybrid backend strategy to ensure maximum responsiveness and scalability:

### **Database Schema**
![CollabDocs Database Schema](https://ik.imagekit.io/aevhlnk0h/supabase-schema-ujxiwzjzmryxdxeymzvf%20(2).png)

- **API Server (Port 5000)**: Handles high-level business logic, CRUD operations, authentication, and background task orchestration.
- **Collaboration Server (Port 3001)**: A standalone **Hocuspocus (Yjs)** server dedicated solely to high-intensity real-time document synchronization and awareness.
- **Modular Monolith Design**: Strictly separated domains (Auth, Users, Workspaces, Docs, Uploads) allowing for clear boundaries and easy maintenance.
- **Distributed Processing**: Integrated with **Redis** for rate limiting, session management, and **BullMQ** for async background tasks (like document conversion).

---

##  API Reference (`/api/v1`)

### **1. Authentication** (`/auth`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/signup` | Register a new account |
| `POST` | `/login` | Authenticate and receive session tokens |
| `GET` | `/verify` | Verify email address |
| `POST` | `/forgot-password` | Initiate password recovery |
| `POST` | `/reset-password` | Set new password with token |
| `GET` | `/google` | Initiate Google OAuth 2.0 flow |
| `GET` | `/me` | Get currently authenticated user data |
| `GET` | `/sessions` | List all active login sessions |
| `DELETE` | `/sessions/:id` | Revoke a specific session (Remote Logout) |
| `POST` | `/logout` | Revoke current session and clear cookies |

### **2. Workspaces** (`/workspace`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/` | List all user workspaces |
| `POST` | `/` | Create a new workspace |
| `GET` | `/:id` | Get detailed workspace info |
| `PATCH` | `/:id` | Update settings (Owner/Admin only) |
| `DELETE` | `/:id` | Permanent deletion (Owner only) |
| `POST` | `/:id/invite` | Send email invite to new member |
| `POST` | `/accept-invite/:token`| Join workspace via email link |
| `PATCH` | `/:id/members/:userId`| Change member role (Admin/Owner only) |
| `DELETE` | `/:id/members/:userId`| Remove member from workspace |

### **3. Documents** (`/docs`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/` | Create a new document in a workspace |
| `GET` | `/workspace/:id` | List all docs in a workspace |
| `GET` | `/:id` | Fetch full document & metadata |
| `PATCH` | `/:id` | Update title, content, or visibility |
| `DELETE` | `/:id` | Move document to trash |
| `POST` | `/import` | Import .docx/.pdf via Converter Service |
| `GET` | `/:id/versions` | List all saved history snapshots |
| `POST` | `/:id/versions` | Manually save a new named version |
| `POST` | `/:id/favorite` | Toggle starred status |
| `GET` | `/favorites/:wsId` | List all starred docs in workspace |

### **4. Storage & Media** (`/upload`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/presigned-url` | Get Cloudflare R2 secure upload URL |
| `POST` | `/complete` | Finalize file metadata in database |
| `POST` | `/multipart/initiate` | Start a high-volume multipart upload |
| `DELETE` | `/file/:key` | Remove asset from R2 and database |
| `GET` | `/files` | List all user-uploaded assets |

---

## Infrastructure & Tech Stack

- **Framework**: Express.js with TypeScript
- **Database**: PostgreSQL
- **ORM**: Drizzle ORM (Type-safe migrations & queries)
- **Real-time**: Hocuspocus (Yjs) + Socket.io (Presence/Chat)
- **Cache & Queue**: Redis + BullMQ
- **Storage**: Cloudflare R2 (S3 Compatible)
- **Emails**: Resend API
- **Monitoring**: Pino Logger

---

## 🚀 Getting Started

1. **Install Dependencies**:
   ```bash
   pnpm install
   ```

2. **Environment Configuration**:
   Create a `.env` file based on `.env.example`.

3. **Database Setup**:
   ```bash
   # Push schema changes to DB
   npx drizzle-kit push
   ```

4. **Run Servers**:
   ```bash
   # Start API and Collaboration Server in development
   pnpm run dev
   ```

---

##  Scalability & Reliability

- **Circuit Breaker**: Protected external service calls (Resend/R2/converter-service) via Opossum.
- **Rate Limiting**: Distributed rate limiting per IP/Token using Redis.
- **Health Checks**: Integrated health endpoints for Docker orchestration.
- **Graceful Shutdown**: Handles SIGTERM/SIGINT to safely close DB and Redis connections.
