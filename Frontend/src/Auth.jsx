
import { useState } from "react";

const API = "http://localhost:3000";

function Auth({ onLogin }) {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch(`${API}/${mode === "login" ? "login" : "register"}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Authentication failed");
      }

      if (mode === "register") {
        setMode("login");
        setPassword("");
        setError("Registration successful. Please log in.");
      } else {
        localStorage.setItem("auth_token", data.token);
        onLogin(data.user);
      }
    } catch (err) {
      setError(err.message || "Could not connect to the server.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="route-page">
      <section className="tasks-panel">
        <div className="section-heading">
          <h2>{mode === "login" ? "Login" : "Create Account"}</h2>
          <p className="tasks-subtitle">
            {mode === "login"
              ? "Log in to access your Task Manager."
              : "Register to create your account."}
          </p>
        </div>

        {error && <div className="tasks-error">{error}</div>}

        <form className="task-create-form" onSubmit={handleSubmit}>
          <input
            className="task-input"
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            className="task-input"
            type="password"
            placeholder="Password (minimum 6 characters)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={6}
            required
          />

          <button
            className="task-btn-primary"
            type="submit"
            disabled={loading}
          >
            {loading
              ? "Please wait..."
              : mode === "login"
                ? "Login"
                : "Register"}
          </button>
        </form>

        <p>
          {mode === "login"
            ? "Don't have an account? "
            : "Already have an account? "}

          <button
            type="button"
            className="task-btn-edit"
            onClick={() => {
              setMode(mode === "login" ? "register" : "login");
              setError("");
            }}
          >
            {mode === "login" ? "Register" : "Login"}
          </button>
        </p>
      </section>
    </div>
  );
}

export default Auth;
