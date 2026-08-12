INSERT IGNORE INTO ml_scores (id, application_id, approval_probability, risk_tier, model_version, scored_at) VALUES
(1, 'APP-2024-0891', 91.0, 'Low', 'XGBoost-v2.1.0', NOW()),
(2, 'APP-2024-0892', 96.0, 'Low', 'XGBoost-v2.1.0', NOW()),
(3, 'APP-2024-0893', 58.0, 'Medium', 'XGBoost-v2.1.0', NOW()),
(4, 'APP-2024-0894', 22.0, 'High', 'XGBoost-v2.1.0', NOW()),
(5, 'APP-2024-0897', 31.0, 'High', 'XGBoost-v2.1.0', NOW());

INSERT IGNORE INTO shap_attributions (id, application_id, feature_name, shap_value, impact_type, explanation) VALUES
(1, 'APP-2024-0894', 'Faculty-Student Ratio', -28.4, 'NEGATIVE', 'Faculty-student ratio 1:19 reduces approval probability by 28.4 points'),
(2, 'APP-2024-0894', 'Built-up Area Mismatch', -14.2, 'NEGATIVE', 'Built-up area mismatch of 23,800 sq ft reduces approval by 14.2 points'),
(3, 'APP-2024-0894', 'Computer Lab Capacity', +12.1, 'POSITIVE', '100% compliant computer lab capacity increases score by 12.1 points'),
(4, 'APP-2024-0891', 'PhD Faculty Percentage', +22.5, 'POSITIVE', 'High PhD faculty percentage (71%) increases score by 22.5 points'),
(5, 'APP-2024-0891', 'NAAC Accreditation A+', +18.3, 'POSITIVE', 'NAAC Grade A+ adds 18.3 points to approval probability');
