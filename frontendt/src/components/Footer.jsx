import React from 'react'

export default function Footer() {
  return (
    <footer className="mt-20 bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-8 py-12 grid md:grid-cols-3 gap-10">
        <div>
          <h4 className="text-xl font-bold text-white mb-3">The Pantry Pal</h4>
          <p className="text-sm">
            AI-powered recipe recommendation platform for smart cooking.
          </p>
        </div>

        <div>
          <h4 className="font-semibold text-white mb-3">Features</h4>
          <ul className="text-sm space-y-2">
            <li>AI Recipe Suggestions</li>
            <li>Diet Filters</li>
            <li>Ingredient-Based Search</li>
            <li>Mobile Friendly UI</li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold text-white mb-3">Built By</h4>
          <p className="text-sm">Prutha Desai</p>
          <p className="text-sm">Om Chaudhari</p>
        </div>
      </div>
      <div className="text-center text-xs text-gray-400 pb-6">
        © 2026 The Pantry Pal All rights reserved.
      </div>
    </footer>
  )
}
