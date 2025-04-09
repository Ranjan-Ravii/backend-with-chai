import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js";
import { uploadAVideo } from "../controllers/video.controllers.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";


const router = Router()

router.route("/upload-video").post(
    verifyJWT,
    upload.single("videoFile"),
    uploadAVideo
)


export default router