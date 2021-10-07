import * as AWS from 'aws-sdk'

export class TodoFileStorage {
  constructor(
    private readonly s3 = createS3Client(),
    private readonly bucketName = process.env.TODO_BUCKET,
    private readonly SIGNED_URL_EXPIRATION = process.env
      .SIGNED_URL_EXPIRATION || 60 * 60 * 24 * 7
  ) {}

  async getUploadUrl(todoId: string): Promise<string> {
    const params = {
      Bucket: this.bucketName,
      Key: todoId,
      Expires: Number(this.SIGNED_URL_EXPIRATION)
    }
    return this.s3.getSignedUrl('putObject', params)
  }
}

function createS3Client() {
  return new AWS.S3({
    signatureVersion: 'v4'
  })
}
