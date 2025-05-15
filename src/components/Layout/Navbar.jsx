"use client";
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { FiShoppingCart, FiHeart, FiUser, FiMenu, FiX } from 'react-icons/fi';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  const navItems = [
    { name: 'Home', path: '/' },
    { name: 'Shop', path: '/shop' },
    { name: 'Corporate', path: '/corporate' },
    { name: 'About', path: '/about' },
    { name: 'Contact', path: '/contact' },
  ];

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="text-xl font-bold text-black">
              flame&crumble
            </Link>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link 
                key={item.name}
                href={item.path}
                className={`${router.pathname === item.path ? 'text-[#E30B5D]' : 'text-black'} hover:text-[#E30B5D] transition-colors`}
              >
                {item.name}
              </Link>
            ))}
          </div>
          
          <div className="hidden md:flex items-center space-x-6">
            <Link href="/wishlist" className="text-black hover:text-[#E30B5D]">
              <FiHeart size={20} />
            </Link>
            <Link href="/cart" className="text-black hover:text-[#E30B5D]">
              <FiShoppingCart size={20} />
            </Link>
            <Link href="/account" className="text-black hover:text-[#E30B5D]">
              <FiUser size={20} />
            </Link>
          </div>
          
          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-black hover:text-[#E30B5D] focus:outline-none"
            >
              {isOpen ? <FiX size={24} /> : <FiMenu size={24} />}
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile Navigation */}
      {isOpen && (
        <div className="md:hidden bg-white">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.path}
                className={`${router.pathname === item.path ? 'bg-[#E30B5D] text-white' : 'text-black hover:bg-gray-100'} block px-3 py-2 rounded-md text-base font-medium`}
                onClick={() => setIsOpen(false)}
              >
                {item.name}
              </Link>
            ))}
            <div className="flex space-x-4 px-3 py-2">
              <Link href="/wishlist" className="text-black hover:text-[#E30B5D]" onClick={() => setIsOpen(false)}>
                <FiHeart size={20} />
              </Link>
              <Link href="/cart" className="text-black hover:text-[#E30B5D]" onClick={() => setIsOpen(false)}>
                <FiShoppingCart size={20} />
              </Link>
              <Link href="/account" className="text-black hover:text-[#E30B5D]" onClick={() => setIsOpen(false)}>
                <FiUser size={20} />
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;