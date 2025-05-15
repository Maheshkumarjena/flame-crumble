import Head from 'next/head';
import Navbar from '../components/Layout/Navbar';
import Footer from '../components/Layout/Footer';
import Link from 'next/link';
import Image from 'next/image';

export default function Home() {
  return (
    <>
      <Head>
        <title>flame&crumble | Handcrafted Delights</title>
        <meta name="description" content="Premium handcrafted candles, cookies, and chocolates" />
      </Head>
      
      <Navbar />
      
      <main>
        {/* Hero Section */}
        <section className="relative h-screen flex items-center justify-center bg-black text-white">
          <div className="absolute inset-0">
            <Image
              src="/images/hero-bg.jpg"
              alt="Handcrafted delights"
              fill
              className="object-cover opacity-50"
            />
          </div>
          <div className="relative z-10 text-center px-4">
            <h1 className="text-4xl md:text-6xl font-bold mb-4">Handcrafted Delights</h1>
            <p className="text-xl md:text-2xl mb-8 max-w-2xl mx-auto">
              Dreams for refined yourself, works, and home
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link 
                href="/shop" 
                className="bg-[#E30B5D] hover:bg-[#c5094f] text-white px-8 py-3 rounded-full text-lg font-medium transition-colors"
              >
                Shop Now
              </Link>
              <Link 
                href="/about" 
                className="bg-transparent hover:bg-white hover:text-black border-2 border-white text-white px-8 py-3 rounded-full text-lg font-medium transition-colors"
              >
                Our Story
              </Link>
            </div>
          </div>
        </section>
        
        {/* Collections Section */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Our Collections</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: 'Candles',
                description: 'Discover Comfort',
                image: '/images/candles.jpg',
                link: '/shop?category=candles',
              },
              {
                title: 'Cookies',
                description: 'Take Our Cookies',
                image: '/images/cookies.jpg',
                link: '/shop?category=cookies',
              },
              {
                title: 'Artisan Chocolates',
                description: 'Indulge in Chocolates',
                image: '/images/chocolates.jpg',
                link: '/shop?category=chocolates',
              },
            ].map((collection) => (
              <div key={collection.title} className="relative group overflow-hidden rounded-lg">
                <Image
                  src={collection.image}
                  alt={collection.title}
                  width={600}
                  height={400}
                  className="w-full h-64 object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black bg-opacity-40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <h3 className="text-2xl font-bold text-white">{collection.title}</h3>
                  <p className="text-white mb-4">{collection.description}</p>
                  <Link 
                    href={collection.link}
                    className="bg-[#E30B5D] hover:bg-[#c5094f] text-white px-6 py-2 rounded-full text-sm font-medium transition-colors"
                  >
                    Shop Now
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>
        
        {/* Story Section */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto bg-gray-100">
          <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="md:w-1/2">
              <Image
                src="/images/story.jpg"
                alt="Our story"
                width={600}
                height={400}
                className="rounded-lg shadow-lg"
              />
            </div>
            <div className="md:w-1/2">
              <h2 className="text-3xl font-bold mb-6">Our Story</h2>
              <p className="text-lg mb-6">
                At flame&crumble, we pour our hearts into crafting exceptional experiences. Every 
                candle is hand-poured, every cookie is thoughtfully baked, and every chocolate is 
                meticulously created to bring joy to your everyday moments.
              </p>
              <Link 
                href="/about" 
                className="inline-block bg-black hover:bg-gray-800 text-white px-6 py-3 rounded-full font-medium transition-colors"
              >
                Learn More About Our Story
              </Link>
            </div>
          </div>
        </section>
        
        {/* Corporate Gifting CTA */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6">Corporate Gifting</h2>
          <p className="text-xl mb-8 max-w-3xl mx-auto">
            Elevate your corporate gifts with our courage and talent
          </p>
          <Link 
            href="/corporate" 
            className="inline-block bg-[#E30B5D] hover:bg-[#c5094f] text-white px-8 py-3 rounded-full text-lg font-medium transition-colors"
          >
            Explore Corporate Gifts
          </Link>
        </section>
      </main>
      
      <Footer />
    </>
  );
}