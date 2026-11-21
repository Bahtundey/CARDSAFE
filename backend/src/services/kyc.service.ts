import { KYC, Media, IKYC, IUser, KycImage } from '../models';
import { Errors } from '../utils/errors';
import * as notificationService from './notification.service';
import * as auditService from './audit.service';

export interface SubmitKycInput {
  documentType: string;
  documentImageMediaId: string;
  selfieImageMediaId?: string | null;
}

export async function getKycStatus(user: IUser): Promise<IKYC | null> {
  return KYC.findOne({ user: user._id });
}

export async function submitKYC(user: IUser, input: SubmitKycInput, ip?: string | null): Promise<IKYC> {
  const docMedia = await Media.findById(input.documentImageMediaId);
  if (!docMedia) throw Errors.badInput('A document image is required.');
  if (docMedia.owner.toString() !== user._id.toString()) {
    throw Errors.forbidden('Invalid document image.');
  }

  let selfieImage: KycImage | null = null;
  if (input.selfieImageMediaId) {
    const selfieMedia = await Media.findById(input.selfieImageMediaId);
    if (!selfieMedia || selfieMedia.owner.toString() !== user._id.toString()) {
      throw Errors.forbidden('Invalid selfie image.');
    }
    selfieImage = { url: selfieMedia.url, publicId: selfieMedia.publicId };
  }

  const documentImage = { url: docMedia.url, publicId: docMedia.publicId };
  const existing = await KYC.findOne({ user: user._id });

  let kyc: IKYC;
  if (existing) {
    if (existing.status === 'APPROVED') throw Errors.badInput('Your KYC is already approved.');
    existing.documentType = input.documentType as IKYC['documentType'];
    existing.documentImage = documentImage;
    existing.selfieImage = selfieImage;
    existing.status = 'PENDING';
    existing.rejectionReason = null;
    existing.reviewedBy = null;
    existing.reviewedAt = null;
    await existing.save();
    kyc = existing;
  } else {
    kyc = await KYC.create({
      user: user._id,
      documentType: input.documentType,
      documentImage,
      selfieImage,
      status: 'PENDING',
    });
  }

  await auditService.log({
    action: 'kyc_submitted',
    actorId: user._id,
    targetId: kyc._id,
    targetType: 'KYC',
    metadata: { documentType: input.documentType },
    ip,
  });

  return kyc;
}

export async function listAllKyc(status?: string): Promise<IKYC[]> {
  const filter = status ? { status } : {};
  const docs = await KYC.find(filter).sort({ createdAt: -1 }).populate('user');
  return docs as unknown as IKYC[];
}

export async function approveKYC(id: string, admin: IUser, ip?: string | null): Promise<IKYC> {
  const kyc = await KYC.findById(id);
  if (!kyc) throw Errors.notFound('KYC record not found.');
  if (kyc.status === 'APPROVED') throw Errors.badInput('Already approved.');

  kyc.status = 'APPROVED';
  kyc.rejectionReason = null;
  kyc.reviewedBy = admin._id;
  kyc.reviewedAt = new Date();
  await kyc.save();

  await notificationService.notify(kyc.user, 'KYC_APPROVED', 'KYC approved', 'Your identity verification has been approved.');
  await auditService.log({
    action: 'kyc_approved',
    actorId: admin._id,
    targetId: kyc._id,
    targetType: 'KYC',
    metadata: { userId: kyc.user.toString() },
    ip,
  });

  const hydrated = await KYC.findById(id).populate('user');
  return hydrated as unknown as IKYC;
}

export async function rejectKYC(id: string, admin: IUser, reason: string, ip?: string | null): Promise<IKYC> {
  const kyc = await KYC.findById(id);
  if (!kyc) throw Errors.notFound('KYC record not found.');
  if (kyc.status === 'APPROVED') throw Errors.badInput('Cannot reject an approved KYC.');

  kyc.status = 'REJECTED';
  kyc.rejectionReason = reason?.trim() || null;
  kyc.reviewedBy = admin._id;
  kyc.reviewedAt = new Date();
  await kyc.save();

  await notificationService.notify(kyc.user, 'KYC_REJECTED', 'KYC rejected', reason?.trim() || 'Your identity verification was rejected.');
  await auditService.log({
    action: 'kyc_rejected',
    actorId: admin._id,
    targetId: kyc._id,
    targetType: 'KYC',
    metadata: { userId: kyc.user.toString(), reason },
    ip,
  });

  const hydrated = await KYC.findById(id).populate('user');
  return hydrated as unknown as IKYC;
}
