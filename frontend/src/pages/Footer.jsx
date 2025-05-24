import { useState } from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import privacyChoices from "../assets/jafi privacy choice.pdf";
import privacyPolicy from "../assets/jafi Privacy Policy 3.pdf";
import termsOfService from "../assets/jafi Terms of Service.pdf";
import trustAndSafety from "../assets/jafi Trust and safety.pdf";
import { faTimes } from "@fortawesome/free-solid-svg-icons";
import { faPhone, faEnvelope } from "@fortawesome/free-solid-svg-icons";
import {
  faWhatsapp,
  faFacebookF,
  faInstagram,
  faTiktok,
  faXTwitter,
} from "@fortawesome/free-brands-svg-icons";

const docs = {
  "Privacy Choices": privacyChoices,
  "Trust & Safety": trustAndSafety,
  "Privacy Policy": privacyPolicy,
  "Terms of Service": termsOfService,
};

export default function Footer() {
  const docTitles = Object.keys(docs);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(null);

  const openModal = (index) => {
    setSelectedIndex(index);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedIndex(null);
  };

  const handleSelect = (e) => {
    const index = docTitles.indexOf(e.target.value);
    if (index !== -1) openModal(index);
  };

  const selectedDoc =
    selectedIndex !== null ? docs[docTitles[selectedIndex]] : null;

  return (
    <footer className="bg-gray-900 text-white py-10">
      <p className="text-2xl sm:text-3xl font-bold mb-4 text-center">
        Contact Us
      </p>
      <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
        {/* logo */}
        <a href="/" className="shrink-0">
          <img src="../logo.png" alt="JAFI logo" className="h-16 w-auto" />
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
              className="hover:underline text-white"
            >
              info@jafi.ai
            </a>
          </div>
          <div className="flex items-center justify-center md:justify-start space-x-3 mt-2">
            <FontAwesomeIcon
              icon={faWhatsapp}
              className="text-white text-xl hover:text-green-400"
            />

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
          <a
            href="https://www.tiktok.com/@jafi.ai?_t=ZM-8vThF855inF&_r=1"
            target="_blank"
            rel="noreferrer"
            className="hover:text-pink-500"
          >
            <FontAwesomeIcon icon={faTiktok} />
          </a>
        </div>

        {/* policy dropdown */}
        <div>
          {/* Dropdown */}
          <select
            onChange={handleSelect}
            defaultValue=""
            className="bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="" disabled>
              Legal &amp; Policies…
            </option>
            {docTitles.map((title) => (
              <option key={title} value={title}>
                {title}
              </option>
            ))}
          </select>

          {/* Modal */}
          {modalOpen && (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 transition-opacity"
              onClick={closeModal}
            >
              <div
                onClick={(e) => e.stopPropagation()} // Prevent close on iframe click
                className="relative w-[90%] max-w-4xl bg-white rounded-lg shadow-xl overflow-hidden animate-fade-in"
              >
                {/* Close button */}
                <button
                  onClick={closeModal}
                  className="absolute top-2 right-2 text-gray-600 hover:text-red-600 text-xl"
                >
                  <FontAwesomeIcon icon={faTimes} />
                </button>

                {/* Navigation */}
                <div className="flex justify-between items-center p-3 border-b text-sm text-gray-600">
                  <button
                    disabled={selectedIndex === 0}
                    onClick={() => setSelectedIndex((i) => i - 1)}
                    className={`px-3 py-1 rounded hover:bg-gray-200 disabled:opacity-30`}
                  >
                    ← Previous
                  </button>
                  <span className="font-medium">
                    {docTitles[selectedIndex]}
                  </span>
                  <button
                    disabled={selectedIndex === docTitles.length - 1}
                    onClick={() => setSelectedIndex((i) => i + 1)}
                    className={`px-3 py-1 rounded hover:bg-gray-200 disabled:opacity-30`}
                  >
                    Next →
                  </button>
                </div>

                {/* PDF iframe */}
                <iframe
                  src={selectedDoc}
                  className="w-full h-[80vh]"
                  title="Policy Document"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </footer>
  );
}
