import mongooes , {Schema} from "mongoose"

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
        views : {
            type : Number,
            default : 0
        },
        isPublished : {
            type : Boolean,
            default : true
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

export const Video = mongooes.model("Vdeo" , videoSchema);