"use client";

import React from "react";
import { Box, Button, IconButton, Paper, Stack, TextField, Tooltip, Typography } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";

export type ListField<T> = {
  key: keyof T & string;
  label: string;
  multiline?: boolean;
  /** Render something next to the field (e.g. an upload button). */
  adornment?: (item: T, set: (value: string) => void) => React.ReactNode;
};

type Props<T extends Record<string, string>> = {
  title: string;
  items: T[];
  fields: ListField<T>[];
  empty: T;
  onChange: (items: T[]) => void;
  addLabel?: string;
  max?: number;
  helper?: string;
};

/**
 * Generic editor for an ordered list of small records (slides, steps, FAQs).
 * Supports add, remove and reorder; every field is a text input.
 */
export default function ListEditor<T extends Record<string, string>>({
  title,
  items,
  fields,
  empty,
  onChange,
  addLabel = "Add item",
  max,
  helper,
}: Props<T>) {
  const update = (index: number, key: keyof T & string, value: string) =>
    onChange(items.map((item, i) => (i === index ? { ...item, [key]: value } : item)));

  const remove = (index: number) => onChange(items.filter((_, i) => i !== index));

  const move = (index: number, dir: -1 | 1) => {
    const target = index + dir;
    if (target < 0 || target >= items.length) return;
    const next = [...items];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  };

  const canAdd = max === undefined || items.length < max;

  return (
    <Box>
      <Stack direction="row" alignItems="center" sx={{ mb: 1 }}>
        <Typography variant="subtitle1" fontWeight={700} sx={{ flexGrow: 1 }}>
          {title}
        </Typography>
        <Button size="small" startIcon={<AddIcon />} disabled={!canAdd} onClick={() => onChange([...items, { ...empty }])}>
          {addLabel}
        </Button>
      </Stack>
      {helper && (
        <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 1 }}>
          {helper}
        </Typography>
      )}
      <Stack spacing={1.5}>
        {items.length === 0 && (
          <Typography variant="body2" color="text.secondary">
            No items yet.
          </Typography>
        )}
        {items.map((item, index) => (
          <Paper key={index} variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
            <Stack direction="row" spacing={1} alignItems="flex-start">
              <Stack spacing={1.5} sx={{ flexGrow: 1 }}>
                {fields.map(field => (
                  <Stack key={field.key} direction="row" spacing={1} alignItems="flex-start">
                    <TextField
                      label={field.label}
                      value={item[field.key] ?? ""}
                      onChange={e => update(index, field.key, e.target.value)}
                      multiline={field.multiline}
                      minRows={field.multiline ? 2 : undefined}
                      size="small"
                      fullWidth
                    />
                    {field.adornment?.(item, value => update(index, field.key, value))}
                  </Stack>
                ))}
              </Stack>
              <Stack>
                <Tooltip title="Move up">
                  <span>
                    <IconButton size="small" disabled={index === 0} onClick={() => move(index, -1)}>
                      <ArrowUpwardIcon fontSize="small" />
                    </IconButton>
                  </span>
                </Tooltip>
                <Tooltip title="Move down">
                  <span>
                    <IconButton size="small" disabled={index === items.length - 1} onClick={() => move(index, 1)}>
                      <ArrowDownwardIcon fontSize="small" />
                    </IconButton>
                  </span>
                </Tooltip>
                <Tooltip title="Remove">
                  <IconButton size="small" color="error" onClick={() => remove(index)}>
                    <DeleteOutlineIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Stack>
            </Stack>
          </Paper>
        ))}
      </Stack>
    </Box>
  );
}
