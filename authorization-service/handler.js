'use strict';
// const auth = require('basic-auth');
const generateResponse = (principalId,effect,resource) => ({
  principalId,
  policyDocument: generatePolicyDocument(effect, resource),
});


const generatePolicyDocument = (effect,resource) => ({
  Version: "2012-10-17",
  Statement: [
    {
      Action: "execute-api:Invoke",
      Effect: effect,
      Resource: resource,
    },
  ],
});

module.exports.basicAuthorizer = async (event, context, callback) => {
  const { headers, authorizationToken, methodArn } = event;
  let response = {};
  try{
  if (!headers) {
    response = {
      statusCode: 401,
      body: JSON.stringify({ message: 'Request headers missing', isAuthorized: false }),
    };
  }

  const authHeader = headers ? headers.Authorization || headers.authorization: authorizationToken;

  if (!authHeader) {
    response = {
      statusCode: 401,
      body: JSON.stringify({ message: 'Authorization header missing', isAuthorized: false }),
    };
  }

  const encodedCreds = authHeader.split(' ')[1];
  const decodedCreds = Buffer.from(encodedCreds, 'base64').toString('utf-8');
  const [username, password] = decodedCreds.split(':');
  const expectedPassword = process.env[username];
  if (!username || !password) {
    response = {
      statusCode: 401,
      body: JSON.stringify({ message: 'Invalid Authorization token', isAuthorized: false }),
    };
  }

  if (!expectedPassword || expectedPassword !== password) {
    response = {
      statusCode: 403,
      body: JSON.stringify({ message: 'Access denied', isAuthorized: false }),
    };
  }

  response = {
    statusCode: 201,
    body: JSON.stringify({ message: 'Access granted', isAuthorized: true }),
  }

  if (authorizationToken && methodArn){
    const effect = password === expectedPassword ? "Allow" : "Deny";
    return generateResponse(username, effect, methodArn);
  }
  else {
    return response;
  }
}
catch( error ) {
  response = {
    statusCode: 500,
    body: JSON.stringify({ error: error, isAuthorized: false }),
    headers: {
      'Access-Control-Allow-Origin': '*'
    }
  }
}
};