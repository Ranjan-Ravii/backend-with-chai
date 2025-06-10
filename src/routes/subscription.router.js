import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
    getSubscribedChannels,
    getUserChannelSubscribers,
    toggleSubscription
}
    from "../controllers/subscription.controllers.js";


const router = Router()


router.route("/").post(verifyJWT, toggleSubscription)
router.route("/getUserSubscription/:channelId").get(verifyJWT, getUserChannelSubscribers)
router.route("/getSubscribedChannel/:channelId").get(verifyJWT, getSubscribedChannels)



export default router