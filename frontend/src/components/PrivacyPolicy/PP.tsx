import React from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/router";

const PP: React.FC = () => {
  const { logout } = useAuth();
  const router = useRouter();

  const handleRejectTerms = () => {
    logout();
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-[#2C353D] rounded flex flex-col items-center justify-center py-10">
      <div className="bg-secondary rounded-lg shadow-lg p-8 max-w-3xl w-full">
        <h1 className="text-lg text-[#EC6333] font-bold mb-6">Privacy Policy</h1>

        <h2 className="text-md text-white font-semibold mb-4">1. Data Collection</h2>
        <p className="text-white mb-6">
          We collect information directly from you when you sign up for an account,
          such as your name, email address, and other identifying information.
          Nothing is collected other than what you submit in text boxes and what
          you use to verify your account.
        </p>

        <h2 className="text-md text-white font-semibold mb-4">2. Data Usage</h2>
        <p className="text-white mb-6">
          The information we collect is used to enhance your experience on our
          website. The main purpose of collecting information for verification
          is to ensure all accounts are verified and accountable, which
          helps us improve the site functionality and offer support.
        </p>

        <h2 className="text-md text-white font-semibold mb-4">3. Data Retention</h2>
        <p className="text-white mb-6">
          We retain your data as long as it is necessary for the purposes stated
          in this policy, or as required by law. You may request deletion of
          your account and data at any time by following the instructions
          provided in the "Data Deletion" section below.
        </p>

        <h2 className="text-md text-white font-semibold mb-4">4. Data Security</h2>
        <p className="text-white mb-6">
          Your data is stored securely, and we implement
          security measures to protect against unauthorized access. However, no
          online system is 100% secure, so we cannot guarantee the absolute
          security of your information.
        </p>

        <h2 className="text-md text-white font-semibold mb-4">5. Third-Party Sharing</h2>
        <p className="text-white mb-6">
          We do not share your personal data with third parties without your
          consent, except as necessary for the functioning of our website
          (i.e. verification of accounts). All third-party services we use are
          required to maintain the confidentiality and security of your
          information.
        </p>

        <h2 className="text-md text-white font-semibold mb-4">6. Data Deletion</h2>
        <p className="text-white mb-6">
          To delete your account and all associated data, please visit your
          account settings and follow the deletion process or contact us directly.
          Once your data has been deleted, it cannot be restored. Any content created
          under your account will be either anonymized completely or deleted.
        </p>

        <h2 className="text-md text-white font-semibold mb-4">7. Rejecting Terms</h2>
        <p className="text-white mb-6">
          If you do not agree to the terms of this privacy policy, you may reject
          them by deleting your account and avoiding further
          interaction with the site. You can manage your permissions through
          your account settings. By continuing to use the site, you agree to
          the terms of this policy.
        </p>
        
        <button
          className="block px-4 py-2 bg-red-600 text-white text-center font-bold rounded-lg hover:bg-red-700 transition duration-300 mb-6"
          onClick={handleRejectTerms}
        >
          Reject Terms and Log Out
        </button>

        <h2 className="text-md text-white font-semibold mb-4">8. Contact Us</h2>
        <p className="text-white mb-6">
          If you have any questions about this privacy policy or how your data is handled,
          please reach out to us using the link below.
        </p>

        <Link legacyBehavior href="/contact">
          <a className="block px-4 py-2 bg-[#EC6333] text-white text-center font-bold rounded-lg hover:bg-accent-hover transition duration-300">
            Contact Us
          </a>
        </Link>
      </div>
    </div>
  );
};

export default PP;
