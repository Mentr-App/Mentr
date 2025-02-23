import React, { useEffect } from "react";
import "./Forum.css"; // If needed
import apiClient from "../../services/apiClient";
import { fetchFeed } from "../../services/apiService";
import { useState } from "react";
import ForumPost from "./ForumPost";
const Forum = () => {
  const [feed, setFeed] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const loadFeed = async () => {
        try {
            const data = await fetchFeed()
            console.log(data)
            setFeed(data)
        } catch (error) {
            console.log(error.message)
            setError(error.message)
        } finally {
            setLoading(false)
        }
    }
    console.log("loading feed")
    loadFeed()
  }, [])

  if (loading) {
    return <p>Loading feed...</p>
  }

  if (error) {
    return <p>{error}</p>
  }

  return (
    <div className="main-content">
      {feed.map((post, index) => (
        <ForumPost 
        index={index}
        post={post}
        />
      ))}
    </div>
  );
};

export default Forum;
