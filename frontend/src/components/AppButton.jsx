import "./AppButton.css";

function AppButton({ children, variant = "primary", className = "", ...props }) {
  return (
    <button
      className={`button button-${variant} ${className}`.trim()}
      type="button"
      {...props}
    >
      {children}
    </button>
  );
}

export default AppButton;
