import { useEffect, useRef, useState } from "react";

const credentialHandlers = new Map();
let initializedClientId = null;

export default function GoogleSignInButton({ onCredential }) {
  const buttonRef = useRef(null);
  const instanceId = useRef(Symbol("google-signin"));
  const [error, setError] = useState("");
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  useEffect(() => {
    credentialHandlers.set(instanceId.current, { onCredential, setError });
    return () => credentialHandlers.delete(instanceId.current);
  }, [onCredential]);

  useEffect(() => {
    if (!clientId) return undefined;
    let mounted = true;
    const render = () => {
      if (!mounted || !window.google?.accounts?.id || !buttonRef.current) return;
      if (initializedClientId !== clientId) {
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: async ({ credential }) => {
            const handler = [...credentialHandlers.values()].at(-1);
            if (!handler) return;
          if (!credential) {
            handler.setError("Google did not return a sign-in credential.");
            return;
          }
          try {
            await handler.onCredential(credential);
          } catch (requestError) {
            handler.setError(requestError.message);
          }
          }
        });
        initializedClientId = clientId;
      }
      window.google.accounts.id.renderButton(buttonRef.current, {
        theme: "outline",
        size: "large",
        text: "continue_with",
        shape: "rectangular",
        width: Math.max(220, Math.min(buttonRef.current.clientWidth || 320, 400))
      });
    };

    let script = document.getElementById("google-identity-services");
    if (!script) {
      script = document.createElement("script");
      script.id = "google-identity-services";
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      script.addEventListener("load", render, { once: true });
      script.addEventListener("error", () => setError("Google sign-in could not load. Please try again later."), { once: true });
      document.head.appendChild(script);
    } else if (window.google?.accounts?.id) {
      render();
    } else {
      script.addEventListener("load", render, { once: true });
    }

    return () => { mounted = false; };
  }, [clientId]);

  if (!clientId) {
    return (
      <div className="google-signin">
        <button className="google-signin-placeholder" type="button" disabled>
          <span aria-hidden="true">G</span> Continue with Google
        </button>
        <p>Google sign-in needs the VITE_GOOGLE_CLIENT_ID setting.</p>
      </div>
    );
  }

  return (
    <div className="google-signin">
      <div ref={buttonRef} />
      {error && <p className="account-message" role="alert">{error}</p>}
    </div>
  );
}
