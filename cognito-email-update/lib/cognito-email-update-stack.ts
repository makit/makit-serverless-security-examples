import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as cognito from 'aws-cdk-lib/aws-cognito';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as s3deploy from 'aws-cdk-lib/aws-s3-deployment';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as logs from 'aws-cdk-lib/aws-logs';
import * as nodeLambda from 'aws-cdk-lib/aws-lambda-nodejs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';

export class CognitoEmailUpdateStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const userPool = this.createUserPool();
    this.createWebsiteInS3Bucket();
    const userProfileTable = this.createUserProfileTable();
    this.createApiGateway(userProfileTable, userPool);
  }

  private createUserPool() {
    const userPool = new cognito.UserPool(this, 'SiteUserPool', {
      selfSignUpEnabled: true, // Allow users to sign up
      autoVerify: { email: true }, // Automatically verify emails
      signInAliases: { email: true }, // Use email as the sign in alias
      removalPolicy: cdk.RemovalPolicy.DESTROY, // Remove the user pool if the stack is deleted
      // keepOriginal: {
      //   email: true,
      // }
      // signInCaseSensitive: false,
    });

    const userPoolClient = new cognito.UserPoolClient(this, 'SiteAppClient', {
      userPool,
    });

    new cdk.CfnOutput(this, 'UserPoolID', {
      value: userPool.userPoolId,
      description: 'The ID of the User Pool',
    });

    new cdk.CfnOutput(this, 'UserPoolClientID', {
      value: userPoolClient.userPoolClientId,
      description: 'The ID of the User Pool Client',
    });

    return userPool;
  }

  private createWebsiteInS3Bucket() {
    const websiteBucket = new s3.Bucket(this, 'WebsiteBucket', {
      websiteIndexDocument: 'index.html',
      publicReadAccess: true,
      blockPublicAccess: {
        blockPublicAcls: false,
        blockPublicPolicy: false,
        ignorePublicAcls: false,
        restrictPublicBuckets:false,
      },
      removalPolicy: cdk.RemovalPolicy.DESTROY, // Ensure the bucket is destroyed when the stack is deleted
    });
    
    // Deploy files from web/dist to the S3 bucket
    new s3deploy.BucketDeployment(this, 'DeployWebsite', {
      sources: [s3deploy.Source.asset('web/dist')],
      destinationBucket: websiteBucket,
    });

    new cdk.CfnOutput(this, 'WebsiteUrl', {
      value: websiteBucket.bucketWebsiteUrl,
      description: 'The URL of the S3 website',
    });
  }

  private createUserProfileTable() {
    const table = new dynamodb.Table(this, 'UserProfileTable', {
      partitionKey: { name: 'email', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
    });

    return table;
  }

  private createApiGateway(userProfileTable: dynamodb.Table, userPool: cognito.UserPool) {
    const handler = new nodeLambda.NodejsFunction(this, 'UserProfileHandler', {
      architecture: lambda.Architecture.ARM_64,
      runtime: lambda.Runtime.NODEJS_20_X,
      entry: 'lib/read-lambda.ts',
      environment: {
        TABLE_NAME: userProfileTable.tableName,
      },
      logRetention: logs.RetentionDays.ONE_DAY,
      bundling: {
        sourceMap: true,
        minify: false,
      },
    });

    userProfileTable.grantReadData(handler);

    const api = new apigateway.RestApi(this, 'UserProfileApi', {
      restApiName: 'UserProfileService',
      description: 'This service serves user profiles.',
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: apigateway.Cors.ALL_METHODS,
      }
    });

    const authorizer = new apigateway.CognitoUserPoolsAuthorizer(this, 'UserPoolAuthorizer', {
      cognitoUserPools: [userPool],
    });

    const userProfile = api.root.addResource('userprofile');
    userProfile.addMethod('GET', new apigateway.LambdaIntegration(handler), {
      authorizer,
      authorizationType: apigateway.AuthorizationType.COGNITO,
    });
  }
}