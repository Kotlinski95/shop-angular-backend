'use strict';
const AWS = require('aws-sdk');
const BUCKET = 'aws-angular-shop-bucket-s3';

module.exports.importProductsFile = async (event) => {
  const s3 = new AWS.S3({ region: 'us-east-1'});
  let statusCode = 200;
  let body = {};

  try{
    const fileName = event.queryStringParameters.name;
    const signedUrlExpireSeconds = 60 * 5; // URL will expire in 5 minutes

    const params = {
      Bucket: BUCKET,
      Key: `uploaded/${fileName}`,
      ContentType: "text/csv",
      ACL: "private",
      Expires: signedUrlExpireSeconds,
    };

    const signedUrl = await s3.getSignedUrlPromise("putObject", params);

    body = { signedUrl };
  } catch( error ) {
    console.error("ERROR: ", error);
    statusCode = 500;
    body = {error};
  }

  return {
    statusCode,
    headers: { 'Access-Control-Allow-Origin': '*' },
    body: JSON.stringify(body),
  };
};