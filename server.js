const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
require('dotenv').config();

const db = require('./database');

// ============================================
// INICIALIZAÇÃO DO EXPRESS
// ============================================

const app = express();
const PORT = process.env.PORT || 5000;
const DEV_BYPASS_MFA = process.env.DEV_BYPASS_MFA === 'true';

const allowedOrigins = [
  (process.env.FRONTEND_URL || 'http://localhost:3000').replace(/\/$/, ''),
  'http://localhost:3000',
  'https://homecarenote.vercel.app'
];

app.use(cors({
  origin: (origin, callback) => {
    const normalizedOrigin = origin ? origin.replace(/\/$/, '') : origin;
    if (!origin || allowedOrigins.includes(normalizedOrigin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS: ' + origin));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.options('*', cors({
  origin: allowedOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// ============================================
// CONFIGURAÇÃO NODEMAILER
// ============================================

const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

// ============================================
// FUNÇÕES AUXILIARES
// ============================================

// Gerar hash SHA-256 para senha
const hashPassword = (password) => {
  return crypto.createHash('sha256').update(password).digest('hex');
};

// Gerar código OTP aleatório (6 dígitos)
const generateOTP = () => {
  return String(Math.floor(Math.random() * 900000 + 100000));
};

// Gerar JWT
const generateJWT = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET || 'notcare_secret_key_2024', {
    expiresIn: '24h'
  });
};

// Verificar JWT
const verifyJWT = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET || 'notcare_secret_key_2024');
  } catch (err) {
    return null;
  }
};

// Middleware de autenticação
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token ausente' });
  }

  const decoded = verifyJWT(token);
  if (!decoded) {
    return res.status(403).json({ error: 'Token inválido ou expirado' });
  }

  req.userId = decoded.userId;
  next();
};

