'use strict';
const AWS = require('aws-sdk');
const csv = require('csv-parser');

module.exports.importFileParser = async (event) => {
  const s3 = new AWS.S3({ region: 'us-east-1'});
  console.log('importFileParser event:', event);

  for (const record of event.Records){
    const bucketName = record.s3.bucket.name;
    const objectKey = record.s3.object.key;

    const s3Stream = s3.getObject({
      Bucket: bucketName,
      Key: objectKey
    }).createReadStream();

    await s3.getObject({
      Bucket: bucketName,
      Key: objectKey
    }).promise()

    await s3Stream.pipe(csv())
      .on('data', (data) => {
        console.log('Record: ', data);
      })
      .on('error', (error) => {
        console.error('Error: ', error);
      })
      .on('end', () => {
        console.log(`Finished processing S3 object: s3://${bucketName}/${objectKey}`);
      });
  }

  return{
    statusCode: 202
  }
};
