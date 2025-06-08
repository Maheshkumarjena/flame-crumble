import { FiTrash2, FiShoppingCart } from 'react-icons/fi';

const WishlistItem = ({ item, onMoveToCart, onRemove }) => {
  
  

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="relative h-48 w-full">
        <img
          src={item.image}
          alt={item.name}
          className="w-full h-full object-cover"
        />
      </div>
      
      <div className="p-4">
        <h3 className="font-semibold text-lg mb-1">{item.name}</h3>
        <p className="text-gray-600 text-sm mb-2">{item.variant}</p>
        <p className="text-[#E30B5D] font-bold mb-3">${item.price.toFixed(2)}</p>
        
        <div className="flex justify-between">
          <button 
            onClick={() => onMoveToCart(item.id)}
            className="bg-black text-white px-3 py-1 rounded text-sm hover:bg-gray-800 transition-colors flex items-center"
          >
            <FiShoppingCart className="mr-1" /> Add to Cart
          </button>
          <button 
            onClick={() => onRemove(item.id)}
            className="text-gray-500 hover:text-[#E30B5D] transition-colors"
          >
            <FiTrash2 />
          </button>
        </div>
      </div>
    </div>
  );
};

export default WishlistItem;