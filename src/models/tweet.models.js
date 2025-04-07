import mongoose, { model, Schema } from "mongoose"
import { type } from "os"
import { User } from "./user.models"

const tweetSchema = new Schema(
    {
        owner: {
            type: Schema.Types.ObjectId,
            ref: "User",
            require: true
        },
        content : {
            type : String,
            require : true
        }
    },{timestamps: true}
)

export const {Tweet} = mongoose.model("Tweet", tweetSchema)