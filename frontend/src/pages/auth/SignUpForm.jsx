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

function SignUpForm({ switchToSignIn }) {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    // POST /api/auth/register

    setIsLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fullName: formData.fullName,
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message);
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
        <p className="auth-kicker">Create account</p>
        <h2>Start settling in</h2>
        <p>
          Join SettleIn and build the profile that helps match you with the
          right next home.
        </p>
      </div>

      <p className="auth-mode-link">
        Already have an account?{" "}
        <button type="button" onClick={switchToSignIn}>
          Sign in
        </button>
      </p>

      <div className="auth-fields">
        <label className="auth-field">
          <span>Full name</span>
          <input
            className="inputBar"
            name="fullName"
            type="text"
            placeholder="Your full name"
            value={formData.fullName}
            onChange={handleChange}
            required
          />
        </label>

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
              placeholder="Create password"
              value={formData.password}
              onChange={handleChange}
              minLength={6}
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

        <label className="auth-field">
          <span>Confirm password</span>
          <div className="auth-password-field">
            <input
              className="inputBar"
              name="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Repeat password"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />

            <button
              type="button"
              aria-label={
                showConfirmPassword
                  ? "Hide confirmation password"
                  : "Show confirmation password"
              }
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>
        </label>
      </div>

      {error && <p role="alert">{error}</p>}

      <button type="submit" disabled={isLoading}>
        {isLoading ? "Creating account..." : "Sign Up"}
      </button>
    </form>
  );
}

export default SignUpForm;
