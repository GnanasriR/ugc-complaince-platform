# UGC Compliance & Approval Portal - Polyglot Persistence Microservices Backend Architecture

A robust, distributed **Spring Boot 3 + Spring Cloud** Microservices Architecture with **Eureka Service Discovery**, **Spring Cloud API Gateway**, **JWT Authentication**, and **Polyglot Persistence (MySQL for Auth + MongoDB for Domain & AI Services)**.

---

## 🏗️ Polyglot Microservices Ecosystem Summary

| Service Directory | Microservice Name | Port | Database Type | Database Name | Key Responsibilities |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `discovery-service/` | Discovery Service | `8761` | N/A | N/A | Eureka Service Registry & Discovery Server |
| `api-gateway/` | API Gateway | `8080` | N/A | N/A | Single Entry Point, Routing, CORS, JWT Auth Gateway Filter |
| `auth-service/` | Auth & User Service | `8086` | **MySQL** | `ugc_auth_db` | User Registration, Mobile OTP Verification, BCrypt Login, 24h JWT, Roles, Password Reset, Audit Log |
| `application-service/` | Application Service | `8081` | **MongoDB** | `ugc_application_db` | UGC/AICTE Application Creation, Unique ID Gen (`AICTE-2025-04821`), 5-step Draft Auto-Save, Annexures & SHA-256 Hashes |
| `nlp-service/` | NLP Verification Service | `8082` | **MongoDB** | `ugc_nlp_db` | Parameter Extraction (14 params), Cross-Annexure Consistency (>5% Discrepancies), Norm Check & Score (0–100) |
| `ml-service/` | ML Scoring Service | `8087` | **MongoDB** | `ugc_ml_db` | XGBoost Approval Probability Scoring, SHAP Feature Attribution, Institution Self-Assessment Pre-Checker |
| `anomaly-service/` | Anomaly Audit Service | `8083` | **MongoDB** | `ugc_anomaly_db` | Document Metadata Forgery Audit, YoY Trend Anomaly Check (>30% faculty drop), Notice Dispatch (14-day deadline) |
| `analytics-service/` | Analytics & Reporting | `8084` | **MongoDB** | `ugc_analytics_db` | Live Pipeline Aggregations, Standardised PDF Evaluation Report Generation, Cohen's Kappa Evaluator Consistency |
| `notification-service/` | Notification Service | `8085` | **MongoDB** | `ugc_notification_db` | User Alerts & System Notifications |
| `ai-service/` | AI Service | `8088` | **MongoDB** | `ugc_ai_db` | AI Document Inspection, Cross-Annexure Discrepancy Detection, Persistent Stored AI Evaluation Reports |

---

## ⚡ Quick Start & Run Instructions

### 1. Database Requirements
- **MySQL 8.x**: Running on `localhost:3306` (`root` / `root`) for `auth-service` (`ugc_auth_db`).
- **MongoDB 6.x / 7.x**: Running on `localhost:27017` for all other microservices (`ugc_application_db`, `ugc_nlp_db`, `ugc_ml_db`, `ugc_anomaly_db`, `ugc_analytics_db`, `ugc_notification_db`, `ugc_ai_db`).

### 2. Compile All Microservices
Open a terminal in `microservices/` directory:
```bash
mvn clean package -DskipTests
```

### 3. Launch Microservices (In Order)

1. **Discovery Service**:
   ```bash
   cd discovery-service && mvn spring-boot:run
   ```
2. **Auth Service (MySQL)**:
   ```bash
   cd auth-service && mvn spring-boot:run
   ```
3. **API Gateway**:
   ```bash
   cd api-gateway && mvn spring-boot:run
   ```
4. **MongoDB Services**:
   ```bash
   cd application-service && mvn spring-boot:run
   cd nlp-service && mvn spring-boot:run
   cd ml-service && mvn spring-boot:run
   cd anomaly-service && mvn spring-boot:run
   cd analytics-service && mvn spring-boot:run
   cd notification-service && mvn spring-boot:run
   cd ai-service && mvn spring-boot:run
   ```
