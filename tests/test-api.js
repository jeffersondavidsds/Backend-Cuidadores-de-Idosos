/**
 * TESTES DA API - NoteCare
 * Execute com: npm test
 * 
 * Este arquivo testa todos os endpoints e cenários de erro
 */

const http = require('http');

const BASE_URL = 'http://localhost:5000';

let testResults = {
  passed: 0,
  failed: 0,
  tests: []
};

// ============================================
// FUNÇÕES AUXILIARES
// ============================================

const makeRequest = (method, path, data = null, token = null) => {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            body: body ? JSON.parse(body) : null
          });
        } catch (err) {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            body: body
          });
        }
      });
    });

    req.on('error', reject);

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
};

const test = async (name, fn) => {
  try {
    await fn();
    testResults.passed++;
    testResults.tests.push({ name, status: '✓ PASS' });
    console.log(`✓ ${name}`);
  } catch (err) {
    testResults.failed++;
    testResults.tests.push({ name, status: '✗ FAIL', error: err.message });
    console.log(`✗ ${name}: ${err.message}`);
  }
};

const assert = (condition, message) => {
  if (!condition) {
    throw new Error(message);
  }
};

// ============================================
// VARIÁVEIS GLOBAIS PARA TESTES
// ============================================

let testUser = {
  id: null,
  email: 'teste@notcare.com',
  password: 'senha123',
  name: 'Teste Enfermeiro'
};

let testToken = null;
let testPatientId = null;
let testActivityId = null;

// ============================================
// TESTES
// ============================================

