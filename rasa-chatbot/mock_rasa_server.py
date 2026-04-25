from flask import Flask, request, jsonify
from flask_cors import CORS
import json
import random

app = Flask(__name__)
CORS(app)

# Mock recipes database
RECIPES = {
    "veg": [
        {
            "name": "Vegetable Stir Fry",
            "ingredients": ["mixed vegetables", "soy sauce", "garlic", "ginger", "oil"],
            "steps": ["Heat oil in a wok", "Add garlic and ginger", "Stir fry vegetables", "Add soy sauce", "Serve hot"],
            "time": "15 mins",
            "level": "Easy",
            "diet": "Veg",
            "img": "stirfry"
        },
        {
            "name": "Paneer Tikka",
            "ingredients": ["paneer", "yogurt", "spices", "bell peppers", "onion"],
            "steps": ["Marinate paneer in yogurt and spices", "Skewer with vegetables", "Grill until golden", "Serve with chutney"],
            "time": "30 mins",
            "level": "Medium",
            "diet": "Veg",
            "img": "paneer"
        }
    ],
    "vegan": [
        {
            "name": "Vegan Buddha Bowl",
            "ingredients": ["quinoa", "chickpeas", "avocado", "spinach", "tahini"],
            "steps": ["Cook quinoa", "Roast chickpeas", "Assemble bowl with veggies", "Drizzle tahini dressing"],
            "time": "25 mins",
            "level": "Easy",
            "diet": "Vegan",
            "img": "bowl"
        }
    ],
    "keto": [
        {
            "name": "Keto Cauliflower Rice",
            "ingredients": ["cauliflower", "butter", "garlic", "cheese", "herbs"],
            "steps": ["Rice the cauliflower", "Sauté in butter with garlic", "Add cheese and herbs", "Serve hot"],
            "time": "20 mins",
            "level": "Easy",
            "diet": "Keto",
            "img": "cauliflower"
        }
    ],
    "protein": [
        {
            "name": "Grilled Chicken Breast",
            "ingredients": ["chicken breast", "olive oil", "herbs", "lemon", "garlic"],
            "steps": ["Marinate chicken with herbs and lemon", "Grill for 6-8 minutes per side", "Let rest before slicing", "Serve with vegetables"],
            "time": "25 mins",
            "level": "Easy",
            "diet": "Protein",
            "img": "chicken"
        }
    ]
}

def generate_recipe_from_ingredients(ingredients, diet):
    """Generate a recipe based on ingredients and diet type"""
    # Parse ingredients
    ingredient_list = [ing.strip() for ing in ingredients.split(',')]
    
    # Determine recipe type based on ingredients
    has_eggs = any('egg' in ing.lower() for ing in ingredient_list)
    has_chicken = any('chicken' in ing.lower() for ing in ingredient_list)
    has_paneer = any('paneer' in ing.lower() for ing in ingredient_list)
    has_tofu = any('tofu' in ing.lower() for ing in ingredient_list)
    has_veggies = any(ing.lower() in ['tomato', 'onion', 'potato', 'spinach', 'bell pepper', 'carrot'] for ing in ingredient_list)
    
    recipes = []
    
    # Generate specific recipes based on ingredients
    if has_eggs:
        recipes.append({
            "name": f"{diet} Omelette" if diet != "Any" else "Fluffy Omelette",
            "ingredients": ingredient_list + ["salt", "pepper", "butter"],
            "steps": [
                "Beat the eggs in a bowl with salt and pepper",
                "Heat butter in a non-stick pan over medium heat",
                f"Add {', '.join([ing for ing in ingredient_list if ing.lower() != 'eggs'])}",
                "Pour beaten eggs into the pan",
                "Cook for 2-3 minutes until set, fold and serve hot"
            ],
            "time": "15 mins",
            "level": "Easy",
            "diet": diet,
            "img": "omelette"
        })
    
    if has_chicken:
        recipes.append({
            "name": f"{diet} Grilled Chicken" if diet != "Any" else "Herb Grilled Chicken",
            "ingredients": ingredient_list + ["olive oil", "herbs", "lemon", "garlic"],
            "steps": [
                "Marinate chicken with olive oil, herbs, garlic and lemon",
                "Let it rest for 15 minutes",
                "Preheat grill or pan to medium-high heat",
                "Grill chicken for 6-8 minutes per side until cooked through",
                "Let rest for 5 minutes before slicing, serve hot"
            ],
            "time": "30 mins",
            "level": "Medium",
            "diet": diet,
            "img": "chicken"
        })
    
    if has_paneer:
        recipes.append({
            "name": f"{diet} Paneer Stir Fry" if diet != "Any" else "Paneer Masala",
            "ingredients": ingredient_list + ["spices", "oil", "garlic", "ginger"],
            "steps": [
                "Cut paneer into cubes",
                f"Heat oil and sauté garlic, ginger, and {', '.join([ing for ing in ingredient_list if 'paneer' not in ing.lower()])}",
                "Add paneer cubes and spices",
                "Stir fry on high heat for 5-7 minutes",
                "Garnish and serve hot with bread or rice"
            ],
            "time": "20 mins",
            "level": "Easy",
            "diet": diet,
            "img": "paneer"
        })
    
    if has_tofu or diet.lower() == "vegan":
        recipes.append({
            "name": "Vegan Tofu Bowl",
            "ingredients": ingredient_list + ["quinoa", "tahini", "lemon"],
            "steps": [
                "Cook quinoa according to package instructions",
                "Press and cube tofu, then pan-fry until golden",
                f"Sauté {', '.join([ing for ing in ingredient_list if 'tofu' not in ing.lower()])}",
                "Assemble bowl with quinoa, tofu, and vegetables",
                "Drizzle with tahini-lemon dressing"
            ],
            "time": "25 mins",
            "level": "Easy",
            "diet": "Vegan",
            "img": "bowl"
        })
    
    # Generic recipe if no specific match
    if not recipes:
        recipes.append({
            "name": f"{diet} Delight with {ingredient_list[0].title()}",
            "ingredients": ingredient_list + ["salt", "pepper", "oil", "herbs"],
            "steps": [
                f"Prepare and clean all ingredients: {', '.join(ingredient_list)}",
                "Heat oil in a large pan over medium heat",
                "Add main ingredients and sauté for 5-7 minutes",
                "Season with salt, pepper, and herbs to taste",
                "Cook until everything is well combined and heated through",
                "Serve hot with your choice of side dish"
            ],
            "time": "20 mins",
            "level": "Easy",
            "diet": diet,
            "img": "cooking"
        })
    
    # Add 1-2 more recipe variations
    if len(recipes) == 1:
        # Add a salad version
        recipes.append({
            "name": f"Fresh {diet} Salad",
            "ingredients": ingredient_list + ["lettuce", "olive oil", "lemon", "salt"],
            "steps": [
                f"Chop all vegetables: {', '.join(ingredient_list)}",
                "Mix with fresh lettuce in a large bowl",
                "Prepare dressing with olive oil, lemon, and salt",
                "Toss everything together",
                "Serve immediately as a healthy meal"
            ],
            "time": "10 mins",
            "level": "Easy",
            "diet": diet,
            "img": "salad"
        })
    
    return recipes[:3]  # Return max 3 recipes

