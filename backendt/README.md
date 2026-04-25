# Pantry Pal - Backend

Simple Express backend that provides recipe suggestions based on ingredients. This version integrates OpenAI for AI-powered suggestions and MongoDB Atlas for persistence.

## Setup

1. Copy `.env.example` to `.env` and set values:
   - `OPENAI_API_KEY` - your OpenAI API key
   - `OPENAI_MODEL` - optional (default `gpt-4o-mini`)
   - `MONGODB_URI` - your MongoDB Atlas connection string
   - `PORT` - optional (default 4000)

2. Install dependencies and run:

```bash
cd backend
npm install
# seed DB with initial recipes
npm run seed
# start server
npm start
# or run in dev mode
npm run dev
```

## API

- POST `/api/suggest`  { ingredients: string, diet: 'Any'|'Veg'|'Vegan'|'Keto'|'Protein' }
  - If `OPENAI_API_KEY` is set, the server will attempt to generate JSON recipes using OpenAI and save them to MongoDB.
  - If parsing fails or OpenAI is not configured, local fallback suggestions are returned.
- GET `/api/health` - basic health check
- GET `/api/recipes` - list stored recipes (most recent)
- GET `/api/recipe/:id` - get recipe by id
- GET `/api/chats` - get recent chat history (populated when `/api/suggest` is called)

## Notes
- Keep your `.env` secure. Do not commit secrets.
- This prototype stores AI-generated recipes and chat history in MongoDB Atlas.

## Next steps
- Add auth for protected admin endpoints
- Add more robust validation and tests
- Implement rate limits and request validation

