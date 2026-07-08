import { Link, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { getMe, updateMyRole } from "../services/onboardingApi";
import chevronDownIcon from "../assets/icons/action-chevron-down.svg";
import logoIcon from "../assets/icons/settlein-logo.svg";
import menuDotsIcon from "../assets/icons/menu-dots-svgrepo-com.svg";
import switchRoleIcon from "../assets/icons/action-switch-role.svg";
import "./Navbar.css";

function Navbar({ ariaLabel = "Primary navigation" }) {
  const location = useLocation();
  const navigate = useNavigate();

  const token = localStorage.getItem("settleInToken");
  const [user, setUser] = useState(null);
  const [isCheckingUser, setIsCheckingUser] = useState(Boolean(token));
  const role = user?.role;
  const isSignedIn = Boolean(token && user);
  const currentPath = location.pathname;

  const brandPath =
    role === "renter"
      ? "/renter"
      : role === "owner"
        ? "/owner"
        : role === "moderator"
          ? "/moderator"
          : "/";

  function getNavLinkClass(path) {
    return `navbar-link ${currentPath === path ? "active" : ""}`.trim();
  }

  useEffect(() => {
    let isMounted = true;

    async function loadCurrentUser() {
      if (!token) {
        setUser(null);
        setIsCheckingUser(false);
        return;
      }

      try {
        setIsCheckingUser(true);
        const freshUser = await getMe();

        if (isMounted) {
          setUser(freshUser);
        }
      } catch {
        localStorage.removeItem("settleInToken");

        if (isMounted) {
          setUser(null);
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
  }, [token, currentPath]);

  function handleSignOut() {
    localStorage.removeItem("settleInToken");
    navigate("/sign-in");
  }

  async function handleRoleSwitch(nextRole) {
    try {
      const freshUser = await getMe();

      const onboardingCompleted =
        nextRole === "renter"
          ? freshUser.renterOnboardingCompleted
          : freshUser.ownerOnboardingCompleted;

      if (onboardingCompleted) {
        const updatedUser = await updateMyRole(nextRole);
        setUser(updatedUser);
        navigate(nextRole === "renter" ? "/renter" : "/owner");
        return;
      }

      navigate(nextRole === "renter" ? "/survey/renter" : "/survey/owner");
    } catch (error) {
      console.error(error);
      handleSignOut();
    }
  }

  return (
    <header className="app-navbar">
      <div className="app-navbar-left">
        <Link
          className="app-brand"
          to={brandPath}
          aria-label="Go to SettleIn home"
        >
          <img src={logoIcon} className="nav-logo-icon" alt="" />
          SettleIn
        </Link>

        {isSignedIn && role === "renter" && (
          <div className="navbar-primary-links">
            <Link to="/renter" className={getNavLinkClass("/renter")}>
              Explore
            </Link>
            <Link
              to="/renter/interested"
              className={getNavLinkClass("/renter/interested")}
            >
              Interested Houses
            </Link>
          </div>
        )}

        {isSignedIn && role === "owner" && (
          <div className="navbar-primary-links">
            <Link to="/owner" className={getNavLinkClass("/owner")}>
              My Properties
            </Link>
          </div>
        )}

        {isSignedIn && role === "moderator" && (
          <div className="navbar-primary-links">
            <Link to="/moderator" className={getNavLinkClass("/moderator")}>
              Pending Reviews
            </Link>
          </div>
        )}
      </div>

      <nav className="app-navbar-actions" aria-label={ariaLabel}>
        {!token && (
          <>
            <Link to="/sign-in" className="button button-ghost">
              Sign in
            </Link>
            <Link to="/sign-up" className="button button-primary">
              Sign up
            </Link>
          </>
        )}

        {token && isCheckingUser && (
          <span className="navbar-link">Loading...</span>
        )}

        {isSignedIn && role === "owner" && (
          <>
            <details className="navbar-account-dropdown">
              <summary>
                <img src={menuDotsIcon} className="account-menu-icon" alt="" />
                Account
                <img src={chevronDownIcon} className="chevron-icon" alt="" />
              </summary>

              <div className="navbar-account-menu">
                <Link to="/account">Settings</Link>
                <button type="button" onClick={handleSignOut}>
                  Sign out
                </button>
              </div>
            </details>

            <button
              type="button"
              className="navbar-switch-button switch-role-button"
              onClick={() => handleRoleSwitch("renter")}
            >
              <img src={switchRoleIcon} className="button-icon" alt="" />
              Switch to renter
            </button>
          </>
        )}

        {isSignedIn && role === "renter" && (
          <>
            <details className="navbar-account-dropdown">
              <summary>
                <img src={menuDotsIcon} className="account-menu-icon" alt="" />
                Account
                <img src={chevronDownIcon} className="chevron-icon" alt="" />
              </summary>

              <div className="navbar-account-menu">
                <Link to="/account">Settings</Link>
                <button type="button" onClick={handleSignOut}>
                  Sign out
                </button>
              </div>
            </details>

            <button
              type="button"
              className="navbar-switch-button switch-role-button"
              onClick={() => handleRoleSwitch("owner")}
            >
              <img src={switchRoleIcon} className="button-icon" alt="" />
              Switch to owner
            </button>
          </>
        )}
        {isSignedIn && role === "moderator" && (
          <>
            <details className="navbar-account-dropdown">
              <summary>
                <img src={menuDotsIcon} className="account-menu-icon" alt="" />
                Account
                <img src={chevronDownIcon} className="chevron-icon" alt="" />
              </summary>

              <div className="navbar-account-menu">
                <Link to="/account">Settings</Link>
                <button type="button" onClick={handleSignOut}>
                  Sign out
                </button>
              </div>
            </details>
          </>
        )}
      </nav>
    </header>
  );
}

export default Navbar;
