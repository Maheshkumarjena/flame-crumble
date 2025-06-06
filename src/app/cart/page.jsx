'use client'
import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Navbar from '@/components/Layout/Navbar';
import Footer from '@/components/Layout/Footer';
import CartSummary from '@/components/Cart/CartSummary';
import CartItem from '@/components/Cart/CartItem';

export default function Cart() {
  // In a real app, this would come from context or API
  const [cartItems, setCartItems] = useState([
    {
      id: 1,
      name: 'Geometric Pattern Mug',
      variant: 'White/Black',
      price: 24.99,
      quantity: 1,
      image: '/images/mug.jpg',
    },
    {
      id: 2,
      name: 'Rustic Dinner Plate',
      variant: 'Natural/Beige',
      price: 29.99,
      quantity: 2,
      image: '/images/plate.jpg',
    },
    {
      id: 3,
      name: 'Minimalist Vase',
      variant: 'White',
      price: 39.99,
      quantity: 1,
      image: '/images/vase.jpg',
    },
  ]);

  const updateQuantity = (id, newQuantity) => {
    if (newQuantity < 1) return;
    
    setCartItems(prevItems =>
      prevItems.map(item =>
        item.id === id ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const removeItem = (id) => {
    setCartItems(prevItems => prevItems.filter(item => item.id !== id));
  };

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const shipping = 5.99;
  const total = subtotal + shipping;

  return (
    <>
      <Head>
        <title>Your Cart | flame&crumble</title>
        <meta name="description" content="Your shopping cart" />
      </Head>
      
      
      <main className="min-h-screen py-18 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className='absolute opacity-100 z-100 inset-0'>
                <Navbar />

          </div>
        <h1 className="text-3xl font-bold mb-8">flame&crumble</h1>
        
        <div className="flex flex-col lg:flex-row gap-12">
          <div className="lg:w-2/3">
            <h2 className="text-2xl font-semibold mb-6">Your Cart ({cartItems.length})</h2>
            
            {cartItems.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-lg mb-4">Your cart is empty</p>
                <Link 
                  href="/shop" 
                  className="inline-block bg-[#E30B5D] hover:bg-[#c5094f] text-white px-6 py-2 rounded font-medium transition-colors"
                >
                  Continue Shopping
                </Link>
              </div>
            ) : (
              <div className="space-y-6">
                {cartItems.map(item => (
                  <CartItem
                    key={item.id}
                    item={item}
                    onUpdateQuantity={updateQuantity}
                    onRemove={removeItem}
                  />
                ))}
              </div>
            )}
          </div>
          
          {cartItems.length > 0 && (
            <div className="lg:w-1/3">
              <CartSummary 
                subtotal={subtotal}
                shipping={shipping}
                total={total}
              />
              
          <div className="mt-6 space-y-4">
            <Link
              href="/checkout"
              className="block w-full bg-[#E30B5D] hover:bg-[#c5094f] text-white text-center py-3 rounded font-medium transition-colors"
            >
              Proceed to Checkout
            </Link>
            <Link
              href="/shop"
              className="block w-full bg-transparent hover:bg-gray-100 border border-black text-black text-center py-3 rounded font-medium transition-colors"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      )}
    </div>
  </main>
  
  <Footer />
</>
);
}