import { useState } from "react";

const BusinessListing = ({ onBusinessSubmit }) => {
  const [formData, setFormData] = useState({
    name: "",
    image: null,
    time: "",
    category: "",
    address: "",
    isPaid: false, // Initially false until payment is made
  });

  // Handle Input Change
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle Image Upload
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, image: URL.createObjectURL(file) });
    }
  };

  // Handle Form Submission (Mock API)
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.image || !formData.time || !formData.category || !formData.address) {
      alert("Please fill in all fields!");
      return;
    }

    // Simulate API Call
    onBusinessSubmit({ ...formData, id: Date.now() });
    alert("Business submitted! Please complete the payment.");
    
    // Reset Form
    setFormData({ name: "", image: null, time: "", category: "", address: "", isPaid: false });
  };

  return (
    <div className="max-w-lg mx-auto bg-white p-6 rounded-lg shadow-lg mt-10">
      <h2 className="text-2xl font-bold text-center">Submit Your Business</h2>
      <form onSubmit={handleSubmit} className="space-y-4 mt-4">
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Business Name"
          className="p-3 border w-full rounded-md"
          required
        />
        <input
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="p-3 border w-full rounded-md"
          required
        />
        <input
          type="text"
          name="time"
          value={formData.time}
          onChange={handleChange}
          placeholder="Time of Operation"
          className="p-3 border w-full rounded-md"
          required
        />
        <input
          type="text"
          name="category"
          value={formData.category}
          onChange={handleChange}
          placeholder="Category"
          className="p-3 border w-full rounded-md"
          required
        />
        <input
          type="text"
          name="address"
          value={formData.address}
          onChange={handleChange}
          placeholder="Address"
          className="p-3 border w-full rounded-md"
          required
        />
        <button
          type="submit"
          className="bg-blue-600 text-white w-full py-3 rounded-md hover:bg-blue-700"
        >
          Submit Business
        </button>
      </form>
    </div>
  );
};

export default BusinessListing;
