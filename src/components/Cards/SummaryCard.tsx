import React from 'react'


interface SummaryCardProps {
  icon: React.ReactNode;
  title: string;
  value: string | number;
};

const SummaryCard: React.FC<SummaryCardProps> = ({
  icon,
  title,
  value,
}) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-700 p-4 flex items-center gap-4 transition-colors">
      <div className="mr-1">
        {icon}
      </div>
      <div>
        <p className="text-lg text-gray-600 dark:text-gray-300 font-bold">{title}</p>
        <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
      </div>
    </div>
  )
}

export default SummaryCard