# Pantry Pal - Rasa Chatbot

This is the Rasa chatbot for Pantry Pal recipe assistant.

## Prerequisites

1. Python 3.8 or higher
2. pip (Python package installer)

## Installation

### 1. Install Rasa

```bash
cd rasa-chatbot
pip install rasa
```

### 2. Install Rasa SDK for custom actions

```bash
pip install rasa-sdk
```

## Setup

### 1. Train the Model

```bash
cd rasa-chatbot
rasa train
```

This will create a trained model in the `models/` directory.

### 2. Start Rasa Server

In one terminal, start the Rasa server:

```bash
cd rasa-chatbot
rasa run --enable-api --cors "*"
```

The server will run on `http://localhost:5005`

### 3. Start Actions Server

In another terminal, start the actions server:

```bash
cd rasa-chatbot
rasa run actions
```

The actions server will run on `http://localhost:5055`

## Testing

### Test in Command Line

```bash
rasa shell
```

### Test via REST API

```bash
curl -X POST http://localhost:5005/webhooks/rest/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "sender": "user1",
    "message": "Generate recipe with eggs and tomato"
  }'
```

## Integration with Backend

The Node.js backend is configured to connect to Rasa at `http://localhost:5005`

Make sure both Rasa servers (main + actions) are running before starting the backend.

## Project Structure

```
rasa-chatbot/
├── actions/
│   ├── __init__.py
│   └── actions.py          # Custom actions for recipe generation
├── data/
│   ├── nlu.yml            # Training data for intent recognition
│   ├── rules.yml          # Conversation rules
│   └── stories.yml        # Conversation flows
├── config.yml             # Pipeline and policy configuration
├── domain.yml             # Intents, entities, responses, actions
├── credentials.yml        # API credentials
└── endpoints.yml          # Action server endpoint
```

## Important Notes

- Keep both Rasa servers running: main server (port 5005) and actions server (port 5055)
- The chatbot returns recipes as JSON format
- You can customize the recipes in `actions/actions.py`
- To retrain after making changes: `rasa train`

## Commands Quick Reference

```bash
# Train model
rasa train

# Run Rasa server
rasa run --enable-api --cors "*"

# Run actions server (in separate terminal)
rasa run actions

# Test in shell
rasa shell

# Validate data
rasa data validate
```
