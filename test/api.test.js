
const supertest = require('supertest');
const assert = require('assert');
const app = require('../app');
const request = supertest(app.listen());
const constv = require('../config/constv');

const headers = {
  'x-yhsd-cid': 801884,
  'x-yhsd-ctime': '2017-08-31T06:35:03.000Z',
};
const prefix = '/api/v1';

describe('获取spu', function () {
  it('should return ok', async () => {
    const res = await request.get(`${prefix}/admin/product`)
      .expect(200);
  });

});

