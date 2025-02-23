import React from "react";

const Sidebar = () => {
  return (
    <div className="w-[300px] p-5 text-[#f7f7f7]">
      {}
      <div className="flex flex-col p-5 bg-[#262d34] rounded-lg mb-5">
        <ul className="flex flex-col list-none text-left">
          <li className="inline-block mx-5 my-2">
            <div className="flex flex-col text-left">
              <h2 className="text-lg font-bold">Newest and recent</h2>
              <p className="text-xs text-[#97989D]">Find the latest updates</p>
            </div>
          </li>
          <li className="inline-block mx-5 my-2">
            <div className="flex flex-col text-left">
              <h2 className="text-lg font-bold">Popular of the day</h2>
              <p className="text-xs text-[#97989D]">Posts featured today</p>
            </div>
          </li>
          <li className="inline-block mx-5 my-2">
            <div className="flex flex-col text-left">
              <h2 className="text-lg font-bold">Following</h2>
              <p className="text-xs text-[#97989D]">Posts from people you follow</p>
            </div>
          </li>
        </ul>
      </div>

      {}
      <div className="flex flex-col p-5 bg-[#262d34] rounded-lg mb-5">
        <h2 className="text-xl mb-4">Popular Mentrs</h2>
        <ul className="flex flex-col list-none text-left">
          <li className="inline-block mx-5 my-2">
            <div className="flex flex-col text-left">
              <h2 className="text-lg font-bold">Matthew Sigit</h2>
              <p className="text-xs text-[#97989D]">86,200 posts</p>
            </div>
          </li>
          <li className="inline-block mx-5 my-2">
            <div className="flex flex-col text-left">
              <h2 className="text-lg font-bold">Peter Kang</h2>
              <p className="text-xs text-[#97989D]">50,000 posts</p>
            </div>
          </li>
          <li className="inline-block mx-5 my-2">
            <div className="flex flex-col text-left">
              <h2 className="text-lg font-bold">Leo Gu</h2>
              <p className="text-xs text-[#97989D]">30,240 posts</p>
            </div>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Sidebar;