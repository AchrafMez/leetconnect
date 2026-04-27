// import { DataTypes, Model, Optional, BelongsToGetAssociationMixin, HasManyGetAssociationsMixin } from 'sequelize';
// import sequelize from '../config/database';


// // const Conversation = sequelize.define('Conversation', {
// //   id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
// //   type: { type: DataTypes.STRING(20), defaultValue: 'direct', validate: { isIn: [['direct', 'group']] } },
// //   name: DataTypes.STRING(100),
// //   created_by: DataTypes.UUID,
// // }, { tableName: 'conversations' });
// // const ConversationMember = sequelize.define('ConversationMember', {
// //   id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
// //   conversation_id: { type: DataTypes.UUID, allowNull: false },
// //   user_id: { type: DataTypes.UUID, allowNull: false },
// //   joined_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
// // }, {
// //   tableName: 'conversation_members',
// //   indexes: [{ unique: true, fields: ['conversation_id', 'user_id'] }],
// // });
// // const Message = sequelize.define('Message', {
// //   id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
// //   conversation_id: { type: DataTypes.UUID, allowNull: false },
// //   sender_id: { type: DataTypes.UUID, allowNull: false },
// //   content: { type: DataTypes.TEXT, allowNull: false },
// //   type: { type: DataTypes.STRING(20), defaultValue: 'text', validate: { isIn: [['text', 'image', 'file']] } },
// // }, { tableName: 'messages' });
// // const Notification = sequelize.define('Notification', {
// //   id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
// //   user_id: { type: DataTypes.UUID, allowNull: false },
// //   type: { type: DataTypes.STRING(50), allowNull: false },
// //   title: DataTypes.STRING(200),
// //   body: DataTypes.TEXT,
// //   data: DataTypes.JSONB,
// //   is_read: { type: DataTypes.BOOLEAN, defaultValue: false },
// // }, { tableName: 'notifications' });
// // Conversation.hasMany(ConversationMember, { foreignKey: 'conversation_id' });
// // ConversationMember.belongsTo(Conversation, { foreignKey: 'conversation_id' });
// // Conversation.hasMany(Message, { foreignKey: 'conversation_id' });
// // Message.belongsTo(Conversation, { foreignKey: 'conversation_id' });

// // export { Conversation, ConversationMember, Message, Notification };


// interface ConversationAttributes {
//   id: string;
//   type: 'direct' | 'group';
//   name?: string;
//   created_by?: string;
// }

// interface ConversationCreationAttributes extends Optional<ConversationAttributes, 'id' | 'type'> {}

// class Conversation extends Model<ConversationAttributes, ConversationCreationAttributes>
//   implements ConversationAttributes {
//   declare id: string;
//   declare type: 'direct' | 'group';
//   declare name?: string;  
//   declare created_by?: string;

//   declare readonly createdAt: Date;
//   declare readonly updatedAt: Date;

//   declare getMessages: HasManyGetAssociationsMixin<Message>;
//   declare getConversationMembers: HasManyGetAssociationsMixin<ConversationMember>;
// }

// Conversation.init({
//   id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
//   type: { type: DataTypes.STRING(20), defaultValue: 'direct', validate: { isIn: [['direct', 'group']] } },
//   name: DataTypes.STRING(100),
//   created_by: DataTypes.UUID,
// }, { sequelize, tableName: 'conversations' });

// interface ConversationMemberAttributes {
//   id: string;
//   conversation_id: string;
//   user_id: string;
//   joined_at?: Date;
// }

// interface ConversationMemberCreationAttributes extends Optional<ConversationMemberAttributes, 'id' | 'joined_at'> {}

// class ConversationMember extends Model<ConversationMemberAttributes, ConversationMemberCreationAttributes>
//   implements ConversationMemberAttributes {
//   declare id: string;
//   declare conversation_id: string;
//   declare user_id: string;
//   declare joined_at: Date;

//   declare getConversation: BelongsToGetAssociationMixin<Conversation>;
// }

// ConversationMember.init({
//   id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
//   conversation_id: { type: DataTypes.UUID, allowNull: false },
//   user_id: { type: DataTypes.UUID, allowNull: false },
//   joined_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
// }, {
//   sequelize,
//   tableName: 'conversation_members',
//   indexes: [{ unique: true, fields: ['conversation_id', 'user_id'] }],
// });

// interface MessageAttributes {
//   id: string;
//   conversation_id: string;
//   sender_id: string;
//   content: string;
//   type: 'text' | 'image' | 'file';
// }

// interface MessageCreationAttributes extends Optional<MessageAttributes, 'id' | 'type'> {}

// class Message extends Model<MessageAttributes, MessageCreationAttributes>
//   implements MessageAttributes {
//   declare id: string;
//   declare conversation_id: string;
//   declare sender_id: string;
//   declare content: string;
//   declare type: 'text' | 'image' | 'file';

//   declare getConversation: BelongsToGetAssociationMixin<Conversation>;
// }

// Message.init({
//   id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
//   conversation_id: { type: DataTypes.UUID, allowNull: false },
//   sender_id: { type: DataTypes.UUID, allowNull: false },
//   content: { type: DataTypes.TEXT, allowNull: false },
//   type: { type: DataTypes.STRING(20), defaultValue: 'text', validate: { isIn: [['text', 'image', 'file']] } },
// }, { sequelize, tableName: 'messages' });

// interface NotificationAttributes {
//   id: string;
//   user_id: string;
//   type: string;
//   title?: string;
//   body?: string;
//   data?: Record<string, unknown>;
//   is_read: boolean;
// }

// interface NotificationCreationAttributes extends Optional<NotificationAttributes, 'id' | 'is_read'> {}

// class Notification extends Model<NotificationAttributes, NotificationCreationAttributes>
//   implements NotificationAttributes {
//   declare id: string;
//   declare user_id: string;
//   declare type: string;
//   declare title?: string;
//   declare body?: string;
//   declare data?: Record<string, unknown>;
//   declare is_read: boolean;
// }

// Notification.init({
//   id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
//   user_id: { type: DataTypes.UUID, allowNull: false },
//   type: { type: DataTypes.STRING(50), allowNull: false },
//   title: DataTypes.STRING(200),
//   body: DataTypes.TEXT,
//   data: DataTypes.JSONB,
//   is_read: { type: DataTypes.BOOLEAN, defaultValue: false },
// }, { sequelize, tableName: 'notifications' });


// Conversation.hasMany(ConversationMember, { foreignKey: 'conversation_id' });
// ConversationMember.belongsTo(Conversation, { foreignKey: 'conversation_id' });
// Conversation.hasMany(Message, { foreignKey: 'conversation_id' });
// Message.belongsTo(Conversation, { foreignKey: 'conversation_id' });

// export { Conversation, ConversationMember, Message, Notification };
// export type { ConversationAttributes, ConversationMemberAttributes, MessageAttributes, NotificationAttributes };