@app.route('/webhooks/rest/webhook', methods=['POST'])
def webhook():
    """Main webhook endpoint for Rasa-style messages"""
    data = request.json
    sender = data.get('sender', 'user')
    message = data.get('message', '')
    
    print(f"\n=== Received message from {sender} ===")
    print(f"Message: {message}")
    
    # Parse the message
    response_text = ""
    
    # Check for recipe generation request
    if "generate recipe" in message.lower() or "ingredients:" in message.lower() or "with ingredients:" in message.lower():
        # Extract ingredients and diet
        ingredients = ""
        diet = "Any"
        
        # Parse ingredients
        if "ingredients:" in message.lower():
            parts = message.split("ingredients:")
            if len(parts) > 1:
                ing_part = parts[1].split(",")[0] if "," in parts[1] else parts[1]
                # Get everything before "diet" if exists
                if "diet" in ing_part.lower():
                    ing_part = ing_part.lower().split("diet")[0]
                ingredients = ing_part.strip().rstrip(',')
        elif "with ingredients:" in message.lower():
            parts = message.lower().split("with ingredients:")
            if len(parts) > 1:
                ing_part = parts[1].split("diet")[0] if "diet" in parts[1] else parts[1]
                ingredients = ing_part.strip().rstrip(',')
        
        # Parse diet type
        if "diet type:" in message.lower():
            parts = message.lower().split("diet type:")
            if len(parts) > 1:
                diet = parts[1].strip().split()[0].capitalize()
        elif "diet:" in message.lower():
            parts = message.lower().split("diet:")
            if len(parts) > 1:
                diet = parts[1].strip().split()[0].capitalize()
        
        # Default if no ingredients found
        if not ingredients or len(ingredients) < 3:
            ingredients = "eggs, tomato, onion"
        
        print(f"Parsed - Ingredients: '{ingredients}', Diet: '{diet}'")
        
        # Generate recipes
        recipes = generate_recipe_from_ingredients(ingredients, diet)
        response_text = json.dumps(recipes)
        
        print(f"Generated {len(recipes)} recipes")
    
    elif any(word in message.lower() for word in ["hello", "hi", "hey", "greet"]):
        response_text = "Hello! I'm Pantry Pal AI, your cooking assistant. How can I help you today?"
    
    elif any(word in message.lower() for word in ["bye", "goodbye", "see you"]):
        response_text = "Goodbye! Happy cooking!"
    
    elif any(word in message.lower() for word in ["spicy", "change", "modify", "substitute", "replace"]):
        response_text = "I can help with that! To make it spicy, add chili peppers or hot sauce. For substitutions, most vegetables can be swapped with similar ones. What would you like to change?"
    
    else:
        # General response
        response_text = "I'm here to help with recipes! Tell me what ingredients you have, and I'll generate a delicious recipe for you."
    
    print(f"Response length: {len(response_text)} characters")
    print("=" * 50)
    
    # Return in Rasa format
    return jsonify([{
        "recipient_id": sender,
        "text": response_text
    }])

@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({"status": "ok", "service": "Pantry Pal Mock Rasa"})

if __name__ == '__main__':
    print("Starting Pantry Pal Mock Rasa Server on port 5005...")
    print("This is a simplified Flask server that mimics Rasa's REST API")
    app.run(host='0.0.0.0', port=5005, debug=True)
