import 'source-map-support/register'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'
import { getUserId } from '../utils'
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { deleteTodo } from '../../helpers/todo'
import { createLogger } from '../../utils/logger'

const logger = createLogger('deleteTodo')

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
      const todoId = event.pathParameters.todoId
      const userId = getUserId(event)
      logger.info(`Deleting todo ${todoId} for user ${userId}`)
      await deleteTodo(todoId, userId)
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
