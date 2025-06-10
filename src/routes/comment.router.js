import { Router } from "express"
import { verifyJWT } from "../middlewares/auth.middleware.js"
import {
    getVideoComments,
    addComment,
    updateComment,
    deleteComment
} from "../controllers/comment.controllers.js"

const router = Router()

router.route("/video/:videoId").get(verifyJWT, getVideoComments)

router.route("/video/addComment/:videoId").post(verifyJWT, addComment)

router.route("/update/:commentId").put(verifyJWT, updateComment)

router.route("/delete/:commentId").delete(verifyJWT, deleteComment)

export default router
