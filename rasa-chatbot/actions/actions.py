from typing import Any, Text, Dict, List
from rasa_sdk import Action, Tracker
from rasa_sdk.executor import CollectingDispatcher
import json
import random

class ActionGenerateRecipe(Action):
    def name(self) -> Text:
        return "action_generate_recipe"

    def run(self, dispatcher: CollectingDispatcher,
            tracker: Tracker,
            domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        
        # Get user message
        user_message = tracker.latest_message.get('text')
        
        # Extract ingredients and diet from message or slots
        ingredients = tracker.get_slot('ingredients')
        diet_type = tracker.get_slot('diet_type')
        
        # Parse from message if not in slots
        if not ingredients and user_message:
            # Simple extraction from message
            ingredients = user_message
        
        if not diet_type:
            diet_type = "Any"
        
        # Generate mock recipe as JSON
        recipe = {
            "name": f"Delicious {diet_type} Recipe",
            "ingredients": ["eggs", "tomato", "onion", "cheese", "salt", "pepper"],
            "steps": [
                "Heat oil in a pan",
                "Add chopped onions and saute until golden",
                "Add beaten eggs and tomatoes",
                "Season with salt and pepper",
                "Cook until eggs are set",
                "Serve hot with cheese on top"
            ],
            "time": "20 mins",
            "level": "Easy",
            "diet": diet_type,
            "img": "omelette"
        }
        
        # Return as JSON array
        response = json.dumps([recipe])
        dispatcher.utter_message(text=response)
        
        return []


class ActionAnswerQuestion(Action):
    def name(self) -> Text:
        return "action_answer_question"

    def run(self, dispatcher: CollectingDispatcher,
            tracker: Tracker,
            domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        
        user_message = tracker.latest_message.get('text', '').lower()
        
        # Simple pattern matching for common questions
        if "spicy" in user_message or "spice" in user_message:
            response = "To make it spicy, add red chili flakes, cayenne pepper, or fresh green chilies to taste. Start with a small amount and adjust according to your preference."
        elif "substitute" in user_message or "replace" in user_message:
            response = "Most vegetables can be substituted with similar ones. For example: onion with shallots, tomato with bell peppers, spinach with kale. The key is to use ingredients with similar cooking times."
        elif "vegan" in user_message:
            response = "To make it vegan, replace eggs with tofu or chickpea flour, dairy with plant-based alternatives, and meat with legumes, tofu, or tempeh."
        elif "temperature" in user_message or "heat" in user_message:
            response = "Medium heat (around 350°F/175°C) is ideal for most cooking. High heat for searing, low heat for simmering."
        elif "time" in user_message or "long" in user_message:
            response = "Cooking times vary, but most quick recipes take 15-30 minutes. Watch for visual cues like golden color or bubbling."
        else:
            response = "That's a great question! For best results, follow the recipe steps carefully and taste as you cook to adjust seasonings."
        
        dispatcher.utter_message(text=response)
        return []


class ActionGeneralChat(Action):
    def name(self) -> Text:
        return "action_general_chat"

    def run(self, dispatcher: CollectingDispatcher,
            tracker: Tracker,
            domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        
        responses = [
            "I'm here to help with all your cooking questions! Ask me about recipes, ingredients, or cooking techniques.",
            "Cooking is all about experimenting! Don't be afraid to try new ingredients and flavors.",
            "A balanced diet includes proteins, vegetables, grains, and healthy fats. Mix and match for nutritious meals!",
            "Meal planning tip: Prepare ingredients in advance to save time during the week.",
            "Food safety is important! Always wash hands, store food properly, and cook meats to safe temperatures."
        ]
        
        response = random.choice(responses)
        dispatcher.utter_message(text=response)
        return []
