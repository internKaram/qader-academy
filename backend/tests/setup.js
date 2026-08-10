
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
 
let mongoServer;
 
/**
 * Starts an in-memory MongoDB instance and connects Mongoose to it.
 * Call from beforeAll() in each test file.
 */
const connect = async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
 
  await mongoose.connect(uri, {
 
  });
};

 
const clearDatabase = async () => {
  const collections = mongoose.connection.collections;
  for (const key of Object.keys(collections)) {
    await collections[key].deleteMany({});
  }
};
 
/**
 * Disconnects Mongoose and stops the in-memory server.
 * Call from afterAll() once per test file.
 */
const closeDatabase = async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  if (mongoServer) {
    await mongoServer.stop();
  }
};
 
module.exports = { connect, clearDatabase, closeDatabase };