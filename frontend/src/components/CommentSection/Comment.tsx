import React, { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { getRelativeTime } from '@/lib/timeUtils'
import TextEditor from '../TextEditor/TextEditor';
import { Comment, Author } from "../CommonInterfaces/Interfaces"
import DeleteButton from '../DeleteConfirmation/DeleteConfirmationProp';
import ProfilePicture from '../ProfilePicture/ProfilePicture';
import { useRouter } from 'next/navigation';

interface CommentItemProps {
    comment: Comment
    index: number
    getAuthorName: (author: string | Author) => string;
}

const DEFAULT_PROFILE_PICTURE = "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y";

const CommentItem: React.FC<CommentItemProps> = ({ comment, index, getAuthorName }) => {
    const [isDropdownVisible, setIsDropdownVisible] = useState<boolean>(false)
    const [isEditing, setIsEditing] = useState<boolean>(false)
    const [localComment, setLocalComment] = useState<Comment>(comment)
    const [editText, setEditText] = useState<string>(localComment.content)
    const [isAuthor, setIsAuthor] = useState<boolean>(false)
    const [isDeleted, setIsDeleted] = useState(false)
    const { isAuthenticated } = useAuth()
    const router = useRouter()

    const userId = localStorage.getItem("userId")

    const handleEditSubmit = async () => {
        console.log("editText", editText)
        if ((!isAuthenticated) || (editText === localComment.content) ||
            (editText === "") || (!localComment) || (!comment)) {
            return
        }

        const access_token = localStorage.getItem("access_token")
        if (!access_token) {
            return
        }

        try {
            const endpoint = `/api/comment/edit/${comment._id.$oid}`
            const response = await fetch(endpoint, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${access_token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ content: editText })
            })

            if (response.ok) {
                const data = await response.json()
                setLocalComment(data.comment)
                setIsEditing(false)
            }
        } catch (error) {
            console.error("Error editting comment:", error)
        }
    }

    const handleDelete = async () => {
        console.log("Deleting comment...");
        const access_token = localStorage.getItem("access_token")
        if (!access_token) {
            return
        }

        try {
            const response = await fetch(`/api/comment/delete/${comment._id.$oid}`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${access_token}`,
                },
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error("Error deleting comment:", errorData);
                return;
            }

            const data = await response.json()
            console.log(data)
            setIsDeleted(data.comment)
            
        } catch (error) {
            console.error("Failed to delete comment:", error);
        }
    };

    const checkAuthorship = () => {
        if (userId) {
            if (userId === comment.author?._id.$oid) {
                setIsAuthor(true)
            }
        }
    }

    useEffect(() => {
        checkAuthorship()
    }, [userId])

    if (isDeleted) {
        return <></>
    }

    return (
        <div
            key={comment._id.$oid || index}
            className='relative bg-secondary p-4 rounded-lg'>
            <div className='flex justify-between'>
                <div className='flex flex-row'>
                    <ProfilePicture profilePicture={localComment.profile_picture_url} userId={localComment.author?._id.$oid} />
                    <div className='flex flex-col'>
                        <span className='font-semibold text-white'>
                            {localComment.author?.username}
                        </span>
                        {localComment.author?.userType === "Mentee"
                            ?
                            <span className='text-xs text-gray-500'>Student • {localComment.author.major}</span>
                            :
                            <span className='text-xs text-gray-500'>{localComment.author?.company} • {localComment.author?.industry}</span>
                        }
                    </div>
                </div>
                <span className='text-gray-400 text-sm'>
                    {getRelativeTime(localComment.created_at)}
                </span>
            </div>
            {
                isEditing
                    ?
                    <TextEditor
                        editText={editText}
                        setEditText={setEditText}
                        setIsEditing={setIsEditing}
                        handleEditSubmit={handleEditSubmit}
                    />
                    :
                    <div className='flex justify-between'>
                        <p className='text-white ml-14 mt-2'>{localComment.content}</p>
                        {
                            isAuthor && (
                                <button
                                    className='text-gray-400 text-xl hover:text-white'
                                    onClick={() => setIsDropdownVisible(!isDropdownVisible)}
                                    title="Toggle comment options">
                                    ...
                                </button>
                            )
                        }
                    </div>
            }
            {isDropdownVisible && (
                <div className="absolute top-[-40] right-0 mt-2 w-40 rounded-lg shadow-lg bg-gray-500 text-sm text-white z-50">
                    <ul>
                        <li className='px-4 py-2 cursor-pointer hover:bg-foreground'
                            onClick={() => {
                                setIsEditing(true)
                                if (!isEditing) {
                                    setEditText(localComment.content)
                                }
                                setIsDropdownVisible(false)
                            }}
                            title="Edit comment">
                            Edit
                        </li>
                        <DeleteButton onDelete={handleDelete} setIsDropdownVisible={setIsDropdownVisible} title="Delete Comment" />
                    </ul>
                </div>
            )}
        </div>
    )
}

export default CommentItem
