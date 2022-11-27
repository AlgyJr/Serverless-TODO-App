import { updateTodoItem } from '../dataLayer/todosAcess'
// import { AttachmentUtils } from './attachmentUtils';
import { TodoItem } from '../models/TodoItem'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
// import { createLogger } from '../utils/logger'
import * as uuid from 'uuid'
import { APIGatewayProxyEvent } from 'aws-lambda';
import { getUserId } from '../lambda/utils';
import { TodoUpdate } from '../models/TodoUpdate';

// TODO: Implement businessLogic

export function createTodoItem(createTodoRequest: CreateTodoRequest, event: APIGatewayProxyEvent): TodoItem {
    const todoId = uuid.v4()

    return {
        ...createTodoRequest,
        userId: getUserId(event),
        todoId,
        createdAt: new Date().toISOString(),
        done: false,
        attachmentUrl: ""
    } as TodoItem
}

export async function createUpdateTodoItem(todoId: string, updateTodoRequest: UpdateTodoRequest, userId: string): Promise<TodoUpdate> {
    return await updateTodoItem(todoId, userId, updateTodoRequest)
}