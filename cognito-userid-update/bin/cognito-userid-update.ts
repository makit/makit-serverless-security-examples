#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { CognitoUSerIdUpdateStack } from '../lib/cognito-userid-update-stack';

const app = new cdk.App();
new CognitoUSerIdUpdateStack(app, 'CognitoUserIDUpdateStack');