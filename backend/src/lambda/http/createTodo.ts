import 'source-map-support/register'
import * as middy from 'middy';
import { cors } from 'middy/middlewares';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { CreateTodoRequest } from '../../requests/CreateTodoRequest'
import { createLogger } from '../../utils/logger'
import { getUserId } from '../utils'
import { createTodo } from '../../helpers/todo';

const logger = createLogger('createTodo');

export const handler = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const newTodo: CreateTodoRequest = JSON.parse(event.body)
  const userId = getUserId(event);
  logger.info(`Create todo request for user ${userId}`);
  logger.info(`Creating todo item with data ${newTodo}`);

  const data = await createTodo(newTodo, userId)
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
