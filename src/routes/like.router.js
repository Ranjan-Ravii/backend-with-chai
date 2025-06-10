import express from "express"
import { toggleCommentLike, toggleTweetLike, toggleVideoLike, getLikedVideos } from "../controllers/like.controllers.js"
import { verifyJWT } from "../middlewares/auth.middleware.js"

const router = express.Router()

// Routes
router.post("/video/:videoId", verifyJWT, toggleVideoLike)
router.post("/comment/:commentId", verifyJWT, toggleCommentLike)
router.post("/tweet/:tweetId", verifyJWT, toggleTweetLike)
router.get("/videos", verifyJWT, getLikedVideos)

export default router
