'use strict'
const AWS = require('aws-sdk')
const dynamodb = new AWS.DynamoDB.DocumentClient()
const crypto = require('crypto')

module.exports.getProductsList = async event => {
    console.log('Incoming request getProductsList:', event)
    const responseHeaders = {
        'Access-Control-Allow-Methods': '*',
        'Access-Control-Allow-Headers': '*',
        'Access-Control-Allow-Origin': '*'
    }
    try {
        const params = {
            TableName: process.env.PRODUCTS_TABLE_NAME
        }

        const productsResult = await dynamodb.scan(params).promise()

        const stocksParams = {
            TableName: process.env.STOCKS_TABLE_NAME
        }

        const stocksResult = await dynamodb.scan(stocksParams).promise()
        const stocksMap = {}

        stocksResult.Items.forEach(item => {
            const productId = item.product_id
            stocksMap[productId] = item.count
        })

        const response = {
            statusCode: 200,
            headers: {
                ...responseHeaders
            },
            body: JSON.stringify(
                productsResult.Items.map(item => ({
                    ...item,
                    count: stocksMap[item.id] || 0
                }))
            )
        }

        return response
    } catch (error) {
        return {
            statusCode: 500,
            headers: {
                ...responseHeaders
            },
            body: JSON.stringify(error)
        }
    }
}

module.exports.getProductsById = async event => {
    console.log('Incoming request getProductsById:', event, 'id: ', event.pathParameters.productId)
    const responseHeaders = {
        'Access-Control-Allow-Methods': '*',
        'Access-Control-Allow-Headers': '*',
        'Access-Control-Allow-Origin': '*'
    }
    const productId = event.pathParameters.productId
    try {
        const params = {
            TableName: process.env.PRODUCTS_TABLE_NAME,
            FilterExpression: 'id = :id',
            ExpressionAttributeValues: {
                ':id': productId
            }
        }
        const productsResult = await dynamodb.scan(params).promise()

        const stocksParams = {
            TableName: process.env.STOCKS_TABLE_NAME,
            FilterExpression: 'product_id = :id',
            ExpressionAttributeValues: {
                ':id': productId
            }
        }

        const stocksResult = await dynamodb.scan(stocksParams).promise()
        const stocksMap = {}

        stocksResult.Items.forEach(item => {
            const productId = item.product_id
            stocksMap[productId] = item.count
        })

        const response = {
            statusCode: 200,
            headers: {
                ...responseHeaders
            },
            body: JSON.stringify({
                product: productsResult.Items.map(item => ({
                    ...item,
                    count: stocksMap[item.id] || 0
                }))[0]
            })
        }

        if (productsResult.Items.length === 0 || stocksResult.Items.length === 0) {
            return {
                statusCode: 404,
                headers: {
                    ...responseHeaders
                },
                body: JSON.stringify({
                    message: `Product with ID: ${event.pathParameters.productId} not found.`
                })
            }
        }
        return response
    } catch (error) {
        return {
            statusCode: 500,
            headers: {
                ...responseHeaders
            },
            body: JSON.stringify(error)
        }
    }
}

module.exports.createProduct = async event => {
    console.log('Incoming request createProduct:', event, 'body: ', event.body)
    const responseHeaders = {
        'Access-Control-Allow-Methods': '*',
        'Access-Control-Allow-Headers': '*',
        'Access-Control-Allow-Origin': '*'
    }

    try {
        const uuid = generateUUID()
        const productData = JSON.parse(event.body)
        const product = {
            id: uuid,
            title: productData.title,
            description: productData.description,
            price: productData.price
        }
        const productStock = {
            product_id: uuid,
            count: productData.count
        }

        // Check if the product data is valid
        if (!productData.title || !productData.description || !productData.price || !productData.count || !Number.isInteger(productData.count) ) {
            // Return an error 400 response if the product data is invalid
            return {
                statusCode: 400,
                headers: {
                  ...responseHeaders
              },
                body: JSON.stringify({message: 'Invalid product data'})
            }
        }
        await addProduct(product)
        await addProductStock(productStock)

        return {
            statusCode: 200,
            headers: {
                ...responseHeaders
            },
            body: JSON.stringify({message: 'Product created successfully!'})
        }
    } catch (error) {
        return {
            statusCode: 500,
            headers: {
                ...responseHeaders
            },
            body: JSON.stringify(error)
        }
    }

    async function addProduct(product) {
        const params = {
            TableName: process.env.PRODUCTS_TABLE_NAME,
            Item: product
        }

        const putResults = await dynamodb.put(params).promise()
        return putResults
    }

    async function addProductStock(product) {
        const params = {
            TableName: process.env.STOCKS_TABLE_NAME,
            Item: product
        }

        const putResults = await dynamodb.put(params).promise()
        return putResults
    }
    function generateUUID() {
        return crypto.randomUUID()
    }
}
