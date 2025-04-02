export interface Comment {
    _id: ObjectId;
    author: Author | null;
    created_at: string;
    content: string
    profile_picture_url: string
}

export interface ObjectId {
    $oid: string
}

export interface Author {
    _id: ObjectId;
    username: string;
    userType: string;
    profile_picture: string;
    major: string;
    company: string;
    industry: string;
}

