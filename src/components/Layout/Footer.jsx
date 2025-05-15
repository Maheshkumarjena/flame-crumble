import Link from 'next/link';

const Footer = () => {
  const footerLinks = [
    { title: 'About Us', links: ['Our Story', 'Team', 'Sustainability'] },
    { title: 'Customer Care', links: ['Contact', 'Shipping', 'Returns', 'FAQ'] },
    { title: 'Legal', links: ['Terms', 'Privacy', 'Cookies'] },
  ];

  return (
    <footer className="bg-black text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {footerLinks.map((section) => (
            <div key={section.title} className="space-y-4">
              <h3 className="text-lg font-semibold">{section.title}</h3>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link}>
                    <Link href={`/${link.toLowerCase().replace(' ', '-')}`} className="hover:text-[#E30B5D] transition-colors">
                      {link}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Newsletter</h3>
            <p className="text-gray-400">Subscribe for updates and promotions</p>
            <div className="flex">
              <input
                type="email"
                placeholder="Your email"
                className="px-4 py-2 w-full rounded-l focus:outline-none text-black"
              />
              <button className="bg-[#E30B5D] px-4 py-2 rounded-r hover:bg-[#c5094f] transition-colors">
                Subscribe
              </button>
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center space-x-4 mb-4 md:mb-0">
            {/* Social icons would go here */}
            <span className="text-gray-400">Follow us:</span>
            <a href="#" className="text-gray-400 hover:text-[#E30B5D]">Instagram</a>
            <a href="#" className="text-gray-400 hover:text-[#E30B5D]">Facebook</a>
            <a href="#" className="text-gray-400 hover:text-[#E30B5D]">Twitter</a>
          </div>
          <p className="text-gray-400">© {new Date().getFullYear()} flame&crumble. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;