import React, { useState } from 'react';

const LoginPopup: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null); 
    const endpoint = isLogin ? '../api/login' : '../api/signup';
    const payload = isLogin ? { email, password } : { username, email, password };

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Something went wrong');
      }

      const data = await response.json();

      if (data.access_token && data.refresh_token) {
        localStorage.setItem('access_token', data.access_token);
        localStorage.setItem('refresh_token', data.refresh_token);
        alert(isLogin ? 'Login successful!' : 'Signup successful!');
        onClose(); 
      }
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred');
      }
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-[#262d34] p-8 rounded-lg w-96">
        <h2 className="text-2xl text-white mb-6">{isLogin ? 'Login' : 'Sign Up'}</h2>
        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-[#2C353D] text-white px-4 py-2 rounded mb-4 outline-none"
            />
          )}
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-[#2C353D] text-white px-4 py-2 rounded mb-4 outline-none"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-[#2C353D] text-white px-4 py-2 rounded mb-4 outline-none"
          />
          <button
            type="submit"
            className="w-full bg-[#4CAF50] text-white px-4 py-2 rounded hover:bg-[#45a049] transition-colors duration-200"
          >
            {isLogin ? 'Login' : 'Sign Up'}
          </button>
        </form>
        {error && <p className="text-red-500 mt-4">{error}</p>}
        <p className="text-white mt-4">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <span
            className="text-[#4CAF50] cursor-pointer"
            onClick={() => setIsLogin(!isLogin)}
          >
            {isLogin ? 'Sign Up' : 'Login'}
          </span>
        </p>
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white text-2xl"
        >
          &times;
        </button>
      </div>
    </div>
  );
};

export default LoginPopup;