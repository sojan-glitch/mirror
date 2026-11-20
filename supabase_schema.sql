-- ====================================================================
-- MIRROR: Multi-source Incident Reconstruction & Reconciliation
-- Cyber Forensics Investigation Database Schema (Supabase PostgreSQL)
-- Case CR-26-047: Harbor & Finch Freight vs. TallyBridge Software
-- ====================================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. Investigations
create table if not exists investigations (
    id uuid primary key default uuid_generate_v4(),
    case_ref text not null unique,
    title text not null,
    target_entity text not null,
    vendor_entity text not null,
    incident_date date not null,
    status text not null default 'ACTIVE' check (status in ('ACTIVE', 'CLOSED', 'ARCHIVED')),
    lead_investigator text not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Uploaded Files
create table if not exists uploaded_files (
    id uuid primary key default uuid_generate_v4(),
    investigation_id uuid references investigations(id) on delete cascade,
    evidence_id text not null,
    file_name text not null,
    file_type text not null,
    file_size_bytes bigint,
    record_count integer default 0,
    source_system text not null,
    storage_path text,
    sha256_hash text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Evidence Records
create table if not exists evidence_records (
    id uuid primary key default uuid_generate_v4(),
    investigation_id uuid references investigations(id) on delete cascade,
    evidence_id text not null,
    record_identifier text,
    timestamp_utc timestamp with time zone,
    raw_timestamp text,
    source_system text not null,
    actor_identity text,
    source_ip text,
    action_type text,
    target_object text,
    record_payload jsonb not null default '{}'::jsonb,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Indexes for lightning fast correlation
create index if not exists idx_ev_rec_lookup on evidence_records(investigation_id, evidence_id);
create index if not exists idx_ev_rec_ts on evidence_records(timestamp_utc);
create index if not exists idx_ev_rec_ip on evidence_records(source_ip);
create index if not exists idx_ev_rec_actor on evidence_records(actor_identity);

-- 4. Vendor Claims
create table if not exists vendor_claims (
    id uuid primary key default uuid_generate_v4(),
    investigation_id uuid references investigations(id) on delete cascade,
    claim_code text not null,
    claim_number integer not null,
    claim_statement text not null,
    extracted_from_doc text not null,
    verdict text not null check (verdict in ('SUPPORTED', 'CONTRADICTED', 'MIXED', 'UNVERIFIED')),
    confidence_score integer not null check (confidence_score between 0 and 100),
    forensic_summary text not null,
    unresolved_questions text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. Claim Verifications (Evidence Traceability mappings)
create table if not exists claim_verifications (
    id uuid primary key default uuid_generate_v4(),
    claim_id uuid references vendor_claims(id) on delete cascade,
    evidence_id text not null,
    relevance_type text not null check (relevance_type in ('CONTRADICTORY', 'SUPPORTING', 'CONTEXTUAL')),
    citation_detail text not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 6. Correlated Investigation Events (Timeline)
create table if not exists investigation_events (
    id uuid primary key default uuid_generate_v4(),
    investigation_id uuid references investigations(id) on delete cascade,
    timestamp_utc timestamp with time zone not null,
    source_system text not null,
    evidence_id text not null,
    event_category text not null check (event_category in ('api_activity', 'support_export', 'file_access', 'network_activity', 'financial_change', 'authentication')),
    event_type text not null,
    actor_identity text not null,
    source_ip text,
    details text not null,
    significance text not null,
    is_suspicious boolean default false,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create index if not exists idx_events_ts on investigation_events(timestamp_utc);

-- 7. Investigation Reports
create table if not exists investigation_reports (
    id uuid primary key default uuid_generate_v4(),
    investigation_id uuid references investigations(id) on delete cascade,
    report_title text not null,
    executive_summary text not null,
    findings_json jsonb not null default '{}'::jsonb,
    recommended_actions jsonb not null default '[]'::jsonb,
    generated_by text not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Row Level Security (RLS) Policies
alter table investigations enable row level security;
alter table uploaded_files enable row level security;
alter table evidence_records enable row level security;
alter table vendor_claims enable row level security;
alter table claim_verifications enable row level security;
alter table investigation_events enable row level security;
alter table investigation_reports enable row level security;

-- Public read access for authenticated security investigators / simulation viewers
create policy "Allow read access to investigations" on investigations for select using (true);
create policy "Allow read access to evidence" on uploaded_files for select using (true);
create policy "Allow read access to records" on evidence_records for select using (true);
create policy "Allow read access to claims" on vendor_claims for select using (true);
create policy "Allow read access to verifications" on claim_verifications for select using (true);
create policy "Allow read access to events" on investigation_events for select using (true);
create policy "Allow read access to reports" on investigation_reports for select using (true);
