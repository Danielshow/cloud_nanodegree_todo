import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'
import { createLogger } from '../../utils/logger'
import { getUserId } from '../utils'
import { generateUploadUrl } from '../../helpers/todo'

const logger = createLogger('getUploadUrl')

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const todoId = event.pathParameters.todoId
    const userId = getUserId(event)
    logger.info('Generate upload url', { todoId })
    const uploadUrl = await generateUploadUrl(todoId, userId)
    if (!uploadUrl) {
      return {
        statusCode: 404,
        body: JSON.stringify({
          error: 'Todo does not exist'
        })
      }
    }
    return {
      statusCode: 200,
      body: JSON.stringify({
        uploadUrl
      })
    }
  }
)

handler.use(
  cors({
    credentials: true
  })
)
