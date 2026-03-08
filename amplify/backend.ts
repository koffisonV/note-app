import { defineBackend } from '@aws-amplify/backend';
import { auth } from './auth/resource';

/**
 * Backend definition for NoteApp.
 *
 * DynamoDB table, API Gateway, and Lambda functions are provisioned
 * separately via the AWS console or IaC (CloudFormation/CDK) as
 * Amplify Gen 2 data modeling is used only for auth in this MVP.
 *
 * The REST API (API Gateway + Lambda + DynamoDB) is configured outside
 * Amplify to keep the backend decoupled and portable. The frontend
 * uses fetchAuthSession() to get the JWT for all API calls.
 */
defineBackend({
  auth,
});
