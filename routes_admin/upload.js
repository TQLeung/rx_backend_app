const router = require('koa-router')();
const Joi = require('joi');
const constv = require('../config/constv');
const middleware = require('../middleware');
const uploadLib = require('../lib/upload');
const util = require('../util');

router.prefix('/api/v1/admin/upload');
router.use(middleware.adminTokenRequired);

router.post('/image', async (ctx) => {
  let files = ctx.request.body.files.file;

  if (!Array.isArray(files)) {
    files = [files];
  }

  const promises = files.map((file, index) => {
    console.log('file:   ', file);
    const random = new Date().getTime() + index + Math.random();
    const key = `${util.md5(random.toString())}.${file.type.split('/')[1]}`;
    return uploadLib.sliceUploadFile(key, file.path);
  });

  const responses = await Promise.all(promises);

  ctx.body = {
    data: responses.map(item => `//${item.Location}`),
  };
});

module.exports = router;
