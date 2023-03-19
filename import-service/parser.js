'use strict';
const AWS = require('aws-sdk');
AWS.config.update({region: 'us-east-1'});
const csv = require('csv-parser');

module.exports.importFileParser = async (event) => {
  const s3 = new AWS.S3({ region: 'us-east-1'});
  const sqs = new AWS.SQS({apiVersion: '2012-11-05'});
  const queueUrl = "https://sqs.us-east-1.amazonaws.com/818211481183/catalog-items-queue";

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
        // console.log('Record: ', data);
        const sqsParams = {
         MessageBody: JSON.stringify(data),
         QueueUrl: queueUrl
       };

       sqs.sendMessage(sqsParams, function(err, data) {
        if (err) {
          console.log("Error while handling sqs send message", err);
        } else {
          console.log("Success sqs send", data);
        }
      });
      })
      .on('error', (error) => {
        console.error('Import parser error: ', error);
      })
      .on('end', () => {
        console.log(`Finished processing S3 object: s3://${bucketName}/${objectKey}`);
      });
  }

  return{
    statusCode: 202
  }
};
