const express = require('express');
const router = express.Router();
const controller = require('../controllers/recipeController');
const { authenticateToken } = require('../middleware/authMiddleware');

// Public routes
router.get('/recipes', controller.getRecipes);
router.get('/recipe/:id', controller.getRecipe);
router.get('/chats', controller.getChats);
router.post('/suggest', controller.suggest);

// Protected routes (require authentication)
router.post('/generate-recipe', authenticateToken, controller.generateRecipe);
router.get('/my-recipes', authenticateToken, controller.getMyGeneratedRecipes);
router.post('/recipe-chat', authenticateToken, controller.sendChatMessage);
router.get('/recipe-chat/:generatedRecipeId', authenticateToken, controller.getRecipeChat);

// General AI Chat (public or authenticated - currently public)
router.post('/chat', controller.generalChat);

module.exports = router;
