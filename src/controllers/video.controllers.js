import mongoose, { model } from "mongoose";
import {v2 as cloudinary} from "cloudinary"
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { apiResponse } from "../utils/apiResponse.js";
import { Video } from "../models/video.models.js";


const uploadAVideo = asyncHandler(async (req, res) => {
    /*
        1. take the title, description and video from user
        2. upload to cloudinary
        3. create a video
    */

    // console.log("path : ",req.body);


    const { title, description } = req.body
    const videoLocalPath = req.file?.path
    // console.log(videoLocalPath);

    if (!(title && description && videoLocalPath)) {
        throw new ApiError(400, "All fiels are required.")
    }

    const videoData = await uploadOnCloudinary(videoLocalPath);
    const thumbnailUrl = videoData.url.replace('/upload/', '/upload/so_3/').replace('.mp4', '.jpg');


    if (!(videoData || videoData?.url)) {
        throw new ApiError(400, "Something went wrong while uploading video.")
    }

    // console.log(videoData);
    // console.log(req.user);



    const newVideo = await Video.create({
        videoFile: videoData?.url,
        thumbnail: thumbnailUrl,
        title: title,
        description: description,
        duration: videoData.duration,
        views: 0,
        cloudinaryPublicId : videoData.public_id,
        isPublished: false,
        owner: req.user?._id
    })

    return res.status(200)
        .json(
            new apiResponse(200, newVideo, "video uploaded successfully")
        )

})

// get a  video wiht its id
const getVideoById = asyncHandler(async (req, res) => {
    console.log("Request paramaters", req.params);

    const { videoId } = req.params

    console.log("video id from params : ", videoId);


    if (!videoId) {
        throw new ApiError(400, "Invalid video id.")
    }

    const video = await Video.findOne(
        { _id: videoId },
        {
            _id: 1,
            videoFile: 1,
            title: 1,
            owner: 1
        }
    );

    if (!video) {
        throw new ApiError(404, "Video not found.");
    }

    return res.status(200)
        .json(
            new apiResponse(200, video, "Video fetched successfully.")
        )
})

//TODO: update video details like title, description, thumbnail
const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    const { title, description } = req.body
    const thumbnailLocalPath = req.file?.path

    console.log(videoId);
    console.log("title : ", title, "description : ", description);
    console.log("Thumbnail local path", thumbnailLocalPath);

    if (!videoId) {
        throw new ApiError(400, "Invalid video id.")
    }

    if (!title || !description) {
        throw new ApiError(400, `At least one of title, description.`);
    }
    if (!thumbnailLocalPath) {
        throw new ApiError(400, "or thumbnail is required.");
    }


    //before updating uploade thumbnail to cloudinary. 
    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath)

    if (!thumbnail) {
        throw new ApiError(400, "something went wront while uploading thumbnail.")
    }

    // model.findByIdAndUpdate(id, {update}, {Option}, {callback}) :- syntax
    const updatedVideo = await Video.findByIdAndUpdate(
        videoId,
        {
            $set: {
                title: title,
                description: description,
                thumbnail: thumbnail.url
            },
        },
        {
            new: true,
            timestamps: true
        }
    );

    console.log(updatedVideo);


    return res
    .status(200)
    .json(
        new apiResponse(200, { updatedVideo }, "Video details updated.")
    )


})

//TODO: delete video
const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    if(!videoId){
        throw new ApiError(400, "Video ID is required.");
    }

    const  video = await Video.findByIdAndDelete(
        videoId
    )

    if(!video){
        throw new ApiError(400, "video not found.")
    }

    if(video.cloudinaryPublicId){
        await cloudinary.uploader.destroy(video.cloudinaryPublicId,
            {
                resource_type : "video"
            }
        )
    }

    res.status(200)
    .json(
        new apiResponse(200, {}, "video deleted successfully.")
    )
})

export {
    uploadAVideo,
    getVideoById,
    updateVideo,
    deleteVideo
} 