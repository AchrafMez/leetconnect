import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

const Conversation = sequelize.define('Conversation', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  type: { type: DataTypes.STRING(20), defaultValue: 'direct', validate: { isIn: [['direct', 'group']] } },
  name: DataTypes.STRING(100),
  created_by: DataTypes.UUID,
}, { tableName: 'conversations' });
const ConversationMember = sequelize.define('ConversationMember', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  conversation_id: { type: DataTypes.UUID, allowNull: false },
  user_id: { type: DataTypes.UUID, allowNull: false },
  joined_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
}, {
  tableName: 'conversation_members',
  indexes: [{ unique: true, fields: ['conversation_id', 'user_id'] }],
});
const Message = sequelize.define('Message', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  conversation_id: { type: DataTypes.UUID, allowNull: false },
  sender_id: { type: DataTypes.UUID, allowNull: false },
  content: { type: DataTypes.TEXT, allowNull: false },
  type: { type: DataTypes.STRING(20), defaultValue: 'text', validate: { isIn: [['text', 'image', 'file']] } },
}, { tableName: 'messages' });
const Notification = sequelize.define('Notification', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  user_id: { type: DataTypes.UUID, allowNull: false },
  type: { type: DataTypes.STRING(50), allowNull: false },
  title: DataTypes.STRING(200),
  body: DataTypes.TEXT,
  data: DataTypes.JSONB,
  is_read: { type: DataTypes.BOOLEAN, defaultValue: false },
}, { tableName: 'notifications' });
Conversation.hasMany(ConversationMember, { foreignKey: 'conversation_id' });
ConversationMember.belongsTo(Conversation, { foreignKey: 'conversation_id' });
Conversation.hasMany(Message, { foreignKey: 'conversation_id' });
Message.belongsTo(Conversation, { foreignKey: 'conversation_id' });

export { Conversation, ConversationMember, Message, Notification };