import React, { useState, useEffect } from 'react'
import RecipeCard from './RecipeCard'
import RecipeModal from './RecipeModal'

const API_BASE = 'http://localhost:4000/api'

export default function RecipeSection({ recipes, diet, onDietChange }) {
  const [filteredRecipes, setFilteredRecipes] = useState(recipes)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedRecipe, setSelectedRecipe] = useState(null)
  const [allRecipes, setAllRecipes] = useState([])

  useEffect(() => {
    fetchRecipes()
  }, [])

  useEffect(() => {
    filterRecipes()
  }, [recipes, diet, searchQuery])

  const fetchRecipes = async () => {
    try {
      const res = await fetch(`${API_BASE}/recipes`)
      const data = await res.json()
      setAllRecipes(data.recipes || [])
    } catch (err) {
      console.error('Failed to fetch recipes:', err)
    }
  }

  const filterRecipes = () => {
    let filtered = recipes.length > 0 ? recipes : allRecipes

    if (diet !== 'Any') {
      filtered = filtered.filter(r => r.diet === diet)
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      filtered = filtered.filter(r =>
        r.name.toLowerCase().includes(q) ||
        r.ingredients?.some(ing => ing.toLowerCase().includes(q))
      )
    }

    setFilteredRecipes(filtered)
  }

  const handleSearch = async () => {
    if (!searchQuery.trim()) return
    try {
      const params = new URLSearchParams()
      params.append('q', searchQuery)
      if (diet !== 'Any') params.append('diet', diet)
      const res = await fetch(`${API_BASE}/recipes?${params}`)
      const data = await res.json()
      setFilteredRecipes(data.recipes || [])
    } catch (err) {
      console.error('Search failed:', err)
    }
  }

  return (
    <>
      <section id="recipes" className="mb-16">
        <h3 className="text-3xl font-bold mb-8">🍲 AI-Generated Recipes</h3>

        {/* Search & Filter */}
        <div className="flex gap-3 mb-6 flex-wrap">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="Search recipes or ingredients"
            className="flex-1 px-4 py-2 rounded-full border text-sm min-w-[200px]"
          />
          <select
            value={diet}
            onChange={(e) => onDietChange(e.target.value)}
            className="px-4 py-2 rounded-full border text-sm"
          >
            <option value="Any">All Diets</option>
            <option value="Veg">Veg</option>
            <option value="Vegan">Vegan</option>
            <option value="Keto">Keto</option>
            <option value="Protein">Protein</option>
          </select>
          <button
            onClick={handleSearch}
            className="bg-green-500 text-white px-4 py-2 rounded-full hover:bg-green-600 whitespace-nowrap"
          >
            Search
          </button>
        </div>

        {/* Recipe Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRecipes.length > 0 ? (
            filteredRecipes.map((recipe, idx) => (
              <RecipeCard
                key={idx}
                recipe={recipe}
                onViewRecipe={setSelectedRecipe}
              />
            ))
          ) : (
            <div className="col-span-3 text-center text-gray-500">
              No recipes found.
            </div>
          )}
        </div>
      </section>

      {/* Modal */}
      {selectedRecipe && (
        <RecipeModal
          recipe={selectedRecipe}
          onClose={() => setSelectedRecipe(null)}
        />
      )}
    </>
  )
}
