import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { connectDb, disconnectDb } from '../config/database';
import { User } from '../models/User';
import { Post } from '../models/Post';
import { Like } from '../models/Like';
import { Comment } from '../models/Comment';

let memoryServer: MongoMemoryServer | null = null;

beforeAll(async () => {
  memoryServer = await MongoMemoryServer.create();
  await connectDb(memoryServer.getUri());
});

afterAll(async () => {
  await disconnectDb();
  if (memoryServer) {
    await memoryServer.stop();
  }
});

afterEach(async () => {
  await Promise.all([
    User.deleteMany({}),
    Post.deleteMany({}),
    Like.deleteMany({}),
    Comment.deleteMany({}),
  ]);
});
