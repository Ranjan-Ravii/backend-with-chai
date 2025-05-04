import mongoose, { Schema } from "mongoose";

const playlistSchema = new Schema(
    {
        name : {
            type : String,
            require : true
        },
        description : { 
            type : String,
        },
        video : [{
            type : Schema.Types.ObjectId,
            ref : "Video"
        }],
        owner : {
            type : Schema.Types.ObjectId,
            ref : "User"
        }
    }
)

export const Playlist = mongoose.model("Playlist", playlistSchema)