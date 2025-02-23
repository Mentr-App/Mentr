import React from 'react';
import { Post } from './Forum';

interface ForumPostProps {
  index: number;
  post: Post;
}

const ForumPost: React.FC<ForumPostProps> = ({ index, post }) => {
  return (
    <div key={post.id || index}>
      {}
    </div>
  );
};

export default ForumPost;