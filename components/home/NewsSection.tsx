"use client";

// Home page: the latest public posts (loaded section by section, see Deferred).
import React from "react";
import Link from "next/link";
import { Box, Button, Container } from "@mui/material";
import { motion } from "framer-motion";
import ArrowForwardRounded from "@mui/icons-material/ArrowForwardRounded";
import NewsCard from "@/components/news/NewsCard";
import { SectionTitle, reveal } from "@/components/home/parts";
import type { PublicPostDto } from "@/types/api";

export default function NewsSection({ title, news }: { title: string; news: PublicPostDto[] }) {
  return (
    <Box id="news" sx={{ py: { xs: 8, md: 12 }, scrollMarginTop: 80 }}>
      <Container maxWidth="lg">
        <motion.div {...reveal}>
          <SectionTitle center title={title} />
        </motion.div>
        <Box sx={{ display: "grid", gap: 2.5, gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", md: "repeat(3, 1fr)" } }}>
          {news.map((post, i) => (
            <motion.div key={post.id} {...reveal} transition={{ ...reveal.transition, delay: i * 0.06 }}>
              <NewsCard post={post} />
            </motion.div>
          ))}
        </Box>
        <Box sx={{ textAlign: "center", mt: 4 }}>
          <Button component={Link} href="/news" variant="outlined" endIcon={<ArrowForwardRounded />}>
            All news
          </Button>
        </Box>
      </Container>
    </Box>
  );
}
