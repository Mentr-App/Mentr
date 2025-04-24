// pages/api/chat/messages/[chatId].ts
import type { NextApiRequest, NextApiResponse } from 'next';

// Define the structure for success/error responses (should match Flask backend)
type MessageResponse = any[]; // Expecting an array of messages
type ErrorResponse = {
  message?: string;
  msg?: string;
};

// Define the base URL for the Flask backend endpoint
// Note: The chatId will be appended to this URL
const FLASK_BACKEND_BASE_URL = process.env.FLASK_BACKEND_MESSAGES_URL || `http://localhost:8000/chat`; // Adjust base Flask route

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<MessageResponse | ErrorResponse>
) {
  // 1. Ensure it's a GET request
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }

  // 2. Extract chatId, query parameters, and Authorization header
  const { chatId } = req.query; // chatId comes from the filename [chatId].ts
  const { limit, skip } = req.query; // Pagination parameters
  const authorizationHeader = req.headers.authorization;

  // 3. Basic validation
  if (!chatId || typeof chatId !== 'string' || chatId.trim() === '') {
    return res.status(400).json({ message: 'Missing or invalid chatId in URL path.' });
  }
  // Optional: Validate limit/skip if needed (Flask backend should also validate)

  try {
    // 4. Construct the target URL for the Flask backend
    const targetPath = `${FLASK_BACKEND_BASE_URL}/${chatId.trim()}`;
    const queryParams = new URLSearchParams();
    if (limit) queryParams.set('limit', limit as string);
    if (skip) queryParams.set('skip', skip as string);
    const targetUrl = `${targetPath}?${queryParams.toString()}`;

    console.log(`Proxying GET request to: ${targetUrl}`);

    // 5. Prepare headers for the Flask backend request
    const headers: HeadersInit = {
      'Content-Type': 'application/json', // Standard practice
    };
    if (authorizationHeader) {
      headers['Authorization'] = authorizationHeader; // Forward the JWT token
    }

    // 6. Make the fetch request to the Flask backend
    const flaskResponse = await fetch(targetUrl, {
      method: 'GET',
      headers: headers,
    });

    // 7. Relay the response from Flask back to the client
    const responseBody = await flaskResponse.json(); // Assume Flask responds with JSON

    // Forward the status code and JSON body from Flask
    return res.status(flaskResponse.status).json(responseBody);

  } catch (error: any) {
    // Handle errors during the fetch/proxy process
    console.error(`Error proxying message request for chatId ${chatId} to ${FLASK_BACKEND_BASE_URL}:`, error);

    if (error?.cause?.code === 'ECONNREFUSED') {
         console.error(`Connection refused when connecting to ${FLASK_BACKEND_BASE_URL}`);
         return res.status(503).json({ message: 'Service unavailable: Cannot connect to backend service.' });
    }
    if (error instanceof SyntaxError && error.message.includes('JSON')) {
        console.error("Failed to parse JSON response from Flask backend.");
        return res.status(502).json({ message: 'Bad Gateway: Invalid response received from backend service.' });
    }

    // Return a generic server error for other issues
    return res.status(500).json({ message: 'An internal server error occurred while proxying the request.' });
  }
}
