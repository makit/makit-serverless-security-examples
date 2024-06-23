# Security Issue Example
## Cognito Email Address Updates
In this sample application there is a basic API Gateway REST API configured with auth against a Cognito user pool. This has an endpoint for reading the currently logged in users profile data (private).

The web application allows creating and logging in of accounts against this Cognito user pool, and once logged in it will hit the API Gateway to show the private user profile of the logged in user.

The database lookup is performed on the unique email address, which is also the username for logging in.

### Taking advantage
Once logged in as "bob" then bob can use the AWS CLI to hit Cognito directly to update his own email address:

`aws cognito-idp update-user-attributes --access-token ACCESS-TOKEN --user-attributes
Name="email", Value="anotheremail@address.com"`