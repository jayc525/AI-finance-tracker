import { Navigate } from "react-router-dom";
import { useAuth } from "../AuthContext";

function PrivateRoute({ children }) {
  const { token, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!token) {
    return <Navigate to="/login" />;
  }

  return children;
}

export default PrivateRoute;
