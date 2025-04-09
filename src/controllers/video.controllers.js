import mongoose from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { apiResponse } from "../utils/apiResponse.js";
import { Video } from "../models/video.models.js";


const uploadAVideo = asyncHandler( async (req, res) => {
    /*
        1. take the title, description and video from user
        2. upload to cloudinary
        3. create a video
    */
    
    // console.log("path : ",req.body);
    

    const {title, description} = req.body
    const  videoLocalPath = req.file?.path
    // console.log(videoLocalPath);
    
    if(!(title && description && videoLocalPath)){
        throw new ApiError(400, "All fiels are required.")
    }

    const videoData = await uploadOnCloudinary(videoLocalPath);
    const thumbnailUrl = videoData.url.replace('/upload/', '/upload/so_3/').replace('.mp4', '.jpg');


    if(!(videoData || videoData?.url)){
        throw new ApiError(400, "Something went wrong while uploading video.")
    }

    // console.log(videoData);
    // console.log(req.user);
    
    

    const newVideo = await Video.create({
        videoFile : videoData?.url,
        thumbnail : thumbnailUrl,
        title : title,
        description : description,
        duration : videoData.duration,
        views : 0, 
        isPublished : false,
        owner : req.user?._id
    })

    return res.status(200)
    .json(
        new apiResponse(200, newVideo, "video uploaded successfully")
    )

})


export {
    uploadAVideo,
}