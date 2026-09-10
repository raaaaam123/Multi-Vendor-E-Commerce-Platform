import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Navigate, useLocation } from "react-router-dom";
import Loader from "../common/Loader";
import { fetchCurrentUser } from "../../redux/slices/authSlice";

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, loading, user, token } = useSelector(
    (state) => state.auth
  );
  const dispatch = useDispatch();
  const location = useLocation();

  const hasToken = token || localStorage.getItem("token");

  useEffect(() => {
    if (hasToken && !user && !isAuthenticated && !loading) {
      dispatch(fetchCurrentUser());
    }
  }, [hasToken, user, isAuthenticated, loading, dispatch]);

  if (hasToken && !user && !isAuthenticated && loading) {
    return <Loader />;
  }

  if (!hasToken) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && user) {
    if (!allowedRoles.includes(user.role)) {
      return <Navigate to="/" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;
