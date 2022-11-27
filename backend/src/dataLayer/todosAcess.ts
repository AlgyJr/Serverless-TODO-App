import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import { createLogger } from '../utils/logger'
import { TodoItem } from '../models/TodoItem'
import { TodoUpdate } from '../models/TodoUpdate';
// import { DocumentClient } from 'aws-sdk/clients/dynamodb';

const XAWS = AWSXRay.captureAWS(AWS)

const logger = createLogger('TodosAccess')

const docClient = createDynamoDBClient()
const todosTable = process.env.TODOS_TABLE
const todosCreatedAtIndex = process.env.TODOS_CREATED_AT_INDEX

// TODO-DONE: Implement the dataLayer logic
export async function createTodo(todo: TodoItem): Promise<TodoItem> {
    await docClient.put({
        TableName: todosTable,
        Item: todo
    }).promise()

    logger.info('Todo created: ', todo)

    return todo
}

export async function getAllTodos(userId: String): Promise<TodoItem[]>  {
    const result = await docClient.query({
        TableName: todosTable,
        KeyConditionExpression: 'userId = :userId',
        ExpressionAttributeValues: {
            ':userId': userId
        }
    }).promise()
    
    return result.Items as TodoItem[] 
}

export async function getTodo(todoId: String): Promise<TodoItem> {
    const result = await docClient.query({
        TableName: todosTable,
        IndexName: todosCreatedAtIndex,
        KeyConditionExpression: 'todoId = :todoId',
        ExpressionAttributeValues: {
            ':todoId': todoId
        }
    }).promise()

    const items = result.Items

    if (items.length !== 0) return items[0] as TodoItem

    return null
}

export async function updateTodo(todo: TodoItem): Promise<TodoItem> {
    const result = await docClient.update({
        TableName: todosTable,
        Key: {
            userId: todo.userId,
            todoId: todo.todoId
        },
        UpdateExpression: 'set attachmentUrl = :attachmentUrl',
        ExpressionAttributeValues: {
            ':attachmentUrl': todo.attachmentUrl
        }
    }).promise()

    return result.Attributes as TodoItem
}

export async function deleteTodo(todo: TodoItem): Promise<void> {
    await docClient.delete({
        TableName: todosTable,
        Key: {
            userId: todo.userId,
            todoId: todo.todoId
        },
        ConditionExpression: 'todoId = :todoId',
        ExpressionAttributeValues: {
            ':todoId': todo.todoId
        }
    }).promise()
}

export async function updateTodoItem(todoId: string, userId: string, todos: TodoUpdate): Promise<TodoUpdate> {
    await docClient.update({
        TableName: todosTable,
        Key: {
            userId: userId,
            todoId: todoId
        },
        UpdateExpression: 'set #nameId= :name, dueDate= :dueDate, done= :isDone',
        ExpressionAttributeNames: {
            '#nameId': 'name'
        },
        ExpressionAttributeValues: {
            ':name': todos.name,
            ':dueDate': todos.dueDate,
            ':isDone': todos.done,
        }
    }).promise()

    return todos
}

function createDynamoDBClient() {
    if (process.env.IS_OFFLINE) {
       console.log('Creating a local DynamoDB instance')
       return new XAWS.DynamoDB.DocumentClient({
        region: 'localhost',
        endpoint: 'http://localhost:8000'
       })
    }

    return new XAWS.DynamoDB.DocumentClient();
}