// Simple in-memory recipe dataset and suggestion logic
const recipes = [
  {
    id: 1,
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
    id: 2,
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
    id: 3,
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
    id: 4,
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

function suggest(ingredientsText = "", diet = "Any") {
  const tokens = ingredientsText
    .toLowerCase()
    .split(/[,\s]+/)
    .map(t => t.trim())
    .filter(Boolean);

  const scored = recipes
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

module.exports = { recipes, suggest };
