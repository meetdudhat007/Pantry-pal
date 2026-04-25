const axios = require('axios');

let rasaUrl = null;

function initRasa(url) {
  if (!url) return null;
  rasaUrl = url;
  console.log(`Rasa initialized at: ${rasaUrl}`);
  return rasaUrl;
}

async function generateRecipes(prompt, conversationId = 'default') {
  if (!rasaUrl) throw new Error('Rasa client not initialized');

  try {
    // Send message to Rasa
    const response = await axios.post(`${rasaUrl}/webhooks/rest/webhook`, {
      sender: conversationId,
      message: prompt
    });

    // Rasa returns an array of responses
    if (response.data && response.data.length > 0) {
      // Combine all text responses
      const text = response.data.map(r => r.text).join('\n');
      return text;
    }
    
    return null;
  } catch (error) {
    console.error('Rasa API error:', error.message);
    throw new Error('Failed to communicate with Rasa server');
  }
}

module.exports = { initRasa, generateRecipes };
