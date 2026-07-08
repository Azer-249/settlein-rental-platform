import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { submitOnboarding } from "../../../services/onboardingApi";
import "./OwnerSurvey.css";

const languageOptions = [
  { value: "georgian", label: "Georgian" },
  { value: "english", label: "English" },
  { value: "russian", label: "Russian" },
  { value: "turkish", label: "Turkish" },
  { value: "armenian", label: "Armenian" },
  { value: "azerbaijani", label: "Azerbaijani" },
  { value: "arabic", label: "Arabic" },
  { value: "other", label: "Other" },
];

const emptyOwnerProfile = {
  phoneNumber: "",
  whatsappNumber: "",
  whatsappSameAsPhone: false,
  preferredContactMethods: [],
  languages: [],
  otherLanguage: "",
};

function OwnerSurvey() {
  const [formData, setFormData] = useState(emptyOwnerProfile);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  function handlePhoneChange(event) {
    const phoneNumber = event.target.value.replace(/\D/g, "");

    setFormData((previous) => ({
      ...previous,
      phoneNumber,
      whatsappNumber: previous.whatsappSameAsPhone
        ? phoneNumber
        : previous.whatsappNumber,
    }));
  }

  function handleValueChange(event) {
    const { name, value } = event.target;

    const numericFields = ["phoneNumber", "whatsappNumber"];

    const cleanedValue = numericFields.includes(name)
      ? value.replace(/\D/g, "")
      : value;

    setFormData((previous) => ({
      ...previous,
      [name]: cleanedValue,
    }));
  }

  function handleSameAsPhone(event) {
    const checked = event.target.checked;

    setFormData((previous) => ({
      ...previous,
      whatsappSameAsPhone: checked,
      whatsappNumber: checked ? previous.phoneNumber : previous.whatsappNumber,
    }));
  }

  function handleContactMethodChange(event) {
    const { value, checked } = event.target;

    setFormData((previous) => ({
      ...previous,
      preferredContactMethods: checked
        ? [...previous.preferredContactMethods, value]
        : previous.preferredContactMethods.filter((method) => method !== value),
    }));
  }

  function handleLanguageChange(event) {
    const { value, checked } = event.target;

    setFormData((previous) => ({
      ...previous,
      languages: checked
        ? [...previous.languages, value]
        : previous.languages.filter((language) => language !== value),
      otherLanguage:
        value === "other" && !checked ? "" : previous.otherLanguage,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSuccess("");

    const languages = formData.languages.filter(
      (language) => language !== "other",
    );

    if (formData.languages.includes("other")) {
      languages.push(formData.otherLanguage.trim());
    }

    if (languages.length === 0 || languages.some((language) => !language)) {
      setError("Please select at least one language and complete it.");
      return;
    }

    if (formData.preferredContactMethods.length === 0) {
      setError("Please select at least one contact method.");
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await submitOnboarding("owner", {
        phoneNumber: formData.phoneNumber.trim(),
        whatsappNumber: formData.whatsappNumber.trim(),
        preferredContactMethods: formData.preferredContactMethods,
        languages,
      });
      setSuccess("Your owner profile was saved successfully.");

      if (result.user?.ownerOnboardingCompleted) {
        navigate("/owner", { replace: true });
      }
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="owner-survey-form" onSubmit={handleSubmit}>
      <section>
        <h2>Tell renters how to reach you</h2>
        <p className="owner-form-intro">
          Add the contact details you want renters to use when they are
          interested in one of your properties.
        </p>

        <div className="owner-contact-grid">
          <label className="owner-field" htmlFor="owner-phone">
            Phone number
            <input
              id="owner-phone"
              name="phoneNumber"
              type="text"
              inputMode="numeric"
              autoComplete="tel"
              placeholder="e.g. 555 12 34 56"
              value={formData.phoneNumber}
              onChange={handlePhoneChange}
              required
            />
          </label>

          <label className="owner-field" htmlFor="owner-whatsapp">
            WhatsApp number
            <input
              id="owner-whatsapp"
              name="whatsappNumber"
              type="text"
              inputMode="numeric"
              autoComplete="tel"
              placeholder="e.g. 555 12 34 56"
              value={formData.whatsappNumber}
              onChange={handleValueChange}
              disabled={formData.whatsappSameAsPhone}
              required
            />
          </label>
        </div>

        <label className="owner-inline-option">
          <input
            type="checkbox"
            checked={formData.whatsappSameAsPhone}
            onChange={handleSameAsPhone}
          />
          Use my phone number for WhatsApp
        </label>

        <fieldset className="owner-option-group">
          <legend>How would you prefer renters to contact you?</legend>

          <div className="owner-contact-options">
            {[
              { value: "phone", label: "Phone" },
              { value: "whatsapp", label: "WhatsApp" },
              { value: "email", label: "Email" },
            ].map((option) => (
              <label key={option.value}>
                <input
                  type="checkbox"
                  name="preferredContactMethods"
                  value={option.value}
                  checked={formData.preferredContactMethods.includes(
                    option.value,
                  )}
                  onChange={handleContactMethodChange}
                />
                {option.label}
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset className="owner-option-group">
          <legend>Which languages can renters contact you in?</legend>

          <div className="owner-language-options">
            {languageOptions.map((language) => (
              <label key={language.value}>
                <input
                  type="checkbox"
                  value={language.value}
                  checked={formData.languages.includes(language.value)}
                  onChange={handleLanguageChange}
                />
                {language.label}
              </label>
            ))}
          </div>

          {formData.languages.includes("other") && (
            <label className="owner-field owner-other-language">
              Other language
              <input
                name="otherLanguage"
                type="text"
                value={formData.otherLanguage}
                onChange={handleValueChange}
                required
              />
            </label>
          )}
        </fieldset>
      </section>

      {error && (
        <p className="owner-form-message owner-form-error" role="alert">
          {error}
        </p>
      )}
      {success && (
        <p className="owner-form-message owner-form-success">{success}</p>
      )}

      <button
        className="owner-submit-button"
        type="submit"
        disabled={isSubmitting}
      >
        {isSubmitting ? "Submitting..." : "Submit survey"}
      </button>
    </form>
  );
}

export default OwnerSurvey;
