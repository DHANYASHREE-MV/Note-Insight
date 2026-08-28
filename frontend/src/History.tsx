import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./History.css";

import {
    getAnalysisRoute,
    loadAnalyses,
    type AnalysisRow,
} from "./historyStorage";

function History() {
    const navigate = useNavigate();
    const location = useLocation();

    /* =====================================================
       STATE
    ===================================================== */

    const [search, setSearch] = useState("");

    const [analyses, setAnalyses] = useState<AnalysisRow[]>([]);

    /* =====================================================
       LOAD SAVED ANALYSES
       
       Only real saved analyses are displayed.
       The old demo/default rows are ignored.
    ===================================================== */

    useEffect(() => {
        const reload = () => {
            const allAnalyses = loadAnalyses();

            // Show only analyses actually saved by the user.
            const savedAnalyses = allAnalyses.filter(
                (analysis) => analysis.savedData
            );

            setAnalyses(savedAnalyses);
        };

        reload();

        // Reload when returning to this page.
        window.addEventListener("focus", reload);

        return () => {
            window.removeEventListener("focus", reload);
        };
    }, []);

    /* =====================================================
       PENDING FILTER
    ===================================================== */

    const showPendingOnly =
        new URLSearchParams(location.search).get("filter") === "pending";

    /* =====================================================
       SEARCH + STATUS FILTER
    ===================================================== */

    const filteredAnalyses = useMemo(() => {
        const searchText = search.toLowerCase().trim();

        return analyses.filter((analysis) => {
            const matchesSearch = analysis.patient
                .toLowerCase()
                .includes(searchText);

            const matchesStatus =
                !showPendingOnly ||
                analysis.status === "Pending Review";

            return matchesSearch && matchesStatus;
        });
    }, [analyses, search, showPendingOnly]);

    /* =====================================================
       OPEN ANALYSIS
    ===================================================== */

    const openAnalysis = (analysis: AnalysisRow) => {
        const route = getAnalysisRoute(analysis);

        navigate(
            route.path,
            route.state
                ? {
                    state: route.state,
                }
                : undefined
        );
    };

    /* =====================================================
       RENDER
    ===================================================== */

    return (
        <div className="history-page">

            {/* =================================================
                SIDEBAR
            ================================================= */}

            <aside className="history-sidebar">

                <div className="history-brand">

                    <div className="history-logo">
                        NI
                    </div>

                    <div>
                        <strong>NOTE INSIGHT</strong>
                        <small>Clinical AI</small>
                    </div>

                </div>

                <nav className="history-nav">

                    <button
                        type="button"
                        onClick={() => navigate("/dashboard")}
                    >
                        <span>⌂</span>
                        Dashboard
                    </button>

                    <button
                        type="button"
                        onClick={() => navigate("/new-analysis")}
                    >
                        <span>＋</span>
                        New Analysis
                    </button>

                    <button
                        type="button"
                        className="history-nav-active"
                    >
                        <span>◷</span>
                        History
                    </button>

                    <button
                        type="button"
                        onClick={() => navigate("/patients")}
                    >
                        <span>♧</span>
                        Patients
                    </button>

                    <button
                        type="button"
                        onClick={() => navigate("/settings")}
                    >
                        <span>⚙</span>
                        Settings
                    </button>

                </nav>

                <div className="history-sidebar-bottom">

                    <div className="history-private">

                        <span>✓</span>

                        <div>
                            <strong>Private Workspace</strong>
                            <small>Your data is protected</small>
                        </div>

                    </div>

                    <button
                        type="button"
                        onClick={() => navigate("/login")}
                    >
                        ↪ Sign out
                    </button>

                </div>

            </aside>

            {/* =================================================
                MAIN
            ================================================= */}

            <main className="history-main">

                {/* =================================================
                    HEADER
                ================================================= */}

                <header className="history-header">

                    <div>

                        <p className="history-eyebrow">
                            CLINICAL WORKSPACE
                        </p>

                        <h1>
                            Analysis History
                        </h1>

                        <p>
                            Review your previous clinical analyses.
                        </p>

                    </div>

                    <button
                        type="button"
                        className="history-new-button"
                        onClick={() => navigate("/new-analysis")}
                    >
                        ＋ New Analysis
                    </button>

                </header>

                {/* =================================================
                    FILTER BAR
                ================================================= */}

                <section className="history-toolbar">

                    <div className="history-search">

                        <span>⌕</span>

                        <input
                            type="text"
                            placeholder="Search patient ID..."
                            value={search}
                            onChange={(event) =>
                                setSearch(event.target.value)
                            }
                        />

                    </div>

                    <button
                        type="button"
                        className={
                            showPendingOnly
                                ? "history-filter active"
                                : "history-filter"
                        }
                        onClick={() =>
                            navigate(
                                showPendingOnly
                                    ? "/history"
                                    : "/history?filter=pending"
                            )
                        }
                    >
                        ◷ Pending Review
                    </button>

                </section>

                {/* =================================================
                    HISTORY TABLE
                ================================================= */}

                <section className="history-card">

                    <div className="history-card-header">

                        <div>

                            <h2>
                                Previous Analyses
                            </h2>

                            <p>
                                {filteredAnalyses.length} analyses found
                            </p>

                        </div>

                    </div>

                    <div className="history-table">

                        {/* TABLE HEADER */}

                        <div className="history-table-header">

                            <span>
                                Patient
                            </span>

                            <span>
                                Visit Date
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

                            <span />

                        </div>

                        {/* =================================================
                            SAVED ANALYSES
                        ================================================= */}

                        {filteredAnalyses.map((analysis) => (

                            <button
                                type="button"
                                className="history-row"
                                key={analysis.id}
                                onClick={() =>
                                    openAnalysis(analysis)
                                }
                            >

                                {/* PATIENT */}

                                <div className="history-patient">

                                    <div className="history-avatar">
                                        {analysis.patient.slice(-2)}
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

                                <span>
                                    {analysis.date}
                                </span>

                                {/* CONDITIONS */}

                                <span>
                                    {analysis.conditions}
                                </span>

                                {/* DOCUMENTATION */}

                                <span
                                    className={
                                        analysis.documentation === "Good"
                                            ? "history-good"
                                            : "history-gaps"
                                    }
                                >

                                    <i />

                                    {analysis.documentation === "Good"
                                        ? "Good"
                                        : `${analysis.gapCount ?? 0} gaps`
                                    }

                                </span>

                                {/* STATUS */}

                                <span
                                    className={
                                        analysis.status === "Reviewed"
                                            ? "history-reviewed"
                                            : "history-pending"
                                    }
                                >

                                    <i />

                                    {analysis.status}

                                </span>

                                {/* ARROW */}

                                <span className="history-arrow">
                                    →
                                </span>

                            </button>

                        ))}

                        {/* =================================================
                            EMPTY STATE
                        ================================================= */}

                        {filteredAnalyses.length === 0 && (

                            <div className="history-empty">

                                {search.trim()
                                    ? "No analyses match your search."
                                    : showPendingOnly
                                        ? "No pending analyses found."
                                        : "No analyses found. Create a new analysis to see it here."
                                }

                            </div>

                        )}

                    </div>

                </section>

            </main>

        </div>
    );
}

export default History;