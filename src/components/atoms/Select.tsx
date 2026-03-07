import React from 'react';

type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement> & {
  icon?: React.ReactNode;
};

export const Select = ({ icon, className, children, ...props }: SelectProps) => (
  <div className="flex items-center gap-3">
    {icon}
    <select 
      className={`bg-white border border-gray-200 text-gray-700 text-sm rounded-xl p-3 pr-8 focus:ring-indigo-500 focus:border-indigo-500 block ${className}`}
      {...props}
    >
      {children}
    </select>
  </div>
);
