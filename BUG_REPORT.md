# Comprehensive QA Bug Report: VEYRA AI (AI Interview Preparation)

Date: 2026-10-20  
Auditor: Senior Full-Stack Engineer & QA Lead  
Project: VEYRA AI ("AI Interview Preparation")  
Repository: `Anshuuu001/AI-interview-prepration01`  
OS: Windows | Shell: PowerShell  

---

## Executive Summary

A comprehensive, skeptical audit of the entire codebase (frontend React 19/Vite 8, backend Express/MySQL/JSON data layer, API integrations, styles, and proctoring engine) was executed. A total of **17 issues** were identified across Functional, Hidden, Human Error, UI/UX, Accessibility, Performance, Security, Code Quality, and SEO/Deployment categories.

| Severity | Count |
| :--- | :--- |
| **Critical** | 3 |
| **High** | 5 |
| **Medium** | 6 |
| **Low** | 3 |
| **Total Found** | **17** |

---

## Categorized Bug Breakdown

### 1. BUG-001: Infinite Redirect Loop on Account Suspension
- **Severity**: Critical
- **Category**: A (Functional Bugs) / B (Hidden Bugs)
- **Location**: `src/App.jsx:44-51`, `src/pages/SuspendedPage.jsx:11,24`, `src/pages/MockInterview/InterviewRoom.jsx:368-369`
- **What is wrong**: When a candidate triggers 5 proctoring strikes, the system navigates them to `/suspended`. However, the page immediately bounces back to `/dashboard`, which immediately redirects back to `/suspended`, locking the browser in an infinite redirect crash.
- **How to reproduce**:
  1. Trigger disqualification in `InterviewRoom.jsx` or manually run in console: `localStorage.setItem('proctoring_block_until_1', (Date.now() + 60000).toString())`.
  2. Navigate to `/dashboard` or `/suspended`.
  3. Observe the browser freezing or displaying "Too many redirects".
- **Why it happens**: `ProtectedRoute` in `App.jsx` checks `localStorage.getItem('proctoring_block_until_' + user.id)`. However, `SuspendedPage.jsx` checks `localStorage.getItem('proctoring_block_until')` (unscoped). Because the unscoped key is `null`, `SuspendedPage.jsx` executes `navigate('/dashboard')`, causing an infinite ping-pong loop.
- **Proposed fix**: Harmonize keys across `App.jsx`, `SuspendedPage.jsx`, and `InterviewRoom.jsx` to check both scoped and global keys and clear both upon expiration.
- **Status**: Fixed

---

### 2. BUG-002: Unauthenticated Account Lockout / Suspension Endpoint
- **Severity**: Critical
- **Category**: G (Security) / A (Functional Bugs)
- **Location**: `backend/routes/authRoutes.js:22` and `backend/controllers/authController.js:192-230`
- **What is wrong**: The `/api/auth/suspend` endpoint accepts POST requests without any JWT authentication or authorization check. Anyone on the internet can suspend any candidate or super-admin account by sending `{ userId: 1 }`.
- **How to reproduce**:
  Run in terminal:
  ```powershell
  Invoke-RestMethod -Uri http://localhost:8080/api/auth/suspend -Method Post -ContentType 'application/json' -Body '{"userId":"1","reason":"test"}'
  ```
  The endpoint returns HTTP 200 and locks the user account without checking credentials.
- **Why it happens**: `authMiddleware` was omitted from line 22 of `authRoutes.js`.
- **Proposed fix**: Attach `authMiddleware` to `/api/auth/suspend`, ensuring users can only suspend their own active session or require admin role.
- **Status**: Fixed

---

### 3. BUG-003: Login Quick-Fill Fails with 401 Unauthorized Out-of-the-Box
- **Severity**: Critical
- **Category**: A (Functional Bugs) / C (Human Errors)
- **Location**: `src/pages/Auth/Login.jsx:98-105` and `backend/controllers/authController.js:34-37, 52-54`
- **What is wrong**: Clicking "Student Quick Fill" or "Admin Quick Fill" on the `/login` page enters `student@veyra.ai` or `admin@veyra.ai`. Submitting the form immediately fails with `401 Invalid email or password`.
- **How to reproduce**:
  1. Go to `/login`.
  2. Click "Student" demo button (fills `student@veyra.ai` / `password123`).
  3. Click "Sign In". Form displays "Invalid email or password".
- **Why it happens**: The backend database and seed script only seed `student@elevateai.com` and `admin@elevateai.com`. The frontend was rebranded to `veyra.ai`, but the backend was never updated to recognize `@veyra.ai`.
- **Proposed fix**: Update `authController.js` to accept both `@veyra.ai` and `@elevateai.com` domains interchangeably and ensure demo accounts exist for both.
- **Status**: Fixed

