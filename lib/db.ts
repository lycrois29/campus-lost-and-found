import mongoose from "mongoose";

function requiredEnv(name: string) {
  const value = process.env[name];
  if (!value) throw new Error(`Please define ${name} in your environment variables.`);
  return value;
}

type MongooseCache = {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
};

declare global {
  // eslint-disable-next-line no-var
  var mongooseCache: MongooseCache | undefined;
}

const cached: MongooseCache = global.mongooseCache ?? { conn: null, promise: null };
global.mongooseCache = cached;

export async function connectDB() {
  if (cached.conn) return cached.conn;
  if (!cached.promise) {
    cached.promise = mongoose.connect(requiredEnv("MONGODB_URI"), { bufferCommands: false, serverSelectionTimeoutMS: 10_000 }).catch((error) => {
      cached.promise = null;
      throw error;
    });
  }
  cached.conn = await cached.promise;
  return cached.conn;
}
