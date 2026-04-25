import React from 'react'

export default function RecipeCard({ recipe, onViewRecipe }) {
  return (
    <div className="bg-white rounded-3xl shadow-md hover:shadow-xl transition hover:-translate-y-1 overflow-hidden">
      <img
        src={`https://source.unsplash.com/400x300/?${recipe.img}`}
        alt={recipe.name}
        className="h-44 w-full object-cover"
      />
      <div className="p-5 space-y-2">
        <div className="flex items-center justify-between">
          <h4 className="font-semibold text-lg">{recipe.name}</h4>
          {recipe._id && (
            <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">Saved</span>
          )}
        </div>
        <div className="flex justify-between text-sm text-gray-600">
          <span>⏱️ {recipe.time}</span>
          <span className="text-green-600 font-medium">{recipe.level}</span>
        </div>
        {recipe.matchedIngredients?.length > 0 && (
          <p className="text-sm text-gray-600 mt-2">
            Matches: {recipe.matchedIngredients.join(', ')}
          </p>
        )}
        <button
          onClick={() => onViewRecipe(recipe)}
          className="w-full mt-3 bg-green-500 text-white py-2 rounded-full hover:bg-green-600"
        >
          View Recipe
        </button>
      </div>
    </div>
  )
}
