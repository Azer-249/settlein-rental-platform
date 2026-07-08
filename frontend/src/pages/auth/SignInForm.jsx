import { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { getMe } from "../../services/onboardingApi";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";

function getAuthenticatedPath(user) {
  if (user.role === "moderator") return "/moderator";
  if (user.role === "renter") return "/renter";
  if (user.role === "owner") return "/owner";

  return "/survey";
}

function SignInForm({ switchToSignUp }) {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  function handleChange(event) {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value,
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    // POST /api/auth/login

    setIsLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          setError("No account was found with those details.");
        } else if (response.status === 400) {
          setError("Please enter your email and password.");
        } else {
          setError(data.message || "Something went wrong. Please try again.");
        }

        return;
      }

      localStorage.setItem("settleInToken", data.data.token);

      const user = await getMe();
      navigate(getAuthenticatedPath(user), { replace: true });
    } catch {
      localStorage.removeItem("settleInToken");
      setError("Server error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="auth-page">
      <div className="auth-form-heading">
        <p className="auth-kicker">Sign in</p>
        <h2>Welcome back</h2>
        <p>Pick up where you left off and continue shaping your home search.</p>
      </div>

      <p className="auth-mode-link">
        Don't have an account?{" "}
        <button type="button" onClick={switchToSignUp}>
          Sign up
        </button>
      </p>

      <div className="auth-fields">
        <label className="auth-field">
          <span>Email</span>
          <input
            className="inputBar"
            name="email"
            type="email"
            placeholder="you@example.com"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </label>

        <label className="auth-field">
          <span>Password</span>
          <div className="auth-password-field">
            <input
              className="inputBar"
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="Your password"
              value={formData.password}
              onChange={handleChange}
              required
            />

            <button
              type="button"
              aria-label={showPassword ? "Hide password" : "Show password"}
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>
        </label>
      </div>

      {error && <p role="alert">{error}</p>}

      <button type="submit" disabled={isLoading}>
        {isLoading ? "Signing in..." : "Sign in"}
      </button>
    </form>
  );
}

export default SignInForm;
