type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'outline' | 'ghost';
};

export const Button = ({ variant = 'primary', className, children, ...props }: ButtonProps) => {
  const baseStyle = "w-full py-3 px-4 rounded-xl font-bold transition-all transform active:scale-[0.98]";
  const variants = {
    primary: "bg-indigo-600 text-white hover:bg-indigo-500 shadow-lg shadow-indigo-900/20",
    outline: "border-2 border-gray-200 text-gray-600 hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-300",
    ghost: "bg-transparent border border-slate-600 text-slate-400 hover:text-white hover:border-slate-400",
  };

  return (
    <button className={`${baseStyle} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
};
