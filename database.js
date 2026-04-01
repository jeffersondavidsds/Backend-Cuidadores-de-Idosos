const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Caminho do banco de dados (padrão: notcare.db, pode ser sobrescrito via env)
const dbFileName = process.env.DATABASE_PATH || 'notcare.db';
const dbPath = path.resolve(__dirname, dbFileName);

// Conectar ao banco de dados
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('[DATABASE] Erro ao conectar ao SQLite:', err.message);
    process.exit(1);
  } else {
    console.log('[DATABASE] Conectado ao SQLite em:', dbPath);
  }
});

// Habilitar foreign keys
db.run('PRAGMA foreign_keys = ON');

// ============================================
// INICIALIZAÇÃO DO SCHEMA
// ============================================

const initializeDatabase = () => {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      // ============================================
      // TABELA DE USUÁRIOS (Enfermeiros)
      // ============================================
      db.run(`
        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          email TEXT NOT NULL UNIQUE,
          password_hash TEXT NOT NULL,
          registration TEXT NOT NULL,
          role TEXT DEFAULT 'Enfermeiro Técnico',
          status TEXT DEFAULT 'Ativa',
          avatar TEXT DEFAULT '👩‍⚕️',
          two_factor_enabled BOOLEAN DEFAULT 0,
          otp_code TEXT,
          otp_expires_at DATETIME,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT unique_email UNIQUE (email)
        )
      `, (err) => {
        if (err) console.error('[DB] Erro ao criar tabela users:', err.message);
      });

      // ============================================
      // TABELA DE PACIENTES
      // ============================================
      db.run(`
        CREATE TABLE IF NOT EXISTS patients (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL,
          name TEXT NOT NULL,
          age INTEGER,
          emoji TEXT DEFAULT '🧓',
          status TEXT DEFAULT 'stable',
          diagnosis TEXT,
          conditions TEXT,
          contact TEXT,
          blood TEXT,
          biometrics TEXT,
          meds TEXT,
          allergies TEXT,
          diet TEXT,
          autonomy_level INTEGER DEFAULT 1,
          mobility TEXT,
          communication TEXT,
          sleep TEXT,
          env_ac TEXT DEFAULT 'moderado',
          env_sun TEXT DEFAULT 'moderado',
          env_cold TEXT DEFAULT 'moderado',
          env_humidity TEXT DEFAULT 'moderado',
          notes TEXT,
          tags TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
          CONSTRAINT unique_patient_per_user UNIQUE (user_id, name)
        )
      `, (err) => {
        if (err) console.error('[DB] Erro ao criar tabela patients:', err.message);
      });

      // ============================================
      // TABELA DE ATIVIDADES
      // ============================================
      db.run(`
        CREATE TABLE IF NOT EXISTS activities (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          patient_id INTEGER NOT NULL,
          type TEXT NOT NULL,
          description TEXT NOT NULL,
          date DATETIME NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE
        )
      `, (err) => {
        if (err) console.error('[DB] Erro ao criar tabela activities:', err.message);
        else resolve();
      });

      console.log('[DATABASE] Schema inicializado com sucesso');
    });
  });
};

// ============================================
// FUNÇÕES GENÉRICAS DE DATABASE
// ============================================

/**
 * Executar query com prepared statement
 */
const query = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows || []);
    });
  });
};

/**
 * Executar query única (get)
 */
const queryOne = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row || null);
    });
  });
};

/**
 * Executar operação (INSERT, UPDATE, DELETE)
 */
const execute = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) reject(err);
      else resolve({ id: this.lastID, changes: this.changes });
    });
  });
};

// ============================================
// CRUD - USUÁRIOS
// ============================================

