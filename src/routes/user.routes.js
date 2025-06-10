import { Router } from "express";
import {
    getCurrentUser,
    getUserChannelProfile,
    getWatchHisory,
    loginUser,
    logoutUser,
    refreshAccessToken,
    registerUser,
    updateAccountDetails,
    updateAvatar,
    updateCoverImage,
    updatePasseword
    } from "../controllers/user.controllers.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
// import jwt from "jsonwebtoken";

const router = Router()

router.route("/register").post(
    upload.fields([ // this upload is multer widdeware that simply aims injects image file while any user register
        {
            name: "avatar", // in frontend this field should be avatar
            maxCount: 1,
        },
        {
            name: "coverImage",
            maxCount: 1,
        }
    ])
    , registerUser)

router.route("/login").post(loginUser)

//secured route
router.route("/logout").post(verifyJWT, logoutUser)
router.route("/refresh-token").post(refreshAccessToken)

router.route("/update-password").post(verifyJWT, updatePasseword)
router.route("/get-current-user").post(getCurrentUser)
router.route("/update-details").post(verifyJWT, updateAccountDetails)

router.route("/update-avatar").post(verifyJWT, upload.single("avatar"), updateAvatar);
router.route("/update-coverImage").post(verifyJWT, upload.single("coverImage"), updateCoverImage);

router.route("/c/:username").get(verifyJWT, getUserChannelProfile)
router.route("/history").get(verifyJWT, getWatchHisory)

export default router