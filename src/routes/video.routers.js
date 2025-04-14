import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js";
import { deleteVideo,
    getVideoById, 
    togglePublishStatus, 
    updateVideo, 
    uploadAVideo } 
from "../controllers/video.controllers.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";


const router = Router()

router.route("/upload-video").post(
    verifyJWT,
    upload.single("videoFile"),
    uploadAVideo
)

router.route("/c/:videoId").get(getVideoById);
router.route("/updateVideo/c/:videoId").post(upload.single("thumbnail"), updateVideo)
router.route("/deletevideo/c/:videoId").post(deleteVideo)
router.route("/toggle-status/c/:videoId").post(togglePublishStatus)

export default router