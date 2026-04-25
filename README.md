# 🍳 Pantry Pal

An AI-powered cooking assistant that suggests recipes based on ingredients you have at home. Built with the MERN stack (MongoDB, Express, React, Node.js) and integrated with Rasa for conversational AI.

---

## ✨ Features

- **AI Recipe Generation** — Enter your available ingredients and get personalized recipe suggestions
- **Smart Chat** — Ask the AI to modify recipes, adjust spice levels, or answer cooking questions
- **Voice Support** — Use voice input (microphone) and voice output (text-to-speech)
- **User Authentication** — Secure login/registration with JWT tokens
- **Save Recipes** — Save your favorite generated recipes for later
- **Responsive Design** — Beautiful UI built with React and Tailwind CSS

---

## 🏗️ Tech Stack

| Layer | Technology |
|-------|-------------|
| Frontend | React, Tailwind CSS, Vite |
| Backend | Node.js, Express |
| Database | MongoDB |
| AI/Chatbot | Rasa (Python) |
| Authentication | JWT, bcrypt |

---

## 🚀 Getting Started

### Prerequisites

- Node.js (v18+)
- MongoDB (local or Atlas)
- Python 3.8+ (for Rasa)

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/pantry-pal.git
cd pantry-pal

# Install backend dependencies
cd backendt
npm install

# Install frontend dependencies
cd ../frontendt
npm install

# Install Rasa dependencies
cd ../rasa-chatbot
pip install -r requirements.txt
```

### Running the Project

```bash
# Terminal 1: Start MongoDB
mongod

# Terminal 2: Start Backend
cd backendt
node server.js

# Terminal 3: Start Rasa Server
cd rasa-chatbot
python -m rasa run --port 5005

# Terminal 4: Start Frontend
cd frontendt
npm run dev
```

---

## 📁 Project Structure

```
pantry-pal/
├── backendt/           # Node.js Express API
│   ├── controllers/    # Route handlers
│   ├── models/         # MongoDB schemas
│   ├── routes/         # API endpoints
│   ├── services/       # Business logic
│   └── server.js       # Entry point
├── frontendt/          # React application
│   └── src/
│       ├── components/ # UI components
│       ├── App.jsx     # Main app
│       └── main.jsx    # React entry
├── rasa-chatbot/       # Rasa AI chatbot
│   ├── actions/        # Custom actions
│   ├── data/           # NLU training data
│   └── domain.yml      # Bot domain
└── README.md
```

---

## 🔑 API Endpoints

### Authentication
- `POST /api/auth/register` — Register new user
- `POST /api/auth/login` — Login user

### Recipes
- `POST /api/recipes/generate` — Generate recipe from ingredients
- `GET /api/recipes` — Get all saved recipes
- `DELETE /api/recipes/:id` — Delete a recipe

### Chat
- `POST /api/recipes/chat` — Chat about a specific recipe

---

## 📄 License

MIT License — feel free to use this project for learning or personal projects.

---

