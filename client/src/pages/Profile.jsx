import { Link, Navigate } from "react-router-dom";
import { useCart } from "../cart.jsx";
import { WordSlide } from "../components/WordSlide.jsx";

export default function Profile() {
  const { member, authReady, logout } = useCart();
  if (!authReady) return <section className="page-top profile-page"><p className="body-copy">Loading your profile…</p></section>;
  if (!member) return <Navigate to="/" replace />;

  return (
    <section className="page-top profile-page">
      <p className="eyebrow">Your OBVGANG account</p>
      <WordSlide as="h1" className="section-title" text="Your profile" immediate />
      <div className="profile-card">
        <p className="profile-name">{member.name}</p>
        <p>{member.email}</p>
        <p className="profile-status">{member.isMember ? "OBVGANG member · 10% off eligible products" : "On your way to membership"}</p>
        <div className="profile-stats">
          <div><strong>{member.paidOrders}</strong><span>Paid orders</span></div>
          <div><strong>R{member.totalPaid.toFixed(2)}</strong><span>Total spent</span></div>
        </div>
        {!member.isMember && <p className="profile-progress">Become a member automatically after one paid order over R1,000, or 10 paid orders.</p>}
        <div className="profile-actions">
          <Link to="/shop" className="btn btn-dark"><span>Explore the shop</span></Link>
          <button className="btn btn-plain" onClick={logout}><span>Log out</span></button>
        </div>
      </div>
    </section>
  );
}
