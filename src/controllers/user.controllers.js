import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js"
import { User } from "../models/user.models.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { upload } from "../middlewares/multer.middleware.js";
import { apiResponse } from "../utils/apiResponse.js";
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

const registerUser = asyncHandler(async (req, res) => {

    // step 1. get data from the frontend
    const { fullname, username, email, password } = req.body // in this way we can get data from json
    console.log("fullname : ", fullname);// log to check if data is fatched.

    //geting image files. you have to go through multer middleware .



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

    const avatarLocalPath = req.files?.avatar[0]?.path;
    const coverImageLocalPath = req.files?.coverImage[0]?.path;

    if (!avatarLocalPath) { //check avtar file is available 
        throw new ApiError(400, "Avatar file required.")
    }

    // const avatar = await uploadOnCloudinary(avatarLocalPath );
    // const coverImage = await uploadOnCloudinary(coverImageLocalPath );

    let avatar;
    try {
        avatar = await uploadOnCloudinary(avatarLocalPath);
    } catch (error) {
        throw new ApiError(500, "Failed to upload avatar to Cloudinary.");
    }

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
        avatar: avatar.url,
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

export { registerUser }   