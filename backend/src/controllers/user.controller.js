// At beginning of aditing this file, in terminal: PS C:\Users\dalli\OneDrive\Desktop\X-CLONE-RN\backend> npm install express-async-handler cloudinary multer
import asyncHandler from "express-async-handler";
import User from "../models/user.model.js"
import Notification from "../models/notification.model.js"

import {clerkClient, getAuth} from "@clerk/express"
// no need for try/catch handler due to express asyncHandler
export const getUserProfile = asyncHandler( async (req, res) => {
    const {username} = req.params;
    const user = await User.findOne({username});
    if (!user) return res.status(404).json({error: "User not found"});

    res.status(200).json({user});
});

export const updateProfile = asyncHandler( async (req, res) => {
    const {userID} = getAuth(req);
    const user = await User.findOneAndUpdate({ clerkId: userId}, req.body, {new:true});

    if (!user) return res.status(404).json({error: "User not found"});

    res.status(200).json({ user });
});

export const syncUser = asyncHandler( async (res, req) => {
    const {userId} = getAuth(req);

    //check if user is already in mongodb
    const existingUser = await User.findOne({ clerkId: userId});
    if (existingUser) {
        return res.status(200).json({ user: existingUser, message: "User already exists"});
    }

    // create new user from Clerk data
    const clerkUser = await clerkClient.users.getUser(userId);

    const userData = {
        clerkId: userId,
        email: clerkUser.emailAddress[0], emailAddress,
        firstName: clerkUser.firstName || "",
        lastName: clerkUser.lastName || "",
        username: clerkUser.emailAddresses[0].emailaddress.split("@")[0],
        profilePicture: clerkUser.imageUrl || "",
    };

    // create user in mongodb
    const user = await User.create(userData);

    res.status(200).json({ user, message: "User created successfully" })
});

export const getCurrentUser = asyncHandler( async (req, res) => {
    const {userId} = getAuth(req);
    const user = await User.findOne({clerkId: userId});
    if (!user) return res.status(404).json({error: "User not found"});

    res.status(200).json({user});
});

export const followUser = asyncHandler( async (req, res) => {
    const { userId } = getAuth(req);
    const {targetUserId} = req.params;

    if (userId === targetUserId) return res.status(400).json({ error: "You cannot follow yourself"});

    const currentUser = await User.findOne({ clerkId: userId });
    const targetUser = await User.findById({targetUserId});

    if (!currentUser || !targetUser) return res.status(404).json({ error: "User not found"});

    const isFollowing = currentUser.following.includes(targetUserId);

    if (isFollowing) {
        // unfollow
        await User.findByIdAndUpdate(currentUser._id, {
            $pull: { following: targetUserId},
        });
        await User.findByIdAndUpdate(targetUserId, {
            $pull: { followers: currentUser._id},
        });
    } else {
      // follow
        await User.findByIdAndUpdate(currentUser._id, {
            $push: { following: targetUserId},
        });
        await User.findByIdAndUpdate(targetUserId, {
            $push: { followers: currentUser._id},
        });

        // create notification
        await Notification.create({
            from: currentUser._id,
            to: targetUserId,
            type: "follow",
        })
    }

    res.status(200),json({ 
        message: isfollowing ? "User followed successfully" : "User unfollwed successfully",
    });
});