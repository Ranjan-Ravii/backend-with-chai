import multer  from "multer"


const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, "/public/temp")
    },
    filename: function (req, file, cb) {
      cb(null, file.originalname)              // SCOPE OF UPDATION : change or twick the file name as per use
    }
  })
  
export const upload = multer({
    storage
})