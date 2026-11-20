import csv, json, os, datetime

output_dir = os.path.join('app', 'src', 'data')
os.makedirs(output_dir, exist_ok=True)

timeline_events = []

# (A) 09-Aug-2026: E01 Reconnaissance
with open('E01_ledgerone_api_access.csv', 'r') as f:
    r = csv.DictReader(f)
    for row in r:
        if row['caller_ip'] == '198.18.7.41':
            timeline_events.append({
                'id': row['request_id'],
                'ts_utc': row['ts_utc'],
                'source_system': 'LedgerOne',
                'evidence_id': 'E01',
                'category': 'api_activity',
                'event_type': 'Reconnaissance / Probe',
                'actor': 'key-tb-07',
                'source_ip': row['caller_ip'],
                'details': row['method'] + ' ' + row['endpoint'] + ' -> returned ' + row['records_returned'] + ' records (' + row['status'] + ')',
                'suspicious': True,
                'significance': 'Threat IP 198.18.7.41 using TallyBridge key-tb-07 probing schema, vendors, and payments'
            })

# (B) 11-12 Aug: E02 HelpDeskr Searches & Bulk Exports
with open('E02_helpdeskr_audit_log.csv', 'r') as f:
    r = csv.DictReader(f)
    for row in r:
        if row['source_ip'] in ['198.18.7.41', '198.18.7.58']:
            try:
                dt_local = datetime.datetime.strptime(row['ts_local'], '%d/%m/%Y %H:%M:%S')
                dt_utc = dt_local - datetime.timedelta(hours=5, minutes=30)
                ts_utc_str = dt_utc.strftime('%Y-%m-%dT%H:%M:%SZ')
            except:
                ts_utc_str = row['ts_local']
            
            cat = 'support_export' if 'export' in row['action'] else 'authentication'
            timeline_events.append({
                'id': row['event_id'],
                'ts_utc': ts_utc_str,
                'ts_original': row['ts_local'] + ' IST',
                'source_system': 'HelpDeskr',
                'evidence_id': 'E02',
                'category': cat,
                'event_type': row['action'],
                'actor': row['actor'],
                'source_ip': row['source_ip'],
                'details': 'Action: ' + row['action'] + ' on ' + row['object_id'] + ' (details: ' + row['details'] + ')',
                'suspicious': True,
                'significance': 'Unauthorised ticket searches for credentials/keys followed by bulk ticket data exports'
            })

# (C) 12 Aug: E01 LedgerOne Data Exfiltration
with open('E01_ledgerone_api_access.csv', 'r') as f:
    r = csv.DictReader(f)
    for row in r:
        if row['caller_ip'] in ['198.18.7.41', '198.18.7.58'] and '2026-08-12' in row['ts_utc']:
            timeline_events.append({
                'id': row['request_id'],
                'ts_utc': row['ts_utc'],
                'source_system': 'LedgerOne',
                'evidence_id': 'E01',
                'category': 'api_activity',
                'event_type': 'Finance Data Exfiltration',
                'actor': 'key-tb-07',
                'source_ip': row['caller_ip'],
                'details': row['method'] + ' ' + row['endpoint'] + ' -> ' + row['records_returned'] + ' records (' + row['status'] + ')',
                'suspicious': True,
                'significance': 'Bulk export of 9,840 vendor records and 7 payment searches by external threat IPs'
            })

# (D) 14-15 Aug: E05 BlueVault Exfiltration
with open('E05_bluevault_access_log.csv', 'r') as f:
    r = csv.DictReader(f)
    for row in r:
        if row['principal'] == 'key:bvk-7f3a' and row['source_ip'] in ['198.18.7.23', '198.18.7.24', '198.18.7.77']:
            dt_utc = datetime.datetime.fromtimestamp(int(row['epoch_s']), datetime.timezone.utc)
            timeline_events.append({
                'id': row['event_id'],
                'ts_utc': dt_utc.strftime('%Y-%m-%dT%H:%M:%SZ'),
                'ts_original': 'epoch ' + str(row['epoch_s']),
                'source_system': 'BlueVault',
                'evidence_id': 'E05',
                'category': 'file_access',
                'event_type': 'Storage ' + row['action'].upper(),
                'actor': 'key:bvk-7f3a',
                'source_ip': row['source_ip'],
                'details': row['action'] + ' ' + row['path'] + ' (' + str(row['bytes']) + ' bytes)',
                'suspicious': True,
                'significance': 'Unauthorised access to vendor-bank-details, payment templates, and finance statements'
            })

# (E) 18 Aug: E15 5.1MB data transfer from tb-build-02
with open('E15_network_link_flow_log.csv', 'r') as f:
    r = csv.DictReader(f)
    for row in r:
        if row['flow_id'] == 'flw-9f08a37e0d':
            timeline_events.append({
                'id': row['flow_id'],
                'ts_utc': row['ts_utc'],
                'source_system': 'PrivateLink Gateway',
                'evidence_id': 'E15',
                'category': 'network_activity',
                'event_type': 'High Volume Flow',
                'actor': 'tb-build-02 (10.20.4.77)',
                'source_ip': row['src_ip'],
                'details': 'Tunnel tun-tb-01 -> ' + row['dst_system'] + ': 5.1 MB inbound data flow',
                'suspicious': True,
                'significance': 'Unusual high-volume private link flow to LedgerOne from build host'
            })

# (F) 03 Sep: E18 & E19 Coastal Packaging Bank Account Modification
timeline_events.append({
    'id': 'chg-8b9888c39b',
    'ts_utc': '2026-09-03T01:44:30Z',
    'source_system': 'LedgerOne Master Records',
    'evidence_id': 'E19',
    'category': 'financial_change',
    'event_type': 'Vendor Bank Account Alteration',
    'actor': 'key-tb-07',
    'source_ip': '10.20.4.77 (tb-build-02)',
    'details': 'Field: bank_account modified for Coastal Packaging Ltd (V-0412). Old: ****4417, New: ****9083. Channel: API. Approval Ref: (NONE). Request: req-5f61b0de8',
    'suspicious': True,
    'significance': 'CRITICAL: Bank account altered without approval reference via TallyBridge credential key-tb-07 right before scheduled payment run'
})

# Sort events by ts_utc
timeline_events.sort(key=lambda x: x['ts_utc'])

with open(os.path.join(output_dir, 'timeline_events.json'), 'w') as f:
    json.dump(timeline_events, f, indent=2)

print('Wrote timeline_events.json with ' + str(len(timeline_events)) + ' events')
