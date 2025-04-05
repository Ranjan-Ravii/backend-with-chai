import mongoose, { model, Schema } from "mongoose"
import { type } from "os"

const subscriptionSchema = new Schema(
    {
        subscriber : {
            type : Schema.Types.ObjectId,
            ref : "User",
            require : true
        }, 
        channel : {
            type : Schema.Types.ObjectId,
            ref : "User", 
            require : true
        }
    },
    {timestamps:true}
)

export const  Subscription = mongoose.model("Subscription", subscriptionSchema);