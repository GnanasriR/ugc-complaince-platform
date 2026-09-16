INSERT IGNORE INTO users (id, email, password, full_name, mobile_number, institution_name, role, status, failed_login_attempts, created_at)
VALUES (1, 'admin@ugc.gov.in', '$2a$10$8.UnVuG9HHgffUDAlk8qfOuVGkqRzgVymGe07xd00DMxs.AQubh4a', 'Dr. System Administrator', '9876543210', 'University Grants Commission', 'ADMIN', 'ACTIVE', 0, NOW());

INSERT IGNORE INTO users (id, email, password, full_name, mobile_number, institution_name, role, status, failed_login_attempts, created_at)
VALUES (2, 'officer@ugc.gov.in', '$2a$10$8.UnVuG9HHgffUDAlk8qfOuVGkqRzgVymGe07xd00DMxs.AQubh4a', 'Dr. Ramesh Kumar', '9876543211', 'UGC Verification Directorate', 'EVALUATOR', 'ACTIVE', 0, NOW());

INSERT IGNORE INTO users (id, email, password, full_name, mobile_number, institution_name, role, status, failed_login_attempts, created_at)
VALUES (3, 'registrar@rgit.ac.in', '$2a$10$8.UnVuG9HHgffUDAlk8qfOuVGkqRzgVymGe07xd00DMxs.AQubh4a', 'Prof. Suresh Sharma', '9876543212', 'Rajiv Gandhi Institute of Technology', 'INSTITUTION', 'ACTIVE', 0, NOW());

INSERT IGNORE INTO users (id, email, password, full_name, mobile_number, institution_name, role, status, failed_login_attempts, created_at)
VALUES (4, 'kv.raman@fakeuniv.edu.in', '$2a$10$8.UnVuG9HHgffUDAlk8qfOuVGkqRzgVymGe07xd00DMxs.AQubh4a', 'Dr. K. V. Raman', '9876543299', 'Unrecognized Technical Institute', 'INSTITUTION', 'REJECTED', 0, NOW());

INSERT IGNORE INTO users (id, email, password, full_name, mobile_number, institution_name, role, status, failed_login_attempts, created_at)
VALUES (5, 'malhotra@unapproved-degree.ac.in', '$2a$10$8.UnVuG9HHgffUDAlk8qfOuVGkqRzgVymGe07xd00DMxs.AQubh4a', 'Director S. P. Malhotra', '9876543298', 'Apex Distance Learning Society', 'INSTITUTION', 'REJECTED', 0, NOW());

INSERT IGNORE INTO users (id, email, password, full_name, mobile_number, institution_name, role, status, failed_login_attempts, created_at)
VALUES (6, 'ananya.sharma@bits-pilani.ac.in', '$2a$10$8.UnVuG9HHgffUDAlk8qfOuVGkqRzgVymGe07xd00DMxs.AQubh4a', 'Dr. Ananya Sharma', '9876543210', 'Birla Institute of Technology & Science', 'INSTITUTION', 'PENDING_APPROVAL', 0, NOW());

INSERT IGNORE INTO users (id, email, password, full_name, mobile_number, institution_name, role, status, failed_login_attempts, created_at)
VALUES (7, 'rajesh.k@nitt.edu', '$2a$10$8.UnVuG9HHgffUDAlk8qfOuVGkqRzgVymGe07xd00DMxs.AQubh4a', 'Prof. Rajesh Kumar', '9123456789', 'National Institute of Technology Trichy', 'INSTITUTION', 'PENDING_APPROVAL', 0, NOW());

