import { useState } from "react";
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Avatar,
  Alert,
  CircularProgress,
  InputAdornment,
  IconButton,
  useTheme,
  Divider,
} from "@mui/material";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import axios from "axios";

import { useAuth } from "../../contexts/AuthContext";
import {
  generatePkcePair,
  getDiscovery,
  getProviderConfig,
  OIDC_REDIRECT_URI,
  type OidcProvider,
} from "../../configs/oidcPkce";

export default function LoginPage() {
  const theme = useTheme();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      setError("Vui lòng nhập đầy đủ email và mật khẩu.");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/api/v1/auth/login`,
        {
          email,
          password,
        },
      );

      if (response.data?.access_token) {
        localStorage.setItem("access_token", response.data.access_token);
        const apiCamera = response.data.camera;

        if (response.data.refresh_token) {
          localStorage.setItem("refresh_token", response.data.refresh_token);
        }

        // SỬA TẠI ĐÂY: Truyền toàn bộ response.data vào login() để AuthContext tự bóc tách user & permissions
        login(response.data.access_token, response.data);

        if (apiCamera?.camera_token) {
          localStorage.setItem("camera_token", apiCamera.camera_token);
        }

        window.location.href = "/vehicle-in";
      }
    } catch (err: any) {
      const detail = err.response?.data?.detail;

      setError(
        typeof detail === "string"
          ? detail
          : detail?.message || "Đăng nhập thất bại.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSsoLogin = async (provider: OidcProvider) => {
    try {
      setError(null);
      setLoading(true);

      const discovery = await getDiscovery(provider);
      const { clientId } = getProviderConfig(provider);
      const { verifier, challenge } = await generatePkcePair();
      const state = crypto.randomUUID();
      const nonce = crypto.randomUUID();

      sessionStorage.setItem(
        "app2_pending_auth",
        JSON.stringify({ provider, state, nonce, verifier }),
      );

      const params = new URLSearchParams({
        client_id: clientId,
        response_type: "code",
        scope: "openid profile email",
        redirect_uri: OIDC_REDIRECT_URI,
        state,
        nonce,
        code_challenge: challenge,
        code_challenge_method: "S256",
      });

      window.location.href = `${discovery.authorization_endpoint}?${params.toString()}`;
    } catch (err) {
      console.error(err);
      setError("Không thể đăng nhập SSO.");
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        p: 2,
        backgroundImage:
          'url("https://mianco.com.vn/wp-content/uploads/2020/02/Background-login-1024x547.jpg")',
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <Card
        sx={{
          maxWidth: 400,
          width: "100%",
          borderRadius: 3,
          boxShadow: 8,
          bgcolor: "rgba(26,26,26,0.26)",
          backdropFilter: "blur(8px)",
          border: "1px solid rgba(255,255,255,0.1)",
        }}
      >
        <CardContent
          sx={{
            p: 4,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <Avatar
            sx={{
              m: 1,
              width: 56,
              height: 56,
              bgcolor: "primary.main",
            }}
          >
            <LockOutlinedIcon />
          </Avatar>

          <Typography
            variant="h5"
            sx={{
              mt: 1,
              mb: 1,
              fontWeight: 800,
              color: "#fff",
              fontFamily: theme.typography.fontFamily,
            }}
          >
            ĐĂNG NHẬP HỆ THỐNG
          </Typography>

          <Typography
            variant="body2"
            sx={{
              mb: 4,
              color: "rgba(255,255,255,0.7)",
            }}
          >
            Hệ thống quản lý & đối sánh xe ra vào
          </Typography>

          {error && (
            <Alert
              severity="error"
              sx={{
                width: "100%",
                mb: 3,
              }}
            >
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} sx={{ width: "100%" }}>
            <TextField
              fullWidth
              required
              label="Email"
              value={email}
              disabled={loading}
              onChange={(e) => setEmail(e.target.value)}
              sx={{ mb: 2 }}
            />

            <TextField
              fullWidth
              required
              label="Mật khẩu"
              type={showPassword ? "text" : "password"}
              value={password}
              disabled={loading}
              onChange={(e) => setPassword(e.target.value)}
              sx={{ mb: 2 }}
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        edge="end"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                },
              }}
            />

            <Button
              fullWidth
              type="submit"
              variant="contained"
              disabled={loading}
              sx={{
                height: 48,
                borderRadius: 2,
                fontWeight: 700,
              }}
            >
              {loading ? (
                <CircularProgress size={22} color="inherit" />
              ) : (
                "ĐĂNG NHẬP"
              )}
            </Button>

            <Divider
              sx={{
                my: 3,
                color: "rgba(255,255,255,0.6)",
              }}
            >
              hoặc
            </Divider>

            <Button
              fullWidth
              variant="outlined"
              disabled={loading}
              onClick={() => handleSsoLogin("keycloak")}
              sx={{
                height: 48,
                borderRadius: 2,
                color: "#fff",
                borderColor: "rgba(255,255,255,0.4)",
                textTransform: "none",
                fontWeight: 600,
                mb: 1.5,
                "&:hover": {
                  borderColor: "#fff",
                  backgroundColor: "rgba(255,255,255,0.08)",
                },
              }}
            >
              Đăng nhập qua Keycloak
            </Button>

            <Button
              fullWidth
              variant="outlined"
              disabled={loading}
              onClick={() => handleSsoLogin("azure")}
              sx={{
                height: 48,
                borderRadius: 2,
                color: "#fff",
                borderColor: "rgba(255,255,255,0.4)",
                textTransform: "none",
                fontWeight: 600,
                "&:hover": {
                  borderColor: "#fff",
                  backgroundColor: "rgba(255,255,255,0.08)",
                },
              }}
            >
              Đăng nhập bằng Microsoft Entra ID
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}