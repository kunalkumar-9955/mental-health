# 🧠 MindCare AI — Advanced AI Mental Health Therapist Platform

A full-stack, production-ready AI mental health companion with emotional intelligence, crisis detection, mood tracking, voice analysis, and personalized therapy support.

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- OpenAI API Key (optional — fallback responses work without it)

### 1. Backend Setup

```bash
cd mindcare-backend
cp .env.example .env
# Edit .env with your API keys
npm install
npm run dev
```

Backend runs on: `http://localhost:5000`

### 2. Frontend Setup

```bash
cd mindcare-frontend
cp .env.example .env.local
# Edit .env.local if needed
npm install
npm run dev
```

Frontend runs on: `http://localhost:3000`

---

## 🌐 Project Structure

```
Mental health/
├── mindcare-frontend/          # Next.js 14 Frontend
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.tsx        # Landing page
│   │   │   ├── auth/           # Authentication
│   │   │   ├── chat/           # AI Chat interface
│   │   │   ├── dashboard/      # Wellness dashboard
│   │   │   ├── mood/           # Mood tracker
│   │   │   ├── journal/        # AI Journal
│   │   │   ├── therapy/        # Therapy modes
│   │   │   ├── analytics/      # Analytics dashboard
│   │   │   └── settings/       # User settings
│   │   ├── components/
│   │   │   ├── ui/             # Reusable UI components
│   │   │   ├── chat/           # Chat components
│   │   │   ├── home/           # Landing page sections
│   │   │   ├── dashboard/      # Dashboard components
│   │   │   └── layout/         # App layout
│   │   ├── lib/
│   │   │   ├── api.ts          # API client
│   │   │   └── utils.ts        # Utilities
│   │   └── store/
│   │       └── useStore.ts     # Zustand state management
│   └── package.json
│
└── mindcare-backend/           # Express.js Backend
    ├── src/
    │   ├── server.js           # Main server
    │   ├── config/
    │   │   └── database.js     # MongoDB connection
    │   ├── models/             # Mongoose models
    │   │   ├── User.js
    │   │   ├── Chat.js
    │   │   ├── MoodLog.js
    │   │   ├── Journal.js
    │   │   ├── CrisisAlert.js
    │   │   └── TherapySession.js
    │   ├── routes/             # API routes
    │   │   ├── auth.js
    │   │   ├── chat.js
    │   │   ├── emotion.js
    │   │   ├── mood.js
    │   │   ├── therapy.js
    │   │   ├── analytics.js
    │   │   ├── crisis.js
    │   │   ├── voice.js
    │   │   ├── journal.js
    │   │   ├── notifications.js
    │   │   └── admin.js
    │   ├── services/
    │   │   └── aiService.js    # AI integration
    │   ├── middleware/
    │   │   └── auth.js         # JWT middleware
    │   └── socket/
    │       └── socketHandler.js # Real-time socket
    └── package.json
```

---

## 🔑 Environment Variables

### Backend (.env)
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/mindcare
JWT_SECRET=your_secret_key
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-3.5-turbo
FRONTEND_URL=http://localhost:3000
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_SOCKET_URL=http://localhost:5000
```

---

## 🎯 Features

### AI Chat System
- Real-time AI therapy conversations
- 9 specialized therapy modes
- Emotion detection on every message
- Crisis detection with emergency resources
- Memory system for personalized responses
- Voice recording support

### Emotion Detection
- Text-based emotion analysis
- Detects: sadness, anxiety, stress, anger, happiness, loneliness
- Emotion intensity scoring
- Visual emotion meter

### Crisis Detection
- Real-time monitoring for crisis phrases
- Emergency helpline display
- Guided breathing exercises
- Grounding techniques (5-4-3-2-1)

### Mood Tracking
- Daily mood logging (1-10 scale)
- Sleep, stress, anxiety tracking
- Activity logging
- Beautiful analytics charts

### AI Journal
- Smart journaling with AI insights
- Emotion analysis per entry
- Tag system
- Privacy-first design

### Analytics Dashboard
- 30-day mood trends
- Wellness radar chart
- Emotion distribution
- Weekly progress tracking

### Therapy Modes
1. General Support
2. Student Stress
3. Anxiety Relief
4. Depression Support
5. Relationship Support
6. Motivation Mode
7. Sleep Therapy
8. Panic Attack Support
9. Meditation Companion

### Breathing Exercises
- Box Breathing (4-4-4-4)
- 4-7-8 Breathing
- Calm Breathing
- Animated visual guide

---

## 🚀 Deployment

### Frontend (Vercel)
```bash
cd mindcare-frontend
npx vercel --prod
```

Set environment variables in Vercel dashboard.

### Backend (Railway)
1. Connect GitHub repo to Railway
2. Set root directory to `mindcare-backend`
3. Add environment variables
4. Deploy

### MongoDB Atlas
1. Create free cluster at mongodb.com/atlas
2. Get connection string
3. Update `MONGODB_URI` in backend `.env`

---

## 🔒 Security Features
- JWT authentication with 30-day expiry
- bcrypt password hashing
- Rate limiting (200 req/15min)
- Helmet.js security headers
- CORS protection
- Input validation with express-validator
- Anonymous mode (no personal data required)

---

## 🆘 Crisis Resources (India)
- **iCall**: 9152987821 (8am-10pm Mon-Sat)
- **Vandrevala Foundation**: 1860-2662-345 (24/7)
- **AASRA**: 9820466627 (24/7)
- **International**: befrienders.org

---

## ⚠️ Disclaimer
MindCare AI is a supportive tool and is NOT a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of qualified mental health professionals for serious concerns.

---

Built with ❤️ for mental wellness
