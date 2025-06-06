import Head from 'next/head';
import Link from 'next/link';
import Navbar from '@/components/Layout/Navbar';
import Footer from '@/components/Layout/Footer';
import Image from 'next/image';

export default function AboutPage() {
  return (
    <>
      <Head>
        <title>About Us | flame&crumble</title>
        <meta name="description" content="Our story and mission" />
      </Head>

      {/* Navbar is now placed directly.
        If your Navbar component is fixed/sticky, you'll want to ensure
        the main content has enough top padding/margin to not be hidden underneath it.
        For a typical static header, this placement is standard.
        If it's fixed, uncomment the next line and add a 'pt-20' (or appropriate value)
        to your <main> element, depending on your Navbar's height.
      */}

      <main className="min-h-screen flex z-300 flex-col"> {/* Removed min-w-screen and overflow-x-hidden */}
        {/* Hero Section */}
        <div className='absolute opacity-100 z-100 inset-0'>
<Navbar textColor="text-white" />

        </div>
        {/* Hero Section */}
        <section className="relative bg-black text-white py-20">
          <div className="absolute inset-0 opacity-50">
            <Image
              src="/ourStory.avif"
              alt="About flame&crumble"
              fill
              className="object-cover"
            />
          </div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center py-16">
            <h1 className="text-4xl md:text-6xl font-bold mb-4">Our Story</h1>
            <p className="text-xl md:text-2xl max-w-3xl mx-auto">
              Handcrafted with love in London since 2015
            </p>
          </div>
        </section>

        {/* Mission Section */}
        <section className="py-18 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="md:w-1/2">
              <Image
                src="/images/about-mission.jpg"
                alt="Our mission"
                width={600}
                height={400}
                className="rounded-lg shadow-lg w-full h-auto" // Added w-full h-auto for better responsiveness
                sizes="(max-width: 768px) 100vw, 50vw" // Added sizes prop
              />
            </div>
            <div className="md:w-1/2">
              <h2 className="text-3xl font-bold mb-6">Our Mission</h2>
              <p className="text-lg mb-6">
                At flame&crumble, we pour our hearts into crafting exceptional experiences.
                Every candle is hand-poured, every cookie is thoughtfully baked, and every
                chocolate is meticulously created to bring joy to your everyday moments.
              </p>
              <p className="text-lg mb-6">
                We believe in sustainable practices, ethical sourcing, and creating products
                that not only delight the senses but also respect our planet.
              </p>
              <Link
                href="/shop"
                className="inline-block bg-[#E30B5D] hover:bg-[#c5094f] text-white px-6 py-3 rounded-full font-medium transition-colors"
              >
                Shop Our Collections
              </Link>
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section className="py-18 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto bg-gray-100 rounded-lg"> {/* Added rounded-lg for consistency if desired */}
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Meet Our Team</h2>
            <p className="text-lg max-w-2xl mx-auto">
              Passionate artisans dedicated to creating your favorite products
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                name: 'Emma Wilson',
                role: 'Founder & Chocolatier',
                bio: 'With a background in pastry arts, Emma brings creativity and precision to our chocolate creations.',
                image: '/images/team-emma.jpg',
              },
              {
                name: 'James Carter',
                role: 'Head Baker',
                bio: 'James has been perfecting cookie recipes for over a decade, ensuring every bite is perfect.',
                image: '/images/team-james.jpg',
              },
              {
                name: 'Sophia Lee',
                role: 'Candle Artisan',
                bio: 'Sophia combines her chemistry knowledge with artistic flair to create our signature scents.',
                image: '/images/team-sophia.jpg',
              },
            ].map((member) => (
              <div key={member.name} className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="relative h-64 w-full">
                  <Image
                    src={member.image}
                    alt={member.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" // Added sizes prop
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-1">{member.name}</h3>
                  <p className="text-[#E30B5D] font-medium mb-3">{member.role}</p>
                  <p className="text-gray-600">{member.bio}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Values Section */}
        <section className="py-18 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Our Values</h2>
            <p className="text-lg max-w-2xl mx-auto">
              What guides everything we do at flame&crumble
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: 'Quality',
                description: 'We use only the finest ingredients and materials, never compromising on quality.',
                icon: '✨',
              },
              {
                title: 'Sustainability',
                description: 'From packaging to production, we prioritize eco-friendly practices.',
                icon: '🌱',
              },
              {
                title: 'Community',
                description: 'We support local suppliers and give back to our community.',
                icon: '👥',
              },
            ].map((value) => (
              <div key={value.title} className="bg-white p-6 rounded-lg shadow text-center">
                <div className="text-4xl mb-4">{value.icon}</div>
                <h3 className="text-xl font-bold mb-2">{value.title}</h3>
                <p className="text-gray-600">{value.description}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}