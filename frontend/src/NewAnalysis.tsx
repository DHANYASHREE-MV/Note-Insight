import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAuth } from "firebase/auth";
import "./NewAnalysis.css";

interface NewAnalysisProps {
    onClose: () => void;
}

function NewAnalysis({ onClose }: NewAnalysisProps) {
    const navigate = useNavigate();

    const [patientId, setPatientId] = useState("");
    const [visitDate, setVisitDate] = useState("");
    const [clinicalNote, setClinicalNote] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleCreateAnalysis = async () => {
        setError("");

        // -----------------------------------------
        // VALIDATION
        // -----------------------------------------

        if (!patientId.trim()) {
            setError("Please enter a patient ID.");
            return;
        }

        if (!visitDate) {
            setError("Please select a visit date.");
            return;
        }

        if (!clinicalNote.trim()) {
            setError("Please enter the clinical note.");
            return;
        }

        const wordCount = clinicalNote.trim().split(/\s+/).length;

        if (wordCount < 100) {
            setError(
                `Clinical note must contain at least 100 words. Current count: ${wordCount}`
            );
            return;
        }

        if (wordCount > 3000) {
            setError(
                `Clinical note must not exceed 3000 words. Current count: ${wordCount}`
            );
            return;
        }

        // -----------------------------------------
        // START ANALYSIS
        // -----------------------------------------

        try {
            setLoading(true);

            // -----------------------------------------
            // GET CURRENT FIREBASE USER
            // -----------------------------------------

            const auth = getAuth();
            const currentUser = auth.currentUser;

            if (!currentUser) {
                setError("Please log in before creating an analysis.");
                return;
            }

            // -----------------------------------------
            // GET FIREBASE ID TOKEN
            // -----------------------------------------

            const idToken = await currentUser.getIdToken();

            // -----------------------------------------
            // SEND NOTE + AUTH TOKEN TO BACKEND
            // -----------------------------------------

            const response = await fetch(
                "http://127.0.0.1:8000/api/notes",
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${idToken}`,
                    },

                    body: JSON.stringify({
                        note: clinicalNote.trim(),
                    }),
                }
            );

            // -------------------------------------
            // BACKEND ERROR
            // -------------------------------------

            if (!response.ok) {
                let errorMessage =
                    "Unable to analyze the clinical note.";

                try {
                    const errorData = await response.json();

                    if (errorData.detail) {
                        errorMessage = errorData.detail;
                    }
                } catch {
                    // Keep default error message
                }

                throw new Error(errorMessage);
            }

            // -------------------------------------
            // ANALYSIS RESULT
            // -------------------------------------

            const data = await response.json();

            console.log("Gemini analysis result:", data);

            // -------------------------------------
            // SAVE ANALYSIS RESULT
            // -------------------------------------

            sessionStorage.setItem(
                "analysisResult",
                JSON.stringify(data.analysis)
            );

            sessionStorage.setItem(
                "clinicalNote",
                clinicalNote.trim()
            );

            sessionStorage.setItem(
                "patientId",
                patientId.trim()
            );

            sessionStorage.setItem(
                "visitDate",
                visitDate
            );

            // -------------------------------------
            // CLOSE MODAL
            // -------------------------------------

            onClose();

            // -------------------------------------
            // GO TO REVIEW PAGE
            // -------------------------------------

            navigate("/analysis-review", {
                state: {
                    patientId: patientId.trim(),
                    visitDate,
                    clinicalNote: clinicalNote.trim(),
                    analysis: data.analysis,
                },
            });

        } catch (err) {
            console.error("Analysis error:", err);

            setError(
                err instanceof Error
                    ? err.message
                    : "Something went wrong while analyzing the note."
            );

        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="new-analysis-overlay">

            {/* BACKGROUND OVERLAY */}

            <div
                className="new-analysis-backdrop"
                onClick={loading ? undefined : onClose}
            />

            {/* MODAL */}

            <div className="new-analysis-modal">

                {/* CLOSE BUTTON */}

                <button
                    type="button"
                    className="new-analysis-close"
                    onClick={onClose}
                    aria-label="Close"
                    disabled={loading}
                >
                    ×
                </button>

                {/* MODAL HEADER */}

                <div className="new-analysis-modal-header">

                    <p className="new-analysis-eyebrow">
                        CLINICAL WORKSPACE
                    </p>

                    <h1>
                        New note
                    </h1>

                    <p className="new-analysis-description">
                        Paste the free-text note. No real patient identifiers —
                        use a pseudonym or internal ID.
                    </p>

                </div>

                {/* FORM */}

                <div className="new-analysis-form">

                    {/* PATIENT + DATE */}

                    <div className="new-analysis-fields">

                        <div className="new-analysis-field">

                            <label htmlFor="patientId">
                                Patient pseudonym / internal ID
                            </label>

                            <input
                                id="patientId"
                                type="text"
                                value={patientId}
                                placeholder="PT-1042"
                                disabled={loading}
                                onChange={(e) => {
                                    setPatientId(e.target.value);
                                    setError("");
                                }}
                            />

                        </div>

                        <div className="new-analysis-field">

                            <label htmlFor="visitDate">
                                Visit date
                            </label>

                            <input
                                id="visitDate"
                                type="date"
                                value={visitDate}
                                disabled={loading}
                                onChange={(e) => {
                                    setVisitDate(e.target.value);
                                    setError("");
                                }}
                            />

                        </div>

                    </div>

                    {/* CLINICAL NOTE */}

                    <div className="new-analysis-note-field">

                        <label htmlFor="clinicalNote">
                            Clinical note
                        </label>

                        <textarea
                            id="clinicalNote"
                            value={clinicalNote}
                            maxLength={10000}
                            disabled={loading}
                            placeholder="Paste or type the clinical note here..."
                            onChange={(e) => {
                                setClinicalNote(e.target.value);
                                setError("");
                            }}
                        />

                        <div className="new-analysis-note-footer">

                            <span>
                                {clinicalNote.trim()
                                    ? clinicalNote.trim().split(/\s+/).length
                                    : 0}{" "}
                                words
                            </span>

                            <span>
                                {clinicalNote.length}/10000
                            </span>

                        </div>

                    </div>

                    {/* ERROR */}

                    {error && (
                        <div className="new-analysis-error">

                            <span>!</span>

                            {error}

                        </div>
                    )}

                    {/* ACTIONS */}

                    <div className="new-analysis-actions">

                        <button
                            type="button"
                            className="new-analysis-cancel"
                            onClick={onClose}
                            disabled={loading}
                        >
                            Cancel
                        </button>

                        <button
                            type="button"
                            className="new-analysis-submit"
                            onClick={handleCreateAnalysis}
                            disabled={loading}
                        >

                            {loading ? (
                                <>
                                    <span>⏳</span>
                                    Analyzing...
                                </>
                            ) : (
                                <>
                                    <span>✧</span>
                                    Analyze note
                                </>
                            )}

                        </button>

                    </div>

                </div>

            </div>

        </div>
    );
}

export default NewAnalysis;