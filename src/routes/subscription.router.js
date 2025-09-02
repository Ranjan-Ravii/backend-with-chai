import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
    getSubscribedChannels,
    getSubscription,
    getUserChannelSubscribers,
    toggleSubscription
}
    from "../controllers/subscription.controllers.js";


const router = Router()


router.route("/").post(verifyJWT, toggleSubscription)
router.route("/").get(verifyJWT, getSubscription)
router.route("/getUserSubscription/:channelId").get(verifyJWT, getUserChannelSubscribers)
router.route("/getSubscribedChannel/:subscriberId").get(verifyJWT, getSubscribedChannels)



export default router