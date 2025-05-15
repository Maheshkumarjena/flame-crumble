const DashboardCard = ({ title, value, color }) => {
  return (
    <div className={`${color} text-white rounded-lg p-6 shadow`}>
      <h3 className="text-lg font-medium mb-2">{title}</h3>
      <p className="text-3xl font-bold">{value}</p>
    </div>
  );
};

export default DashboardCard;