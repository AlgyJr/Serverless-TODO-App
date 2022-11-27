import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import 'source-map-support/register'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'
import { CreateTodoRequest } from '../../requests/CreateTodoRequest'
import { createTodoItem } from '../../businessLogic/todos'
import { createLogger } from '../../utils/logger'
import { createTodo } from '../../dataLayer/todosAcess'

const logger = createLogger('CreateTodo')


export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    logger.info('Processing CreateTodo event', event)

    const newTodo: CreateTodoRequest = JSON.parse(event.body)
    // TODO: Implement creating a new TODO item

    try {
      const todo = createTodoItem(newTodo, event)
      await createTodo(todo)
      logger.info(`Successfuly created new todo item: ${todo.todoId}`)

      return {
        statusCode: 201,
        body: JSON.stringify({
          item: todo
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

handler.use(
  cors({
    credentials: true
  })
)
