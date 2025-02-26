import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
export default function ResetPassword() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const access_token = localStorage.getItem("access_token");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setError(null);
      setSuccessMessage(null);

      if (!password || !confirmPassword) {
          setError("Please fill in all fields");
          return;
      }

      if (password !== confirmPassword) {
          setError("Passwords do not match");
          return;
      }

      if (!token && !access_token) {
          setError("Invalid reset token");
          return;
      }

      setIsLoading(true);

      try {
        if (!access_token) {
            const response = await fetch("../api/set-password", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ token, password }),
            });
  
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Failed to reset password");
            }
  
            setSuccessMessage("Your password has been reset successfully. You can now log in.");
            setPassword("");
            setConfirmPassword("");
        }
        else {
            try {
                const endpoint = "/api/profile/setPassword";
                const access_token = localStorage.getItem("access_token");
                const response = await fetch(endpoint, {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${access_token}`,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({password})
                });
    
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || "Failed to set password");
                }
                setSuccessMessage("Your password has been reset successfully. You can now log in.");
                setPassword("");
                setConfirmPassword("");
            } catch (err) {
                setError(
                    err instanceof Error ? err.message : "An error occurred"
                );
            }
        }
      } catch (err) {
          if (err instanceof Error) {
              setError(err.message);
          } else {
              setError("An unexpected error occurred");
          }
      } finally {
          setIsLoading(false);
      }
  };

  return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
          <div className="bg-white p-8 rounded-lg shadow-md w-96">
              <h2 className="text-2xl font-bold mb-6 text-center">Reset Password</h2>
              {error && <p className="text-red-500 mb-4">{error}</p>}
              {successMessage && <p className="text-green-500 mb-4">{successMessage}</p>}
              <form onSubmit={handleSubmit}>
                  <div className="mb-4">
                      <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
                          New Password
                      </label>
                      <input
                          type="password"
                          id="newPassword"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required
                      />
                  </div>
                  <div className="mb-6">
                      <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                          Confirm Password
                      </label>
                      <input
                          type="password"
                          id="confirmPassword"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required
                      />
                  </div>
                  <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors duration-200"
                  >
                      {isLoading ? "Resetting Password..." : "Reset Password"}
                  </button>
              </form>
          </div>
      </div>
  );
};
