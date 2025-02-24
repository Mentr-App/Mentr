import React, { useState } from 'react';
import logo_img from '@/assets/logo.png';
import profile_img from '@/assets/user.png';
import search_img from '@/assets/search.png';
import chat_img from '@/assets/chat.png';
import create_img from '@/assets/create2.png';
import people_img from '@/assets/people.png';
import LoginPopup from '@/components/LoginPopup/LoginPopup';

const Navbar: React.FC = () => {
  const [isPopupVisible, setIsPopupVisible] = useState(false);

  return (
    <div className="w-full flex items-center justify-between bg-[#262d34] px-[7%] py-4">
      {/* Logo */}
      <img src={logo_img.src} alt="Logo" className="w-40 curs or-pointer" />

      {/* Navigation Icons */}
      <ul className="flex-1 list-none text-center">
        <li className="inline-block mx-5 my-2 text-lg cursor-pointer text-[#f7f7f7]">
          <img
            src={people_img.src}
            alt="People"
            className="w-10 opacity-70 hover:opacity-100 transition-opacity duration-200"
          />
        </li>
        <li className="inline-block mx-5 my-2 text-lg cursor-pointer text-[#f7f7f7]">
          <img
            src={chat_img.src}
            alt="Chat"
            className="w-10 opacity-70 hover:opacity-100 transition-opacity duration-200"
          />
        </li>
        <li className="inline-block mx-5 my-2 text-lg cursor-pointer text-[#f7f7f7]">
          <img
            src={create_img.src}
            alt="Create"
            className="w-10 opacity-70 hover:opacity-100 transition-opacity duration-200"
          />
        </li>
      </ul>

      {/* Search Box */}
      <div className="flex items-center bg-[#2C353D] px-5 py-2 rounded-full">
        <input
          type="text"
          placeholder="Search"
          className="bg-transparent border-0 outline-none text-white text-lg max-w-[200px] placeholder:text-gray-400"
        />
        <img
          src={search_img.src}
          alt="Search"
          className="w-6 cursor-pointer"
        />
      </div>

      {/* User Icon */}
      <img
        src={profile_img.src}
        alt="User"
        className="w-8 cursor-pointer ml-10 opacity-60 hover:opacity-100 transition-opacity duration-200"
        onClick={() => setIsPopupVisible(true)}
      />

      {/* Login Popup */}
      {isPopupVisible && <LoginPopup onClose={() => setIsPopupVisible(false)} />}
    </div>
  );
};

export default Navbar;