import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import { Interface } from 'node:readline';

interface UserAttributes {
  id: string;
  email: string;
  password_hash?: string;
  username: string;
  display_name?: string;
  avatar_url?: string;
  bio?: string;
  role?: 'client' | 'freelancer' | 'admin';
  is_online?: boolean;
  last_seen?: Date;
  two_fa_secret?: string;
  two_fa_enabled?: boolean;
}
interface UserCreationAttributes extends Optional<UserAttributes, 'id'> {}

class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
  declare id: string;
  declare email: string;
  declare password_hash?: string;
  declare username: string;
  declare display_name?: string;
  declare avatar_url?: string;
  declare bio?: string;
  declare role?: 'client' | 'freelancer' | 'admin';
  declare is_online?: boolean;
  declare last_seen?: Date;
  declare two_fa_secret?: string;
  declare two_fa_enabled?: boolean;
}

User.init({
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  email: { type: DataTypes.STRING(255), allowNull: false, unique: true, validate: { isEmail: true } },
  password_hash: { type: DataTypes.STRING(255), allowNull: true },
  username: { type: DataTypes.STRING(50), allowNull: false, unique: true },
  display_name: DataTypes.STRING(100),
  avatar_url: DataTypes.STRING(500),
  bio: DataTypes.TEXT,
  role: {
    type: DataTypes.STRING(20), defaultValue: 'client',
    validate: { isIn: [['client', 'freelancer', 'admin']] },
  },
  is_online: { type: DataTypes.BOOLEAN, defaultValue: false },
  last_seen: DataTypes.DATE,
  two_fa_secret: DataTypes.STRING(255),
  two_fa_enabled: { type: DataTypes.BOOLEAN, defaultValue: false },
}, { sequelize, tableName: 'users' });

export default User;