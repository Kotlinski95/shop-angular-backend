const AWS = require('aws-sdk')
const uuid = require('uuid')

// Set up DynamoDB client
const dynamodb = new AWS.DynamoDB.DocumentClient({region: 'us-east-1'})

// Read products data from external file
const fs = require('fs')
const productsdata = JSON.parse(fs.readFileSync('products.json', 'utf-8'))

// Define array for products table
const products = []

// Define array for stocks table
const stocks = []

// Writes data to arrays
productsdata.forEach(product => {
    products.push({
        id: product.id,
        title: product.title,
        description: product.description,
        price: product.price
    })
    stocks.push({
        product_id: product.id,
        count: product.count
    })
})

// Function to insert data into products table
async function insertProducts() {
    for (const product of products) {
        const params = {
            TableName: 'products',
            Item: product
        }
        await dynamodb.put(params).promise()
    }
    console.log('Products data inserted successfully!')
}

// Function to insert data into stocks table
async function insertStocks() {
    for (const stock of stocks) {
        const params = {
            TableName: 'stocks',
            Item: stock
        }
        await dynamodb.put(params).promise()
    }
    console.log('Stocks data inserted successfully!')
}

// Call functions to insert data into both tables
insertProducts()
insertStocks()
