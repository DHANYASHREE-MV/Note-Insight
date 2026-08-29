import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAuth } from "firebase/auth";
import "./NewAnalysis.css";

interface NewAnalysisProps {
    onClose: () => void;
}

/*
 * Backend URL
 *
 * In Vercel, add:
 *
 * VITE_API_URL=https://YOUR-RENDER-BACKEND.onrender.com
 *
 * The fallback below is useful while testing.
 */

const API_URL =
    import.meta.env.VITE_API_URL ||
    "https://YOUR-RENDER-BACKEND.onrender.com";


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

            setError(
                "Please enter a patient ID."
            );

            return;
        }


        if (!visitDate) {

            setError(
                "Please select a visit date."
            );

            return;
        }


        if (!clinicalNote.trim()) {

            setError(
                "Please enter the clinical note."
            );

            return;
        }


        const wordCount =
            clinicalNote
                .trim()
                .split(/\s+/)
                .length;


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

            const currentUser =
                auth.currentUser;


            if (!currentUser) {

                setError(
                    "Please log in before creating an analysis."
                );

                return;
            }


            // -----------------------------------------
            // GET FIREBASE ID TOKEN
            // -----------------------------------------

            const idToken =
                await currentUser.getIdToken();


            // -----------------------------------------
            // BACKEND URL
            // -----------------------------------------

            const backendUrl =
                `${API_URL.replace(/\/$/, "")}/api/notes`;


            console.log(
                "Sending analysis request to:",
                backendUrl
            );


            // -----------------------------------------
            // SEND NOTE + AUTH TOKEN
            // -----------------------------------------

            const response =
                await fetch(
                    backendUrl,
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json",

                            "Authorization":
                                `Bearer ${idToken}`,
                        },

                        body: JSON.stringify({
                            note:
                                clinicalNote.trim(),
                        }),
                    }
                );


            // -----------------------------------------
            // BACKEND ERROR
            // -----------------------------------------

            if (!response.ok) {

                let errorMessage =
                    "Unable to analyze the clinical note.";


                try {

                    const errorData =
                        await response.json();


                    if (errorData.detail) {

                        errorMessage =
                            errorData.detail;
                    }

                } catch {

                    // Keep default error
                }


                throw new Error(
                    errorMessage
                );
            }


            // -----------------------------------------
            // ANALYSIS RESULT
            // -----------------------------------------

            const data =
                await response.json();


            console.log(
                "Gemini analysis result:",
                data
            );


            // -----------------------------------------
            // CHECK ANALYSIS
            // -----------------------------------------

            if (!data.analysis) {

                throw new Error(
                    "The backend returned no analysis result."
                );
            }


            // -----------------------------------------
            // SAVE ANALYSIS RESULT
            // -----------------------------------------

            sessionStorage.setItem(
                "analysisResult",
                JSON.stringify(
                    data.analysis
                )
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


            // -----------------------------------------
            // CLOSE MODAL
            // -----------------------------------------

            onClose();


            // -----------------------------------------
            // GO TO REVIEW PAGE
            // -----------------------------------------

            navigate(
                "/analysis-review",
                {
                    state: {
                        patientId:
                            patientId.trim(),

                        visitDate,

                        clinicalNote:
                            clinicalNote.trim(),

                        analysis:
                            data.analysis,
                    },
                }
            );


        } catch (err) {

            console.error(
                "Analysis error:",
                err
            );


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
                onClick={
                    loading
                        ? undefined
                        : onClose
                }
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


                {/* HEADER */}

                <div className="new-analysis-header">

                    <h2>
                        New Analysis
                    </h2>

                    <p>
                        Enter the patient information
                        and clinical note to begin
                        analysis.
                    </p>

                </div>


                {/* FORM */}

                <div className="new-analysis-form">


                    {/* PATIENT ID */}

                    <div className="new-analysis-field">

                        <label htmlFor="patient-id">
                            Patient ID
                        </label>

                        <input
                            id="patient-id"
                            type="text"
                            value={patientId}
                            onChange={(e) =>
                                setPatientId(
                                    e.target.value
                                )
                            }
                            placeholder="Enter patient ID"
                            disabled={loading}
                        />

                    </div>


                    {/* VISIT DATE */}

                    <div className="new-analysis-field">

                        <label htmlFor="visit-date">
                            Visit Date
                        </label>

                        <input
                            id="visit-date"
                            type="date"
                            value={visitDate}
                            onChange={(e) =>
                                setVisitDate(
                                    e.target.value
                                )
                            }
                            disabled={loading}
                        />

                    </div>


                    {/* CLINICAL NOTE */}

                    <div className="new-analysis-field">

                        <label htmlFor="clinical-note">
                            Clinical Note
                        </label>

                        <textarea
                            id="clinical-note"
                            value={clinicalNote}
                            onChange={(e) =>
                                setClinicalNote(
                                    e.target.value
                                )
                            }
                            placeholder="Enter the clinical note..."
                            rows={12}
                            disabled={loading}
                        />

                        <div className="word-count">

                            {
                                clinicalNote
                                    .trim()
                                    ? clinicalNote
                                        .trim()
                                        .split(/\s+/)
                                        .length
                                    : 0
                            }

                            {" "}words

                            {" • "}

                            Minimum 100 words

                        </div>

                    </div>


                    {/* ERROR */}

                    {error && (

                        <div
                            className="new-analysis-error"
                            role="alert"
                        >
                            {error}
                        </div>

                    )}


                    {/* BUTTON */}

                    <button
                        type="button"
                        className="new-analysis-submit"
                        onClick={
                            handleCreateAnalysis
                        }
                        disabled={loading}
                    >

                        {loading
                            ? "Analyzing..."
                            : "Analyze Note"
                        }

                    </button>

                </div>

            </div>

        </div>
    );
}


export default NewAnalysis;