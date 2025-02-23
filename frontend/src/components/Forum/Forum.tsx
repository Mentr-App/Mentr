import React, { useEffect, useState } from "react";
import FeedService from "@/api/apiService";
import ForumPost from "./ForumPost";

export interface Post {
  id: string;
  title: string;
  content: string;
  author?: string;
  createdAt: string;
}

const Forum: React.FC = () => {
  const [feed, setFeed] = useState<Post[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadFeed = async () => {
      try {
        const data = await FeedService.fetchFeed();
        console.log(data);
        setFeed(data);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        console.log(errorMessage);
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    console.log("loading feed");
    loadFeed();
  }, []);

  if (loading) {
    return <p className="text-center text-gray-600">Loading feed...</p>;
  }

  if (error) {
    return <p className="text-center text-red-500">{error}</p>;
  }

  return (
    <div className="main-content p-6 bg-[#1E1E1E] min-h-screen">
      <div className="max-w-3xl mx-auto space-y-6">
        {feed.map((post, index) => (
          <ForumPost 
            key={post.id || index}
            index={index}
            post={post}
          />
        ))}
      </div>
    </div>
  );
};

export default Forum;