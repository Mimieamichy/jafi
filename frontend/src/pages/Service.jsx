import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
 
  faPen,
  faUserTie,
  faStar,
} from "@fortawesome/free-solid-svg-icons";

const services = [
 
  { title: "Reviews", icon: faPen, link: "/review-page" },
  { title: "Hirings", icon: faUserTie, link: "/hire-profile" },
  { title: "Listed Business", icon: faStar, link: "/bus-profile" },
];

const Services = () => {
  return (
    <section className="bg-gray-100 py-16 px-6 md:px-12 lg:px-24">
      <div className="max-w-5xl mx-auto text-center">
        {/* Title */}
        <h2 className="text-4xl font-bold text-gray-900 mb-6">Our Services</h2>

        {/* Service Grid */}
        <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-3 gap-6 mt-8">
          {services.map((service, index) => (
            <a
              key={index}
              href={service.link}
              className="p-6 bg-white shadow-lg rounded-lg flex flex-col items-center transition hover:bg-gray-100"
            >
              <FontAwesomeIcon
                icon={service.icon}
                className="text-4xl text-blue-600 mb-4 transition "
              />
              <h3 className="text-xl font-semibold">{service.title}</h3>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Services;
