# Production-Grade OTP Authentication System

A **high-performance, scalable OTP Authentication System** built with **Node.js, Express.js, Redis, BullMQ, Nodemailer, JWT, and Docker**.

The system is architected to **handle more than 100 OTP requests per second (6000+ requests/minute)** while maintaining **low response latency (<10ms for rejected requests and ~120–150ms for successful OTP generation)**. It uses **Redis-backed distributed rate limiting**, **asynchronous background email processing with BullMQ**, and **stateless API servers**, making it horizontally scalable for production deployments.

Unlike traditional synchronous OTP systems where the API waits for email delivery, this architecture immediately queues email jobs and returns the response to the client, enabling the API to continue serving thousands of incoming requests even when the email provider experiences delays or outages.

---

# Performance Highlights

✅ Sustained **100 Requests/Second**

✅ Successfully processed **6,010 requests** during stress testing

✅ **0 Server Crashes**

✅ **0 Worker Failures**

✅ **0 Redis Failures**

✅ **No Memory Leaks Observed**

✅ Average Response Time **5.8 ms** for rate-limited requests

✅ P95 Response Time **16 ms**

✅ Background email delivery through BullMQ

✅ Horizontally Scalable Architecture

---

# Load Testing Results

Load testing was performed using **Artillery** against the `/send-otp` endpoint.

## Test Configuration

```
Warm-up:
10 seconds

Sustained Load:
100 Requests/Second

Duration:
60 seconds
```

---

## Results

| Metric | Result |
|---------|---------|
| Total Requests | **6010** |
| Throughput | **~100 Requests/sec** |
| Average Response Time | **5.8 ms** |
| Median Response Time | **4 ms** |
| P95 | **16 ms** |
| P99 | **49.9 ms** |
| Server Errors | **0** |
| Worker Failures | **0** |
| API Crashes | **0** |

---

## Load Test Observations

During stress testing,

- Express API remained responsive.
- Redis continued serving requests without failures.
- BullMQ successfully accepted background jobs.
- Worker processes continued consuming jobs.
- Gmail SMTP became the only bottleneck due to Gmail's daily sending limits (`550 Daily user sending limit exceeded`), demonstrating that the application's architecture was capable of handling the traffic while the external email provider imposed the limitation.

---

# High-Level Architecture

```
                     Client
                        │
                        ▼
                Express REST API
                        │
        ┌───────────────┼───────────────┐
        │               │               │
        ▼               ▼               ▼
 Rate Limiter      OTP Service      Validation
        │               │
        └───────────────┘
                │
                ▼
        Redis Repository
                │
        ┌───────┼──────────┐
        │       │          │
        ▼       ▼          ▼
     OTP     Cooldown   Attempts
                │
                ▼
          BullMQ Queue
                │
                ▼
          Background Worker
                │
                ▼
          Nodemailer SMTP
                │
                ▼
            User Email
```

---

# Request Lifecycle (Step-by-Step)

## Step 1 – Client Requests an OTP

The client sends a request to:

```
POST /api/v1/auth/send-otp
```

with

```json
{
    "email": "user@gmail.com"
}
```

---

## Step 2 – Express Receives the Request

The Express server receives the request and forwards it to the authentication controller.

Responsibilities:

- Parse request
- Validate payload
- Invoke service layer

---

## Step 3 – Distributed Rate Limiter

Before any business logic executes, the request passes through **Express Rate Limiter** backed by Redis.

This prevents:

- API abuse
- DDoS attacks
- OTP spam
- Bot traffic

Each IP address has an independent request counter stored in Redis.

---

## Step 4 – OTP Service

The service layer performs the complete business workflow.

It checks:

- Request cooldown
- Hourly OTP limit
- Existing OTP
- Request validity

If all validations pass,

it generates a secure 6-digit OTP.

---

## Step 5 – OTP Hashing

The generated OTP is hashed using bcrypt.

Example:

```
638214

↓

bcrypt

↓

$2b$10....
```

Only the hash is stored in Redis.

The actual OTP never gets stored.

---

## Step 6 – Redis Storage

Redis stores temporary authentication data.

| Key | Purpose |
|------|----------|
| otp:user@email | OTP Hash |
| otp-cooldown:user@email | 60 Second Cooldown |
| otp-request-limit:user@email | Hourly Limit |
| otp-attempt:user@email | Failed Attempts |

Redis automatically removes expired keys using TTL.

---

## Step 7 – Queue Email Job

Instead of sending email directly,

the API pushes a job into BullMQ.

```
API

↓

BullMQ Queue

↓

Redis
```

The API immediately responds:

```json
{
    "success": true,
    "message": "OTP Sent Successfully"
}
```

without waiting for SMTP.

---

## Step 8 – Background Worker

A dedicated BullMQ worker continuously listens for new jobs.

```
while(true)

↓

Fetch Job

↓

Send Email

↓

Complete Job
```

This completely decouples email delivery from API response time.

---

## Step 9 – Email Delivery

The worker establishes an SMTP connection using Nodemailer and sends the OTP email.

If email sending fails,

BullMQ automatically retries the job based on the configured retry policy.

---

## Step 10 – OTP Verification

When the user submits the OTP,

the API:

- Retrieves the OTP hash from Redis
- Uses bcrypt.compare()
- Deletes OTP after successful verification
- Generates a JWT token

---

# Configuration

## Express

- REST API
- Middleware
- Routing
- Validation

---

## Redis

Used for

- OTP Storage
- Rate Limiting
- Cooldowns
- Failed Attempts
- BullMQ Backend

TTL ensures automatic cleanup.

---

## BullMQ

Configuration includes:

- Redis Connection
- Retry Attempts
- Exponential Backoff
- Background Job Processing

---

## Nodemailer

Responsible only for SMTP communication.

The architecture allows replacing Gmail with:

- Amazon SES
- Brevo
- SendGrid
- Mailgun
- Postmark

without changing business logic.

---

## JWT

After successful OTP verification,

JWT tokens are generated for authenticated API access.

---

# Scalability

The application is designed to scale horizontally.

```
                 Load Balancer
                      │
      ┌───────────────┼───────────────┐
      ▼               ▼               ▼
    API-1          API-2          API-3
      │               │               │
      └───────────────┼───────────────┘
                      │
                  Redis Cluster
                      │
                 BullMQ Queue
                      │
      ┌───────────────┼───────────────┐
      ▼               ▼               ▼
   Worker-1       Worker-2       Worker-3
                      │
                      ▼
             SMTP / SES / SendGrid
```

Because API servers are stateless and Redis acts as the centralized coordination layer, additional API instances and worker processes can be added without modifying application code, allowing the system to scale to significantly higher request volumes.

---

# Technology Stack

- Node.js
- Express.js
- Redis
- BullMQ
- Nodemailer
- JWT
- bcrypt
- Docker
- Artillery
- express-rate-limit
