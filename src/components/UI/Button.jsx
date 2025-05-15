const Button = ({ children, variant = 'primary', size = 'medium', className = '', ...props }) => {
  const baseClasses = 'rounded-full font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2';
  
  const sizeClasses = {
    small: 'px-4 py-1 text-sm',
    medium: 'px-6 py-2',
    large: 'px-8 py-3 text-lg',
  };
  
  const variantClasses = {
    primary: 'bg-[#E30B5D] hover:bg-[#c5094f] text-white focus:ring-[#E30B5D]',
    secondary: 'bg-transparent hover:bg-gray-100 border-2 border-black text-black hover:text-black focus:ring-black',
    dark: 'bg-black hover:bg-gray-800 text-white focus:ring-black',
    outline: 'bg-transparent hover:bg-[#E30B5D] border-2 border-[#E30B5D] text-[#E30B5D] hover:text-white focus:ring-[#E30B5D]',
  };
  
  return (
    <button
      className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;