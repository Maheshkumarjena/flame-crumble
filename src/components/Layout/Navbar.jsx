"use client";
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useCallback, useEffect } from 'react';
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
        <nav className="relative bg-none shadow-md backdrop-blur-xs z-[999]">
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
                        <hr/>
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
                    <div className="md:hidden flex items-center z-[1000]">
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
            <div
                className={`md:hidden  mt-[-60] mb-40 left-0 w-full backdrop-blur-[10px] z-200 flex flex-col items-center justify-center transition-all duration-300 ease-in-out ${
                    isOpen ? 'h-screen opacity-100 translate-y-0' : 'h-0 opacity-0 -translate-y-full'
                } overflow-hidden`} // Added overflow-hidden to hide content when collapsed
            >
                {isOpen && ( // Render content only when menu is open to allow transition to complete
                    <div className="px-2 pt-2 pb-3 space-y-4 sm:px-3 text-center">
                        {navItems.map((item) => (
                            <Link
                                key={item.name}
                                href={item.path}
                                className={`${
                                    router.pathname === item.path ? 'bg-[#E30B5D] text-white' : 'text-black'
                                } block px-6 py-3 rounded-md text-base text-[34px] border border-transparent hover:border-[#E30B5D] hover:scale-105 transition-all duration-200 ease-in-out`}
                                onClick={handleMobileLinkClick} // Use the new handler
                            >
                                {item.name}
                            </Link>
                        ))}
                        <div className="flex justify-center space-x-6 px-3 py-2 mt-4">
                            <Link href="/wishlist" className="text-black hover:text-[#E30B5D]" onClick={handleMobileLinkClick}>
                                <FiHeart size={28} />
                            </Link>
                            <Link href="/cart" className="text-black hover:text-[#E30B5D]" onClick={handleMobileLinkClick}>
                                <FiShoppingCart size={28} />
                            </Link>
                            <Link href="/account" className="text-black hover:text-[#E30B5D]" onClick={handleMobileLinkClick}>
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