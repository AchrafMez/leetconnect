type StatsCardProps = {
  title: string;
  value: string | number;
};

const StatsCard = ({ title, value }: StatsCardProps) => {
  return (
    <div className="bg-[#121212] p-6 rounded-lg border border-gray-800 w-60">
      <p className="text-gray-400">{title}</p>
      <h2 className="text-2xl text-white mt-2">{value}</h2>
    </div>
  );
};

export default StatsCard;