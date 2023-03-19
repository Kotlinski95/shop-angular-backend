// Import necessary AWS SDK libraries
const AWS = require('aws-sdk')
const dynamodb = new AWS.DynamoDB.DocumentClient()
// const {SNSClient, SubscribeCommand} = require('@aws-sdk/client-sns');
const sns = new AWS.SNS();
// const crypto = require('crypto')

// Create an instance of the DynamoDB Document Client
// const dynamodb = new AWS.DynamoDB.DocumentClient();

// Define the handler function
module.exports.handler = async event => {


    // // Log the incoming event for debugging purposes
    // const REGION = 'us-east-1'
    // const snsClient = new SNSClient({region: REGION})
    // // Set the parameters
    // const params = {
    //     Protocol: 'email' /* required */,
    //     TopicArn: 'arn:aws:sns:us-east-1:818211481183:create-product-topic', //TOPIC_ARN
    //     Endpoint: 'kotlinski95@gmail.com' //EMAIL_ADDRESS
    // }
    

    console.log('INFO | Incoming event:', event)
    // connect all records with for loop below
    // Extract the message body from the SQS event
    // const {Records: records} = event
    // const [record] = records
    // const {body} = record
    //   const message = JSON.parse(body);

    // console.log(' INFO | BATCH record from product service: ', record, ' , body: ', body)
    // Generate a unique ID for the new product
    // const productId = generateUUID();

    // Create a new product item to be added to the catalog
    //   const newProduct = {
    //     id: productId,
    //     title: message.title,
    //     description: message.description,
    //     price: message.price,
    //     createdAt: new Date().toISOString()
    //   };

    try {
        for await (const record of event.Records) {
            const parsedRecord = JSON.parse(record.body)
            await createProduct(parsedRecord)
        }
        // const data = await snsClient.send(new SubscribeCommand(params));
        // console.log("Success sdend message to sns Client.",  data);

        const message = {
          subject: 'New products added',
          message: `New products added to the catalog`
        };
        const params = {
          Message: JSON.stringify(message),
          TopicArn: 'arn:aws:sns:us-east-1:818211481183:create-product-topic'
        };
        await sns.publish(params).promise();

        // await createProduct(JSON.parse(body));
        // Add the new product to the DynamoDB table
        // await dynamodb.put({
        //   TableName: process.env.PRODUCTS_TABLE,
        //   Item: newProduct
        // }).promise();

        // Log a success message
        // console.log(`Successfully added new product ${productId} to the catalog.`);

        // Return a success response
        // return {
        //     statusCode: 200,
        //     body: JSON.stringify({
        //         message: `Successfully send messae from batchProcess lambda function.`
        //     })
        // }
    } catch (error) {
        // Log the error message
        console.error("catalog Batch process error: ", error)

        // Return an error response
        // return {
        //     statusCode: 500,
        //     body: JSON.stringify({
        //         message: 'An error occurred while processing the batch.'
        //     })
        // }
    }

    async function createProduct(data) {
        console.log('Calling request createProduct:', event, 'body: ', event.body)
        const responseHeaders = {
            'Access-Control-Allow-Methods': '*',
            'Access-Control-Allow-Headers': '*',
            'Access-Control-Allow-Origin': '*'
        }

        // try {
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

        // Check if the product data is valid
        // if (!data.title || !data.description || !data.price || !data.count || !Number.isInteger(data.count)) {
        //     // Return an error 400 response if the product data is invalid
        //     return {
        //         statusCode: 400,
        //         headers: {
        //             ...responseHeaders
        //         },
        //         body: JSON.stringify({message: 'Invalid product data'})
        //     }
        // }
        await addProduct(product)
        await addProductStock(productStock)
        console.log('PRODUCT CREATED FROM catalogBatchProcess product: ', product, ' productStock: ', productStock)

        // return {
        //     statusCode: 200,
        //     headers: {
        //         ...responseHeaders
        //     },
        //     body: JSON.stringify({message: 'Product created successfully from impotted data!'})
        // }
        // } catch (error) {
        // console.log("catalogBatchProcess error: ", error)
        // return {
        //     statusCode: 500,
        //     headers: {
        //         ...responseHeaders
        //     },
        //     body: JSON.stringify(error)
        // }
        // }

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
