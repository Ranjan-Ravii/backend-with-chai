import { Router } from "express";

import { verifyJWT } from "../middlewares/auth.middleware.js";
import { createTweet, deleteTweets, getUserTweets, updateTweets } from "../controllers/tweet.controllers.js";

const router = Router()

router.route("/createTweet").post(verifyJWT, createTweet)
router.route("/user/:username").get(getUserTweets);
router.route("/update/:id").post(verifyJWT, updateTweets)
router.route("/delete/:id").delete(verifyJWT, deleteTweets)


export default router