import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'

import { createAttachmentPresignedUrl } from '../../helpers/attachmentUtils'
// import { getUserId } from '../utils'
import { createLogger } from '../../utils/logger'
import { getTodo, updateTodo } from '../../dataLayer/todosAcess'

const logger = createLogger('DeleteTodo')
const bucket = process.env.ATTACHMENT_S3_BUCKET

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    logger.info('UploadUrl: ', event)
    const todoId = event.pathParameters.todoId
    // TODO: Return a presigned URL to upload a file for a TODO item with the provided id
    const todo = await getTodo(todoId)

    if (todo == null) { // Todo Exists
      return {
        statusCode: 404,
        body: JSON.stringify({
          error: 'Todo does not exist'
        })
      }
    }

    todo.attachmentUrl = `https://${bucket}.s3.amazonaws.com/${todoId}`
    try {
      await updateTodo(todo)
      const url = createAttachmentPresignedUrl(todoId)
      logger.info('Successfully created signed url.');
      return {
        statusCode: 200,
        body: JSON.stringify({
          uploadUrl: url
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
