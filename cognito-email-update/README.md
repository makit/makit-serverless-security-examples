# Security Issue Example
## Cognito Email Address Updates
In this sample application there is a basic API Gateway REST API configured with auth against a Cognito user pool. This has an endpoint for reading the currently logged in users profile data (private).

The web application allows creating and logging in of accounts against this Cognito user pool, and once logged in it will hit the API Gateway to show the private user profile of the logged in user.

The database lookup is performed on the unique email address, which is also the username for logging in.

### Taking advantage
Once logged in as "bob@fakeemail.com" then bob can use the AWS CLI to hit [Cognito directly](https://docs.aws.amazon.com/cli/latest/reference/cognito-idp/update-user-attributes.html) to update their own email address to another users for example:

`aws cognito-idp update-user-attributes --access-token ACCESS-TOKEN --user-attributes Name="email",Value="gary@fakeemail.com"`

But this will fail due to the fact the email already exists:
`An error occurred (AliasExistsException) when calling the UpdateUserAttributes operation: An account with the given email already exists.`

But do it again with a different capitalisation, such as GARY@fakeemail.com and Cognito will allow it, but send an email for verification. If the user logs out and back in now then the database lookup will occur for gary@fakeemail.com and pull back his personal data.

## Protection
* If using the email address as a lookup then ensure its verified first (email_verified). Ideally block login, only allow them to progress once verified.
* Use the "Keep original attribute value active when an update is pending" option. In CDK this is: `keepOriginal: { email: true }
* Use an ID for lookups, not the email address if it can change
* Turn off case sensitivity with email addresses: `signInCaseSensitive: false`

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