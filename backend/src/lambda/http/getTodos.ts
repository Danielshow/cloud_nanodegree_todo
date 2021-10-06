import 'source-map-support/register'
import * as AWS from 'aws-sdk'
import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
} from 'aws-lambda'
import * as middy from 'middy';
import { cors } from 'middy/middlewares';
import { getUserId } from '../utils'
import { createLogger } from '../../utils/logger'

const docClient = new AWS.DynamoDB.DocumentClient()
const logger = createLogger('getTodo')

const todosTable = process.env.TODOS_TABLE;
export const handler = middy(async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  // TODO: Get all TODO items for a current user
  const userId = getUserId(event)

  logger.info("Gotten userId: ", userId)
  const result = await docClient
    .query({
      TableName: todosTable,
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: {
        ':userId': userId
      }
    })
    .promise()

  if (result.Count === 0) {
    return {
      statusCode: 404,
      body: JSON.stringify({
        error: 'Todos not found'
      })
    }
  }
  return {
    statusCode: 200,
    body: JSON.stringify(result.Items)
  }
})

handler.use(
  cors()
)
