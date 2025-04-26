import { useRouter } from "next/router";

interface ProfilePictureProps {
  userId: string | undefined;
  profilePicture: string | undefined;
  size?: number; // Optional size prop for customization
}

const DEFAULT_PROFILE_PICTURE = "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y";

const ProfilePicture: React.FC<ProfilePictureProps> = ({
  userId,
  profilePicture,
  size = 10,
}) => {
  const router = useRouter();

  const handleClick = () => {
    if (userId !== "[deleted]" && userId !== "[anonymous]" && userId !== "anonymous" && userId) {
        router.push(`/profile/${userId}`);
    }
  };

  return (
    <img
      src={profilePicture || DEFAULT_PROFILE_PICTURE} // Fallback image
      alt="Profile Picture"
      className="w-10 h-10 rounded-full mr-3 cursor-pointer"
      onClick={handleClick}
      title="Profile Picture"
    />
  );
};

export default ProfilePicture;
