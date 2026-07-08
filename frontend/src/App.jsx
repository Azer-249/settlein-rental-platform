import { BrowserRouter, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/landing/LandingPage";
import AuthPage from "./pages/auth/Authentication";
import SurveyPage from "./pages/survey/SurveyPage";
import RenterHomePage from "./pages/renter/renterMainPage/renterMainPage";
import RenterSurveyPage from "./pages/survey/renter/RenterSurveyPage";
import OwnerSurveyPage from "./pages/survey/owner/OwnerSurveyPage";
import OwnerHomePage from "./pages/owner/OwnerMainPage";
import AccountPage from "./pages/account/Account";
import RenterAcceptedPage from "./pages/renter/renterAcceptedPage/RenterAcceptedPageView";
import ModeratorMainPage from "./pages/moderator/ModeratorMainPage";
import ProtectedRoute from "./routes/ProtectedRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/sign-up" element={<AuthPage initialMode="sign-up" />} />
        <Route path="/sign-in" element={<AuthPage initialMode="sign-in" />} />
        <Route
          path="/survey/renter"
          element={
            <ProtectedRoute>
              <RenterSurveyPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/survey/owner"
          element={
            <ProtectedRoute>
              <OwnerSurveyPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/survey"
          element={
            <ProtectedRoute>
              <SurveyPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/renter"
          element={
            <ProtectedRoute requiredOnboarding="renter">
              <RenterHomePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/owner"
          element={
            <ProtectedRoute requiredOnboarding="owner">
              <OwnerHomePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/account"
          element={
            <ProtectedRoute>
              <AccountPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/renter/interested"
          element={
            <ProtectedRoute requiredOnboarding="renter">
              <RenterAcceptedPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/moderator"
          element={
            <ProtectedRoute requiredRole="moderator">
              <ModeratorMainPage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
