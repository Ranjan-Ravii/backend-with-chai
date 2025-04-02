import { v2 as cloudinary } from "cloudinary"
import fs from "fs"
import path from "path"

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
})

const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) return null; // file path is not valid then nothing will be happen

        // // Convert to absolute path if necessary
        // const absolutePath = path.isAbsolute(localFilePath)
        //     ? localFilePath
        //     : path.join(process.cwd(), localFilePath);

        // upload file on cloudinary
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        })
        // till here file should have uploaded successfully. let's console
        // console.log("file is uploaded successfully : ", response.url);
   
        fs.unlinkSync(localFilePath);

        // now return the response 
        return response;

    } catch (error) {
        fs.unlinkSync(localFilePath) // incase the file doesnot get uploaded, it will 
        // unlink/delete the file from the temporary saved on server, so that server can be free from any kind of garbage files.
        // console.error("Cloudinary upload error:", error);
        return null;
    }
}

export { uploadOnCloudinary }