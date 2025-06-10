import mongoose, { isValidObjectId } from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { apiResponse } from "../utils/apiResponse.js";
import { User } from "../models/user.models.js";
import { Subscription } from "../models/subscription.models.js"


const toggleSubscription = asyncHandler(async (req, res) => {
  const { channelId } = req.params;
  const subscriberId = req.user._id;

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
      new apiResponse(200, {}, "Unsubscribed from the channel.")
    );
  } else {
    // Subscribe (create it)
    await Subscription.create({
      channel: channelId,
      subscriber: subscriberId
    });

    return res.status(200).json(
      new apiResponse(200, {}, "Subscribed to the channel.")
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

    const channelUser = await User.findOne(channelId);
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
      .populate("subscriber", "username email fullname avatar -password");

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


    if (!subscriberId) {
      throw new ApiError(400, "Subscriber ID is required.");
    }

    if (!isValidObjectId(subscriberId)) {
      throw new ApiError(400, "Invalid Subscriber ID.");
    }

    //total subscriptions
     const total = await Subscription.countDocuments({ subscriber: subscriberId });

    // 1. Find all subscriptions by this user
    const subscriptions = await Subscription.find({ subscriber: subscriberId })
      .skip(skip)
      .limit(limit)
      .populate("channel", "username email fullname avatar -password");

    // 2. Extract channel info
    const channels = subscriptions.map((sub) => sub.channel);

    return res.status(200).json(
      new apiResponse(200, 
        {
          channels,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
        }
        , "Subscribed channels fetched successfully.")
    );
  } catch (error) {
    return res.status(500).json(
      new apiResponse(500, {}, error.message || "Server Error")
    );
  }
});



export {
  toggleSubscription,
  getUserChannelSubscribers,
  getSubscribedChannels
}