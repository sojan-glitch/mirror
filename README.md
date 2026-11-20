# MIRROR: Multi-source Incident Reconstruction & Reconciliation of Representations
## CRIMEATHON'26 Cyber Forensics Defense Platform

> **"Don't just trust the incident explanation. Verify it with evidence."**

MIRROR is an AI-assisted, evidence-based incident claim verification platform built specifically for the **CRIMEATHON'26** cybersecurity hackathon investigation (Case **CR-26-047**: *Harbor & Finch Freight Pvt. Ltd. vs. TallyBridge Software*).

---

## 🎯 The Core Problem MIRROR Solves

When third-party software integration vendors experience security incidents, they issue post-incident explanations that are often sanitized, incomplete, or difficult to reconcile against the customer's independent records.

Customers face a severe asymmetry:
- Vendor explanations often assert that the breach was strictly confined (*"limited to support ticket metadata"*, *"finance records were not accessed"*, *"credentials rotated immediately"*).
- The victim enterprise possesses fragmented logs across ERPs, helpdesks, cloud storage, SSO, and private tunnels, but lacks an automated way to verify or refute those claims.

**MIRROR automates claim-to-evidence verification:**
1. Ingests the vendor's incident notice.
2. Extracts atomic claims into verifiable units.
3. Correlates multi-source forensic evidence (API logs, audit logs, file access, and network flows).
4. Produces transparent, record-traceable verdicts: **SUPPORTED**, **CONTRADICTED**, **MIXED**, or **UNVERIFIED**.
5. Exposes critical discrepancies (such as unauthorized bank account alterations).

---

## 🔍 Case Study Summary: Harbor & Finch Freight (Case CR-26-047)

- **Victim:** Harbor & Finch Freight Pvt. Ltd. (Chennai freight logistics provider).
- **Vendor:** TallyBridge Software Pvt. Ltd. (*TallyBridge Connect* synchronization tool).
- **Vendor Notice (E16):** Claimed unauthorized activity occurred on 11-12 August 2026 only, was restricted to support ticket metadata, finance records and files were untouched, and credentials were rotated on 24 August 2026.
- **Forensic Truth Discovered by MIRROR:**
  - **Reconnaissance on 09 August:** Threat IP `198.18.7.41` probed LedgerOne API endpoints using `key-tb-07`.
  - **Finance Exfiltration on 12 August:** `198.18.7.41` and `198.18.7.58` exported 19,675 vendor records and queried payments.
  - **Storage Exfiltration on 14-15 August:** Storage key `bvk-7f3a` (harvested from HelpDeskr ticket `TKT-48213`) was used from `198.18.7.23/.24/.77` to exfiltrate vendor bank details and finance statements from BlueVault.
  - **PrivateLink Tunnel Abuse on 17-19 August:** Vendor build host `10.20.4.77` (`tb-build-02`) transferred 5.1 MB from production LedgerOne.
  - **Coastal Packaging Ltd Bank Account Alteration on 03 September:** Host `10.20.4.77` used `key-tb-07` to alter Coastal Packaging Ltd's bank account to an unauthorized ICICI account without an approval reference, 5 days before the scheduled disbursement run.

---

## 🚀 Key Application Pages & Capabilities

1. **Dashboard:** High-level investigative scorecard with real metrics computed directly from authentic case data, showing claim verdicts, evidence coverage, and critical alerts.
2. **Incident Upload:** Ingestion module for incident explanations (PDF, DOCX, TXT, JSON) with preset loading for Case E16.
3. **Claim Verification Matrix (Core Engine):** Individual claim inspection cards detailing the exact forensic contradictions, supporting evidence IDs (E01-E20), confidence scores, and unresolved questions.
4. **Coastal Case Study (Special Investigation):** Dedicated forensic viewer for the September 3 bank account modification, featuring masked/unmasked account toggles, audit trail attributes, and the chronological API reconnaissance sequence.
5. **Evidence Explorer:** Record-level viewer across all 20 evidence files with fast search, category filters, and live tabular data previews.
6. **Incident Timeline:** Cross-system chronology with timestamp normalization (UTC conversion with preserved local IST and epoch times).
7. **Investigation Report:** Executive and Audit Committee debrief dossier with printable/PDF export formatting and immediate mitigation actions.

---

## 🛠️ Architecture & Tech Stack

- **Frontend:** React 19, TypeScript, Tailwind CSS, Vite, Lucide Icons, html2canvas, jsPDF.
- **Backend / Schema:** Supabase PostgreSQL with Row Level Security (RLS) policies (`supabase_schema.sql`).
- **Data Engine:** Python-based evidence parsing, timestamp normalization, and forensic correlation scripts.
- **Forensic Rule:** Zero fabricated statistics; deterministic traceability back to authentic source files.

---

## 💻 How to Run the Application Locally

```bash
# Navigate to the app directory
cd app

# Install dependencies (already pre-installed)
npm install

# Start the development server
npm run dev
```

Open your browser at `http://localhost:5173` to explore **MIRROR**.
