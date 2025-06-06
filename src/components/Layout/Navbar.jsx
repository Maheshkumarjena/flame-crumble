"use client";
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useCallback, useEffect } from 'react'; // Added useEffect for cleanup
import { FiShoppingCart, FiHeart, FiUser, FiMenu, FiX } from 'react-icons/fi';

// Helper function for scroll lock
const togglePageScroll = (disable) => {
    const body = document.body;
    if (disable) {
        body.style.overflow = 'hidden';
    } else {
        body.style.overflow = ''; // Resets to default
    }
};

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

    // Handle opening/closing the mobile menu and managing scroll
    const handleToggleMenu = useCallback(() => {
        setIsOpen(prevIsOpen => {
            togglePageScroll(!prevIsOpen); // Disable scroll if opening, enable if closing
            return !prevIsOpen;
        });
    }, []);

    // Handle clicks on mobile navigation links
    const handleMobileLinkClick = useCallback(() => {
        setIsOpen(false);
        togglePageScroll(false); // Ensure scrolling is re-enabled when a link is clicked
    }, []);

    // Clean up scroll lock if component unmounts while menu is open (e.g., fast refresh)
    useEffect(() => {
        return () => {
            togglePageScroll(false); // Ensure scroll is enabled when component unmounts
        };
    }, []);

    return (
        <nav className="relative bg-none shadow-md backdrop-blur-xs z-[999]"> {/* Use a higher z-index if needed, e.g., z-[999] */}
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
                    <div className="md:hidden flex items-center z-[1000]"> {/* Ensure button is above mobile menu */}
                        <button
                            onClick={handleToggleMenu}
                            className="text-black hover:text-[#E30B5D] focus:outline-none"
                            aria-controls="mobile-menu"
                            aria-expanded={isOpen}
                        >
                            {isOpen ? <FiX size={24} /> : <FiMenu size={24} />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Navigation */}
            {isOpen && (
        <div className="md:hidden backdrop-blur-xs flex flex-col h-screen items-center mt-[-50px] justify-center ">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.path}
                className={`${router.pathname === item.path ? 'bg-[#E30B5D] text-white' : 'text-black hover:bg-gray-100'} block px-3 py-2 rounded-md text-base text-[34px]`}
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