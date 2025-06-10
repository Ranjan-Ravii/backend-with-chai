import { Router } from "express";

import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  createPlaylist,
  addVideoToPlaylist,
  removeVideoFromPlaylist,
  updatePlaylist,
  deletePlaylist,
  getPlaylistById,
  getUserPlaylists
} from "../controllers/playlist.controllers.js";

const router = Router();

router.route("/create/:videoId").post(verifyJWT, createPlaylist);
router.route("/add/:playlistId/:videoId").post(verifyJWT, addVideoToPlaylist);
router.route("/remove/:playlistId/:videoId").delete(verifyJWT, removeVideoFromPlaylist);
router.route("/update/:playlistId").put(verifyJWT, updatePlaylist);
router.route("/delete/:playlistId").delete(verifyJWT, deletePlaylist);
router.route("/:playlistId").get(getPlaylistById);
router.route("/user/:userId").get(getUserPlaylists);

export default router;
