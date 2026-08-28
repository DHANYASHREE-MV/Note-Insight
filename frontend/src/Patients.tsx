import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
// @ts-ignore CSS is handled by the bundler and has no TypeScript declarations.
import "./History.css";
// @ts-ignore CSS is handled by the bundler and has no TypeScript declarations.
import "./Patients.css";
import { getPatients, type PatientSummary } from "./historyStorage";


function Patients() {

    const navigate = useNavigate();

    const [search, setSearch] = useState("");
    const [patients, setPatients] = useState<PatientSummary[]>([]);


    useEffect(() => {
        const reload = () => setPatients(getPatients());

        reload();

        // Pick up newly saved analyses when the user returns to this tab.
        window.addEventListener("focus", reload);

        return () => {
            window.removeEventListener("focus", reload);
        };
    }, []);


    const filtered = useMemo(() => {
        return patients.filter((patient) =>
            patient.pseudonym.toLowerCase().includes(search.toLowerCase())
        );
    }, [patients, search]);


    return (
        <div className="history-page">


            {/* =================================================
                SIDEBAR
            ================================================= */}

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


            {/* =================================================
                MAIN
            ================================================= */}

            <main className="history-main">

                <header className="history-header">
                    <div>
                        <p className="history-eyebrow">CLINICAL WORKSPACE</p>
                        <h1>Patients</h1>
                        <p>Grouped from your analyzed notes, by patient pseudonym.</p>
                    </div>
                </header>


                <section className="history-toolbar">
                    <div className="history-search">
                        <span>⌕</span>
                        <input
                            type="text"
                            placeholder="Search patient ID..."
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                        />
                    </div>
                </section>


                {filtered.length === 0 ? (

                    <div className="history-card">
                        <div className="history-empty">No patients found.</div>
                    </div>

                ) : (

                    <section className="patients-grid">

                        {filtered.map((patient) => (

                            <button
                                type="button"
                                key={patient.pseudonym}
                                className="patient-card"
                                onClick={() =>
                                    navigate(`/patients/${encodeURIComponent(patient.pseudonym)}`)
                                }
                            >

                                <div className="history-avatar">
                                    {patient.pseudonym.slice(-2)}
                                </div>

                                <div className="patient-card-body">
                                    <strong>{patient.pseudonym}</strong>
                                    <span className="patient-card-meta">
                                        {patient.age ? `${patient.age} yrs · ` : ""}
                                        {patient.sex ? `${patient.sex} · ` : ""}
                                        MRN {patient.mrn ?? "Not on file"}
                                    </span>
                                    <span className="patient-card-contact">
                                        {patient.contact ?? "Contact not on file"}
                                    </span>
                                </div>

                                <div className="patient-card-stats">
                                    <span>
                                        {patient.visitCount} visit{patient.visitCount !== 1 ? "s" : ""}
                                    </span>
                                    <span
                                        className={
                                            patient.latestStatus === "Reviewed"
                                                ? "history-reviewed"
                                                : "history-pending"
                                        }
                                    >
                                        <i />
                                        {patient.latestStatus}
                                    </span>
                                </div>

                                <span className="history-arrow">→</span>

                            </button>

                        ))}

                    </section>

                )}

            </main>

        </div>
    );
}

export default Patients;