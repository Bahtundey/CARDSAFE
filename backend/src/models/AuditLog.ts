import { Schema, model, models, Model, Types } from 'mongoose';

export interface IAuditLog {
  _id: Types.ObjectId;
  actorId?: Types.ObjectId | null;
  action: string;
  targetId?: Types.ObjectId | null;
  targetType?: string | null;
  metadata?: Record<string, unknown> | null;
  ip?: string | null;
  createdAt: Date;
}

type AuditLogModel = Model<IAuditLog>;

const auditLogSchema = new Schema<IAuditLog>(
  {
    actorId: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    action: { type: String, required: true, index: true },
    targetId: { type: Schema.Types.ObjectId, default: null },
    targetType: { type: String, default: null },
    metadata: { type: Schema.Types.Mixed, default: null },
    ip: { type: String, default: null },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const AuditLog: AuditLogModel =
  (models.AuditLog as AuditLogModel) ||
  model<IAuditLog, AuditLogModel>('AuditLog', auditLogSchema);
