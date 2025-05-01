import React from "react";

interface IconProps {
  className?: string;
}

const VerifiedIcon: React.FC<IconProps> = ({ className }) => (
  <div title="Verified">
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
    >
      <path d="M12 2L15 5H20V10L22 13L20 16V21H15L12 24L9 21H4V16L2 13L4 10V5H9L12 2Z" />
      <path
        d="M10 13.5L8.5 12L7.5 13L10 15.5L16.5 9L15.5 8L10 13.5Z"
        fill="white"
      />
    </svg>
  </div>
);

export default VerifiedIcon;