---

### 4. BUG-004: Missing Await Causes Race Condition on Aptitude Test Completion
- **Severity**: High
- **Category**: A (Functional Bugs) / B (Hidden Bugs)
- **Location**: `src/pages/Aptitude/AptitudeTest.jsx:136-147` and `src/pages/Aptitude/TestResult.jsx:19-25`
- **What is wrong**: When completing an aptitude test, the candidate is often immediately redirected to the test lobby `/aptitude` instead of seeing their results report.
- **How to reproduce**:
  1. Go to `/aptitude`, start a test, answer questions, and click Submit.
  2. Observe immediate bounce back to `/aptitude` on slower networks.
- **Why it happens**: `interviewService.saveTestResult(testResult)` returns a Promise but is NOT awaited. `navigate('/aptitude/result/' + testResult.id)` fires before the backend finishes saving. `TestResult.jsx` immediately calls `getTestResults()`, fails to find the newly saved result in the database, and executes `navigate('/aptitude')`.
- **Proposed fix**: `await interviewService.saveTestResult(testResult)`, pass `{ state: { result: testResult } }` in navigation, and check `location.state?.result` before querying the network in `TestResult.jsx`.
- **Status**: Fixed

---

### 5. BUG-005: Interview Submission Button Permanently Disables on Network Glitch
- **Severity**: High
- **Category**: A (Functional Bugs)
- **Location**: `src/pages/MockInterview/InterviewRoom.jsx:650-675` and `src/pages/MockInterview/PerformanceReport.jsx:31-37`
- **What is wrong**: If an interview submission experiences a temporary network error or rate limit, `submitStartedRef.current` remains set to `true` forever. The user is stuck on the screen and cannot click submit or retry. Additionally, `PerformanceReport` bounces to `/interview` if the report has not finished syncing.
- **How to reproduce**:
  1. Simulate an API timeout on `/api/interview/submit`.
  2. Attempt to re-click the submit button. It does nothing because `submitStartedRef.current` blocks all subsequent submissions.
- **Why it happens**: `submitStartedRef.current = true` is set before the API call and is never reset to `false` in the `catch` block. No error banner is presented to the candidate.
- **Proposed fix**: Reset `submitStartedRef.current = false` in `catch`, display a user-friendly error message with retry button, and pass report data in router state to `PerformanceReport.jsx`.
- **Status**: Fixed

---

### 6. BUG-006: Admin Manage Questions Changes Fail to Persist
- **Severity**: High
- **Category**: A (Functional Bugs) / H (Code Quality)
- **Location**: `src/services/interviewService.js:139-141, 181-183` and `src/pages/Admin/ManageQuestions.jsx:65, 81, 101, 119`
- **What is wrong**: When an administrator adds or deletes interview or aptitude questions in `/admin/questions`, the UI immediately reverts to the initial questions upon reload.
- **How to reproduce**:
  1. Sign in as Admin.
  2. Navigate to `/admin/questions`.
  3. Add a new interview question and submit.
  4. Notice the question disappears because `saveTemplates` is a no-op.
- **Why it happens**: `interviewService.saveTemplates` and `interviewService.saveAptitudeQuestions` are empty dummy functions (`async () => {}`).
- **Proposed fix**: Implement local storage caching and backend synchronization for custom question banks.
- **Status**: Fixed

---

### 7. BUG-007: Multiple Pages Completely Ignore Dark Theme
- **Severity**: High
- **Category**: D (UI/UX)
- **Location**: `src/pages/Auth/Login.jsx`, `src/pages/Auth/Register.jsx`, `src/pages/LandingPage.jsx`, `src/pages/Aptitude/AptitudeTest.jsx`, `src/pages/Aptitude/TestResult.jsx`, `src/pages/Resume/SmartResumeBuilder.jsx`
- **What is wrong**: Toggling Dark Mode leaves multiple full pages rendered in glaring `#FAF5EF` cream and pure `#FFFFFF` white cards, ignoring user preference and causing eye strain.
- **How to reproduce**:
  1. Toggle Dark Mode via the moon icon in Navbar.
  2. Navigate to `/login`, `/register`, `/`, `/aptitude`, or `/resume`.
  3. Notice backgrounds and cards remain bright white.
- **Why it happens**: Missing Tailwind `dark:` color classes on wrappers, card containers, and typography elements.
- **Proposed fix**: Add dark mode utility classes (`dark:bg-[#060c29]`, `dark:bg-[#10194A]`, `dark:text-[#FAF5EF]`, `dark:border-white/10`) consistently across all pages.
- **Status**: Fixed

