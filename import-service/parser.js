'use strict';
const AWS = require('aws-sdk');
AWS.config.update({region: 'us-east-1'});
const csv = require('csv-parser');

module.exports.importFileParser = async (event) => {
  const s3 = new AWS.S3({ region: 'us-east-1'});
  const sqs = new AWS.SQS({apiVersion: '2012-11-05'});
  const queueUrl = "https://sqs.us-east-1.amazonaws.com/818211481183/catalog-items-queue";
  console.log('importFileParser event:', event);

//   const sqsParams = {
//     // Remove DelaySeconds parameter and value for FIFO queues
//    DelaySeconds: 10,
//    MessageAttributes: {
//      "Title": {
//        DataType: "String",
//        StringValue: "The Whistler"
//      },
//      "Author": {
//        DataType: "String",
//        StringValue: "John Grisham"
//      },
//      "WeeksOn": {
//        DataType: "Number",
//        StringValue: "6"
//      }
//    },
//    MessageBody: "Information about current NY Times fiction bestseller for week of 12/11/2016.",
//    // MessageDeduplicationId: "TheWhistler",  // Required for FIFO queues
//    // MessageGroupId: "Group1",  // Required for FIFO queues
//    QueueUrl: queueUrl
//  };

//  sqs.sendMessage(sqsParams, function(err, data) {
//   if (err) {
//     console.log("Error!!!", err);
//   } else {
//     console.log("Success!!!", data.MessageId);
//   }
// });

  // const sqsClient = new SQSClient({region: 'us-east-1'});
  // const input = new SendMessageCommand({
  //   QueueUrl: queueUrl,
  //   MessageBody: 'Hello from importFileParser!',
  // });
  // await sqsClient.send(input);


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
        // sqs.sendMessage({
        //   QueueUrl: queueUrl,
        //   MessageBody: JSON.stringify(data)
        // }, (err, data) => {
        //   if (err) {
        //     console.log('INFO | Error:', err);
        //   } else {
        //     console.log('INFO | Message sent:', data.MessageId);
        //   }
        // });
        const sqsParams = {
          // Remove DelaySeconds parameter and value for FIFO queues
        //  DelaySeconds: 10,
         MessageBody: JSON.stringify(data),
         // MessageDeduplicationId: "TheWhistler",  // Required for FIFO queues
         // MessageGroupId: "Group1",  // Required for FIFO queues
         QueueUrl: queueUrl
       };

       sqs.sendMessage(sqsParams, function(err, data) {
        if (err) {
          console.log("Error!!!", err);
        } else {
          console.log("Success!!!", data);
        }
      });
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
