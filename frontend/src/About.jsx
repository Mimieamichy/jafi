const About = () => {
    return (
      <section className="bg-gray-100 py-16 px-6 md:px-12 lg:px-24">
        <div className="max-w-4xl mx-auto text-center">
          {/* Title */}
          <h2 className="text-4xl font-bold text-gray-900 mb-6">
            Discover, Hire, and Advertise with Confidence
          </h2>
          
          {/* Description */}
          <p className="text-lg text-gray-700 mb-6">
            Our platform empowers you with <span className="font-semibold">authentic reviews</span>,  
            seamless <span className="font-semibold">hiring opportunities</span>, and effective  
            <span className="font-semibold"> business advertising</span>. Whether you're looking for 
            trusted professionals, genuine feedback, or a better way to promote your business,  
            we’ve got you covered!
          </p>
  
          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left mt-8">
            {/* Feature 1 */}
            <div className="p-6 bg-white shadow-md rounded-lg">
              <h3 className="text-xl font-semibold text-gray-800">Genuine Reviews</h3>
              <p className="text-gray-600 mt-2">Get real insights from users about various businesses, services, and products.</p>
            </div>
  
            {/* Feature 2 */}
            <div className="p-6 bg-white shadow-md rounded-lg">
              <h3 className="text-xl font-semibold text-gray-800">Smart Hiring</h3>
              <p className="text-gray-600 mt-2">Find and hire professionals based on expertise and verified feedback.</p>
            </div>
  
            {/* Feature 3 */}
            <div className="p-6 bg-white shadow-md rounded-lg">
              <h3 className="text-xl font-semibold text-gray-800">Effective Advertising</h3>
              <p className="text-gray-600 mt-2">Boost your brand visibility by reaching the right audience.</p>
            </div>
          </div>
  
          {/* CTA Button */}
          <div className="mt-10">
            <a href="/signup" className="px-6 py-3 bg-blue-600 text-white text-lg rounded-lg shadow-md hover:bg-blue-700 transition">
              Get Started
            </a>
          </div>
        </div>
      </section>
    );
  };
  
  export default About;
  