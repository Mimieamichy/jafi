import { useState } from "react";
import SignupModal from "./SignupModal";
import HiringSignup from "./HiringSignup";
import BusinessSignup from "./BusinessSignup";


export default function SignupPage() {
  const [showModal, setShowModal] = useState(true);
  const [signupType, setSignupType] = useState(null);

  return (
    <div className="min-h-screen bg-white text-black flex items-center justify-center">
      {showModal && (
        <SignupModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          onSelect={(type) => {
            setSignupType(type);
            setShowModal(false);
          }}
        />
      )}

      {signupType === "hiring" && <HiringSignup />}
      {signupType === "business" && <BusinessSignup />}
      
    </div>
  );
}
