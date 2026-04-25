import { useState, useEffect } from 'react';
import axios from 'axios';
import RecipeModal from './RecipeModal';

const API_BASE = 'http://localhost:4000/api';

const SavedRecipes = () => {
  const [recipes, setRecipes] = useState([]);
  const [filteredRecipes, setFilteredRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Filters
  const [selectedDiet, setSelectedDiet] = useState('Any');
  const [selectedLevel, setSelectedLevel] = useState('Any');
  const [searchIngredient, setSearchIngredient] = useState('');
  
  // Modal
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchRecipes();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [recipes, selectedDiet, selectedLevel, searchIngredient]);

  const fetchRecipes = async () => {
    try {
      setLoading(true);
      setError('');
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE}/my-recipes`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRecipes(response.data.recipes);
    } catch (err) {
      console.error('Error fetching recipes:', err);
      setError('Failed to load recipes. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...recipes];

    // Diet filter
    if (selectedDiet !== 'Any') {
      filtered = filtered.filter(r => r.diet === selectedDiet);
    }

    // Level filter
    if (selectedLevel !== 'Any') {
      filtered = filtered.filter(r => r.level === selectedLevel);
    }

    // Ingredient search
    if (searchIngredient.trim()) {
      const searchLower = searchIngredient.toLowerCase();
      filtered = filtered.filter(r =>
        r.name.toLowerCase().includes(searchLower) ||
        r.ingredients.some(ing => ing.toLowerCase().includes(searchLower))
      );
    }

    setFilteredRecipes(filtered);
  };

  const handleRecipeClick = (recipe) => {
    setSelectedRecipe(recipe);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedRecipe(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">My Saved Recipes</h1>
          <p className="text-gray-600">Browse and filter your generated recipes</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Diet Filter */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Diet Type</label>
              <select
                value={selectedDiet}
                onChange={(e) => setSelectedDiet(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="Any">All Diets</option>
                <option value="Veg">🥗 Vegetarian</option>
                <option value="Vegan">🌱 Vegan</option>
                <option value="Keto">🥩 Keto</option>
                <option value="Protein">💪 Protein</option>
              </select>
            </div>

            {/* Level Filter */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Difficulty</label>
              <select
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="Any">All Levels</option>
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>

            {/* Ingredient Search */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Search Ingredient</label>
              <input
                type="text"
                value={searchIngredient}
                onChange={(e) => setSearchIngredient(e.target.value)}
                placeholder="e.g., chicken, tomato..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Results Count */}
          <div className="mt-4 text-center">
            <span className="text-sm text-gray-600">
              Showing {filteredRecipes.length} of {recipes.length} recipes
            </span>
            {(selectedDiet !== 'Any' || selectedLevel !== 'Any' || searchIngredient) && (
              <button
                onClick={() => {
                  setSelectedDiet('Any');
                  setSelectedLevel('Any');
                  setSearchIngredient('');
                }}
                className="ml-4 text-sm text-green-600 hover:text-green-700 font-medium"
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
            <p className="mt-4 text-gray-600">Loading your recipes...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-700">{error}</p>
            <button
              onClick={fetchRecipes}
              className="mt-2 text-sm text-red-600 hover:text-red-700 font-medium"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && filteredRecipes.length === 0 && recipes.length === 0 && (
          <div className="text-center py-12 bg-white rounded-xl shadow-md">
            <div className="text-6xl mb-4">🍳</div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No recipes yet</h3>
            <p className="text-gray-600">Generate your first recipe to get started!</p>
          </div>
        )}

        {/* No Results */}
        {!loading && !error && filteredRecipes.length === 0 && recipes.length > 0 && (
          <div className="text-center py-12 bg-white rounded-xl shadow-md">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No matching recipes</h3>
            <p className="text-gray-600">Try adjusting your filters</p>
          </div>
        )}

        {/* Recipe Grid */}
        {!loading && !error && filteredRecipes.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRecipes.map((recipe) => (
              <div
                key={recipe._id}
                onClick={() => handleRecipeClick(recipe)}
                className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all cursor-pointer overflow-hidden group"
              >
                {/* Recipe Image/Icon */}
                <div className="h-48 bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center text-6xl group-hover:scale-105 transition-transform">
                  {recipe.img === 'omelette' && '🍳'}
                  {recipe.img === 'paneer' && '🧈'}
                  {recipe.img === 'bowl' && '🥗'}
                  {recipe.img === 'eggs' && '🥚'}
                  {!['omelette', 'paneer', 'bowl', 'eggs'].includes(recipe.img) && '🍽️'}
                </div>

                {/* Recipe Info */}
                <div className="p-5">
                  <h3 className="text-xl font-bold text-gray-800 mb-2 line-clamp-1">
                    {recipe.name}
                  </h3>

                  <div className="flex flex-wrap gap-2 mb-3">
                    <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                      {recipe.diet}
                    </span>
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                      {recipe.level}
                    </span>
                    <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs font-medium rounded-full">
                      ⏱️ {recipe.time}
                    </span>
                  </div>

                  <p className="text-sm text-gray-600 mb-3">
                    <span className="font-semibold">Ingredients:</span> {recipe.ingredients.slice(0, 3).join(', ')}
                    {recipe.ingredients.length > 3 && '...'}
                  </p>

                  <button className="w-full py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors">
                    View Recipe
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recipe Modal */}
      {showModal && selectedRecipe && (
        <RecipeModal
          recipe={selectedRecipe}
          onClose={closeModal}
        />
      )}
    </div>
  );
};

export default SavedRecipes;
