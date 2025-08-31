import mongoose, { isValidObjectId } from "mongoose"
const { ObjectId } = mongoose.Types;
import {Comment} from "../models/comment.models.js"
import { Video } from "../models/video.models.js"
import { ApiError } from "../utils/apiError.js"
import { apiResponse } from "../utils/apiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"

const getVideoComments = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video id.");
    }

    const videoObjectId = new ObjectId(videoId);

    const video = await Video.findById(videoObjectId);
    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    const comments = await Comment.find({ video: videoObjectId })
        .populate("owner", "avatar username email")
        .sort({ createdAt: -1 })
        .limit(parseInt(limit))
        .skip((parseInt(page) - 1) * parseInt(limit));

    const result = {
        video: {
            _id: video._id,
            title: video.title
        },
        comments
    };

    return res
        .status(200)
        .json(new apiResponse(200, result, "Comments fetched successfully."));
});

const addComment = asyncHandler(async (req, res) => {
    //get video on which comment is made
    // validate the id of video
    // validate if user is loged in
    // create a  new comment object 

    const { videoId } = req.params
    const { commentFromUser } = req.body
    const userId = req.user?._id

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video id");
    }

    if (!isValidObjectId(userId)) {
        throw new ApiError(400, "User should be logged in to comment");
    }

    if (!commentFromUser || commentFromUser.trim() === "") {
        throw new ApiError(400, "Comment content cannot be empty");
    }

    // Check if video exists
    const video = await Video.findById(videoId)
    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    const comment = await Comment.create({
        content: commentFromUser.trim(),
        video: videoId,
        owner: userId
    })

    console.log('Comment created:', comment) // Debug log

    return res.status(200)
        .json(
            new apiResponse(200, comment, "Comment made successfully.")
        )
})

const updateComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params
    const { newCommentFromUser } = req.body
    const userId = req.user?._id

    if (!isValidObjectId(commentId)) {
        throw new ApiError(400, "Invalid comment id");
    }

    if (!isValidObjectId(userId)) {
        throw new ApiError(400, "User should be logged in to comment");
    }

    if (!newCommentFromUser || newCommentFromUser.trim() === "") {
        throw new ApiError(400, "Comment content cannot be empty")
    }

    const comment = await Comment.findById(commentId)

    if (!comment) {
        throw new ApiError(404, "Comment not found.")
    }

    // Check if user owns the comment
    if (!comment.owner.equals(userId)) {
        throw new ApiError(403, "User is not the owner of comment.")
    }

    comment.content = newCommentFromUser.trim()
    await comment.save();

    return res
        .status(200)
        .json(
            new apiResponse(200, { updatedComment: comment }, "Comment updated successfully.")
        )

})

const deleteComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params

    if (!isValidObjectId(commentId)) {
        throw new ApiError(400, "Invalid comment id.")
    }

    const deletedComment = await Comment.findByIdAndDelete(commentId)

    if (!deletedComment) {
        throw new ApiError(404, "Comment not found.")
    }

    return res
        .status(200)
        .json(
            new apiResponse(200, {}, "Comment deleted successfully.")
        )
})

export {
    getVideoComments,
    addComment,
    updateComment,
    deleteComment
}