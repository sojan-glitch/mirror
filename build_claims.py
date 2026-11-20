import json, os

output_dir = os.path.join('app', 'src', 'data')

claims_data = [
    {
        'id': 'CLM-01',
        'claim_number': 1,
        'statement': 'Unauthorised requests were made using a customer connection credential on 11 and 12 August 2026 only.',
        'verdict': 'CONTRADICTED',
        'confidence': 98,
        'summary': 'Contradicted by multiple independent logs showing earlier unauthorised probe/reconnaissance activity (9 August) and subsequent unauthorised access (17-19 August and 3 September).',
        'supporting_evidence': ['E01', 'E02', 'E15', 'E17', 'E18', 'E19'],
        'details': [
            'E01 shows 8 reconnaissance requests on 9 August 2026 (03:12 to 03:44 UTC) from confirmed threat indicator 198.18.7.41 using credential key-tb-07 probing /v2/me, /v2/schema, /v2/vendors, and /v2/payments.',
            'E15 flow log reveals 70 flows from 10.20.4.77 (tb-build-02) on 17-19 August 2026 accessing LedgerOne production, culminating in a 5.1 MB data transfer on 18 August at 12:55 UTC.',
            'E18 and E19 show on 3 September 2026 at 01:44:30 UTC an unapproved modification of Coastal Packaging Ltd bank account via PATCH /v2/vendors/V-0412/bank-details from IP 10.20.4.77 using key-tb-07 without approval ref.',
            'Conclusion: The vendor claim that unauthorised requests occurred on 11 and 12 August only is false and contradicted by records.'
        ],
        'unresolved_questions': 'Why did TallyBridge monitoring fail to detect the 9 August reconnaissance or the subsequent 17-19 August and 3 September activities?'
    },
    {
        'id': 'CLM-02',
        'claim_number': 2,
        'statement': 'The access was limited to support ticket metadata. We have found no evidence that finance records or stored files were accessed.',
        'verdict': 'CONTRADICTED',
        'confidence': 99,
        'summary': 'Directly contradicted by LedgerOne API logs showing extensive payment searches and vendor data exports, and BlueVault file storage logs showing unauthorised downloads of finance statements and bank instructions.',
        'supporting_evidence': ['E01', 'E02', 'E05', 'E06', 'E13', 'E18', 'E19'],
        'details': [
            'E01 (12 August 03:41 - 04:02 UTC): Unauthorised IP 198.18.7.41 created vendor export (/v2/vendors/export, 9,840 records), downloaded export 9931, performed 4 payment searches returning 330 records each, then deleted the export.',
            'E01 (12 August 03:46 - 03:58 UTC): Threat IP 198.18.7.58 performed 3 payment searches (330 records each), exported vendors (9,835 records), and downloaded export 9932.',
            'E02: Shows ticket searches in HelpDeskr for sensitive keywords including "password", "api_key", "secret", "bluevault", "bvk-", "credentials", followed by 10 bulk ticket exports (EXP-5410 to EXP-5419), exceeding allowance (E06).',
            'E05 (BlueVault): On 14-15 August 2026, storage key bvk-7f3a (harvested from ticket TKT-48213 during the search) was used from external IPs 198.18.7.23, 198.18.7.24, 198.18.7.77 to read vendor-bank-details-2026.xlsx, payment-run-template.xlsx, and monthly finance statements (stmt-2026-01 to stmt-2026-05).',
            'Conclusion: Both finance records and stored confidential files were directly accessed and exfiltrated.'
        ],
        'unresolved_questions': 'Did TallyBridge only examine HelpDeskr API logs and fail to review the LedgerOne integration credentials or cross-reference ticket content?'
    },
    {
        'id': 'CLM-03',
        'claim_number': 3,
        'statement': 'All temporary export files created during the activity have been removed.',
        'verdict': 'MIXED',
        'confidence': 90,
        'summary': 'Partially supported: most export jobs in HelpDeskr (EXP-5410 through EXP-5418) and LedgerOne (export 9931) were deleted, but HelpDeskr export EXP-5419 failed deletion with a timeout error and remained.',
        'supporting_evidence': ['E01', 'E02', 'E13'],
        'details': [
            'E01 shows /v2/exports/9931 was deleted via DELETE request (status 204) at 04:02:33 UTC by 198.18.7.41.',
            'E02 shows export.delete succeeded for EXP-5410, 5411, 5412, 5413, 5414, 5415, 5416, 5417, 5418.',
            'However, E02 record at 12/08/2026 00:33:10 shows action export.delete on EXP-5419 returned "result: error, details: timeout".',
            'E13 chat confirmation: Support team observed on 12 August morning: "Saw a lot of export jobs in HelpDeskr from last night. One is stuck on delete."'
        ],
        'unresolved_questions': 'Was the stuck export file EXP-5419 subsequently purged by automated system cleanup, or did it persist in cloud storage?'
    },
    {
        'id': 'CLM-04',
        'claim_number': 4,
        'statement': 'The activity originated entirely from outside our network. No systems inside our environment or on the private link were involved.',
        'verdict': 'CONTRADICTED',
        'confidence': 95,
        'summary': 'Contradicted by network flow logs and API access logs demonstrating extensive activity routed across the private tunnel (tun-tb-01) from TallyBridge internal host 10.20.4.77 (tb-build-02).',
        'supporting_evidence': ['E15', 'E18', 'E19', 'E20'],
        'details': [
            'E15 documents that IP 10.20.4.77 is labeled "tb-build-02" on the vendor private tunnel tun-tb-01.',
            'E15 records 70 distinct network flows from 10.20.4.77 over tun-tb-01 to LedgerOne and LedgerOne-sandbox during July and August 2026, including 5.1 MB transferred on 18 August.',
            'E18 and E19 record that the 3 September 2026 unauthorized modification to Coastal Packaging Ltd was initiated from 10.20.4.77 across the private link.',
            'Conclusion: Vendor systems on the private link were directly involved in anomalous and unauthorized activities.'
        ],
        'unresolved_questions': 'Was tb-build-02 compromised by an external adversary, misconfigured as an unauthorized proxy, or abused by an insider?'
    },
    {
        'id': 'CLM-05',
        'claim_number': 5,
        'statement': 'Affected credentials were rotated on 24 August 2026.',
        'verdict': 'CONTRADICTED',
        'confidence': 96,
        'summary': 'Contradicted by system configuration registers and API logs showing key-tb-07 remained active and in continuous use into September 2026.',
        'supporting_evidence': ['E04', 'E18', 'E19'],
        'details': [
            'E04 (Connected Software Register, exported 2 September 2026): Lists TallyBridge-LedgerOne credential_id as "key-tb-07" with status "active" and last_used "2026-09-02". No rotation event or new key ID is recorded.',
            'E18 (September LedgerOne API log): Shows key-tb-07 actively performing hundreds of sync requests throughout 1 to 7 September 2026.',
            'E19 (Vendor change log): On 3 September 2026, key-tb-07 was used to execute chg-8b9888c39b.',
            'Conclusion: If TallyBridge rotated internal credentials on their end, Harbor & Finch\'s LedgerOne API credential key-tb-07 was NOT rotated on 24 August 2026.'
        ],
        'unresolved_questions': 'Did TallyBridge rotate a different credential (e.g., tb-sync-svc in HelpDeskr) while failing to rotate the LedgerOne credential key-tb-07?'
    },
    {
        'id': 'CLM-06',
        'claim_number': 6,
        'statement': 'A list of indicators is attached to assist your review (file: indicator_list.csv).',
        'verdict': 'MIXED',
        'confidence': 92,
        'summary': 'Partially supported: The file was provided (E17), but it is severely incomplete and misleading. It omitted known malicious source IPs, omitted the private-link build host, and listed legacy key-tb-03 while omitting compromised active key-tb-07.',
        'supporting_evidence': ['E01', 'E05', 'E15', 'E17', 'E18'],
        'details': [
            'E17 listed 198.18.7.41, 198.18.7.58, 198.18.8.6, python-requests/2.31.0, and key-tb-03.',
            'Omissions: Failed to list BlueVault exfiltration IPs (198.18.7.23, 198.18.7.24, 198.18.7.77).',
            'Omissions: Failed to identify 10.20.4.77 (tb-build-02) which generated suspicious flows and unauthorized API calls.',
            'Misdirection: Listed key-tb-03 (legacy retired key) with "low confidence" while omitting active key-tb-07 which was the actual credential used in the unauthorized API calls in E01, E18, and E19.',
            'IP 198.18.8.6 listed as "medium confidence" belongs to customer/remote employee ranges and appears in legitimate user actions in E02 and E03.'
        ],
        'unresolved_questions': 'Why did TallyBridge include retired key-tb-03 in the indicator list instead of key-tb-07?'
    },
    {
        'id': 'CLM-07',
        'claim_number': 7,
        'statement': 'From 1 September 2026, TallyBridge Connect will also synchronise vendor contact details (email and phone) between your systems, using the existing connection. No action is needed.',
        'verdict': 'UNVERIFIED',
        'confidence': 80,
        'summary': 'Unverified scope change: E18 shows vendor contact sync PATCH requests beginning in September, but the integration scope was expanded without customer security approval or contract amendment, and was immediately followed by an unapproved bank account change.',
        'supporting_evidence': ['E04', 'E07', 'E08', 'E10', 'E18', 'E19'],
        'details': [
            'E07 & E08 establish that the approved integration scope was limited to invoice and ticket sync.',
            'E10 (Security Policy) mandates CISO approval for scope extensions on high-risk integrations.',
            'E18 shows PATCH /v2/vendors/V-xxxx/contact calls did begin on 1 September 2026.',
            'However, on 3 September 2026, this expanded connection was used to modify bank_account (/v2/vendors/V-0412/bank-details), far exceeding "contact details (email and phone)".',
            'Whether this was an authorized feature rollout, an accidental vendor defect, or malicious feature abuse remains unverified from the vendor\'s communications.'
        ],
        'unresolved_questions': 'Did TallyBridge deploy code that enabled bank-detail modifications without Harbor & Finch authorization, or was the build-host exploited?'
    }
]

with open(os.path.join(output_dir, 'claims_data.json'), 'w') as f:
    json.dump(claims_data, f, indent=2)

print('Wrote claims_data.json with 7 claims')
