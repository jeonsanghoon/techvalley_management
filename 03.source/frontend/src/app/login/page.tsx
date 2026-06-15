"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  FormControlLabel,
  Stack,
  Switch,
  TextField,
  Typography,
  alpha,
} from "@mui/material";
import LoginIcon from "@mui/icons-material/Login";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import { AuthLayout } from "@/components/devias/auth/AuthLayout";
import { DEMO_LOGIN_USER_ID, useAuth } from "@/contexts/AuthContext";
import { useLocale } from "@/contexts/LocaleContext";
import { userRoleToAppRole } from "@/lib/auth/role-map";
import type { TranslationKey } from "@/lib/locale";
import { localizeAppRole } from "@/lib/locale/domain-labels";
import { getListItems, useAuthUsers } from "@/lib/api/hooks";
import { neonBlue } from "@/theme/devias/colors";

const AUTO_LOGIN_KEY = "tv-auto-login";

function readAutoLoginPref(): boolean {
  if (typeof window === "undefined") return true;
  try {
    const stored = localStorage.getItem(AUTO_LOGIN_KEY);
    return stored !== "0";
  } catch {
    return true;
  }
}

export default function LoginPage() {
  const router = useRouter();
  const { login, logout, ready, user } = useAuth();
  const { translate, language } = useLocale();
  const { data: authUsersData, isLoading: usersLoading } = useAuthUsers();
  const authUsers = getListItems(authUsersData);
  const [userId, setUserId] = useState(DEMO_LOGIN_USER_ID);
  const [autoLogin, setAutoLogin] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [password, setPassword] = useState("demo-password");
  const [loginError, setLoginError] = useState<string | null>(null);

  const selected = authUsers.find((u) => u.id === userId) ?? authUsers[0];
  const roleLabel = useMemo(
    () => (selected ? localizeAppRole(userRoleToAppRole(selected.role), language) : ""),
    [selected, language],
  );

  useEffect(() => {
    setAutoLogin(readAutoLoginPref());
  }, []);

  /** 저장된 세션 + 자동 로그인 ON → 대시보드로 / OFF면 세션 제거 */
  useEffect(() => {
    if (!ready) return;
    const pref = readAutoLoginPref();
    if (user && !pref) {
      logout();
      return;
    }
    if (user && pref) {
      router.replace("/dashboard");
    }
  }, [ready, user, router, logout]);

  const persistAutoLogin = (enabled: boolean) => {
    setAutoLogin(enabled);
    try {
      localStorage.setItem(AUTO_LOGIN_KEY, enabled ? "1" : "0");
    } catch {
      /* ignore */
    }
  };

  const handleLogin = async () => {
    if (!selected) return;
    setSubmitting(true);
    setLoginError(null);
    try {
      localStorage.setItem(AUTO_LOGIN_KEY, autoLogin ? "1" : "0");
      await login(userId, { persist: autoLogin, password, email: selected?.email });
      router.replace("/dashboard");
    } catch {
      setLoginError(language === "en" ? "Login failed. Please try again." : "로그인에 실패했습니다. 다시 시도해 주세요.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!ready || usersLoading || (user && readAutoLoginPref())) {
    return (
      <AuthLayout>
        <Stack spacing={2} sx={{ py: 6, alignItems: "center" }}>
          <CircularProgress size={32} />
          <Typography variant="body2" color="text.secondary">
            {translate("login.checkingSession" as TranslationKey)}
          </Typography>
        </Stack>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <Card
        elevation={0}
        sx={{
          border: 1,
          borderColor: "divider",
          borderRadius: 3,
          overflow: "hidden",
          boxShadow: (theme) =>
            theme.palette.mode === "dark"
              ? "0 24px 48px rgba(0,0,0,0.45)"
              : "0 24px 48px rgba(99, 91, 255, 0.12)",
        }}
      >
        <Box
          sx={{
            px: 3,
            py: 2.5,
            background: (theme) =>
              theme.palette.mode === "dark"
                ? `linear-gradient(135deg, ${alpha(neonBlue[700], 0.35)} 0%, ${alpha("#090a0b", 0.9)} 100%)`
                : `linear-gradient(135deg, ${alpha(neonBlue[500], 0.12)} 0%, #ffffff 100%)`,
            borderBottom: 1,
            borderColor: "divider",
          }}
        >
          <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
            <Box
              sx={{
                width: 44,
                height: 44,
                borderRadius: 2,
                display: "grid",
                placeItems: "center",
                bgcolor: alpha(neonBlue[500], 0.14),
                color: "primary.main",
              }}
            >
              <LockOutlinedIcon />
            </Box>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
                {translate("login.title" as TranslationKey)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {translate("login.subtitle" as TranslationKey)}
              </Typography>
            </Box>
          </Stack>
        </Box>

        <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
          <Alert severity="info" sx={{ mb: 3, borderRadius: 2 }}>
            {translate("login.demoNotice" as TranslationKey)}
          </Alert>

          {loginError && (
            <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
              {loginError}
            </Alert>
          )}

          <Stack spacing={2.5}>
            <TextField
              label={translate("login.email" as TranslationKey)}
              value={selected?.email ?? ""}
              fullWidth
              slotProps={{ input: { readOnly: true } }}
            />
            <TextField
              label={translate("login.password" as TranslationKey)}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              fullWidth
              autoComplete="current-password"
            />

            <Box>
              <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 1 }}>
                {translate("login.demoAccounts" as TranslationKey)}
              </Typography>
              <Stack direction="row" sx={{ flexWrap: "wrap", gap: 1 }}>
                {authUsers.map((u) => {
                  const active = u.id === userId;
                  return (
                    <Chip
                      key={u.id}
                      label={`${u.name} · ${localizeAppRole(userRoleToAppRole(u.role), language)}`}
                      onClick={() => setUserId(u.id)}
                      color={active ? "primary" : "default"}
                      variant={active ? "filled" : "outlined"}
                      sx={{ fontWeight: active ? 700 : 500 }}
                    />
                  );
                })}
              </Stack>
            </Box>

            <Typography variant="caption" color="text.secondary">
              {selected
                ? translate("login.selected" as TranslationKey)
                    .replace("{name}", selected.name)
                    .replace("{role}", roleLabel)
                    .replace("{region}", selected.region)
                : translate("common.loading" as TranslationKey)}
            </Typography>

            <Divider />

            <FormControlLabel
              control={
                <Switch
                  checked={autoLogin}
                  onChange={(_, checked) => persistAutoLogin(checked)}
                  color="primary"
                />
              }
              label={translate("login.autoLogin" as TranslationKey)}
            />

            <Button
              variant="contained"
              color="primary"
              fullWidth
              size="large"
              disabled={submitting || !selected}
              startIcon={submitting ? <CircularProgress size={18} color="inherit" /> : <LoginIcon />}
              onClick={handleLogin}
              sx={{ py: 1.35, fontWeight: 700, borderRadius: 2 }}
            >
              {submitting
                ? translate("login.submitting" as TranslationKey)
                : translate("login.submit" as TranslationKey)}
            </Button>
          </Stack>
        </CardContent>
      </Card>
    </AuthLayout>
  );
}
