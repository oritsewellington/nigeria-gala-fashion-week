import { useState } from "react";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, ImagePlus } from "lucide-react";
import {
  useGetSponsorsQuery,
  useCreateSponsorMutation,
  useUpdateSponsorMutation,
  useDeleteSponsorMutation,
} from "../../features/sponsors/sponsorsApi";
import { PageLoader } from "../../components/ui/Loaders";
import { EmptyState, ErrorState } from "../../components/ui/States";
import { getErrorMessage } from "../../lib/getErrorMessage";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";

const emptyForm = {
  name: "",
  websiteUrl: "",
  displayOrder: 0,
  isActive: true,
  logo: null,
};

export default function SponsorsManage() {
  const { data, isLoading, isError, error, refetch } = useGetSponsorsQuery({
    all: "true",
  });
  const [createSponsor, { isLoading: isCreating }] = useCreateSponsorMutation();
  const [updateSponsor, { isLoading: isUpdating }] = useUpdateSponsorMutation();
  const [deleteSponsor] = useDeleteSponsorMutation();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [preview, setPreview] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const sponsors = data?.data?.sponsors || [];

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setPreview(null);
    setModalOpen(true);
  };

  const openEdit = (sponsor) => {
    setEditingId(sponsor._id);
    setForm({
      name: sponsor.name,
      websiteUrl: sponsor.websiteUrl || "",
      displayOrder: sponsor.displayOrder || 0,
      isActive: sponsor.isActive,
      logo: null,
    });
    setPreview(sponsor.logo?.url || null);
    setModalOpen(true);
  };

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setForm((f) => ({ ...f, logo: file }));
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error("Sponsor name is required.");
      return;
    }
    if (!editingId && !form.logo) {
      toast.error("A sponsor logo is required.");
      return;
    }

    const formData = new FormData();
    formData.append("name", form.name);
    formData.append("websiteUrl", form.websiteUrl);
    formData.append("displayOrder", form.displayOrder);
    formData.append("isActive", form.isActive);
    if (form.logo) formData.append("logo", form.logo);

    try {
      if (editingId) {
        await updateSponsor({ id: editingId, formData }).unwrap();
        toast.success("Sponsor updated successfully.");
      } else {
        await createSponsor(formData).unwrap();
        toast.success("Sponsor added successfully.");
      }
      setModalOpen(false);
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteSponsor(deleteTarget._id).unwrap();
      toast.success("Sponsor deleted successfully.");
      setDeleteTarget(null);
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  if (isLoading) return <PageLoader label="Loading sponsors..." />;
  if (isError)
    return <ErrorState message={getErrorMessage(error)} onRetry={refetch} />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Sponsors &amp; Partners</h1>
          <p className="text-ink-400 text-sm mt-1">
            Shown as a logo strip near the bottom of the homepage
          </p>
        </div>
        <Button icon={Plus} onClick={openCreate}>
          Add Sponsor
        </Button>
      </div>

      {sponsors.length === 0 ? (
        <EmptyState
          title="No sponsors yet"
          message="Add your first sponsor logo — it will appear on the public homepage automatically."
        />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {sponsors.map((sponsor) => (
            <div
              key={sponsor._id}
              className="glass-panel rounded-2xl overflow-hidden"
            >
              <div className="aspect-[16/9] bg-ink-950 relative flex items-center justify-center p-4">
                {sponsor.logo?.url && (
                  <img
                    src={sponsor.logo.url}
                    alt={sponsor.name}
                    className="max-w-full max-h-full object-contain"
                  />
                )}
                {!sponsor.isActive && (
                  <span className="absolute top-2 right-2 bg-ink-950/80 text-ink-400 text-xs px-2 py-1 rounded-full">
                    Inactive
                  </span>
                )}
              </div>
              <div className="p-4">
                <p className="font-semibold text-ink-50 truncate">
                  {sponsor.name}
                </p>
                {sponsor.websiteUrl && (
                  <p className="text-xs text-ink-500 truncate mb-3">
                    {sponsor.websiteUrl}
                  </p>
                )}
                <div className="flex gap-2 mt-3">
                  <Button
                    variant="secondary"
                    size="sm"
                    icon={Pencil}
                    onClick={() => openEdit(sponsor)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    icon={Trash2}
                    onClick={() => setDeleteTarget(sponsor)}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? "Edit Sponsor" : "Add Sponsor"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block">
            <span className="text-xs font-medium text-ink-400 mb-1.5 block">
              Sponsor Name
            </span>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full bg-ink-950 border border-ink-800 rounded-xl px-4 py-2.5 text-base text-ink-100 focus:outline-none focus:border-gold-500/50"
              placeholder="e.g. J Empire"
            />
          </label>

          <label className="block">
            <span className="text-xs font-medium text-ink-400 mb-1.5 block">
              Website URL (optional)
            </span>
            <input
              type="url"
              value={form.websiteUrl}
              onChange={(e) => setForm({ ...form, websiteUrl: e.target.value })}
              className="w-full bg-ink-950 border border-ink-800 rounded-xl px-4 py-2.5 text-base text-ink-100 focus:outline-none focus:border-gold-500/50"
              placeholder="https://..."
            />
          </label>

          <label className="block">
            <span className="text-xs font-medium text-ink-400 mb-1.5 block">
              Logo
            </span>
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-xl bg-ink-950 border border-ink-800 overflow-hidden flex items-center justify-center shrink-0 p-2">
                {preview ? (
                  <img
                    src={preview}
                    alt=""
                    className="max-w-full max-h-full object-contain"
                  />
                ) : (
                  <ImagePlus className="w-6 h-6 text-ink-600" />
                )}
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={handleFile}
                className="text-xs text-ink-400"
              />
            </div>
            <p className="text-[11px] text-ink-500 mt-1.5">
              A transparent PNG or SVG logo works best.
            </p>
          </label>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
              className="rounded accent-gold-500"
            />
            <span className="text-sm text-ink-300">
              Active (visible to public)
            </span>
          </label>

          <Button
            type="submit"
            isLoading={isCreating || isUpdating}
            className="w-full"
          >
            {editingId ? "Save Changes" : "Add Sponsor"}
          </Button>
        </form>
      </Modal>

      <Modal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Delete Sponsor"
      >
        <p className="text-ink-300 text-sm mb-6">
          Are you sure you want to remove{" "}
          <strong className="text-ink-50">{deleteTarget?.name}</strong>? This
          cannot be undone.
        </p>
        <div className="flex gap-3">
          <Button variant="danger" onClick={handleDelete} className="flex-1">
            Delete
          </Button>
          <Button
            variant="secondary"
            onClick={() => setDeleteTarget(null)}
            className="flex-1"
          >
            Cancel
          </Button>
        </div>
      </Modal>
    </div>
  );
}
