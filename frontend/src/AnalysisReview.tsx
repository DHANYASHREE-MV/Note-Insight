import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./AnalysisReview.css";

type Condition = {
    id: number;
    name: string;
    confidence: number;
    status:
    | "Well documented"
    | "Ambiguous"
    | "No assessment / plan";
    code: string;
    evidence: string;
};

type AnalysisData = {
    id: string;
    patient: string;
    date: string;
    note: string;
    conditions: Condition[];
    gaps: string[];
    summary: string;
};

type LocationState = {
    patientId?: string;
    visitDate?: string;
    clinicalNote?: string;
    analysis?: any;
};

const STATUS_CLASS: Record<Condition["status"], string> = {
    "Well documented": "status-good",
    Ambiguous: "status-warning",
    "No assessment / plan": "status-danger",
};

function AnalysisReview() {
    const navigate = useNavigate();
    const location = useLocation();

    const state = (location.state || {}) as LocationState;

    const [analysis, setAnalysis] =
        useState<AnalysisData | null>(null);

    const [conditions, setConditions] =
        useState<Condition[]>([]);

    const [showOriginal, setShowOriginal] =
        useState(true);

    const [loading, setLoading] =
        useState(true);

    const [saving, setSaving] =
        useState(false);

    const [saved, setSaved] =
        useState(false);

    const [error, setError] =
        useState("");

    /* ============================================================
       FORMAT DATE
    ============================================================ */

    const formatDate = (date: string) => {
        if (!date) return "";

        const parsed = new Date(date);

        if (Number.isNaN(parsed.getTime())) {
            return date;
        }

        return parsed.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
        });
    };

    /* ============================================================
       NORMALIZE ANALYSIS RESPONSE
    ============================================================ */

    const normalizeGeminiResponse = (
        responseData: any
    ): AnalysisData => {
        const raw =
            responseData?.analysis ||
            responseData?.data ||
            responseData;

        const rawConditions =
            Array.isArray(raw?.conditions)
                ? raw.conditions
                : [];

        const normalizedConditions: Condition[] =
            rawConditions.map(
                (condition: any, index: number) => {

                    /*
                     * Backend uses:
                     * documentation_status
                     *
                     * Older frontend used:
                     * status
                     */

                    const rawStatus =
                        condition?.documentation_status ||
                        condition?.status ||
                        "";

                    const statusText =
                        String(rawStatus).toLowerCase();

                    let status: Condition["status"] =
                        "Ambiguous";

                    if (
                        statusText.includes("well")
                    ) {
                        status =
                            "Well documented";
                    } else if (
                        statusText.includes("poor") ||
                        statusText.includes("assessment") ||
                        statusText.includes("plan")
                    ) {
                        status =
                            "No assessment / plan";
                    }

                    /*
                     * Backend returns confidence as:
                     * 0 - 100
                     *
                     * Some older responses may return:
                     * 0 - 1
                     */

                    const rawConfidence =
                        Number(
                            condition?.confidence ??
                            condition?.confidence_score ??
                            0
                        );

                    const confidence =
                        rawConfidence > 0 &&
                            rawConfidence <= 1
                            ? Math.round(
                                rawConfidence * 100
                            )
                            : Math.round(
                                rawConfidence
                            );

                    return {
                        id:
                            Number(condition?.id) ||
                            index + 1,

                        name:
                            condition?.name ||
                            condition?.condition ||
                            "Unknown condition",

                        confidence,

                        status,

                        code:
                            condition?.icd10_code ||
                            condition?.code ||
                            condition?.icd_10_code ||
                            "N/A",

                        evidence:
                            condition?.evidence ||
                            condition?.evidence_quote ||
                            "",
                    };
                }
            );

        /*
         * Backend uses:
         * documentation_gaps
         *
         * Older frontend used:
         * gaps
         */

        const rawGaps =
            Array.isArray(raw?.documentation_gaps)
                ? raw.documentation_gaps
                : Array.isArray(raw?.gaps)
                    ? raw.gaps
                    : [];

        const gaps = rawGaps.map(
            (gap: any) => {

                if (typeof gap === "string") {
                    return gap;
                }

                if (
                    gap?.issue &&
                    gap?.recommendation
                ) {
                    return `${gap.issue} — ${gap.recommendation}`;
                }

                return (
                    gap?.issue ||
                    gap?.description ||
                    gap?.observation ||
                    gap?.recommendation ||
                    String(gap)
                );
            }
        );

        return {
            id:
                responseData?.analysis_id ||
                responseData?.id ||
                `analysis-${Date.now()}`,

            patient:
                state.patientId ||
                responseData?.patient ||
                "Unknown patient",

            date:
                formatDate(
                    state.visitDate || ""
                ) ||
                responseData?.date ||
                "",

            note:
                state.clinicalNote ||
                responseData?.note ||
                "",

            conditions:
                normalizedConditions,

            gaps,

            summary:
                raw?.summary ||
                raw?.overall_review ||
                "Analysis completed successfully.",
        };
    };

    /* ============================================================
       LOAD EXISTING ANALYSIS

       IMPORTANT:
       We DO NOT call /api/notes here.

       NewAnalysis.tsx has already called the backend and
       generated the analysis.
    ============================================================ */

    useEffect(() => {
        let cancelled = false;

        const loadAnalysis = () => {
            setLoading(true);
            setError("");

            try {
                /*
                 * FIRST:
                 * Use analysis passed from NewAnalysis.tsx.
                 */

                if (state.analysis) {
                    const normalized =
                        normalizeGeminiResponse(
                            state.analysis
                        );

                    if (cancelled) return;

                    setAnalysis(normalized);
                    setConditions(
                        normalized.conditions
                    );

                    setLoading(false);
                    return;
                }

                /*
                 * SECOND:
                 * Try sessionStorage as a fallback.
                 */

                const storedAnalysis =
                    sessionStorage.getItem(
                        "analysisResult"
                    );

                const storedNote =
                    sessionStorage.getItem(
                        "clinicalNote"
                    );

                const storedPatient =
                    sessionStorage.getItem(
                        "patientId"
                    );

                const storedDate =
                    sessionStorage.getItem(
                        "visitDate"
                    );

                if (storedAnalysis) {
                    const parsedAnalysis =
                        JSON.parse(
                            storedAnalysis
                        );

                    const fallbackState = {
                        patientId:
                            state.patientId ||
                            storedPatient ||
                            "",

                        visitDate:
                            state.visitDate ||
                            storedDate ||
                            "",

                        clinicalNote:
                            state.clinicalNote ||
                            storedNote ||
                            "",

                        analysis:
                            parsedAnalysis,
                    };

                    /*
                     * Temporarily use the fallback
                     * information while normalizing.
                     */

                    const previousState =
                        state;

                    Object.assign(
                        previousState,
                        fallbackState
                    );

                    const normalized =
                        normalizeGeminiResponse(
                            parsedAnalysis
                        );

                    if (cancelled) return;

                    setAnalysis(normalized);
                    setConditions(
                        normalized.conditions
                    );

                    setLoading(false);
                    return;
                }

                /*
                 * Nothing available.
                 */

                setError(
                    "No analysis result was found."
                );

                setLoading(false);

            } catch (err) {
                if (cancelled) return;

                console.error(
                    "Failed to load analysis:",
                    err
                );

                setError(
                    err instanceof Error
                        ? err.message
                        : "Unable to load analysis."
                );

                setLoading(false);
            }
        };

        loadAnalysis();

        return () => {
            cancelled = true;
        };
    }, []);

    /* ============================================================
       HIGHLIGHT EVIDENCE IN ORIGINAL NOTE
    ============================================================ */

    const highlightedNote = useMemo(() => {
        if (!analysis) return [];

        const note = analysis.note;

        if (!note) {
            return [];
        }

        const matches: {
            start: number;
            end: number;
            statusClass: string;
        }[] = [];

        conditions.forEach((condition) => {
            if (!condition.evidence) return;

            const index =
                note
                    .toLowerCase()
                    .indexOf(
                        condition.evidence.toLowerCase()
                    );

            if (index !== -1) {
                matches.push({
                    start: index,

                    end:
                        index +
                        condition.evidence.length,

                    statusClass:
                        STATUS_CLASS[
                        condition.status
                        ],
                });
            }
        });

        if (matches.length === 0) {
            return [
                {
                    text: note,
                    statusClass: "",
                },
            ];
        }

        matches.sort(
            (a, b) =>
                a.start - b.start
        );

        const segments: {
            text: string;
            statusClass: string;
        }[] = [];

        let currentIndex = 0;

        matches.forEach((match) => {
            if (
                match.start <
                currentIndex
            ) {
                return;
            }

            if (
                match.start >
                currentIndex
            ) {
                segments.push({
                    text: note.slice(
                        currentIndex,
                        match.start
                    ),
                    statusClass: "",
                });
            }

            segments.push({
                text: note.slice(
                    match.start,
                    match.end
                ),

                statusClass:
                    match.statusClass,
            });

            currentIndex =
                match.end;
        });

        if (
            currentIndex <
            note.length
        ) {
            segments.push({
                text: note.slice(
                    currentIndex
                ),
                statusClass: "",
            });
        }

        return segments;
    }, [analysis, conditions]);

    /* ============================================================
       REJECT CONDITION
    ============================================================ */

    const rejectCondition = (
        conditionId: number
    ) => {
        setConditions((current) =>
            current.filter(
                (condition) =>
                    condition.id !==
                    conditionId
            )
        );
    };

    /* ============================================================
       SAVE REVIEWED ANALYSIS

       This is still localStorage for now.
       We will connect this to Firestore after the
       database is created and user isolation is finished.
    ============================================================ */

    const saveReview = () => {
        if (!analysis) return;

        setSaving(true);
        setError("");

        try {
            const reviewedAnalysis = {
                ...analysis,

                conditions:
                    conditions,

                status:
                    "Reviewed",

                savedAt:
                    new Date().toISOString(),
            };

            const existing =
                JSON.parse(
                    localStorage.getItem(
                        "noteInsightHistory"
                    ) || "[]"
                );

            const updated = [
                reviewedAnalysis,

                ...existing.filter(
                    (item: any) =>
                        item.id !==
                        reviewedAnalysis.id
                ),
            ];

            localStorage.setItem(
                "noteInsightHistory",
                JSON.stringify(
                    updated
                )
            );

            setSaved(true);

        } catch (err) {
            console.error(
                "Failed to save analysis:",
                err
            );

            setError(
                "Analysis was completed but could not be saved."
            );

        } finally {
            setSaving(false);
        }
    };

    /* ============================================================
       LOADING
    ============================================================ */

    if (loading) {
        return (
            <div className="analysis-review-page">

                <div className="analysis-loading">

                    <div className="analysis-loading-spinner">
                        ✦
                    </div>

                    <h2>
                        Loading analysis...
                    </h2>

                    <p>
                        Your generated clinical
                        documentation review is
                        being prepared.
                    </p>

                </div>

            </div>
        );
    }

    /* ============================================================
       ERROR
    ============================================================ */

    if (error || !analysis) {
        return (
            <div className="analysis-review-page">

                <div className="analysis-error-page">

                    <button
                        type="button"
                        onClick={() =>
                            navigate(
                                "/dashboard"
                            )
                        }
                    >
                        ← Back to dashboard
                    </button>

                    <h1>
                        Analysis failed
                    </h1>

                    <p>
                        {error ||
                            "Unable to load this analysis."}
                    </p>

                    <button
                        type="button"
                        onClick={() =>
                            navigate(-1)
                        }
                    >
                        Go back
                    </button>

                </div>

            </div>
        );
    }

    /* ============================================================
       MAIN REVIEW PAGE
    ============================================================ */

    return (
        <div className="analysis-review-page">

            {/* =================================================
                TOP HEADER
            ================================================= */}

            <header className="review-topbar">

                <button
                    type="button"
                    className="back-history-button"
                    onClick={() =>
                        navigate(
                            "/history"
                        )
                    }
                >
                    ← Back to history
                </button>

                <div className="review-header-actions">

                    <button
                        type="button"
                        className="original-output-button"
                        onClick={() =>
                            setShowOriginal(
                                (current) =>
                                    !current
                            )
                        }
                    >
                        ◉

                        {showOriginal
                            ? " Hide original AI output"
                            : " Show original AI output"}
                    </button>

                    <button
                        type="button"
                        className="save-review-button"
                        onClick={saveReview}
                        disabled={saving}
                    >
                        ✓

                        {saving
                            ? " Saving..."
                            : saved
                                ? " Saved"
                                : " Save reviewed analysis"}
                    </button>

                </div>

            </header>

            {/* =================================================
                PATIENT HEADER
            ================================================= */}

            <section className="review-title">

                <div>

                    <div className="review-patient-title">

                        <h1>
                            {analysis.patient}
                        </h1>

                        <span className="reviewed-badge">
                            {saved
                                ? "Reviewed"
                                : "Pending Review"}
                        </span>

                    </div>

                    <p>
                        Visit {analysis.date}
                        {" · "}
                        {conditions.length}
                        {" conditions"}
                        {" · "}
                        {analysis.gaps.length}
                        {" gaps flagged"}
                    </p>

                </div>

            </section>

            {/* =================================================
                ORIGINAL MODEL OUTPUT
            ================================================= */}

            {showOriginal && (

                <section className="original-ai-output">

                    <strong>
                        ✨ Original model output — unmodified
                    </strong>

                    <div className="original-ai-output-rows">

                        {analysis.conditions.map(
                            (condition) => (

                                <div
                                    className="original-ai-output-row"
                                    key={condition.id}
                                >

                                    <span className="original-ai-output-name">
                                        {condition.name}
                                    </span>

                                    <span
                                        className={
                                            STATUS_CLASS[
                                            condition.status
                                            ]
                                        }
                                    >
                                        {condition.status}
                                    </span>

                                    <span className="code-tag">
                                        {condition.code}
                                    </span>

                                </div>
                            )
                        )}

                    </div>

                    <p>
                        {analysis.summary}
                    </p>

                </section>
            )}

            {/* =================================================
                MAIN TWO COLUMN AREA
            ================================================= */}

            <main className="review-content">

                {/* =================================================
                    ORIGINAL NOTE
                ================================================= */}

                <section className="original-note-card">

                    <div className="review-section-label">
                        ORIGINAL NOTE
                    </div>

                    <div className="note-text">

                        {highlightedNote.map(
                            (
                                segment,
                                index
                            ) =>
                                segment.statusClass ? (
                                    <mark
                                        key={index}
                                        className={`note-highlight ${segment.statusClass}`}
                                    >
                                        {segment.text}
                                    </mark>
                                ) : (
                                    <span
                                        key={index}
                                    >
                                        {
                                            segment.text
                                        }
                                    </span>
                                )
                        )}

                    </div>

                </section>

                {/* =================================================
                    RIGHT SIDE
                ================================================= */}

                <section className="review-right">

                    {/* EXTRACTED CONDITIONS */}

                    <div className="review-section-label">
                        EXTRACTED CONDITIONS
                    </div>

                    <div className="conditions-list">

                        {conditions.length === 0 ? (

                            <div className="no-gaps">
                                No conditions identified.
                            </div>

                        ) : (

                            conditions.map(
                                (condition) => (

                                    <article
                                        className="condition-card"
                                        key={
                                            condition.id
                                        }
                                    >

                                        <div className="condition-header">

                                            <h2>
                                                {
                                                    condition.name
                                                }
                                            </h2>

                                            <span className="confidence">
                                                {
                                                    condition.confidence
                                                }
                                                % conf.
                                            </span>

                                        </div>

                                        <div className="condition-tags">

                                            <span
                                                className={
                                                    STATUS_CLASS[
                                                    condition.status
                                                    ]
                                                }
                                            >
                                                {
                                                    condition.status
                                                }
                                            </span>

                                            <span className="code-tag">
                                                {
                                                    condition.code
                                                }
                                            </span>

                                        </div>

                                        <div className="evidence-box">

                                            <p>
                                                “
                                                {
                                                    condition.evidence
                                                }
                                                ”
                                            </p>

                                        </div>

                                        <div className="condition-actions">

                                            <button
                                                type="button"
                                                className="edit-condition"
                                                onClick={() =>
                                                    alert(
                                                        "Edit condition will be connected next."
                                                    )
                                                }
                                            >
                                                ✎ Edit
                                            </button>

                                            <button
                                                type="button"
                                                className="reject-condition"
                                                onClick={() =>
                                                    rejectCondition(
                                                        condition.id
                                                    )
                                                }
                                            >
                                                × Reject
                                            </button>

                                        </div>

                                    </article>
                                )
                            )
                        )}

                    </div>

                    {/* ADD CONDITION */}

                    <button
                        type="button"
                        className="add-condition-button"
                        onClick={() =>
                            alert(
                                "Add condition form will be connected next."
                            )
                        }
                    >
                        ＋ Add condition missed by AI
                    </button>

                    {/* DOCUMENTATION GAPS */}

                    <section className="review-subsection">

                        <h3>
                            DOCUMENTATION GAPS
                        </h3>

                        {analysis.gaps.length === 0 ? (

                            <div className="no-gaps">
                                ✓ No open gaps.
                            </div>

                        ) : (

                            <ul className="gap-list">

                                {analysis.gaps.map(
                                    (
                                        gap,
                                        index
                                    ) => (

                                        <li
                                            key={
                                                index
                                            }
                                        >
                                            {gap}
                                        </li>

                                    )
                                )}

                            </ul>
                        )}

                    </section>

                    {/* SUMMARY */}

                    <section className="review-subsection">

                        <h3>
                            SUMMARY
                        </h3>

                        <p className="review-summary">
                            {analysis.summary}
                        </p>

                    </section>

                </section>

            </main>

        </div>
    );
}

export default AnalysisReview;