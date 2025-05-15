import Link from 'next/link';
import Image from 'next/image';
import { FiHeart, FiShoppingCart } from 'react-icons/fi';

const ProductCard = ({ product }) => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      <div className="relative h-48 w-full">
        <Image
          src={product.image}
          alt={product.name}
          fill
          className="object-cover"
        />
        {product.bestseller && (
          <span className="absolute top-2 left-2 bg-[#E30B5D] text-white text-xs px-2 py-1 rounded">
            Bestseller
          </span>
        )}
      </div>
      
      <div className="p-4">
        <h3 className="font-semibold text-lg mb-1">{product.name}</h3>
        <p className="text-gray-600 text-sm mb-2">{product.description}</p>
        <p className="text-[#E30B5D] font-bold mb-3">${product.price.toFixed(2)}</p>
        
        <div className="flex justify-between items-center">
          <button className="bg-black text-white px-3 py-1 rounded text-sm hover:bg-gray-800 transition-colors flex items-center">
            <FiShoppingCart className="mr-1" /> Add
          </button>
          <button className="text-gray-500 hover:text-[#E30B5D] transition-colors">
            <FiHeart />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;