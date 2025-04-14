import mongoose , {isValidObjectId} from "mongoose"
import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/apiError"
import { apiResponse } from "../utils/apiResponse"
import { Like } from "../models/like.models.js"
import { Video } from "../models/video.models.js"


const toggleVideoLike = asyncHandler(async (req, res) => {
    const {videoId} = req.params
    const userId = req.user?._id

    if(!isValidObjectId(videoId)){
        throw new ApiError(400, "invalid video id.")
    }

    const video = await Video.findById(videoId)
    if(!video){
        throw new ApiError(400, "video not find.")
    }

    const existingLike = await Like.findOne({
        video: videoId,
        likedBy: userId
    });

    let message
    if(existingLike){
        await existingLike.deleteOne()
        message = "Video Unliked"
        
    }else{
        await Like.create({
            video : videoId,
            likedBy : userId
        })
        message = "Video Liked"
    }

    const likeCount = await Like.countDocuments({video : videoId}) // this will give the like count on the particular video

    return res
        .status(200)
        .json(
            new apiResponse(200, {likeCount}, message)
        )
  
})

const toggleCommentLike = asyncHandler(async (req, res) => {
    const {commentId} = req.params
    //TODO: toggle like on comment

    

})

const toggleTweetLike = asyncHandler(async (req, res) => {
    const {tweetId} = req.params
    //TODO: toggle like on tweet
}
)

const getLikedVideos = asyncHandler(async (req, res) => {
    //TODO: get all liked videos
})

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}
