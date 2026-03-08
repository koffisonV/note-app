import type { APIGatewayProxyHandler } from 'aws-lambda';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb';
import { randomUUID } from 'crypto';

const client = DynamoDBDocumentClient.from(new DynamoDBClient({}));
const TABLE_NAME = process.env.NOTES_TABLE!;

export const handler: APIGatewayProxyHandler = async (event) => {
  const userId = event.requestContext.authorizer?.claims?.sub;
  if (!userId) {
    return { statusCode: 401, body: JSON.stringify({ message: 'Unauthorized' }) };
  }

  const body = JSON.parse(event.body ?? '{}');
  const now = new Date().toISOString();

  const note = {
    userId,
    noteId: randomUUID(),
    title: body.title ?? 'Untitled Note',
    content: body.content ?? '',
    tags: body.tags ?? [],
    color: body.color ?? '#F9E4B7',
    createdAt: now,
    lastEdited: now,
  };

  await client.send(new PutCommand({ TableName: TABLE_NAME, Item: note }));

  return {
    statusCode: 201,
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    body: JSON.stringify({ note }),
  };
};
