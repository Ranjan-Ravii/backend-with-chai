import { User } from "../models/user.models.js";
import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken"

// to verif the loged in user credential. 
export const verifyJWT = asyncHandler( async (req, res, next) => {
    try {
        const token =  req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer " , "");
        console.log("Token:", token);
 
        if(!token){
            throw new ApiError(401, "unauthorized request");
        }
    
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    
        const user = await  User.findById(decodedToken?._id).select("-password -refreshToken")
    
        if(!user){
            throw new ApiError(401, "Invalid access token")
        }
    
        req.user = user
        next()  

    } catch (error) {
        throw new ApiError(401,  Error?.message || "invalid access token");
    }
})