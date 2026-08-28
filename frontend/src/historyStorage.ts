/* =========================================================
   SHARED HISTORY / PATIENT STORAGE
   ========================================================= */

export type ConditionStatus =
    | "Well documented"
    | "Ambiguous"
    | "No assessment / plan";

export type SavedCondition = {
    id: number;
    name: string;
    confidence: number;
    status: ConditionStatus;
    code: string;
    evidence: string;
};

export type SavedAnalysis = {
    id: string;
    patient: string;
    date: string;
    note: string;
    conditions: SavedCondition[];
    gaps: string[];
    summary: string;
    status?: "Reviewed" | "Pending Review";
    savedAt?: string;
};

export type AnalysisRow = {
    id: string | number;
    patient: string;
    date: string;
    conditions: number;
    documentation: "Good" | "gaps";
    gapCount?: number;
    status: "Reviewed" | "Pending Review";
    savedData?: SavedAnalysis;
};

export const HISTORY_STORAGE_KEY = "noteInsightHistory";


/* =========================================================
   LOAD SAVED ANALYSES
   ========================================================= */

export function loadAnalyses(): AnalysisRow[] {
    try {
        const stored = localStorage.getItem(HISTORY_STORAGE_KEY);

        if (!stored) {
            return [];
        }

        const saved = JSON.parse(stored);

        if (!Array.isArray(saved)) {
            return [];
        }

        return saved.map(
            (item: SavedAnalysis, index: number) => {

                const conditions =
                    Array.isArray(item.conditions)
                        ? item.conditions
                        : [];

                const gaps =
                    Array.isArray(item.gaps)
                        ? item.gaps
                        : [];

                const id =
                    item.id ||
                    `analysis-${index}`;

                const savedData: SavedAnalysis = {
                    ...item,
                    id: String(id),
                    conditions,
                    gaps,
                };

                return {
                    id: String(id),

                    patient:
                        item.patient ||
                        "Unknown patient",

                    date:
                        item.date ||
                        "Unknown date",

                    conditions:
                        conditions.length,

                    documentation:
                        gaps.length > 0
                            ? "gaps"
                            : "Good",

                    gapCount:
                        gaps.length > 0
                            ? gaps.length
                            : undefined,

                    status:
                        item.status === "Reviewed"
                            ? "Reviewed"
                            : "Pending Review",

                    savedData,
                };
            }
        );

    } catch (error) {

        console.error(
            "Failed to load history:",
            error
        );

        return [];
    }
}


/* =========================================================
   SAVE ANALYSIS
   ========================================================= */

export function saveAnalysis(
    analysis: SavedAnalysis
): void {

    try {

        const existing =
            localStorage.getItem(
                HISTORY_STORAGE_KEY
            );

        let analyses: SavedAnalysis[] = [];

        if (existing) {

            const parsed =
                JSON.parse(existing);

            if (Array.isArray(parsed)) {
                analyses = parsed;
            }
        }

        analyses.unshift({
            ...analysis,
            id: String(analysis.id),
            savedAt:
                analysis.savedAt ||
                new Date().toISOString(),
        });

        localStorage.setItem(
            HISTORY_STORAGE_KEY,
            JSON.stringify(analyses)
        );

        console.log(
            "Analysis saved successfully"
        );

    } catch (error) {

        console.error(
            "Failed to save analysis:",
            error
        );
    }
}


/* =========================================================
   DELETE ALL HISTORY
   ========================================================= */

export function clearHistory(): void {

    localStorage.removeItem(
        HISTORY_STORAGE_KEY
    );
}


/* =========================================================
   ANALYSIS ROUTING
   ========================================================= */

export function getAnalysisRoute(
    analysis: AnalysisRow
): {
    path: string;
    state?: {
        savedAnalysis: SavedAnalysis;
    };
} {

    if (analysis.savedData) {

        return {
            path: "/analysis-review",

            state: {
                savedAnalysis:
                    analysis.savedData,
            },
        };
    }

    return {
        path:
            `/analysis/${analysis.id}`,
    };
}


/* =========================================================
   PATIENT DEMOGRAPHICS
   ========================================================= */

export type PatientDemographics = {
    pseudonym: string;
    age?: number;
    sex?: "Male" | "Female" | "Other";
    contact?: string;
    mrn?: string;
};


/* =========================================================
   PATIENT SUMMARY
   ========================================================= */

export type PatientSummary =
    PatientDemographics & {
        visitCount: number;
        lastVisitDate: string;
        latestStatus:
        | "Reviewed"
        | "Pending Review";
        visits: AnalysisRow[];
    };


/* =========================================================
   GET ALL PATIENTS
   ========================================================= */

export function getPatients(): PatientSummary[] {

    const analyses =
        loadAnalyses();

    const byPatient =
        new Map<string, AnalysisRow[]>();

    for (const row of analyses) {

        const existing =
            byPatient.get(row.patient) ?? [];

        existing.push(row);

        byPatient.set(
            row.patient,
            existing
        );
    }

    const summaries:
        PatientSummary[] = [];

    for (
        const [pseudonym, visits]
        of byPatient
    ) {

        summaries.push({

            pseudonym,

            visitCount:
                visits.length,

            lastVisitDate:
                visits[0]?.date ?? "—",

            latestStatus:
                visits[0]?.status ??
                "Pending Review",

            visits,
        });
    }

    return summaries;
}


/* =========================================================
   GET ONE PATIENT
   ========================================================= */

export function getPatientByPseudonym(
    pseudonym: string
): PatientSummary | undefined {

    return getPatients().find(
        (patient) =>
            patient.pseudonym === pseudonym
    );
}