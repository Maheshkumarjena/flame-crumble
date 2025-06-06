import Link from 'next/link';

/**
 * Renders a dynamic footer component.
 *
 * @param {object} props - The component props.
 * @param {string} [props.backgroundColor='bg-black'] - Tailwind CSS class for the footer background color.
 * @param {string} [props.textColor='text-white'] - Tailwind CSS class for the main text color.
 * @param {string} [props.hoverColor='hover:text-[#E30B5D]'] - Tailwind CSS class for link hover color.
 * @param {Array<object>} [props.sections] - An array of objects, each representing a footer section.
 * Each object should have:
 * - `title`: string (The title of the section)
 * - `links`: Array<object> (An array of link objects, each with `name` and `path`)
 * @param {object} [props.newsletter] - Configuration for the newsletter section.
 * - `show`: boolean (Whether to display the newsletter section)
 * - `title`: string (Title of the newsletter section)
 * - `description`: string (Description text for the newsletter)
 * - `placeholder`: string (Placeholder text for the email input)
 * - `buttonText`: string (Text for the subscribe button)
 * @param {Array<object>} [props.socialLinks] - An array of objects for social media links.
 * Each object should have:
 * - `name`: string (e.g., 'Instagram', 'Facebook')
 * - `url`: string (The URL for the social media page)
 * @param {string} [props.copyrightText] - The copyright text to display.
 */
const Footer = ({
  backgroundColor = 'bg-black',
  textColor = 'text-white',
  hoverColor = 'hover:text-[#E30B5D]',
  sections = [
    {
      title: 'About Us',
      links: [
        { name: 'Our Story', path: '/our-story' },
        { name: 'Team', path: '/team' },
        { name: 'Sustainability', path: '/sustainability' },
      ],
    },
    {
      title: 'Customer Care',
      links: [
        { name: 'Contact', path: '/contact' },
        { name: 'Shipping', path: '/shipping' },
        { name: 'Returns', path: '/returns' },
        { name: 'FAQ', path: '/faq' },
      ],
    },
    {
      title: 'Legal',
      links: [
        { name: 'Terms', path: '/terms' },
        { name: 'Privacy', path: '/privacy' },
        { name: 'Cookies', path: '/cookies' },
      ],
    },
  ],
  newsletter = {
    show: true,
    title: 'Newsletter',
    description: 'Subscribe for updates and promotions',
    placeholder: 'Your email',
    buttonText: 'Subscribe',
  },
  socialLinks = [
    { name: 'Instagram', url: '#' },
    { name: 'Facebook', url: '#' },
    { name: 'Twitter', url: '#' },
  ],
  copyrightText = `© ${new Date().getFullYear()} flame&crumble. All rights reserved.`,
}) => {
  return (
    <footer className={`${backgroundColor} ${textColor} py-12`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"> {/* Adjusted grid for newsletter */}
          {/* Dynamically rendered footer sections */}
          {sections.map((section) => (
            <div key={section.title} className="space-y-4">
              <h3 className="text-lg font-semibold">{section.title}</h3>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.name}>
                    <Link href={link.path} className={`${hoverColor} transition-colors`}>
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Dynamically rendered Newsletter section */}
          {newsletter.show && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">{newsletter.title}</h3>
              <p className="text-gray-400">{newsletter.description}</p>
              <div className="flex">
                <input
                  type="email"
                  placeholder={newsletter.placeholder}
                  className="px-4 py-2 w-full rounded-l focus:outline-none text-black"
                />
                <button className="bg-[#E30B5D] px-4 py-2 rounded-r hover:bg-[#c5094f] transition-colors">
                  {newsletter.buttonText}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Bottom bar with social links and copyright */}
        <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center space-x-4 mb-4 md:mb-0">
            <span className="text-gray-400">Follow us:</span>
            {socialLinks.map((social) => (
              <a key={social.name} href={social.url} className={`text-gray-400 ${hoverColor}`}>
                {social.name}
              </a>
            ))}
          </div>
          <p className="text-gray-400">{copyrightText}</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
