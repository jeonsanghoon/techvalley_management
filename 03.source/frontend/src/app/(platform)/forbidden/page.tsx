"use client";

import Link from "next/link";
import { Box, Button, Paper, Stack, Typography } from "@mui/material";
import LockIcon from "@mui/icons-material/Lock";
import { useAuth } from "@/contexts/AuthContext";
import { useLocale } from "@/contexts/LocaleContext";
import type { TranslationKey } from "@/lib/locale";
import { localizeAppRole } from "@/lib/locale/domain-labels";

export default function ForbiddenPage() {
  const { user } = useAuth();
  const { translate, language } = useLocale();
  const roleLabel = user ? localizeAppRole(user.appRole, language) : "—";

  return (
    <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
      <Paper variant="outlined" sx={{ p: 4, maxWidth: 420, textAlign: "center", borderRadius: 2 }}>
        <LockIcon sx={{ fontSize: 40, color: "warning.main", mb: 2 }} />
        <Typography variant="h2" color="text.primary" sx={{ mb: 1 }}>
          {translate("forbidden.title" as TranslationKey)}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {translate("forbidden.body" as TranslationKey).replace("{role}", roleLabel)}
        </Typography>
        <Stack direction="row" spacing={1} sx={{ justifyContent: "center" }}>
          <Button component={Link} href="/dashboard" variant="contained">
            {translate("forbidden.toDashboard" as TranslationKey)}
          </Button>
          <Button component={Link} href="/admin/menus" variant="outlined">
            {translate("forbidden.permissionMatrix" as TranslationKey)}
          </Button>
        </Stack>
      </Paper>
    </Box>
  );
}
