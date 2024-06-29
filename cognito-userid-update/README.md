# Security Issue Example
## Cognito UserID Within Attribute Update
In this sample application there is a basic API Gateway REST API configured with auth against a Cognito user pool. This has an endpoint for reading the currently logged in users profile data (private).

The web application allows creating and logging in of accounts against this Cognito user pool, and once logged in it will hit the API Gateway to show the private user profile of the logged in user.

The database lookup is performed on a user ID stored within a customer attibute. This is a recommendation over using the `sub` because it allows migrating of users to different user pools, whereas the `sub` is static and cannot be changed if a migration occurs. This can cause large issues if used as the unique ID within a database for example.

## Cognito user ID Updates
Let's say you have a userId attribute set of `7a2ebb0e-cf7a-4b5e-83b9-21ba8c111418`. If this is mutable then the user could simply update it to be the userId of somebody else:

`aws cognito-idp update-user-attributes --access-token ACCESS-TOKEN --user-attributes Name="custom:userId",Value="d237d215-4f38-45e1-bb1b-660d7ec860ed"`

Logout and back in and now they are in essence logged in as somebody else.

If the user ID is available in the frontend (say a user ID list, in the HTML for a comment from another user, etc.) then this is a big issues. If it's not shared publically then it would mean 
the bad actor would need to guess a GUID so its less serious, but still bad.

Similar attacks are possible if attributes are used to store the users access level, such as `isAdmin`.

## Protection
* Don't set the attibute as mutable, once set at registration then it cannot be updated by the user. 
* If it needs to be mutable (maybe you are migrating to using an attribute for existing users) then ensure the app client used on the Frontend doesn't have permissions to update the attribute.

## Example Code
The example code base is a CDK application with a React frontend. Consists of:
* Cognito Userpool
* API Gateway
* S3 bucket set as public and website hosting enabled
* The built React frontend deployed to the bucket

### Setting up
1. Run `npm install` in the root folder, and under `web`
2. Run `npm run build` in the web folder to build the web application.
3. Run `cdk deploy` in the root folder.
4. Update `web\src\amplifyconfiguration.json` with the correct details from the output of the CDK deploy, needs the user pool details and API gateway URL.
5. Run `npm run build` in the web folder to build the web application again.
6. Run `cdk deploy` in the root folder again to deploy the updated website.