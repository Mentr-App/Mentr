import React from "react";
import "./Sidebar.css"; // If needed

const Sidebar = () => {
  return (
    <div className="sidebar">
      <div className="zone">
        <ul>
            <li>
                <div className="zone-item">
                    <h2>Newest and recent</h2>
                    <p>Find the latest updates</p>
                </div>
            </li>
            <li>
                <div className="zone-item">
                    <h2>Popular of the day</h2>
                    <p>Posts featured today</p>
                </div>
            </li>
            <li>
                <div className="zone-item">
                    <h2>Following</h2>
                    <p>Posts from people you follow</p>
                </div>
            </li>
        </ul>
      </div>
      <div className="zone">
        <h2>Popular Mentrs</h2>
        <ul>
            <li>
                <div className="zone-item">
                    <h2>Matthew Sigit</h2>
                    <p>86,200 posts</p>
                </div>
            </li>
            <li>
                <div className="zone-item">
                    <h2>Peter Kang</h2>
                    <p>50,000 posts</p>
                </div>
            </li>
            <li>
                <div className="zone-item">
                    <h2>Leo Gu</h2>
                    <p>30,240 posts</p>
                </div>
            </li>
        </ul>
      </div>
    </div>
  );
};

export default Sidebar;
