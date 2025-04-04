import { Router } from "express";
import { loginUser, logoutUser, refreshAccessToken, registerUser } from "../controllers/user.controllers.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router()

router.route("/register").post(
    upload.fields([ // this upload is multer widdeware that simply aims injects image file while any user register
        {
            name : "avatar", // in frontend this field should be avatar
            maxCount : 1, 
        },
        {
            name : "coverImage",
            maxCount : 1,
        }
    ])
    ,registerUser)

router.route("/login").post(loginUser)

//secured route
router.route("/logout").post(verifyJWT, logoutUser)
router.route("/refresh-token").post(refreshAccessToken)

export default router