const service = require('../services/recipeService');
const { generateRecipes } = require('../openaiClient');

exports.getRecipes = async (req, res) => {
  try {
    const { q, diet, limit } = req.query;
    const limitNum = limit ? parseInt(limit, 10) : 50;
    const recipes = await service.getAllRecipes({ q, diet, limit: limitNum });
    res.json({ recipes });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch recipes' });
  }
};

exports.getRecipe = async (req, res) => {
  try {
    const recipe = await service.getRecipeById(req.params.id);
    if (!recipe) return res.status(404).json({ error: 'Not found' });
    res.json(recipe);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch recipe' });
  }
};

exports.getChats = async (req, res) => {
  try {
    const chats = await service.getChats();
    res.json({ chats });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch chats' });
  }
};

exports.suggest = async (req, res) => {
  const { ingredients = '', diet = 'Any', useAI = true } = req.body || {};

  try {
    // Try OpenAI first if configured and requested
    let suggestions = [];
    let aiMessage = '';
    if (useAI && process.env.OPENAI_API_KEY) {
      const result = await service.generateWithOpenAI(ingredients, diet);
      if (result && result.parsed && result.parsed.length) {
        aiMessage = result.raw || '';
        const saved = await service.upsertRecipesFromParsed(result.parsed);
        // attach saved _id to each suggestion and compute matchedIngredients
        suggestions = result.parsed.map((p, i) => ({
          ...p,
          _id: saved[i] ? saved[i]._id : undefined,
          matchedIngredients: p.ingredients.filter(i => ingredients.toLowerCase().includes(i.toLowerCase()))
        }));
        const savedIds = saved.map(s => s._id);
        await service.saveChat({ userMessage: ingredients, diet, aiMessage, recipes: savedIds });
        return res.json({ message: `Suggestions based on: ${ingredients}`, recipes: suggestions, ai: true, savedIds });
      }
    }

    // Fallback to local suggestion
    suggestions = service.suggestLocal(ingredients, diet);
    aiMessage = 'Fallback suggestions used.';
    await service.saveChat({ userMessage: ingredients, diet, aiMessage, recipes: [] });
    res.json({ message: `Suggestions based on: ${ingredients}`, recipes: suggestions, ai: false, savedIds: [] });
  } catch (err) {
    console.error(err);
    await service.saveChat({ userMessage: ingredients, diet, aiMessage: `Error: ${err.message}`, recipes: [] }).catch(() => {});
    res.status(500).json({ error: 'Failed to get suggestions' });
  }
};

// New endpoints for authenticated users

exports.generateRecipe = async (req, res) => {
  try {
    const userId = req.userId;
    const { ingredients = '', diet = 'Any' } = req.body;

    if (!ingredients.trim()) {
      return res.status(400).json({ error: 'Please provide ingredients' });
    }

    // Generate using Gemini
    const result = await service.generateRecipeForUser(userId, ingredients, diet);
    
    if (!result || !result.parsed || result.parsed.length === 0) {
      return res.status(400).json({ error: 'Failed to generate recipes' });
    }

    // Save first recipe
    const firstRecipe = result.parsed[0];
    const generatedRecipe = await service.saveGeneratedRecipe(userId, firstRecipe, ingredients);

    // Save all generated recipes for reference
    const allRecipes = await Promise.all(
      result.parsed.map(recipe => service.saveGeneratedRecipe(userId, recipe, ingredients))
    );

    res.json({
      message: 'Recipe generated successfully',
      recipe: generatedRecipe,
      allRecipes: allRecipes,
      raw: result.raw
    });
  } catch (err) {
    console.error('Generate recipe error:', err);
    res.status(500).json({ error: 'Failed to generate recipe: ' + err.message });
  }
};

