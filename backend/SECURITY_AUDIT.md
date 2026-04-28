# Security Audit

Date: 2026-04-28

This audit lists secret-like values found during the backend-wide scan after the deployment fixes. Actual secret values are intentionally omitted.

## Runtime Configuration Findings

| File | Line | Type |
| --- | ---: | --- |
| `backend/creatorx-api/src/main/resources/application.yml` | 12 | Database password default |
| `backend/creatorx-api/src/main/resources/application.yml` | 173 | Social token secret default |
| `backend/creatorx-api/src/main/java/com/creatorx/api/controller/SocialConnectController.java` | 55 | Social token secret default |
| `backend/docker-compose.yml` | 11 | PostgreSQL password default |
| `backend/docker-compose.yml` | 61 | Application database password default |
| `backend/docker-compose.yml` | 111 | Supabase Studio PostgreSQL password default |
| `backend/docker-compose.yml` | 133 | Postgres Meta password default |
| `backend/env.example` | 4 | PostgreSQL password placeholder |
| `backend/env.example` | 17 | Supabase JWT secret placeholder |
| `backend/env.example` | 18 | Supabase service role key placeholder |
| `backend/env.example` | 21 | JWT secret placeholder |
| `backend/railway.env.example` | 8 | Database URL password placeholder |
| `backend/railway.env.example` | 10 | Supabase database password placeholder |
| `backend/railway.env.example` | 18 | Supabase service key placeholder |
| `backend/railway.env.example` | 19 | Supabase JWT secret placeholder |
| `backend/railway.env.example` | 25 | Razorpay key secret placeholder |
| `backend/railway.env.example` | 26 | Razorpay webhook secret placeholder |
| `backend/railway.env.example` | 31 | Redis password placeholder |
| `backend/railway.env.example` | 38 | SendGrid API key placeholder |
| `backend/railway.env.example` | 44 | Firebase private key placeholder |

## Test and Seed Data Findings

| File | Line | Type |
| --- | ---: | --- |
| `backend/creatorx-api/src/test/resources/application-test.yml` | 9 | Test database password |
| `backend/creatorx-api/src/test/resources/application-test.yml` | 55 | Test Supabase JWT secret |
| `backend/creatorx-api/src/test/resources/application-test.yml` | 62 | Test JWT secret default |
| `backend/creatorx-api/src/test/resources/application-test.yml` | 67 | Test social token secret default |
| `backend/creatorx-api/src/test/resources/application-test.yml` | 81 | Test webhook secret |
| `backend/creatorx-api/src/test/resources/application-test-postgres.yml` | 14 | Test database password |
| `backend/creatorx-api/src/test/resources/application-test-postgres.yml` | 65 | Test JWT secret |
| `backend/creatorx-api/src/test/resources/application-test-postgres.yml` | 69 | Test social token secret |
| `backend/creatorx-api/src/test/java/com/creatorx/api/integration/AuthenticationIntegrationTest.java` | 168 | Test-only invalid JWT signing secret |
| `backend/run-integration-tests.sh` | 18 | Test user password |
| `backend/db/seed/seed-data.sql` | 14 | Seeded test password hash |
| `backend/test-data-setup.sql` | 14 | Seeded test password hash |

## Documentation and Sample Data Findings

| File | Line | Type |
| --- | ---: | --- |
| `backend/README.md` | 136 | Database password example |
| `backend/README.md` | 140 | Supabase service role key placeholder |
| `backend/README.md` | 166 | Database password example |
| `backend/DOCKER_SETUP.md` | 126 | PostgreSQL password example |
| `backend/EMAIL_SETUP_GUIDE.md` | 56 | SendGrid API key example |
| `backend/TESTING_SCRIPT.md` | 102 | Test password example |
| `backend/TESTING_SCRIPT.md` | 137 | Test password example |
| `backend/INTEGRATION_TESTING_GUIDE.md` | 133 | Test password example |
| `backend/INTEGRATION_TESTING_GUIDE.md` | 134 | Test password example |
| `backend/INTEGRATION_TESTING_GUIDE.md` | 135 | Test password example |
| `backend/INTEGRATION_TESTING_GUIDE.md` | 136 | Test password example |

## Notes

- `.gitignore` already ignores `.env`, `.env.local`, `.env.staging`, `.env.production`, and `.env.*.local` while explicitly allowing example files.
- Values in `*.example`, documentation, and test files appear to be placeholders or test credentials, but they should still be reviewed before deployment documentation is shared externally.
