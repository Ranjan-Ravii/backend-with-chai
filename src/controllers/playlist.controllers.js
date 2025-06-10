import mongoose, { isValidObjectId, Types } from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from "../utils/apiError.js"
import { Playlist } from "../models/playlist.modls.js";
import { apiResponse } from "../utils/apiResponse.js";
import {User } from "../models/user.models.js"


const createPlaylist = asyncHandler(async (req, res) => {
    const {name, description} = req.body
    const userId = req.user?._id;
    const {videoId} = req.params

    if(!isValidObjectId(userId)){
        throw new ApiError(400, "Invalid user id.");
    }
    if(!isValidObjectId(videoId)){
        throw new ApiError(400, "Invalid video id.");
    }

    if(!name || name == ""){
        throw new ApiError(400, "palylist name is required.")
    }

    const newPlaylist = await Playlist.create({
        name : name,
        description : description,
        video: [videoId],
        owner : userId
    })
    
    return res
    .status(200)
    .json(
        new apiResponse(200, newPlaylist, "playlist created")
    )
})

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params

    if(!isValidObjectId(playlistId) || !isValidObjectId(videoId)){
        throw new ApiError(400, "Invalid Playlist or video id.");
    }

    const updatedPlaylist = await Playlist.findByIdAndUpdate(
        playlistId,
        { $push : {video : videoId}},
        {new : true}
    )

    if(!updatedPlaylist){
        throw new ApiError(404, "Playlist not fonud.")
    }

    return res
    .status(200)
    .json(
        new apiResponse(200, updatedPlaylist, "Video added to Playlist.")
    )
})


const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
    
    if(!isValidObjectId(playlistId) || !isValidObjectId(videoId)){
        throw new ApiError(400, "Invalid playlist or video Id.")
    }

    const updatedPlaylist = await Playlist.findByIdAndUpdate(
        playlistId,
        {
            $pull : {video : videoId}
        },
        {new : true}
    )
     
    if(!updatedPlaylist){
        throw new ApiError(404, "Playlist not fonud.")
    }

    return res
    .status(200)
    .json(
        new apiResponse(200, updatedPlaylist, "Video removed from Playlist.")
    )
})

const updatePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    const {name, description} = req.body
    
    if(!isValidObjectId(playlistId)){
        throw new ApiError(400, "Invalid playlist Id.");
    }

    if(!name || name == ""){
        throw new ApiError(400, "Enter a valid playlist name.");
    }

    const updatedPlaylist = await Playlist.findByIdAndUpdate(
        playlistId,
        {
            $set : {
                name : name,
                description : description
            }
        },
        {new : true}
    )

    return res
    .status(200)
    .json(
        new apiResponse(200, updatedPlaylist, "Playlist updated succesfully.")
    )

})

const deletePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    
    if(!isValidObjectId(playlistId)){
        throw new ApiError(400, "Invlid Playlist Id.")
    }

    await Playlist.findByIdAndDelete(playlistId)

    return res
    .status(204)
    .json(
        new apiResponse(204, {}, "Playlist deleted successfully." )
    )
})


const getPlaylistById = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    
    if(!isValidObjectId(playlistId)){
        throw new ApiError(400, "Invalid playlist Id.")
    }

    const playlist = await Playlist.findById(playlistId);
   
    return res 
    .status(200)
    .json(
        new apiResponse(200, playlist, "playlist fetched successfully.")
    )
})

const getUserPlaylists = asyncHandler(async (req, res) => {
    const {userId} = req.params

    if(!isValidObjectId(userId)){
        throw new ApiError(400, "Invalid user id.")
    }
    
    const userPlaylist = await User.aggregate([
        {
            $match : {
               _id: new Types.ObjectId(userId)
            }
        },
        {
            $lookup :{
                from : "playlists",
                localField : "_id",
                foreignField : "owner",
                as : "usersPlaylist"
            }
        },
        {
            $project : {
                username : 1, 
                avatar : 1, 
                usersPlaylist : 1
            }
        }
    ])

    return res 
    .status(200)
    .json(
        new apiResponse(200, {userPlaylist}, "Playlist fetched successfully." )
    )
})




export {
    createPlaylist,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    updatePlaylist,
    deletePlaylist,
    getPlaylistById,
    getUserPlaylists
}