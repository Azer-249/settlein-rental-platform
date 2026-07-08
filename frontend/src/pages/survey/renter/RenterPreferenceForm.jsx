import { useState } from "react";
import LocationSection from "./LocationPart";
import BudgetSection from "./BudgetPart";
import PropertyDetailsSection from "./PropertyDetailsPart";
import RenterLifeSection from "./RenterLifePart";
import "./RenterPreferenceForm.css";

const surveySteps = [
  { title: "Location", Component: LocationSection },
  { title: "Budget", Component: BudgetSection },
  { title: "Property", Component: PropertyDetailsSection },
  { title: "Lifestyle", Component: RenterLifeSection },
];

function RenterPreferencesForm({
  initialValues,
  onSubmit,
  submitLabel = "Submit",
  isSubmitting = false,
  error = "",
  success = "",
}) {
  const [formData, setFormData] = useState(initialValues);
  const [currentStep, setCurrentStep] = useState(0);

  const CurrentSection = surveySteps[currentStep].Component;
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === surveySteps.length - 1;

  function goToNextStep() {
    setCurrentStep((step) => Math.min(step + 1, surveySteps.length - 1));
  }

  function goToPreviousStep() {
    setCurrentStep((step) => Math.max(step - 1, 0));
  }

  return (
    <form className="renter-preferences-form">
      <ol className="survey-progress" aria-label="Survey progress">
        {surveySteps.map((step, index) => {
          const status =
            index < currentStep
              ? "completed"
              : index === currentStep
                ? "active"
                : "";

          return (
            <li
              key={step.title}
              className={status}
              aria-current={index === currentStep ? "step" : undefined}
            >
              <span>{index + 1}</span>
              <p>{step.title}</p>
            </li>
          );
        })}
      </ol>

      <div className="survey-step-content">
        <CurrentSection formData={formData} setFormData={setFormData} />
      </div>

      {error && <p role="alert">{error}</p>}
      {success && <p className="survey-success-message">{success}</p>}

      <div className="survey-step-actions">
        {!isFirstStep && (
          <button
            className="survey-navigation-button previous"
            type="button"
            onClick={goToPreviousStep}
          >
            Previous
          </button>
        )}

        {!isLastStep ? (
          <button
            className="survey-navigation-button next"
            type="button"
            onClick={goToNextStep}
          >
            Next
          </button>
        ) : (
          <button
            className="survey-submit-button"
            type="button"
            disabled={isSubmitting}
            onClick={() => onSubmit(formData)}
          >
            {submitLabel}
          </button>
        )}
      </div>
    </form>
  );
}

export default RenterPreferencesForm;
