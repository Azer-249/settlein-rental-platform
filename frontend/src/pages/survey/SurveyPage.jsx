import { useState } from "react";
import RenterSurvey from "./renter/RenterSurvey";
import OwnerSurvey from "./owner/OwnerSurvey";
import { useLocation } from "react-router-dom";
import "./Survey.css";

function SurveyPage() {
  const location = useLocation();
  const initialRole = location.state?.role || "";
  const [role, setRole] = useState(initialRole);
  const optionClass = (value) => `option ${role === value ? "selected" : ""}`;

  return (
    <div className="survey-background">
      <div className="survey-page">
        <h1>Attend the survey for a personalized page.</h1>
        <p>How would you like to use the platform?</p>
        <div className="role-selection">
          <label className={optionClass("renter")}>
            <input
              type="radio"
              name="role"
              value="renter"
              checked={role === "renter"}
              onChange={(event) => setRole(event.target.value)}
            />
            <span>To rent a property!</span>
          </label>

          <label className={optionClass("owner")}>
            <input
              type="radio"
              name="role"
              value="owner"
              checked={role === "owner"}
              onChange={(event) => setRole(event.target.value)}
            />
            <span>To list a property!</span>
          </label>
        </div>
        {role === "renter" && <RenterSurvey />}
        {role === "owner" && <OwnerSurvey />}
      </div>
    </div>
  );
}

export default SurveyPage;
