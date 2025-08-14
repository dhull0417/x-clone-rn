import { clerkClient } from '@clerk/clerk-sdk-node';
import { ENV } from '../config/env.js';

export const protectRoute = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        const token = authHeader?.split(' ')[1];

        // NEW LOGGING: Check the secret key to confirm it's loading
        console.log("Clerk Secret Key loaded:", ENV.CLERK_SECRET_KEY ? "YES" : "NO");
        if (!ENV.CLERK_SECRET_KEY) {
            console.error("CRITICAL: CLERK_SECRET_KEY is not defined.");
            return res.status(500).json({ message: "Server configuration error." });
        }

        if (!token) {
            return res.status(401).json({ message: "Unauthorized - No token provided." });
        }
 //comment still testing
        // We explicitly pass the secret key to ensure it is used,
        // which helps to diagnose issues with environment variable loading.
        const { userId } = await clerkClient.verifyToken(token, { secretKey: ENV.CLERK_SECRET_KEY });

        if (!userId) {
            return res.status(401).json({ message: "Unauthorized - Invalid token." });
        }

        req.auth = { userId };
        next();

    } catch (error) {
        console.error("Clerk token verification failed:", error);
        return res.status(401).json({ message: "Unauthorized - Token verification failed." });
    }
}

export const getClerkUser = async (userId) => {
    return await clerkClient.users.getUser(userId);
}
