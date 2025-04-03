import { User } from "../models/user.models.js";
import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken"


export const verifyJWT = asyncHandler( (req, res, next) => {
    try {
        const token = req.cookies?.accessToken || req.header("Authentication")?.replace("bearer " , "");
    
        if(!token){
            throw new ApiError(401, "unauthorized request");
        }
    
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    
        const user =  User.findById(decodedToken?._id).select("-password -refreshToken")
    
        if(!user){
            throw new ApiError(401, "Invalid access token")
        }
    
        req.user = user
        next()

    } catch (error) {
        throw new ApiError(401, error?.message || "invalid access token");
    }
})