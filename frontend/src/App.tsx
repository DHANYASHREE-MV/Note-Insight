import { useState, type FormEvent } from "react";
import "./App.css";

import NewAnalysis from "./NewAnalysis";
import Dashboard from "./Dashboard";
import Settings from "./Settings";
import History from "./History";
import AnalysisReview from "./AnalysisReview";
import Patients from "./Patients";

import PatientDetail from "./PatientDetail";
import { LanguageProvider } from "./LanguageContext";
import { ThemeProvider } from "./ThemeContext";

import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from "firebase/auth";

import { auth } from "./firebase";

import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useNavigate,
} from "react-router-dom";


/* =========================================================
   LOGIN PAGE
   ========================================================= */

function Login() {
  const navigate = useNavigate();

  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [message, setMessage] = useState("");


  /* =========================================================
     LOGIN / SIGNUP
     ========================================================= */

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {

    event.preventDefault();

    setMessage("");

    try {

      /* =========================
         SIGN UP
         ========================= */

      if (isSignUp) {

        await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );

        setMessage(
          "Account created successfully. Please sign in with your email and password."
        );

        setIsSignUp(false);

        setPassword("");

      } else {

        /* =========================
           SIGN IN
           ========================= */

        await signInWithEmailAndPassword(
          auth,
          email,
          password
        );

        setMessage(
          "Signed in successfully!"
        );

        navigate("/dashboard");
      }

    } catch (error: any) {

      console.error(
        "Authentication error:",
        error
      );

      switch (error.code) {

        case "auth/email-already-in-use":

          setMessage(
            "This email already has an account. Please sign in."
          );

          break;


        case "auth/invalid-credential":

          setMessage(
            "Incorrect email or password."
          );

          break;


        case "auth/invalid-email":

          setMessage(
            "Please enter a valid email address."
          );

          break;


        case "auth/weak-password":

          setMessage(
            "Password must be at least 6 characters."
          );

          break;


        case "auth/user-not-found":

          setMessage(
            "No account exists with this email."
          );

          break;


        case "auth/wrong-password":

          setMessage(
            "Incorrect password."
          );

          break;


        default:

          setMessage(
            "Authentication failed. Please try again."
          );

      }
    }
  };


  /* =========================================================
     LOGIN UI
     ========================================================= */

  return (
    <main className="auth-page">

      {/* BACKGROUND DECORATION */}

      <div className="glow glow-top-left" />

      <div className="glow glow-bottom-right" />

      <div className="grid-pattern grid-left" />

      <div className="grid-pattern grid-right" />


      {/* DECORATIVE RINGS */}

      <div className="radar radar-left">

        <span />

        <span />

        <span />

      </div>


      <div className="radar radar-right">

        <span />

        <span />

        <span />

      </div>


      {/* =====================================================
          HEADER
          ===================================================== */}

      <header className="brand">

        <div className="brand-icon logo-option-2">

          <svg
            viewBox="0 0 80 80"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >

            {/* AI BRAIN */}

            <path
              d="M31 17C25 13 18 17 18 23C12 24 10 31 14 36C10 42 14 49 20 49C20 56 28 60 34 55"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
            />

            <path
              d="M31 17C34 12 42 14 44 20"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
            />


            {/* BRAIN NETWORK */}

            <circle
              cx="22"
              cy="27"
              r="3"
              fill="currentColor"
            />

            <circle
              cx="30"
              cy="21"
              r="3"
              fill="currentColor"
            />

            <circle
              cx="30"
              cy="34"
              r="3"
              fill="currentColor"
            />

            <circle
              cx="22"
              cy="43"
              r="3"
              fill="currentColor"
            />

            <path
              d="M22 27L30 21M22 27L30 34M30 34L22 43"
              stroke="currentColor"
              strokeWidth="1.5"
            />


            {/* CLINICAL DOCUMENT */}

            <path
              d="M44 17H59L68 26V55C68 58 66 60 63 60H44C41 60 39 58 39 55V22C39 19 41 17 44 17Z"
              stroke="currentColor"
              strokeWidth="3"
            />

            <path
              d="M59 17V27H68"
              stroke="currentColor"
              strokeWidth="3"
            />


            {/* DOCUMENT LINES */}

            <path
              d="M46 35H60M46 42H57"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
            />


            {/* MEDICAL CROSS */}

            <path
              d="M56 48V58M51 53H61"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
            />

          </svg>

        </div>


        <h1>
          NOTE <span>INSIGHT</span>
        </h1>

        <p>
          AI-Powered Clinical Documentation Assistant
        </p>

      </header>


      {/* =====================================================
          LEFT INFORMATION
          ===================================================== */}

      <aside className="side-info left-info">

        <div className="side-icon shield-icon">

          <svg
            viewBox="0 0 64 64"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >

            <path
              d="M32 6L52 14V29C52 42 43.5 53 32 58C20.5 53 12 42 12 29V14L32 6Z"
              stroke="currentColor"
              strokeWidth="3"
            />

            <rect
              x="24"
              y="29"
              width="16"
              height="13"
              rx="2"
              stroke="currentColor"
              strokeWidth="3"
            />

            <path
              d="M27 29V25C27 22.2 29.2 20 32 20C34.8 20 37 22.2 37 25V29"
              stroke="currentColor"
              strokeWidth="3"
            />

          </svg>

        </div>

        <h3>
          Secure. Private.
        </h3>

        <p>
          Built with clinical privacy in mind
        </p>

      </aside>


      {/* =====================================================
          RIGHT INFORMATION
          ===================================================== */}

      <aside className="side-info right-info">

        <div className="side-icon brain-icon">

          <svg
            viewBox="0 0 64 64"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >

            <path
              d="M25 13C18 10 13 15 14 21C8 23 8 31 13 34C9 39 13 47 20 46C21 53 29 55 34 50C38 55 47 52 46 45C53 45 56 37 51 33C56 28 52 20 46 21C47 14 38 11 34 16C31 11 27 11 25 13Z"
              stroke="currentColor"
              strokeWidth="2.5"
            />

            <circle
              cx="23"
              cy="24"
              r="3"
              fill="currentColor"
            />

            <circle
              cx="38"
              cy="22"
              r="3"
              fill="currentColor"
            />

            <circle
              cx="31"
              cy="34"
              r="3"
              fill="currentColor"
            />

            <circle
              cx="43"
              cy="38"
              r="3"
              fill="currentColor"
            />

            <circle
              cx="21"
              cy="42"
              r="3"
              fill="currentColor"
            />

            <path
              d="M23 24L31 34L38 22M31 34L43 38M31 34L21 42"
              stroke="currentColor"
              strokeWidth="1.5"
            />

          </svg>

        </div>

        <h3>
          AI + Human Review
        </h3>

        <p>
          Better clinical documentation
        </p>

      </aside>


      {/* =====================================================
          LOGIN CARD
          ===================================================== */}

      <section className="auth-card">

        <div className="card-header">

          <h2>
            {isSignUp
              ? "Create your account"
              : "Welcome back"}
          </h2>

          <p>
            {isSignUp
              ? "Start using Note Insight today"
              : "Sign in to continue to Note Insight"}
          </p>

        </div>


        {/* FORM */}

        <form onSubmit={handleSubmit}>

          {/* EMAIL */}

          <div className="form-group">

            <label htmlFor="email">
              Email
            </label>

            <div className="input-wrapper">

              <svg
                className="input-icon"
                viewBox="0 0 24 24"
                fill="none"
              >

                <rect
                  x="3"
                  y="5"
                  width="18"
                  height="14"
                  rx="2"
                  stroke="currentColor"
                  strokeWidth="2"
                />

                <path
                  d="M3 7L12 13L21 7"
                  stroke="currentColor"
                  strokeWidth="2"
                />

              </svg>

              <input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(event) =>
                  setEmail(event.target.value)
                }
                required
              />

            </div>

          </div>


          {/* PASSWORD */}

          <div className="form-group">

            <div className="password-label">

              <label htmlFor="password">
                Password
              </label>

              {!isSignUp && (
                <button
                  type="button"
                  className="forgot-button"
                  onClick={() =>
                    setMessage(
                      "Password reset will be connected next."
                    )
                  }
                >
                  Forgot password?
                </button>
              )}

            </div>


            <div className="input-wrapper">

              <svg
                className="input-icon"
                viewBox="0 0 24 24"
                fill="none"
              >

                <rect
                  x="5"
                  y="10"
                  width="14"
                  height="10"
                  rx="2"
                  stroke="currentColor"
                  strokeWidth="2"
                />

                <path
                  d="M8 10V7C8 4.8 9.8 3 12 3C14.2 3 16 4.8 16 7V10"
                  stroke="currentColor"
                  strokeWidth="2"
                />

              </svg>


              <input
                id="password"
                type={
                  showPassword
                    ? "text"
                    : "password"
                }
                placeholder="Enter your password"
                value={password}
                onChange={(event) =>
                  setPassword(event.target.value)
                }
                required
              />


              <button
                type="button"
                className="password-toggle"
                onClick={() =>
                  setShowPassword(
                    (current) => !current
                  )
                }
                aria-label={
                  showPassword
                    ? "Hide password"
                    : "Show password"
                }
              >
                {showPassword ? "◉" : "◌"}
              </button>

            </div>

          </div>


          {/* SUBMIT BUTTON */}

          <button
            className="primary-button"
            type="submit"
          >

            {isSignUp
              ? "Create Account"
              : "Sign In"}

            <span>
              →
            </span>

          </button>

        </form>


        {/* FIREBASE MESSAGE */}

        {message && (
          <p className="auth-message">
            {message}
          </p>
        )}


        {/* DIVIDER */}

        <div className="divider">

          <span>
            or continue with
          </span>

        </div>


        {/* GOOGLE */}

        <button
          type="button"
          className="google-button"
          onClick={() =>
            setMessage(
              "Google sign-in will be connected next."
            )
          }
        >

          <span className="google-letter">
            G
          </span>

          Continue with Google

        </button>


        {/* SWITCH LOGIN / SIGNUP */}

        <div className="switch-auth">

          <span>
            {isSignUp
              ? "Already have an account?"
              : "Don't have an account?"}
          </span>

          <button
            type="button"
            onClick={() =>
              setIsSignUp(
                (current) => !current
              )
            }
          >

            {isSignUp
              ? "Sign in"
              : "Create account"}

          </button>

        </div>

      </section>


      {/* =====================================================
          SECURITY FOOTER
          ===================================================== */}

      <footer className="security-footer">

        <div className="security-check">
          ✓
        </div>

        <div>

          <strong>
            Your data stays secure
          </strong>

          <span>
            Authentication and access controls
            protect your workspace
          </span>

        </div>

      </footer>

    </main>
  );
}


