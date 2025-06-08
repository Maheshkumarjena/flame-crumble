'use client';
import Image from 'next/image';
import Link from 'next/link';
import { FiTrash } from 'react-icons/fi';

const CartItem = ({ item, onUpdateQuantity, onRemove }) => {
  // FIX: Ensure image path starts with '/'
  const imageUrl = item.image.startsWith('/') ? item.image : `/images/${item.image}`;

  return (
    <div className="flex items-center bg-white rounded-lg shadow-md p-4 space-x-4">
      <div className="relative w-24 h-24 flex-shrink-0 rounded-md overflow-hidden">
        <Image
          src={imageUrl}
          alt={item.name}
          fill
          sizes="96px" // Fixed size for this component
          className="object-cover"
        />
      </div>
      
      <div className="flex-grow">
        <h3 className="font-semibold text-lg">{item.name}</h3>
        {item.variant && <p className="text-gray-600 text-sm">{item.variant}</p>}
        <p className="text-[#E30B5D] font-bold mt-1">${item.price.toFixed(2)}</p>
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
  );
};

export default CartItem;
