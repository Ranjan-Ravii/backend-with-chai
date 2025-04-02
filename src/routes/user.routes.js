import { Router } from "express";
import { registerUser } from "../controllers/user.controllers.js";
import { upload } from "../middlewares/multer.middleware.js";

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


export default router