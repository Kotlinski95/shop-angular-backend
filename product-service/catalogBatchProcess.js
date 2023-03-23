const AWS = require('aws-sdk')
const dynamodb = new AWS.DynamoDB.DocumentClient()
const sns = new AWS.SNS()

module.exports.handler = async event => {
    try {
        for await (const record of event.Records) {
            const parsedRecord = JSON.parse(record.body)
            await createProduct(parsedRecord)
        }

        const message = {
            subject: 'New products added',
            message: `New products added to the catalog`
        }
        const params = {
            Message: JSON.stringify(message),
            TopicArn: 'arn:aws:sns:us-east-1:818211481183:create-product-topic'
        }
        await sns.publish(params).promise()
    } catch (error) {
        console.error('catalog Batch process error: ', error)
    }

    async function createProduct(data) {
        try {
            // console.log('Calling request createProduct:', event, 'body: ', event.body)
            const product = {
                id: data.id,
                title: data.title,
                description: data.description,
                price: data.price
            }
            const productStock = {
                product_id: data.id,
                count: parseInt(data.count, 10)
            }

            await addProduct(product)
            await addProductStock(productStock)
            // console.log('PRODUCT CREATED FROM catalogBatchProcess product: ', product, ' productStock: ', productStock)
        } catch (error) {
            console.error('catalog Batch process createProduct error: ', error)
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
    }
}
