import { Sequelize }  from 'sequelize';

const sequelize = new Sequelize(process.env.DATABASE_URL as string, {
  dialect: 'postgres',
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  pool: { max: 10, min: 2, acquire: 30000, idle: 10000 },
  define: { timestamps: true, underscored: true },
});
export default sequelize;
