<div align="center">
  <img src="./client/public/logo.svg" alt="TimeForge Logo" width="120">
  
  # ⚡ TimeForge
  ### Master Your Time, Forge Your Future.
  
  [![Live Demo](https://img.shields.io/badge/Live-Demo-blueviolet?style=for-the-badge)](https://timeforge-persona.vercel.app)
  [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)
</div>

---

## 🌟 Overview

**TimeForge** is an AI-powered productivity ecosystem designed to help you reclaim your schedule. Leveraging the **Google Gemini API**, TimeForge intelligently generates multi-day schedules, breaks down complex goals into actionable roadmaps, and provides deep productivity insights.

With a premium user experience featuring glassmorphism and fluid animations, TimeForge transforms how you manage your time, ensuring consistency through a robust Web Push notification system.

---

## ✨ Key Features

- 🤖 **AI-Driven Scheduling** – Generate optimized timetables for single days or multi-day ranges based on your goals and preferences.
- 📅 **Advanced Timetable Management** – Sleek interface to manage events, with powerful batch actions like copying or clearing events across date ranges.
- � **Intelligent Analytics** – Track your performance with interactive charts and receive AI-generated insights to optimize your focus and habits.
- 🔔 **Web Push Notifications** – Stay informed with a dual-layer notification system (Upcoming and "Starting Now" alerts) that works even when the app is closed.
- 🎯 **Goal Progress Tracking** – Break down ambitious life goals into manageable steps, each with its own tracking and deadlines.
- 🔐 **Enterprise-Grade Security** – Robust authentication via Google OAuth, coupled with comprehensive rate limiting and security headers.
- 🌓 **Premium UI/UX** – High-performance interface built with Framer Motion, featuring a dark-mode-first aesthetic and a fully responsive layout.

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 18 with Vite
- **Styling**: Vanilla CSS (Premium Design System)
- **Animations**: Framer Motion
- **State Management**: Zustand
- **Data Fetching**: TanStack Query (React Query)
- **Utility**: Date-fns

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Type Safety**: TypeScript
- **Database**: PostgreSQL (Prisma ORM)
- **Security**: Express-Rate-Limit & Helmet

### AI & Services
- **AI Engine**: Google Gemini API
- **Auth**: Google OAuth 2.0
- **Notifications**: Web Push (VAPID)

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** (v18+)
- **PostgreSQL** instance
- **Google Cloud Console** credentials
- **Gemini API Key**

### Installation

1. **Clone the Repository**
   ```bash
   git clone https://github.com/iampraiez/Persona.git
   cd Persona
   ```

2. **Backend Setup**
   ```bash
   cd server
   pnpm install
   ```
   Create a `.env` file in the `server` directory using the provided schema.

3. **Frontend Setup**
   ```bash
   cd ../client
   pnpm install
   ```
   Create a `.env` file in the `client` directory:
   ```env
   VITE_API_URL="your_backend_url"
   VITE_PUBLIC_VAPID_KEY="your_vapid_public_key"
   ```

4. **Run Locally**
   - **Server**: `pnpm dev`
   - **Client**: `pnpm dev`

---

## 📂 Project Structure

```text
Persona/
├── client/                # React Frontend (Vite)
│   ├── src/
│   │   ├── components/    # Reusable UI & Layout
│   │   ├── hooks/         # React Query & Logic hooks
│   │   ├── pages/         # Dashboard, Timetable, Analytics
│   │   ├── service/       # API Clients
│   │   └── store/         # Zustand Stores
├── server/                # Express Backend (TypeScript)
│   ├── src/
│   │   ├── routes/        # API Routing
│   │   ├── services/      # AI & Business Logic
│   │   ├── middleware/    # Auth, Security, Rate Limiting
│   │   └── scheduler.ts   # Notification Engine
│   └── prisma/            # Database Schema
```

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

<div align="center">
  Built with ✨ by <a href="https://github.com/iampraiez">iampraiez</a>
</div>
