const config = require('../config');
const cos = require('./cos');

module.exports = {
  async sliceUploadFile(key, filepath) {
    const response = await cos.sliceUploadFileAsync({
      Bucket: config.cos.Bucket,
      Region: config.cos.Region,
      Key: key,
      FilePath: filepath,
    });

    return response;
  },

  async simpleUploadFile() {

  },
};
