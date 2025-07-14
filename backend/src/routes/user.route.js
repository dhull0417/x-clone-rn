import express from "express";
import { getUserProfile } from "../controllers/user.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js"
import { updateProfile } from "../controllers/user.controller.js";
import { syncUser } from "../controllers/user.controller.js";
import { getCurrentUser } from "../controllers/user.controller.js";
import { followUser } from "../controllers/user.controller.js";

const router = express.Router();


// PUBLIC ROUTE
// Return user profile
router.get("/profile/:username", getUserProfile);

//PROTECTED ROUTES
// check authentication and then create user in mongodb from clerk user data
router.post("/sync", protectRoute, syncUser);

// Get the current user (essentially, clicking on your own user profile rather than searching for a user profile)
router.post("/me", protectRoute, getCurrentUser);

// authenticate then update
router.put("/profile", protectRoute, updateProfile);

// To follow a user
router.post("/follow/:targetUserId", protectRoute, followUser)

export default router;