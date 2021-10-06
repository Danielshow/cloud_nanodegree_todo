import 'source-map-support/register'
import * as AWS from 'aws-sdk'
import * as uuid from 'uuid'
import * as middy from 'middy';
import { cors } from 'middy/middlewares';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'

import { CreateTodoRequest } from '../../requests/CreateTodoRequest'
import { getUserId } from '../utils'

const todosTable = process.env.TODOS_TABLE;
const docClient = new AWS.DynamoDB.DocumentClient()

export const handler = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const newTodo: CreateTodoRequest = JSON.parse(event.body)
  const userId = getUserId(event);

  const todoId = uuid.v4()

  const data = {
      ...newTodo,
      todoId,
      attachmentUrl: null,
      done: false,
      userId,
      createdAt: new Date().toISOString(),
  }

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
