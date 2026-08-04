# OTP Authentication System

A production-style OTP Authentication System built using **Node.js**, **Express.js**, **Redis**, **BullMQ**, **Nodemailer**, and **JWT**.

The project is designed to handle high traffic by separating the API from email delivery using an asynchronous job queue.

---

# Architecture

```
                        Client
                           │
                           │
                   POST /send-otp
                           │
                           ▼
                  Express.js API Server
                           │
          ┌────────────────┼─────────────────┐
          │                │                 │
          │                │                 │
          ▼                ▼                 ▼
   Express Rate      OTP Validation      Redis
      Limiter        Business Logic      Repository
          │                │                 │
          │                │                 │
          └────────────────┼─────────────────┘
                           │
                           ▼
                  OTP Service Layer
                           │
           Generate OTP & Hash OTP
                           │
                           ▼
                    Redis Database
         ┌─────────────────────────────────┐
         │                                 │
         │ otp:user@email                  │
         │ otp-cooldown:user@email         │
         │ otp-attempt:user@email          │
         │ otp-request-limit:user@email    │
         └─────────────────────────────────┘
                           │
                           ▼
                     BullMQ Queue
                           │
                           ▼
                    Redis Job Queue
                           │
                           ▼
                     Worker Process
                           │
                           ▼
                    Nodemailer SMTP
                           │
                           ▼
                     User Mailbox
```

---

# High Level Flow

```
Client

↓

API receives request

↓

Rate Limiter

↓

OTP Validation

↓

Generate OTP

↓

Hash OTP

↓

Store Hash in Redis

↓

Push Email Job to BullMQ

↓

Return Success Response

↓

Worker Picks Job

↓

Send Email

↓

User Receives OTP
```

Notice that the API **does not wait** for the email to be sent.

The API immediately returns a success response after the email job is pushed to BullMQ.

This significantly improves API response time.

---

# Project Structure

```
src
│
├── config
│      redis.js
│      bullmq.js
│      mail.js
│
├── controllers
│      auth.controller.js
│
├── services
│      otp.service.js
│
├── repositories
│      otp.repository.js
│
├── queues
│      email.queue.js
│
├── workers
│      email.worker.js
│
├── middleware
│      otpRateLimiter.js
│
├── routes
│      auth.routes.js
│
├── utils
│      otpGenerator.js
│      hash.js
│
└── app.js
```

---

# Component Explanation

## Express API

Responsibilities

- Receives incoming HTTP requests
- Validates request body
- Calls Service Layer
- Returns API response

Express should never contain business logic.

---

## Controller Layer

Responsible for

- Receiving request
- Calling service
- Sending response

Example

```
Controller

↓

OTP Service

↓

Return Response
```

---

## Service Layer

Contains complete business logic.

Responsibilities

- Generate OTP
- Hash OTP
- Store OTP
- Check cooldown
- Check request limits
- Push email job

This is the heart of the application.

---

## Repository Layer

Responsible for communicating with Redis.

Instead of writing Redis code everywhere,

```
redis.get()

redis.set()

redis.del()
```

all Redis operations are isolated inside the repository.

Benefits

- Clean code
- Easier testing
- Easier migration

---

# Redis Usage

Redis stores temporary authentication data.

---

## OTP Storage

```
Key

otp:user@gmail.com

Value

hashed OTP

TTL

300 seconds
```

Purpose

Stores OTP until expiration.

---

## Cooldown

```
otp-cooldown:user@gmail.com

TTL

60 seconds
```

Purpose

Prevents users from requesting OTP repeatedly.

---

## Failed Attempts

```
otp-attempt:user@gmail.com

TTL

300 seconds
```

Purpose

Locks user after multiple incorrect OTP attempts.

---

## Hourly Request Limit

```
otp-request-limit:user@gmail.com

TTL

3600 seconds
```

Purpose

Maximum OTP requests allowed per hour.

---

## Express Rate Limiter

```
otp-rate:<IP>
```

Purpose

Protects server against DDoS and spam.

Implemented using

- express-rate-limit
- RedisStore

---

# OTP Generation

The service generates a random six-digit OTP.

Example

```
582941
```

Before storing,

```
OTP

↓

bcrypt

↓

Hash

↓

Redis
```

Only the hash is stored.

Even if Redis is compromised,

actual OTP cannot be recovered.

---

# BullMQ Queue

Instead of sending email inside API,

the API pushes a job.

```
Queue.add()

↓

Redis Queue

↓

Worker

↓

Email
```

Benefits

- Faster API
- Retry mechanism
- Background processing
- Horizontal scalability

---

# Worker

Worker continuously listens for new jobs.

```
while(true)

↓

New Job?

↓

Yes

↓

Send Email
```

If email fails,

BullMQ retries automatically.

---

# Email Flow

Worker receives

```
Email

OTP
```

↓

Creates Email

↓

SMTP Connection

↓

Mail Sent

---

# Verification Flow

Client enters OTP

↓

API receives OTP

↓

Redis fetches hashed OTP

↓

bcrypt.compare()

↓

Correct

↓

Generate JWT

↓

Delete OTP

↓

Login Successful

---

# JWT Authentication

After successful verification

```
JWT Generated

↓

Client Stores Token

↓

Authorization Header

↓

Protected APIs
```

---

# Security Features

## OTP Hashing

OTP is never stored in plaintext.

---

## OTP Expiration

Automatically expires after 5 minutes.

---

## Cooldown

User cannot request OTP continuously.

---

## Failed Attempt Protection

Account locks after repeated invalid OTPs.

---

## Hourly Limit

Limits OTP generation.

---

## IP Rate Limiting

Protects server from abuse.

---

## Redis TTL

Automatic cleanup.

No cron jobs required.

---

# Performance Optimizations

## Redis

O(1) read/write operations.

---

## Asynchronous Email

API never waits for SMTP.

---

## BullMQ

Background processing.

---

## Rate Limiting

Rejects abusive requests immediately.

---

## Repository Pattern

Cleaner architecture.

---

## Service Layer

Business logic separated from HTTP layer.

---

# Scalability

Current Architecture

```
           API
            │
            ▼
         Redis
            │
            ▼
         BullMQ
            │
            ▼
         Worker
```

Scalable Architecture

```
                 Load Balancer
                      │
      ┌───────────────┼───────────────┐
      ▼               ▼               ▼
   API-1           API-2           API-3
      │               │               │
      └───────────────┼───────────────┘
                      ▼
                   Redis
                      │
               BullMQ Queue
                      │
      ┌───────────────┼───────────────┐
      ▼               ▼               ▼
   Worker-1       Worker-2       Worker-3
                      │
                      ▼
               Email Provider
```

Since Redis is centralized,

multiple API servers and multiple workers can run simultaneously.

No code changes are required.

---

# Load Testing Results

The system was load tested using Artillery.

Results

- Sustained approximately 100 Requests/Second
- Thousands of requests processed successfully
- Average API latency below 10ms for rate-limited requests
- Background email processing handled asynchronously
- During stress testing, Gmail SMTP became the bottleneck due to its daily sending quota, while the API, Redis, and BullMQ components continued to operate correctly.

---

# Future Improvements

- Amazon SES
- SendGrid
- Mailgun
- Brevo
- RabbitMQ/Kafka support
- Docker Compose
- Kubernetes deployment
- Prometheus monitoring
- Grafana dashboards
- OpenTelemetry tracing
- Distributed Redis Cluster
- Horizontal worker autoscaling

---

# Tech Stack

- Node.js
- Express.js
- Redis
- BullMQ
- Nodemailer
- JWT
- bcrypt
- express-rate-limit
- Docker
- Artillery
