/**
 * PHASE 2.4 — Comprehensive End-to-End Functional Verification Test Suite
 * Covers Requirements 4, 5, 6:
 * - Registration, password hashing, role escalation prevention
 * - Login, lockout, credential protection
 * - Protected routes & Bearer token verification
 * - Student vs Admin authorization on all admin endpoints
 * - Account suspension, IDOR prevention, and Admin unlock recovery
 * - Mock interview submission & history retrieval
 * - Aptitude submission & history retrieval
 * - Gemini AI endpoint validation, auth, and error handling
 * - Sandbox execution endpoint validation, auth, and execution
 *
 * NOTE: Secrets (API keys, passwords, JWT tokens) are NEVER logged.
 */

const axios = require('axios');
const path = require('path');
const dotenv = require('dotenv');
const mysql = require('mysql2/promise');

dotenv.config({ path: path.join(__dirname, '../.env') });
const API_BASE = process.env.TEST_API_URL || 'http://localhost:8080/api';

const client = axios.create({
  baseURL: API_BASE,
  validateStatus: () => true // Allow handling all HTTP status codes directly
});

// Database pool to verify hash integrity directly
const dbPool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'elevate_db',
  waitForConnections: true,
  connectionLimit: 5
});

async function runVerification() {
  console.log('===============================================================');
  console.log('[PHASE 2.4] VEYRA AI END-TO-END FUNCTIONAL VERIFICATION');
  console.log(`Target: ${API_BASE}`);
  console.log('===============================================================\n');

  let passed = 0;
  let failed = 0;
  const results = [];

  function record(section, condition, name, details = '') {
    if (condition) {
      console.log(`[PASS] [${section}] ${name}`);
      passed++;
      results.push({ section, name, status: 'PASS', details });
    } else {
      console.error(`[FAIL] [${section}] ${name} - Details: ${details}`);
      failed++;
      results.push({ section, name, status: 'FAIL', details });
    }
  }

  try {
    // =========================================================================
    // SECTION 1: Health & Connectivity
    // =========================================================================
    const health = await client.get('/health');
    record('System', health.status === 200 && health.data?.status === 'ok',
      'Backend Express server health check responds with 200 OK',
      `Status: ${health.status}`
    );

    // =========================================================================
    // SECTION 2: Registration, Password Hashing & Role Escalation Prevention
    // =========================================================================
    const uniqueEmail = `student_e2e_${Date.now()}@veyra.test`;
    const regRes = await client.post('/auth/register', {
      name: 'Verification Candidate',
      email: uniqueEmail,
      password: 'SecurePassword123!',
      role: 'admin' // Attempted privilege escalation
    });

    record('Auth', regRes.status === 201, 'Registration returns 201 Created', `Status: ${regRes.status}`);
    record('Auth', regRes.data?.user?.role === 'student', 'Registration rejects role escalation (role forced to "student")', `Role: ${regRes.data?.user?.role}`);
    record('Auth', !regRes.data?.user?.password, 'Registration does not leak password hash in response', `Exposed: ${Boolean(regRes.data?.user?.password)}`);
    record('Auth', typeof regRes.data?.token === 'string' && regRes.data.token.length > 20, 'Registration issues signed JWT session token');

    const candidateId = regRes.data?.user?.id;
    const candidateToken = regRes.data?.token;

    // Verify Password Hash in MySQL database
    if (candidateId) {
      const [dbRows] = await dbPool.execute('SELECT password FROM users WHERE id = ?', [candidateId]);
      const storedHash = dbRows[0]?.password || '';
      const isBcryptHash = storedHash.startsWith('$2a$') || storedHash.startsWith('$2b$');
      record('Auth', isBcryptHash, 'Password is stored as bcrypt hash in DB (never plaintext)', `Hash format valid: ${isBcryptHash}`);
    }

    // Registration validation: password too short (< 8 chars)
    const shortPassRes = await client.post('/auth/register', {
      name: 'Short Pass',
      email: `short_${Date.now()}@test.com`,
      password: '123'
    });
    record('Auth', shortPassRes.status === 400, 'Registration rejects passwords < 8 characters with 400 Bad Request', `Status: ${shortPassRes.status}`);

    // Registration validation: invalid email format
    const badEmailRes = await client.post('/auth/register', {
      name: 'Bad Email',
      email: 'not-an-email',
      password: 'ValidPassword123!'
    });
    record('Auth', badEmailRes.status === 400, 'Registration rejects malformed email address with 400 Bad Request', `Status: ${badEmailRes.status}`);

    // =========================================================================
    // SECTION 3: Login, Session & Lockout Protection
    // =========================================================================
    const loginRes = await client.post('/auth/login', {
      email: uniqueEmail,
      password: 'SecurePassword123!'
    });
    record('Auth', loginRes.status === 200, 'Login with valid credentials succeeds with 200 OK', `Status: ${loginRes.status}`);
    record('Auth', loginRes.data?.user?.role === 'student', 'Logged-in user role is student', `Role: ${loginRes.data?.user?.role}`);
    record('Auth', !loginRes.data?.user?.password, 'Login response does not leak password hash', `Exposed: ${Boolean(loginRes.data?.user?.password)}`);
    const activeStudentToken = loginRes.data?.token;

    // Login with invalid password
    const badLoginRes = await client.post('/auth/login', {
      email: uniqueEmail,
      password: 'WrongPassword999!'
    });
    record('Auth', badLoginRes.status === 401, 'Login with incorrect password rejected with 401 Unauthorized', `Status: ${badLoginRes.status}`);

    // =========================================================================
    // SECTION 4: Protected Routes & Bearer Token Authentication
    // =========================================================================
    const unauthTemplates = await client.get('/interview/templates');
    record('Security', unauthTemplates.status === 401, 'Accessing /api/interview/templates without token rejected with 401', `Status: ${unauthTemplates.status}`);

    const forgedTokenRes = await client.get('/interview/templates', {
      headers: { Authorization: 'Bearer forged.fake.jwt.token' }
    });
    record('Security', forgedTokenRes.status === 401, 'Accessing protected route with forged token rejected with 401', `Status: ${forgedTokenRes.status}`);

    const authedTemplates = await client.get('/interview/templates', {
      headers: { Authorization: `Bearer ${activeStudentToken}` }
    });
    record('Security', authedTemplates.status === 200 && Array.isArray(authedTemplates.data),
      'Accessing /api/interview/templates with valid student token succeeds (200 OK)',
      `Template count: ${authedTemplates.data?.length}`
    );

    // =========================================================================
    // SECTION 5: Student vs Admin Authorization
    // =========================================================================
    // Student attempting admin endpoints
    const studentNexusConfig = await client.get('/nexus/config', {
      headers: { Authorization: `Bearer ${activeStudentToken}` }
    });
    record('RBAC', studentNexusConfig.status === 403, 'Regular student forbidden from GET /api/nexus/config (403 Forbidden)', `Status: ${studentNexusConfig.status}`);

    const studentGlobalAnalytics = await client.get('/nexus/global-analytics', {
      headers: { Authorization: `Bearer ${activeStudentToken}` }
    });
    record('RBAC', studentGlobalAnalytics.status === 403, 'Regular student forbidden from GET /api/nexus/global-analytics (403 Forbidden)', `Status: ${studentGlobalAnalytics.status}`);

    const studentUnlock = await client.post('/auth/unlock', { userId: '1' }, {
      headers: { Authorization: `Bearer ${activeStudentToken}` }
    });
    record('RBAC', studentUnlock.status === 403, 'Regular student forbidden from POST /api/auth/unlock (403 Forbidden)', `Status: ${studentUnlock.status}`);

    // Admin login and admin access
    const adminLogin = await client.post('/auth/login', {
      email: 'admin@elevateai.com',
      password: 'admin'
    });
    record('RBAC', adminLogin.status === 200 && adminLogin.data?.user?.role === 'admin',
      'Admin login succeeds and confirms admin role',
      `Status: ${adminLogin.status}, Role: ${adminLogin.data?.user?.role}`
    );
    const adminToken = adminLogin.data?.token;

    if (adminToken) {
      const adminNexusGet = await client.get('/nexus/config', {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      record('RBAC', adminNexusGet.status === 200, 'Admin authorized to access GET /api/nexus/config (200 OK)', `Status: ${adminNexusGet.status}`);

      const adminAnalytics = await client.get('/nexus/global-analytics', {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      record('RBAC', adminAnalytics.status === 200, 'Admin authorized to access GET /api/nexus/global-analytics (200 OK)', `Status: ${adminAnalytics.status}`);
    }

    // =========================================================================
    // SECTION 6: Account Suspension, IDOR Prevention & Admin Unlock Recovery
    // =========================================================================
    // 6a. Unauthenticated suspension attempt
    const unauthSuspend = await client.post('/auth/suspend', { userId: candidateId, reason: 'test' });
    record('Suspension', unauthSuspend.status === 401, 'Unauthenticated POST /api/auth/suspend rejected with 401', `Status: ${unauthSuspend.status}`);

    // 6b. IDOR check: Student attempting to suspend admin (id '2')
    const idorSuspend = await client.post('/auth/suspend', {
      userId: '2',
      reason: 'Malicious suspension attempt'
    }, {
      headers: { Authorization: `Bearer ${activeStudentToken}` }
    });
    record('Suspension', idorSuspend.status === 403, 'Student cannot suspend another user account (IDOR prevention, 403 Forbidden)', `Status: ${idorSuspend.status}`);

    // 6c. Valid self-suspension (e.g. 5 proctoring violations triggered)
    const validSelfSuspend = await client.post('/auth/suspend', {
      userId: candidateId,
      reason: 'Proctoring violation limit reached during video interview',
      warnings: 5
    }, {
      headers: { Authorization: `Bearer ${activeStudentToken}` }
    });
    record('Suspension', validSelfSuspend.status === 200, 'Student valid self-suspension succeeds with 200 OK', `Status: ${validSelfSuspend.status}`);

    // 6d. Attempt to login while suspended
    const suspendedLogin = await client.post('/auth/login', {
      email: uniqueEmail,
      password: 'SecurePassword123!'
    });
    record('Suspension', suspendedLogin.status === 403, 'Login rejected with 403 Forbidden while account is suspended', `Status: ${suspendedLogin.status}`);

    // 6e. Admin unlocks candidate account (Recovery flow)
    const unlockRes = await client.post('/auth/unlock', {
      userId: candidateId
    }, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    record('Suspension', unlockRes.status === 200 && unlockRes.data?.success, 'Admin can successfully unlock suspended account (Recovery flow, 200 OK)', `Status: ${unlockRes.status}`);

    // 6f. Login after admin unlock succeeds
    const recoveredLogin = await client.post('/auth/login', {
      email: uniqueEmail,
      password: 'SecurePassword123!'
    });
    record('Suspension', recoveredLogin.status === 200, 'Account successfully logs in after admin recovery unlock (200 OK)', `Status: ${recoveredLogin.status}`);
    const recoveredToken = recoveredLogin.data?.token;

    // Profile update verification
    const profileRes = await client.put('/auth/profile', {
      name: 'E2E Candidate Updated',
      title: 'Full Stack Engineer',
      bio: 'Audited candidate profile',
      skills: ['React', 'Node.js', 'Express']
    }, {
      headers: { Authorization: `Bearer ${recoveredToken}` }
    });
    record('Profile', profileRes.status === 200 && profileRes.data?.user?.title === 'Full Stack Engineer',
      'Profile update PUT /api/auth/profile succeeds and returns updated safe user',
      `Title: ${profileRes.data?.user?.title}`
    );

    // =========================================================================
    // SECTION 7: Mock Interview Submission & History
    // =========================================================================
    const interviewSubmission = await client.post('/interview/submit', {
      templateId: 'role-react',
      qaPairs: [
        {
          question: 'Explain the difference between functional and class components in React.',
          userAnswer: 'Functional components are plain JavaScript functions that accept props and return JSX. They utilize React hooks like useState and useEffect for state management and lifecycle methods, whereas class components extend React.Component and use lifecycle methods like componentDidMount.'
        }
      ],
      durationSeconds: 145,
      presenceScore: 98
    }, {
      headers: { Authorization: `Bearer ${recoveredToken}` }
    });
    record('Interview', interviewSubmission.status === 201, 'Mock interview submission succeeds with 201 Created', `Status: ${interviewSubmission.status}`);
    record('Interview', typeof interviewSubmission.data?.overallScore === 'number', 'Interview evaluation generates numeric overall score', `Score: ${interviewSubmission.data?.overallScore}`);
    record('Interview', typeof interviewSubmission.data?.integrityScore === 'number', 'Interview evaluation generates integrity score', `Integrity: ${interviewSubmission.data?.integrityScore}`);
    record('Interview', typeof interviewSubmission.data?.feedback === 'string' && interviewSubmission.data?.feedback.includes('derived estimates'),
      'Interview report identifies technical and behavioral sub-scores as derived estimates',
      interviewSubmission.data?.feedback
    );

    // Fetch Interview History
    const historyRes = await client.get('/interview/history', {
      headers: { Authorization: `Bearer ${recoveredToken}` }
    });
    record('Interview', historyRes.status === 200 && Array.isArray(historyRes.data) && historyRes.data.length > 0,
      'Candidate can retrieve past interview reports from /api/interview/history',
      `Reports count: ${historyRes.data?.length}`
    );

    // =========================================================================
    // SECTION 8: Aptitude Submission & Results Display History
    // =========================================================================
    // Fetch aptitude questions
    const aptQuestionsRes = await client.get('/interview/aptitude', {
      headers: { Authorization: `Bearer ${recoveredToken}` }
    });
    record('Aptitude', aptQuestionsRes.status === 200 && Array.isArray(aptQuestionsRes.data) && aptQuestionsRes.data.length > 0,
      'Aptitude question bank is accessible (200 OK)',
      `Questions count: ${aptQuestionsRes.data?.length}`
    );

    // Submit aptitude test result
    const testResultId = `apt-e2e-${Date.now()}`;
    const aptSubmitRes = await client.post('/interview/aptitude/submit', {
      id: testResultId,
      date: new Date().toISOString(),
      percentage: 80,
      correctAnswers: 4,
      totalQuestions: 5,
      duration: '4m 12s',
      details: [
        {
          questionId: 'apt-1',
          question: 'What is 10 + 20?',
          options: ['20', '30', '40', '50'],
          selectedOption: 1,
          correctOption: 1,
          isCorrect: true,
          explanation: '10 + 20 = 30.'
        }
      ]
    }, {
      headers: { Authorization: `Bearer ${recoveredToken}` }
    });
    record('Aptitude', aptSubmitRes.status === 201, 'Aptitude test submission succeeds with 201 Created', `Status: ${aptSubmitRes.status}`);

    // Retrieve aptitude history and confirm record exists (for navigation/refresh)
    const aptHistoryRes = await client.get('/interview/aptitude/history', {
      headers: { Authorization: `Bearer ${recoveredToken}` }
    });
    const foundApt = (aptHistoryRes.data || []).find(r => r.id === testResultId);
    record('Aptitude', aptHistoryRes.status === 200 && Boolean(foundApt),
      'Aptitude test result persisted and retrievable by ID for page refresh/direct navigation',
      `Found ID: ${foundApt?.id}`
    );

    // =========================================================================
    // SECTION 9: Gemini AI Endpoint Verification
    // =========================================================================
    // 9a. Missing authentication -> 401
    const unauthGemini = await client.post('/gemini/ask', {
      history: [{ role: 'user', text: 'Respond with 1 word: Ready' }]
    });
    record('Gemini', unauthGemini.status === 401, 'POST /api/gemini/ask rejects unauthenticated requests with 401', `Status: ${unauthGemini.status}`);

    // 9b. Non-array history -> 400 Bad Request
    const badHistoryGemini = await client.post('/gemini/ask', {
      history: 'Not an array',
      systemInstruction: 'Test'
    }, {
      headers: { Authorization: `Bearer ${recoveredToken}` }
    });
    record('Gemini', badHistoryGemini.status === 400, 'POST /api/gemini/ask rejects non-array history with 400 Bad Request', `Status: ${badHistoryGemini.status}`);

    // 9c. Oversized system instruction (> 10,000 chars) -> 400
    const hugeInstructionGemini = await client.post('/gemini/ask', {
      history: [{ role: 'user', text: 'Hi' }],
      systemInstruction: 'A'.repeat(10500)
    }, {
      headers: { Authorization: `Bearer ${recoveredToken}` }
    });
    record('Gemini', hugeInstructionGemini.status === 400, 'POST /api/gemini/ask rejects oversized system instruction with 400 Bad Request', `Status: ${hugeInstructionGemini.status}`);

    // 9d. Valid authenticated request to Gemini
    const validGemini = await client.post('/gemini/ask', {
      history: [{ role: 'user', text: 'Respond with one word: VERIFIED' }],
      systemInstruction: 'You are a testing assistant. Reply with only one word.'
    }, {
      headers: { Authorization: `Bearer ${recoveredToken}` }
    });
    const geminiText = validGemini.data?.text || validGemini.data?.response;
    record('Gemini', validGemini.status === 200 && typeof geminiText === 'string',
      'POST /api/gemini/ask with valid token succeeds and returns AI response',
      `Status: ${validGemini.status}, Response: ${geminiText?.trim()?.substring(0, 50)}`
    );

    // =========================================================================
    // SECTION 10: Sandbox Execution Endpoint Verification
    // =========================================================================
    // 10a. Unauthenticated sandbox run -> 401
    const unauthSandbox = await client.post('/sandbox/run', {
      code: 'console.log("test");',
      language: 'javascript'
    });
    record('Sandbox', unauthSandbox.status === 401, 'POST /api/sandbox/run rejects unauthenticated requests with 401', `Status: ${unauthSandbox.status}`);

    // 10b. Missing code -> 400 Bad Request
    const noCodeSandbox = await client.post('/sandbox/run', {
      language: 'javascript'
    }, {
      headers: { Authorization: `Bearer ${recoveredToken}` }
    });
    record('Sandbox', noCodeSandbox.status === 400, 'POST /api/sandbox/run rejects missing code with 400 Bad Request', `Status: ${noCodeSandbox.status}`);

    // 10c. Oversized code (> 64 KB) -> 400
    const hugeSandbox = await client.post('/sandbox/run', {
      code: 'x'.repeat(70000),
      language: 'javascript'
    }, {
      headers: { Authorization: `Bearer ${recoveredToken}` }
    });
    record('Sandbox', hugeSandbox.status === 400, 'POST /api/sandbox/run rejects code exceeding 64KB with 400 Bad Request', `Status: ${hugeSandbox.status}`);

    // 10d. Unsupported language -> 400
    const unsupportedLangSandbox = await client.post('/sandbox/run', {
      code: 'print(1)',
      language: 'invalid_lang_xyz'
    }, {
      headers: { Authorization: `Bearer ${recoveredToken}` }
    });
    record('Sandbox', unsupportedLangSandbox.status === 400, 'POST /api/sandbox/run rejects unsupported language with 400 Bad Request', `Status: ${unsupportedLangSandbox.status}`);

    // 10e. Authenticated execution request handling
    const validSandbox = await client.post('/sandbox/run', {
      code: 'console.log("VEYRA_SANDBOX_SUCCESS");',
      language: 'javascript'
    }, {
      headers: { Authorization: `Bearer ${recoveredToken}` }
    });
    // With host execution prohibited, if isolated container is reachable it returns 200,
    // if isolated container is unavailable it returns 503 with isolation notice, and NEVER executes on host!
    const isSandboxSecure = (validSandbox.status === 200 && (validSandbox.data?.stdout || '').includes('VEYRA_SANDBOX_SUCCESS')) ||
      (validSandbox.status === 503 && (validSandbox.data?.details || '').includes('Untrusted code execution is disabled on the host'));
    record('Sandbox', isSandboxSecure, 'POST /api/sandbox/run enforces container isolation (refuses unsafe host execution if container unavailable)', `Status: ${validSandbox.status}`);

  } catch (err) {
    console.error('[UNEXPECTED RUNTIME EXCEPTION]:', err.message);
    failed++;
  } finally {
    await dbPool.end();
  }

  console.log('\n===============================================================');
  console.log(`END-TO-END VERIFICATION SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log('===============================================================\n');

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runVerification();
