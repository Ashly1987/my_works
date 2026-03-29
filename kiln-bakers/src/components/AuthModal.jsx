import { useState } from "react";
import { X } from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";

export default function AuthModal({ onClose, onSuccess }) {
  const [mode, setMode] = useState("signin");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const { signIn, signUp } = useAuth();

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
        await signIn(identifier, password);
        toast.success("Signed in");
      } else {
        await signUp(identifier, password);
        toast.success("Account created. You are signed in as guest.");
      }

      if (onSuccess) onSuccess();
      onClose();
    } catch (error) {
      toast.error(error.message || "Authentication failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Sign in to place order</h3>
          <button className="btn btn-ghost btn-sm" onClick={onClose}>
            <X size={15} />
          </button>
        </div>

        <div className="modal-body">
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

          <form onSubmit={submit} style={{ marginTop: 12 }}>
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
              className="btn btn-primary"
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
            New accounts are created as guest. Admin access is assigned
            manually.
          </p>
        </div>
      </div>
    </div>
  );
}
