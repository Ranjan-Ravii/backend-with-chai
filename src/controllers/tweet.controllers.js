import mongoose, { isValidObjectId } from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { Tweet } from "../models/tweet.models.js";
import { apiResponse } from "../utils/apiResponse";
import { User } from "../models/user.models";

const createTweet = asyncHandler(async (req, res) => { 
    const {userId} = req.user?._id
    const {tweet} = req.body

    if(!tweet || tweet == ""){
        throw new ApiError(400, "Invalid tweet.")
    }

    if(!isValidObjectId(using)){
        throw new ApiError(400, "You need to login to make tweets.")
    }
    
    const newTweet = await Tweet.create({
        owner : userId,
        content : tweet
    })

    return res
    .status(200)
    .json(
        new apiResponse(200, newTweet, "Tweet made successfully.")
    )
})

const getUserTweets = asyncHandler(async (req, res) => {
    const {userId} = req.user?._id

    if(!isValidObjectId(userId)){
        throw new ApiError(401, "Invalid user, Authentication required." )
    }

    const userTweets = await User.aggregate([
        {
            $match : {
                _id : userId
            }
        },
        {
            $lookup : {
                from : "tweets",
                localField : "_id",
                foreignField : "owner",
                as : "userTweets"
            }
        },
        {
            $project : {
                avatar : 1,
                username : 1,
                userTweets : 1
            }
        }
    ])

    return res 
    .status(200)
    .json(
        new apiResponse(200, userTweets, "Tweets fetched successfully." )
    )

})

const updateTweets = asyncHandler(async (req, res) => {
    const {tweetId} = res.params
    const {userId} = req.user?._id
    const {newTweet} = req.body

    if(!isValidObjectId(tweetId)){
        throw new ApiError(400, "Invalid tweet id.");
    }
    if(!isValidObjectId(userId)){
        throw new ApiError(400, "Invalid User Id.");
    }
    if(!newTweet || newTweet == ""){
        throw new ApiError(400, "Provide new tweet.")
    }

    const updatedTweet = await Tweet.findByIdAndUpdate(
        tweetId,
        {
            content : newTweet
        }
    )

    return res
    .status(200)
    .json(
        new apiResponse(200, updatedTweet, "Tweet updated successfully.")
    )
})

const deleteTweets = asyncHandler(async (req, res) => {
    const {tweetId} = res.params
    const {userId} = req.user?._id

    
    if(!isValidObjectId(tweetId)){
        throw new ApiError(400, "Invalid tweet id.");
    }
    if(!isValidObjectId(userId)){
        throw new ApiError(400, "Invalid User Id.");
    }

    await Tweet.findByIdAndDelete(tweetId)

    return res
    .status(204)
    .json(204, {}, "Tweet deteled successfully.")
})


export {
    createTweet, 
    getUserTweets,
    updateTweets,
    deleteTweets
}