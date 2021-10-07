import 'source-map-support/register'
import * as AWS from 'aws-sdk'
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'
import { UpdateTodoRequest } from '../../requests/UpdateTodoRequest'
import { getUserId } from '../utils'
import { createLogger } from '../../utils/logger'

const todosTable = process.env.TODOS_TABLE
const docClient = new AWS.DynamoDB.DocumentClient()
const logger = createLogger('updateTodo');
export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
      const todoId = event.pathParameters.todoId
      const updatedTodo: UpdateTodoRequest = JSON.parse(event.body)
      logger.info(`Updating todo item ${todoId} with ${updatedTodo}`)
      const userId = getUserId(event)
      await docClient
        .update({
          TableName: todosTable,
          Key: {
            todoId,
            userId
          },
          UpdateExpression:
            'set #nam = :name, dueDate = :dueDate, done = :done',
          ExpressionAttributeNames:{
              "#nam": "timestamp"
          },
          ExpressionAttributeValues: {
            ':name': updatedTodo.name,
            ':dueDate': updatedTodo.dueDate,
            ':done': updatedTodo.done
          }
        })
        .promise()

      logger.info(`Updated todo item ${todoId} successful`)
      return {
        statusCode: 200,
        body: ''
      }
    } catch (e) {
      logger.error('Update todo failed', { error: e.message })
      return {
        statusCode: 500,
        body: JSON.stringify({
          message: e.message
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
