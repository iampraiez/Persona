# TimeForge (Persona)

**TimeForge** is an AI-powered goal tracker and scheduler designed to help individuals take control of their time, stay productive, and meet their personal goals with precision. Built with a modern tech stack including React, Node.js, Prisma, and Gemini API.

[View Live Site](https://timeforge-eight.vercel.app)

## Note
This was my first project using TypeScript and one of my earliest coding experiences. At the time, I was still figuring out how to structure code — so functions ended up scattered across multiple files and the organization wasn’t the cleanest. I later did a light cleanup just because I was bored, so while it may still look messy now, trust me, it was **much worse** before.

The project is open for further cleanup and refactoring, especially now that I’ve learned better coding practices.

## Features

- **AI-Enhanced Planning** – Breaks down goals into actionable steps with deadlines
- **24/7 Personal Scheduler** – Supports full-week and round-the-clock event planning
- **Google Authentication** – Seamless login with OAuth
- **Goal Tracking** – Monitor progress and track completion status
- **Event Notifications** – Sends reminders 10 minutes before any event
- **Adaptive Suggestions** – Prompts for alternative activities when goals are missed

## Tech Stack

- **Frontend**: React, Tailwind CSS, React Router, Vite
- **Backend**: Node.js, Express.js
- **Database**: PostgreSQL (Prisma ORM)
- **AI Integration**: Gemini API
- **Authentication**: Google OAuth
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js v18+
- PostgreSQL
- Vercel CLI (for deployment)

### Installation

```bash
# Clone the repo
git clone https://github.com/iampraiez/Persona.git
cd Persona

# Install dependencies
cd client
npm install
npm start

cd server
npm install
npm start


