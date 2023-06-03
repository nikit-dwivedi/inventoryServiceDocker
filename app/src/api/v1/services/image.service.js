const cloudinary = require('cloudinary')
const fs = require('fs')

cloudinary.config({
    cloud_name: 'fablo',
    api_key: '177463258473934',
    api_secret: 'j6gjkglQfS3Xgk5-WOzWMjvrkuU'
});


exports.imageUpload = async (image) => {
    try {
        let savedImage = await cloudinary.v2.uploader.upload(image.path, { public_id: `marketplace/${image.filename}` })
        fs.unlinkSync(image.path)
        return savedImage.secure_url
    } catch (error) {
        console.log(error);
        return error.message
    }
}
