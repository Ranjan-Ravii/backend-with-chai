import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js";
import { deleteVideo,
    getUserVideos,
    getVideoById, 
    togglePublishStatus, 
    updateVideo, 
    uploadAVideo,
    getAllVideos,
    updateVideosViews,
    getVideosViews
 } 
from "../controllers/video.controllers.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";


const router = Router()

router.route("/upload-video").post(
    verifyJWT,
    upload.single("videoFile"),
    uploadAVideo
)

router.route("/c/:videoId").get(getVideoById);
router.route("/updateVideo/c/:videoId").post(verifyJWT,upload.single("thumbnail"), updateVideo)
router.route("/deletevideo/c/:videoId").post(verifyJWT, deleteVideo)
router.route("/toggle-status/c/:videoId").post(verifyJWT, togglePublishStatus)
router.route("/uservideos/c/:username").get(getUserVideos);
router.route("/allvideos").get(getAllVideos)

router.route('/views/add').post(verifyJWT, updateVideosViews); 
router.route('/Views/:videoId').get(getVideosViews); 

export default router