import React from "react";
import "./Forum.css"; // If needed

const Forum = () => {
  const posts = [
    { title: "First Post", content: "This is an example forum post." },
    { title: "Second Post", content: "Another example post with details." },
    { title: "Second Post", content: "Another example post with details." },
    { title: "Second Post", content: "Another example post with details." },
    { title: "Second Post", content: "Another example post with details." },
    { title: "Second Post", content: "Another example post with details." },
    { title: "Second Post", content: "Another example post with details." },
    { title: "Second Post", content: "Another example post with details." },
    { title: "Second Post", content: "Another example post with details." },
    { title: "Second Post", content: "Another example post with details." },
  ];

  return (
    <div className="main-content">
      {posts.map((post, index) => (
        <div key={index} className="post">
          <h2>{post.title}</h2>
          <p>{post.content}</p>
        </div>
      ))}
    </div>
  );
};

export default Forum;