const runTests = async () => {
  console.log('\n' + '='.repeat(60));
  console.log('🧪 INICIANDO TESTES DA API NOTCARE');
  console.log('='.repeat(60) + '\n');

  // ============================================
  // 1. TESTES DE HEALTH CHECK
  // ============================================
  console.log('\n📌 HEALTH CHECK\n');

  await test('GET /health - Verificar saúde da API', async () => {
    const res = await makeRequest('GET', '/health');
    assert(res.status === 200, 'Status esperado 200');
    assert(res.body.status === 'healthy', 'API deveria estar saudável');
  });

  // ============================================
  // 2. TESTES DE AUTENTICAÇÃO
  // ============================================
  console.log('\n📌 AUTENTICAÇÃO\n');

  // Teste 2.1: Registrar usuário
  await test('POST /auth/register - Registrar usuário com sucesso', async () => {
    const res = await makeRequest('POST', '/auth/register', {
      name: testUser.name,
      email: testUser.email,
      password: testUser.password,
      registration: 'CRE: 12345/SP'
    });
    assert(res.status === 201, `Status esperado 201, recebido ${res.status}`);
    assert(res.body.success === true, 'Deveria registrar com sucesso');
    assert(res.body.userId, 'Deveria retornar userId');
    testUser.id = res.body.userId;
  });

  // Teste 2.2: Registrar com email duplicado
  await test('POST /auth/register - Rejeitar email duplicado', async () => {
    const res = await makeRequest('POST', '/auth/register', {
      name: 'Outro Enfermeiro',
      email: testUser.email,
      password: 'senha456'
    });
    assert(res.status === 409, `Status esperado 409, recebido ${res.status}`);
    assert(res.body.error, 'Deveria retornar erro');
  });

  // Teste 2.3: Registrar sem campos obrigatórios
  await test('POST /auth/register - Validar campos obrigatórios', async () => {
    const res = await makeRequest('POST', '/auth/register', {
      name: 'Teste'
    });
    assert(res.status === 400, `Status esperado 400, recebido ${res.status}`);
    assert(res.body.error, 'Deveria retornar erro de validação');
  });

  // Teste 2.4: Validar senha mínima
  await test('POST /auth/register - Validar comprimento mínimo da senha', async () => {
    const res = await makeRequest('POST', '/auth/register', {
      name: 'Teste',
      email: 'teste2@notcare.com',
      password: '123'
    });
    assert(res.status === 400, `Status esperado 400, recebido ${res.status}`);
    assert(res.body.error.includes('mínimo'), 'Deveria mencionar mínimo de caracteres');
  });

  // Teste 2.5: Login e solicitar 2FA
  await test('POST /auth/login - Login e receber OTP', async () => {
    const res = await makeRequest('POST', '/auth/login', {
      email: testUser.email,
      password: testUser.password
    });
    assert(res.status === 200, `Status esperado 200, recebido ${res.status}`);
    assert(res.body.success === true, 'Login deveria ser bem-sucedido');
    assert(res.body.requiresMFA === true, 'Deveria requerer MFA');
  });

  // Teste 2.6: Login com credenciais inválidas
  await test('POST /auth/login - Rejeitar credenciais inválidas', async () => {
    const res = await makeRequest('POST', '/auth/login', {
      email: testUser.email,
      password: 'senhaerrada'
    });
    assert(res.status === 401, `Status esperado 401, recebido ${res.status}`);
    assert(res.body.error, 'Deveria retornar erro');
  });

  // Teste 2.7: Login sem campos obrigatórios
  await test('POST /auth/login - Validar campos obrigatórios', async () => {
    const res = await makeRequest('POST', '/auth/login', {
      email: testUser.email
    });
    assert(res.status === 400, `Status esperado 400, recebido ${res.status}`);
  });

  // Teste 2.8: Verificar OTP inválido
  await test('POST /auth/verify-otp - Rejeitar código inválido', async () => {
    const res = await makeRequest('POST', '/auth/verify-otp', {
      userId: testUser.id,
      otpCode: '000000'
    });
    assert(res.status === 401, `Status esperado 401, recebido ${res.status}`);
    assert(res.body.error, 'Deveria retornar erro');
  });

  // Teste 2.9: Reenviar OTP
  await test('POST /auth/send-otp - Reenviar código por email', async () => {
    const res = await makeRequest('POST', '/auth/send-otp', {
      userId: testUser.id
    });
    assert(res.status === 200, `Status esperado 200, recebido ${res.status}`);
    assert(res.body.success === true, 'Deveria reenviar OTP');
  });

  // ============================================
  // 3. TESTES DE AUTENTICAÇÃO FALHA
  // ============================================
  console.log('\n📌 PROTEÇÃO DE ROTAS\n');

  // Teste 3.1: Acessar rota protegida sem token
  await test('GET /api/patients - Rejeitar sem token', async () => {
    const res = await makeRequest('GET', '/api/patients');
    assert(res.status === 401, `Status esperado 401, recebido ${res.status}`);
    assert(res.body.error.includes('Token'), 'Deveria mencionar token');
  });

  // Teste 3.2: Acessar com token inválido
  await test('GET /api/patients - Rejeitar token inválido', async () => {
    const res = await makeRequest('GET', '/api/patients', null, 'token_invalido');
    assert(res.status === 403, `Status esperado 403, recebido ${res.status}`);
  });

  // ============================================
  // 4. TESTES DE PACIENTES
  // ============================================
  console.log('\n📌 PACIENTES (CRUD)\n');

  // CRIAR TOKEN PARA TESTES POSTERIORES
  // Para testes reais, você precisaria de um OTP válido
  // Por enquanto, vamos simular um token válido
  const crypto = require('crypto');
  const jwt = require('jsonwebtoken');
  testToken = jwt.sign({ userId: testUser.id }, 'notcare_secret_key_change_this_in_production_2024', { expiresIn: '24h' });

  // Teste 4.1: Criar paciente com sucesso
  await test('POST /api/patients - Criar paciente', async () => {
    const res = await makeRequest('POST', '/api/patients', {
      name: 'Maria da Silva',
      age: 78,
      diagnosis: 'Alzheimer',
      conditions: 'Hipertensão',
      contact: '(11) 98765-4321',
      blood: 'A+',
      autonomyLevel: 2
    }, testToken);
    assert(res.status === 201, `Status esperado 201, recebido ${res.status}`);
    assert(res.body.success === true, 'Paciente deveria ser criado');
    assert(res.body.patientId, 'Deveria retornar ID do paciente');
    testPatientId = res.body.patientId;
  });

  // Teste 4.2: Validar duplicidade de paciente
  await test('POST /api/patients - Rejeitar paciente duplicado', async () => {
    const res = await makeRequest('POST', '/api/patients', {
      name: 'Maria da Silva',
      age: 80,
      diagnosis: 'Parkinson'
    }, testToken);
    assert(res.status === 400, `Status esperado 400, recebido ${res.status}`);
    assert(res.body.error.includes('já existe'), 'Deveria mencionar duplicidade');
  });

  // Teste 4.3: Criar paciente sem nome
  await test('POST /api/patients - Validar campo obrigatório (nome)', async () => {
    const res = await makeRequest('POST', '/api/patients', {
      age: 75
    }, testToken);
    assert(res.status === 400, `Status esperado 400, recebido ${res.status}`);
  });

  // Teste 4.4: Listar pacientes
  await test('GET /api/patients - Listar todos os pacientes', async () => {
    const res = await makeRequest('GET', '/api/patients', null, testToken);
    assert(res.status === 200, `Status esperado 200, recebido ${res.status}`);
    assert(Array.isArray(res.body.data), 'Deveria retornar array');
    assert(res.body.data.length > 0, 'Deveria ter pelo menos 1 paciente');
  });

  // Teste 4.5: Obter paciente específico
  await test('GET /api/patients/:id - Obter paciente por ID', async () => {
    const res = await makeRequest(`GET /api/patients/${testPatientId}`, null, testToken);
    const res2 = await makeRequest('GET', `/api/patients/${testPatientId}`, null, testToken);
    assert(res2.status === 200, `Status esperado 200, recebido ${res2.status}`);
    assert(res2.body.success === true, 'Deveria retornar paciente');
    assert(res2.body.data.id === testPatientId, 'Deveria retornar paciente correto');
  });

  // Teste 4.6: Obter paciente que não existe
  await test('GET /api/patients/:id - Retornar 404 para paciente inexistente', async () => {
    const res = await makeRequest('GET', '/api/patients/99999', null, testToken);
    assert(res.status === 404, `Status esperado 404, recebido ${res.status}`);
  });

  // Teste 4.7: Atualizar paciente
  await test('PUT /api/patients/:id - Atualizar paciente', async () => {
    const res = await makeRequest('PUT', `/api/patients/${testPatientId}`, {
      age: 79,
      diagnosis: 'Alzheimer moderado'
    }, testToken);
    assert(res.status === 200, `Status esperado 200, recebido ${res.status}`);
    assert(res.body.success === true, 'Deveria atualizar com sucesso');
  });

  // Teste 4.8: Deletar paciente
  // Vamos criar outro paciente para deletar
  let patientToDelete = null;
  const createRes = await makeRequest('POST', '/api/patients', {
    name: 'Paciente Temporário',
    age: 75
  }, testToken);
  if (createRes.status === 201) {
    patientToDelete = createRes.body.patientId;
  }

  if (patientToDelete) {
    await test('DELETE /api/patients/:id - Deletar paciente', async () => {
      const res = await makeRequest('DELETE', `/api/patients/${patientToDelete}`, null, testToken);
      assert(res.status === 200, `Status esperado 200, recebido ${res.status}`);
      assert(res.body.success === true, 'Deveria deletar com sucesso');
    });
  }

  // ============================================
  // 5. TESTES DE ATIVIDADES
  // ============================================
  if (testPatientId) {
    console.log('\n📌 ATIVIDADES (CRUD)\n');

    // Teste 5.1: Adicionar atividade
    await test('POST /api/patients/:id/activities - Adicionar atividade', async () => {
      const res = await makeRequest('POST', `/api/patients/${testPatientId}/activities`, {
        type: 'med',
        desc: 'Donepezil 5mg com água',
        date: new Date().toISOString()
      }, testToken);
      assert(res.status === 201, `Status esperado 201, recebido ${res.status}`);
      assert(res.body.success === true, 'Atividade deveria ser criada');
      assert(res.body.activityId, 'Deveria retornar ID da atividade');
      testActivityId = res.body.activityId;
    });

    // Teste 5.2: Criar atividade sem tipo
    await test('POST /api/patients/:id/activities - Validar campos obrigatórios', async () => {
      const res = await makeRequest('POST', `/api/patients/${testPatientId}/activities`, {
        desc: 'Descrição sem tipo'
      }, testToken);
      assert(res.status === 400, `Status esperado 400, recebido ${res.status}`);
    });

    // Teste 5.3: Listar atividades
    await test('GET /api/patients/:id/activities - Listar atividades', async () => {
      const res = await makeRequest('GET', `/api/patients/${testPatientId}/activities`, null, testToken);
      assert(res.status === 200, `Status esperado 200, recebido ${res.status}`);
      assert(Array.isArray(res.body.data), 'Deveria retornar array');
    });

    // Teste 5.4: Atualizar atividade
    if (testActivityId) {
      await test('PUT /api/patients/:id/activities/:actId - Atualizar atividade', async () => {
        const res = await makeRequest('PUT', `/api/patients/${testPatientId}/activities/${testActivityId}`, {
          desc: 'Donepezil 5mg com água (atualizado)'
        }, testToken);
        assert(res.status === 200, `Status esperado 200, recebido ${res.status}`);
        assert(res.body.success === true, 'Deveria atualizar com sucesso');
      });

      // Teste 5.5: Deletar atividade
      await test('DELETE /api/patients/:id/activities/:actId - Deletar atividade', async () => {
        const res = await makeRequest('DELETE', `/api/patients/${testPatientId}/activities/${testActivityId}`, null, testToken);
        assert(res.status === 200, `Status esperado 200, recebido ${res.status}`);
        assert(res.body.success === true, 'Deveria deletar com sucesso');
      });
    }
  }

  // ============================================
  // 6. TESTES DE PROFILE
  // ============================================
  console.log('\n📌 PERFIL\n');

  await test('GET /api/me - Obter dados do usuário autenticado', async () => {
    const res = await makeRequest('GET', '/api/me', null, testToken);
    assert(res.status === 200, `Status esperado 200, recebido ${res.status}`);
    assert(res.body.data.id === testUser.id, 'Deveria retornar usuário correto');
    assert(res.body.data.email === testUser.email, 'Email deveria estar correto');
  });

  // ============================================
  // 7. RELATÓRIO DE TESTES
  // ============================================
  console.log('\n' + '='.repeat(60));
  console.log('📊 RELATÓRIO DE TESTES');
  console.log('='.repeat(60));
  console.log(`✓ Testes Passados: ${testResults.passed}`);
  console.log(`✗ Testes Falhados: ${testResults.failed}`);
  console.log(`📈 Total: ${testResults.tests.length}`);
  console.log(`✅ Taxa de Sucesso: ${((testResults.passed / testResults.tests.length) * 100).toFixed(2)}%`);
  console.log('='.repeat(60) + '\n');

  if (testResults.failed > 0) {
    console.log('❌ TESTES COM FALHA:\n');
    testResults.tests.filter(t => t.error).forEach(t => {
      console.log(`  ✗ ${t.name}\n    └─ ${t.error}\n`);
    });
  }

  process.exit(testResults.failed > 0 ? 1 : 0);
};

// Aguardar 2 segundos para o servidor iniciar, depois rodar testes
setTimeout(runTests, 2000);
