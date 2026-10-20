import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useCart } from "../cart.jsx";
import { api } from "../api.js";
import { WordSlide } from "../components/WordSlide.jsx";

export default function Success() {
  const [params] = useSearchParams();
  const sessionId = params.get("session_id");
  const { clear, refreshAccount } = useCart();
  const [order, setOrder] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!sessionId) return setError("No payment session found.");
    let active = true;
    const wait = (milliseconds) => new Promise((resolve) => window.setTimeout(resolve, milliseconds));
    const checkPayment = async () => {
      try {
        for (let attempt = 0; attempt < 15 && active; attempt += 1) {
          const currentOrder = await api.orderStatus(sessionId);
          if (!active) return;
          setOrder(currentOrder);
          if (currentOrder.status === "paid") {
            await refreshAccount().catch(() => {
              if (active) setError("Your purchase is confirmed. Your account benefits will refresh shortly.");
            });
            return;
          }
          await wait(2000);
        }
      } catch (requestError) {
        if (active) setError(requestError.message);
      }
    };
    checkPayment();
    clear();
    return () => { active = false; };
    // refreshAccount and clear are stable for this page visit.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId]);

  return (
    <section className="page-top center">
      <div className="tick">&#10003;</div>
      <WordSlide as="h1" className="section-title" text="Thank you" immediate />
      {order && (
        <>
          <p className="body-copy">Order <strong>{order.public_no}</strong> · R{order.total.toFixed(2)}</p>
          <p className="muted-label">{order.status === "paid" ? "Payment confirmed" : "Confirming your payment…"}</p>
        </>
      )}
      {error && <p className="form-msg error">{error}</p>}
      <Link to="/shop" className="btn btn-dark" style={{ marginTop: 26 }}><span>Continue shopping</span></Link>
    </section>
  );
}
