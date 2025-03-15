import { Link } from "react-router-dom";

const SignupModal = ({ isOpen, onClose, onSelect }) => {
  if (!isOpen) return null;
  const handleReload = () => {
    window.location.reload();
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-96 text-center">
        <h2 className="text-2xl font-bold text-black">Sign Up As</h2>

        <button
          className="mt-4 w-full py-2 bg-blue-600 text-white rounded-lg"
          onClick={() => onSelect("hiring")}
        >
          Hiring
        </button>

        <button
          className="mt-2 w-full py-2 bg-blue-600 text-white rounded-lg"
          onClick={() => onSelect("business")}
        >
          Business Listing
        </button>

        <p className="mt-4 text-center">
          Already have an account?{" "}
          <Link to="/signin" className="text-blue-600 hover:underline" onClick={handleReload}> 
            Sign In
          </Link>
        </p>

        <button className="mt-4 text-red-500" onClick={onClose}>
          Cancel
        </button>
      </div>
    </div>
  );
};

export default SignupModal;
