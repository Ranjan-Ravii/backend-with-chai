import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js"
import { User } from "../models/user.models.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { upload } from "../middlewares/multer.middleware.js";
import { apiResponse } from "../utils/apiResponse.js";
import jwt from "jsonwebtoken";
import { send } from "process";

const generateAccessAndRefershToken = async (userID) =>{
    try {
        const user = await User.findById(userID);

        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken;

        await user.save({validateBeforeSave : false}) // stop validating other credential before saving

        return {accessToken, refreshToken}

    } catch (error) {
        throw new ApiError(501 , "Error while generating access token and refresh token.")
    }
}

const registerUser = asyncHandler(async (req, res) => {

    /*
    steps/logic for user registration
    1. get data from the frontend
    2. validate the data ,for exp. username is none empty, valid email formate etc.
    3. check if user already exists - using email or username
    4. check for image like avatar has uploaded to cloudinary 
    5. upload to the cloudinary
    6. create a user object i.e entry in db
    7. remove the password and refresh tocken form reponse
    8. check if user is created successfully.
    9. return res.
    */


    // step 1. get data from the frontend
    const { fullname, username, email, password } = req.body // in this way we can get data from json
    // console.log("fullname : ", fullname);

    //geting image files. you have to go through route -> multer middleware .



    // step 2. data validation
    /*
    if(fullname === ""){
        if (!fullname) {
            // console.error("API Error:", new ApiError(400, "username is required."));// console to debug
            return next(new ApiError(400, "Username is required."));
        }
        
    }
    */ //you can validte using if else, alternatively you can do the same usiung same().

    if (
        [fullname, username, email, password].some((field) => field?.trim() === "")
    ) {
        throw new ApiError(400, "All fields are required.");
    }

    // check formating of email
    // if (email.indexOf('@') === -1 || email.indexOf('gmail') === -1) {
    //     throw new Error("Please enter a valid 'Gmail' email.");
    // }
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
        throw new ApiError(400, "Please enter a valid email.");
    }


    // **************** step 3. user availability in db  *********************
    const existedUser = await User.findOne({
        $or: [{ email, username }]
    }) // this return UserDocument || null

    if (existedUser) {
        throw new ApiError(409, "User with this email or username already exist.")
    }

    // *************** step 4 check for images, check for avatar *************
    // console.log("Request files:", req.files);
    const avatarLocalPath = req.files?.avatar[0]?.path;
    // console.log(avatarLocalPath)
    // const coverImageLocalPath = req.files?.coverImage[0]?.path;

    if (!avatarLocalPath) { //check avtar file is available 
        throw new ApiError(400, "Avatar file required.")
    }

    let coverImageLocalPath;
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files.coverImage[0].path
    }
    
    // const avatar = await uploadOnCloudinary(avatarLocalPath );
    // const coverImage = await uploadOnCloudinary(coverImageLocalPath );

    let avatar;
    try {
        avatar = await uploadOnCloudinary(avatarLocalPath);
    } catch (error) {
        throw new ApiError(500, "Failed to upload avatar to Cloudinary.");
    }
    // console.log("Cloudinary upload result:", avatar);

    let coverImage;
    if (coverImageLocalPath) {
        try {
            coverImage = await uploadOnCloudinary(coverImageLocalPath);
        } catch (error) {
            throw new ApiError(500, "Failed to upload cover image to Cloudinary.");
        }
    }



    //***************** step 5 create user oject **************

    const user = await User.create({
        fullname,
        avatar: avatar?.url || "",
        coverImage: coverImage?.url || "",
        email,
        password,
        username: username.toLowerCase(),

    })

    // ************* step 6 remove the password and refresh tocken form reponse *********************
    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering user.")
    }

    return res.status(201).json(
        new apiResponse(201, createdUser, "User registered successfully.")
    )
})

// ******************************************** LECTURE 15 ***************************

//****************** user login ************************

const loginUser = asyncHandler( async (req, res) => {
    /*
        step 1. req body se user data le aao
        step 2. username ya email se access chahiye
        step 3. user ko find karo if yes
            -> passoword check karo , else
            -> error bhej do/ register karne ko bolo
        step 4. sab thik rha to access tocken and refresh token generate karo aur user ko bhej do cookies me
        step 5. response bhej do login ka 

    */

    // step 1. 
    const {username, email, password} = req.body
    console.log(username);
    console.log(email);
    
    //step 2.
    // if(!username || !email){
    //     throw new ApiError(400, "Username or email is required.");
    // }
    if (!username && !email) {
        throw new ApiError(400, "username or email is required")
    }

    //step 3. 
    const user = await User.findOne({
        $or : [ {email, username }]
    }) 

    if(!user){
        throw new ApiError(404, "User does not exist.")
    }

    const isPasswordValid = await user.isPasswordCorrect(password);
    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid user credentials")
    }
    
    const {accessToken, refreshToken} = await generateAccessAndRefershToken(user._id);

    // we have to make another call of db so that we can get updated data of user i.e refresh token

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

    const options = {
        httpOnly : true,
        secure : true
    }

    return res.status(200)
    .cookie("accessToken",accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
        new apiResponse(
            200,
            {
                user : loggedInUser, accessToken, refreshToken
            },
            "User loged in Successfully"
        )
    )
    /* erros while debugging
    1. missing await while finding the user. 
    2. typo in srtting cookie() instead of cookies(). 
    3. missing .js extension while importing.
    */
})


