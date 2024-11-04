import { env } from './evironment'

const { MongoClient, ServerApiVersion } = require('mongodb')


// Khởi tạo 1 đối tượng trelloDatabaseInstance ban đầu là null (vì chưa connect)
let elearnDatabaseInstance:any = null

// Initialize an object mongoClientInstance to connect to the database.
const mongoClientInstance = new MongoClient(env.MONGODB_URI, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true, //
    deprecationErrors: true
  }
})

export const CONNECT_DB = async () => {
  await mongoClientInstance.connect()

  elearnDatabaseInstance = mongoClientInstance.db(env.DATABASE_NAME)
}

export const GET_DB = () => {
  if (!elearnDatabaseInstance) throw new Error('Must connect to Database first!')
  return elearnDatabaseInstance
}
// Đóng kết nối tới Database khi cần
export const CLOSE_DB = async () => {
  await mongoClientInstance.close()
}