import RenterSurvey from "./RenterSurvey";
import "../Survey.css";

function RenterSurveyPage() {
  return (
    <div className="survey-background">
      <div className="survey-page">
        <h1>Tell us what kind of home fits you.</h1>
        <RenterSurvey />
      </div>
    </div>
  );
}

export default RenterSurveyPage;
