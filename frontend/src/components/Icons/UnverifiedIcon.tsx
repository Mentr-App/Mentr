import React from "react";

interface IconProps {
  className?: string;
}

const UnverifiedIcon: React.FC<IconProps> = ({ className }) => (
  <div title="Unverified">
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
    >
      <path d="M12 2L15 5H20V10L22 13L20 16V21H15L12 24L9 21H4V16L2 13L4 10V5H9L12 2Z" />
      <line x1="7" y1="7" x2="17" y2="17" stroke="white" strokeWidth="2" />
      <line x1="17" y1="7" x2="7" y2="17" stroke="white" strokeWidth="2" />
    </svg>
  </div>
);

export default UnverifiedIcon;
