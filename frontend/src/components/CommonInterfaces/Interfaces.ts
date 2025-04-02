export interface ObjectId {
    $oid: string
}

export interface Comment {
    _id: ObjectId;
    author: Author | null;
    created_at: string;
    content: string
    profile_picture_url: string
}

export interface Author {
    _id: ObjectId;
    username: string;
    userType: string;
    profile_picture: string;
    profile_picture_url: string;
    major: string;
    company: string;
    industry: string;
}

export interface Post {
    _id: ObjectId;
    comments: number;
    content: string;
    created_at: string;
    downvotes: number;
    upvotes: number;
    image_url: string | null;
    title: string;
    views: number;
    author: Author | null;
}

