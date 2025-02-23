import React, { useState } from 'react';

const LoginPopup: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-[#262d34] p-8 rounded-lg w-96">
        <h2 className="text-2xl text-white mb-6">{isLogin ? 'Login' : 'Sign Up'}</h2>
        <form>
          {!isLogin && (
            <input
              type="text"
              placeholder="Username"
              className="w-full bg-[#2C353D] text-white px-4 py-2 rounded mb-4 outline-none"
            />
          )}
          <input
            type="email"
            placeholder="Email"
            className="w-full bg-[#2C353D] text-white px-4 py-2 rounded mb-4 outline-none"
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full bg-[#2C353D] text-white px-4 py-2 rounded mb-4 outline-none"
          />
          <button
            type="submit"
            className="w-full bg-[#4CAF50] text-white px-4 py-2 rounded hover:bg-[#45a049] transition-colors duration-200"
          >
            {isLogin ? 'Login' : 'Sign Up'}
          </button>
        </form>
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