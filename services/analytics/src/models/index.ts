import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface EventAttributes {
  id: string;
  event_type: string;
  actor_id?: string;
  payload: object;
}

interface EventCreationAttributes extends Optional<EventAttributes, 'id'> {}

class Event extends Model<EventAttributes, EventCreationAttributes> implements EventAttributes {
  declare id: string;
  declare event_type: string;
  declare actor_id?: string;
  declare payload: object;
}

Event.init({
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  event_type: { type: DataTypes.STRING(100), allowNull: false },
  actor_id: DataTypes.UUID,
  payload: { type: DataTypes.JSONB, allowNull: false },
}, {
  sequelize,
  tableName: 'events',
  indexes: [{ fields: ['event_type'] }, { fields: ['created_at'] }],
});

interface DailyMetricAttributes {
  id: string;
  date: string;
  metric_name: string;
  metric_value: number;
  dimensions?: object;
}

interface DailyMetricCreationAttributes extends Optional<DailyMetricAttributes, 'id'> {}

class DailyMetric extends Model<DailyMetricAttributes, DailyMetricCreationAttributes> implements DailyMetricAttributes {
  declare id: string;
  declare date: string;
  declare metric_name: string;
  declare metric_value: number;
  declare dimensions?: object;
}

DailyMetric.init({
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  date: { type: DataTypes.DATEONLY, allowNull: false },
  metric_name: { type: DataTypes.STRING(100), allowNull: false },
  metric_value: { type: DataTypes.DECIMAL(15, 2), allowNull: false },
  dimensions: DataTypes.JSONB,
}, {
  sequelize,
  tableName: 'daily_metrics',
  indexes: [{ unique: true, fields: ['date', 'metric_name'] }],
});

interface UserActivityLogAttributes {
  id: string;
  user_id: string;
  action: string;
  metadata?: object;
}

interface UserActivityLogCreationAttributes extends Optional<UserActivityLogAttributes, 'id'> {}

class UserActivityLog extends Model<UserActivityLogAttributes, UserActivityLogCreationAttributes> implements UserActivityLogAttributes {
  declare id: string;
  declare user_id: string;
  declare action: string;
  declare metadata?: object;
}

UserActivityLog.init({
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  user_id: { type: DataTypes.UUID, allowNull: false },
  action: { type: DataTypes.STRING(100), allowNull: false },
  metadata: DataTypes.JSONB,
}, {
  sequelize,
  tableName: 'user_activity_logs',
  indexes: [{ fields: ['user_id', 'created_at'] }],
});

export { Event, DailyMetric, UserActivityLog };