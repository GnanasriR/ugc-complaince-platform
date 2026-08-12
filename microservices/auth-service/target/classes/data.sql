INSERT IGNORE INTO users (id, email, password, full_name, mobile_number, institution_name, role, status, failed_login_attempts, created_at)
VALUES (1, 'admin@ugc.gov.in', '$2a$10$E2b7bVq7aHhVq4K9lQx0e.21F3H1O4o0xZ9a8b7c6d5e4f3g2h1i', 'Dr. System Administrator', '9876543210', 'University Grants Commission', 'ADMIN', 'ACTIVE', 0, NOW());

INSERT IGNORE INTO users (id, email, password, full_name, mobile_number, institution_name, role, status, failed_login_attempts, created_at)
VALUES (2, 'officer@ugc.gov.in', '$2a$10$E2b7bVq7aHhVq4K9lQx0e.21F3H1O4o0xZ9a8b7c6d5e4f3g2h1i', 'Dr. Ramesh Kumar', '9876543211', 'UGC Verification Directorate', 'EVALUATOR', 'ACTIVE', 0, NOW());

INSERT IGNORE INTO users (id, email, password, full_name, mobile_number, institution_name, role, status, failed_login_attempts, created_at)
VALUES (3, 'registrar@rgit.ac.in', '$2a$10$E2b7bVq7aHhVq4K9lQx0e.21F3H1O4o0xZ9a8b7c6d5e4f3g2h1i', 'Prof. Suresh Sharma', '9876543212', 'Rajiv Gandhi Institute of Technology', 'INSTITUTION', 'ACTIVE', 0, NOW());
