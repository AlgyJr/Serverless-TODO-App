import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'

import { deleteTodo, getTodo } from '../../dataLayer/todosAcess'
// import { getUserId } from '../utils'
import { createLogger } from '../../utils/logger'

const logger = createLogger('DeleteTodo')

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const todoId = event.pathParameters.todoId
    logger.info('Processing DeleteTodo event', event)
    // TODO: Remove a TODO item by id
    try {
      const todo = await getTodo(todoId)

      if (todo == null) { // Todo Exists
        return {
          statusCode: 404,
          body: JSON.stringify({
            error: 'Todo does not exist'
          })
        }
      }

      const result = await deleteTodo(todo);
      logger.info(`Successfuly deleted todo item: ${todoId}`)
      
      return {
        statusCode: 200,
        body: JSON.stringify({
          result
        })
      }
    } catch (error) {
      logger.error(`Error ${error.message}`)
      return {
        statusCode: 500,
        body: JSON.stringify({ error })
      }
    }
  }
)

handler
  .use(httpErrorHandler())
  .use(
    cors({
      credentials: true
    })
  )