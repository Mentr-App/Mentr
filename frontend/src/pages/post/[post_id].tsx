import PostView from "@/components/PostView/PostView";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";

const PostPage: React.FC = () => {
    const router = useRouter()
    const [postId, setPostId] = useState<string | null>(null)

    useEffect(() => {
        if (router.isReady) {
            setPostId(router.query.post_id as string)
        }
    }, [router.isReady, router.query.post_id])

    if (!postId) return <></>

    return (
        <>
            <PostView post_id={postId}/>
        </>
    );
};

export default PostPage;
