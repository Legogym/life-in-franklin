// src/components/LoginModal.jsx
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "../supabaseClient";

export default function LoginModal({ isOpen, onClose, setUser }) {
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleAuth = async (e) => {
    e.preventDefault();
    setError("");

    const { data, error } = isSignup
      ? await supabase.auth.signUp({ email, password })
      : await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError(error.message);
    } else {
      setUser(data.user);
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl relative"
            initial={{ scale: 0.9, y: 50 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 50 }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-bold mb-4 text-center">
              {isSignup ? "Create an Account" : "Login"}
            </h2>

            <form className="flex flex-col gap-3" onSubmit={handleAuth}>
              <input
                type="email"
                placeholder="Email"
                className="border rounded px-3 py-2"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <input
                type="password"
                placeholder="Password"
                className="border rounded px-3 py-2"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              {error && (
                <p className="text-red-500 text-sm text-center">{error}</p>
              )}
              <button
                type="submit"
                className="bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
              >
                {isSignup ? "Sign Up" : "Login"}
              </button>
            </form>

            <p className="text-sm mt-4 text-center">
              {isSignup ? "Already have an account?" : "Need an account?"}{" "}
              <button
                onClick={() => setIsSignup(!isSignup)}
                className="text-blue-600 hover:underline"
              >
                {isSignup ? "Login" : "Sign Up"}
              </button>
            </p>

            <button
              onClick={onClose}
              className="absolute top-2 right-3 text-gray-500 hover:text-black text-xl"
            >
              &times;
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
