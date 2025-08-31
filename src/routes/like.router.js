import express from "express"
import { toggleCommentLike,getVideoLikes, toggleTweetLike, toggleVideoLike, getLikedVideos, getVideoCommentsWithLikes } from "../controllers/like.controllers.js"
import { verifyJWT } from "../middlewares/auth.middleware.js"

const router = express.Router()

// Routes

router.route('/video/likes/:videoId').post(verifyJWT,toggleVideoLike)
router.route('/video/likes/:videoId').get(verifyJWT,getVideoLikes)

router.post("/comment/:commentId", verifyJWT, toggleCommentLike)
router.route('/comment/commentWithLikes/:videoId').get(getVideoCommentsWithLikes)
router.post("/tweet/:tweetId", verifyJWT, toggleTweetLike)
router.get("/videoslikes/c/:username",verifyJWT, getLikedVideos)

export default router
