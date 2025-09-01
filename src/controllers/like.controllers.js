import mongoose, { isValidObjectId, Types } from "mongoose"
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


const getVideoLikes = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const userId = req.user?._id;

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video id.");
    }

    const likeCount = await Like.countDocuments({ video: videoId });

    let isLiked = false;
    if (userId) {
        isLiked = await Like.exists({ video: videoId, likedBy: userId });
    }

    return res
        .status(200)
        .json(new apiResponse(200, { likeCount, isLiked }, "Likes fetched successfully"));
});


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

const getVideoCommentsWithLikes = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const userId = req.user?._id;
  
    if (!isValidObjectId(videoId)) {
      throw new ApiError(400, "Invalid video id.");
    }
  
    const comments = await Comment.aggregate([
      // Match only comments for this video
      {
        $match: { video: new Types.ObjectId(videoId) }
      },
      {
        $sort : {createdAt : -1}
      },
     
      {
        $lookup: {
          from: "likes",
          localField: "_id",
          foreignField: "comment",
          as: "likes"
        }
      },
  
      // Lookup owner details
      {
        $lookup: {
          from: "users",
          localField: "owner",
          foreignField: "_id",
          as: "owner"
        }
      },
  
      // Add computed fields
      {
        $addFields: {
          likeCount: { $size: "$likes" },
          isLiked: userId
            ? { $in: [new Types.ObjectId(userId), "$likes.likedBy"] }
            : false,
          owner: { $arrayElemAt: ["$owner", 0] }
        }
      },
  
      // Project only needed fields
      {
        $project: {
          _id: 1,
          content: 1,
          video: 1,
          createdAt: 1,
          likeCount: 1,
          isLiked: 1,
          "owner._id": 1,
          "owner.username": 1,
          "owner.avatar": 1
        }
      }
    ]);
  
    console.log("Aggregated comments:", comments.length);
    console.log("Sample comment:", comments[0]);
  
    return res
      .status(200)
      .json(new apiResponse(200, comments, "Comments with likes fetched successfully"));
  });


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
            new apiResponse(200, { likeCount }, existingLike ? "Tweet Unliked" : "Tweet Liked")
        )
})

const getLikedVideos = asyncHandler(async (req, res) => {
    const {username} = req.params; 

    const user = await User.findOne({ username }).select("_id username avatar");
    if (!user) {
        throw new ApiError(404, "User not found");
    }

    const likedVideos = await Like.find({
        likedBy: user._id,
        video: { $ne: null }
    })
            .populate("video", "title thumbnail videoFile duration viewedBy") // select fields from Video
    .sort({ createdAt: -1 }); // recent likes first

    return res
    .status(200)
    .json(new apiResponse(200, { user, likedVideos },"Liked videos fetched successfully"));
})

export {
    toggleVideoLike,
    getVideoLikes,
    toggleCommentLike,
    toggleTweetLike,
    getLikedVideos,
    getVideoCommentsWithLikes
}
