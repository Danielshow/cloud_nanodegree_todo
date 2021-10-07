import 'source-map-support/register'
import * as AWS from 'aws-sdk'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'
import { getUserId } from '../utils'
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'

const todosTable = process.env.TODOS_TABLE
const docClient = new AWS.DynamoDB.DocumentClient()

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
      const todoId = event.pathParameters.todoId
      const userId = getUserId(event)
      // TODO: Remove a TODO item by id
      await docClient
        .delete({
          TableName: todosTable,
          Key: {
            todoId,
            userId
          }
        })
        .promise()
      return {
        statusCode: 200,
        body: ''
      }
    } catch (e) {
      return {
        statusCode: 500,
        body: JSON.stringify({
          error: e
        })
      }
    }
  }
)

handler.use(
  cors({
    credentials: true
  })
)