// Enviar email com OTP
const sendOTPEmail = async (email, name, otpCode) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: '🔐 Código de Verificação NoteCare',
      html: `
        <div style="font-family: Arial, sans-serif; background-color: #f5f5f5; padding: 20px;">
          <div style="background-color: #ffffff; border-radius: 10px; padding: 30px; max-width: 500px; margin: 0 auto;">
            <h2 style="color: #2c3e50; text-align: center;">Verificação em Duas Etapas</h2>
            <p style="color: #555; text-align: center;">Olá, <strong>${name}</strong>!</p>
            <p style="color: #555; text-align: center;">Você solicitou um código de verificação para acessar sua conta NoteCare.</p>
            <div style="background-color: #ecf0f1; border-radius: 8px; padding: 15px; text-align: center; margin: 20px 0;">
              <p style="color: #666; font-size: 14px; margin: 0; text-transform: uppercase; letter-spacing: 5px;">Seu código:</p>
              <p style="color: #2c3e50; font-size: 32px; font-weight: bold; margin: 10px 0; letter-spacing: 3px;">${otpCode}</p>
            </div>
            <p style="color: #999; font-size: 12px; text-align: center;">Este código expira em 10 minutos.</p>
            <p style="color: #999; font-size: 12px; text-align: center;">Se você não solicitou este código, ignore este email.</p>
            <hr style="border: none; border-top: 1px solid #ecf0f1; margin: 20px 0;">
            <p style="color: #999; font-size: 11px; text-align: center;">© 2024 NoteCare. Todos os direitos reservados.</p>
          </div>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (err) {
    console.error('[EMAIL] Erro ao enviar OTP:', err.message);
    return { success: false, error: 'Erro ao enviar email' };
  }
};

// ============================================
// ROTAS DE AUTENTICAÇÃO
// ============================================

/**
 * POST /auth/register
 * Registrar novo usuário (Enfermeiro Técnico)
 */
app.post('/auth/register', async (req, res) => {
  try {
    const { name, email, password, registration } = req.body;

    // Validações
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Nome, email e senha são obrigatórios' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Senha deve ter no mínimo 6 caracteres' });
    }

    // Verificar se email já existe
    const existingUser = await db.getUserByEmail(email);
    if (existingUser) {
      return res.status(409).json({ error: 'Email já cadastrado' });
    }

    // Criar usuário
    const passwordHash = hashPassword(password);
    const result = await db.createUser({
      name,
      email,
      passwordHash,
      registration: registration || 'CRE: Pendente',
      role: 'Enfermeiro Técnico',
      status: 'Ativa'
    });

    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }

    return res.status(201).json({
      success: true,
      message: 'Usuário cadastrado com sucesso',
      userId: result.id
    });
  } catch (err) {
    console.error('[AUTH] Erro ao registrar:', err.message);
    res.status(500).json({ error: 'Erro ao registrar usuário' });
  }
});

/**
 * POST /auth/login
 * Fazer login e solicitar verificação de 2FA
 */
app.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validações
    if (!email || !password) {
      return res.status(400).json({ error: 'Email e senha são obrigatórios' });
    }

    // Buscar usuário
    const user = await db.getUserByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    // Verificar senha
    const passwordHash = hashPassword(password);
    if (user.password_hash !== passwordHash) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    // Modo de desenvolvimento: pular 2FA por e-mail para evitar configuração de SMTP durante testes locais
    if (DEV_BYPASS_MFA) {
      const token = generateJWT(user.id);
      return res.json({
        success: true,
        message: 'Login direto (DEV_BYPASS_MFA ativo)',
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          registration: user.registration,
          status: user.status,
          avatar: user.avatar
        }
      });
    }

    // Gerar e enviar OTP
    const otpCode = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutos

    const updateResult = await db.updateUserOTP(user.id, otpCode, expiresAt.toISOString());
    if (!updateResult.success) {
      return res.status(500).json({ error: 'Erro ao gerar código de verificação' });
    }

    // Enviar email
    const emailResult = await sendOTPEmail(email, user.name, otpCode);
    if (!emailResult.success) {
      return res.status(500).json({ error: 'Erro ao enviar código por email' });
    }

    return res.json({
      success: true,
      message: 'Código enviado para seu email',
      userId: user.id,
      requiresMFA: true
    });
  } catch (err) {
    console.error('[AUTH] Erro ao fazer login:', err.message);
    res.status(500).json({ error: 'Erro ao fazer login' });
  }
});

/**
 * POST /auth/verify-otp
 * Verificar código OTP de 2FA
 */
app.post('/auth/verify-otp', async (req, res) => {
  try {
    const { userId, otpCode } = req.body;

    // Validações
    if (!userId || !otpCode) {
      return res.status(400).json({ error: 'ID do usuário e código OTP são obrigatórios' });
    }

    // Verificar OTP
    const result = await db.verifyOTP(userId, otpCode);
    if (!result.valid) {
      return res.status(401).json({ error: result.error });
    }

    // Gerar JWT
    const token = generateJWT(userId);

    // Buscar dados do usuário
    const user = await db.getUserById(userId);

    return res.json({
      success: true,
      message: 'Verificação bem-sucedida',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        registration: user.registration,
        status: user.status,
        avatar: user.avatar
      }
    });
  } catch (err) {
    console.error('[AUTH] Erro ao verificar OTP:', err.message);
    res.status(500).json({ error: 'Erro ao verificar código' });
  }
});

/**
 * POST /auth/send-otp
 * Reenviar código OTP por email
 */
app.post('/auth/send-otp', async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'ID do usuário é obrigatório' });
    }

    // Buscar usuário
    const user = await db.getUserById(userId);
    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    // Gerar novo OTP
    const otpCode = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    const updateResult = await db.updateUserOTP(userId, otpCode, expiresAt.toISOString());
    if (!updateResult.success) {
      return res.status(500).json({ error: 'Erro ao gerar código' });
    }

    // Enviar email
    const emailResult = await sendOTPEmail(user.email, user.name, otpCode);
    if (!emailResult.success) {
      return res.status(500).json({ error: 'Erro ao enviar email' });
    }

    return res.json({
      success: true,
      message: 'Código reenviado para seu email'
    });
  } catch (err) {
    console.error('[AUTH] Erro ao reenviar OTP:', err.message);
    res.status(500).json({ error: 'Erro ao reenviar código' });
  }
});

// ============================================
// ROTAS DE PACIENTES
// ============================================

/**
 * GET /api/patients
 * Listar todos os pacientes do usuário
 */
app.get('/api/patients', authenticateToken, async (req, res) => {
  try {
    const patients = await db.getPatientsByUserId(req.userId);
    res.json({
      success: true,
      data: patients
    });
  } catch (err) {
    console.error('[PATIENTS] Erro ao listar pacientes:', err.message);
    res.status(500).json({ error: 'Erro ao listar pacientes' });
  }
});

/**
 * GET /api/patients/:id
 * Obter dados de um paciente específico
 */
app.get('/api/patients/:id', authenticateToken, async (req, res) => {
  try {
    const patient = await db.getPatientById(req.params.id, req.userId);

    if (!patient) {
      return res.status(404).json({ error: 'Paciente não encontrado' });
    }

    // Buscar atividades
    const activities = await db.getActivitiesByPatientId(req.params.id, req.userId);

    res.json({
      success: true,
      data: {
        ...patient,
        activities
      }
    });
  } catch (err) {
    console.error('[PATIENTS] Erro ao buscar paciente:', err.message);
    res.status(500).json({ error: 'Erro ao buscar paciente' });
  }
});

/**
 * POST /api/patients
 * Criar novo paciente
 */
app.post('/api/patients', authenticateToken, async (req, res) => {
  try {
    const patientData = req.body;

    // Validações
    if (!patientData.name) {
      return res.status(400).json({ error: 'Nome do paciente é obrigatório' });
    }

    const result = await db.createPatient(req.userId, patientData);

    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }

    res.status(201).json({
      success: true,
      message: 'Paciente criado com sucesso',
      patientId: result.id
    });
  } catch (err) {
    console.error('[PATIENTS] Erro ao criar paciente:', err.message);
    res.status(500).json({ error: 'Erro ao criar paciente' });
  }
});

/**
 * PUT /api/patients/:id
 * Atualizar dados de um paciente
 */
app.put('/api/patients/:id', authenticateToken, async (req, res) => {
  try {
    const result = await db.updatePatient(req.params.id, req.userId, req.body);

    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }

    res.json({
      success: true,
      message: 'Paciente atualizado com sucesso'
    });
  } catch (err) {
    console.error('[PATIENTS] Erro ao atualizar paciente:', err.message);
    res.status(500).json({ error: 'Erro ao atualizar paciente' });
  }
});

/**
 * DELETE /api/patients/:id
 * Deletar um paciente
 */
app.delete('/api/patients/:id', authenticateToken, async (req, res) => {
  try {
    const result = await db.deletePatient(req.params.id, req.userId);

    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }

    res.json({
      success: true,
      message: 'Paciente deletado com sucesso'
    });
  } catch (err) {
    console.error('[PATIENTS] Erro ao deletar paciente:', err.message);
    res.status(500).json({ error: 'Erro ao deletar paciente' });
  }
});

// ============================================
// ROTAS DE ATIVIDADES
// ============================================

/**
 * GET /api/patients/:patientId/activities
 * Listar atividades de um paciente
 */
app.get('/api/patients/:patientId/activities', authenticateToken, async (req, res) => {
  try {
    const activities = await db.getActivitiesByPatientId(req.params.patientId, req.userId);
    res.json({
      success: true,
      data: activities
    });
  } catch (err) {
    console.error('[ACTIVITIES] Erro ao listar atividades:', err.message);
    res.status(500).json({ error: 'Erro ao listar atividades' });
  }
});

/**
 * POST /api/patients/:patientId/activities
 * Adicionar atividade a um paciente
 */
app.post('/api/patients/:patientId/activities', authenticateToken, async (req, res) => {
  try {
    const { type, desc, date } = req.body;

    if (!type || !desc) {
      return res.status(400).json({ error: 'Tipo e descrição da atividade são obrigatórios' });
    }

    const result = await db.createActivity(req.params.patientId, req.userId, {
      type,
      desc,
      date
    });

    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }

    res.status(201).json({
      success: true,
      message: 'Atividade adicionada com sucesso',
      activityId: result.id
    });
  } catch (err) {
    console.error('[ACTIVITIES] Erro ao adicionar atividade:', err.message);
    res.status(500).json({ error: 'Erro ao adicionar atividade' });
  }
});

/**
 * PUT /api/patients/:patientId/activities/:activityId
 * Atualizar uma atividade
 */
app.put('/api/patients/:patientId/activities/:activityId', authenticateToken, async (req, res) => {
  try {
    const result = await db.updateActivity(
      req.params.activityId,
      req.params.patientId,
      req.userId,
      req.body
    );

    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }

    res.json({
      success: true,
      message: 'Atividade atualizada com sucesso'
    });
  } catch (err) {
    console.error('[ACTIVITIES] Erro ao atualizar atividade:', err.message);
    res.status(500).json({ error: 'Erro ao atualizar atividade' });
  }
});

/**
 * DELETE /api/patients/:patientId/activities/:activityId
 * Deletar uma atividade
 */
app.delete('/api/patients/:patientId/activities/:activityId', authenticateToken, async (req, res) => {
  try {
    const result = await db.deleteActivity(
      req.params.activityId,
      req.params.patientId,
      req.userId
    );

    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }

    res.json({
      success: true,
      message: 'Atividade deletada com sucesso'
    });
  } catch (err) {
    console.error('[ACTIVITIES] Erro ao deletar atividade:', err.message);
    res.status(500).json({ error: 'Erro ao deletar atividade' });
  }
});

// ============================================
// ROTAS DE PERFIL
// ============================================

/**
 * GET /api/me
 * Obter dados do usuário autenticado
 */
app.get('/api/me', authenticateToken, async (req, res) => {
  try {
    const user = await db.getUserById(req.userId);

    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    res.json({
      success: true,
      data: user
    });
  } catch (err) {
    console.error('[PROFILE] Erro ao buscar perfil:', err.message);
    res.status(500).json({ error: 'Erro ao buscar perfil' });
  }
});

// ============================================
// ROTA DE HEALTH CHECK
// ============================================

app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// ============================================
// MIDDLEWARE DE ERRO (404)
// ============================================

app.use((req, res) => {
  res.status(404).json({
    error: 'Rota não encontrada',
    path: req.path
  });
});

// ============================================
// TRATAMENTO DE ERROS GLOBAL
// ============================================

app.use((err, req, res, next) => {
  console.error('[ERROR]', err);
  res.status(500).json({
    error: 'Erro interno do servidor',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// ============================================
// INICIAR SERVIDOR
// ============================================

const startServer = async () => {
  try {
    // Inicializar database
    await db.initializeDatabase();

    // Iniciar servidor
    app.listen(PORT, () => {
      console.log(`\n${'='.repeat(50)}`);
      console.log(`[SERVER] 🚀 NoteCare API iniciado com sucesso!`);
      console.log(`[SERVER] 📡 Escutando na porta: ${PORT}`);
      console.log(`[SERVER] 🔗 URL: http://localhost:${PORT}`);
      console.log(`[SERVER] 📚 Health check: http://localhost:${PORT}/health`);
      console.log(`${'='.repeat(50)}\n`);
    });
  } catch (err) {
    console.error('[SERVER] Erro ao iniciar servidor:', err.message);
    process.exit(1);
  }
};

startServer();

module.exports = app;
