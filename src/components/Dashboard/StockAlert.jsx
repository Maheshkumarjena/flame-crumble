const StockAlert = ({ item }) => {
  return (
    <div className="bg-white rounded-lg shadow p-4 flex justify-between items-center">
      <div>
        <h3 className="font-medium">{item.name}</h3>
        <p className="text-sm text-gray-600">Only {item.stock} left</p>
      </div>
      <button className="bg-[#E30B5D] hover:bg-[#c5094f] text-white px-3 py-1 rounded text-sm font-medium transition-colors">
        Restock
      </button>
    </div>
  );
};

export default StockAlert;