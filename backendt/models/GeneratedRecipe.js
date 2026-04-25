const mongoose = require('mongoose');

const GeneratedRecipeSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  ingredients: [String],
  steps: [String],
  time: String,
  level: String,
  diet: String,
  img: String,
  originalIngredientInput: String,
  aiGenerated: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('GeneratedRecipe', GeneratedRecipeSchema);
