import mongooes, {Schema} from "mongoose"
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const userSchema = new Schema(
    {
        username : {
            type : String,
            required : true,
            unique : true,
            lowercase : true,
            trim : true,
            index : true,  // this hepls better searching potential in database
        },
        email : {
            type : String,
            required : true,
            unique : true,
            lowercase : true,
            trim : true,
        },
        fullname : {
            type : String,
            required : true,
            trim : true,
            index : true
        },
        avatar : {
            type : String, // this service is being taken from cloudinary
            required : true,
        },
        watchHistory : [
            {
                type : Schema.Types.ObjectId,
                ref : "video"
            }
        ],
        password : {
            type : String,
            required : [true , 'password is required!']
        },
        refreshTocken : { 
            type : String
        },
    },{timestamps : true}
)

//suing pre hook to store hashed password before saving into the satabase
// aviod arrow fnction because arrow function does not have context of "this" keyword
userSchema.pre("save" , async function(next) { // next ko aise interpret kar lo like a flag , jo ki batata hai kaam ho gya ab isse aage paas kar do.
    if(!this.isModified("password")) return next();
    this.password = bcrypt.hash(this.password, 10) // hash take parameter as kisko encrpt karna hai aur kitne  round ya salt. salt is like extra addition of charecter or somthing like that
    next(); // here next() means kaam pura h gya hai aage badh ja 
} )

// till here we have done with the hashing part of password, now we need to check if the user entered the pasword is correct or note. 

userSchema.methods.ispasswordCorrect = async function (password){
    return await bcrypt.compare(password, this.password)
}

export const User = mongooes.model("User", userSchema)