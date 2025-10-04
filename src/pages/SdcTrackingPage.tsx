import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { SdcTable } from "@/components/sdc/SdcTable";
import { SdcForm, SdcFormValues } from "@/components/sdc/SdcForm";
import { DeleteSdcDialog } from "@/components/sdc/DeleteSdcDialog";
import { useSdcStore } from "@/store/sdcStore";
import { useAuthStore } from "@/store/authStore";
import { SdcRecord } from "@shared/types";
import { t } from "@/lib/i18n";
export function SdcTrackingPage() {
  const { records, fetchRecords, addRecord, updateRecord, deleteRecord, isLoading } = useSdcStore();
  const { user } = useAuthStore();
  const [isFormOpen, setFormOpen] = useState(false);
  const [isDeleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<SdcRecord | null>(null);
  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);
  const handleOpenForm = (record: SdcRecord | null = null) => {
    setSelectedRecord(record);
    setFormOpen(true);
  };
  const handleCloseForm = () => {
    setFormOpen(false);
    setSelectedRecord(null);
  };
  const handleOpenDeleteConfirm = (record: SdcRecord) => {
    setSelectedRecord(record);
    setDeleteConfirmOpen(true);
  };
  const handleCloseDeleteConfirm = () => {
    setDeleteConfirmOpen(false);
    setSelectedRecord(null);
  };
  const handleFormSubmit = async (values: SdcFormValues) => {
    if (!user) return;
    if (selectedRecord) {
      await updateRecord(selectedRecord.id, {
        ...values,
        workDone: values.workDone.map(wd => ({ ...wd, id: wd.id || crypto.randomUUID() })),
      });
    } else {
      await addRecord({
        ...values,
        creatorId: user.id,
        workDone: values.workDone.map(wd => ({ ...wd, id: crypto.randomUUID() })),
      });
    }
    handleCloseForm();
  };
  const handleDeleteConfirm = async () => {
    if (selectedRecord) {
      await deleteRecord(selectedRecord.id);
    }
    handleCloseDeleteConfirm();
  };
  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-3xl font-bold text-gray-800">{t.sdcTrackingList}</h1>
      {isLoading && records.length === 0 ? (
        <div className="space-y-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      ) : (
        <SdcTable
          data={records}
          onAddRecord={() => handleOpenForm()}
          onEditRecord={handleOpenForm}
          onDeleteRecord={handleOpenDeleteConfirm}
        />
      )}
      <Dialog open={isFormOpen} onOpenChange={setFormOpen}>
        <DialogContent className="sm:max-w-4xl">
          <DialogHeader>
            <DialogTitle>{selectedRecord ? t.editSdcRecord : t.addNewSdcRecord}</DialogTitle>
            <DialogDescription>{t.sdcFormDescription}</DialogDescription>
          </DialogHeader>
          <SdcForm
            record={selectedRecord}
            onSubmit={handleFormSubmit}
            onCancel={handleCloseForm}
            isLoading={isLoading}
          />
        </DialogContent>
      </Dialog>
      <DeleteSdcDialog
        record={selectedRecord}
        isOpen={isDeleteConfirmOpen}
        onClose={handleCloseDeleteConfirm}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
}