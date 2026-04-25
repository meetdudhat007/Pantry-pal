import React from 'react'

export default function Header({ user, onLogout, currentPage, onNavigate }) {
  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur shadow-sm">
      <div className="max-w-7xl mx-auto px-8 py-5 flex justify-between items-center">
        <h1 className="text-2xl font-extrabold text-green-600 flex gap-2">
          <span>🍽️</span> The Pantry Pal
        </h1>
        
        <div className="flex items-center gap-6">
          {user && (
            <nav className="space-x-8 hidden md:block">
              <button
                onClick={() => onNavigate('generate')}
                className={`hover:text-green-600 font-medium ${
                  currentPage === 'generate' ? 'text-green-600' : 'text-gray-700'
                }`}
              >
                Recipe Generator 🍳
              </button>
              <button
                onClick={() => onNavigate('recipes')}
                className={`hover:text-green-600 font-medium ${
                  currentPage === 'recipes' ? 'text-green-600' : 'text-gray-700'
                }`}
              >
                Saved Recipes
              </button>
              <button
                onClick={() => onNavigate('about')}
                className={`hover:text-green-600 font-medium ${
                  currentPage === 'about' ? 'text-green-600' : 'text-gray-700'
                }`}
              >
                About
              </button>
            </nav>
          )}
          
          {user && (
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-700">{user.username}</p>
                <p className="text-xs text-gray-500">{user.email}</p>
              </div>
              <button
                onClick={onLogout}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-medium"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
