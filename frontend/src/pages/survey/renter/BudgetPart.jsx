function BudgetSection({ formData, setFormData }) {
  function handleBudgetChange(event) {
    const { name, value, type, checked } = event.target;

    const numericFields = ["min", "max"];

    const cleanedValue = numericFields.includes(name)
      ? value.replace(/\D/g, "")
      : value;

    setFormData((previous) => ({
      ...previous,
      budget: {
        ...previous.budget,
        [name]: type === "checkbox" ? checked : cleanedValue,
      },
    }));
  }

  const budgetIsInvalid =
    formData.budget.min !== "" &&
    formData.budget.max !== "" &&
    Number(formData.budget.max) < Number(formData.budget.min);

  return (
    <section>
      <h2>What is your monthly budget?</h2>

      <div className="budget-inputs">
        <label htmlFor="minimum-budget">
          Minimum budget (GEL)
          <input
            id="minimum-budget"
            name="min"
            type="text"
            inputMode="numeric"
            value={formData.budget.min}
            onChange={handleBudgetChange}
          />
        </label>

        <label htmlFor="maximum-budget">
          Maximum budget (GEL)
          <input
            id="maximum-budget"
            name="max"
            type="text"
            inputMode="numeric"
            value={formData.budget.max}
            onChange={handleBudgetChange}
          />
        </label>
      </div>

      <label className="standalone-checkbox">
        <input
          name="withoutDeposit"
          type="checkbox"
          checked={formData.budget.withoutDeposit}
          onChange={handleBudgetChange}
        />
        Show only properties without a deposit
      </label>

      {budgetIsInvalid && (
        <p role="alert">Maximum budget cannot be lower than minimum budget.</p>
      )}
    </section>
  );
}

export default BudgetSection;
