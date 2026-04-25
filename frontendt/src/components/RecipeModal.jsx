import React from 'react'

export default function RecipeModal({ recipe, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 w-11/12 max-w-lg">
        <div className="flex justify-between items-center mb-4">
          <h4 className="font-bold text-lg">{recipe.name}</h4>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-900 text-2xl"
          >
            ✕
          </button>
        </div>
        <div className="space-y-3 text-sm">
          <div>
            <p className="font-semibold text-gray-700">Time: {recipe.time}</p>
            <p className="font-semibold text-gray-700">Level: {recipe.level}</p>
            <p className="font-semibold text-gray-700">Diet: {recipe.diet}</p>
          </div>
          <div>
            <p className="font-semibold text-gray-700 mb-2">Ingredients:</p>
            <ul className="list-disc list-inside text-gray-600">
              {recipe.ingredients?.map((ing, idx) => (
                <li key={idx}>{ing}</li>
              ))}
            </ul>
          </div>
          <div>
            <p className="font-semibold text-gray-700 mb-2">Steps:</p>
            <ol className="list-decimal list-inside space-y-1 text-gray-600">
              {recipe.steps?.map((step, idx) => (
                <li key={idx}>{step}</li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </div>
  )
}
