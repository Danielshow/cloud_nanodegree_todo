import 'source-map-support/register'
import * as AWS from 'aws-sdk'
import * as uuid from 'uuid'
import * as middy from 'middy';
import { cors } from 'middy/middlewares';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'

import { CreateTodoRequest } from '../../requests/CreateTodoRequest'
import { createLogger } from '../../utils/logger'
import { getUserId } from '../utils'

const todosTable = process.env.TODOS_TABLE;
const bucketName = process.env.TODO_BUCKET
const docClient = new AWS.DynamoDB.DocumentClient()
const logger = createLogger('createTodo');

export const handler = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const newTodo: CreateTodoRequest = JSON.parse(event.body)
  const userId = getUserId(event);
  logger.info(`Create todo request for user ${userId}`);
  const todoId = uuid.v4()
  const attachmentUrl = `https://${bucketName}.s3.amazonaws.com/${todoId}`;
  const data = {
      ...newTodo,
      todoId,
      attachmentUrl,
      done: false,
      userId,
      createdAt: new Date().toISOString(),
  }

  logger.info(`Creating todo item with data ${data}`);

  await docClient.put({
    TableName: todosTable,
    Item: data
  }).promise()

  return {
    statusCode: 201,
    body: JSON.stringify({
      item: data,
    })
  }
})

handler.use(
  cors({
    credentials: true
  })
)
