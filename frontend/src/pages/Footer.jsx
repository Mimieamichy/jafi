import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPhone, faEnvelope } from "@fortawesome/free-solid-svg-icons";
import {
  faWhatsapp,
  faFacebookF,
  faTwitter,
  faInstagram,
} from "@fortawesome/free-brands-svg-icons";

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white py-10">
      <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between">
        {/* Logo */}
        <a href="/" className="mb-6 md:mb-0">
        <img src="../jafi.png" alt="Logo" className="h-10 w-auto" />
        </a>

        {/* Contact Details */}
        <div className="text-center md:text-left ">
          <p className="text-4xl font-bold p-4">Contact Us</p>
          <div className="flex items-center justify-center md:justify-start space-x-3 mt-2">
            <FontAwesomeIcon icon={faPhone} />
            <span>+123 456 7890</span>
          </div>
          <div className="flex items-center justify-center md:justify-start space-x-3 mt-2">
            <FontAwesomeIcon icon={faEnvelope} />
            <span>info@example.com</span>
          </div>
        </div>

        {/* Social Media Links */}
        <div className="flex space-x-4 mt-6 md:mt-0">
          <a href="#" className="text-white text-xl hover:text-blue-500">
            <FontAwesomeIcon icon={faWhatsapp} />
          </a>
          <a href="#" className="text-white text-xl hover:text-blue-500">
            <FontAwesomeIcon icon={faFacebookF} />
          </a>
          <a href="#" className="text-white text-xl hover:text-blue-500">
            <FontAwesomeIcon icon={faTwitter} />
          </a>
          <a href="#" className="text-white text-xl hover:text-blue-500">
            <FontAwesomeIcon icon={faInstagram} />
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
