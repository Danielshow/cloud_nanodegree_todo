import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as AWS from 'aws-sdk'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'
import { createLogger } from '../../utils/logger'
import { getUserId } from '../utils'

const todosTable = process.env.TODOS_TABLE
const SIGNED_URL_EXPIRATION =
  process.env.SIGNED_URL_EXPIRATION || 60 * 60 * 24 * 7
const bucketName = process.env.TODO_BUCKET

const docClient = new AWS.DynamoDB.DocumentClient()
const logger = createLogger('getUploadUrl')

const s3 = new AWS.S3({
  signatureVersion: 'v4'
})

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const todoId = event.pathParameters.todoId
    const userId = getUserId(event)
    logger.info('Generate upload url', { todoId })
    const todoAvailable = await todoExists(todoId, userId)
    if (!todoAvailable) {
      return {
        statusCode: 404,
        body: JSON.stringify({
          message: 'Todo does not exist'
        })
      }
    }

    const uploadUrl = getUploadUrl(todoId)
    return {
      statusCode: 200,
      body: JSON.stringify({
        uploadUrl
      })
    }
  }
)

async function todoExists(todoId: string, userId: string) {
  const result = await docClient
    .query({
      TableName: todosTable,
      KeyConditionExpression: 'todoId = :todoId and userId = :userId',
      ExpressionAttributeValues: {
        ':todoId': todoId,
        ':userId': userId
      }
    })
    .promise()
  logger.info('Get todo: ', result)
  return !!result.Items.length
}

function getUploadUrl(todoId: string) {
  const params = {
    Bucket: bucketName,
    Key: todoId,
    Expires: Number(SIGNED_URL_EXPIRATION)
  }
  return s3.getSignedUrl('putObject', params)
}

handler.use(
  cors({
    credentials: true
  })
)
