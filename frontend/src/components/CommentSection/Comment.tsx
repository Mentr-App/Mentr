import React, { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { getRelativeTime } from '@/lib/timeUtils'
import TextEditor from '../TextEditor/TextEditor';
import {Comment, Author} from "./CommentInterfaces"

interface CommentItemProps {
    comment: Comment
    index: number
    getAuthorName: (author: string | Author) => string;
}

const CommentItem: React.FC<CommentItemProps> = ({comment, index, getAuthorName}) => {
  const [isDropdownVisible, setIsDropdownVisible] = useState<boolean>(false)
  const [isEditing, setIsEditing] = useState<boolean>(false)
  const [localComment, setLocalComment] = useState<Comment>(comment)
  const [editText, setEditText] = useState<string>(localComment.content)
  const [isAuthor, setIsAuthor] = useState<boolean>(false)
  const {isAuthenticated} = useAuth()

  const userId = localStorage.getItem("userId")
  
  const handleEditSubmit = async() => {
    console.log("editText", editText)
    if ((!isAuthenticated) || (editText === localComment.content) ||
        (editText === "") || (!localComment) || (!comment)) {
            return
    }

    try {
        const endpoint = `/api/comment/edit/${comment._id.$oid}`
        const response = await fetch(endpoint, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${localStorage.getItem("access_token")}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({content: editText})
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



  return (
    <div
        key={comment._id.$oid || index}
        className='relative bg-secondary p-4 rounded-lg'>
        <div className='flex justify-between'>
            <span className='font-semibold text-white'>
                {comment.author?.username}
            </span>
            <span className='text-gray-400 text-sm'>
                {getRelativeTime(comment.created_at)}
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
            <p className='text-white mt-2'>{localComment.content}</p>
            {
                isAuthor && (
                <button className='text-gray-400 text-xl hover:text-white'
                    onClick={() => setIsDropdownVisible(!isDropdownVisible)}>...</button>
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
                        }}>
                            Edit
                    </li>
                    <li className='px-4 py-2 cursor-pointer hover:bg-foreground'>Delete</li>
                </ul>
            </div>
        )}
    </div>
  )
}

export default CommentItem