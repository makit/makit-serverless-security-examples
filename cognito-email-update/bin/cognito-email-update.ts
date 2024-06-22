#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { CognitoEmailUpdateStack } from '../lib/cognito-email-update-stack';

const app = new cdk.App();
new CognitoEmailUpdateStack(app, 'CognitoEmailUpdateStack');