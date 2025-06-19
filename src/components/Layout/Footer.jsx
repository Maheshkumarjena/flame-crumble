import Link from 'next/link';

/**
 * Renders a simple footer component with navigation links, a "Developed by" credit with WhatsApp link, and copyright.
 *
 * @param {object} props - The component props.
 * @param {string} [props.backgroundColor='bg-black'] - Tailwind CSS class for the footer background color.
 * @param {string} [props.textColor='text-white'] - Tailwind CSS class for the main text color.
 * @param {string} [props.hoverColor='hover:text-[#E30B5D]'] - Tailwind CSS class for link hover color.
 * @param {Array<object>} [props.navigationLinks] - An array of objects for main navigation links.
 * Each object should have:
 * - `name`: string (The display name of the link)
 * - `path`: string (The URL path for the link)
 * @param {string} [props.whatsappNumber] - The WhatsApp number to link to (e.g., '919876543210').
 * @param {string} [props.copyrightText] - The copyright text to display.
 */
const Footer = ({
  backgroundColor = 'bg-black',
  textColor = 'text-white',
  hoverColor = 'hover:text-[#E30B5D]',
  navigationLinks = [
    { name: 'Home', path: '/' },
    { name: 'Shop', path: '/shop' },
    { name: 'About', path: '/about' },
    { name: 'Contact', path: '/contact' },
  ],
  whatsappNumber = '919876543210', // **Replace with your actual WhatsApp number, including country code**
  copyrightText = `© ${new Date().getFullYear()} flame&crumble. All rights reserved.`,
}) => {
  const whatsappLink = `https://wa.me/${whatsappNumber}`;

  return (
    <footer className={`${backgroundColor} ${textColor} py-8`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center">
        {/* Navigation Links */}
        <nav className="flex space-x-6 mb-4 md:mb-0">
          {navigationLinks.map((link) => (
            <Link key={link.name} href={link.path} className={`${hoverColor} transition-colors text-sm`}>
              {link.name}
            </Link>
          ))}
        </nav>

        {/* Developed By and Copyright Text */}
        <div className="flex flex-col items-center md:items-end space-y-2">
          <p className="text-gray-400 text-sm">
            Developed by:{' '}
            <a
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className={`${hoverColor} transition-colors`}
            >
              Mahesh Kumar Jena
            </a>
          </p>
          <p className="text-gray-400 text-sm">{copyrightText}</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;