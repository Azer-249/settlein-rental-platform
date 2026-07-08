import "./Footer.css";

function Footer() {
  const currentYear = new Date().getFullYear();
  return (
    <footer className="app-footer">
      <p>Copyright {currentYear} SettleIn. All rights reserved.</p>
    </footer>
  );
}

export default Footer;
