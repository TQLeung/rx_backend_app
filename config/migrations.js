/*
 * @Author: Ethan 
 * @Date: 2023-03-17 10:42:46 
 * @Last Modified by:   Ethan 
 * @Last Modified time: 2023-03-17 10:42:46 
 */

module.exports = {
  development: {
    url: process.env.DB_URL,
    dialect: 'mysql',
  },
  test: {
    url: process.env.DB_URL,
    dialect: 'mysql',
  },
  production: {
    url: process.env.DB_URL,
    dialect: 'mysql',
  },
};
