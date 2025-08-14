import { clerkClient } from '@clerk/clerk-sdk-node';

export const protectRoute = async (req, res, next) => {
    try {
        // Extract the session token from the Authorization header
        const authHeader = req.headers.authorization;
        const token = authHeader?.split(' ')[1];

        if (!token) {
            return res.status(401).json({ message: "Unauthorized - No token provided." });
        }

        // Verify the session token with Clerk
        const { userId } = await clerkClient.verifyToken(token);

        if (!userId) {
            return res.status(401).json({ message: "Unauthorized - Invalid token." });
        }

        // Attach the userId to the request object for use in subsequent middleware/routes
        req.auth = { userId };
        next();

    } catch (error) {
        console.error("Clerk token verification failed:", error);
        return res.status(401).json({ message: "Unauthorized - Token verification failed." });
    }
}