import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ImagePlus, X } from "lucide-react";
import {
  useGetSettingsQuery,
  useUpdateSettingsMutation,
  useDeleteHeroImageMutation,
} from "../../features/settings/settingsApi";
import { PageLoader } from "../../components/ui/Loaders";
import { ErrorState } from "../../components/ui/States";
import { getErrorMessage } from "../../lib/getErrorMessage";
import Button from "../../components/ui/Button";

// Converts an ISO date to the value expected by <input type="datetime-local">
const toLocalInputValue = (isoDate) => {
  if (!isoDate) return "";
  const d = new Date(isoDate);
  const offset = d.getTimezoneOffset();
  const local = new Date(d.getTime() - offset * 60000);
  return local.toISOString().slice(0, 16);
};

export default function SettingsPage() {
  const { data, isLoading, isError, error, refetch } = useGetSettingsQuery();
  const [updateSettings, { isLoading: isSaving }] = useUpdateSettingsMutation();
  const [deleteHeroImage, { isLoading: isDeletingImage }] =
    useDeleteHeroImageMutation();

  const [form, setForm] = useState(null);
  const [newHeroFiles, setNewHeroFiles] = useState([]);
  const [newPreviews, setNewPreviews] = useState([]);

  const existingHeroImages = data?.data?.settings?.heroImages || [];

  useEffect(() => {
    if (data?.data?.settings) {
      const s = data.data.settings;
      setForm({
        eventName: s.eventName,
        eventTagline: s.eventTagline,
        votingStartTime: toLocalInputValue(s.votingStartTime),
        votingEndTime: toLocalInputValue(s.votingEndTime),
        votePrice: s.votePrice,
        platformSharePercent: s.platformSharePercent,
      });
    }
  }, [data]);

  const handleFiles = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const remainingSlots = 6 - existingHeroImages.length - newHeroFiles.length;
    if (remainingSlots <= 0) {
      toast.error("You can have a maximum of 6 hero images. Remove one first.");
      return;
    }

    const accepted = files.slice(0, remainingSlots);
    setNewHeroFiles((prev) => [...prev, ...accepted]);
    setNewPreviews((prev) => [
      ...prev,
      ...accepted.map((f) => URL.createObjectURL(f)),
    ]);
    e.target.value = "";
  };

  const removeNewFile = (index) => {
    setNewHeroFiles((prev) => prev.filter((_, i) => i !== index));
    setNewPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleDeleteExisting = async (publicId) => {
    try {
      await deleteHeroImage(publicId).unwrap();
      toast.success("Hero image removed.");
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (new Date(form.votingStartTime) >= new Date(form.votingEndTime)) {
      toast.error("Voting start time must be before the end time.");
      return;
    }

    const formData = new FormData();
    Object.entries(form).forEach(([key, value]) => {
      const isoValue = key.includes("Time")
        ? new Date(value).toISOString()
        : value;
      formData.append(key, isoValue);
    });
    newHeroFiles.forEach((file) => formData.append("heroImages", file));

    try {
      await updateSettings(formData).unwrap();
      toast.success("Event settings updated successfully.");
      setNewHeroFiles([]);
      setNewPreviews([]);
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  if (isLoading || !form) return <PageLoader label="Loading settings..." />;
  if (isError)
    return <ErrorState message={getErrorMessage(error)} onRetry={refetch} />;

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Event Settings</h1>
        <p className="text-ink-400 text-sm mt-1">
          Controls the whole platform — voting window, pricing and split
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="glass-panel rounded-2xl p-6 space-y-5"
      >
        <div>
          <span className="text-xs font-medium text-ink-400 mb-2 block">
            Homepage Hero Images (
            {existingHeroImages.length + newHeroFiles.length}/6)
          </span>

          <div className="flex flex-wrap gap-3 mb-3">
            {existingHeroImages.map((img) => (
              <div
                key={img.publicId}
                className="relative w-24 h-16 rounded-xl overflow-hidden border border-ink-800 group"
              >
                <img
                  src={img.url}
                  alt=""
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => handleDeleteExisting(img.publicId)}
                  disabled={isDeletingImage}
                  className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity disabled:opacity-50"
                  aria-label="Remove hero image"
                >
                  <X className="w-4 h-4 text-white" />
                </button>
              </div>
            ))}

            {newPreviews.map((preview, i) => (
              <div
                key={preview}
                className="relative w-24 h-16 rounded-xl overflow-hidden border border-gold-500/40 group"
              >
                <img
                  src={preview}
                  alt=""
                  className="w-full h-full object-cover"
                />
                <span className="absolute top-1 left-1 text-[9px] bg-gold-500 text-ink-950 px-1.5 py-0.5 rounded font-semibold">
                  NEW
                </span>
                <button
                  type="button"
                  onClick={() => removeNewFile(i)}
                  className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                  aria-label="Cancel new image"
                >
                  <X className="w-4 h-4 text-white" />
                </button>
              </div>
            ))}

            {existingHeroImages.length + newHeroFiles.length < 6 && (
              <label className="w-24 h-16 rounded-xl border-2 border-dashed border-ink-700 hover:border-gold-500/40 flex items-center justify-center cursor-pointer transition-colors shrink-0">
                <ImagePlus className="w-5 h-5 text-ink-600" />
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFiles}
                  className="hidden"
                />
              </label>
            )}
          </div>
          <p className="text-[11px] text-ink-500">
            These rotate as a slider on the homepage hero. Leave empty to use
            the default gold/black background.
          </p>
        </div>

        <label className="block">
          <span className="text-xs font-medium text-ink-400 mb-1.5 block">
            Event Name
          </span>
          <input
            type="text"
            value={form.eventName}
            onChange={(e) => setForm({ ...form, eventName: e.target.value })}
            className="w-full bg-ink-950 border border-ink-800 rounded-xl text-base px-4 py-2.5 text-ink-100 focus:outline-none focus:border-gold-500/50"
          />
        </label>

        <label className="block">
          <span className="text-xs font-medium text-ink-400 mb-1.5 block">
            Tagline
          </span>
          <input
            type="text"
            value={form.eventTagline}
            onChange={(e) => setForm({ ...form, eventTagline: e.target.value })}
            className="w-full bg-ink-950 border border-ink-800 rounded-xl px-4 py-2.5 text-base text-ink-100 focus:outline-none focus:border-gold-500/50"
          />
        </label>

        <div className="grid sm:grid-cols-2 gap-4">
          <label className="block">
            <span className="text-xs font-medium text-ink-400 mb-1.5 block">
              Voting Starts
            </span>
            <input
              type="datetime-local"
              value={form.votingStartTime}
              onChange={(e) =>
                setForm({ ...form, votingStartTime: e.target.value })
              }
              className="w-full bg-ink-950 border border-ink-800 rounded-xl px-4 py-2.5 text-base text-ink-100 focus:outline-none focus:border-gold-500/50"
            />
          </label>
          <label className="block">
            <span className="text-xs font-medium text-ink-400 mb-1.5 block">
              Voting Ends
            </span>
            <input
              type="datetime-local"
              value={form.votingEndTime}
              onChange={(e) =>
                setForm({ ...form, votingEndTime: e.target.value })
              }
              className="w-full bg-ink-950 border border-ink-800 rounded-xl px-4 py-2.5 text-base text-ink-100 focus:outline-none focus:border-gold-500/50"
            />
          </label>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <label className="block">
            <span className="text-xs font-medium text-ink-400 mb-1.5 block">
              Price Per Vote (₦)
            </span>
            <input
              type="number"
              min={1}
              value={form.votePrice}
              onChange={(e) =>
                setForm({ ...form, votePrice: Number(e.target.value) })
              }
              className="w-full bg-ink-950 border border-ink-800 rounded-xl px-4 py-2.5 text-sm text-ink-100 focus:outline-none focus:border-gold-500/50"
            />
          </label>
          <label className="block">
            <span className="text-xs font-medium text-ink-400 mb-1.5 block">
              Platform Share (%)
            </span>
            <input
              type="number"
              min={0}
              max={100}
              value={form.platformSharePercent}
              onChange={(e) =>
                setForm({
                  ...form,
                  platformSharePercent: Number(e.target.value),
                })
              }
              className="w-full bg-ink-950 border border-ink-800 rounded-xl px-4 py-2.5 text-sm text-ink-100 focus:outline-none focus:border-gold-500/50"
            />
          </label>
        </div>

        <Button type="submit" isLoading={isSaving} className="w-full">
          Save Settings
        </Button>
      </form>
    </div>
  );
}
