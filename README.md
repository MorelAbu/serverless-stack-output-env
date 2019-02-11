# Serverless Stack Output env Plugin

A [serverless](https://serverless.com) plugin to store outputs from your AWS CloudFormation Stack in env file with REACT_APP_ prefix, or to pass the output to a JavaScript function for further processing.

## Usage

### Install

```bash
$ > yarn add serverless-stack-output-env
```

```bash
$ > npm install serverless-stack-output-env
```

### Configuration

```yaml
plugins:
  - serverless-stack-output-env

custom:
  output:
    handler: scripts/output.handler # Same syntax as you already know
    file: .build/.env # toml, yaml, yml, json and env format is available
```

### Handler

Based on the configuration above the plugin will search for a file `scripts/output.js` with the following content:

```js
function handler (data, serverless, options) {
  console.log('Received Stack Output', data)
}

module.exports = { handler }
```

### File Formats

Just name your file with a `.json`, `.toml`, `.yaml`, or `.env` extension, and the plugin will take care of formatting your output. Please make sure the location where you want to save the file exists!



## Example

The plugins works fine with serverless functions, as well as when using custom CloudFormation resources. The following example configuration will deploy an AWS Lambda function, API Gateway, SQS Queue, IAM User with AccessKey and SecretKey, and a static value:

### Serverless.yml

```yaml
service: sls-stack-output-example

plugins:
  - serverless-stack-output-dotenv

package:
  exclude:
    - node_modules/**

custom:
  output:
    handler: scripts/output.handler
    file: .build/stack.env

provider:
  name: aws
  runtime: nodejs6.10

functions:
  example:
    handler: functions/example.handle
    events:
      - http:
          path: example
          method: get
          cors: true

resources:
  Resources:
    ExampleQueue:
      Type: AWS::SQS::Queue
      Properties:
        QueueName: example-queue
    ExampleUser:
      Type: "AWS::IAM::User"
      Properties:
        UserName: example-user
        Policies:
          - PolicyName: ExampleUserSQSPolicy
            PolicyDocument:
              Version: '2012-10-17'
              Statement:
                - Effect: "Allow"
                  Action:
                    - sqs:SendMessage
                  Resource:
                    - {"Fn::Join": [":", ["arn:aws:sqs:*", {"Ref": "AWS::AccountId"}, "example-queue"]]}
    ExampleUserKey:
      Type: AWS::IAM::AccessKey
      Properties:
        UserName:
          Ref: ExampleUser
  Outputs:
    ExampleUserKey:
      Value:
        Ref: ExampleUserKey
    ExampleUserSecret:
      Value: {"Fn::GetAtt": ["ExampleUserKey", "SecretAccessKey"]}
    ExampleStaticValue:
      Value: example-static-value
```

### Stack Output

#### ENV

```env
REACT_APP_ExampleUserSecret=YourUserSecretKey
REACT_APP_ExampleUserKey=YourUserAccessKey
REACT_APP_ExampleLambdaFunctionQualifiedArn=arn:aws:lambda:us-east-1:AccountID:function:sls-stack-output-example-dev-example:9
REACT_APP_ExampleStaticValue=example-static-value
REACT_APP_ServiceEndpoint=https://APIGatewayID.execute-api.us-east-1.amazonaws.com/dev
REACT_APP_ServerlessDeploymentBucketName=sls-stack-output-example-serverlessdeploymentbuck-BucketID
```

#### YAML

```yaml
ExampleUserSecret: YourUserSecretKey
ExampleUserKey: YourUserAccessKey
ExampleLambdaFunctionQualifiedArn: 'arn:aws:lambda:us-east-1:AccountID:function:sls-stack-output-example-dev-example:9'
ExampleStaticValue: example-static-value
ServiceEndpoint: 'https://APIGatewayID.execute-api.us-east-1.amazonaws.com/dev'
ServerlessDeploymentBucketName: sls-stack-output-example-serverlessdeploymentbuck-BucketID
```

#### JSON

```json
{
  "ExampleUserSecret": "YourUserSecretKey",
  "ExampleUserKey": "YourUserAccessKey",
  "ExampleLambdaFunctionQualifiedArn": "arn:aws:lambda:us-east-1:AccountID:function:sls-stack-output-example-dev-example:9",
  "ExampleStaticValue": "example-static-value",
  "ServiceEndpoint": "https://APIGatewayID.execute-api.us-east-1.amazonaws.com/dev",
  "ServerlessDeploymentBucketName": "sls-stack-output-example-serverlessdeploymentbuck-BucketID"
}
```