exports.getMyGeneratedRecipes = async (req, res) => {
  try {
    const userId = req.userId;
    const { diet, level, ingredient, limit } = req.query;
    
    const filters = {};
    if (diet) filters.diet = diet;
    if (level) filters.level = level;
    if (ingredient) filters.ingredient = ingredient;
    
    const limitNum = limit ? parseInt(limit, 10) : 50;
    const recipes = await service.getGeneratedRecipes(userId, filters, limitNum);
    
    res.json({ recipes });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch generated recipes' });
  }
};

exports.sendChatMessage = async (req, res) => {
  try {
    const userId = req.userId;
    const { generatedRecipeId, message } = req.body;

    if (!message.trim()) {
      return res.status(400).json({ error: 'Message cannot be empty' });
    }

    // Save user message
    await service.saveChatMessage(userId, generatedRecipeId, 'user', message);

    // Get the recipe context
    const { GeneratedRecipe } = require('../models/GeneratedRecipe');
    const recipe = await require('../models/GeneratedRecipe').findById(generatedRecipeId);

    if (!recipe) {
      return res.status(404).json({ error: 'Recipe not found' });
    }

    // Generate AI response using Gemini
    const systemPrompt = `You are a helpful cooking assistant. The user is asking questions about or requesting modifications to a recipe. 
Current recipe:
Name: ${recipe.name}
Ingredients: ${recipe.ingredients.join(', ')}
Steps: ${recipe.steps.join('\n')}
Cooking time: ${recipe.time}
Difficulty: ${recipe.level}
Diet type: ${recipe.diet}

Help the user by answering questions or suggesting modifications. If they ask to modify the recipe, provide the modified recipe fields in JSON format like: {"name": "...", "ingredients": [...], "steps": [...], "time": "...", "level": "...", "diet": "..."}`;

    const fullPrompt = `${systemPrompt}\n\nUser message: ${message}`;

    let aiResponse = '';
    let updatedRecipeData = null;

    try {
      const aiText = await generateRecipes(fullPrompt);
      aiResponse = aiText;

      // Try to extract JSON if user asked for modifications
      if (message.toLowerCase().includes('change') || message.toLowerCase().includes('modify') || message.toLowerCase().includes('replace')) {
        const jsonMatch = aiText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          updatedRecipeData = JSON.parse(jsonMatch[0]);
        }
      }
    } catch (aiErr) {
      console.error('AI generation error:', aiErr);
      aiResponse = 'I encountered an error generating a response. Please try again.';
    }

    // Save AI response
    const savedMessage = await service.saveChatMessage(userId, generatedRecipeId, 'assistant', aiResponse, updatedRecipeData);

    res.json({
      message: savedMessage,
      updatedRecipe: updatedRecipeData
    });
  } catch (err) {
    console.error('Chat message error:', err);
    res.status(500).json({ error: 'Failed to process message' });
  }
};

exports.getRecipeChat = async (req, res) => {
  try {
    const userId = req.userId;
    const { generatedRecipeId } = req.params;

    const messages = await service.getChatMessages(userId, generatedRecipeId);
    res.json({ messages });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch chat messages' });
  }
};

// General AI Chat endpoint
exports.generalChat = async (req, res) => {
  try {
    const { message } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ error: 'Message cannot be empty' });
    }

    // Generate AI response using Gemini
    const systemPrompt = `You are a helpful AI assistant called Pantry Pal AI. You can help with cooking, recipes, nutrition advice, meal planning, ingredient substitutions, and general questions. Be friendly, conversational, and helpful.`;

    const fullPrompt = `${systemPrompt}\n\nUser message: ${message}`;

    let aiResponse = '';

    try {
      const aiText = await generateRecipes(fullPrompt);
      aiResponse = aiText;
    } catch (aiErr) {
      console.error('AI generation error:', aiErr);
      aiResponse = 'I encountered an error generating a response. Please try again.';
    }

    res.json({
      response: aiResponse,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    console.error('General chat error:', err);
    res.status(500).json({ error: 'Failed to process message' });
  }
};
