import os
from typing import List

from fastapi import FastAPI, HTTPException, Header
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from dotenv import load_dotenv
from google import genai
from google.genai import types

import firebase_admin
from firebase_admin import credentials, auth, firestore


# ---------------------------------------------------------
# LOAD ENVIRONMENT VARIABLES
# ---------------------------------------------------------

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

if not GEMINI_API_KEY:
    raise RuntimeError(
        "GEMINI_API_KEY not found. Please add it to backend/.env"
    )


# ---------------------------------------------------------
# FIREBASE ADMIN INITIALIZATION
# ---------------------------------------------------------

FIREBASE_SERVICE_ACCOUNT_PATH = os.getenv(
    "FIREBASE_SERVICE_ACCOUNT_PATH"
)

if not FIREBASE_SERVICE_ACCOUNT_PATH:
    raise RuntimeError(
        "FIREBASE_SERVICE_ACCOUNT_PATH not found. "
        "Please add it to backend/.env"
    )


if not firebase_admin._apps:

    cred = credentials.Certificate(
        FIREBASE_SERVICE_ACCOUNT_PATH
    )

    firebase_admin.initialize_app(cred)


db = firestore.client()


# ---------------------------------------------------------
# GEMINI CLIENT
# ---------------------------------------------------------

client = genai.Client(api_key=GEMINI_API_KEY)

MODEL_NAME = "gemini-3.5-flash-lite"


# ---------------------------------------------------------
# FASTAPI
# ---------------------------------------------------------

app = FastAPI(title="Note Insight API")


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------------------------------------------------
# REQUEST MODEL
# ---------------------------------------------------------

class NoteRequest(BaseModel):

    note: str = Field(
        min_length=1,
        max_length=20000
    )


# ---------------------------------------------------------
# GEMINI RESPONSE MODELS
# ---------------------------------------------------------

class Condition(BaseModel):

    name: str = Field(
        description="Clinical condition identified from the note."
    )

    documentation_status: str = Field(
        description=(
            "Use Well documented, Partially documented, "
            "or Poorly documented."
        )
    )

    confidence: int = Field(
        description="Confidence percentage from 0 to 100."
    )

    icd10_code: str = Field(
        description=(
            "ICD-10 code only when reasonably supported "
            "by the note. Otherwise return an empty string."
        )
    )

    evidence: str = Field(
        description=(
            "Short quotation or faithful excerpt from "
            "the note supporting this condition."
        )
    )


class DocumentationGap(BaseModel):

    issue: str = Field(
        description="A documentation gap that should be reviewed."
    )

    recommendation: str = Field(
        description=(
            "A concise recommendation for improving "
            "the documentation."
        )
    )


class AnalysisResult(BaseModel):

    conditions: List[Condition]

    documentation_gaps: List[DocumentationGap]

    summary: str = Field(
        description=(
            "Concise overall summary of the documentation review."
        )
    )

    overall_review: str = Field(
        description=(
            "Overall assessment of the clinical documentation."
        )
    )


# ---------------------------------------------------------
# FIREBASE AUTHENTICATION
# ---------------------------------------------------------

def verify_firebase_token(
    authorization: str | None
):

    if not authorization:

        raise HTTPException(
            status_code=401,
            detail="Authentication token is required."
        )


    if not authorization.startswith("Bearer "):

        raise HTTPException(
            status_code=401,
            detail="Invalid authentication format."
        )


    id_token = authorization.split(
        "Bearer ",
        1
    )[1].strip()


    if not id_token:

        raise HTTPException(
            status_code=401,
            detail="Authentication token is empty."
        )


    try:

        decoded_token = auth.verify_id_token(
            id_token
        )

        return decoded_token


    except Exception as e:

        print(
            "Firebase authentication error:",
            str(e)
        )

        raise HTTPException(
            status_code=401,
            detail="Invalid or expired authentication token."
        )


# ---------------------------------------------------------
# ROOT
# ---------------------------------------------------------

@app.get("/")
def root():

    return {
        "message": "Note Insight API is running",
        "model": MODEL_NAME
    }


