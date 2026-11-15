"use client";

import { FormControl, FormControlLabel, FormLabel, Radio, RadioGroup, Typography } from "@mui/material";
import { POST_AUDIENCES, POST_AUDIENCE_LABELS, type PostAudience } from "@/lib/shared/posts";

const DOCUMENT_HINTS: Record<PostAudience, string> = {
  PUBLIC: "Everyone, on the public Documents page.",
  MEMBERS: "Logged-in members only.",
  STAFF: "Dashboard users only. Never shown on the website.",
};

/** "Who can see this" picker for posts and society documents. */
export default function PostAudienceField({
  value,
  onChange,
  kind = "post",
}: {
  value: PostAudience;
  onChange: (v: PostAudience) => void;
  kind?: "post" | "document";
}) {
  return (
    <FormControl>
      <FormLabel sx={{ fontWeight: 700, mb: 0.5 }}>{kind === "document" ? "Who can see this document?" : "Who can read this post?"}</FormLabel>
      <RadioGroup value={value} onChange={e => onChange(e.target.value as PostAudience)}>
        {POST_AUDIENCES.map(a => (
          <FormControlLabel
            key={a}
            value={a}
            control={<Radio size="small" />}
            label={
              <Typography variant="body2">
                <b>{POST_AUDIENCE_LABELS[a].label}</b> — {kind === "document" ? DOCUMENT_HINTS[a] : POST_AUDIENCE_LABELS[a].hint}
              </Typography>
            }
          />
        ))}
      </RadioGroup>
    </FormControl>
  );
}
