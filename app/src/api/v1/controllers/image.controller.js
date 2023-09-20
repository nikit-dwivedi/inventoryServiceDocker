const { unknownError, success, badRequest } = require("../helpers/response.helper");
const { universalImageUpload } = require("../services/image.service");

exports.uploadImageApi = async (req, res) => {
    try {
        const imageResponse = await universalImageUpload(req.file, req.body.folder)
        return imageResponse ? success(res, "image uploaded", imageResponse) : badRequest(res, "image not uploaded")
    } catch (error) {
        console.log(error);
        return unknownError(res, error.message)
    }
}