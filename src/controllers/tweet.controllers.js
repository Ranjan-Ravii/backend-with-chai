import mongoose, { isValidObjectId } from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { Tweet } from "../models/tweet.models.js";
import { apiResponse } from "../utils/apiResponse.js";
import { User } from "../models/user.models.js";

const createTweet = asyncHandler(async (req, res) => {
    const userId = req.user?._id;
    const { tweet } = req.body

    if (!tweet || tweet == "") {
        throw new ApiError(400, "Invalid tweet.")
    }

    if (!isValidObjectId(userId)) {
        throw new ApiError(400, "You need to login to make tweets.")
    }

    const newTweet = await Tweet.create({
        owner: userId,
        content: tweet
    })

    return res
        .status(200)
        .json(
            new apiResponse(200, newTweet, "Tweet made successfully.")
        )
})

const getUserTweets = asyncHandler(async (req, res) => {
    const { username } = req.params;

    if (!username) {
        throw new ApiError(401, "Invalid username")
    }

    const user = await User.findOne({ username });
    if (!user) {
        throw new ApiError(404, "User not found.");
    }

    const userTweets = await Tweet.find({ owner: user._id }).sort({ createdAt: -1 });

    return res
        .status(200)
        .json(
            new apiResponse(200, userTweets, "Tweets fetched successfully.")
        )

})

const updateTweets = asyncHandler(async (req, res) => {
    const tweetId = req.params.tweetId;
    const userId = req.user?._id;
    const { newTweet } = req.body

    if (!isValidObjectId(tweetId)) {
        throw new ApiError(400, "Invalid tweet id.");
    }
    if (!isValidObjectId(userId)) {
        throw new ApiError(400, "Invalid User Id.");
    }
    if (!newTweet || newTweet == "") {
        throw new ApiError(400, "Provide new tweet.")
    }

    //acidental update by other 
    const tweet = await Tweet.findById(tweetId);
    if (!tweet || tweet.owner.toString() !== userId.toString()) {
        throw new ApiError(403, "Not authorized to modify this tweet.");
    }

    const updatedTweet = await Tweet.findByIdAndUpdate(
        tweetId,
        { content: newTweet },
        { new: true }
    );

    return res
        .status(200)
        .json(
            new apiResponse(200, updatedTweet, "Tweet updated successfully.")
        )
})

const deleteTweets = asyncHandler(async (req, res) => {
    const tweetId = req.params.tweetId;
    const userId = req.user?._id;

    if (!isValidObjectId(tweetId)) {
        throw new ApiError(400, "Invalid tweet id.");
    }
    if (!isValidObjectId(userId)) {
        throw new ApiError(400, "Invalid User Id.");
    }

    //acidental delete by other 
    const tweet = await Tweet.findById(tweetId);
    if (!tweet || tweet.owner.toString() !== userId.toString()) {
        throw new ApiError(403, "Not authorized to modify this tweet.");
    }

    await Tweet.findByIdAndDelete(tweetId)

    return res.status(200).json(
        new apiResponse(200, {}, "Tweet deleted successfully.")
    );
})


export {
    createTweet,
    getUserTweets,
    updateTweets,
    deleteTweets
}