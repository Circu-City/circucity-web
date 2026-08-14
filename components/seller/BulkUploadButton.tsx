'use client';

import { useState } from 'react';
import { Upload } from 'lucide-react';
import { BulkUploadModal } from '@/components/seller/BulkUploadModal';
import { Button } from '@/components/ui/button';

export function BulkUploadButton({ shopId }: { shopId: string }) {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <Button onClick={() => setShowModal(true)} variant="outline" className="gap-2">
        <Upload className="w-4 h-4" /> Bulk Upload
      </Button>
      {showModal && <BulkUploadModal shopId={shopId} onClose={() => setShowModal(false)} />}
    </>
  );
}
