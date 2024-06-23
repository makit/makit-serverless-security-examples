import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand } from '@aws-sdk/lib-dynamodb';

interface Event {
    requestContext: {
        authorizer: {
            claims: {
                email: string;
            };
        };
    };
}

const dynamoDbClient = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(dynamoDbClient);

exports.handler = async (event: Event) => {
    console.log('Received event:', JSON.stringify(event, null, 2));
    const email: string = event.requestContext.authorizer.claims.email;

    const params = {
        TableName: process.env.TABLE_NAME!,
        Key: {
            email: email.toLowerCase(),
        },
    };

    try {
        const data = await docClient.send(new GetCommand(params));
        return {
            statusCode: 200,
            body: JSON.stringify(data.Item),
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET',
            },
        };
    } catch (error) {
        console.error(error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Could not fetch user profile' }),
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET',
            },
        };
    }
};