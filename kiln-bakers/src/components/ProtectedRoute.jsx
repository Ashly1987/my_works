import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children }) {
  const { loading, isAdmin } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="page-body">
        <div className="empty-state">
          <p>Checking access...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    const redirect = encodeURIComponent(
      `${location.pathname}${location.search}`,
    );
    return <Navigate to={`/login?redirect=${redirect}`} replace />;
  }

  return children;
}
