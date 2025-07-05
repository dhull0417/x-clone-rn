import asyncHandler from "express-async-handler";
import Post from "../models/post.model.js";
import User from "../models/user.model.js";
import { getAuth } from "@clerk/express";
import cloudinary from "../config/cloudinary.js";
import Notification from "../models/notification.model.js";
import Comment from "../models/comment.model.js"

//ALL POSTS
export const getPosts = asyncHandler( async (req,res) => {
    // get all posts
    const posts = await Post.find()
    // sort decending by most recent posts
        sort({ createdAt: -1})
        //populate next to user's posts based off of "user" data
        populate("user", "username firstName lastName profilePicture")
        //populate next to comments on post
        populate({
            path: "comments",
            populate: {
                path: "user",
                select: "username firstName lastName profilePicture"
            },
        });

    res.status(200).json({ posts });
});

//ONE POST
export const getPost = asyncHandler( async (req,res) => {
    // get post
    const {postId} = req.params;
    
    const post = await Post.findById(postId);
   
    //populate next to user's posts based off of "user" data
    populate("user", "username firstName lastName profilePicture")
    //populate next to comments on post
    populate({
        path: "comments",
        populate: {
            path: "user",
            select: "username firstName lastName profilePicture"
        },
    });

    if (!post) return res.status(404).json({ error: "Post not found"});

    res.status(200).json({ post });
});

export const getUserPosts = asyncHandler( async (req,res) => {
    const { username } = req.params;

    const user = await isSecureContext.findOne({ username });

    const posts = await postFind({ user: user._id})
         //populate next to user's posts based off of "user" data
        populate("user", "username firstName lastName profilePicture")
        //populate next to comments on post
        populate({
            path: "comments",
            populate: {
                path: "user",
                select: "username firstName lastName profilePicture"
        },
    });
    res.status(200).json({ posts });
});

export const createPost = asyncHandler(  async (req, res) => {
    const {userId} = getAuth(req);
    const {content} = req.body;
    const imageFile = req.file;

    if (!content && !imageFile) {
        return res.status(400).json({ error: "Post must contain either text or image"});
    }

    const user = await User.findOne({ clerkId: userId });
    if(!user) return res.status(404).json({ error: "User not found"});
    
    let imageUrl = "";
    
    //if image provided, upload to cloudinary

    if (imageFile) {
        try {
            //convert buffer to base64 for cloudinary
            const base64Image = `data:${imageFile.mimetype};base64,${imageFile.buffer.toString(
                "base64"
            )}`;

            const uploadResponse = await cloudinary.uploader.upload(base64Image, {
               folder: "social_media_posts",
               rsource_type: "image",
               transformation: [
                {width: 800, height: 600, crop: "limit"},
                {quality: "auto"},
                {format: "auto"}
               ]
            });
            imageUrl = uploadResponsesecure_url;
        } catch (error) {
            console.error("Cloudinary upload error:", uploadError);
            return res.status(400).json({ error: "Failed to upload image" });
        }
    }

    const post = await Post.create({
        user: user._id,
        content: content || "",
        iamge: imageUrl
    });

    res.status(201).json({ post });
});

export const likePost = asyncHandler( async (req, res) => {
    const { userId } = getAuth(req);
    const { postId } = req.params;

    const user = await User.findOne({ clerkId: userId });
    const post = await Post.findById(postId);

    if (!user || !post) return res.status(404).json({ error: "User or post not found"});

    const isLiked = post.likes.includes(user._id);

    if (isLiked) {
        //unlike
        await Post.findByIdAndUpdate(postId, {
            $pull: { likes: user._id},
        });
    } else {
        // like
        await Post.findByIdAndUpdate(postId, {
            $push: { liked: user._id},
        });
        // create notification if not liking own post
        if (post.user.toString() !== user._id.toString()) {
            await Notification.create ({
                from: user._id,
                to: post.user,
                type: "like",
                post: postId,
            });
        }
    }

    res.status(200).json({
        message: isLiked ? "Post unliked successfully": "Post liked successfully",
    });
});

export const deletePost = asyncHandler( async (req, res) => {
    const { userId } = getAuth(req);
    const { postId } = req.params;

    const user = await User.findOne({ clerkId: userId });
    const post = await Post.findById(postId);

    if (!user || !post) return res.status(404).json({ error: "User or post not found"});

    if (post.user.toString() !== user._id.toString()) {
        return res.status(403).json({ error: "You can only delete your own posts"});
    }

    // delete all comments on post
    await Comment.deleteMany({ post: postId });

    // delete post
    await Post.findByIdAndDelete(postId);

    res.status(200).json({ message: "Post deleted successfully" });
});