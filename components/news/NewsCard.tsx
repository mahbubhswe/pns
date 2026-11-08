"use client";

import Link from "next/link";
import Image from "next/image";
import dayjs from "dayjs";
import { Box, Card, CardActionArea, Chip, Stack, Typography } from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import CampaignRounded from "@mui/icons-material/CampaignRounded";
import LockRounded from "@mui/icons-material/LockRounded";
import type { PublicPostDto } from "@/types/api";

/** One post as a card: landing-page news section, /news and the member profile. */
export default function NewsCard({ post }: { post: PublicPostDto }) {
  const theme = useTheme();
  const dark = theme.palette.mode === "dark";
  return (
    <Card
      sx={{
        height: "100%",
        transition: "transform .25s ease, box-shadow .25s ease, border-color .25s ease",
        "&:hover": { transform: "translateY(-4px)", borderColor: alpha(theme.palette.primary.main, 0.4), boxShadow: dark ? "none" : "0 24px 40px -24px rgba(18,36,29,.35)" },
      }}
    >
      <CardActionArea component={Link} href={`/news/${post.id}`} sx={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "stretch" }}>
        <Box sx={{ position: "relative", height: 170, bgcolor: alpha(theme.palette.primary.main, 0.1), display: "grid", placeItems: "center", color: "primary.main" }}>
          {post.coverUrl ? (
            <Image src={post.coverUrl} alt="" fill sizes="(max-width: 600px) 100vw, 400px" style={{ objectFit: "cover" }} unoptimized />
          ) : (
            <CampaignRounded sx={{ fontSize: 48, opacity: 0.6 }} />
          )}
        </Box>
        <Box sx={{ p: 2.5, flex: 1 }}>
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
              {dayjs(post.created).format("D MMM YYYY")}
            </Typography>
            {post.membersOnly && <Chip size="small" icon={<LockRounded sx={{ fontSize: 14 }} />} label="Members only" color="secondary" variant="outlined" sx={{ height: 22 }} />}
          </Stack>
          <Typography sx={{ fontWeight: 800, fontSize: 18, lineHeight: 1.3, mb: 0.75 }}>{post.title}</Typography>
          <Typography color="text.secondary" sx={{ lineHeight: 1.6, fontSize: 14.5 }}>
            {post.excerpt}
          </Typography>
        </Box>
      </CardActionArea>
    </Card>
  );
}
