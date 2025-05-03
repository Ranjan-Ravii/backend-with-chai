import mongoose, { isValidObjectId } from "mongoose"
import { Comment } from "../models/comment.model.js"
import { Video } from "../models/video.models.js"
import { ApiError } from "../utils/apiError.js"
import { apiResponse } from "../utils/apiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"

const getVideoComments = asyncHandler(async (req, res) => {
    //TODO: get all comments for a video
    const { videoId } = req.params
    const { page = 1, limit = 10 } = req.query

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video id.")
    }

    const comments = await Video.aggregate([
        {
            $match: {
                _id: videoId
            }
        },
        {
            $lookup: {
                from: "comments",
                localField: "_id",
                foreignField: "video",
                as: "comments"
            }
        },
        {
            $lookup : {
                from : "users",
                localField : "comments.owner",
                foreignField : "_id",
                as : "comments.user"
            }
        },
        {
            $project: {
                _id: 1,
                title : 1,
                comments: 1,
            }
        }
    ])

    return res
        .status(200)
        .json(
            new apiResponse(200, comments, "Comments fetched successfully.")
        )

})

const addComment = asyncHandler(async (req, res) => {
    //get video on which comment is made
    // validate the id of video
    // validate if user is loged in
    // create a  new comment object 

    const { videoId } = req.params
    const { commentFromUser } = req.body
    const userId = req.user?._id

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "invalid video id");
    }

    if (!isValidObjectId(userId)) {
        throw new ApiError(400, "user should be loged in to comment");
    }

    if (commentFromUser != "") {
        const comment = await Comment.create({
            content: commentFromUser,
            video: videoId,
            owner: userId
        })

        return res.status(200)
            .json(
                new apiResponse(200, comment, "comment made successfully.")
            )
    }
    else {
        throw new ApiError(400, "Add comment to post.");
    }


})

const updateComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params
    const { newCommentFromUser } = req.body
    const userId = req.user?._id

    if (!isValidObjectId(commentId)) {
        throw new ApiError(400, "Invalid video id");
    }

    if (!isValidObjectId(userId)) {
        throw new ApiError(400, "User should be loged in to comment");
    }

    if (!newCommentFromUser) {
        throw new ApiError(400, "Add comment to update.")
    }

    const updatedComment = await Comment.findById(
        commentId,
        // async (err, result) => {
        //     if(err){
        //         throw new ApiError(400, "Error occured while fetching comment");
        //     }
        //     else if(!result){
        //         throw new ApiError(400, "Comment not found");
        //     }
        //     else{
        //         // check if the userId is available in  the result.owner
        //         if(result.owner.equals(userId)){
        //             result.content = newCommentFromUser
        //             await result.save();
        //         }
        //         else{
        //             throw new ApiError(403, "User is not the owner of comment.")
        //         }
        //     }
        // } // this block of code is inefficient because we have to make another query for geting the updated comment.
    )

    if (!updatedComment) {
        throw new ApiError(400, "Comment not found.")
    }

    updatedComment.content = newCommentFromUser
    await updatedComment.save();

    return res
        .status(200)
        .json(
            new apiResponse(200, { updatedComment }, "Comment updated successfully.")
        )

})

const deleteComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params

    if (!isValidObjectId(commentId)) {
        throw new ApiError(400, "Invaid commnet id.")
    }

    await Comment.findByIdAndDelete(
        commentId,
    )

    return res
        .status(200)
        .json(200, {}, "Comment deleted successfully.")
})

export {
    getVideoComments,
    addComment,
    updateComment,
    deleteComment
}