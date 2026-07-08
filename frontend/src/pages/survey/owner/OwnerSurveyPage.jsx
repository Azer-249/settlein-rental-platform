import OwnerSurvey from "./OwnerSurvey";
import "../Survey.css";

function OwnerSurveyPage() {
  return (
    <div className="survey-background">
      <div className="survey-page">
        <h1>Tell renters how to reach you.</h1>
        <OwnerSurvey />
      </div>
    </div>
  );
}

export default OwnerSurveyPage;
