import { PrismaClient } from '../../prisma/generated/client'; 
import { PrismaPg } from "@prisma/adapter-pg";

const globalForPrisma = global as unknown as {
  prisma: PrismaClient; 
}; 
const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL, 
}); 
const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    adapter, 
  }); 
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma; 

const connectDb = async () => {
	try {
		await prisma.$connect();
		console.log('Db Connected via Prisma');
	} catch (error) {
		console.error(`Db Connection error: ${error}`);
		process.exit(1);
	}
}

const disconnectDb = async () => {
	await prisma.$disconnect();
}

export { connectDb, disconnectDb }
export { prisma }