import type { APIGatewayProxyHandler } from 'aws-lambda';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, UpdateCommand } from '@aws-sdk/lib-dynamodb';

const client = DynamoDBDocumentClient.from(new DynamoDBClient({}));
const TABLE_NAME = process.env.NOTES_TABLE!;

export const handler: APIGatewayProxyHandler = async (event) => {
  const userId = event.requestContext.authorizer?.claims?.sub;
  if (!userId) {
    return { statusCode: 401, body: JSON.stringify({ message: 'Unauthorized' }) };
  }

  const noteId = event.pathParameters?.id;
  if (!noteId) {
    return { statusCode: 400, body: JSON.stringify({ message: 'Missing noteId' }) };
  }

  const body = JSON.parse(event.body ?? '{}');
  const now = new Date().toISOString();

  const result = await client.send(
    new UpdateCommand({
      TableName: TABLE_NAME,
      Key: { userId, noteId },
      UpdateExpression:
        'SET title = :title, content = :content, tags = :tags, color = :color, lastEdited = :lastEdited',
      ExpressionAttributeValues: {
        ':title': body.title,
        ':content': body.content,
        ':tags': body.tags ?? [],
        ':color': body.color,
        ':lastEdited': now,
      },
      ConditionExpression: 'attribute_exists(noteId)',
      ReturnValues: 'ALL_NEW',
    }),
  );

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    body: JSON.stringify({ note: result.Attributes }),
  };
};
