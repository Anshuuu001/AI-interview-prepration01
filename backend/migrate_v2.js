const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const fs = require('fs');

async function migrate() {
  console.log('[Migration] Starting ElevateAI Database & Security Migration v2...');

  const db = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'elevate_db',
  });

  try {
    // 1. Ensure resume_reports table exists
    console.log('[Migration] Creating resume_reports table if not exists...');
    await db.execute(`
      CREATE TABLE IF NOT EXISTS resume_reports (
        id VARCHAR(50) PRIMARY KEY,
        user_id VARCHAR(50) NOT NULL,
        file_name VARCHAR(255) NOT NULL,
        job_title VARCHAR(150) NOT NULL,
        score INT NOT NULL,
        match_percentage INT NOT NULL,
        structure_grade VARCHAR(10) NOT NULL,
        matching_keywords TEXT,
        missing_keywords TEXT,
        strengths TEXT,
        improvements TEXT,
        date VARCHAR(50) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_user_id (user_id),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
    `);

    // 2. Ensure custom questions and templates tables exist
    console.log('[Migration] Creating custom_interview_questions table if not exists...');
    await db.execute(`
      CREATE TABLE IF NOT EXISTS custom_interview_questions (
        id VARCHAR(50) PRIMARY KEY,
        template_id VARCHAR(50) NOT NULL,
        question TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_template (template_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
    `);

    console.log('[Migration] Creating custom_aptitude_questions table if not exists...');
    await db.execute(`
      CREATE TABLE IF NOT EXISTS custom_aptitude_questions (
        id VARCHAR(50) PRIMARY KEY,
        category VARCHAR(50) NOT NULL,
        question TEXT NOT NULL,
        options TEXT NOT NULL,
        correct_answer INT NOT NULL,
        explanation TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
    `);

    // 3. Migrate existing plaintext passwords to bcrypt hashes
    console.log('[Migration] Checking users for plaintext passwords...');
    const [users] = await db.execute('SELECT id, email, password FROM users');
    let migratedCount = 0;
    for (const u of users) {
      // Check if password already looks like a bcrypt hash ($2a$, $2b$, or $2y$)
      const isBcrypt = /^\$2[aby]\$\d{2}\$[./A-Za-z0-9]{53}$/.test(u.password);
      if (!isBcrypt) {
        console.log(`[Migration] Upgrading plaintext password for user: ${u.email} (${u.id})`);
        const salt = await bcrypt.genSalt(12);
        const hashedPassword = await bcrypt.hash(u.password, salt);
        await db.execute('UPDATE users SET password=? WHERE id=?', [hashedPassword, u.id]);
        migratedCount++;
      }
    }
    console.log(`[Migration] Password hashing complete. Migrated ${migratedCount} plaintext passwords.`);

    // 4. Migrate existing resumes.json if records exist and link to an existing user
    const resumesJsonPath = path.join(__dirname, 'data/resumes.json');
    if (fs.existsSync(resumesJsonPath)) {
      try {
        const resumesData = JSON.parse(fs.readFileSync(resumesJsonPath, 'utf8'));
        if (Array.isArray(resumesData) && resumesData.length > 0) {
          // Check default user id (e.g., student or admin)
          const targetUserId = users.find(u => u.role === 'student')?.id || users[0]?.id;
          if (targetUserId) {
            let resumeCount = 0;
            for (const r of resumesData) {
              const [exists] = await db.execute('SELECT id FROM resume_reports WHERE id=?', [r.id]);
              if (exists.length === 0) {
                await db.execute(`
                  INSERT INTO resume_reports (id, user_id, file_name, job_title, score, match_percentage, structure_grade, matching_keywords, missing_keywords, strengths, improvements, date)
                  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                `, [
                  r.id,
                  targetUserId,
                  r.fileName || 'resume.pdf',
                  r.jobTitle || 'General Software Engineer',
                  r.score || 0,
                  r.matchPercentage || 0,
                  r.structureGrade || 'B',
                  JSON.stringify(r.matchingKeywords || []),
                  JSON.stringify(r.missingKeywords || []),
                  JSON.stringify(r.strengths || []),
                  JSON.stringify(r.improvements || []),
                  r.date || new Date().toISOString()
                ]);
                resumeCount++;
              }
            }
            console.log(`[Migration] Migrated ${resumeCount} legacy resume reports to MySQL.`);
          }
        }
      } catch (resumeErr) {
        console.warn('[Migration] Note: legacy resumes.json migration skipped or failed:', resumeErr.message);
      }
    }

    console.log('[Migration] Database & Security Migration v2 completed successfully.');
  } catch (err) {
    console.error('[Migration Error]:', err);
    throw err;
  } finally {
    await db.end();
  }
}

if (require.main === module) {
  migrate().then(() => process.exit(0)).catch(() => process.exit(1));
}

module.exports = migrate;
