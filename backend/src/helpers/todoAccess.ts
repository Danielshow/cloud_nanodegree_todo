import * as AWS from "aws-sdk";
import { DocumentClient } from "aws-sdk/clients/dynamodb";
import * as AWSXray from 'aws-xray-sdk';

import { TodoItem } from "../models/TodoItem";
import { TodoUpdate } from "../models/TodoUpdate";

const XAWS = AWSXray.captureAWS(AWS)

export class TodoAccess {
  constructor(
    private readonly docClient: DocumentClient = createDynamoDBClient(),
    private readonly todosTable = process.env.TODOS_TABLE
  ) {}

  async getAllTodos(userId: string): Promise<TodoItem[]> {
    const result = await this.docClient
    .query({
      TableName: this.todosTable,
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: {
        ':userId': userId
      }
    })
    .promise()

    const items = result.Items;

    return items as TodoItem[];
  }

  async createTodo(item: TodoItem): Promise<TodoItem> {
    await this.docClient.put({
        TableName: this.todosTable,
        Item: item
      }).promise()

    return item;
  }

  async updateTodo(todoId: string, todo: TodoUpdate, userId: string): Promise<TodoUpdate> {
    await this.docClient
        .update({
          TableName: this.todosTable,
          Key: {
            todoId,
            userId
          },
          UpdateExpression:
            'set #nam = :name, dueDate = :dueDate, done = :done',
          ExpressionAttributeNames:{
              "#nam": "name"
          },
          ExpressionAttributeValues: {
            ':name': todo.name,
            ':dueDate': todo.dueDate,
            ':done': todo.done
          }
        })
        .promise()

    return todo;
  }

  async deleteTodo(todoId: string, userId: string): Promise<null> {
    await this.docClient
        .delete({
          TableName: this.todosTable,
          Key: {
            todoId,
            userId
          }
        })
        .promise()

    return null;
  }

  async todoExists(todoId: string, userId: string) {
    const result = await this.docClient
      .query({
        TableName: this.todosTable,
        KeyConditionExpression: 'todoId = :todoId and userId = :userId',
        ExpressionAttributeValues: {
          ':todoId': todoId,
          ':userId': userId
        }
      })
      .promise()
    return !!result.Items.length
  }
}

function createDynamoDBClient() {
  if (process.env.IS_OFFLINE) {
    console.log("Creating a local DynamoDB instance");
    return new XAWS.DynamoDB.DocumentClient({
      region: "localhost",
      endpoint: "http://localhost:8000"
    });
  }

  return new XAWS.DynamoDB.DocumentClient();
}
