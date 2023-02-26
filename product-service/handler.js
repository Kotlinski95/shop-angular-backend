'use strict'
const fs = require('fs')
const data = fs.readFileSync('./products.json', 'utf-8')
const jsonData = JSON.parse(data)

module.exports.getProductsList = async event => {
    const responseHeaders = {
        'Access-Control-Allow-Methods': '*',
        'Access-Control-Allow-Headers': '*',
        'Access-Control-Allow-Origin': '*'
    }
    return {
        statusCode: 200,
        headers: {
            ...responseHeaders
        },
        body: JSON.stringify(jsonData)
    }
}

module.exports.getProductsById = async event => {
    const responseHeaders = {
        'Access-Control-Allow-Methods': '*',
        'Access-Control-Allow-Headers': '*',
        'Access-Control-Allow-Origin': '*'
    }
    const responseProduct = jsonData.filter((product) => product.id === event.pathParameters.productId)[0];
    const response = {
      product: responseProduct
    }
    if (responseProduct){
      return {
        statusCode: 200,
        headers: {
          ...responseHeaders
        },
        body: JSON.stringify(response)
    }
    }
    else{
      return {
        statusCode: 404,
        headers: {
          ...responseHeaders
        },
        body: JSON.stringify(
          {
            message: `Product with ID: ${event.pathParameters.productId} not found.`,
          },
        ),
    }
    }

}
