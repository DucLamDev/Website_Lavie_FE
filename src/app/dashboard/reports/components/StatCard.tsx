import React from 'react';

export interface StatCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info';
}

export const StatCard = ({ title, value, icon, variant = 'default' }: StatCardProps) => {
  // Define color classes based on variant
  const variantClasses = {
    default: 'bg-gray-100 text-gray-700',
    primary: 'bg-blue-100 text-blue-700',
    success: 'bg-green-100 text-green-700',
    warning: 'bg-yellow-100 text-yellow-700',
    danger: 'bg-red-100 text-red-700',
    info: 'bg-indigo-100 text-indigo-700'
  };

  const iconClass = variantClasses[variant];

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 flex items-center">
      <div className={`mr-4 p-3 rounded-full ${iconClass}`}>
        {icon}
      </div>
      <div>
        <p className="text-sm text-gray-500">{title}</p>
        <p className="text-lg font-semibold">{value}</p>
      </div>
    </div>
  );
};

export default StatCard;
