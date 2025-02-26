import React, { useState } from 'react';

const CommentInput: React.FC<{ onCommentSubmit: (comment: string) => void }> = ({ onCommentSubmit }) => {
  const [comment, setComment] = useState<string>("");

  const handleCommentChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setComment(event.target.value);
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (comment.trim()) {
      onCommentSubmit(comment); // Call the parent function to handle the comment
      setComment(""); // Clear the input after submitting
    }
  };

  return (
    <div className="mt-5 relative flex flex-col p-4 bg-none rounded-lg">
      <textarea
        value={comment}
        onChange={handleCommentChange}
        placeholder="Write a comment..."
        className={`p-3 ${comment.trim() ? 'mb-10' : 'mb-0'} mb-10 border focus:outline-none border-secondary rounded-md resize-none bg-secondary text-white`}
        rows={4}
      />

      {comment.trim() && (
        <button
          onClick={handleSubmit}
          className="absolute bottom-2 right-4 px-4 py-2 text-white bg-primary rounded-md hover:bg-primary-dark"
        >
          Post Comment
        </button>
      )}
    </div>
  );
};

export default CommentInput;
