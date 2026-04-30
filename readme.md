# 🚀 Flow - Modern Collaboration & Documentation Platform

Flow is a high-performance, real-time collaborative documentation platform built with a modular architecture. It enables teams to create, manage, and collaborate on documents with a seamless, lightning-fast experience.

---

##  Overview
<!-- Space for a professional hero image or screenshot of the app -->
![Flow Hero Screenshot](https://via.placeholder.com/1200x600?text=Flow+Dashboard+Preview)

---

##  Architecture & Project Structure

Flow is organized as a modular monorepo, separating concerns between user experience, core logic, and heavy-duty processing.

```bash
collabdocs/
├──  frontend/            # React/Vite - Modern UI/UX with TailwindCSS
├──  backend/             # Node.js Modular Monolith - Core API & Business Logic
├──  converter-service/   # Python - High-performance document conversion engine
└──  .gitignore           # Global monorepo ignore rules
```

---

## 🛠️ Technology Stack

### **Frontend**
- **Framework**: React 19 (Vite)
- **State Management**: Zustand
- **Real-time**: Socket.io Client
- **Styling**: Tailwind CSS / Lucide Icons
- **Rich Text**: Tiptap Editor / ProseMirror

### **Backend**
- **Runtime**: Node.js (Express)
- **Database**: PostgreSQL
- **ORM**: Drizzle ORM
- **Authentication**: Passport.js (JWT & Google OAuth 2.0)
- **Async Tasks**: BullMQ (Redis)
- **Real-time**: Socket.io Server

### **Services**
- **Storage**: Cloudflare R2 (S3 Compatible)
- **Conversion**: Python (Flask/FastAPI style engine)

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