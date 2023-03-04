# shop-angular-backend
Backend repository for managing AWS distribution and angular shop backend

What was done?

   - Service is done and integrated with FE
   - Additional scope - 404 error handling
Link to Product Service APIs:

Example product: https://jj9rtvbo32.execute-api.us-east-1.amazonaws.com/dev/products/7567ec4b-b10c-48c5-9345-fc73c48a80aa

All products: https://jj9rtvbo32.execute-api.us-east-1.amazonaws.com/dev/products

Link to FE PR (YOUR OWN REPOSITORY) -  https://github.com/Kotlinski95/shop-angular-cloudfront/pull/1

Link to FE page: https://dszbsd7gyif70.cloudfront.net/

Product schema: everything is located in the product.json file.

##### Task 4 (Integration with NoSQL Database) #####
Task 4.1:
- Script to fill dynamo DB data: fill-dynamo-db.js
- Execute script using node fill-dynamo-db.js

Task 4.2
-Lambda functions for getting all products and productById updated.

Task 4.3
- Lambda function createProduct created

Task 4 Additional work:
- Error 400 added when product data are invalid
- All lambdas return error 500 code on any error (DB connection, any unhandled error in code)
-  All lambdas do console.log for each incoming requests and their arguments