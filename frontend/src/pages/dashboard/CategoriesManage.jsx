import { useState } from 'react';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, ImagePlus } from 'lucide-react';
import {
  useGetCategoriesQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
} from '../../features/categories/categoriesApi';
import { PageLoader } from '../../components/ui/Loaders';
import { EmptyState, ErrorState } from '../../components/ui/States';
import { getErrorMessage } from '../../lib/getErrorMessage';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';

const emptyForm = { name: '', description: '', displayOrder: 0, isActive: true, coverImage: null };

export default function CategoriesManage() {
  const { data, isLoading, isError, error, refetch } = useGetCategoriesQuery({ all: 'true' });
  const [createCategory, { isLoading: isCreating }] = useCreateCategoryMutation();
  const [updateCategory, { isLoading: isUpdating }] = useUpdateCategoryMutation();
  const [deleteCategory] = useDeleteCategoryMutation();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [preview, setPreview] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const categories = data?.data?.categories || [];

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setPreview(null);
    setModalOpen(true);
  };

  const openEdit = (cat) => {
    setEditingId(cat._id);
    setForm({ name: cat.name, description: cat.description || '', displayOrder: cat.displayOrder || 0, isActive: cat.isActive, coverImage: null });
    setPreview(cat.coverImage?.url || null);
    setModalOpen(true);
  };

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setForm((f) => ({ ...f, coverImage: file }));
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error('Category name is required.');
      return;
    }

    const formData = new FormData();
    formData.append('name', form.name);
    formData.append('description', form.description);
    formData.append('displayOrder', form.displayOrder);
    formData.append('isActive', form.isActive);
    if (form.coverImage) formData.append('coverImage', form.coverImage);

    try {
      if (editingId) {
        await updateCategory({ id: editingId, formData }).unwrap();
        toast.success('Category updated successfully.');
      } else {
        await createCategory(formData).unwrap();
        toast.success('Category created successfully.');
      }
      setModalOpen(false);
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteCategory(deleteTarget._id).unwrap();
      toast.success('Category deleted successfully.');
      setDeleteTarget(null);
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  if (isLoading) return <PageLoader label="Loading categories..." />;
  if (isError) return <ErrorState message={getErrorMessage(error)} onRetry={refetch} />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Categories</h1>
          <p className="text-ink-400 text-sm mt-1">Manage award categories</p>
        </div>
        <Button icon={Plus} onClick={openCreate}>Add Category</Button>
      </div>

      {categories.length === 0 ? (
        <EmptyState title="No categories yet" message="Create your first category to get started." />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((cat) => (
            <div key={cat._id} className="glass-panel rounded-2xl overflow-hidden">
              <div className="aspect-[16/9] bg-ink-800 relative">
                {cat.coverImage?.url && (
                  <img src={cat.coverImage.url} alt={cat.name} className="w-full h-full object-cover" />
                )}
                {!cat.isActive && (
                  <span className="absolute top-2 right-2 bg-ink-950/80 text-ink-400 text-xs px-2 py-1 rounded-full">
                    Inactive
                  </span>
                )}
              </div>
              <div className="p-4">
                <p className="font-semibold text-ink-50 truncate">{cat.name}</p>
                <p className="text-xs text-ink-500 mb-3">{cat.contestantCount || 0} contestants</p>
                <div className="flex gap-2">
                  <Button variant="secondary" size="sm" icon={Pencil} onClick={() => openEdit(cat)}>Edit</Button>
                  <Button variant="danger" size="sm" icon={Trash2} onClick={() => setDeleteTarget(cat)}>Delete</Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editingId ? 'Edit Category' : 'Add Category'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block">
            <span className="text-xs font-medium text-ink-400 mb-1.5 block">Category Name</span>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full bg-ink-950 border border-ink-800 rounded-xl px-4 py-2.5 text-sm text-ink-100 focus:outline-none focus:border-gold-500/50"
              placeholder="e.g. Male Model of the Year"
            />
          </label>

          <label className="block">
            <span className="text-xs font-medium text-ink-400 mb-1.5 block">Description</span>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={3}
              className="w-full bg-ink-950 border border-ink-800 rounded-xl px-4 py-2.5 text-sm text-ink-100 focus:outline-none focus:border-gold-500/50 resize-none"
            />
          </label>

          <label className="block">
            <span className="text-xs font-medium text-ink-400 mb-1.5 block">Cover Image</span>
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-xl bg-ink-950 border border-ink-800 overflow-hidden flex items-center justify-center shrink-0">
                {preview ? (
                  <img src={preview} alt="" className="w-full h-full object-cover" />
                ) : (
                  <ImagePlus className="w-6 h-6 text-ink-600" />
                )}
              </div>
              <input type="file" accept="image/*" onChange={handleFile} className="text-xs text-ink-400" />
            </div>
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
            {editingId ? 'Save Changes' : 'Create Category'}
          </Button>
        </form>
      </Modal>

      <Modal isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Delete Category">
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
