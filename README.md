# Assignment 2: API Integration Project

**Student:** Nurdaulet Usenbai  
**Course:** Web Technology

## Project Overview

This project integrates **4 APIs** to display random user information with country details, exchange rates, and news headlines.

### APIs Used:
1. **Random User API** - Generates random user profiles
2. **REST Countries API** - Country information (capital, languages, currency, flag)
3. **Exchange Rate API** - Currency conversion (USD & KZT)
4. **News API** - Latest 5 news headlines from user's country

---

## Quick Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure API Keys
Create a `.env` file:
```env
EXCHANGE_API_KEY=your_exchange_rate_api_key
NEWS_API_KEY=your_news_api_key
REST_COUNTRIES_API_KEY=optional
```

**Get API Keys:**
- Exchange Rate: https://www.exchangerate-api.com/ (sign up → copy key)
- News API: https://newsapi.org/ (register → get key)
- REST Countries: No key needed (optional for demonstration)

### 3. Start Server
```bash
npm start
```

### 4. Open Browser
```
http://localhost:3000
```

---

## 📁 Project Structure
```
assignment-2-api/
├── server.js          # Backend - All API routes
├── public/
│   ├── index.html     # Frontend structure
│   ├── app.js         # Frontend logic
│   └── style.css      # Styling
├── .env               # API keys (create this)
├── package.json       # Dependencies
└── README.md          # This file
```

---

## API Endpoints & What They Do

### 1. `GET /api/user`
**Purpose:** Fetch random user profile

**What it returns:**
- Name (first & last)
- Gender, age, date of birth
- Location (city, country, full address)
- Profile picture

**Used by:** Frontend to get initial user data

---

### 2. `GET /api/country/:country`
**Purpose:** Get country information based on user's country

**What it returns:**
- Country name
- Capital city
- Official languages
- Currency code
- National flag

**Used by:** Frontend after getting user's country name

---

### 3. `GET /api/exchange/:currency`
**Purpose:** Get exchange rates for user's currency

**What it returns:**
- Conversion to USD
- Conversion to KZT
- Example: `1 EUR = 1.08 USD, 1 EUR = 495.20 KZT`

**Used by:** Frontend after getting country's currency

---

### 4. `GET /api/news/:country`
**Purpose:** Fetch 5 latest news headlines from user's country

**What it returns:**
- Article title (filtered to ensure it contains the country name)
- Description
- Image (if available)
- Source URL

**Note:** The server-side filtering ensures that all returned headlines contain the user's country name in the title, and articles are in English language.

**Used by:** Frontend to display news from user's country

---

## 🎯 How It Works (Data Flow)
```
1. User clicks button
   ↓
2. Frontend calls: GET /api/user
   ↓
3. Backend fetches from randomuser.me → returns user data
   ↓
4. Frontend gets country name → calls: GET /api/country/{country}
   ↓
5. Backend fetches from restcountries.com → returns country data
   ↓
6. Frontend gets currency → calls: GET /api/exchange/{currency}
   Frontend also calls: GET /api/news/{country}
   ↓
7. Backend fetches exchange rates & news → returns both
   ↓
8. Frontend displays everything in cards
```

**Why sequential (not parallel)?**  
Each API needs data from the previous one:
- Need user's country → to get country info
- Need country's currency → to get exchange rates

---

##  Key Features

**Server-side API calls** - All external APIs called from backend (secure)  
**Environment variables** - API keys stored securely in `.env`  
**Error handling** - Graceful failures with user-friendly messages  
**Loading states** - Shows "Loading..." while fetching data  
**Responsive design** - Works on desktop, tablet, mobile  
**Clean code** - Organized, commented, follows best practices  
**No inline JS** - All logic in `app.js` (not in HTML)

---

## Technologies Used

- **Backend:** Node.js + Express.js
- **HTTP Client:** Axios
- **Frontend:** Vanilla JavaScript, HTML5, CSS3
- **Security:** dotenv for environment variables

---

## Code Feedback

### What Was Improved:

#### 1. **Server-Side (server.js)**
- Added proper error logging: `console.error()`
- Environment variable for REST Countries (demonstration)
- Currency validation before exchange API call
- News data cleaning (filter removed articles and ensure headlines contain country name)
- URL encoding for country names with special characters
- Better error messages and graceful handling of missing data

#### 2. **Frontend (app.js)**
- Added loading state: `"⏳ Loading..."`
- Better error handling with try-catch
- Conditional rendering (hide exchange if no currency)
- Structured cards with semantic HTML
- All logic in JS file (no inline JavaScript)

#### 3. **Styling (style.css)**
- Modern gradient background
- Card shadows and rounded corners
- Hover effects on buttons
- Responsive design (mobile-friendly)
- Loading animations
- Professional color scheme

#### 4. **Documentation**
- Complete README with setup instructions
- API usage explained
- Troubleshooting guide
- Clear project structure
