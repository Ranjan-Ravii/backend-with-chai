import mongoose, { isValidObjectId } from "mongoose"
import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/apiError.js"
import { apiResponse } from "../utils/apiResponse.js"
import { Like } from "../models/like.models.js"
import { Video } from "../models/video.models.js"
import { User } from "../models/user.models.js"
import { Comment } from "../models/comment.models.js"
import { Tweet } from "../models/tweet.models.js"


const toggleVideoLike = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    const userId = req.user?._id

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "invalid video id.")
    }
    if (!isValidObjectId(userId)) {
        throw new ApiError(400, "invalid user id.")
    }

    const video = await Video.findById(videoId)
    if (!video) {
        throw new ApiError(400, "video not find.")
    }

    const existingLike = await Like.findOne({
        video: videoId,
        likedBy: userId
    });

    let message
    if (existingLike) {
        await existingLike.deleteOne()
        message = "Video Unliked"

    } else {
        await Like.create({
            video: videoId,
            likedBy: userId
        })
        message = "Video Liked"
    }

    const likeCount = await Like.countDocuments({ video: videoId }) // this will give the like count on the particular video

    return res
        .status(200)
        .json(
            new apiResponse(200, { likeCount }, existingLike ? "Video Unliked" : "Video Liked")
        )

})

const toggleCommentLike = asyncHandler(async (req, res) => {
    const { commentId } = req.params
    const userId = req.user?._id

    if (!isValidObjectId(commentId)) {
        throw new ApiError(400, "invalid comment id.")
    }
    if (!isValidObjectId(userId)) {
        throw new ApiError(400, "invalid user id.")
    }

    const comment = await Comment.findById(commentId)
    if (!comment) {
        throw new ApiError(404, "Comment not found.")
    }

    const existingLike = await Like.findOne({ comment: commentId, likedBy: userId });

    let message;
    if (existingLike) {
        await existingLike.deleteOne()
        message = "Comment Unliked."
    }
    else {
        await Like.create({
            comment: commentId,
            likedBy: userId
        })
        message = "Comment Liked"
    }

    const likeCount = await Like.countDocuments({ comment: commentId })

   return res
    .status(200)
    .json(
        new apiResponse(200, { likeCount }, message = existingLike ? "Comment Unliked" : "Comment Liked")
    )

})

const toggleTweetLike = asyncHandler(async (req, res) => {
    const { tweetId } = req.params
    const userId = req.user?._id

    if (!isValidObjectId(tweetId)) {
        throw new ApiError(400, "invalid tweet id.")
    }
    if (!isValidObjectId(userId)) {
        throw new ApiError(400, "invalid user id.")
    }

    const tweet = await Tweet.findById(tweetId);
    if (!tweet) {
        throw new ApiError(404, "Tweet not found.");
    }

    const existingLike = await Like.findOne({
        tweet: tweetId,
        likedBy: userId
    });

    let message;
    if (existingLike) {
        await existingLike.deleteOne()
        message = "Tweet Unliked."
    }
    else {
        await Like.create({
            tweet: tweetId,
            likedBy: userId
        })
        message = "Tweet liked"
    }

    const likeCount = await Like.countDocuments({ tweet: tweetId })

    return res
        .status(200)
        .json(
            new apiResponse(200, {likeCount} , existingLike ? "Tweet Unliked" : "Tweet Liked" )
        )
})

const getLikedVideos = asyncHandler(async (req, res) => {
    const userId = req.user?._id

    if (!isValidObjectId(userId)) {
        throw new ApiError(400, "Invalid User Id.")
    }

    const likedVideos = await User.aggregate([
        {
            $match: {
                _id: userId
            }
        },
        {
            $lookup: {
                from: "likes",
                localField: "_id",
                foreignField: "likedBy",
                as: "userLikes"
            },
        },
        {
            $project: {
                username: 1,
                avatar: 1,
                userLikes: {
                    $filter: {
                        input: "$userLikes",
                        as: "like",
                        cond: { $ne: ["$$like.video", null] }
                    }
                }
            }
        }
    ])

    const populatedLikes = await User.populate(likedVideos, {
        path: "userLikes.video", // This will populate the `video` field
        select: "title thumbnail duration views" // Choose which fields to return from the video document
    });

    return res
        .status(200)
        .json(
            new apiResponse(200, populatedLikes, "Liked videos fetched successfully")
        )
})

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}