---

### 8. BUG-008: Invisible Text in Light Mode (Profile Editor & Inputs)
- **Severity**: High
- **Category**: D (UI/UX) / E (Accessibility)
- **Location**: `src/pages/Profile/EditProfile.jsx:40, 64, 79, 94, 131`
- **What is wrong**: In Light Mode, text entered by candidates into inputs and textareas in `EditProfile.jsx` is rendered in white (`text-slate-100`) on light gray inputs, making it invisible to the user.
- **How to reproduce**:
  1. Ensure Light Mode is active.
  2. Navigate to `/profile`.
  3. Type inside "Full Name", "Target Career Title", or "Bio". The text is white and completely unreadable against the light background.
- **Why it happens**: Hardcoded `text-slate-100` was applied across inputs without a light mode variant.
- **Proposed fix**: Use `text-[#10194A] dark:text-slate-100` for clear contrast in both light and dark themes.
- **Status**: Fixed

---

### 9. BUG-009: Standard Text Editing (Undo & Select-All) Triggers Proctoring Strikes
- **Severity**: Medium
- **Category**: A (Functional Bugs) / D (UI/UX)
- **Location**: `src/hooks/useAntiCheat.js:86-97`
- **What is wrong**: A candidate typing an answer who presses `Ctrl+Z` (Undo) or `Ctrl+A` (Select All) receives a proctoring security violation strike. Triggering this 5 times results in disqualification and a 30-minute lockout.
- **How to reproduce**:
  1. Start an interview session.
  2. In the answer textarea, press `Ctrl+Z` to undo a typing mistake.
  3. Anti-cheat alert appears: "Undo is disabled during the assessment. This violation has been logged."
- **Why it happens**: The keydown listener intercepts `e.key === 'z'` and `e.key === 'a'` unconditionally on the entire document.
- **Proposed fix**: Allow `Ctrl+Z` and `Ctrl+A` inside `INPUT` and `TEXTAREA` elements while keeping copy/paste/cut safeguards intact.
- **Status**: Fixed

---

### 10. BUG-010: Artificial RNG Gaze Warning Causes Unfair Disqualifications
- **Severity**: Medium
- **Category**: A (Functional Bugs) / D (UI/UX)
- **Location**: `src/pages/MockInterview/InterviewRoom.jsx:240-246`
- **What is wrong**: A candidate sitting completely still looking directly at the camera has a 10% chance every 25 seconds of being hit with an unprovoked "Gaze deviation detected" warning.
- **How to reproduce**:
  Sit still in the interview room for 2-3 minutes. Observe random gaze warning alerts without moving head or eyes.
- **Why it happens**: `if (Math.random() < 0.1) triggerWarning(...)` was implemented as a simulated placeholder.
- **Proposed fix**: Only trigger gaze/attention warnings when BlazeFace model reports no face or off-center angle, removing artificial random penalties.
- **Status**: Fixed

---

### 11. BUG-011: Outdated First-Attempt Model in Backend Model Rotation
- **Severity**: Medium
- **Category**: B (Hidden Bugs) / F (Performance)
- **Location**: `backend/utils/geminiHelper.js:5-13`
- **What is wrong**: `MODELS_TO_TRY` attempts `gemini-2.0-flash` on every request, which is not in the validated models list, creating latency and unnecessary 404 retries in the backend log.
- **How to reproduce**:
  Check `backend/error.log` for recurring warnings about unavailable model endpoints.
- **Why it happens**: Outdated model list order.
- **Proposed fix**: Prioritize `gemini-2.5-flash` and `gemini-flash-latest`, matching the active Google Generative AI capabilities.
- **Status**: Fixed

---

### 12. BUG-012: Test Script Fails on Execution Due to ES Module Mismatch
- **Severity**: Medium
- **Category**: B (Hidden Bugs)
- **Location**: `test_key.js:1`
- **What is wrong**: Running `node test_key.js` crashes immediately with `ReferenceError: require is not defined in ES module scope`.
- **How to reproduce**:
  Run `node test_key.js` in project root.
- **Why it happens**: Project `package.json` specifies `"type": "module"`, but `test_key.js` uses CommonJS `require()`.
- **Proposed fix**: Refactor `test_key.js` to use ES module `import` syntax.
- **Status**: Fixed

---

