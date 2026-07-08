import { useEffect, useState } from "react";
import Navbar from "../../components/Navbar";
import { getMe } from "../../services/onboardingApi";
import "./Account.css";

function readStoredUser() {
  const storedUser = localStorage.getItem("settleInUser");

  if (!storedUser) return null;

  try {
    return JSON.parse(storedUser);
  } catch {
    return null;
  }
}

function formatRole(role) {
  if (!role) return "Not selected";

  return role.charAt(0).toUpperCase() + role.slice(1);
}

function AccountPage() {
  const [user, setUser] = useState(() => readStoredUser());
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    getMe()
      .then((freshUser) => {
        if (!isMounted) return;

        setUser(freshUser);
        localStorage.setItem("settleInUser", JSON.stringify(freshUser));
      })
      .catch((requestError) => {
        if (isMounted) {
          setError(requestError.message);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="account-page">
      <Navbar ariaLabel="Account navigation" />

      <main className="account-main">
        <section className="account-panel" aria-labelledby="account-title">
          <div className="account-heading">
            <p>Account settings</p>
            <h1 id="account-title">Your SettleIn profile</h1>
          </div>

          {error && (
            <p className="account-error" role="alert">
              {error}
            </p>
          )}

          <div className="account-summary">
            <div className="account-avatar" aria-hidden="true">
              {user?.profilePicture ? (
                <img src={user.profilePicture} alt="" />
              ) : (
                <span>{user?.fullName?.[0] || "S"}</span>
              )}
            </div>

            <div>
              <h2>{user?.fullName || "SettleIn user"}</h2>
              <p>{user?.email || "Email not available"}</p>
            </div>
          </div>

          <div className="account-detail-grid">
            <AccountDetail label="Current role" value={formatRole(user?.role)} />
            <AccountDetail
              label="Renter survey"
              value={
                user?.renterOnboardingCompleted ? "Complete" : "Not complete"
              }
            />
            <AccountDetail
              label="Owner survey"
              value={
                user?.ownerOnboardingCompleted ? "Complete" : "Not complete"
              }
            />
            <AccountDetail
              label="Email status"
              value={user?.isEmailVerified ? "Verified" : "Not verified"}
            />
          </div>
        </section>
      </main>
    </div>
  );
}

function AccountDetail({ label, value }) {
  return (
    <div className="account-detail">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

export default AccountPage;
