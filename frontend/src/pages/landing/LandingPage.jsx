import AppButton from "../../components/AppButton";
import Footer from "../../components/Footer";
import Navbar from "../../components/Navbar";
import PreviewHomes from "./PreviewHomes";
import InitialHero from "./Hero";
import FaqSection from "./FaqSection";
import "./LandingPage.css";
import { getMe } from "../../services/onboardingApi";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

async function getCurrentUser() {
  const token = localStorage.getItem("settleInToken");

  if (!token) {
    return null;
  }

  try {
    return await getMe();
  } catch {
    localStorage.removeItem("settleInToken");
    return null;
  }
}

function getLandingCtaPath(user) {
  if (!user) return "/sign-up";

  if (user.role === "renter") return "/renter";
  if (user.role === "owner") return "/owner";
  if (user.role === "moderator") return "/moderator";

  return "/survey";
}

function LandingPage() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    let isMounted = true;

    async function loadCurrentUser() {
      const freshUser = await getCurrentUser();

      if (isMounted) {
        setUser(freshUser);
      }
    }

    loadCurrentUser();

    return () => {
      isMounted = false;
    };
  }, []);

  const landingCtaPath = getLandingCtaPath(user);
  const landingCtaLabel = user ? "Go to dashboard" : "Find Your Home";

  return (
    <div className="landing-page">
      <Navbar ariaLabel="Landing page actions" />

      <main>
        <InitialHero />

        <section className="hero-section">
          <div className="hero-copy">
            <p className="eyebrow">Rental matching made simple</p>
            <h1>Find that place that feels like your home.</h1>
            <p className="hero-description">
              SettleIn helps renters discover homes through preference-based
              cards, while owners can share properties with people who are
              already interested.
            </p>
            <Link to={landingCtaPath}>
              <AppButton className="hero-cta">{landingCtaLabel}</AppButton>
            </Link>
          </div>

          <PreviewHomes />
        </section>
        <section className="purpose-section">
          <div>
            <p className="eyebrow">For renters and owners</p>
            <h2>A better way to match homes with people.</h2>
          </div>
          <p>
            Renters answer a short survey, browse matching homes, and save the
            places they like. Owners upload their properties and review renters
            who show interest.
          </p>
        </section>

        <section className="benefits-section" aria-label="SettleIn benefits">
          <article>
            <div className="benefit-icon">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M14 17H5" />
                <path d="M19 7h-9" />
                <circle cx="17" cy="17" r="3" />
                <circle cx="7" cy="7" r="3" />
              </svg>
            </div>
            <h3>Preference based</h3>
            <p>
              Cards are guided by location, budget, lifestyle, and features.
            </p>
          </article>
          <article>
            <div className="benefit-icon">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M11 17a4 4 0 0 1-8 0V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2Z" />
                <path d="M16.7 13H19a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2H7" />
                <path d="M7 17h.01" />
                <path d="m11 8 2.3-2.3a2.4 2.4 0 0 1 3.404.004L18.6 7.6a2.4 2.4 0 0 1 .026 3.434L9.9 19.8" />
              </svg>
            </div>
            <h3>Easy decisions</h3>
            <p>Renters can skip or show interest without opening many pages.</p>
          </article>
          <article>
            <div className="benefit-icon">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="m11 17 2 2a1 1 0 1 0 3-3" />
                <path d="m14 14 2.5 2.5a1 1 0 1 0 3-3l-3.88-3.88a3 3 0 0 0-4.24 0l-.88.88a1 1 0 1 1-3-3l2.81-2.81a5.79 5.79 0 0 1 7.06-.87l.47.28a2 2 0 0 0 1.42.25L21 4" />
                <path d="m21 3 1 11h-2" />
                <path d="M3 3 2 14l6.5 6.5a1 1 0 1 0 3-3" />
                <path d="M3 4h8" />
              </svg>
            </div>
            <h3>Owner approval</h3>
            <p>
              Owners choose which interested renters can receive contact info.
            </p>
          </article>
          <article>
            <div className="benefit-icon">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
                <path d="m9 12 2 2 4-4" />
              </svg>
            </div>
            <h3>Verified listings</h3>
            <p>
              Moderator review helps keep property uploads clearer and safer.
            </p>
          </article>
        </section>

        <FaqSection />
      </main>

      <Footer />
    </div>
  );
}

export default LandingPage;
