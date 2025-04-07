import React, { useState } from "react";
import { supabase } from "../supabaseClient";

export default function LoginModal({ onClose }) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAuth = async () => {
    setError("");
    setLoading(true);

    try {
      let result;

      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        });
        result = { data, error };
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        result = { data, error };
      }

      if (result.error) {
        setError(result.error.message);
      } else {
        onClose(); // close the modal
        window.location.reload(); // refresh to reflect login state
      }
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2>{isSignUp ? "Create Account" : "Log In"}</h2>

        {error && <p className="error" style={{ color: "red" }}>{error}</p>}

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={loading}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={loading}
        />

        <button onClick={handleAuth} disabled={loading}>
          {loading ? "Please wait..." : isSignUp ? "Sign Up" : "Log In"}
        </button>

        <p
          onClick={() => setIsSignUp(!isSignUp)}
          style={{ cursor: "pointer", marginTop: "1rem", color: "#007bff" }}
        >
          {isSignUp
            ? "Already have an account? Log in"
            : "No account? Sign up"}
        </p>

        <button className="close-button" onClick={onClose}>
          ×
        </button>
      </div>
    </div>
  );
}
