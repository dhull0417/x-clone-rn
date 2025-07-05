export const protectRoute = async (req, res, next) => {
    // req.auth().isAuthenticated calls back to server.js => app.use(clerkMiddleware());
    if(!req.auth().isAuthenticated) {
        return res.status(401).json({message: "Unauthorized - you must be logged in"});
    }

    next();
}