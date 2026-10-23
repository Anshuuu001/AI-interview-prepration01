const axios = require('axios');

let runtimesCache = null;

// Advertised supported languages for the execution sandbox
// Security: Restrict strictly to vetted programming languages; shell interpreters (bash, sh, powershell) are prohibited.
const SUPPORTED_LANGUAGES = [
  { language: 'javascript', version: '18.15.0', aliases: ['js', 'node'] },
  { language: 'python', version: '3.10.0', aliases: ['py', 'python3'] },
  { language: 'java', version: '15.0.2', aliases: [] },
  { language: 'c++', version: '10.2.0', aliases: ['cpp', 'cplusplus'] },
  { language: 'go', version: '1.16.2', aliases: ['golang'] }
];

const getSandboxBaseUrl = () => {
  const custom = process.env.SANDBOX_API_URL || process.env.PISTON_API_URL;
  if (custom) return custom.replace(/\/$/, '');
  return 'https://emkc.org/api/v2/piston';
};

const getRuntimes = async () => {
  // Always enforce the strict whitelist of vetted application languages
  return SUPPORTED_LANGUAGES;
};

const runCode = async (req, res) => {
  const { code, language } = req.body || {};

  // 1. Strict Code Validation
  if (code === undefined || code === null || typeof code !== 'string') {
    return res.status(400).json({ error: 'Valid code string is required' });
  }
  if (code.trim().length === 0) {
    return res.status(400).json({ error: 'Code cannot be empty' });
  }
  if (code.length > 65536) {
    return res.status(400).json({ error: 'Code size exceeds maximum allowed limit (64 KB)' });
  }

  // 2. Strict Language Validation
  if (!language || typeof language !== 'string' || language.trim().length === 0) {
    return res.status(400).json({ error: 'Valid language string is required' });
  }

  const runtimes = await getRuntimes();
  const normalizedLang = language.trim().toLowerCase();
  
  // Find matching supported runtime
  const runtime = runtimes.find(r => 
    r.language.toLowerCase() === normalizedLang || 
    (Array.isArray(r.aliases) && r.aliases.map(a => a.toLowerCase()).includes(normalizedLang))
  );

  if (!runtime) {
    return res.status(400).json({ error: `Language "${language}" is not supported by the execution sandbox.` });
  }

  // 3. Execution via Isolated Container Sandbox ONLY
  // SECURITY REQUIREMENT: Never execute untrusted candidate code on the application host.
  const baseUrl = getSandboxBaseUrl();
  const executeUrl = baseUrl.endsWith('/execute') ? baseUrl : `${baseUrl}/execute`;

  try {
    const response = await axios.post(
      executeUrl, 
      {
        language: runtime.language,
        version: runtime.version,
        files: [
          {
            content: code
          }
        ],
        run_timeout: 10000,
        compile_timeout: 10000
      },
      { 
        timeout: 12000,
        maxContentLength: 1024 * 1024 // 1 MB response cap
      }
    );

    const result = response.data;
    if (result && result.run) {
      // Truncate excessive output (> 64 KB) to prevent DoS / client memory issues
      const MAX_OUTPUT = 65536;
      const rawStdout = typeof result.run.stdout === 'string' ? result.run.stdout : '';
      const rawStderr = typeof result.run.stderr === 'string' ? result.run.stderr : '';
      const rawOutput = typeof result.run.output === 'string' ? result.run.output : (rawStdout || rawStderr);

      const stdout = rawStdout.length > MAX_OUTPUT ? rawStdout.substring(0, MAX_OUTPUT) + '\n[Output truncated at 64 KB]' : rawStdout;
      const stderr = rawStderr.length > MAX_OUTPUT ? rawStderr.substring(0, MAX_OUTPUT) + '\n[Error output truncated at 64 KB]' : rawStderr;
      const output = rawOutput.length > MAX_OUTPUT ? rawOutput.substring(0, MAX_OUTPUT) + '\n[Output truncated at 64 KB]' : rawOutput;

      return res.status(200).json({
        stdout,
        stderr,
        output,
        code: typeof result.run.code === 'number' ? result.run.code : 0,
        signal: result.run.signal || null
      });
    } else {
      throw new Error('Unexpected response format from execution engine');
    }
  } catch (err) {
    // SECURITY: Untrusted candidate code must NEVER fall back to executing on the application host.
    const isTimeout = err.code === 'ECONNABORTED';
    console.warn(`[sandboxController] Isolated sandbox execution failed for ${runtime.language}: ${isTimeout ? 'Timeout' : (err.response?.status || err.message)}`);

    const detailMsg = isTimeout 
      ? 'Execution timed out in container sandbox.'
      : 'Execution sandbox is currently unavailable. Untrusted code execution is disabled on the host for security isolation.';

    return res.status(503).json({ 
      error: 'Failed to run code in compilation sandbox. Please try again.',
      details: detailMsg
    });
  }
};

module.exports = {
  runCode,
  SUPPORTED_LANGUAGES,
  getSandboxBaseUrl
};