### 13. BUG-013: Monolithic Production Bundle Exceeds Recommended Size (1.97 MB)
- **Severity**: Medium
- **Category**: F (Performance)
- **Location**: `vite.config.js`
- **What is wrong**: `npm run build` produces a single client bundle `dist/assets/index-DNWb6Cbg.js` of ~1.97 MB (512 kB gzip), triggering Vite chunk size warnings and impacting mobile load time.
- **How to reproduce**:
  Run `npm run build`. Note warning: `(!) Some chunks are larger than 500 kB after minification.`
- **Why it happens**: Large vendor libraries (Monaco Editor, TensorFlow, Firebase, Lucide) are bundled into the entry chunk without manual chunk splitting.
- **Proposed fix**: Configure `build.rollupOptions.output.manualChunks` in `vite.config.js` to split vendor dependencies into separate cacheable chunks.
- **Status**: Fixed

---

### 14. BUG-014: Missing 404 Route Causes Confusing Fallback Redirect
- **Severity**: Medium
- **Category**: I (SEO / Deployment) / A (Functional Bugs)
- **Location**: `src/App.jsx:169`
- **What is wrong**: Any mistyped URL or expired link redirects directly to `/login`, providing no feedback to authenticated users that the route was not found.
- **How to reproduce**:
  Navigate to `http://localhost:5173/non-existent-page`.
- **Why it happens**: Fallback `<Route path="*" element={<Navigate to="/login" replace />} />`.
- **Proposed fix**: Implement a dedicated `NotFound` page with clear links to Dashboard and Home.
- **Status**: Fixed

---

### 15. BUG-015: Inconsistent Brand Assets & Trailing Spaces in Title
- **Severity**: Low
- **Category**: C (Human Errors) / I (SEO)
- **Location**: `public/vayra-logo.png` vs `public/veyra-logo.png`, `index.html:8`
- **What is wrong**: Typo in duplicate public asset filename `vayra-logo.png` and trailing whitespace in `<title>VEYRA AI </title>`.
- **How to reproduce**: Inspect `public/` directory and `index.html:8`.
- **Why it happens**: Copy-paste mistake during initial setup.
- **Proposed fix**: Clean up `index.html` title tag and ensure correct asset references.
- **Status**: Fixed

---

### 16. BUG-016: Dark Mode Contrast in Navbar Notification Center
- **Severity**: Low
- **Category**: D (UI/UX) / E (Accessibility)
- **Location**: `src/components/Navbar.jsx:154, 161, 164`
- **What is wrong**: In Dark Mode, notification titles and body copy use `text-slate-900` and `text-slate-500` inside dark container `dark:bg-[#131E54]`, causing poor contrast.
- **How to reproduce**:
  1. Enable Dark Mode.
  2. Click the bell icon in Navbar.
  3. Observe dark gray text on navy background.
- **Why it happens**: Missing dark variant classes in notification popover rows.
- **Proposed fix**: Add `dark:text-slate-100` and `dark:text-slate-300` to notification text items.
- **Status**: Fixed

---

### 17. BUG-017: 25 Orphaned Career Assistant Feature Modules
- **Severity**: Medium
- **Category**: B (Hidden Bugs) / H (Code Quality)
- **Location**: `src/pages/CareerAssistant/` (25 component files)
- **What is wrong**: 25 component files in `src/pages/CareerAssistant/` (e.g. `AIInterviewCopilot.jsx`, `JobPortal.jsx`, `DailyChallenges.jsx`, `PlacementPrediction.jsx`) are completely orphaned. They are not imported or routed in `App.jsx`, generating 230+ unused variable/linter warnings.
- **How to reproduce**: Run `npm run lint`.
- **Why it happens**: Developed as modular extensions but never wired into router or dashboard tabs.
- **Proposed fix**: Keep files intact (as per rule 6), document for user decision, and clean up lint warnings.
- **Status**: Needs decision

---

## Summary Table

| Category | Critical | High | Medium | Low | Total |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **A. Functional Bugs** | 2 | 2 | 2 | 0 | **6** |
| **B. Hidden Bugs** | 1 | 1 | 2 | 0 | **4** |
| **C. Human Errors** | 0 | 0 | 0 | 1 | **1** |
| **D. UI / UX** | 0 | 2 | 1 | 1 | **4** |
| **E. Accessibility** | 0 | 1 | 0 | 1 | **2** |
| **F. Performance** | 0 | 0 | 1 | 0 | **1** |
| **G. Security** | 1 | 0 | 0 | 0 | **1** |
| **H. Code Quality** | 0 | 1 | 1 | 0 | **2** |
| **I. SEO / Deployment** | 0 | 0 | 1 | 1 | **2** |
| **Total** | **3** | **5** | **6** | **3** | **17** |
