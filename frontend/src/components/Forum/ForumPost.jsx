import React from 'react'

const ForumPost = ({index, post}) => {
  return (
    <div key={index} className="post">
        <h2>{post.title}</h2>
        <p>{post.content}</p>
    </div>
  )
}

export default ForumPost