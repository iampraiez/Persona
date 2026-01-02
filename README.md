<div align="center">
  <img src="./client/public/logo.svg" alt="TimeForge Logo" width="120">
  
  # ⚡ TimeForge
  ### Master Your Time, Forge Your Future.
  
  [![Live Demo](https://img.shields.io/badge/Live-Demo-blueviolet?style=for-the-badge)](https://timeforge-persona.vercel.app)
  [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)
</div>

---

## 🌟 Overview

**TimeForge** is an AI-powered productivity ecosystem designed to help you reclaim your schedule. Unlike traditional calendars, TimeForge leverages the **Gemini API** to intelligently break down complex goals into manageable steps, provides real-time adaptive suggestions, and ensures you stay on track with a robust notification system.

Whether you're a student, professional, or hobbyist, TimeForge provides the tools to visualize your progress and optimize your daily routine with a premium, high-performance interface.

---

## ✨ Key Features

- 🤖 **AI-Powered Goal Breakdown** – Input a high-level goal and let AI generate a structured roadmap with actionable steps and deadlines.
- 📅 **24/7 Dynamic Scheduler** – A sleek, interactive timetable for managing your daily events and habits with ease.
- 🔔 **Dual Notification System** – Receive both "Upcoming" reminders and "Starting Now" alerts via Web Push and in-app notifications.
- 📊 **Advanced Analytics** – Visualize your productivity trends, goal completion rates, and weekly performance with interactive charts.
- 🌓 **Premium Aesthetics** – A stunning dark-mode-first design featuring glassmorphism, smooth Framer Motion animations, and a responsive layout.
- 🔐 **Secure Authentication** – Seamless and secure login experience using Google OAuth.
- 🔄 **Adaptive Suggestions** – Missed a goal? TimeForge suggests alternative activities to keep your momentum going.

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 18 with Vite
- **Styling**: Tailwind CSS (Custom Design System)
- **Animations**: Framer Motion
- **State Management**: Zustand
- **Data Fetching**: TanStack Query (React Query)

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: PostgreSQL
- **ORM**: Prisma

### Infrastructure & Services
- **AI**: Google Gemini API
- **Auth**: Google OAuth 2.0
- **Notifications**: Web Push (VAPID)
- **Deployment**: Vercel

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** (v18 or higher)
- **PostgreSQL** instance
- **Google Cloud Console** account (for OAuth)
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
   npm install
   ```
   Create a `.env` file in the `server` directory:
   ```env
   PORT=3000
   DATABASE_URL="postgresql://user:password@localhost:5432/timeforge"
   JWT_SECRET="your_jwt_secret"
   GOOGLE_CLIENT_ID="your_google_client_id"
   GOOGLE_CLIENT_SECRET="your_google_client_secret"
   GEMINI_API_KEY="your_gemini_api_key"
   VAPID_PUBLIC_KEY="your_vapid_public_key"
   VAPID_PRIVATE_KEY="your_vapid_private_key"
   CLIENT_URL="http://localhost:5173"
   BACKEND_URL="http://localhost:3000"
   ```

3. **Frontend Setup**
   ```bash
   cd ../client
   npm install
   ```
   Create a `.env` file in the `client` directory:
   ```env
   VITE_API_URL="http://localhost:3000/api"
   ```

4. **Run the Application**
   - **Server**: `npm run dev` (in `/server`)
   - **Client**: `npm run dev` (in `/client`)

---

## 📂 Project Structure

```text
Persona/
├── client/                # React Frontend
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── hooks/         # Custom React hooks
│   │   ├── pages/         # Page-level components
│   │   ├── store/         # Zustand state stores
│   │   └── service/       # API interaction layer
├── server/                # Express Backend
│   ├── src/
│   │   ├── routes/        # API endpoints
│   │   ├── services/      # Business logic
│   │   ├── middleware/    # Auth & Error handling
│   │   └── scheduler.ts   # Cron jobs for notifications
│   └── prisma/            # Database schema & migrations
```

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

<div align="center">
  Built with ❤️ by <a href="https://github.com/iampraiez">iampraiez</a>
</div>
