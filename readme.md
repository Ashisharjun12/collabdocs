# 🚀 CollabDocs - The Future of Team Documentation

CollabDocs is a high-performance, real-time collaborative documentation platform that combines the **best of Google Docs' real-time editing** with **Notion's flexible, block-based organization**. Built with a modern modular monolith architecture, it provides a seamless, conflict-free environment for teams to think and write together.

---

## 📸 Overview
<!-- Replace the URL below with your actual screenshot or hero image URL -->
![CollabDocs Preview](https://ik.imagekit.io/aevhlnk0h/Screenshot%202026-04-30%20172201.png)

---

## ✨ Core Highlights
- **Google Docs Sync**: Real-time multi-user editing powered by **Yjs CRDT** (Conflict-free Replicated Data Types) ensuring zero conflicts and sub-20ms sync latency.
- **Notion-like Editor**: A rich, block-based editing experience with support for slash commands, markdown, and embedded media.
- **Scalable Storage**: High-durability file and asset management using **Cloudflare R2** (S3-Compatible Object Storage).
- **Enterprise Grade**: Built with a modular monorepo structure, ensuring strict separation of concerns and high maintainability.

---

##  Architecture & Project Structure

CollabDocs is organized as a modular monorepo, separating the user experience from core business logic and high-intensity processing.

```bash
collabdocs/
├──  frontend/            # React/Vite - Modern UI/UX with Tiptap & Yjs
├──  backend/             # Node.js Modular Monolith - Drizzle ORM & Postgres
├──  converter-service/   # Python - High-performance document conversion engine
└──  .gitignore           # Global monorepo ignore rules
```


---

## Technology Stack

### **Frontend**
- **Framework**: React 19 (Vite)
- **State Management**: Zustand
- **Real-time**: Socket.io Client
- **Styling**: Tailwind CSS / Lucide Icons
- **Rich Text**: Tiptap Editor / ProseMirror

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

## 🚀 Getting Started

### **Prerequisites**
- Node.js (v18+)
- PostgreSQL
- Redis
- Python 3.10+ (for converter service)

### **Installation**

1. **Clone the repository**:
   ```bash
   git clone https://github.com/yourusername/flow.git
   cd flow
   ```

2. **Setup Backend**:
   ```bash
   cd backend
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