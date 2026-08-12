INSERT IGNORE INTO notifications (id, role, title, description, tone, time_ago, unread, created_at) VALUES
('n1_inst', 'INSTITUTION', 'Document verification passed', 'Annexure IV (Faculty List) cleared NLP cross-check.', 'emerald', '12m ago', true, NOW()),
('n2_inst', 'INSTITUTION', 'Action required on Annexure VII', 'Land ownership document needs a clearer scan — resubmit.', 'amber', '1h ago', true, NOW()),
('n3_inst', 'INSTITUTION', 'New reviewer comment', 'Please clarify the lab equipment valuation for FY24.', 'teal', '3h ago', true, NOW()),
('n4_inst', 'INSTITUTION', 'Application moved to Expert Review', 'APP-2024-0893 has cleared document verification.', 'emerald', 'Yesterday', false, NOW()),
('n5_inst', 'INSTITUTION', 'Compliance cycle reminder', 'Self-assessment for 2024–25 cycle closes in 9 days.', 'slate', '2d ago', false, NOW()),

('n1_ugc', 'UGC', 'Critical anomaly flagged', 'Coastal Business School — faculty shortfall of 36.7% detected.', 'red', '8m ago', true, NOW()),
('n2_ugc', 'UGC', 'NLP scan completed', '14/14 parameters processed for APP-2024-0901.', 'teal', '45m ago', true, NOW()),
('n3_ugc', 'UGC', 'Reviewer assigned', 'Dr. Rao assigned to Deccan Inst. of Mgmt. expert review.', 'emerald', '2h ago', true, NOW()),
('n4_ugc', 'UGC', 'Weekly compliance report ready', 'Cycle 2024–25 throughput summary generated.', 'emerald', 'Yesterday', false, NOW()),
('n5_ugc', 'UGC', 'System maintenance', 'NLP engine will briefly restart tonight at 2:00 AM IST.', 'slate', '3d ago', false, NOW());