# ---------------------------------------------------------
# ANALYZE NOTE
# ---------------------------------------------------------

@app.post("/api/notes")
def analyze_note(
    request: NoteRequest,
    authorization: str | None = Header(
        default=None
    )
):

    # -----------------------------------------------------
    # VERIFY CURRENT FIREBASE USER
    # -----------------------------------------------------

    decoded_token = verify_firebase_token(
        authorization
    )

    user_uid = decoded_token.get("uid")

    if not user_uid:

        raise HTTPException(
            status_code=401,
            detail="Unable to identify authenticated user."
        )


    # -----------------------------------------------------
    # WORD COUNT
    # -----------------------------------------------------

    word_count = len(
        request.note.split()
    )


    # -----------------------------------------------------
    # WORD COUNT VALIDATION
    # -----------------------------------------------------

    if word_count < 100:

        raise HTTPException(
            status_code=400,
            detail=(
                "Clinical note must contain "
                "at least 100 words."
            )
        )


    if word_count > 3000:

        raise HTTPException(
            status_code=400,
            detail=(
                "Clinical note must not exceed "
                "3000 words."
            )
        )


    # -----------------------------------------------------
    # PROMPT
    # -----------------------------------------------------

    prompt = f"""
You are Note Insight, an AI assistant for reviewing clinical documentation.

Your task is to analyze the clinical note below and return a structured
documentation review.

IMPORTANT:
- Do NOT invent facts that are not present in the note.
- Do NOT diagnose a new disease.
- Identify conditions that are actually supported by the note.
- Evaluate how well each identified condition is documented.
- Use the note itself as the evidence.
- If an ICD-10 code is not reasonably supported, return an empty string.
- Confidence must represent confidence that the condition is actually
  supported by the provided documentation.
- Identify meaningful documentation gaps only.
- Do not create unnecessary gaps.
- Keep the output concise and suitable for a clinical reviewer.

For each condition, return:
1. condition name
2. documentation status:
   - Well documented
   - Partially documented
   - Poorly documented
3. confidence percentage
4. ICD-10 code if reasonably supported
5. evidence from the note

Also return:
- documentation gaps
- recommendations for each gap
- overall review
- concise summary

Clinical note:

-------------------------
{request.note}
-------------------------
"""


    # -----------------------------------------------------
    # GEMINI CALL
    # -----------------------------------------------------

    try:

        response = client.models.generate_content(
            model=MODEL_NAME,
            contents=prompt,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                response_schema=AnalysisResult,
            ),
        )


        # Gemini structured output

        if response.parsed:

            result = response.parsed

        else:

            result = AnalysisResult.model_validate_json(
                response.text
            )


    except Exception as e:

        print(
            "Gemini error:",
            str(e)
        )

        raise HTTPException(
            status_code=500,
            detail=(
                f"Gemini analysis failed: {str(e)}"
            )
        )


    # -----------------------------------------------------
    # CONVERT RESULT TO DICTIONARY
    # -----------------------------------------------------

    analysis_data = result.model_dump()
        # -----------------------------------------------------
    # SAVE ANALYSIS TO FIRESTORE
    # -----------------------------------------------------

    analysis_id = None
    save_warning = None

    try:

        analysis_ref = (
            db
            .collection("users")
            .document(user_uid)
            .collection("analyses")
            .document()
        )

        analysis_ref.set({
            "user_uid": user_uid,
            "note": request.note,
            "word_count": word_count,
            "analysis": analysis_data,
            "created_at": firestore.SERVER_TIMESTAMP
        })

        analysis_id = analysis_ref.id

    except Exception as e:

        print(
            "Firestore save error:",
            str(e)
        )

        save_warning = (
            "Analysis was generated successfully, "
            "but could not be saved to History yet."
        )


    # -----------------------------------------------------
    # RETURN TO FRONTEND
    # -----------------------------------------------------

    return {
        "message": "Note analyzed successfully",

        "analysis_saved": analysis_id is not None,

        "analysis_id": analysis_id,

        "save_warning": save_warning,

        "user_uid": user_uid,

        "word_count": word_count,

        "note": request.note,

        "analysis": analysis_data
    }

  