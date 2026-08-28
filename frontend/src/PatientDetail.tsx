import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./History.css";
import "./Patients.css";
import { getAnalysisRoute, getPatientByPseudonym, type PatientSummary } from "./historyStorage";


function PatientDetail() {

    const navigate = useNavigate();
    const { patientId } = useParams();

    const [patient, setPatient] = useState<PatientSummary | undefined>(undefined);
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        setPatient(
            patientId ? getPatientByPseudonym(decodeURIComponent(patientId)) : undefined
        );
        setLoaded(true);
    }, [patientId]);


    const openVisit = (visit: PatientSummary["visits"][number]) => {
        const route = getAnalysisRoute(visit);
        navigate(route.path, route.state ? { state: route.state } : undefined);
    };


    /* =====================================================
       SIDEBAR — same shell as Patients.tsx / History.tsx
    ====================================================== */

    const sidebar = (
        <aside className="history-sidebar">

            <div className="history-brand">
                <div className="history-logo">NI</div>
                <div>
                    <strong>NOTE INSIGHT</strong>
                    <small>Clinical AI</small>
                </div>
            </div>

            <nav className="history-nav">
                <button type="button" onClick={() => navigate("/dashboard")}>
                    <span>⌂</span>
                    Dashboard
                </button>
                <button type="button" onClick={() => navigate("/new-analysis")}>
                    <span>＋</span>
                    New Analysis
                </button>
                <button type="button" onClick={() => navigate("/history")}>
                    <span>◷</span>
                    History
                </button>
                <button type="button" className="history-nav-active">
                    <span>♧</span>
                    Patients
                </button>
                <button type="button" onClick={() => navigate("/settings")}>
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
                <button type="button" onClick={() => navigate("/login")}>
                    ↪ Sign out
                </button>
            </div>

        </aside>
    );


    if (loaded && !patient) {
        return (
            <div className="history-page">
                {sidebar}
                <main className="history-main">
                    <button type="button" className="back-history" onClick={() => navigate("/patients")}>
                        ← Back to patients
                    </button>
                    <div className="history-card">
                        <div className="history-empty">Patient not found.</div>
                    </div>
                </main>
            </div>
        );
    }

    if (!patient) {
        return (
            <div className="history-page">
                {sidebar}
                <main className="history-main" />
            </div>
        );
    }


    return (
        <div className="history-page">

            {sidebar}

            <main className="history-main">

                <button type="button" className="back-history" onClick={() => navigate("/patients")}>
                    ← Back to patients
                </button>

                <section className="patient-detail-header">

                    <div className="history-avatar large">
                        {patient.pseudonym.slice(-2)}
                    </div>

                    <div>
                        <h1>{patient.pseudonym}</h1>
                        <p>
                            {patient.age ? `${patient.age} yrs` : "Age not on file"}
                            {" · "}
                            {patient.sex ?? "Sex not on file"}
                            {" · "}
                            MRN {patient.mrn ?? "Not on file"}
                        </p>
                        <p>{patient.contact ?? "Contact not on file"}</p>
                    </div>

                </section>

                <section className="history-card">

                    <div className="history-card-header">
                        <div>
                            <h2>Visit history</h2>
                            <p>
                                {patient.visitCount} visit{patient.visitCount !== 1 ? "s" : ""}
                            </p>
                        </div>
                    </div>

                    <div className="history-table">

                        <div className="visit-table-header">
                            <span>Visit date</span>
                            <span>Conditions</span>
                            <span>Documentation</span>
                            <span>Status</span>
                            <span />
                        </div>

                        {patient.visits.map((visit) => (

                            <button
                                type="button"
                                key={visit.id}
                                className="visit-row"
                                onClick={() => openVisit(visit)}
                            >

                                <span>{visit.date}</span>

                                <span>{visit.conditions}</span>

                                <span
                                    className={
                                        visit.documentation === "Good" ? "history-good" : "history-gaps"
                                    }
                                >
                                    <i />
                                    {visit.documentation === "Good" ? "Good" : `${visit.gapCount} gaps`}
                                </span>

                                <span
                                    className={
                                        visit.status === "Reviewed" ? "history-reviewed" : "history-pending"
                                    }
                                >
                                    <i />
                                    {visit.status}
                                </span>

                                <span className="history-arrow">→</span>

                            </button>

                        ))}

                    </div>

                </section>

            </main>

        </div>
    );
}

export default PatientDetail;