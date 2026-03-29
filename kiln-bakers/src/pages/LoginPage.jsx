import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
  const [mode, setMode] = useState("signin");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const { signIn, signUp, isAuthenticated, isAdmin } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const redirectTarget = useMemo(() => {
    const params = new URLSearchParams(location.search);
    const next = params.get("redirect");
    return next || "/";
  }, [location.search]);

  useEffect(() => {
    if (isAuthenticated && isAdmin) {
      navigate("/admin", { replace: true });
    }
  }, [isAuthenticated, isAdmin, navigate]);

  const submit = async (e) => {
    e.preventDefault();

    if (!identifier || !password) {
      toast.error("Username/email and password are required");
      return;
    }

    if (mode === "signup" && password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setSubmitting(true);
    try {
      if (mode === "signin") {
        const signedInRole = await signIn(identifier, password);
        toast.success("Welcome back");

        if (signedInRole === "admin") {
          navigate("/admin", { replace: true });
        } else {
          navigate(redirectTarget, { replace: true });
        }
      } else {
        await signUp(identifier, password);
        toast.success("Guest account created");
        navigate("/", { replace: true });
      }
    } catch (error) {
      toast.error(error.message || "Authentication failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page-body auth-page-wrap">
      <div className="card auth-card">
        <div className="card-header">
          <span>Account Access</span>
        </div>
        <div className="card-body">
          <div
            className="auth-tabs"
            role="tablist"
            aria-label="Authentication mode"
          >
            <button
              type="button"
              className={`auth-tab${mode === "signin" ? " active" : ""}`}
              onClick={() => setMode("signin")}
            >
              Sign In
            </button>
            <button
              type="button"
              className={`auth-tab${mode === "signup" ? " active" : ""}`}
              onClick={() => setMode("signup")}
            >
              Create Account
            </button>
          </div>

          <form onSubmit={submit} style={{ marginTop: 14 }}>
            <div className="form-group">
              <label className="form-label">
                {mode === "signin" ? "Username or Email" : "Email"}
              </label>
              <input
                type={mode === "signin" ? "text" : "email"}
                className="form-control"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                autoComplete={mode === "signin" ? "username" : "email"}
                placeholder={
                  mode === "signin"
                    ? "admin or name@example.com"
                    : "name@example.com"
                }
              />
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                type="password"
                className="form-control"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete={
                  mode === "signin" ? "current-password" : "new-password"
                }
                placeholder="At least 6 characters"
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-lg"
              style={{ width: "100%", justifyContent: "center" }}
              disabled={submitting}
            >
              {submitting
                ? "Please wait..."
                : mode === "signin"
                  ? "Sign In"
                  : "Create Guest Account"}
            </button>
          </form>

          <p className="text-muted" style={{ marginTop: 10, marginBottom: 0 }}>
            All new accounts are guest accounts. Admin access is assigned by
            owner.
          </p>
        </div>
      </div>
    </div>
  );
}
