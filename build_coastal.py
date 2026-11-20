import csv, json, os

output_dir = os.path.join('app', 'src', 'data')

# 1. Coastal Packaging Special Case Data
coastal_case = {
    'vendor_id': 'V-0412',
    'vendor_name': 'Coastal Packaging Ltd',
    'payment_cycle': 'Twice monthly (8th and 23rd of each month)',
    'next_payment_run': '2026-09-08 (5 days after modification)',
    'modification_event': {
        'change_id': 'chg-8b9888c39b',
        'timestamp_utc': '2026-09-03T01:44:30Z',
        'timestamp_ist': '2026-09-03 07:14:30 IST',
        'field': 'bank_account',
        'previous_value': 'HDFC0001844-****4417',
        'previous_value_masked': '****4417',
        'updated_value': 'ICIC0000921-****9083',
        'updated_value_masked': '****9083',
        'channel': 'API',
        'credential_identity': 'key-tb-07 (TallyBridge-LedgerOne)',
        'approval_ref': '(NONE) - Missing required APR / BULK authorization code',
        'source_ip': '10.20.4.77',
        'source_label': 'tb-build-02 (TallyBridge Build Host over PrivateLink)',
        'request_id': 'req-5f61b0de8',
        'endpoint': '/v2/vendors/V-0412/bank-details',
        'method': 'PATCH',
        'status': '200 OK'
    },
    'prior_vendor_reconnaissance': [
        {
            'request_id': 'req-15a052a5e',
            'ts_utc': '2026-09-03T01:41:10Z',
            'method': 'GET',
            'endpoint': '/v2/vendors/V-0412',
            'caller_ip': '10.20.4.77',
            'status': '200',
            'description': 'Targeted profile inspection of Coastal Packaging Ltd'
        },
        {
            'request_id': 'req-93d66fcd5',
            'ts_utc': '2026-09-03T01:41:50Z',
            'method': 'GET',
            'endpoint': '/v2/vendors/V-0412/bank-details',
            'caller_ip': '10.20.4.77',
            'status': '200',
            'description': 'Targeted query of existing bank account details for V-0412'
        },
        {
            'request_id': 'req-33a3928eca',
            'ts_utc': '2026-09-03T01:42:45Z',
            'method': 'GET',
            'endpoint': '/v2/payments/scheduled',
            'caller_ip': '10.20.4.77',
            'status': '200',
            'records_returned': '14',
            'description': 'Targeted inspection of upcoming scheduled payment run'
        },
        {
            'request_id': 'req-5f61b0de8',
            'ts_utc': '2026-09-03T01:44:30Z',
            'method': 'PATCH',
            'endpoint': '/v2/vendors/V-0412/bank-details',
            'caller_ip': '10.20.4.77',
            'status': '200',
            'description': 'Unauthorised execution of bank account alteration'
        }
    ],
    'forensic_analysis': {
        'why_needs_investigation': 'The bank account field was modified via an API credential intended strictly for synchronization, without human finance approval, right before the bi-monthly vendor disbursement on 8 September.',
        'governance_failures': [
            'API credential key-tb-07 possessed excessive write permissions (\"read:write all-modules\") violating least privilege (E04, E10).',
            'No approval reference verification was enforced by the LedgerOne /v2/vendors/:id/bank-details API endpoint.',
            'The build host tb-build-02 was permitted direct access to production LedgerOne without firewall isolation.'
        ],
        'alternative_explanations': [
            'Attacker compromise of TallyBridge build pipeline or build server.',
            'Insider threat within TallyBridge developer or infrastructure staff.',
            'Misconfigured automated vendor contact sync script erroneously writing bank account fields (though endpoint was explicitly /bank-details, not /contact).'
        ],
        'investigative_conclusions': 'MIRROR flags this discrepancy between stated integration scope (ticket & invoice sync) and actual recorded capability. Do not assume automatic theft without disbursement confirmation, but immediately quarantine key-tb-07 and revert the bank account change.'
    }
}

with open(os.path.join(output_dir, 'coastal_case.json'), 'w') as f:
    json.dump(coastal_case, f, indent=2)

# 2. Sample records for evidence explorer
sample_records = {}
for eid, fname, limit in [
    ('E01', 'E01_ledgerone_api_access.csv', 100),
    ('E02', 'E02_helpdeskr_audit_log.csv', 100),
    ('E03', 'E03_sso_signin_log.csv', 100),
    ('E05', 'E05_bluevault_access_log.csv', 100),
    ('E14', 'E14_staff_roster.csv', 100),
    ('E15', 'E15_network_link_flow_log.csv', 100),
    ('E17', 'E17_indicator_list.csv', 20),
    ('E18', 'E18_ledgerone_api_access_1_to_7_sep.csv', 100),
    ('E19', 'E19_vendor_master_change_log.csv', 100)
]:
    with open(fname, 'r', encoding='utf-8', errors='ignore') as f:
        r = csv.DictReader(f)
        rows = []
        for i, row in enumerate(r):
            if i >= limit: break
            rows.append(row)
        sample_records[eid] = {
            'fields': r.fieldnames,
            'rows': rows
        }

with open(os.path.join(output_dir, 'sample_records.json'), 'w') as f:
    json.dump(sample_records, f, indent=2)

print('Wrote coastal_case.json and sample_records.json')
