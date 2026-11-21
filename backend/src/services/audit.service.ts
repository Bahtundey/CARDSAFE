import { AuditLog, IAuditLog } from '../models';
import { Types } from 'mongoose';

export interface AuditEntry {
  action: string;
  actorId?: Types.ObjectId | string | null;
  targetId?: Types.ObjectId | string | null;
  targetType?: string | null;
  metadata?: Record<string, unknown> | null;
  ip?: string | null;
}

/** Record a sensitive action. Never include passwords or secret values. */
export async function log(entry: AuditEntry): Promise<IAuditLog> {
  return AuditLog.create({
    actorId: entry.actorId ?? null,
    action: entry.action,
    targetId: entry.targetId ?? null,
    targetType: entry.targetType ?? null,
    metadata: entry.metadata ?? null,
    ip: entry.ip ?? null,
  });
}

export interface ListLogsArgs {
  limit?: number;
  offset?: number;
  action?: string;
}

export async function listLogs(args: ListLogsArgs = {}): Promise<IAuditLog[]> {
  const filter = args.action ? { action: args.action } : {};
  return AuditLog.find(filter)
    .sort({ createdAt: -1 })
    .skip(args.offset ?? 0)
    .limit(args.limit ?? 100)
    .populate('actorId');
}
