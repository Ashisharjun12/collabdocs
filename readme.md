# 🚀 CollabDocs - The Future of Team Documentation

CollabDocs is a high-performance, real-time collaborative documentation platform that combines the **best of Google Docs' real-time editing** with **Notion's flexible, block-based organization**. Built with a modern modular monolith architecture, it provides a seamless, conflict-free environment for teams to think and write together.

**🌐 Live Demo: [thecollabdocs.tech](https://www.thecollabdocs.tech/)**


---

## Overview
![CollabDocs Hero](https://ik.imagekit.io/aevhlnk0h/Screenshot%202026-05-02%20163728.png)

![Editor Preview](https://ik.imagekit.io/aevhlnk0h/Screenshot%202026-05-02%20164908.png)

![Workspace Preview](https://ik.imagekit.io/aevhlnk0h/Screenshot%202026-05-02%20165029.png)

---

## ✨ Core Highlights
- **Google Docs Sync**: Real-time multi-user editing powered by **Yjs CRDT** (Conflict-free Replicated Data Types) ensuring zero conflicts and sub-20ms sync latency.
- **Notion-like Editor**: A rich, block-based editing experience with support for slash commands, markdown, and embedded media.
- **Scalable Storage**: High-durability file and asset management using **Cloudflare R2** (S3-Compatible Object Storage).
- **Enterprise Grade**: Built with a modular monorepo structure, ensuring strict separation of concerns and high maintainability.

---

## 🚀 Getting Started (Docker Compose)
<p align="left">
  <a href="https://skillicons.dev">
    <img src="https://skillicons.dev/icons?i=docker" height="40" alt="docker logo" />
  </a>
</p>

The fastest way to get CollabDocs running locally is using Docker.

### 1. Prerequisites
Ensure you have the following installed:
- [Docker](https://docs.docker.com/get-docker/)
- [Docker Compose](https://docs.docker.com/compose/install/)

### 2. Configure Environment
Copy the example environment file and fill in your credentials.
```bash
cp .env.example .env
```

### 3. Launch the Platform
```bash
docker compose up --build
```
Once the containers are running:
- **Frontend**: [http://localhost:80](http://localhost:80)
- **Backend API**: [http://localhost:5000](http://localhost:5000)
- **Real-time Sync (Hocuspocus)**: [http://localhost:3001](http://localhost:3001)

---

## External Service Requirements

To fully utilize CollabDocs, you will need to provide your own API keys for the following services (place them in your `.env` file):

| Service | Logo | Purpose | Source |
| :--- | :---: | :--- | :--- |
| **Google OAuth** | <img src="https://skillicons.dev/icons?i=gcp" height="25" /> | User authentication & social login | [Google Cloud Console](https://console.cloud.google.com/) |
| **Cloudflare R2** | <img src="https://skillicons.dev/icons?i=cloudflare" height="25" /> | Image uploads and document storage | [Cloudflare Dashboard](https://dash.cloudflare.com/) |
| **Resend** | <img src="https://cdn.resend.com/brand/resend-icon-white.png" height="25" /> | Welcome emails and invite notifications | [Resend Dashboard](https://resend.com/) |

---


## Architecture & Project Structure

CollabDocs is organized as a modular monorepo, separating the user experience from core business logic and high-intensity processing.

```bash
collabdocs/
├──  frontend/            # React/Vite - Modern UI/UX with Tiptap & Yjs
├──  backend/             # Node.js Modular Monolith
│   ├──  API Server       # Port 5000: Handles Auth, CRUD, and Workspaces
│   └──  Collab Server    # Port 3001: Standalone Hocuspocus (Yjs Sync)
├──  converter-service/   # Python - High-performance document conversion engine
└──  .gitignore           # Global monorepo ignore rules
```

---

##  Technology Stack

### **Frontend**
- **Framework**: React 19 (Vite)
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Editor Engine**: Tiptap (Prosemirror)
- **Collaboration**: Yjs & Hocuspocus

### **Backend**
- **Runtime**: Node.js (Express)
- **Database**: PostgreSQL (Managed persistence)
- **ORM**: Drizzle ORM (Type-safe SQL queries)
- **Authentication**: Passport.js (JWT & Google OAuth 2.0)
- **Task Orchestration**: BullMQ (Distributed job processing)
- **Caching & State**: Redis (Pub/Sub & Session management)
- **Real-time**: Socket.io Server (Redis-backed horizontal scaling)

### **Infrastructure & Storage**
- **Object Storage**: Cloudflare R2 (Highly available asset storage)
- **Sync Engine**: Yjs CRDT (Distributed document state)
- **Document Conversion**: Python (Dedicated high-perf engine)

---

   npm install
   # Configure .env based on .env.sample
   npm run dev
   ```

3. **Setup Frontend**:
   ```bash
   cd ../frontend
   npm install
   npm run dev
   ```

4. **Setup Converter Service**:
   ```bash
   cd ../converter-service
   # Setup python virtual environment
   python -m venv venv
   source venv/bin/activate # or venv\Scripts\activate on Windows
   pip install -r requirements.txt
   python main.py
   ```

---

##  Scalability Features
- **Stateless Architecture**: Horizontal scaling ready.
- **Queue-based Processing**: Long-running tasks handled by BullMQ.
- **Distributed Real-time**: Redis adapter for multi-node Socket.io.
- **Infinite Storage**: Using Cloudflare R2 for assets.

---

##  License
[MIT License](LICENSE)