//*****************  logout user **********************
const logoutUser = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $unset:{
                refreshToken : 1, // this remove the field from document 
            }
        },
        {
            new : true 
        }
    )
    const options = {
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(
        new apiResponse(200,{}, "User logged out successfully.")
    )

    /*
        errors while debugging 
        1. typo in clearCookie. previously clearcookie
        2. extra argument in clearCookie(). previously clearCookie("refreshToken", refreshToken, options)

    */
})

//****************** refreshAccessToken endpoint (lec 16) **********************

const refreshAccessToken = asyncHandler(async (req, res) => {
    // step 1. get the access token of the user from db
    const incomimgRefreshToken = await req.cookies?.refreshToken || req.body.refreshToken

    //step 2. check if incomimgRefreshToken true that means value is coming.
    if(!incomimgRefreshToken){
        throw new ApiError(401, "Invalid Refresh Token.");
    }

    //step 2. decode the incomingRefreshToken
    try {
        const decodedRefreshToken = jwt.verify(
            incomimgRefreshToken,
            process.env.REFRESH_TOKEN_SECRE
        )
    
        const user = await User.findById(decodedRefreshToken._id);
    
        if(!user){
            throw new ApiError(401, "invalid refresh token.")
        }
    
        if (incomimgRefreshToken !== user?.refreshToken) {
            throw new ApiError(401, "Refresh token is expired or has been used.")
        }
    
        const {accessToken, newRefreshToken} = generateAccessAndRefershToken(user._id);
    
        const options = {
            httpOnly : true,
            secure : true
        }
    
        return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", newRefreshToken, options)
        .json(
            new apiResponse(
                200,
                {accessToken, refreshToken: newRefreshToken, },
                "Access token refreshed."
            )
        )    
    } catch (error) {
        throw new ApiError(401, error?.message ||
            "Invalid refresh token."
        )
    }                               

})

//********************  lect 17 update password ******************/
const updatePasseword = asyncHandler(async (req, res) =>{
    
    const {oldPassword, newPassword} = req.body

    const user = await User.findById(req.user?._id)

    //verify oldPasswod with the ds password, thow error else
    const isOldPasswodCorrect = user.isPasswordCorrect(oldPassword)

    if(!isOldPasswodCorrect){
        throw new ApiError(400, "Invalid old password.")
    }

    //password update karo and save kad do
    user.password = newPassword
    await user.save({validateBeforeSave: false})

    // send api resopnse
    return res
    .status(200)
    .json(
        new apiResponse(200, {}, "Password changed successfully.")
    )
})


// ******************* get current user *****************
const getCurrentUser = asyncHandler(async(req, res) => {
    return res
    .status(200)
    .json(
        new apiResponse(200, req.user, "current user fetched successfully."))
})


// ************************ update account details ************* 
const updateAccountDetails = asyncHandler( async ( req, res) => {
    const {email, fullname} = req.body

    if(!(email || fullname)){
        throw new ApiError(400, "field is required.")
    }

    const user =  await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set : {
                fullname: fullname,
                email: email
            }
        }, {new :true}
    ).select(" -password")


    return res.status(200)
    .json(
        new apiResponse(200, user, "Account details updated successsfully.")
    )
})

// ************************* update avatar **********
const updateAvatar = asyncHandler( async (req, res) => {

    const avatarLocalPath = req.file?.path

    if(!avatarLocalPath){
        throw new ApiError(400, "avatar file is missing.")
    }

    // TODO : delete the previou avatar from the cloudinary 
        
    const avatar = await uploadOnCloudinary(avatarLocalPath);

    if(!avatar){
        throw new ApiError(400, "Something went wrong while uploading avatar.")
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                avatar : avatar.url
            }
        },
        {
            new : true
        }
    ).select("-password")

    return res.status(200)
    .json(
        new apiResponse(200, {user}, "Avatar updated successfully.")
    )
 
})

const updateCoverImage = asyncHandler( async (req, res) => {

    const coverImageLocalPath = req.file?.path

    if(!coverImageLocalPath){
        throw new ApiError(400, "cover image file is missing.")
    }

    const coverImage = await uploadOnCloudinary(coverImageLocalPath);

    if(!coverImage){
        throw new ApiError(400, "Something went wrong while uploading cover image.")
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                coverImage : coverImage.url
            }
        },
        {
            new : true
        }
    ).select("-password")

    return res.status(200)
    .json(
        new apiResponse(200, {user}, "cover image updated successfully.")
    )
 
})


export { 
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    updatePasseword,
    getCurrentUser,
    updateAccountDetails, 
    updateAvatar,
    updateCoverImage,
 }   