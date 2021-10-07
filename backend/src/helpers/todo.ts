import * as uuid from 'uuid'
import { TodoItem } from '../models/TodoItem'
import { TodoUpdate } from '../models/TodoUpdate'
import { TodoAccess } from './todoAccess'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
import { TodoFileStorage } from './attachmentUtils'

const todoAccess = new TodoAccess()
const fileStorage = new TodoFileStorage()
const bucketName = process.env.TODO_BUCKET

export async function getAllTodos(userId: string): Promise<TodoItem[]> {
  const todos = await todoAccess.getAllTodos(userId)
  return todos;
}

export async function createTodo(
  createTodoRequest: CreateTodoRequest,
  userId: string
): Promise<TodoItem> {
  const todoId = uuid.v4()
  const attachmentUrl = `https://${bucketName}.s3.amazonaws.com/${todoId}`
  const data = {
    ...createTodoRequest,
    todoId,
    attachmentUrl,
    done: false,
    userId,
    createdAt: new Date().toISOString()
  }

  await todoAccess.createTodo(data)
  return data
}

export async function updateTodo(
  updateTodoRequest: UpdateTodoRequest,
  userId: string,
  todoId: string
): Promise<TodoUpdate> {
  await todoAccess.updateTodo(todoId, updateTodoRequest, userId)
  return updateTodoRequest
}

export async function deleteTodo(
  todoId: string,
  userId: string
): Promise<null> {
  await todoAccess.deleteTodo(todoId, userId)
  return null
}

export async function generateUploadUrl(todoId: string, userId: string): Promise<string | null> {
    const todoAvailable = await todoAccess.todoExists(todoId, userId);
    if (!todoAvailable) {
        return null
    }

    return fileStorage.getUploadUrl(todoId)
}
