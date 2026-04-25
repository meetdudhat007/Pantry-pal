const mongoose = require('mongoose');
const Recipe = require('./models/Recipe');
const { initialRecipes } = require('./services/recipeService');
require('dotenv').config();

async function main() {
  const uri = process.env.MONGODB_URI || '';
  if (!uri) {
    console.error('MONGODB_URI not set in .env');
    process.exit(1);
  }
  await mongoose.connect(uri);
  console.log('Connected to MongoDB');

  for (const r of initialRecipes) {
    const exists = await Recipe.findOne({ name: r.name });
    if (!exists) {
      await Recipe.create(r);
      console.log('Inserted', r.name);
    }
  }

  console.log('Seeding done');
  mongoose.disconnect();
}

main().catch(err => { console.error(err); process.exit(1); });
