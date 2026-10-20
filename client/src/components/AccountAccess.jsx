import { useState } from "react";
import { useCart } from "../cart.jsx";

export default function AccountAccess({ page = false, initialMode = "sign-in" }) {
  const { signIn, register } = useCart();
  const [mode, setMode] = useState(initialMode);
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  const finishSignIn = async (action) => {
    setMessage("");
    setBusy(true);
    try {
      const member = await action();
      setMessage(`Welcome${member.name ? `, ${member.name}` : ""}.`);
    } catch (error) {
      setMessage(error.message);
    } finally {
      setBusy(false);
    }
  };

  const submit = async (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    await finishSignIn(() => mode === "register"
      ? register(form.get("name"), form.get("email"), form.get("password"))
      : signIn(form.get("email"), form.get("password")));
  };

  return (
    <div className={`account-access ${page ? "account-access-page" : ""}`}>
      <div className="tabs" role="tablist" aria-label="Account options">
        <button
          type="button"
          role="tab"
          aria-selected={mode === "sign-in"}
          className={`tab ${mode === "sign-in" ? "active" : ""}`}
          onClick={() => { setMode("sign-in"); setMessage(""); }}
        >
          Sign in
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={mode === "register"}
          className={`tab ${mode === "register" ? "active" : ""}`}
          onClick={() => { setMode("register"); setMessage(""); }}
        >
          Create account
        </button>
      </div>
      <p className="account-intro">
        {mode === "sign-in" ? "Welcome back. Sign in to your account." : "Join the inner circle and get first access to every drop."}
      </p>
      <form className="stack" onSubmit={submit}>
        {mode === "register" && <input className="input" name="name" required maxLength="100" autoComplete="name" placeholder="Full name" aria-label="Full name" />}
        <input className="input" name="email" required type="email" autoComplete="email" placeholder="Email" aria-label="Email" />
        <div className="password-field">
          <input
            className="input"
            name="password"
            required
            minLength="8"
            type={showPassword ? "text" : "password"}
            autoComplete={mode === "register" ? "new-password" : "current-password"}
            placeholder="Password (8 characters minimum)"
            aria-label="Password"
          />
          <button
            className="password-visibility"
            type="button"
            aria-label={showPassword ? "Hide password" : "Show password"}
            aria-pressed={showPassword}
            onClick={() => setShowPassword((visible) => !visible)}
          >
            {showPassword
              ? <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m3 3 18 18M10.6 10.6a2 2 0 0 0 2.8 2.8" /><path d="M9.9 5.2A10.8 10.8 0 0 1 12 5c5.4 0 9 7 9 7a16 16 0 0 1-3.1 3.9M6.2 6.2C3.9 7.9 2.5 12 2.5 12s3.6 7 9.5 7a9.5 9.5 0 0 0 2.4-.3" /></svg>
              : <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2.5 12s3.6-7 9.5-7 9.5 7 9.5 7-3.6 7-9.5 7-9.5-7-9.5-7Z" /><circle cx="12" cy="12" r="2.5" /></svg>}
          </button>
        </div>
        <button type="submit" className="btn btn-dark full" disabled={busy}>
          <span>{busy ? "Please wait…" : mode === "sign-in" ? "Sign in" : "Create account"}</span>
        </button>
      </form>
      <p className="account-message" aria-live="polite">{message}</p>
    </div>
  );
}
