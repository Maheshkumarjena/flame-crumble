'use client';
import Image from 'next/image';
import Link from 'next/link';
import { FiTrash, FiShoppingCart } from 'react-icons/fi';

const WishlistItem = ({ item, onMoveToCart, onRemove }) => {
  // FIX: Ensure image path starts with '/'
  const imageUrl = item.image

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
        <p className="text-[#E30B5D] font-bold mt-1">₹{item.price.toFixed(2)}</p>
      </div>
      
      <div className="flex flex-col space-y-2">
        <button
          onClick={() => onMoveToCart(item)} // Pass the item object
          className="bg-[#E30B5D] hover:bg-[#c5094f] text-white p-2 rounded-full transition-colors flex items-center justify-center text-sm"
          aria-label="Move to cart"
        >
          <FiShoppingCart size={18} />
        </button>
        <button
          onClick={() => onRemove(item.id)} // Pass the item id (which is product._id)
          className="text-gray-500 hover:text-red-500 p-2 rounded-full transition-colors flex items-center justify-center text-sm"
          aria-label="Remove from wishlist"
        >
          <FiTrash size={18} />
        </button>
      </div>
    </div>
  );
};

export default WishlistItem;
