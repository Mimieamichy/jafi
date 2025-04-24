import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import privacyChoices from "../assets/jafi privacy choice.pdf";
import privacyPolicy from "../assets/jafi Privacy Policy 3.pdf";
import termsOfService from "../assets/jafi Terms of Service.pdf";
import trustAndSafety from "../assets/jafi Trust and safety.pdf";
import { faPhone, faEnvelope } from "@fortawesome/free-solid-svg-icons";
import {
  faWhatsapp,
  faFacebookF,
  faInstagram,
  faTiktok,
  faXTwitter
} from "@fortawesome/free-brands-svg-icons";

const docs = {
  "Privacy Choices": privacyChoices,
  "Trust & Safety": trustAndSafety,
  "Privacy Policy": privacyPolicy,
  "Terms of Service": termsOfService,
};

export default function Footer() {
  const [doc, setDoc] = useState("");

  const handleSelect = (e) => {
    const val = e.target.value;
    setDoc(val);
    if (docs[val]) window.open(docs[val], "_blank", "noopener,noreferrer");
  };

  return (
    <footer className="bg-gray-900 text-white py-10">
      <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
      <p className="text-2xl sm:text-3xl font-bold mb-4">Contact Us</p>
        {/* logo */}
        <a href="/" className="shrink-0">
          <img src="/jafi.png" alt="JAFI logo" className="h-10 w-auto" />
        </a>

        {/* contact */}
        <div className="text-center md:text-right">
         
          <div className="flex justify-center md:justify-start items-center space-x-2">

            <FontAwesomeIcon icon={faPhone} />
            <span className="tracking-wide">
              <a href="tel:08070446107" className="hover:underline">
                08070446107
              </a>
              
            </span>
          </div>
          {/* Contact details */}
          <div className="flex items-center justify-center cursor-pointer md:justify-start space-x-3 mt-2">
            <FontAwesomeIcon icon={faEnvelope} />
           
            <a
              href="mailto:info@jafi.ai"
              className="hover:underline text-white" /* optional styling */
            >
              info@jafi.ai
            </a>
          </div>
          <div className="flex items-center justify-center md:justify-start space-x-3 mt-2">
            <FontAwesomeIcon icon={faWhatsapp} className="text-white text-xl"/>
            
            <a
            href="https://wa.me/message/3PF6SWGMJXQCE1"
            target="_blank"
            rel="noreferrer"
            className="hover:text-blue-500"
          >
            <span className="fi fi-ng mr-2" />
          </a>
            <a
            href="https://wa.me/qr/NYBXMQBAOYCRJ1"
            target="_blank"
            rel="noreferrer"
            className="hover:text-blue-500"
          >
            <span className="fi fi-ke mr-2" />
          </a>
            <a
            href="https://wa.link/6h9p7p"
            target="_blank"
            rel="noreferrer"
            className="hover:text-blue-500"
          >
            <span className="fi fi-za mr-2" />
          </a>
            
           
          
            
          </div>
        </div>

        {/* social icons */}
        <div className="flex space-x-4 text-xl">
        <span className="flag-icon flag-icon-ng" />
          
          <a
            href="https://www.facebook.com/share/1C3e1PUmiP/?mibextid=wwXIfr"
            target="_blank"
            rel="noreferrer"
            className="hover:text-blue-500"
          >
            <FontAwesomeIcon icon={faFacebookF} />
          </a>
          <a
            href="https://www.tiktok.com/@jafi.ai?_t=ZM-8vThF855inF&_r=1"
            target="_blank"
            rel="noreferrer"
            className="hover:text-pink-500"
          >
            <FontAwesomeIcon icon={faTiktok} />
          </a>
          <a
            href="https://www.instagram.com/jafi.ai?igsh=MTRvNHFvcGl0YXdmcg==&utm_source=qr"
            target="_blank"
            rel="noreferrer"
            className="hover:text-pink-400"
          >
            <FontAwesomeIcon icon={faInstagram} />
          </a>
          <a
            href="https://x.com/jafiai?s=21"
            target="_blank"
            rel="noreferrer"
            className="hover:text-blue-500"
          >
            <FontAwesomeIcon icon={faXTwitter} />
          </a>
        </div>

        {/* policy dropdown */}
        <select
          value={doc}
          onChange={handleSelect}
          className="bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="" disabled>
            Legal &amp; Policies…
          </option>
          {Object.keys(docs).map((title) => (
            <option key={title} value={title}>
              {title}
            </option>
          ))}
        </select>
      </div>
    </footer>
  );
}
