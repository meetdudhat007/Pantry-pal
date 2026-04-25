require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const recipeRoutes = require('./routes/recipeRoutes');
const authRoutes = require('./routes/authRoutes');
const { initialRecipes } = require('./services/recipeService');
const Recipe = require('./models/Recipe');
const { initRasa } = require('./openaiClient');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 4000;

async function connectDB() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.warn('MONGODB_URI not set; running without DB');
    return;
  }
  await mongoose.connect(uri);
  console.log('Connected to MongoDB');
}

async function init() {
  // init DB
  await connectDB();

  // init Rasa
  const rasaUrl = process.env.RASA_URL || 'http://localhost:5005';
  initRasa(rasaUrl);
  console.log(`Rasa configured at: ${rasaUrl}`);

  // seed recipes if DB is present and empty
  if (mongoose.connection.readyState === 1) {
    const count = await Recipe.countDocuments();
    if (count === 0) {
      await Recipe.insertMany(initialRecipes);
      console.log('Seeded initial recipes');
    }
  }
}

app.get('/api/health', (req, res) => res.json({ ok: true }));

// API routes
app.use('/api/auth', authRoutes);
app.use('/api', recipeRoutes);

init().then(() => {
  app.listen(PORT, () => console.log(`Pantry Pal backend listening on port ${PORT}`));
}).catch(err => { console.error('Startup error', err); process.exit(1); });
