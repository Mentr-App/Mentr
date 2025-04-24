// pages/api/chat/findOrCreate.ts
import type { NextApiRequest, NextApiResponse } from 'next';
// Removed: import * as Sentry from "@sentry/nextjs";

// Define the expected structure of the request body from the frontend
interface FindOrCreateRequestBody {
  otherUserId: string;
}

// Define the expected structure of the successful response data from the Flask backend
interface User {
  id: string; // Assuming Flask returns string IDs directly or they are converted
  name: string;
  avatarUrl?: string;
}
interface ChatResponse {
  _id: string; // Assuming Flask returns string IDs directly or they are converted
  participants: User[];
  created_at: string; // Assuming ISO date string
  last_message_at: string | null; // Assuming ISO date string or null
  // Add other relevant chat fields returned by the backend
}

// Define the structure for error responses
type ErrorResponse = {
  message?: string; // Standardize on 'message' if possible
  msg?: string;     // Keep 'msg' if Flask uses it
};

// Define the target URL for the Flask backend endpoint
const FLASK_BACKEND_URL = process.env.FLASK_BACKEND_CHAT_FIND_OR_CREATE_URL || 'http://localhost:8000/chat/findOrCreate'; // Adjust Flask route as needed

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ChatResponse | ErrorResponse> // Response type depends on Flask backend
) {
  // 1. Ensure it's a POST request
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }

  // 2. Extract Authorization header and request body
  const authorizationHeader = req.headers.authorization;
  const { otherUserId } = req.body as FindOrCreateRequestBody;

  // 3. Basic validation
  if (!authorizationHeader) {
      // It's often better to let the backend handle auth errors, but a quick check is fine.
      console.warn("Proxy received request without Authorization header.");
      // Forward the request anyway, let Flask return 401 if needed.
      // Alternatively, return 401 directly:
      // return res.status(401).json({ message: 'Authorization header missing.' });
  }
  if (!otherUserId || typeof otherUserId !== 'string' || otherUserId.trim() === '') {
    // Basic check for the required payload field
    return res.status(400).json({ message: 'Missing or invalid otherUserId in request body.' });
  }

  try {
    // 4. Define the target URL for the Flask backend
    const targetUrl = FLASK_BACKEND_URL;

    console.log(`Proxying POST request to: ${targetUrl}`);

    // 5. Prepare headers for the Flask backend request
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    // Only add Authorization header if it exists
    if (authorizationHeader) {
        headers['Authorization'] = authorizationHeader;
    }

    // 6. Make the fetch request to the Flask backend
    const flaskResponse = await fetch(targetUrl, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify({ otherUserId: otherUserId.trim() }),
    });

    // 7. Relay the response from Flask back to the client
    // Assume Flask responds with JSON for both success and error cases.
    // If Flask sends non-JSON or empty body, .json() will throw, caught below.
    const responseBody = await flaskResponse.json();

    // Forward the status code and JSON body from Flask
    console.log(responseBody)
    return res.status(flaskResponse.status).json(responseBody);

  } catch (error: any) {
    // Handle errors during the fetch/proxy process
    console.error(`Error proxying /api/chat/findOrCreate to ${FLASK_BACKEND_URL}:`, error);
    // Removed Sentry call

    // Check if it's a network error connecting to Flask
    // Use optional chaining for safety
    if (error?.cause?.code === 'ECONNREFUSED') {
         console.error(`Connection refused when connecting to ${FLASK_BACKEND_URL}`);
         return res.status(503).json({ message: 'Service unavailable: Cannot connect to backend service.' });
    }

    // Check if it's a JSON parsing error (e.g., Flask sent non-JSON response)
    if (error instanceof SyntaxError && error.message.includes('JSON')) {
        console.error("Failed to parse JSON response from Flask backend.");
        return res.status(502).json({ message: 'Bad Gateway: Invalid response received from backend service.' });
    }

    // Return a generic server error for other issues
    return res.status(500).json({ message: 'An internal server error occurred while proxying the request.' });
  }
}
