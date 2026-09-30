import { useState } from 'react';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, ImagePlus, Search } from 'lucide-react';
import { useGetCategoriesQuery } from '../../features/categories/categoriesApi';
import {
  useGetContestantsQuery,
  useCreateContestantMutation,
  useUpdateContestantMutation,
  useDeleteContestantMutation,
} from '../../features/contestants/contestantsApi';
import { PageLoader } from '../../components/ui/Loaders';
import { EmptyState, ErrorState } from '../../components/ui/States';
import { getErrorMessage } from '../../lib/getErrorMessage';
import { formatNumber } from '../../lib/formatters';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';

const emptyForm = { name: '', category: '', bio: '', instagramHandle: '', contestantNumber: '', isActive: true, photo: null };

export default function ContestantsManage() {
  const [search, setSearch] = useState('');
  const { data: categoriesData } = useGetCategoriesQuery({ all: 'true' });
  const { data, isLoading, isError, error, refetch } = useGetContestantsQuery({ search: search || undefined, limit: 100 });
  const [createContestant, { isLoading: isCreating }] = useCreateContestantMutation();
  const [updateContestant, { isLoading: isUpdating }] = useUpdateContestantMutation();
  const [deleteContestant] = useDeleteContestantMutation();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [preview, setPreview] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const categories = categoriesData?.data?.categories || [];
  const contestants = data?.data?.contestants || [];

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setPreview(null);
    setModalOpen(true);
  };

  const openEdit = (c) => {
    setEditingId(c._id);
    setForm({
      name: c.name,
      category: c.category?._id || c.category,
      bio: c.bio || '',
      instagramHandle: c.instagramHandle || '',
      contestantNumber: c.contestantNumber || '',
      isActive: c.isActive,
      photo: null,
    });
    setPreview(c.photo?.url || null);
    setModalOpen(true);
  };

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setForm((f) => ({ ...f, photo: file }));
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.category) {
      toast.error('Name and category are required.');
      return;
    }
    if (!editingId && !form.photo) {
      toast.error('A contestant photo is required.');
      return;
    }

    const formData = new FormData();
    Object.entries(form).forEach(([key, value]) => {
      if (key === 'photo') {
        if (value) formData.append('photo', value);
      } else {
        formData.append(key, value);
      }
    });

    try {
      if (editingId) {
        await updateContestant({ id: editingId, formData }).unwrap();
        toast.success('Contestant updated successfully.');
      } else {
        await createContestant(formData).unwrap();
        toast.success('Contestant added successfully.');
      }
      setModalOpen(false);
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteContestant(deleteTarget._id).unwrap();
      toast.success('Contestant deleted successfully.');
      setDeleteTarget(null);
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Contestants</h1>
          <p className="text-ink-400 text-sm mt-1">Manage contestants across all categories</p>
        </div>
        <Button icon={Plus} onClick={openCreate}>Add Contestant</Button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-500" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search contestants..."
          className="w-full bg-ink-900 border border-ink-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-ink-100 placeholder:text-ink-500 focus:outline-none focus:border-gold-500/50"
        />
      </div>

      {isLoading ? (
        <PageLoader label="Loading contestants..." />
      ) : isError ? (
        <ErrorState message={getErrorMessage(error)} onRetry={refetch} />
      ) : contestants.length === 0 ? (
        <EmptyState title="No contestants yet" message="Add your first contestant to get started." />
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-ink-800">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-ink-900 text-ink-400 text-left">
                <th className="px-4 py-3 font-medium">Contestant</th>
                <th className="px-4 py-3 font-medium">Category</th>
                <th className="px-4 py-3 font-medium">Votes</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {contestants.map((c) => (
                <tr key={c._id} className="border-t border-ink-800">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <img src={c.photo?.url} alt="" className="w-9 h-9 rounded-lg object-cover" />
                      <span className="font-medium text-ink-100">{c.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-ink-400">{c.category?.name}</td>
                  <td className="px-4 py-3 font-semibold text-gold-400">{formatNumber(c.voteCount)}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-1 rounded-full ${c.isActive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-ink-800 text-ink-500'}`}>
                      {c.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <Button variant="secondary" size="sm" icon={Pencil} onClick={() => openEdit(c)}>Edit</Button>
                      <Button variant="danger" size="sm" icon={Trash2} onClick={() => setDeleteTarget(c)}>Delete</Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editingId ? 'Edit Contestant' : 'Add Contestant'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-xl bg-ink-950 border border-ink-800 overflow-hidden flex items-center justify-center shrink-0">
              {preview ? <img src={preview} alt="" className="w-full h-full object-cover" /> : <ImagePlus className="w-6 h-6 text-ink-600" />}
            </div>
            <input type="file" accept="image/*" onChange={handleFile} className="text-xs text-ink-400" />
          </div>

          <label className="block">
            <span className="text-xs font-medium text-ink-400 mb-1.5 block">Full Name</span>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full bg-ink-950 border border-ink-800 rounded-xl px-4 py-2.5 text-sm text-ink-100 focus:outline-none focus:border-gold-500/50"
            />
          </label>

          <label className="block">
            <span className="text-xs font-medium text-ink-400 mb-1.5 block">Category</span>
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="w-full bg-ink-950 border border-ink-800 rounded-xl px-4 py-2.5 text-sm text-ink-100 focus:outline-none focus:border-gold-500/50"
            >
              <option value="">Select a category</option>
              {categories.map((cat) => (
                <option key={cat._id} value={cat._id}>{cat.name}</option>
              ))}
            </select>
          </label>

          <div className="grid grid-cols-2 gap-4">
            <label className="block">
              <span className="text-xs font-medium text-ink-400 mb-1.5 block">Contestant No.</span>
              <input
                type="text"
                value={form.contestantNumber}
                onChange={(e) => setForm({ ...form, contestantNumber: e.target.value })}
                className="w-full bg-ink-950 border border-ink-800 rounded-xl px-4 py-2.5 text-sm text-ink-100 focus:outline-none focus:border-gold-500/50"
              />
            </label>
            <label className="block">
              <span className="text-xs font-medium text-ink-400 mb-1.5 block">Instagram</span>
              <input
                type="text"
                value={form.instagramHandle}
                onChange={(e) => setForm({ ...form, instagramHandle: e.target.value })}
                placeholder="@handle"
                className="w-full bg-ink-950 border border-ink-800 rounded-xl px-4 py-2.5 text-sm text-ink-100 focus:outline-none focus:border-gold-500/50"
              />
            </label>
          </div>

          <label className="block">
            <span className="text-xs font-medium text-ink-400 mb-1.5 block">Bio</span>
            <textarea
              value={form.bio}
              onChange={(e) => setForm({ ...form, bio: e.target.value })}
              rows={3}
              className="w-full bg-ink-950 border border-ink-800 rounded-xl px-4 py-2.5 text-sm text-ink-100 focus:outline-none focus:border-gold-500/50 resize-none"
            />
          </label>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
              className="rounded accent-gold-500"
            />
            <span className="text-sm text-ink-300">Active (visible to public)</span>
          </label>

          <Button type="submit" isLoading={isCreating || isUpdating} className="w-full">
            {editingId ? 'Save Changes' : 'Add Contestant'}
          </Button>
        </form>
      </Modal>

      <Modal isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Delete Contestant">
        <p className="text-ink-300 text-sm mb-6">
          Are you sure you want to delete <strong className="text-ink-50">{deleteTarget?.name}</strong>? This cannot be undone.
        </p>
        <div className="flex gap-3">
          <Button variant="danger" onClick={handleDelete} className="flex-1">Delete</Button>
          <Button variant="secondary" onClick={() => setDeleteTarget(null)} className="flex-1">Cancel</Button>
        </div>
      </Modal>
    </div>
  );
}
