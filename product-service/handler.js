'use strict';
const fs = require('fs');
const data = fs.readFileSync('./products.json', 'utf-8');
const jsonData = JSON.parse(data);

module.exports.getProductsList = async (event) => {
  const responseBody = {
    "productName": 'Test',
    "price": "123",
};
  return {
    statusCode: 200,
    body: JSON.stringify(jsonData)
  };
};
