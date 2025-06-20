'use client';
import { useState, useEffect } from 'react'; // Import useEffect and useState
import Image from 'next/image';
import Link from 'next/link';
import { FiTrash } from 'react-icons/fi';

const CartItem = ({ item, onUpdateQuantity, onRemove }) => {
  const placeholderImageUrl = "https://placehold.co/96x96/e0e0e0/555555?text=No+Image"; // A gray placeholder

  console.log("item at cartItem",item)
  // State to manage the image source for the Image component
  const [currentImageUrl, setCurrentImageUrl] = useState(() => {
    // Initialize with the calculated URL, handling potential undefined item.image
    return item.image
      ? (item.image)
      : placeholderImageUrl;
  });

  // Reset imageUrl when item.image prop changes (e.g., if cart item itself changes)
  useEffect(() => {
    setCurrentImageUrl(
      item.image
        ? (item.image)
        : placeholderImageUrl
    );
  }, [item.image]);


  return (
    <div className="flex items-center bg-white rounded-lg shadow-md p-4 space-x-4">
      <div className="relative w-24 h-24 flex-shrink-0 rounded-md overflow-hidden">
        <Image
          src={currentImageUrl} // Use the state variable for src
          alt={item.name || 'Product Image'} // Add a fallback for alt text too
          fill
          sizes="96px" // Fixed size for this component
          className="object-cover"
          // When an error occurs, set the src to the placeholder image
          onError={(e) => { 
            if (currentImageUrl !== placeholderImageUrl) { // Prevent infinite loop if placeholder itself fails
              setCurrentImageUrl(placeholderImageUrl);
            }
          }} 
        />
      </div>
      
      <div className='flex flex-col justify-between flex-grow h-full'>

      <div className="flex-grow">
        <h3 className="font-semibold text-lg">{item.name || 'Product Name'}</h3>
        {item.variant && <p className="text-gray-600 text-sm">{item.variant}</p>}
        <p className="text-[#E30B5D] font-bold mt-1">₹{item.price !== undefined && item.price !== null ? item.price.toFixed(2) : '0.00'}</p>
      </div>
      
      <div className="flex items-center space-x-2">
        <button
          onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
          disabled={item.quantity <= 1}
          className="bg-gray-200 text-gray-700 px-2 py-1 rounded-md text-sm hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          -
        </button>
        <span className="text-lg font-medium">{item.quantity}</span>
        <button
          onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
          className="bg-gray-200 text-gray-700 px-2 py-1 rounded-md text-sm hover:bg-gray-300 transition-colors"
        >
          +
        </button>
        <button
          onClick={() => onRemove(item.id)}
          className="text-gray-500 hover:text-red-500 ml-4 p-2 rounded-full transition-colors flex items-center justify-center text-sm"
          aria-label="Remove item"
        >
          <FiTrash size={18} />
        </button>
      </div>
      </div>

    </div>
  );
};

export default CartItem;
