import React, { useState } from 'react'
import axios from 'axios'

const API_BASE = 'http://localhost:4000/api'

export default function RecipeGenerator({ user, onRecipeGenerated }) {
  const [ingredients, setIngredients] = useState('')
  const [diet, setDiet] = useState('Any')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [generatedRecipe, setGeneratedRecipe] = useState(null)

  const handleGenerate = async (e) => {
    e.preventDefault()
    setError('')
    setGeneratedRecipe(null)

    if (!ingredients.trim()) {
      setError('Please enter ingredients')
      return
    }

    setLoading(true)

    try {
      const token = localStorage.getItem('token')
      const response = await axios.post(
        `${API_BASE}/generate-recipe`,
        { ingredients, diet },
        { headers: { Authorization: `Bearer ${token}` } }
      )

      setGeneratedRecipe(response.data.recipe)
      if (onRecipeGenerated) {
        onRecipeGenerated(response.data.recipe)
      }
      setIngredients('')
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to generate recipe')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-3xl shadow-xl p-8 mb-8">
      <h3 className="text-3xl font-bold mb-6">Generate New Recipe 🍳</h3>

      {error && (
        <div className="bg-red-100 text-red-700 p-3 rounded-lg mb-4 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleGenerate} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Ingredients (comma-separated)
          </label>
          <input
            type="text"
            value={ingredients}
            onChange={(e) => setIngredients(e.target.value)}
            placeholder="e.g., eggs, tomato, cheese, spinach"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Diet Type
          </label>
          <select
            value={diet}
            onChange={(e) => setDiet(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="Any">Any</option>
            <option value="Veg">Vegetarian</option>
            <option value="Vegan">Vegan</option>
            <option value="Keto">Keto</option>
            <option value="Protein">High Protein</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 disabled:opacity-50 font-medium transition"
        >
          {loading ? 'Generating...' : 'Generate Recipe with AI'}
        </button>
      </form>

      {generatedRecipe && (
        <div className="mt-8 border-t pt-6">
          <h4 className="text-2xl font-bold mb-4">{generatedRecipe.name}</h4>
          
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-green-50 p-3 rounded-lg">
              <p className="text-xs text-gray-600">Time</p>
              <p className="text-lg font-bold text-green-700">{generatedRecipe.time}</p>
            </div>
            <div className="bg-green-50 p-3 rounded-lg">
              <p className="text-xs text-gray-600">Level</p>
              <p className="text-lg font-bold text-green-700">{generatedRecipe.level}</p>
            </div>
            <div className="bg-green-50 p-3 rounded-lg">
              <p className="text-xs text-gray-600">Diet</p>
              <p className="text-lg font-bold text-green-700">{generatedRecipe.diet}</p>
            </div>
          </div>

          <div className="mb-6">
            <h5 className="font-bold mb-2">Ingredients:</h5>
            <ul className="list-disc list-inside space-y-1">
              {generatedRecipe.ingredients?.map((ing, idx) => (
                <li key={idx} className="text-gray-700">{ing}</li>
              ))}
            </ul>
          </div>

          <div>
            <h5 className="font-bold mb-2">Steps:</h5>
            <ol className="list-decimal list-inside space-y-2">
              {generatedRecipe.steps?.map((step, idx) => (
                <li key={idx} className="text-gray-700">{step}</li>
              ))}
            </ol>
          </div>
        </div>
      )}
    </div>
  )
}
