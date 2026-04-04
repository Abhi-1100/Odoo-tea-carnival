"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ArrowUpRight,
  Download,
  ImagePlus,
  Loader2,
  Palette,
  Save,
  Trash2,
  Upload,
} from "lucide-react";
import toast from "react-hot-toast";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import { Button } from "@/components/ui/Button";

type SelfOrderMode = "online_ordering" | "qr_menu";

interface SelfOrderSettings {
  isEnabled: boolean;
  mode: SelfOrderMode;
  payAtCounter: boolean;
  backgroundColor: string;
  backgroundImages: string[];
}

interface TableToken {
  tableId: number;
  tableName: string;
  token: string;
  url: string;
}

const DEFAULT_SETTINGS: SelfOrderSettings = {
  isEnabled: false,
  mode: "online_ordering",
  payAtCounter: true,
  backgroundColor: "#95416a",
  backgroundImages: [],
};

export default function SelfOrderingSettingsPage() {
  const { token } = useAuthStore();
  const [settings, setSettings] = useState<SelfOrderSettings>(DEFAULT_SETTINGS);
  const [tokens, setTokens] = useState<TableToken[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [removingImageUrl, setRemovingImageUrl] = useState<string | null>(null);
  const [themeColor, setThemeColor] = useState("#e84393");

  const previewToken = useMemo(() => tokens[0]?.token || "", [tokens]);

  const loadData = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const [settingsRes] = await Promise.all([
        api.selfOrder.getSettings(token),
        api.selfOrder.generateTokens(token),
      ]);

      setSettings(settingsRes.data);
      setThemeColor(settingsRes.data.backgroundColor || "#95416a");

      const tokensRes = await api.selfOrder.getTokens(token);
      setTokens(tokensRes.tokens);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to load self ordering settings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const saveSettings = async () => {
    if (!token) return;
    setSaving(true);
    try {
      const response = await api.selfOrder.saveSettings(
        {
          isEnabled: settings.isEnabled,
          mode: settings.mode,
          payAtCounter: true,
          backgroundColor: themeColor,
        },
        token,
      );
      setSettings(response.data);
      setThemeColor(response.data.backgroundColor || themeColor);
      toast.success("Self ordering settings updated");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const uploadImages = async (files: FileList | null) => {
    if (!token || !files?.length) return;

    setUploading(true);
    try {
      await api.selfOrder.uploadBackgroundImages(Array.from(files), token);
      const latest = await api.selfOrder.getSettings(token);
      setSettings(latest.data);
      toast.success("Background images uploaded");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to upload background image");
    } finally {
      setUploading(false);
    }
  };

  const downloadQrPdf = async () => {
    if (!token) return;

    setDownloading(true);
    try {
      const blob = await api.selfOrder.downloadQrPdf(token);
      const url = window.URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = "table-qr-codes.pdf";
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      window.URL.revokeObjectURL(url);
      toast.success("QR PDF download started");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to download QR PDF");
    } finally {
      setDownloading(false);
    }
  };

  const previewWebpage = async () => {
    if (!token) return;

    if (!settings.isEnabled) {
      toast.error("Enable Self Ordering first");
      return;
    }

    let tokenToPreview = previewToken;

    if (!tokenToPreview) {
      try {
        await api.selfOrder.generateTokens(token);
        const tokensRes = await api.selfOrder.getTokens(token);
        setTokens(tokensRes.tokens);
        tokenToPreview = tokensRes.tokens[0]?.token || "";
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Unable to prepare preview URL");
        return;
      }
    }

    if (!tokenToPreview) {
      toast.error("No active table token available for preview");
      return;
    }

    if (settings.mode === "qr_menu") {
      toast("📋 Opening QR Menu - view-only digital menu (no ordering)", { duration: 3000 });
    } else {
      toast("🛒 Opening Online Ordering mode", { duration: 2000 });
    }

    window.open(`/self-order/${tokenToPreview}`, "_blank", "noopener,noreferrer");
  };

  const selectMode = (mode: SelfOrderMode) => {
    setSettings((prev) => ({ ...prev, mode }));
  };

  const removeImage = async (imageUrl: string) => {
    if (!token) return;

    setRemovingImageUrl(imageUrl);
    try {
      const response = await api.selfOrder.removeBackgroundImage(imageUrl, token);
      setSettings((prev) => ({ ...prev, backgroundImages: response.data.backgroundImages }));
      toast.success("Image removed");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to remove image");
    } finally {
      setRemovingImageUrl(null);
    }
  };

  const backgroundSlots = Math.max(3, settings.backgroundImages.length);

  return (
    <div className="p-8 space-y-6">
      {loading ? (
        <div className="card p-8 flex items-center justify-center text-brand-muted gap-3">
          <Loader2 size={18} className="animate-spin" />
          Loading self-ordering settings...
        </div>
      ) : (
        <>
          {settings.isEnabled && settings.mode === "qr_menu" && (
            <div className="text-orange-300 text-3xl">QR Menu: It's only digital menu not able to order</div>
          )}

          <div className="text-orange-300 font-medium tracking-wide">Setting</div>

          <section className="card border border-brand-border/80 rounded-none overflow-hidden">
            <div className="px-4 py-2 bg-brand-bg/70 border-b border-brand-border/80 text-white font-semibold">
              Mobile Order
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-6">
              <div className="space-y-4">
                <label className="flex items-center gap-3 text-white">
                  <input
                    type="checkbox"
                    checked={settings.isEnabled}
                    onChange={() => setSettings((prev) => ({ ...prev, isEnabled: !prev.isEnabled }))}
                    className="accent-brand-primary"
                  />
                  Self Ordering
                </label>

                {settings.isEnabled && (
                  <>
                    <div className="max-w-xs space-y-2">
                      <div className="text-brand-muted text-xs">Mode</div>
                      <select
                        value={settings.mode}
                        onChange={(event) => selectMode(event.target.value as SelfOrderMode)}
                        className="input-dark rounded-none h-10"
                      >
                        <option value="online_ordering">Online ordering</option>
                        <option value="qr_menu">QR Menu</option>
                      </select>
                    </div>

                    {settings.mode === "online_ordering" && (
                      <>
                        <div className="space-y-2 pt-1">
                          <button
                            type="button"
                            onClick={previewWebpage}
                            className="block text-sky-300 hover:text-sky-200 text-sm"
                          >
                            Preview webpage --&gt;
                          </button>
                          <button
                            type="button"
                            onClick={downloadQrPdf}
                            className="block text-sky-300 hover:text-sky-200 text-sm"
                          >
                            Download QR code --&gt;
                          </button>
                        </div>

                        <div className="max-w-xs border border-brand-primary/40 px-3 py-2 text-sm">
                          <div className="text-white mb-1">Payment Method</div>
                          <label className="flex items-center gap-2 text-sky-200">
                            <input type="checkbox" checked disabled className="accent-brand-primary cursor-not-allowed" />
                            Pay at counter
                          </label>
                        </div>

                        <div className="text-xs text-brand-muted max-w-sm">
                          As we have only option enable it by default and read only
                        </div>

                        <div className="text-sm text-brand-muted max-w-md pt-1">
                          Create a webpage use database URL with append token post URL
                          <div className="text-sky-300 mt-1">e.g {tokens[0]?.url || "abcd.com/s/asdfghhjkl"}</div>
                          <div className="grid grid-cols-3 gap-2 mt-2 text-xs">
                            <div>
                              <div className="text-green-400">Domain</div>
                            </div>
                            <div>
                              <div className="text-green-400">Self</div>
                            </div>
                            <div>
                              <div className="text-green-400">Unique token</div>
                            </div>
                          </div>
                        </div>
                      </>
                    )}

                    {settings.mode === "qr_menu" && (
                      <>
                        <div className="space-y-2 pt-1">
                          <button
                            type="button"
                            onClick={previewWebpage}
                            className="block text-sky-300 hover:text-sky-200 text-sm"
                          >
                            Preview webpage --&gt;
                          </button>
                          <button
                            type="button"
                            onClick={downloadQrPdf}
                            className="block text-sky-300 hover:text-sky-200 text-sm"
                          >
                            Download QR code --&gt;
                          </button>
                        </div>

                        <div className="text-xs text-brand-muted">
                          QR menu mode selected. Customer can view digital menu only.
                        </div>
                      </>
                    )}
                  </>
                )}
              </div>

              <div className="space-y-3">
                <div className="text-white font-medium">Background</div>

                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 text-brand-muted text-sm">
                    <Palette size={16} />
                    <span>Open colorpicker</span>
                  </div>

                  <input
                    type="color"
                    value={themeColor}
                    onChange={(event) => setThemeColor(event.target.value)}
                    className="h-8 w-9 rounded-full border border-brand-border bg-transparent"
                  />

                  <input
                    value={themeColor}
                    onChange={(event) => setThemeColor(event.target.value)}
                    className="input-dark h-8 text-xs w-24"
                  />
                </div>

                <label className="inline-flex items-center gap-2 text-xs text-brand-primary cursor-pointer border border-brand-primary/30 px-3 py-1.5 hover:bg-brand-primary/10 transition-colors">
                  {uploading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
                  Image upload / Multiple image
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={(event) => uploadImages(event.target.files)}
                    disabled={uploading}
                  />
                </label>

                <div className="space-y-2">
                  {Array.from({ length: backgroundSlots }, (_, index) => {
                    const image = settings.backgroundImages[index];

                    return (
                      <div key={`bg-slot-${index}`} className="border border-amber-500/70 px-2 py-1 flex items-center gap-2 max-w-[220px]">
                        {image ? (
                          <img src={image} alt={`Background ${index + 1}`} className="h-5 w-5 object-cover" />
                        ) : (
                          <ImagePlus size={14} className="text-brand-muted" />
                        )}
                        <p className="text-xs text-pink-300">Image {index + 1}</p>
                        {image && (
                          <button
                            type="button"
                            onClick={() => removeImage(image)}
                            className="ml-auto text-red-300 hover:text-red-200"
                            disabled={removingImageUrl === image}
                            title="Cancel image"
                          >
                            {removingImageUrl === image ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />}
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </section>

          <div className="flex flex-wrap gap-3">
            <Button icon={<Save size={16} />} loading={saving} onClick={saveSettings}>
              Save Settings
            </Button>

            {settings.isEnabled && settings.mode === "online_ordering" && (
              <Button variant="outline" icon={<Download size={16} />} onClick={downloadQrPdf} loading={downloading}>
                Download QR code --&gt;
              </Button>
            )}
          </div>


        </>
      )}
    </div>
  );
}
