"use client";
import React, { useState } from 'react';
import { FaFacebook, FaInstagram, FaTwitter } from 'react-icons/fa';
import { IoMapOutline, IoMail, IoPhonePortrait, IoShieldCheckmarkSharp } from 'react-icons/io5'; // Changed import source
import Head from 'next/head';
import Navbar from '@/components/Layout/Navbar';
import Footer from '@/components/Layout/Footer';
import ContactForm from '@/components/Form/ContactForm';

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setSubmitted(true);
        setFormData({
          name: '',
          email: '',
          subject: '',
          message: '',
        });
      } else {
        throw new Error('Submission failed');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  return (
    <>
      <Head>
        <title>Contact Us | flame&crumble</title>
        <meta name="description" content="Get in touch with us" />
      </Head>

      <Navbar />

      <main className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold mb-4">Contact Us</h1>
          <p className="text-lg max-w-2xl mx-auto">
            Have questions or feedback? We&apos;d love to hear from you!
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div>
            <h2 className="text-2xl font-semibold mb-6">Send Us a Message</h2>

            {submitted ? (
              <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
                Thank you for your message! We&apos;ll get back to you soon.
              </div>
            ) : (
              <ContactForm
                formData={formData}
                onChange={handleChange}
                onSubmit={handleSubmit}
              />
            )}
          </div>

          <div>
            <h2 className="text-2xl font-semibold mb-6">Our Information</h2>

            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-2">Address</h3>
                <p className="text-gray-600">
                  <IoMapOutline className="inline-block mr-1 w-4 h-4" />
                  123 Artisan Lane
                  <br />
                  London, UK
                  <br />
                  SW1A 1AA
                </p>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-2">Contact Details</h3>
                <p className="text-gray-600">
                  <IoMail className="inline-block mr-1 w-4 h-4" />
                  <strong>Email:</strong> hello@flameandcrumble.com
                  <br />
                  <IoPhonePortrait className="inline-block mr-1 w-4 h-4" />
                  <strong>Phone:</strong> +44 20 1234 5678
                </p>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-2">Business Hours</h3>
                <p className="text-gray-600">
                  <IoShieldCheckmarkSharp className="inline-block mr-1 w-4 h-4" />
                  Monday - Friday: 9am - 6pm
                  <br />
                  Saturday: 10am - 4pm
                  <br />
                  Sunday: Closed
                </p>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-2">Follow Us</h3>
                <div className="flex space-x-4">
                  <a href="#" className="text-gray-600 hover:text-[#E30B5D]" aria-label="Facebook">
                    <FaFacebook className="h-6 w-6" />
                  </a>
                  <a href="#" className="text-gray-600 hover:text-[#E30B5D]" aria-label="Instagram">
                    <FaInstagram className="h-6 w-6" />
                  </a>
                  <a href="#" className="text-gray-600 hover:text-[#E30B5D]" aria-label="Twitter">
                    <FaTwitter className="h-6 w-6" />
                  </a>
                </div>
              </div>
            </div>

            <div className="mt-8">
              <h3 className="text-lg font-medium mb-2">Find Us</h3>
              <div className="aspect-w-16 aspect-h-9 bg-gray-100 rounded-lg overflow-hidden">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2483.5404230563996!2d-0.12775868422990985!3d51.50073217963436!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x487604c38c8cd1d9%3A0xb78f2474b9a45aa9!2sBig%20Ben!5e0!3m2!1sen!2suk!4v1620000000000!5m2!1sen!2suk"
                  width="600"
                  height="450"
                  style={{ border: 0 }}
                  allowFullScreen=""
                  loading="lazy"
                  className="w-full h-64"
                ></iframe>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
};

export default ContactPage;
