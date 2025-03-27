import {v2 as cloudinary} from "cloudinary"
import fs from "fs"


cloudinary.config({
    cloud_name : 'process.env.CLOUDINARY_CLOUD_NAME',
    api_key : 'process.env.CLOUDINARY_API_KEY',
    api_secret : 'process.env.CLOUDINARY_API_SECRET'
})

const uploadOnCloudinary = async (localFilePath) => {
    try {
        if(!localFilePath) return null; // file path is not valid then nothing will be happen

        // upload file on cloudinary
        const response = await cloudinary.uploader.upload(localFilePath,{
            resource_type : "auto"
        })
        // till here file has uploaded successfully. let's console
        console.log("file is uploaded successfully : ", response.url);
        // response.url return the url of the uploaded file.

        // now return the response 
        return response;

    } catch (error) {
        fs.unlinkSync(localFilePath) // incase the file doesnot get uploaded, it will 
        // unlink/delete the file from the temporary saved on server, so that server can be free from any kind of garbage files.
    }
}


export {uploadOnCloudinary}