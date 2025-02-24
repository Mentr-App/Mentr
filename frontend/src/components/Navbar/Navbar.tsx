import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import logo_img from '@/assets/logo.png';
import profile_img from '@/assets/user.png';
import search_img from '@/assets/search.png';
import chat_img from '@/assets/chat.png';
import create_img from '@/assets/create2.png';
import people_img from '@/assets/people.png';
import LoginPopup from '@/components/LoginPopup/LoginPopup';

const Navbar: React.FC = () => {
  const [isPopupVisible, setIsPopupVisible] = useState(false);
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const router = useRouter();

  const handleProfileClick = () => {
    const token = localStorage.getItem('access_token');

    if (token) {
      setIsDropdownVisible(!isDropdownVisible);
    } else {
      setIsPopupVisible(true);
    }
  };

  const handleSignOut = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    setIsDropdownVisible(false);
    router.push('/'); 
  };

  const handleUserSettings = () => {
    //router.push('/profile'); 
    setIsDropdownVisible(false);
  };

  return (
    <div className="w-full flex items-center justify-between bg-[#262d34] px-[7%] py-4">
      {/* Logo */}
      <img src={logo_img.src} alt="Logo" className="w-40 cursor-pointer" />

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

      {/* User Icon and Dropdown */}
      <div className="relative">
        <img
          src={profile_img.src}
          alt="User"
          className="w-8 cursor-pointer ml-10 opacity-60 hover:opacity-100 transition-opacity duration-200"
          onClick={handleProfileClick}
        />
        {isDropdownVisible && (
          <div className="absolute right-0 mt-2 w-48 bg-[#2C353D] rounded-lg shadow-lg">
            <ul className="py-2">
              <li
                className="px-4 py-2 text-white hover:bg-[#3a454d] cursor-pointer"
                onClick={handleUserSettings}
              >
                User Settings
              </li>
              <li
                className="px-4 py-2 text-white hover:bg-[#3a454d] cursor-pointer"
                onClick={handleSignOut}
              >
                Sign Out
              </li>
            </ul>
          </div>
        )}
      </div>

      {/* Login Popup */}
      {isPopupVisible && <LoginPopup onClose={() => setIsPopupVisible(false)} />}
    </div>
  );
};

export default Navbar;