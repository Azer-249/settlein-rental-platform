import { useNavigate } from "react-router-dom";
import "./Authentication.css";
import SignUpForm from "./SignUpForm";
import SignInForm from "./SignInForm";

function AuthPage({ initialMode = "sign-up" }) {
  const navigate = useNavigate();
  const isSignIn = initialMode === "sign-in";

  return (
    <div className="auth-layout">
      <main className="auth-shell" aria-label="SettleIn authentication">
        <section className="auth-visual-panel" aria-label="SettleIn welcome">
          <a className="logo-brand" href="/">
            SettleIn
          </a>

          <div className="auth-visual-copy">
            <p>{isSignIn ? "Welcome back." : "Find your next home."}</p>
          </div>
        </section>

        <section className="auth-form-panel">
          {isSignIn ? (
            <SignInForm switchToSignUp={() => navigate("/sign-up")} />
          ) : (
            <SignUpForm switchToSignIn={() => navigate("/sign-in")} />
          )}
        </section>
      </main>
    </div>
  );
}

export default AuthPage;
