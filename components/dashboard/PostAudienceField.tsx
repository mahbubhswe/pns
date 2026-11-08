"use client";

import { FormControl, FormControlLabel, FormLabel, Radio, RadioGroup, Typography } from "@mui/material";
import { POST_AUDIENCES, POST_AUDIENCE_LABELS, type PostAudience } from "@/lib/shared/posts";

/** "Who can read this post" picker for the post editor. */
export default function PostAudienceField({ value, onChange }: { value: PostAudience; onChange: (v: PostAudience) => void }) {
  return (
    <FormControl>
      <FormLabel sx={{ fontWeight: 700, mb: 0.5 }}>Who can read this post?</FormLabel>
      <RadioGroup value={value} onChange={e => onChange(e.target.value as PostAudience)}>
        {POST_AUDIENCES.map(a => (
          <FormControlLabel
            key={a}
            value={a}
            control={<Radio size="small" />}
            label={
              <Typography variant="body2">
                <b>{POST_AUDIENCE_LABELS[a].label}</b> — {POST_AUDIENCE_LABELS[a].hint}
              </Typography>
            }
          />
        ))}
      </RadioGroup>
    </FormControl>
  );
}
