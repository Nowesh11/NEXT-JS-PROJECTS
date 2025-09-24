import { getServerSession } from "next-auth/next";
import { authOptions } from "./[...nextauth]";

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const session = await getServerSession(req, res, authOptions);
    
    if (session) {
      // Return session data
      res.status(200).json({
        user: {
          id: session.user.id,
          name: session.user.name,
          email: session.user.email,
          image: session.user.image,
          role: session.user.role || 'user'
        },
        expires: session.expires
      });
    } else {
      // No session found
      res.status(200).json(null);
    }
  } catch (error) {
    console.error('Session API error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
