import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import AccountAccess from "../components/AccountAccess.jsx";
import { WordSlide } from "../components/WordSlide.jsx";
import { useCart } from "../cart.jsx";

export default function Members() {
  const { member, authReady, logout } = useCart();
  const [accountMode, setAccountMode] = useState(null);

  return (
    <section className="members-page">
      {authReady && !member && accountMode && (
        <button type="button" className="product-back members-back" onClick={() => setAccountMode(null)}>
          <span aria-hidden="true">←</span> Back to members
        </button>
      )}
      <motion.div
        className="members-page-card"
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: .7 }}
      >
        {!authReady ? <p className="panel-empty">Checking your account…</p> : member ? (
          <div className="members-signed-in">
            <p className="home-kicker">Members only</p>
            <WordSlide as="h1" className="home-section-title" text="Welcome back." immediate />
            <p>{member.isMember ? "Your 10% member discount is active on eligible products." : "Membership unlocks after one paid order over R1,000 or 10 paid orders."}</p>
            <Link to="/account" className="btn btn-dark full"><span>View profile</span></Link>
            <button type="button" className="btn btn-plain full" onClick={logout}><span>Log out</span></button>
          </div>
        ) : (
          accountMode ? (
            <>
              <p className="home-kicker">Members only</p>
              <AccountAccess page initialMode={accountMode} />
            </>
          ) : (
            <>
            <p className="home-kicker">Members only</p>
            <p className="members-description">
              Membership brings you closer to every OBVGANG drop, with 10% off eligible pieces and early access to new releases.
            </p>
            <div className="members-how-it-works">
              <span>How it works</span>
              <p>Make a confirmed purchase of more than R1,000 using the email you’ll use for your account. Once payment is confirmed, sign up with that same email to unlock your member benefits.</p>
            </div>
            <div className="members-actions">
              <button type="button" className="btn btn-dark" onClick={() => setAccountMode("register")}><span>Create account</span></button>
              <button type="button" className="btn btn-plain" onClick={() => setAccountMode("sign-in")}><span>Sign in</span></button>
            </div>
          </>
          )
        )}
      </motion.div>
    </section>
  );
}
