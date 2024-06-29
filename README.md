# makit-serverless-security-examples
This repo contains examples of security issues I have come across in applications using AWS serverless architectures. I will add to it as I come across more in my travels. Each example has a simple application demonstrating the specific problem, along with a README that details the issues and how to prevent it.

## Cognito
### [Customers Updating Email to Takeover Another's Account](cognito-email-update)
This example shows how a customer could hit Cognito direct to update their email address and use that to impersonate another's account.

### [Customers Updating Custom Attribute to Takeover Another's Account](cognito-userid-update)
This example shows how a customer could hit Cognito direct to update a custom attribute storing the unique user ID, and use that to impersonate another's account.