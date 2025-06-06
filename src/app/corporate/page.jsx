"use client";
import { useState } from 'react';
import Head from 'next/head';
import Navbar from '@/components/Layout/Navbar';
import Footer from '@/components/Layout/Footer';
import CorporateForm from '@/components/Form/CorporateForm';

export default function Corporate() {
  const [formData, setFormData] = useState({
    companyName: '',
    email: '',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // In a real app, this would be an API call
    try {
      console.log('Form submitted:', formData);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSubmitted(true);
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  return (
    <>
      <Head>
        <title>Corporate Gifting | flame&crumble</title>
        <meta name="description" content="Corporate gifting solutions" />
      </Head>
      
      
      <main className="min-h-screen py-18 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className='absolute opacity-100 z-100 inset-0'>
                <Navbar />

          </div>
        <h1 className="text-3xl font-bold mb-8">Corporate Gifting Solutions</h1>
        <p className="text-xl mb-12 max-w-3xl">
          Delight your clients and employees with premium, customized gift experiences.
        </p>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-semibold mb-6">Our Corporate Services</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold mb-3">Bulk Orders</h3>
                <p className="text-gray-600">
                  Custom gift solutions for large-scale corporate events and celebrations.
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold mb-3">Personalization</h3>
                <p className="text-gray-600">
                  Brand-aligned packaging and customized messaging options.
                </p>
              </div>
            </div>
            
            <div className="mb-12">
              <h3 className="text-lg font-semibold mb-3">Customization Options</h3>
              <ul className="list-disc pl-5 space-y-2">
                <li>Custom packaging design</li>
                <li>Personalized message cards</li>
                <li>Bulk quantity options</li>
              </ul>
            </div>
            
            <div className="mb-12">
              <h3 className="text-lg font-semibold mb-3">Perfect For</h3>
              <div className="flex flex-wrap gap-4">
                <span className="bg-gray-100 px-4 py-2 rounded-full">Corporate Events</span>
                <span className="bg-gray-100 px-4 py-2 rounded-full">Employee Recognition</span>
                <span className="bg-gray-100 px-4 py-2 rounded-full">Client Appreciation</span>
              </div>
            </div>
            
            <div className="bg-gray-100 p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-3">PAN India Delivery</h3>
              <p>
                We deliver corporate gifts across all major cities in India.
              </p>
            </div>
          </div>
          
          <div className="lg:col-span-1">
            <h2 className="text-2xl font-semibold mb-6">Get Started Today</h2>
            
            {submitted ? (
              <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
                Thank you for your inquiry! We'll get back to you soon.
            </div>
            ) : (
              <CorporateForm 
                formData={formData}
                onChange={handleChange}
                onSubmit={handleSubmit}
              />
            )}
          </div>
        </div>
      </main>
      
      <Footer />
    </>
  );
}