const Recipe = require('../models/Recipe');
const Chat = require('../models/Chat');
const GeneratedRecipe = require('../models/GeneratedRecipe');
const ChatMessage = require('../models/ChatMessage');
const { generateRecipes } = require('../openaiClient');

// Initial in-memory recipes (used for seeding and local fallback)
const initialRecipes = [
  {
    name: "Spinach Omelette",
    ingredients: ["eggs", "spinach", "salt", "pepper", "tomato"],
    time: "15 mins",
    level: "Easy",
    diet: "Protein",
    img: "omelette",
    steps: [
      "Beat eggs with salt and pepper",
      "Add chopped spinach and tomato",
      "Cook on medium heat until set"
    ]
  },
  {
    name: "Paneer Stir Fry",
    ingredients: ["paneer", "onion", "bell pepper", "soy sauce", "garlic"],
    time: "20 mins",
    level: "Medium",
    diet: "Veg",
    img: "paneer",
    steps: [
      "Cube paneer and chop veggies",
      "Stir fry garlic and onions",
      "Add veggies, paneer and sauce, cook for 5 mins"
    ]
  },
  {
    name: "Vegan Buddha Bowl",
    ingredients: ["quinoa", "chickpeas", "avocado", "spinach", "tomato"],
    time: "25 mins",
    level: "Easy",
    diet: "Vegan",
    img: "bowl",
    steps: [
      "Cook quinoa",
      "Roast chickpeas with spices",
      "Assemble bowl with veggies and avocado"
    ]
  },
  {
    name: "Keto Egg Muffins",
    ingredients: ["eggs", "cheese", "spinach", "bacon", "salt"],
    time: "30 mins",
    level: "Easy",
    diet: "Keto",
    img: "eggs",
    steps: [
      "Preheat oven and grease muffin tin",
      "Mix eggs with fillings and pour into tins",
      "Bake 15-18 minutes until set"
    ]
  }
];

function tokenizeIngredients(ingredientsText = "") {
  return ingredientsText
    .toLowerCase()
    .split(/[,\s]+/)
    .map(t => t.trim())
    .filter(Boolean);
}

function suggestLocal(ingredientsText = "", diet = "Any") {
  const tokens = tokenizeIngredients(ingredientsText);

  const scored = initialRecipes
    .map(r => {
      const matched = r.ingredients.filter(i =>
        tokens.some(t => i.includes(t) || t.includes(i))
      );
      const score = matched.length / r.ingredients.length;
      return { ...r, matchedIngredients: matched, score };
    })
    .filter(r => (diet === "Any" || r.diet === diet) && r.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 6);

  return scored;
}

async function generateWithOpenAI(ingredients, diet, model = process.env.OPENAI_MODEL || 'gpt-4o-mini') {
  const rasaUrl = process.env.RASA_URL || 'http://localhost:5005';
  if (!rasaUrl) {
    throw new Error('Rasa not configured');
  }

  const prompt = `Generate recipe with ingredients: ${ingredients}, diet type: ${diet}`;
  const aiText = await generateRecipes(prompt, 'general');

  if (!aiText) return null;

  // Clean the text by removing markdown code blocks
  let cleanedText = aiText.trim();
  cleanedText = cleanedText.replace(/```json\n?/g, '');
  cleanedText = cleanedText.replace(/```\n?/g, '');
  cleanedText = cleanedText.trim();

  // extract JSON (array or object)
  const jsonMatch = cleanedText.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
  if (!jsonMatch) return null;
  try {
    const parsed = JSON.parse(jsonMatch[0]);
    if (!Array.isArray(parsed)) return null;
    return { parsed, raw: aiText };
  } catch (e) {
    console.error('JSON parse error:', e);
    return null;
  }
}

async function upsertRecipesFromParsed(parsedArray) {
  if (!Array.isArray(parsedArray)) return [];
  const savedDocs = [];
  for (const r of parsedArray) {
    const doc = await Recipe.findOneAndUpdate({ name: r.name }, r, { upsert: true, new: true, setDefaultsOnInsert: true });
    savedDocs.push(doc);
  }
  return savedDocs;
}

