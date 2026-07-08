import { Navigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { getMe } from "../services/onboardingApi";

function getSurveyPath(requiredOnboarding) {
  if (requiredOnboarding === "owner") {
    return "/survey/owner";
  }

  if (requiredOnboarding === "renter") {
    return "/survey/renter";
  }

  return "/survey";
}

function ProtectedRoute({ children, requiredOnboarding, requiredRole }) {
  const token = localStorage.getItem("settleInToken");
  const [user, setUser] = useState(null);
  const [isCheckingUser, setIsCheckingUser] = useState(Boolean(token));
  const [authFailed, setAuthFailed] = useState(false);
  const [checkedPath, setCheckedPath] = useState(null);
  const location = useLocation();

  useEffect(() => {
    let isMounted = true;

    async function loadCurrentUser() {
      if (!token) {
        setIsCheckingUser(false);
        return;
      }

      try {
        setIsCheckingUser(true);
        setAuthFailed(false);

        const freshUser = await getMe();

        if (isMounted) {
          setUser(freshUser);
          setCheckedPath(location.pathname);
        }
      } catch {
        localStorage.removeItem("settleInToken");

        if (isMounted) {
          setAuthFailed(true);
          setUser(null);
          setCheckedPath(location.pathname);
        }
      } finally {
        if (isMounted) {
          setIsCheckingUser(false);
        }
      }
    }

    loadCurrentUser();

    return () => {
      isMounted = false;
    };
  }, [token, location.pathname]);

  if (!token || authFailed) {
    return <Navigate to="/" replace />;
  }

  if (isCheckingUser || checkedPath !== location.pathname) {
    return null;
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  if (location.pathname === "/survey/owner" && user.ownerOnboardingCompleted) {
    return <Navigate to="/owner" replace />;
  }

  if (
    location.pathname === "/survey/renter" &&
    user.renterOnboardingCompleted
  ) {
    return <Navigate to="/renter" replace />;
  }

  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/" replace />;
  }

  if (requiredOnboarding === "owner" && !user.ownerOnboardingCompleted) {
    return <Navigate to={getSurveyPath("owner")} replace />;
  }

  if (requiredOnboarding === "renter" && !user.renterOnboardingCompleted) {
    return <Navigate to={getSurveyPath("renter")} replace />;
  }

  return children;
}

export default ProtectedRoute;
