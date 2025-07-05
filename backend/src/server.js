import express from "express";
import cors from "cors";
import {clerkMiddleware} from "@clerk/express";

import userRoutes from "./routes/user.route.js";
import postRoutes from "./routes/post.route.js";

import {ENV} from "./config/env.js";
import {connectDB} from "./config/db.js"

const app = express();

// INITIALIZING MIDDLEWARE
app.use(cors());
// below is for access to the request.body
app.use(express.json());
// Bleow is for authentication
app.use(clerkMiddleware());

//INITIALIZING ROUTES
app.get("/", (req, res) => res.send("Hello from the database"));

app.use("/api/users", userRoutes);
app.use("/api/posts", postRoutes);

// error handling middleware
app.use((err, req, res, next) => {
    console.error("Unhandled error:", err); 
    res.status(500).json({ error: err.message || "Internal server error"});
});

const startServer = async () => {
    try {
        await connectDB();

        app.listen(ENV.PORT, () => console.log("Server is up and running on PORT:", ENV.PORT));
    } catch (error) {
        console.error("Failed to start server:", error.message);
        process.exit(1);
    }

};

startServer();

