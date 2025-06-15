"use client";
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useCallback, useEffect } from 'react';
import { FiShoppingCart, FiHeart, FiUser, FiMenu, FiX } from 'react-icons/fi';
import { useSelector } from 'react-redux'; // Import useSelector for Redux
import { selectIsAdmin } from '@/lib/features/auth/authSlice';

// Helper function for scroll lock
const togglePageScroll = (disable) => {
    const body = document.body;
    if (disable) {
        body.style.overflow = 'hidden';
    } else {
        body.style.overflow = ''; // Resets to default
    }
};

const Navbar = ({ textColor = 'text-black' }) => {
    const [isOpen, setIsOpen] = useState(false);
    const router = useRouter();
    const isAdmin = useSelector(selectIsAdmin); // Get isAdmin state from Redux

    const baseNavItems = [
        { name: 'Home', path: '/' },
        { name: 'Shop', path: '/shop' },
        { name: 'Corporate', path: '/corporate' },
        { name: 'About', path: '/about' },
        { name: 'Contact', path: '/contact' },
    ];

    // Conditionally add Dashboard based on Redux isAdmin state
    const navItems = isAdmin
        ? [...baseNavItems, { name: 'Dashboard', path: '/admin/dashboard' }]
        : baseNavItems;

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
        <nav className="relative bg-none shadow-md backdrop-blur-xs z-[999]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-10">
                    <div className="flex items-center">
                        <Link href="/" className={`text-xl font-bold ${textColor}`}>
                            flame&crumble
                        </Link>
                    </div>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center space-x-8">
                        {navItems.map((item) => (
                            <Link
                                key={item.name}
                                href={item.path}
                                className={`${router.pathname === item.path ? 'text-[#E30B5D]' : textColor} hover:text-[#E30B5D] transition-colors`}
                            >
                                {item.name}
                            </Link>
                        ))}
                        <hr/>
                    </div>

                    <div className="hidden md:flex items-center space-x-6">
                        <Link href="/wishlist" className={`${textColor} hover:text-[#E30B5D]`}>
                            <FiHeart size={20} />
                        </Link>
                        <Link href="/cart" className={`${textColor} hover:text-[#E30B5D]`}>
                            <FiShoppingCart size={20} />
                        </Link>
                        <Link href="/account" className={`${textColor} hover:text-[#E30B5D]`}>
                            <FiUser size={20} />
                        </Link>
                    </div>

                    {/* Mobile menu button */}
                    <div className="md:hidden flex items-center z-[1000]">
                        <button
                            onClick={handleToggleMenu}
                            className={`${textColor} hover:text-[#E30B5D] focus:outline-none`}
                            aria-controls="mobile-menu"
                            aria-expanded={isOpen}
                        >
                            {isOpen ? <FiX size={24} /> : <FiMenu size={24} />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Navigation - MODIFIED FOR FULL SCREEN HEIGHT AND CONTENT PUSH */}
            {/* Removed absolute positioning to allow it to push content */}
            {/* Added h-screen when open to take full vertical space */}
            <div
                className={`md:hidden w-full backdrop-blur-[10px] z-200 flex flex-col items-center justify-center transition-all duration-300 ease-in-out ${
                    // Changed from max-h-screen/max-h-0 to h-screen/h-0 directly for full screen height
                    // The transition for height will work smoothly from h-0 to h-screen
                    isOpen ? 'h-screen opacity-100' : 'h-0 opacity-0'
                } overflow-hidden`}
            >
                {/* Only render content if isOpen to prevent layout shifts when h-0 */}
                {isOpen && (
                    <div className="px-2 pt-2 pb-3 space-y-4 sm:px-3 text-center">
                        {navItems.map((item) => (
                            <Link
                                key={item.name}
                                href={item.path}
                                className={`${
                                    router.pathname === item.path ? 'bg-[#E30B5D] text-white' : textColor
                                } block px-6 py-3 rounded-md text-base text-[34px] border border-transparent hover:border-[#E30B5D] hover:scale-105 transition-all duration-200 ease-in-out`}
                                onClick={handleMobileLinkClick}
                            >
                                {item.name}
                            </Link>
                        ))}
                        <div className="flex justify-center space-x-6 px-3 py-2 mt-4">
                            <Link href="/wishlist" className={`${textColor} hover:text-[#E30B5D]`} onClick={handleMobileLinkClick}>
                                <FiHeart size={28} />
                            </Link>
                            <Link href="/cart" className={`${textColor} hover:text-[#E30B5D]`} onClick={handleMobileLinkClick}>
                                <FiShoppingCart size={28} />
                            </Link>
                            <Link href="/account" className={`${textColor} hover:text-[#E30B5D]`} onClick={handleMobileLinkClick}>
                                <FiUser size={28} />
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </nav>
    );
};

export default Navbar;