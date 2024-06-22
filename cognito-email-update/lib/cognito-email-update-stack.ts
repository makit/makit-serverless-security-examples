import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as cognito from 'aws-cdk-lib/aws-cognito';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as s3deploy from 'aws-cdk-lib/aws-s3-deployment';

export class CognitoEmailUpdateStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    this.createUserPool();
    this.createWebsiteInS3Bucket();
  }

  private createUserPool() {
    const userPool = new cognito.UserPool(this, 'SiteUserPool', {
      selfSignUpEnabled: true, // Allow users to sign up
      autoVerify: { email: true }, // Automatically verify emails
      signInAliases: { email: true }, // Use email as the sign in alias
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
}