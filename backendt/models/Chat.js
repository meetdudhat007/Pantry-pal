const mongoose = require('mongoose');

const ChatSchema = new mongoose.Schema({
  userMessage: String,
  diet: String,
  aiMessage: String,
  recipes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Recipe' }],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Chat', ChatSchema);
