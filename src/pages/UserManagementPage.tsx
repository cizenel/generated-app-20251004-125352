import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { UserTable } from "@/components/users/UserTable";
import { useUserStore } from "@/store/userStore";
import { useAuthStore } from "@/store/authStore";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { UserForm, UserFormValues } from "@/components/users/UserForm";
import { DeleteUserDialog } from "@/components/users/DeleteUserDialog";
import { AuthUser } from "@shared/types";
import { t } from "@/lib/i18n";
import { Skeleton } from "@/components/ui/skeleton";
export function UserManagementPage() {
  const { users, fetchUsers, addUser, updateUser, deleteUser, isLoading } = useUserStore();
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [isFormOpen, setFormOpen] = useState(false);
  const [isDeleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<AuthUser | null>(null);
  useEffect(() => {
    if (user?.role === 'L1') {
      navigate('/');
    } else {
      fetchUsers();
    }
  }, [fetchUsers, user, navigate]);
  const handleOpenForm = (user: AuthUser | null = null) => {
    setSelectedUser(user);
    setFormOpen(true);
  };
  const handleCloseForm = () => {
    setFormOpen(false);
    setSelectedUser(null);
  };
  const handleOpenDeleteConfirm = (user: AuthUser) => {
    setSelectedUser(user);
    setDeleteConfirmOpen(true);
  };
  const handleCloseDeleteConfirm = () => {
    setDeleteConfirmOpen(false);
    setSelectedUser(null);
  };
  const handleFormSubmit = async (values: UserFormValues) => {
    const userData = { ...values };
    if (!userData.password) {
      delete userData.password;
    }
    if (selectedUser) {
      await updateUser(selectedUser.id, userData);
    } else {
      await addUser(userData as any);
    }
    handleCloseForm();
  };
  const handleDeleteConfirm = async () => {
    if (selectedUser) {
      await deleteUser(selectedUser.id);
    }
    handleCloseDeleteConfirm();
  };
  if (user?.role === 'L1') {
    return null; // Render nothing while redirecting
  }
  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-3xl font-bold text-gray-800">{t.userManagement}</h1>
      {isLoading && users.length === 0 ? (
        <div className="space-y-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      ) : (
        <UserTable
          data={users}
          onAddUser={() => handleOpenForm()}
          onEditUser={handleOpenForm}
          onDeleteUser={handleOpenDeleteConfirm}
        />
      )}
      <Dialog open={isFormOpen} onOpenChange={setFormOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{selectedUser ? t.editUser : t.addNewUser}</DialogTitle>
            <DialogDescription>{t.userFormDescription}</DialogDescription>
          </DialogHeader>
          <UserForm
            user={selectedUser}
            onSubmit={handleFormSubmit}
            isLoading={isLoading}
          />
        </DialogContent>
      </Dialog>
      <DeleteUserDialog
        user={selectedUser}
        isOpen={isDeleteConfirmOpen}
        onClose={handleCloseDeleteConfirm}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
}