import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { onAuthStateChanged, type User } from "firebase/auth";
import { auth } from "./firebase";
import { loadAnalyses, type AnalysisRow } from "./historyStorage";

import "./Dashboard.css";
import "./History.css";


function Dashboard() {

    const navigate = useNavigate();

    const [search, setSearch] = useState("");

    const [user, setUser] = useState<User | null>(null);

    const [analyses, setAnalyses] = useState<AnalysisRow[]>([]);


    /* =====================================================
       FIREBASE CURRENT USER
    ====================================================== */

    useEffect(() => {

        const unsubscribe = onAuthStateChanged(
            auth,
            (currentUser) => {

                setUser(currentUser);

            }
        );

        return () => unsubscribe();

    }, []);


    /* =====================================================
       LOAD USER'S ANALYSES
    ====================================================== */

    useEffect(() => {

        const loadUserAnalyses = async () => {

            try {

                const result = await loadAnalyses();

                /*
                 * Make sure the dashboard ALWAYS receives
                 * an array.
                 *
                 * This prevents:
                 * analyses.filter is not a function
                 */

                if (Array.isArray(result)) {

                    setAnalyses(result);

                } else {

                    setAnalyses([]);

                }

            } catch (error) {

                console.error(
                    "Dashboard history error:",
                    error
                );

                setAnalyses([]);

            }

        };


        loadUserAnalyses();

    }, [user]);


    /* =====================================================
       USER NAME
    ====================================================== */

    const getUserName = () => {

        if (!user) {
            return "there";
        }


        /*
         * Firebase displayName
         *
         * This will work if the user profile
         * contains a name.
         */

        if (user.displayName?.trim()) {

            return user.displayName
                .trim()
                .split(" ")[0];

        }


        /*
         * Fallback:
         *
         * dhanyashree@gmail.com
         * becomes
         * Dhanyashree
         */

        if (user.email) {

            const emailName =
                user.email.split("@")[0];

            if (emailName) {

                return emailName
                    .replace(/[._-]/g, " ")
                    .split(" ")
                    .filter(Boolean)
                    .map(
                        (word) =>
                            word.charAt(0).toUpperCase() +
                            word.slice(1)
                    )
                    .join(" ");

            }

        }


        return "there";

    };


    const userName = getUserName();


    /* =====================================================
       DYNAMIC TIME GREETING
    ====================================================== */

    const currentHour =
        new Date().getHours();

    const greeting =
        currentHour < 12
            ? "Good morning"
            : currentHour < 18
                ? "Good afternoon"
                : "Good evening";


    /* =====================================================
       USER-SPECIFIC STATISTICS
    ====================================================== */

    const totalAnalyses =
        analyses.length;


    const pendingReviews =
        analyses.filter(
            (analysis) =>
                analysis.status === "Pending Review"
        ).length;


    const reviewedThisMonth =
        analyses.filter(
            (analysis) =>
                analysis.status === "Reviewed"
        ).length;


    const conditionsIdentified =
        analyses.reduce(
            (total, analysis) =>
                total + (analysis.conditions || 0),
            0
        );


    const documentationGaps =
        analyses.reduce(
            (total, analysis) =>
                total +
                (analysis.gapCount || 0),
            0
        );


    /* =====================================================
       SEARCH
    ====================================================== */

    const filteredAnalyses =
        analyses.filter(
            (analysis) =>
                String(
                    analysis.patient || ""
                )
                    .toLowerCase()
                    .includes(
                        search.toLowerCase()
                    )
        );


    /* =====================================================
       SIGN OUT
    ====================================================== */

    const handleSignOut = async () => {

        try {

            await auth.signOut();

            navigate("/login");

        } catch (error) {

            console.error(
                "Sign out error:",
                error
            );

        }

    };


    /* =====================================================
       DASHBOARD
    ====================================================== */

    return (

        <div className="dashboard-page">


            {/* =================================================
                SIDEBAR
            ================================================= */}

            <aside className="history-sidebar">


                {/* BRAND */}

                <div className="history-brand">

                    <div className="history-logo">
                        NI
                    </div>

                    <div>

                        <strong>
                            NOTE INSIGHT
                        </strong>

                        <small>
                            Clinical AI
                        </small>

                    </div>

                </div>


                {/* NAVIGATION */}

                <nav className="history-nav">


                    {/* DASHBOARD */}

                    <button
                        type="button"
                        className="history-nav-active"
                        onClick={() =>
                            navigate("/dashboard")
                        }
                    >

                        <span>
                            ⌂
                        </span>

                        Dashboard

                    </button>


                    {/* NEW ANALYSIS */}

                    <button
                        type="button"
                        onClick={() =>
                            navigate("/new-analysis")
                        }
                    >

                        <span>
                            ＋
                        </span>

                        New Analysis

                    </button>


                    {/* HISTORY */}

                    <button
                        type="button"
                        onClick={() =>
                            navigate("/history")
                        }
                    >

                        <span>
                            ◷
                        </span>

                        History

                    </button>


                    {/* PATIENTS */}

                    <button
                        type="button"
                        onClick={() =>
                            navigate("/patients")
                        }
                    >

                        <span>
                            ♧
                        </span>

                        Patients

                    </button>


                    {/* SETTINGS */}

                    <button
                        type="button"
                        onClick={() =>
                            navigate("/settings")
                        }
                    >

                        <span>
                            ⚙
                        </span>

                        Settings

                    </button>

                </nav>


                {/* SIDEBAR BOTTOM */}

                <div className="history-sidebar-bottom">


                    {/* PRIVATE WORKSPACE */}

                    <div className="history-private">

                        <span>
                            ✓
                        </span>

                        <div>

                            <strong>
                                Private Workspace
                            </strong>

                            <small>
                                Your data is protected
                            </small>

                        </div>

                    </div>


                    {/* SIGN OUT */}

                    <button
                        type="button"
                        onClick={handleSignOut}
                    >

                        ↪ Sign out

                    </button>

                </div>

            </aside>


            {/* =================================================
                MAIN DASHBOARD
            ================================================= */}

            <main className="dashboard-main">


                {/* =================================================
                    HEADER
                ================================================= */}

                <header className="dashboard-header">


                    <div>

                        <p className="eyebrow">
                            CLINICAL WORKSPACE
                        </p>


                        <h1>

                            {greeting},{" "}
                            {userName}

                        </h1>


                        <p className="header-subtitle">

                            {totalAnalyses === 0
                                ? "Welcome to your clinical documentation dashboard."
                                : "Here's what needs your attention today."
                            }

                        </p>

                    </div>


                    {/* PROFILE */}

                    <div className="profile">


                        <div className="notification">

                            <span>
                                ◔
                            </span>

                            <i />

                        </div>


                        <div className="avatar">

                            {userName
                                .slice(0, 2)
                                .toUpperCase()
                            }

                        </div>


                        <div className="profile-info">

                            <strong>
                                {userName}
                            </strong>

                            <span>

                                {user?.email ||
                                    "Clinical Reviewer"}

                            </span>

                        </div>

                    </div>

                </header>


                {/* =================================================
                    NEEDS ATTENTION + NEW ANALYSIS
                ================================================= */}

                <section className="dashboard-action-row">


                    {/* NEEDS ATTENTION */}

                    <div className="dashboard-attention-card">


                        <div className="dashboard-attention-icon">
                            ▤
                        </div>


                        <div className="dashboard-attention-content">

                            <h2>
                                Needs your attention
                            </h2>


                            <p>

                                {pendingReviews}{" "}
                                {pendingReviews === 1
                                    ? "analysis"
                                    : "analyses"}{" "}
                                pending review

                            </p>


                            <p>

                                {documentationGaps}{" "}
                                documentation{" "}
                                {documentationGaps === 1
                                    ? "gap"
                                    : "gaps"}

                            </p>

                        </div>


                        <button
                            type="button"
                            className="dashboard-attention-button"
                            onClick={() =>
                                navigate(
                                    "/history?filter=pending"
                                )
                            }
                            disabled={
                                pendingReviews === 0
                            }
                        >

                            Review pending →

                        </button>

                    </div>


                    {/* NEW ANALYSIS */}

                    <div className="dashboard-new-analysis">


                        <div className="dashboard-new-analysis-content">


                            <div className="dashboard-new-analysis-icon">

                                ＋

                            </div>


                            <div>

                                <h2>
                                    New Analysis
                                </h2>

                                <p>
                                    Paste a clinical note and start a new review.
                                </p>

                            </div>

                        </div>


                        <button
                            type="button"
                            onClick={() =>
                                navigate("/new-analysis")
                            }
                        >

                            Start New Analysis →

                        </button>

                    </div>

                </section>


                {/* =================================================
                    STATISTICS
                ================================================= */}

                <section className="stats-grid">


                    {/* TOTAL */}

                    <div className="stat-card">

                        <div className="stat-top">

                            <span>
                                Total analyses
                            </span>

                            <div className="stat-icon blue">
                                ▤
                            </div>

                        </div>

                        <strong>
                            {totalAnalyses}
                        </strong>

                        <small>
                            All time
                        </small>

                    </div>


                    {/* PENDING */}

                    <div className="stat-card">

                        <div className="stat-top">

                            <span>
                                Pending review
                            </span>

                            <div className="stat-icon orange">
                                ◷
                            </div>

                        </div>

                        <strong>
                            {pendingReviews}
                        </strong>

                        <small>
                            Needs your attention
                        </small>

                    </div>


                    {/* REVIEWED */}

                    <div className="stat-card">

                        <div className="stat-top">

                            <span>
                                Reviewed
                            </span>

                            <div className="stat-icon green">
                                ✓
                            </div>

                        </div>

                        <strong>
                            {reviewedThisMonth}
                        </strong>

                        <small>
                            Your analyses
                        </small>

                    </div>


                    {/* CONDITIONS */}

                    <div className="stat-card">

                        <div className="stat-top">

                            <span>
                                Conditions identified
                            </span>

                            <div className="stat-icon purple">
                                ✦
                            </div>

                        </div>

                        <strong>
                            {conditionsIdentified}
                        </strong>

                        <small>
                            Across your analyses
                        </small>

                    </div>

                </section>


                {/* =================================================
                    RECENT PATIENT ANALYSES
                ================================================= */}

                <section className="recent-section">


                    <div className="section-heading">


                        <h2>
                            Recent patient analyses
                        </h2>


                        <div className="recent-heading-right">


                            {/* SEARCH */}

                            <div className="search-box">

                                <input
                                    type="text"
                                    placeholder="Search patient ID or analysis..."
                                    value={search}
                                    onChange={(event) =>
                                        setSearch(
                                            event.target.value
                                        )
                                    }
                                />

                                <span>
                                    ⌕
                                </span>

                            </div>


                            {/* HISTORY */}

                            <button
                                type="button"
                                className="view-history-button"
                                onClick={() =>
                                    navigate("/history")
                                }
                            >

                                View all history →

                            </button>

                        </div>

                    </div>


                    {/* TABLE */}

                    <div className="analysis-table">


                        <div className="table-header">

                            <span>
                                Patient
                            </span>

                            <span>
                                Last visit
                            </span>

                            <span>
                                Conditions
                            </span>

                            <span>
                                Documentation
                            </span>

                            <span>
                                Status
                            </span>

                        </div>


                        {filteredAnalyses.length === 0 ? (

                            <div
                                className="analysis-row"
                                style={{
                                    display: "flex",
                                    justifyContent: "center",
                                    alignItems: "center",
                                    minHeight: "120px",
                                    opacity: 0.7,
                                }}
                            >

                                <span>

                                    {analyses.length === 0
                                        ? "No analyses yet. Start your first analysis."
                                        : "No matching analyses found."
                                    }

                                </span>

                            </div>

                        ) : (

                            filteredAnalyses
                                .slice(0, 5)
                                .map((analysis) => (

                                    <div
                                        className="analysis-row"
                                        key={analysis.id}
                                    >


                                        {/* PATIENT */}

                                        <div className="patient-cell">

                                            <div className="patient-avatar">

                                                {String(
                                                    analysis.patient || "PT"
                                                ).slice(-2)}

                                            </div>


                                            <div>

                                                <strong>
                                                    {analysis.patient}
                                                </strong>

                                                <small>
                                                    Clinical encounter
                                                </small>

                                            </div>

                                        </div>


                                        {/* DATE */}

                                        <span className="date-cell">

                                            {analysis.date}

                                        </span>


                                        {/* CONDITIONS */}

                                        <span className="condition-count">

                                            {analysis.conditions}

                                        </span>


                                        {/* DOCUMENTATION */}

                                        <span
                                            className={`doc-status ${analysis.documentation ===
                                                    "Good"
                                                    ? "good"
                                                    : "gaps"
                                                }`}
                                        >

                                            <i />

                                            {analysis.documentation ===
                                                "Good"
                                                ? "Good"
                                                : `${analysis.gapCount || 0} gaps`
                                            }

                                        </span>


                                        {/* STATUS */}

                                        <span
                                            className={`status ${analysis.status ===
                                                    "Reviewed"
                                                    ? "reviewed"
                                                    : "pending"
                                                }`}
                                        >

                                            <i />

                                            {analysis.status}

                                        </span>

                                    </div>

                                ))

                        )}

                    </div>

                </section>


                {/* =================================================
                    FOOTER
                ================================================= */}

                <footer className="dashboard-footer">

                    <span>
                        Note Insight
                    </span>

                    <span>
                        AI-generated suggestions require human review.
                    </span>

                    <span>
                        v0.1.0
                    </span>

                </footer>

            </main>

        </div>
    );
}


export default Dashboard;