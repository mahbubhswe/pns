import React, { useRef, useState } from "react";
import { Button, CircularProgress, Tooltip } from "@mui/material";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import { apiPostForm, errorMessage } from "@/lib/api";
import type { UploadResponse } from "@/types/api";

type Props = {
  /** Called with the public URL of the uploaded image. */
  onUploaded: (url: string) => void;
  onError?: (message: string) => void;
};

/** Uploads an image through the dashboard upload endpoint and returns its URL. */
export default function ImageUploadButton({ onUploaded, onError }: Props) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [busy, setBusy] = useState(false);

  async function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    try {
      const fd = new FormData();
      fd.append("file", file, file.name);
      const res = await apiPostForm<UploadResponse>("/api/admin/upload", fd);
      onUploaded(res.url);
    } catch (err) {
      onError?.(errorMessage(err, "Upload failed"));
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <>
      <input ref={inputRef} type="file" accept="image/*" hidden onChange={onPick} />
      <Tooltip title="Upload an image">
        <span>
          <Button
            size="small"
            variant="outlined"
            disabled={busy}
            onClick={() => inputRef.current?.click()}
            startIcon={busy ? <CircularProgress size={14} /> : <UploadFileIcon fontSize="small" />}
            sx={{ whiteSpace: "nowrap", mt: 0.25 }}
          >
            Upload
          </Button>
        </span>
      </Tooltip>
    </>
  );
}
