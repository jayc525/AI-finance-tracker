# FinTrack - AI-Powered Personal Finance Tracker

A full-stack expense tracking app that uses Google Gemini AI to let you log expenses in plain English and ask questions about your spending.

## Features

- **Natural language expense logging** - Type "spent 200 on chai at tapri yesterday" and AI extracts the details
- **Dashboard with charts** - Category breakdown (pie chart) and monthly spending trends (bar chart)
- **Conversational queries** - Ask "how much did I spend on food this month?" and get an answer
- **Anomaly detection** - Flags unusually high expenses using statistical analysis (IQR method)
- **JWT authentication** - Secure signup/login with protected routes

## Tech Stack

- **Frontend**: React, Vite, Recharts, React Router
- **Backend**: Node.js, Express, MongoDB, Mongoose
- **AI**: Google Gemini API (`@google/genai` SDK)
- **Validation**: Zod
- **Auth**: JWT (jsonwebtoken + bcryptjs)

## Architecture

```
Client (React + Vite)  →  REST API  →  Express Server  →  MongoDB
                                           ↓
                                     Google Gemini API
```

- User enters expense in natural language → backend sends to Gemini → gets structured JSON → validates with Zod → saves to MongoDB
- User asks a question → Gemini generates MongoDB aggregation pipeline → server executes it → Gemini phrases the result in natural language
- Anomaly detection runs after each new expense using IQR (interquartile range) method

## Setup

### Prerequisites

- Node.js 18+ installed
- MongoDB Atlas account (free tier works) or local MongoDB
- Google Gemini API key (get one at [aistudio.google.com](https://aistudio.google.com))

### 1. Clone and install

```bash
# install server dependencies
cd server
npm install

# install client dependencies
cd ../client
npm install
```

### 2. Environment variables

Create a `.env` file in the `server/` folder:

```
MONGO_URI=mongodb+srv://your_username:your_password@cluster.mongodb.net/finance-tracker
JWT_SECRET=any_random_string_here
GEMINI_API_KEY=your_gemini_api_key
PORT=5000
```

### 3. Run the app

```bash
# Terminal 1 - start the server
cd server
npm run dev

# Terminal 2 - start the client
cd client
npm run dev
```

- Server runs on `http://localhost:5000`
- Client runs on `http://localhost:5173`

### 4. Try it out

1. Sign up with email and password
2. Add an expense manually or type something like "paid 500 for dinner at Zomato yesterday"
3. Check the dashboard for charts and stats
4. Go to "Ask AI" and try "how much did I spend this month?"

## API Endpoints

| Method | Route | Description |
|--------|-------|-------------|
| POST | /api/auth/signup | Create account |
| POST | /api/auth/login | Login |
| GET | /api/auth/me | Get current user |
| GET | /api/expenses | List expenses (filterable) |
| POST | /api/expenses | Create expense manually |
| POST | /api/expenses/parse | Parse NL text and create expense |
| PUT | /api/expenses/:id | Update expense |
| DELETE | /api/expenses/:id | Delete expense |
| GET | /api/dashboard/category-totals | Category-wise totals |
| GET | /api/dashboard/monthly-trends | Monthly spending data |
| GET | /api/dashboard/anomalies | Get flagged expenses |
| POST | /api/chat | Ask AI a question |

## Project Structure

```
server/
├── index.js              # Express entry point
├── config/db.js          # MongoDB connection
├── middleware/auth.js     # JWT middleware
├── models/               # Mongoose schemas
├── routes/               # API routes
├── services/             # Gemini AI + anomaly detection
└── validators/           # Zod schemas

client/
├── src/
│   ├── App.jsx           # Routes
│   ├── App.css           # All styles
│   ├── api.js            # Axios setup
│   ├── AuthContext.jsx   # Auth state
│   ├── pages/            # Login, Signup, Dashboard, Chat
│   └── components/       # Reusable UI components
```
