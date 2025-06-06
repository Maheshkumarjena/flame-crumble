

'use client';
import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Navbar from '@/components/Layout/Navbar';
import Footer from '@/components/Layout/Footer';
import WishlistItem from '@/components/Wishlist/WishlistItem';

export default function Wishlist() {
  // In a real app, this would come from context or API
  const [wishlistItems, setWishlistItems] = useState([
    {
      id: 1,
      name: 'Ceramic Vase',
      variant: 'Beige / Medium',
      price: 49.99,
      image: '/images/ceramic-vase.jpg',
    },
    {
      id: 2,
      name: 'Scented Candle',
      variant: 'Vanilla / Large',
      price: 35.00,
      image: '/images/scented-candle.jpg',
    },
    {
      id: 3,
      name: 'Throw Pillow',
      variant: 'Dusty Rose',
      price: 29.99,
      image: '/images/throw-pillow.jpg',
    },
    {
      id: 4,
      name: 'Wall Art Print',
      variant: 'Abstract / 18×24"',
      price: 89.99,
      image: '/images/wall-art.jpg',
    },
  ]);

  const removeItem = (id) => {
    setWishlistItems(prevItems => prevItems.filter(item => item.id !== id));
  };

  const moveToCart = (id) => {
    // In a real app, this would update the cart via API
    console.log(`Moving item ${id} to cart`);
    removeItem(id);
  };

  return (
    <>
      <Head>
        <title>My Wishlist | flame&crumble</title>
        <meta name="description" content="Your saved items" />
      </Head>
      
      
      <main className="min-h-screen py-18 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className='absolute opacity-100 z-100 inset-0'>
                <Navbar />
    {/* <div className="border-b border-gray-200 mt-0"></div> */}
    {/* <hr/> */}

          </div>
        {/* <h1 className="text-3xl font-bold mb-8">flame&crumble</h1> */}
        
        <div className="mb-8">
          <h2 className="text-2xl font-semibold">My Wishlist</h2>
          <p className="text-gray-600">{wishlistItems.length} items saved</p>
        </div>
        
        {wishlistItems.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-lg mb-4">Your wishlist is empty</p>
            <Link 
              href="/shop" 
              className="inline-block bg-[#E30B5D] hover:bg-[#c5094f] text-white px-6 py-2 rounded font-medium transition-colors"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {wishlistItems.map(item => (
              <WishlistItem
                key={item.id}
                item={item}
                onMoveToCart={moveToCart}
                onRemove={removeItem}
              />
            ))}
          </div>
        )}
      </main>
      
      <Footer />
    </>
  );
}