const createUser = async (userData) => {
  try {
    const { name, email, passwordHash, registration, role, status, avatar } = userData;
    
    const result = await execute(
      `INSERT INTO users (name, email, password_hash, registration, role, status, avatar)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [name, email, passwordHash, registration || 'CRE: N/A', role || 'Enfermeiro Técnico', status || 'Ativa', avatar || '👩‍⚕️']
    );
    
    return { id: result.id, success: true };
  } catch (err) {
    if (err.message.includes('UNIQUE')) {
      return { success: false, error: 'Email já cadastrado' };
    }
    return { success: false, error: err.message };
  }
};

const getUserByEmail = async (email) => {
  try {
    return await queryOne(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );
  } catch (err) {
    console.error('[DB] Erro ao buscar usuário por email:', err.message);
    return null;
  }
};

const getUserById = async (userId) => {
  try {
    return await queryOne(
      'SELECT id, name, email, registration, role, status, avatar, two_factor_enabled FROM users WHERE id = ?',
      [userId]
    );
  } catch (err) {
    console.error('[DB] Erro ao buscar usuário por ID:', err.message);
    return null;
  }
};

const updateUserOTP = async (userId, otpCode, expiresAt) => {
  try {
    await execute(
      'UPDATE users SET otp_code = ?, otp_expires_at = ?, two_factor_enabled = 1 WHERE id = ?',
      [otpCode, expiresAt, userId]
    );
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
};

const verifyOTP = async (userId, otpCode) => {
  try {
    const user = await queryOne(
      'SELECT otp_code, otp_expires_at FROM users WHERE id = ?',
      [userId]
    );

    if (!user) return { valid: false, error: 'Usuário não encontrado' };

    const now = new Date();
    const expiresAt = new Date(user.otp_expires_at);

    if (user.otp_code !== otpCode) {
      return { valid: false, error: 'Código OTP inválido' };
    }

    if (now > expiresAt) {
      return { valid: false, error: 'Código OTP expirado' };
    }

    // Limpar OTP após verificação bem-sucedida
    await execute(
      'UPDATE users SET otp_code = NULL, otp_expires_at = NULL WHERE id = ?',
      [userId]
    );

    return { valid: true };
  } catch (err) {
    return { valid: false, error: err.message };
  }
};

// ============================================
// CRUD - PACIENTES
// ============================================

const createPatient = async (userId, patientData) => {
  try {
    const { name, age, emoji, status, diagnosis, conditions, contact, blood, biometrics, meds, allergies, diet, autonomyLevel, mobility, communication, sleep, env, notes, tags } = patientData;

    // Verificar duplicidade
    const existing = await queryOne(
      'SELECT id FROM patients WHERE user_id = ? AND LOWER(name) = LOWER(?)',
      [userId, name]
    );

    if (existing) {
      return { success: false, error: 'Paciente com este nome já existe' };
    }

    const result = await execute(
      `INSERT INTO patients (user_id, name, age, emoji, status, diagnosis, conditions, contact, blood, biometrics, meds, allergies, diet, autonomy_level, mobility, communication, sleep, env_ac, env_sun, env_cold, env_humidity, notes, tags)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [userId, name, age, emoji || '🧓', status || 'stable', diagnosis, conditions, contact, blood, biometrics, meds, allergies, diet, autonomyLevel || 1, mobility, communication, sleep, env?.ac || 'moderado', env?.sun || 'moderado', env?.cold || 'moderado', env?.humidity || 'moderado', notes, JSON.stringify(tags || [])]
    );

    return { id: result.id, success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
};

const getPatientsByUserId = async (userId) => {
  try {
    const patients = await query(
      `SELECT id, name, age, emoji, status, diagnosis, conditions, contact, blood, biometrics, meds, allergies, diet, autonomy_level, mobility, communication, sleep, env_ac, env_sun, env_cold, env_humidity, notes, tags, created_at, updated_at
       FROM patients WHERE user_id = ? ORDER BY created_at DESC`,
      [userId]
    );

    // Parsear tags e env
    return patients.map(p => ({
      ...p,
      autonomyLevel: p.autonomy_level,
      env: {
        ac: p.env_ac,
        sun: p.env_sun,
        cold: p.env_cold,
        humidity: p.env_humidity
      },
      tags: JSON.parse(p.tags || '[]')
    }));
  } catch (err) {
    console.error('[DB] Erro ao buscar pacientes:', err.message);
    return [];
  }
};

const getPatientById = async (patientId, userId) => {
  try {
    const patient = await queryOne(
      `SELECT id, name, age, emoji, status, diagnosis, conditions, contact, blood, biometrics, meds, allergies, diet, autonomy_level, mobility, communication, sleep, env_ac, env_sun, env_cold, env_humidity, notes, tags, created_at, updated_at
       FROM patients WHERE id = ? AND user_id = ?`,
      [patientId, userId]
    );

    if (!patient) return null;

    return {
      ...patient,
      autonomyLevel: patient.autonomy_level,
      env: {
        ac: patient.env_ac,
        sun: patient.env_sun,
        cold: patient.env_cold,
        humidity: patient.env_humidity
      },
      tags: JSON.parse(patient.tags || '[]')
    };
  } catch (err) {
    console.error('[DB] Erro ao buscar paciente:', err.message);
    return null;
  }
};

const updatePatient = async (patientId, userId, patientData) => {
  try {
    const { name, age, emoji, status, diagnosis, conditions, contact, blood, biometrics, meds, allergies, diet, autonomyLevel, mobility, communication, sleep, env, notes, tags } = patientData;

    // Verificar se paciente pertence ao usuário
    const patient = await queryOne('SELECT id FROM patients WHERE id = ? AND user_id = ?', [patientId, userId]);
    if (!patient) return { success: false, error: 'Paciente não encontrado' };

    // Atualizar
    const updates = [];
    const values = [];

    if (name !== undefined) {
      updates.push('name = ?');
      values.push(name);
    }
    if (age !== undefined) updates.push('age = ?'), values.push(age);
    if (emoji !== undefined) updates.push('emoji = ?'), values.push(emoji);
    if (status !== undefined) updates.push('status = ?'), values.push(status);
    if (diagnosis !== undefined) updates.push('diagnosis = ?'), values.push(diagnosis);
    if (conditions !== undefined) updates.push('conditions = ?'), values.push(conditions);
    if (contact !== undefined) updates.push('contact = ?'), values.push(contact);
    if (blood !== undefined) updates.push('blood = ?'), values.push(blood);
    if (biometrics !== undefined) updates.push('biometrics = ?'), values.push(biometrics);
    if (meds !== undefined) updates.push('meds = ?'), values.push(meds);
    if (allergies !== undefined) updates.push('allergies = ?'), values.push(allergies);
    if (diet !== undefined) updates.push('diet = ?'), values.push(diet);
    if (autonomyLevel !== undefined) updates.push('autonomy_level = ?'), values.push(autonomyLevel);
    if (mobility !== undefined) updates.push('mobility = ?'), values.push(mobility);
    if (communication !== undefined) updates.push('communication = ?'), values.push(communication);
    if (sleep !== undefined) updates.push('sleep = ?'), values.push(sleep);
    if (env) {
      if (env.ac !== undefined) updates.push('env_ac = ?'), values.push(env.ac);
      if (env.sun !== undefined) updates.push('env_sun = ?'), values.push(env.sun);
      if (env.cold !== undefined) updates.push('env_cold = ?'), values.push(env.cold);
      if (env.humidity !== undefined) updates.push('env_humidity = ?'), values.push(env.humidity);
    }
    if (notes !== undefined) updates.push('notes = ?'), values.push(notes);
    if (tags !== undefined) updates.push('tags = ?'), values.push(JSON.stringify(tags));

    updates.push('updated_at = CURRENT_TIMESTAMP');

    const sql = `UPDATE patients SET ${updates.join(', ')} WHERE id = ? AND user_id = ?`;
    values.push(patientId, userId);

    await execute(sql, values);
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
};

const deletePatient = async (patientId, userId) => {
  try {
    const result = await execute(
      'DELETE FROM patients WHERE id = ? AND user_id = ?',
      [patientId, userId]
    );

    if (result.changes === 0) {
      return { success: false, error: 'Paciente não encontrado' };
    }

    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
};

// ============================================
// CRUD - ATIVIDADES
// ============================================

const createActivity = async (patientId, userId, activityData) => {
  try {
    const { type, desc, date } = activityData;

    // Verificar se paciente pertence ao usuário
    const patient = await queryOne('SELECT id FROM patients WHERE id = ? AND user_id = ?', [patientId, userId]);
    if (!patient) return { success: false, error: 'Paciente não encontrado' };

    const result = await execute(
      'INSERT INTO activities (patient_id, type, description, date) VALUES (?, ?, ?, ?)',
      [patientId, type, desc, date || new Date().toISOString()]
    );

    return { id: result.id, success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
};

const getActivitiesByPatientId = async (patientId, userId) => {
  try {
    // Verificar se paciente pertence ao usuário
    const patient = await queryOne('SELECT id FROM patients WHERE id = ? AND user_id = ?', [patientId, userId]);
    if (!patient) return [];

    return await query(
      'SELECT id, type, description as desc, date, created_at, updated_at FROM activities WHERE patient_id = ? ORDER BY date DESC',
      [patientId]
    );
  } catch (err) {
    console.error('[DB] Erro ao buscar atividades:', err.message);
    return [];
  }
};

const updateActivity = async (activityId, patientId, userId, activityData) => {
  try {
    const { type, desc, date } = activityData;

    // Verificar se atividade pertence ao paciente e paciente ao usuário
    const activity = await queryOne(
      `SELECT a.id FROM activities a 
       JOIN patients p ON a.patient_id = p.id 
       WHERE a.id = ? AND a.patient_id = ? AND p.user_id = ?`,
      [activityId, patientId, userId]
    );

    if (!activity) return { success: false, error: 'Atividade não encontrada' };

    const updates = [];
    const values = [];

    if (type !== undefined) updates.push('type = ?'), values.push(type);
    if (desc !== undefined) updates.push('description = ?'), values.push(desc);
    if (date !== undefined) updates.push('date = ?'), values.push(date);

    updates.push('updated_at = CURRENT_TIMESTAMP');

    const sql = `UPDATE activities SET ${updates.join(', ')} WHERE id = ?`;
    values.push(activityId);

    await execute(sql, values);
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
};

const deleteActivity = async (activityId, patientId, userId) => {
  try {
    const result = await execute(
      `DELETE FROM activities WHERE id = ? AND patient_id IN 
       (SELECT id FROM patients WHERE id = ? AND user_id = ?)`,
      [activityId, patientId, userId]
    );

    if (result.changes === 0) {
      return { success: false, error: 'Atividade não encontrada' };
    }

    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
};

// ============================================
// EXPORTAR FUNÇÕES
// ============================================

module.exports = {
  db,
  initializeDatabase,
  // Usuários
  createUser,
  getUserByEmail,
  getUserById,
  updateUserOTP,
  verifyOTP,
  // Pacientes
  createPatient,
  getPatientsByUserId,
  getPatientById,
  updatePatient,
  deletePatient,
  // Atividades
  createActivity,
  getActivitiesByPatientId,
  updateActivity,
  deleteActivity,
  // Funções genéricas
  query,
  queryOne,
  execute
};