/* =========================================================
   NEW ANALYSIS ROUTE WRAPPER
   ========================================================= */

/*
   IMPORTANT:

   NewAnalysis.tsx expects:

       onClose: () => void

   Therefore we cannot simply do:

       <NewAnalysis />

   We use this wrapper so that NewAnalysis
   knows what to do when the X / Cancel button
   is clicked.
*/

function NewAnalysisRoute() {

  const navigate = useNavigate();

  return (
    <NewAnalysis
      onClose={() => navigate("/dashboard")}
    />
  );
}


/* =========================================================
   MAIN APPLICATION
   ========================================================= */

function App() {

  return (

    <ThemeProvider>

      <LanguageProvider>

        <BrowserRouter>

          <Routes>


            {/* =================================================
                LOGIN
            ================================================= */}

            <Route
              path="/login"
              element={<Login />}
            />


            {/* =================================================
                DASHBOARD
            ================================================= */}

            <Route
              path="/dashboard"
              element={<Dashboard />}
            />


            {/* =================================================
                NEW ANALYSIS

                FIX:
                NewAnalysis now receives onClose.
            ================================================= */}

            <Route
              path="/new-analysis"
              element={<NewAnalysisRoute />}
            />


            {/* =================================================
                ANALYSIS REVIEW

                IMPORTANT:
                NewAnalysis.tsx navigates to:

                    /analysis-review

                So this route MUST exist.
            ================================================= */}

            <Route
              path="/analysis-review"
              element={<AnalysisReview />}
            />


            {/* =================================================
                HISTORY
            ================================================= */}

            <Route
              path="/history"
              element={<History />}
            />


            {/* =================================================
                OLD / SAVED ANALYSIS ROUTE

                Keeping this because your History page
                may already use /analysis/:id.
            ================================================= */}

            <Route
              path="/analysis/:id"
              element={<AnalysisReview />}
            />

            <Route path="/patients" element={<Patients />} />
            <Route path="/patients/:patientId" element={<PatientDetail />} />
            <Route
              path="/patients"
              element={<Patients />}
            />

            <Route
              path="/patients/:patientId"
              element={<PatientDetail />}
            />


            {/* =================================================
                SETTINGS
            ================================================= */}

            <Route
              path="/settings"
              element={<Settings />}
            />


            {/* =================================================
                DEFAULT
            ================================================= */}

            <Route
              path="/"
              element={
                <Navigate
                  to="/login"
                  replace
                />
              }
            />


            {/* =================================================
                UNKNOWN ROUTES
            ================================================= */}

            <Route
              path="*"
              element={
                <Navigate
                  to="/login"
                  replace
                />
              }
            />

          </Routes>

        </BrowserRouter>

      </LanguageProvider>

    </ThemeProvider>
  );
}


export default App;