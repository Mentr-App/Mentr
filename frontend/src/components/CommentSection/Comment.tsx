import React, { useEffect, useState, ChangeEvent } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { getRelativeTime } from '@/lib/timeUtils'
import TextEditor from '../TextEditor/TextEditor'
import { Comment, Author } from "../CommonInterfaces/Interfaces"
import DeleteButton from '../DeleteConfirmation/DeleteConfirmationProp'
import ProfilePicture from '../ProfilePicture/ProfilePicture'
import { useRouter } from 'next/navigation'

interface CommentItemProps {
  comment: Comment
  index: number
  getAuthorName: (author: string | Author) => string
  postAuthorId: string                  // <— the post’s author ID, passed from parent
}

const DEFAULT_PROFILE_PICTURE =
  "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y"

const CommentItem: React.FC<CommentItemProps> = ({
  comment,
  index,
  getAuthorName,
  postAuthorId,
}) => {
  const [isDropdownVisible, setIsDropdownVisible] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [localComment, setLocalComment] = useState<Comment>(comment)
  const [editText, setEditText] = useState(comment.content)
  const [isAuthor, setIsAuthor] = useState(false)
  const [isDeleted, setIsDeleted] = useState(false)
  const [markStatus, setMarkStatus] = useState<"helpful" | "unhelpful" | null>(null)
  const { isAuthenticated } = useAuth()
  const router = useRouter()

  const userId = typeof window !== 'undefined' && localStorage.getItem("userId")
  const isPostAuthor = userId === postAuthorId

  // when you click one of the buttons:
  const handleMark = async (status: "helpful" | "unhelpful") => {
    if (!isAuthenticated) return
    const token = localStorage.getItem("access_token")
    if (!token) return

    try {
      const res = await fetch(`/api/comment/mark/${comment._id.$oid}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ helpful: status === "helpful" }),
      })
      if (res.ok) {
        setMarkStatus(status)
      } else {
        console.error("Failed to mark:", await res.text())
      }
    } catch (e) {
      console.error(e)
    }
  }

  const handleEditSubmit = async () => {
    if (
      !isAuthenticated ||
      editText === localComment.content ||
      !editText.trim()
    ) {
      return
    }
    const token = localStorage.getItem("access_token")
    if (!token) return

    try {
      const res = await fetch(`/api/comment/edit/${comment._id.$oid}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content: editText }),
      })
      if (res.ok) {
        const { comment: updated } = await res.json()
        setLocalComment(updated)
        setIsEditing(false)
      }
    } catch (e) {
      console.error(e)
    }
  }

  const handleDelete = async () => {
    const token = localStorage.getItem("access_token")
    if (!token) return
    try {
      const res = await fetch(`/api/comment/delete/${comment._id.$oid}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })
      if (res.ok) {
        setIsDeleted(true)
      } else {
        console.error("Delete failed:", await res.text())
      }
    } catch (e) {
      console.error(e)
    }
  }

  useEffect(() => {
    if (userId && comment.author?._id?.$oid) {
      setIsAuthor(userId === comment.author._id.$oid)
    }
  }, [userId, comment.author])

  if (isDeleted) return null

  return (
    <div
      key={comment._id.$oid || index}
      className='relative bg-secondary p-4 rounded-lg'
    >
      <div className='flex justify-between'>
        <div className='flex items-start'>
          {!localComment.anonymous ? (
            <>
              <ProfilePicture
                profilePicture={localComment.profile_picture_url}
                userId={localComment.author?._id.$oid}
              />
              <div className='ml-2'>
                <span className='font-semibold text-white'>
                  {localComment.author?.username}
                </span>
                {localComment.author?.userType === "Mentee" ? (
                  <span className='text-xs text-gray-500'>
                    Student • {localComment.author.major}
                  </span>
                ) : (
                  <span className='text-xs text-gray-500'>
                    {localComment.author?.company} • {localComment.author?.industry}
                  </span>
                )}
              </div>
            </>
          ) : (
            <>
              <ProfilePicture
                profilePicture={DEFAULT_PROFILE_PICTURE}
                userId="anonymous"
              />
              <div className='ml-2'>
                <span className='font-semibold text-white'>Anonymous User</span>
              </div>
            </>
          )}
        </div>
        <span className='text-gray-400 text-sm'>
          {getRelativeTime(localComment.created_at)}
        </span>
      </div>

      {isEditing ? (
        <TextEditor
          editText={editText}
          setEditText={setEditText}
          setIsEditing={setIsEditing}
          handleEditSubmit={handleEditSubmit}
        />
      ) : (
        <div className='flex justify-between items-start mt-2'>
          <p className='text-white ml-14'>{localComment.content}</p>

          {/* “…” dropdown toggle */}
          {isAuthor && (
            <button
              className='text-gray-400 text-xl hover:text-white'
              onClick={() => setIsDropdownVisible((v) => !v)}
              title="Toggle comment options"
            >
              …
            </button>
          )}
        </div>
      )}

      {/* helpful / unhelpful buttons for post’s author */}
      {isPostAuthor && !isEditing && (
        <div className='flex space-x-2 ml-14 mt-2'>
          <button
            onClick={() => handleMark("helpful")}
            disabled={markStatus === "helpful"}
            className={`px-2 py-1 text-sm rounded ${
              markStatus === "helpful"
                ? "bg-green-600 text-white"
                : "bg-gray-700 text-gray-200 hover:bg-gray-600"
            }`}
          >
            Helpful
          </button>
          <button
            onClick={() => handleMark("unhelpful")}
            disabled={markStatus === "unhelpful"}
            className={`px-2 py-1 text-sm rounded ${
              markStatus === "unhelpful"
                ? "bg-red-600 text-white"
                : "bg-gray-700 text-gray-200 hover:bg-gray-600"
            }`}
          >
            Unhelpful
          </button>
        </div>
      )}

      {isDropdownVisible && (
        <div className="absolute top-[-40] right-0 mt-2 w-40 rounded-lg shadow-lg bg-gray-500 text-sm text-white z-50">
          <ul>
            <li
              className='px-4 py-2 cursor-pointer hover:bg-foreground'
              onClick={() => {
                setIsEditing(true)
                setEditText(localComment.content)
                setIsDropdownVisible(false)
              }}
            >
              Edit
            </li>
            <DeleteButton
              onDelete={handleDelete}
              setIsDropdownVisible={setIsDropdownVisible}
              title="Delete Comment"
            />
          </ul>
        </div>
      )}
    </div>
  )
}

export default CommentItem
