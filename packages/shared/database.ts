// sequelize database connection used by all services
// each service calls createDatabase() once at startup to connect to its own postgresql

import { Sequelize } from 'sequelize';

function createDatabase(databaseUrl?: string): Sequelize {
    const url = databaseUrl || process.env.DATABASE_URL;
    if (!url) throw new Error('DATABASE_URL is required');
    return new Sequelize(url, {
        dialect: 'postgres',
        logging: process.env.NODE_ENV === 'development' ? console.log : false,
        pool: { max: 10, min: 2, acquire: 30000, idle: 10000 },
        define: { timestamps: true, underscored: true },
    });
}

export { createDatabase };