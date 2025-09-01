import mongoose , {Schema} from "mongoose"
import mongooseAggregatePaginate from  "mongoose-aggregate-paginate-v2"
import { type } from "os";

const videoSchema = new Schema(
    {
        videoFile : {
            type : String, // from cloudinary url
            required : true,
        },
        thumbnail : {
            type : String, // from cloudinary url
            required : true,
        },
        title : {
            type : String,
            required  :true,
        },
        description : {
            type : String,
            required : true,
        },
        duration : {
            type : Number,
            required : true,
        },
        viewedBy : [
            {
                type : Schema.Types.ObjectId,
                ref : "User",
            }
        ],
        isPublished : {
            type : Boolean,
            default : true
        },
        cloudinaryPublicId : {
            type : String
        },
        owner : {
            type : Schema.Types.ObjectId,
            ref : "User",
            required : true
        },
    },
    {timestamps : true}
)

videoSchema.plugin(mongooseAggregatePaginate)

export const Video = mongoose.model("Video" , videoSchema);