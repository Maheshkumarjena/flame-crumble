'use client';
import { useState, useEffect } from 'react'; // Added useEffect for initialFilters

const ProductFilter = ({ categories, onFilterChange, initialFilters }) => {
  const [activeFilters, setActiveFilters] = useState({
    category: 'all',
    sort: 'default',
    stock: false,
    newArrivals: false,
  });

  // Use useEffect to update activeFilters when initialFilters prop changes
  // This ensures the filter component resets correctly when filters are cleared in Shop.js
  useEffect(() => {
    if (initialFilters) {
      setActiveFilters(initialFilters);
    }
  }, [initialFilters]);

  const handleFilterChange = (filterType, value) => {
    const newFilters = {
      ...activeFilters,
      [filterType]: value,
    };
    setActiveFilters(newFilters);
    onFilterChange(newFilters);
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow mb-6">
      <div className="flex flex-wrap items-center gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
          <select
            className="border rounded px-3 py-1 text-sm"
            value={activeFilters.category}
            onChange={(e) => handleFilterChange('category', e.target.value)}
          >
            <option value="all">All</option>
            {/* Corrected: Access category.value and category.label */}
            {categories.map((category) => (
              <option key={category.value} value={category.value}>
                {category.label}
              </option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Sort</label>
          <select
            className="border rounded px-3 py-1 text-sm"
            value={activeFilters.sort}
            onChange={(e) => handleFilterChange('sort', e.target.value)}
          >
            <option value="default">Default</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="newest">Newest</option>
          </select>
        </div>
        
        <div className="flex items-center space-x-4">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={activeFilters.stock}
              onChange={(e) => handleFilterChange('stock', e.target.checked)}
              className="rounded text-[#E30B5D] focus:ring-[#E30B5D]"
            />
            <span className="text-sm text-gray-700">In Stock</span>
          </label>
          
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={activeFilters.newArrivals}
              onChange={(e) => handleFilterChange('newArrivals', e.target.checked)}
              className="rounded text-[#E30B5D] focus:ring-[#E30B5D]"
            />
            <span className="text-sm text-gray-700">New Arrivals</span>
          </label>
        </div>
        
        {activeFilters.newArrivals && (
          <span 
            className="flex items-center text-sm bg-gray-100 px-2 py-1 rounded cursor-pointer"
            onClick={() => handleFilterChange('newArrivals', false)}
          >
            New Arrivals <span className="ml-1 text-[#E30B5D]">×</span>
          </span>
        )}
        
        {activeFilters.stock && (
          <span 
            className="flex items-center text-sm bg-gray-100 px-2 py-1 rounded cursor-pointer"
            onClick={() => handleFilterChange('stock', false)}
          >
            In Stock <span className="ml-1 text-[#E30B5D]">×</span>
          </span>
        )}
      </div>
    </div>
  );
};

export default ProductFilter;
