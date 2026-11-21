'use client';

import { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { ShieldCheck, BadgeCheck, FileText, Camera } from 'lucide-react';
import {
  KYC_STATUS,
  SUBMIT_KYC,
  KycStatusInfo,
  DocumentType,
  UploadedMedia,
} from '@/lib/graphql/operations';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { Alert } from '@/components/ui/Alert';
import { EmptyState } from '@/components/ui/EmptyState';
import { DragDropUpload } from '@/components/upload/DragDropUpload';
import { useToast } from '@/components/ui/Toast';
import { kycStatusMeta, documentTypeLabel, formatDateTime } from '@/lib/format';
import { extractErrorMessage } from '@/lib/errors';

const DOCUMENT_TYPES: DocumentType[] = ['NATIONAL_ID', 'PASSPORT', 'DRIVERS_LICENSE', 'VOTERS_CARD'];

export default function KycPage() {
  const toast = useToast();
  const { data, loading } = useQuery<{ kycStatus: KycStatusInfo | null }>(KYC_STATUS);
  const [submit, { loading: submitting }] = useMutation(SUBMIT_KYC, {
    refetchQueries: ['KycStatus'],
  });

  const [documentType, setDocumentType] = useState<DocumentType>('PASSPORT');
  const [docMedia, setDocMedia] = useState<UploadedMedia | null>(null);
  const [selfieMedia, setSelfieMedia] = useState<UploadedMedia | null>(null);
  const [error, setError] = useState<string | null>(null);

  const kyc = data?.kycStatus ?? null;
  const needsSubmit = !kyc || kyc.status === 'REJECTED' || kyc.status === 'PENDING';

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!docMedia) {
      setError('Please upload an ID document image.');
      return;
    }
    try {
      await submit({
        variables: {
          input: {
            documentType,
            documentImageMediaId: docMedia.id,
            selfieImageMediaId: selfieMedia?.id ?? null,
          },
        },
      });
      toast.success('KYC submitted for review.');
      setDocMedia(null);
      setSelfieMedia(null);
    } catch (err) {
      setError(extractErrorMessage(err));
    }
  }

  if (loading) {
    return <div className="glass-card h-48 animate-pulse" />;
  }

  if (kyc && kyc.status === 'APPROVED') {
    return (
      <div className="max-w-xl">
        <h1 className="text-2xl font-bold text-ink-900">KYC verification</h1>
        <div className="mt-6 glass-card flex items-start gap-4 p-6">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
            <BadgeCheck className="h-6 w-6" />
          </span>
          <div>
            <p className="text-base font-semibold text-ink-900">Identity verified</p>
            <p className="mt-1 text-sm text-ink-500">
              Your {documentTypeLabel(kyc.documentType)} has been verified. You now have access to higher account limits.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-ink-900">KYC verification</h1>
        <p className="mt-1 text-sm text-ink-500">
          Verify your identity to unlock higher withdrawal limits.
        </p>
      </div>

      {error && <Alert variant="error">{error}</Alert>}

      {kyc && kyc.status === 'PENDING' && (
        <div className="glass-card p-6">
          <div className="flex items-center gap-3">
            <ShieldCheck className="h-5 w-5 text-amber-600" />
            <p className="text-sm text-ink-700">
              Your {documentTypeLabel(kyc.documentType)} is under review. You can resubmit below if needed.
            </p>
          </div>
        </div>
      )}

      {kyc && kyc.status === 'REJECTED' && (
        <div className="glass-card p-6">
          <div className="flex items-start gap-3">
            <ShieldCheck className="h-5 w-5 shrink-0 text-red-600" />
            <div>
              <p className="text-sm font-semibold text-red-700">Verification rejected</p>
              {kyc.rejectionReason && <p className="mt-1 text-sm text-ink-500">{kyc.rejectionReason}</p>}
              <p className="mt-2 text-xs text-ink-400">Please correct the issue and resubmit.</p>
            </div>
          </div>
        </div>
      )}

      {needsSubmit && (
        <form onSubmit={onSubmit} className="glass-card space-y-5 p-6">
          <Select
            label="Document type"
            value={documentType}
            onChange={(e) => setDocumentType(e.target.value as DocumentType)}
          >
            {DOCUMENT_TYPES.map((t) => (
              <option key={t} value={t}>{documentTypeLabel(t)}</option>
            ))}
          </Select>

          <div>
            <p className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-ink-600">
              <FileText className="h-4 w-4" /> ID document
            </p>
            <DragDropUpload folder="kyc-documents" onUploaded={setDocMedia} onClear={() => setDocMedia(null)} />
          </div>

          <div>
            <p className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-ink-600">
              <Camera className="h-4 w-4" /> Selfie (optional)
            </p>
            <DragDropUpload folder="kyc-selfies" onUploaded={setSelfieMedia} onClear={() => setSelfieMedia(null)} />
          </div>

          <Button type="submit" loading={submitting} disabled={!docMedia}>
            Submit for review
          </Button>
        </form>
      )}
    </div>
  );
}
