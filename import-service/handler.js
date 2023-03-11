'use strict';
const AWS = require('aws-sdk');
// const csv = require('csv-parser');
// import { parse } from 'csv-parse';
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


module.exports.importFileParser = async (event) => {
  console.log('LOG | importFileParser event:', event);
  const s3 = new AWS.S3({ region: 'us-east-1'});
  const bucketName = event.Records[0].s3.bucket.name;
  const objectKey = event.Records[0].s3.object.key;
  console.log('LOG | bucketName:', bucketName, " objectKey: ", objectKey);
  const s3Stream = s3.getObject({
    Bucket: bucketName,
    Key: objectKey
  }).createReadStream();

  await s3.getObject({
    Bucket: bucketName,
    Key: objectKey
  }, (err, data) => {
    console.log("LOG | data: ", data);
    console.log("LOG | err: ", err)
  }).promise()

  await s3Stream
    .on('data', (data) => {
      console.log('LOG | Record:', data);
    })
    .on('error', (error) => {
      console.error('LOG | ', error);
    })
    .on('end', () => {
      console.log(`LOG | Finished processing S3 object: s3://${bucketName}/${objectKey}`);
    });

  return{
    statusCode: 202
  }
};
