// import { PrismaClient } from "../../prisma/generated/client";
// import { PrismaPg } from '@prisma/adapter-pg';

// const adapter = new PrismaPg({
// 	connectionString: process.env.DATABASE_URL!
// });

// const prisma = new PrismaClient({ adapter });

// export default prisma;



import { PrismaClient } from "../../prisma/generated/client";
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({ 
  connectionString: process.env.CHAT_DATABASE_URL || process.env.DATABASE_URL! 
});

const prisma = new PrismaClient({ adapter });
export default prisma;