async function saveChat({ userMessage, diet, aiMessage = '', recipes = [] }) {
  const chat = new Chat({ userMessage, diet, aiMessage, recipes });
  return chat.save();
}

async function getAllRecipes({ q, diet, limit = 50 } = {}) {
  const query = {};
  if (diet && diet !== 'Any') query.diet = diet;
  if (q) {
    const regex = new RegExp(q, 'i');
    query.$or = [
      { name: regex },
      { level: regex },
      { ingredients: { $elemMatch: regex } }
    ];
  }
  return Recipe.find(query).sort({ createdAt: -1 }).limit(limit).lean();
}

async function getRecipeById(id) {
  return Recipe.findById(id).lean();
}

async function getChats(limit = 50) {
  return Chat.find().sort({ createdAt: -1 }).limit(limit).populate('recipes').lean();
}

// New functions for user-specific recipe generation and chat

async function generateRecipeForUser(userId, ingredients, diet) {
  const rasaUrl = process.env.RASA_URL || 'http://localhost:5005';
  if (!rasaUrl) {
    throw new Error('Rasa not configured');
  }

  const prompt = `Generate recipe with ingredients: ${ingredients}, diet type: ${diet}`;
  
  try {
    const aiText = await generateRecipes(prompt, userId);
    
    if (!aiText) return null;

    // Clean the text by removing markdown code blocks
    let cleanedText = aiText.trim();
    cleanedText = cleanedText.replace(/```json\n?/g, '');
    cleanedText = cleanedText.replace(/```\n?/g, '');
    cleanedText = cleanedText.trim();

    // Extract JSON
    const jsonMatch = cleanedText.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
    if (!jsonMatch) {
      console.error('No JSON found in Rasa response:', cleanedText);
      return null;
    }
    
    const parsed = JSON.parse(jsonMatch[0]);
    const recipesArray = Array.isArray(parsed) ? parsed : [parsed];
    
    return { parsed: recipesArray, raw: aiText };
  } catch (err) {
    console.error('Error generating recipe with Rasa:', err);
    throw err;
  }
}

async function saveGeneratedRecipe(userId, recipeData, originalIngredientInput) {
  const recipe = new GeneratedRecipe({
    userId,
    name: recipeData.name,
    ingredients: recipeData.ingredients,
    steps: recipeData.steps,
    time: recipeData.time,
    level: recipeData.level,
    diet: recipeData.diet,
    img: recipeData.img,
    originalIngredientInput,
    aiGenerated: true
  });
  return recipe.save();
}

async function getGeneratedRecipes(userId, filters = {}, limit = 50) {
  const query = { userId };
  
  // Add filters
  if (filters.diet && filters.diet !== 'Any') {
    query.diet = filters.diet;
  }
  
  if (filters.level) {
    query.level = filters.level;
  }
  
  if (filters.ingredient) {
    query.ingredients = { $regex: filters.ingredient, $options: 'i' };
  }
  
  if (filters.maxTime) {
    // Convert "30 mins" to number for comparison
    // This is a simple filter - recipes with time like "30 mins", "1 hour" etc
    // For now, we'll do a text search
  }
  
  return GeneratedRecipe.find(query).sort({ createdAt: -1 }).limit(limit).lean();
}

async function getChatMessages(userId, generatedRecipeId) {
  return ChatMessage.find({ userId, generatedRecipeId }).sort({ createdAt: 1 }).lean();
}

async function saveChatMessage(userId, generatedRecipeId, role, content, updatedRecipe = null) {
  const message = new ChatMessage({
    userId,
    generatedRecipeId,
    role,
    content,
    updatedRecipe
  });
  return message.save();
}

module.exports = {
  initialRecipes,
  suggestLocal,
  generateWithOpenAI,
  upsertRecipesFromParsed,
  saveChat,
  getAllRecipes,
  getRecipeById,
  getChats,
  generateRecipeForUser,
  saveGeneratedRecipe,
  getChatMessages,
  saveChatMessage,
  getGeneratedRecipes
};
