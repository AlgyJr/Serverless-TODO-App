import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'
import { getAllTodos } from '../../dataLayer/todosAcess'
import { getUserId } from '../utils';
import { createLogger } from '../../utils/logger'

const logger = createLogger('GetTodos')

// TODO: Get all TODO items for a current user
export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    logger.info('GetTodo Event: ', event)
    const userId = getUserId(event)

    try {
      const todos = await getAllTodos(userId)
      logger.info(`Successfully retrieved todo list`)
      return {
        statusCode: 200,
        body: JSON.stringify({items: todos})
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
handler.use(
  cors({
    credentials: true
  })
)
