import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-top">
        <div className="footer-brand">
          <img src="/images/logo.png" alt="OBVGANG" className="logo-img" />
          <p>African Roots Global Vision</p>
          <p className="footer-note">Everyday pieces for the journey ahead.</p>
          <p className="footer-contact-label">Contact us</p>
          <div className="socials">
            <a href="https://www.facebook.com/" target="_blank" rel="noreferrer" aria-label="Facebook">
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14 8h3V4h-3c-3 0-5 2-5 5v2H6v4h3v5h4v-5h3l1-4h-4V9c0-.7.3-1 1-1Z" /></svg>
            </a>
            <a href="https://www.instagram.com/" target="_blank" rel="noreferrer" aria-label="Instagram">
              <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle className="social-dot" cx="18" cy="6" r="1" /></svg>
            </a>
            <a href="https://wa.me/?text=Hello%20OBVGANG" target="_blank" rel="noreferrer" aria-label="WhatsApp">
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.2 11.7a8.1 8.1 0 0 1-12 7.1L4 20l1.2-4A8.1 8.1 0 1 1 20.2 11.7Z" /><path d="M9 8.5c.2-.4.4-.4.7-.4h.5c.2 0 .4.1.5.4l.7 1.6c.1.2.1.4-.1.6l-.5.6c-.2.2-.2.4 0 .6.5.8 1.2 1.4 2 1.8.2.1.4.1.6-.1l.7-.8c.2-.2.4-.2.6-.1l1.5.7c.3.1.4.3.4.5 0 .5-.3 1.2-.8 1.5-.5.4-1.2.5-1.9.3-1.1-.3-2.4-1-3.5-2.1-1.3-1.2-2-2.7-2.2-3.7-.2-.6 0-1.1.8-1.4Z" /></svg>
            </a>
          </div>
        </div>
        <div className="footer-cols">
          <div><h4>Shop</h4><Link to="/shop">All products</Link><Link to="/shop?category=shorts">Shorts</Link><Link to="/shop?category=tshirt">T-shirts</Link></div>
          <div><h4>Help</h4><span>Local delivery</span><span>Returns &amp; exchanges</span><span>FAQs</span></div>
          <div><h4>Company</h4><Link to="/story">About us</Link><span>Privacy policy</span><span>Terms of service</span></div>
        </div>
      </div>
      <div className="footer-meta">
        <span>Rooted in Africa. Made for the journey.</span>
        <Link to="/members">Join the members <span>↑</span></Link>
        <Link to="/#top">Back to top <span>↑</span></Link>
      </div>
      <p className="copyright">
        &copy; 2026 OBVGANG GARMENTS. All rights reserved. Product of{" "}
        <a href="https://mnsinvestmentsholdings.co.za" target="_blank" rel="noreferrer">
          MNS
        </a>
        .
      </p>
    </footer>
  );
}
