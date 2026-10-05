import { useState } from "react";
import { toast } from "sonner";
import { UserPlus, ShieldCheck, ShieldOff } from "lucide-react";
import {
  useGetUsersQuery,
  useCreateHostMutation,
  useUpdateUserStatusMutation,
} from "../../features/auth/authApi";
import { useAppSelector } from "../../app/hooks";
import { selectCurrentUser } from "../../features/auth/authSlice";
import { PageLoader } from "../../components/ui/Loaders";
import { ErrorState } from "../../components/ui/States";
import { getErrorMessage } from "../../lib/getErrorMessage";
import { formatDateShort } from "../../lib/formatters";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";

const emptyForm = { name: "", email: "", password: "", role: "host" };

export default function Admins() {
  const currentUser = useAppSelector(selectCurrentUser);
  const { data, isLoading, isError, error, refetch } = useGetUsersQuery();
  const [createHost, { isLoading: isCreating }] = useCreateHostMutation();
  const [updateStatus] = useUpdateUserStatusMutation();

  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const users = data?.data?.users || [];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) {
      toast.error("Name, email and password are required.");
      return;
    }
    if (form.password.length < 8) {
      toast.error("Password must be at least 8 characters.");
      return;
    }

    try {
      await createHost(form).unwrap();
      toast.success(
        `${form.role === "superadmin" ? "Admin" : "Host"} account created successfully.`,
      );
      setForm(emptyForm);
      setModalOpen(false);
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const handleToggleStatus = async (user) => {
    try {
      await updateStatus({ id: user.id, isActive: !user.isActive }).unwrap();
      toast.success(
        `${user.name} ${user.isActive ? "deactivated" : "activated"} successfully.`,
      );
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  if (isLoading) return <PageLoader label="Loading accounts..." />;
  if (isError)
    return <ErrorState message={getErrorMessage(error)} onRetry={refetch} />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Admins &amp; Hosts</h1>
          <p className="text-ink-400 text-sm mt-1">
            Manage who can access the dashboard
          </p>
        </div>
        <Button icon={UserPlus} onClick={() => setModalOpen(true)}>
          Add Account
        </Button>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-ink-800">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-ink-900 text-ink-400 text-left">
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Email</th>
              <th className="px-4 py-3 font-medium">Role</th>
              <th className="px-4 py-3 font-medium">Joined</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-t border-ink-800">
                <td className="px-4 py-3 text-ink-100 font-medium">
                  {user.name}{" "}
                  {user.id === currentUser?.id && (
                    <span className="text-ink-500 text-xs">(you)</span>
                  )}
                </td>
                <td className="px-4 py-3 text-ink-400">{user.email}</td>
                <td className="px-4 py-3">
                  <span className="text-xs px-2 py-1 rounded-full bg-gold-500/10 text-gold-400 capitalize">
                    {user.role}
                  </span>
                </td>
                <td className="px-4 py-3 text-ink-500 text-xs">
                  {formatDateShort(user.createdAt)}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${user.isActive ? "bg-emerald-500/10 text-emerald-400" : "bg-ink-800 text-ink-500"}`}
                  >
                    {user.isActive ? "Active" : "Deactivated"}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  {user.id !== currentUser?.id && (
                    <Button
                      variant={user.isActive ? "danger" : "secondary"}
                      size="sm"
                      icon={user.isActive ? ShieldOff : ShieldCheck}
                      onClick={() => handleToggleStatus(user)}
                    >
                      {user.isActive ? "Deactivate" : "Activate"}
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Add Account"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block">
            <span className="text-xs font-medium text-ink-400 mb-1.5 block">
              Full Name
            </span>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full bg-ink-950 border border-ink-800 rounded-xl px-4 py-2.5 text-base text-ink-100 focus:outline-none focus:border-gold-500/50"
            />
          </label>
          <label className="block">
            <span className="text-xs font-medium text-ink-400 mb-1.5 block">
              Email
            </span>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full bg-ink-950 border border-ink-800 rounded-xl px-4 py-2.5 text-base text-ink-100 focus:outline-none focus:border-gold-500/50"
            />
          </label>
          <label className="block">
            <span className="text-xs font-medium text-ink-400 mb-1.5 block">
              Temporary Password
            </span>
            <input
              type="text"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="w-full bg-ink-950 border border-ink-800 rounded-xl px-4 py-2.5 text-base text-ink-100 focus:outline-none focus:border-gold-500/50"
            />
          </label>
          <label className="block">
            <span className="text-xs font-medium text-ink-400 mb-1.5 block">
              Role
            </span>
            <select
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
              className="w-full bg-ink-950 border border-ink-800 rounded-xl px-4 py-2.5 text-base text-ink-100 focus:outline-none focus:border-gold-500/50"
            >
              <option value="host">Host</option>
              <option value="superadmin">Super Admin</option>
            </select>
          </label>
          <Button type="submit" isLoading={isCreating} className="w-full">
            Create Account
          </Button>
        </form>
      </Modal>
    </div>
  );
}
