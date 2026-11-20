export type VerificationVerdict = 'SUPPORTED' | 'CONTRADICTED' | 'MIXED' | 'UNVERIFIED';

export interface VendorClaim {
  id: string;
  claim_number: number;
  statement: string;
  verdict: VerificationVerdict;
  confidence: number;
  summary: string;
  supporting_evidence: string[];
  details: string[];
  unresolved_questions: string;
}

export interface EvidenceItem {
  id: string;
  name: string;
  file: string;
  source: string;
  type: string;
  period: string;
  records: number;
  reliability: string;
}

export interface TimelineEvent {
  id: string;
  ts_utc: string;
  ts_original?: string;
  source_system: string;
  evidence_id: string;
  category: 'api_activity' | 'support_export' | 'file_access' | 'network_activity' | 'financial_change' | 'authentication';
  event_type: string;
  actor: string;
  source_ip: string;
  details: string;
  suspicious: boolean;
  significance: string;
}

export interface CoastalCaseData {
  vendor_id: string;
  vendor_name: string;
  payment_cycle: string;
  next_payment_run: string;
  modification_event: {
    change_id: string;
    timestamp_utc: string;
    timestamp_ist: string;
    field: string;
    previous_value: string;
    previous_value_masked: string;
    updated_value: string;
    updated_value_masked: string;
    channel: string;
    credential_identity: string;
    approval_ref: string;
    source_ip: string;
    source_label: string;
    request_id: string;
    endpoint: string;
    method: string;
    status: string;
  };
  prior_vendor_reconnaissance: Array<{
    request_id: string;
    ts_utc: string;
    method: string;
    endpoint: string;
    caller_ip: string;
    status: string;
    records_returned?: string;
    description: string;
  }>;
  forensic_analysis: {
    why_needs_investigation: string;
    governance_failures: string[];
    alternative_explanations: string[];
    investigative_conclusions: string;
  };
}
