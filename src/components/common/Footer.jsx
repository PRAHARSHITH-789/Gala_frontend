import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white mt-20">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* About */}
          <div>
            <h3 className="text-xl font-bold mb-4">EventHub</h3>
            <p className="text-gray-400">
              Discover and book tickets for the best events in your city.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li><Link to="/events" className="text-gray-400 hover:text-white">Browse Events</Link></li>
              <li><Link to="/about" className="text-gray-400 hover:text-white">About Us</Link></li>
              <li><Link to="/contact" className="text-gray-400 hover:text-white">Contact</Link></li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Categories</h4>
            <ul className="space-y-2">
              <li><span className="text-gray-400 hover:text-white cursor-pointer">Music</span></li>
              <li><span className="text-gray-400 hover:text-white cursor-pointer">Sports</span></li>
              <li><span className="text-gray-400 hover:text-white cursor-pointer">Food</span></li>
              <li><span className="text-gray-400 hover:text-white cursor-pointer">Arts</span></li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Follow Us</h4>
            <div className="flex space-x-4">
              <FaFacebook className="text-2xl cursor-pointer hover:text-blue-500" />
              <FaTwitter className="text-2xl cursor-pointer hover:text-blue-400" />
              <FaInstagram className="text-2xl cursor-pointer hover:text-pink-500" />
              <FaLinkedin className="text-2xl cursor-pointer hover:text-blue-600" />
            </div>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; 2025 GALA. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;