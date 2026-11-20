import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const url = 'https://iyzdqaecdevapmxmqjfa.supabase.co';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml5emRxYWVjZGV2YXBteG1xamZhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTUxMjEyMjIsImV4cCI6MjExMDY5NzIyMn0.0mJP55XJjnP4-cDvN_YwrWj-zi_huK_rHiRh0WnJGMQ';
const supabase = createClient(url, key);

async function syncAllToSupabase() {
  console.log('--- Starting Complete Supabase Data Sync ---');

  // 1. Fetch Investigation ID
  const { data: invData, error: invErr } = await supabase
    .from('investigations')
    .select('id')
    .eq('case_ref', 'CR-26-047')
    .single();

  if (invErr || !invData) {
    console.error('Failed to get investigation:', invErr);
    return;
  }
  const investigationId = invData.id;
  console.log('Investigation ID:', investigationId);

  // 2. Sync Evidence Catalog (E01 - E20)
  const evidenceCatalogPath = path.resolve('src', 'data', 'evidence_catalog.json');
  if (fs.existsSync(evidenceCatalogPath)) {
    const evidenceList = JSON.parse(fs.readFileSync(evidenceCatalogPath, 'utf8'));
    console.log(`Syncing ${evidenceList.length} evidence catalog items...`);

    const filesToInsert = evidenceList.map((e) => ({
      investigation_id: investigationId,
      evidence_id: e.id,
      file_name: e.file || e.name,
      file_type: e.type,
      record_count: e.records || 0,
      source_system: e.source,
      storage_path: `evidence_files/${e.file || e.name}`
    }));

    await supabase.from('uploaded_files').delete().eq('investigation_id', investigationId);
    const { error: fErr } = await supabase.from('uploaded_files').insert(filesToInsert);
    if (fErr) console.error('Error inserting uploaded_files:', fErr);
    else console.log('✓ Uploaded files synced successfully.');
  }

  // 3. Sync Vendor Claims
  const claimsPath = path.resolve('src', 'data', 'claims_data.json');
  if (fs.existsSync(claimsPath)) {
    const claims = JSON.parse(fs.readFileSync(claimsPath, 'utf8'));
    console.log(`Syncing ${claims.length} claims...`);

    await supabase.from('vendor_claims').delete().eq('investigation_id', investigationId);

    for (const c of claims) {
      const { data: claimRow, error: cErr } = await supabase
        .from('vendor_claims')
        .insert({
          investigation_id: investigationId,
          claim_code: c.id,
          claim_number: c.claim_number,
          claim_statement: c.statement,
          extracted_from_doc: 'E16_followup_email_notice.pdf',
          verdict: c.verdict,
          confidence_score: c.confidence,
          forensic_summary: c.summary,
          unresolved_questions: c.unresolved_questions
        })
        .select()
        .single();

      if (cErr) {
        console.error('Error inserting claim:', cErr);
        continue;
      }

      // Sync claim verifications / evidence citations
      if (c.supporting_evidence && c.supporting_evidence.length > 0) {
        const verifications = c.supporting_evidence.map((evId) => ({
          claim_id: claimRow.id,
          evidence_id: evId,
          relevance_type: c.verdict === 'CONTRADICTED' ? 'CONTRADICTORY' : 'SUPPORTING',
          citation_detail: c.details?.[0] || 'Corroborating forensic evidence link'
        }));
        await supabase.from('claim_verifications').insert(verifications);
      }
    }
    console.log('✓ Vendor claims and verifications synced.');
  }

  // 4. Sync Multi-Log Timeline Events
  const timelinePath = path.resolve('src', 'data', 'timeline_events.json');
  if (fs.existsSync(timelinePath)) {
    const events = JSON.parse(fs.readFileSync(timelinePath, 'utf8'));
    console.log(`Syncing ${events.length} timeline events...`);

    await supabase.from('investigation_events').delete().eq('investigation_id', investigationId);

    // Batch insert timeline in chunks of 50
    const chunkSize = 50;
    for (let i = 0; i < events.length; i += chunkSize) {
      const chunk = events.slice(i, i + chunkSize).map((ev) => ({
        investigation_id: investigationId,
        timestamp_utc: ev.ts_utc,
        source_system: ev.source_system,
        evidence_id: ev.evidence_id,
        event_category: ev.category,
        event_type: ev.event_type,
        actor_identity: ev.actor,
        source_ip: ev.source_ip,
        details: ev.details,
        significance: ev.significance,
        is_suspicious: ev.suspicious || false
      }));

      const { error: eErr } = await supabase.from('investigation_events').insert(chunk);
      if (eErr) console.error(`Error inserting timeline chunk ${i}:`, eErr);
    }
    console.log('✓ Multi-log timeline events synced.');
  }

  // 5. Sync Known Suspect Explanations
  const suspects = [
    {
      suspect_id: 'tallybridge',
      suspect_name: 'TallyBridge Software Pvt Ltd',
      suspect_type: 'Third-Party Vendor',
      title: 'Formal Notice E16: Investigation findings and next steps',
      raw_text: `1. Unauthorised requests were made using customer credentials on 11 and 12 August 2026 only.
2. The access was limited to support ticket metadata. We found no evidence that finance records or stored files were accessed.
3. All temporary export files created during the activity have been removed.
4. The activity originated entirely outside our network. No systems inside our environment or on the private link were involved.
5. Affected credentials were rotated on 24 August 2026.`,
      claims_count: 5
    },
    {
      suspect_id: 'kavita_helpdesk',
      suspect_name: 'Kavita Rao (HelpDeskr Support Eng)',
      suspect_type: 'Internal Staff',
      title: 'Ticket TKT-48213 Triaging & Credential Incident Deposition',
      raw_text: `1. I only handled standard ticket triaging for export job EXP-5419 on 11 August.
2. I did not attach or expose any plaintext storage keys or passwords in the ticket body.
3. All attached logs were sanitized in accordance with our data handling policy.
4. I have never accessed BlueVault bucket storage directly from my personal workstation.`,
      claims_count: 4
    },
    {
      suspect_id: 'tb_sync_svc',
      suspect_name: 'tb-sync-svc (Service Account)',
      suspect_type: 'Compromised Service Account',
      title: 'Integration Service Audit & Revocation Summary',
      raw_text: `1. Automated synchronization routine executed only scheduled read operations.
2. No PATCH or write requests were initiated by the synchronization worker on vendor master accounts.
3. The account ceased all network calls after the reported revocation on 24 August.`,
      claims_count: 3
    },
    {
      suspect_id: 'ip_10_20_4_77',
      suspect_name: 'Host 10.20.4.77 (tb-build-02)',
      suspect_type: 'Threat IP',
      title: 'PrivateLink Host Ingress/Egress Activity Statement',
      raw_text: `1. Build server executes automated CI/CD integration tests only.
2. No outbound tunnel sessions to external IP ranges were maintained outside maintenance windows.
3. Node did not issue any vendor master bank routing alteration queries on 3 September.`,
      claims_count: 3
    }
  ];

  console.log(`Syncing ${suspects.length} suspect explanations...`);
  await supabase.from('suspect_explanations').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  const { error: sErr } = await supabase.from('suspect_explanations').insert(suspects);
  if (sErr) console.error('Error inserting suspect_explanations:', sErr);
  else console.log('✓ Suspect explanations seeded into cloud database.');

  // 6. Sync Initial Forensic Chat History
  const chats = [
    {
      sender: 'Investigator',
      message_text: 'What happened on 11 August?'
    },
    {
      sender: 'MIRROR Forensic AI',
      message_text: `On 11 August 2026, unusual scripted activity began targeting HelpDeskr and LedgerOne from external threat IPs:

1. HelpDeskr Ticket Searches (23:12 - 23:26 IST): Threat IP 198.18.7.41 searched for "password", "api_key", "secret", "token", "bluevault", "bvk-".
2. Credential Harvesting (23:28 IST): Accessed ticket TKT-48213 containing customer storage key bvk-7f3a in plaintext.
3. Bulk Data Export Jobs (23:30 - 23:58 IST): Initiated mass export jobs EXP-5410 through EXP-5413.`,
      evidence_citations: ['E01', 'E02', 'E06', 'E13', 'E17'],
      facts_vs_assumptions: {
        confirmedFacts: [
          'HelpDeskr log (E02) records 18 targeted ticket searches for credential terms starting at 23:12:00 IST.',
          'HelpDeskr export jobs EXP-5410 to EXP-5413 were created, downloaded, and deleted by 198.18.7.41 and 198.18.7.58 (E02).',
          'Storage key bvk-7f3a was explicitly stored in plaintext inside TKT-48213 (confirmed by E13).'
        ],
        investigativeAssumptions: [
          'It is assumed the actor searched for "bvk-" specifically anticipating BlueVault credentials.'
        ],
        missingInfo: [
          'Full payload content of the downloaded export files EXP-5410 to 5413.'
        ]
      }
    },
    {
      sender: 'Investigator',
      message_text: 'Was the bank-account change approved?'
    },
    {
      sender: 'MIRROR Forensic AI',
      message_text: `NO. The bank-account change for Coastal Packaging Ltd (V-0412) was completely unapproved:
- Event: Log ID chg-8b9888c39b on 03 Sep 2026 at 01:44:30 UTC (E19).
- Endpoint: PATCH /api/v2/vendors/V-0412/bank_account via key-tb-07 from 10.20.4.77 (E18).
- The Critical Forensic Proof: Field approval_ref is explicitly null.`,
      evidence_citations: ['E04', 'E10', 'E15', 'E18', 'E19'],
      facts_vs_assumptions: {
        confirmedFacts: [
          'E19 master change log explicitly records approval_ref = null.',
          'Account changed from HDFC Bank ****4417 to ICICI Bank ****9083.',
          'Executed 5 days prior to scheduled payout run of ₹14,82,500.'
        ],
        investigativeAssumptions: [
          'Attacker targeted Coastal Packaging specifically due to high scheduled disbursement.'
        ],
        missingInfo: [
          'Bank payment gateway disbursement status for 8 September.'
        ]
      }
    }
  ];

  await supabase.from('forensic_chat_history').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  const { error: chErr } = await supabase.from('forensic_chat_history').insert(chats);
  if (chErr) console.error('Error inserting forensic_chat_history:', chErr);
  else console.log('✓ Forensic chat history seeded into cloud database.');

  console.log('--- Complete Supabase Migration Successful! ---');
}

syncAllToSupabase().catch(console.error);
