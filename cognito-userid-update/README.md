# Security Issue Example
## TODO
* User list page for seeing other IDs.

## Cognito user ID Updates
Let's say you have a userId attribute set of `7a2ebb0e-cf7a-4b5e-83b9-21ba8c111418`. If this is mutable then the user could simply update it to be the userId of somebody else:

`aws cognito-idp update-user-attributes --access-token ACCESS-TOKEN --user-attributes Name="custom:userId",Value="d237d215-4f38-45e1-bb1b-660d7ec860ed"`

Logout and back in and now they are in essence logged in as somebody else.