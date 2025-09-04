import mongoose, { isValidObjectId } from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { apiResponse } from "../utils/apiResponse.js";
import { User } from "../models/user.models.js";
import { Subscription } from "../models/subscription.models.js"


const toggleSubscription = asyncHandler(async (req, res) => {
  const { channelId } = req.body; // video's owner id
  const subscriberId = req.user._id; // subscriber id

  if (!channelId) {
    throw new ApiError(400, "Channel ID is required.");
  }

  if (!isValidObjectId(channelId)) {
    throw new ApiError(400, "Invalid Channel ID.");
  }

  if (channelId.toString() === subscriberId.toString()) {
    throw new ApiError(400, "You cannot subscribe to your own channel.");
  }

  // Check if subscription already exists
  const existingSubscription = await Subscription.findOne({
    channel: channelId,
    subscriber: subscriberId
  });

  if (existingSubscription) {
    // Unsubscribe (delete it)
    await existingSubscription.deleteOne();
    return res.status(200).json(
      new apiResponse(200, { subscribed: false }, "Unsubscribed from the channel.")
    );
  } else {
    // Subscribe (create it)
    await Subscription.create({
      channel: channelId,
      subscriber: subscriberId
    });

    return res.status(200).json(
      new apiResponse(200, { subscribed: true }, "Subscribed to the channel.")
    );
  }
});


// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
  try {
    const { channelId } = req.params; // channel id is userId

    // pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 100;
    const skip = (page - 1) * limit;

    if (!isValidObjectId(channelId)) {
      throw new ApiError(400, "Channel Id or User Id is required.");
    }

    const channelUser = await User.findOne({ _id: channelId });
    if (!channelUser) {
      throw new ApiError(404, `Channel with the channel id "${channelId}" not found.`);
    }

    // Count total subscribers
    const totalSubscribers = await Subscription.countDocuments({ channel: channelUser._id });

    // Get paginated subscribers
    const subscriptions = await Subscription.find({ channel: channelUser._id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("subscriber", "username email fullname avatar");

    const subscribers = subscriptions.map((sub) => sub.subscriber);

    return res.status(200).json(
      new apiResponse(200, {
        subscribers,
        total: totalSubscribers,
        page,
        limit,
        totalPages: Math.ceil(totalSubscribers / limit)
      }, "Subscribers fetched successfully.")
    );
  } catch (error) {
    return res.status(500).json(
      new apiResponse(500, {}, error.message || "Server Error")
    );
  }
});


// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
  try {
    const { subscriberId } = req.params;

    // pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 100;
    const skip = (page - 1) * limit;

    if (!subscriberId || !isValidObjectId(subscriberId)) {
      throw new ApiError(400, "Subscriber ID is required or Invalid Subscriber ID.");
    }

    const subscriptions = await Subscription.aggregate([
      { 
        $match : { subscriber : new mongoose.Types.ObjectId(subscriberId)}
      },
      {
        $lookup : {
          from : "users",
          localField : "channel",
          foreignField : "_id",
          as : "channel", 
          pipeline : [
            {
              $project : {
              _id: 1,
                username: 1,
                fullname: 1,
                coverImage: 1,
                avatar: 1,
              }
            }  
          ]
        }
      }, 
      { $unwind : "$channel"},

      {
        $lookup : {
          from : "videos",
          let : {channelId : "$channel._id"}, 
          pipeline : [
            { $match: { $expr: { $eq: ["$owner", "$$channelId"] } } },
            {$count : "videoCount"}
          ], 
          as : "videos"
        }
      }, 
      {
        $addFields : {
         videoCount: { $ifNull: [{ $arrayElemAt: ["$videos.videoCount", 0] }, 0] }
        }
      }, 
      {
        $lookup: {
          from: "subscriptions",
          let: { channelId: "$channel._id" },
          pipeline: [
            { $match: { $expr: { $eq: ["$channel", "$$channelId"] } } },
            { $count: "subscriberCount" }
          ],
          as: "subscribers"
        }
      }, 
      {
        $addFields: {
          subscriberCount: { $ifNull: [{ $arrayElemAt: ["$subscribers.subscriberCount", 0] }, 0] }
        }
      },
      {
        $project: {
          _id: 0,
          channel: 1,
          videoCount: 1,
          subscriberCount: 1
        }
      },

      { $skip: skip },
      { $limit: limit }
    ])
    

    res.status(200).json(
      new apiResponse(200, { subscriptions }, "Subscribed channels fetched successfully.")
    );
    
  } catch (error) {
    res.status(500).json(
      new apiResponse(500, {}, error.message || "Server Error")
    );
  }
});

const getSubscription = asyncHandler(async (req, res) => {
  const { channelId } = req.query;  // video's owner id
  const subscriberId = req.user._id; // subscriber id

  if (!channelId) {
    throw new ApiError(400, "Channel ID is required.");
  }

  if (!isValidObjectId(channelId)) {
    throw new ApiError(400, "Invalid Channel ID.");
  }

  if (channelId.toString() === subscriberId.toString()) {
    throw new ApiError(400, "You cannot subscribe to your own channel.");
  }

  // Check if subscription already exists
  const existingSubscription = await Subscription.findOne({
    channel: channelId,
    subscriber: subscriberId
  });

  if (existingSubscription) {
    return res.status(200).json(
      new apiResponse(200, { subscribed: true }, "User is subscribed to this channel.")
    );
  } else {
    return res.status(200).json(
      new apiResponse(200, { subscribed: false }, "User is not subscribed to this channel.")
    );
  }
});





export {
  toggleSubscription,
  getSubscription, // for either a user has subscribed or not 
  getUserChannelSubscribers,
  getSubscribedChannels
}