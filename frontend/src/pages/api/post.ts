import { NextApiRequest, NextApiResponse } from "next";
import formidable from "formidable";
import fs from "fs";
import axios from "axios";

export const config = {
    api: {
        bodyParser: false,
    },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "POST") {
        return res.status(405).json({ message: "Method Not Allowed" });
    }

    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const form = formidable({});
        const [fields, files] = await form.parse(req);
        console.log("Received from frontend:", { fields, files });
        
        if (!fields.title || !fields.content) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        const formData = new FormData();
        
        formData.append('title', fields.title[0]);
        formData.append('content', fields.content[0]);

        const isAnonymous = fields.anonymous?.[0] === "true";
        formData.append('anonymous', String(isAnonymous));

        const activity = fields.activity?.[0] || "undefined";
        console.log(activity)
        formData.append('activity', activity)

        if (files.image && files.image[0]) {
            const file = files.image[0];
            const fileBuffer = await fs.promises.readFile(file.filepath);
            formData.append('image', new Blob([fileBuffer]), file.originalFilename || 'image');
        }

        try {
            const response = await axios.post('http://localhost:8000/post', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: authHeader,
                },
            });

            if (files.image && files.image[0]) {
                await fs.promises.unlink(files.image[0].filepath);
            }

            return res.status(201).json(response.data);
        } catch (axiosError) {
            if (axios.isAxiosError(axiosError)) {
                return res.status(axiosError.response?.status || 500).json({
                    message: "Error from backend",
                    error: axiosError.response?.data || axiosError.message
                });
            }
            throw axiosError; 
        }
    } catch (error) {
        console.error("Error creating post:", error);
        return res.status(500).json({
            message: "Error creating post",
            error: error instanceof Error ? error.message : "Unknown error",
        });
    }
}
