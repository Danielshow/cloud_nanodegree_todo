import 'source-map-support/register'
import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
} from 'aws-lambda'
import * as middy from 'middy';
import { cors } from 'middy/middlewares';
import { getUserId } from '../utils'
import { createLogger } from '../../utils/logger'
import { getAllTodos } from '../../helpers/todo';

const logger = createLogger('getTodo')

export const handler = middy(async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  const userId = getUserId(event)
  logger.info("Gotten userId: ", userId)
  const result = await getAllTodos(userId)
  return {
    statusCode: 200,
    body: JSON.stringify(result)
  }
})

handler.use(
  cors({
    credentials: true
  })
)
