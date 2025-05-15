import { FiTrash2, FiMinus, FiPlus } from 'react-icons/fi';

const CartItem = ({ item, onUpdateQuantity, onRemove }) => {
  return (
    <div className="flex flex-col sm:flex-row border-b pb-6 mb-6">
      <div className="sm:w-1/4 mb-4 sm:mb-0">
        <div className="aspect-w-1 aspect-h-1 bg-gray-100 rounded-lg overflow-hidden">
          <img
            src={item.image}
            alt={item.name}
            className="w-full h-full object-cover"
          />
        </div>
      </div>
      
      <div className="sm:w-3/4 sm:pl-6">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-medium">{item.name}</h3>
            <p className="text-gray-600">{item.variant}</p>
          </div>
          <button 
            onClick={() => onRemove(item.id)}
            className="text-gray-500 hover:text-[#E30B5D]"
          >
            <FiTrash2 />
          </button>
        </div>
        
        <div className="mt-4 flex justify-between items-center">
          <div className="flex items-center border rounded">
            <button
              onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
              className="px-3 py-1 text-gray-600 hover:bg-gray-100"
              disabled={item.quantity <= 1}
            >
              <FiMinus />
            </button>
            <span className="px-4">{item.quantity}</span>
            <button
              onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
              className="px-3 py-1 text-gray-600 hover:bg-gray-100"
            >
              <FiPlus />
            </button>
          </div>
          
          <p className="text-lg font-semibold">
            ${(item.price * item.quantity).toFixed(2)}
          </p>
        </div>
      </div>
    </div>
  );
};

export default CartItem;