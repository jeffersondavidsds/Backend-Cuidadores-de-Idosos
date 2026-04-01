# 🏥 NoteCare API - Backend

**Sistema de Gerenciamento de Pacientes Idosos com Autenticação 2FA**

Backend funcional para o frontend NoteCare com autenticação segura, verificação em duas etapas por email (OTP) e gerenciamento completo de pacientes e atividades.

---

## 📋 Sobre

A NoteCare API é um backend REST totalmente funcional desenvolvido com **Express.js** e **SQLite**, especialmente projetado para gerenciar dados de pacientes idosos por Enfermeiros Técnicos. O sistema inclui:

✅ **Autenticação Segura**
- Registro e login de usuários
- Autenticação de 2 Fatores (2FA) via email (OTP)
- JWT para manutenção de sessão

✅ **CRUD Completo**
- **Pacientes**: Criar, ler, atualizar, deletar com verificação de duplicidade
- **Atividades**: Registrar medicações, refeições, check-ups, higiene, etc

✅ **Segurança**
- Prepared statements contra SQL injection
- Validação de entrada em todas as rotas
- Proteção de dados sensíveis (.env no .gitignore)
- CORS configurado
- Foreign keys habilitadas no SQLite

✅ **Testes de Erro**
- Validação de campos obrigatórios
- Tratamento de duplicidade
- Autenticação e autorização
- Tratamento de erros globais

---

## 🚀 Instalação & Setup

### Pré-requisitos
- Node.js 14+ instalado
- npm ou yarn

### 1. Instalar Dependências

```bash
npm install
```

Isso instalará:
- `express` - Framework web
- `sqlite3` - Banco de dados
- `sqlite` - Driver SQLite
- `jsonwebtoken` - JWT para autenticação
- `dotenv` - Variáveis de ambiente
- `cors` - Controle de origem cruzada
- `nodemailer` - Envio de emails com OTP
- `nodemon` - Auto-reload em desenvolvimento

### 2. Configurar Variáveis de Ambiente

```bash
# Copiar arquivo de exemplo
cp .env.example .env
```

Edite `.env` com suas configurações:

```env
PORT=5000
NODE_ENV=development

# JWT Secret (MUDE ISTO EM PRODUÇÃO)
JWT_SECRET=notcare_secret_key_change_this_in_production_2024

# Email para envio de OTP
EMAIL_SERVICE=gmail
EMAIL_USER=seu_email@gmail.com
EMAIL_PASSWORD=sua_senha_de_app

# Frontend URL para CORS
FRONTEND_URL=http://localhost:3000
```

**⚠️ IMPORTANTE**: 
- Nunca commite o arquivo `.env` (já está no `.gitignore`)
- Para Gmail, gere uma [Senha de App](https://support.google.com/accounts/answer/185833)
- Mude a `JWT_SECRET` em produção

### 3. Iniciar o Servidor

```bash
# Modo desenvolvimento (com auto-reload)
npm run dev

# Modo produção
npm start
```

Você verá:

```
==================================================
[SERVER] 🚀 NoteCare API iniciado com sucesso!
[SERVER] 📡 Escutando na porta: 5000
[SERVER] 🔗 URL: http://localhost:5000
[SERVER] 📚 Health check: http://localhost:5000/health
==================================================
```

---

## 📚 API Endpoints

### 🔐 Autenticação

#### **POST /auth/register**
Registrar novo usuário (Enfermeiro Técnico)

```json
{
  "name": "Ana Clara Souza",
  "email": "ana@example.com",
  "password": "senha_forte",
  "registration": "CRE: 12345/SP"
}
```

**Response (201)**:
```json
{
  "success": true,
  "message": "Usuário cadastrado com sucesso",
  "userId": 1
}
```

**Erros**:
- `400`: Campos obrigatórios faltando, senha < 6 caracteres
- `409`: Email já cadastrado

---

#### **POST /auth/login**
Fazer login e receber OTP via email

```json
{
  "email": "ana@example.com",
  "password": "senha_forte"
}
```

**Response (200)**:
```json
{
  "success": true,
  "message": "Código enviado para seu email",
  "userId": 1,
  "requiresMFA": true
}
```

**Erros**:
- `400`: Email ou senha faltando
- `401`: Credenciais inválidas

---

#### **POST /auth/verify-otp**
Verificar código OTP de 2FA

```json
{
  "userId": 1,
  "otpCode": "123456"
}
```

**Response (200)**:
```json
{
  "success": true,
  "message": "Verificação bem-sucedida",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "name": "Ana Clara Souza",
    "email": "ana@example.com",
    "role": "Enfermeiro Técnico",
    "registration": "CRE: 12345/SP",
    "status": "Ativa",
    "avatar": "👩‍⚕️"
  }
}
```

**Erros**:
- `401`: Código inválido ou expirado

---

#### **POST /auth/send-otp**
Reenviar código OTP por email

```json
{
  "userId": 1
}
```

**Response (200)**:
```json
{
  "success": true,
  "message": "Código reenviado para seu email"
}
```

---

### 👥 Pacientes (Requer Autenticação)

**Header**: `Authorization: Bearer {token}`

#### **GET /api/patients**
Listar todos os pacientes do usuário

**Response (200)**:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Maria das Graças",
      "age": 78,
      "emoji": "👵",
      "status": "alert",
      "diagnosis": "Alzheimer leve",
      "conditions": "Hipertensão arterial",
      "contact": "(11) 98765-4321",
      "blood": "A+",
      "biometrics": "60 kg / 1,58 m",
      "meds": "Donepezil 5mg, Omeprazol 20mg",
      "allergies": "Nenhuma conhecida",
      "diet": "Dieta pastosa, redução de sal",
      "autonomyLevel": 2,
      "mobility": "cadeira_parcial",
      "communication": "verbal_dif",
      "sleep": "6-7h, interrupções frequentes",
      "env": {
        "ac": "moderado",
        "sun": "moderado",
        "cold": "proibido",
        "humidity": "moderado"
      },
      "notes": "Agitação comum no fim da tarde",
      "tags": ["Alzheimer", "Hipertensão", "Atenção"],
      "created_at": "2024-03-31T10:00:00.000Z",
      "updated_at": "2024-03-31T10:00:00.000Z"
    }
  ]
}
```

---

#### **GET /api/patients/:id**
Obter dados de um paciente específico com suas atividades

```bash
GET /api/patients/1
```

**Response (200)**:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Maria das Graças",
    "age": 78,
    "activities": [
      {
        "id": 101,
        "type": "med",
        "desc": "Donepezil 5mg com água",
        "date": "2025-06-15T08:00",
        "created_at": "2024-03-31T10:00:00.000Z"
      }
    ]
  }
}
```

**Erros**:
- `404`: Paciente não encontrado

---

#### **POST /api/patients**
Criar novo paciente (com verificação de duplicidade)

```json
{
  "name": "João Silva",
  "age": 82,
  "emoji": "👴",
  "status": "stable",
  "diagnosis": "Hipertensão + Diabetes tipo 2",
  "conditions": "Insuficiência renal leve",
  "contact": "(11) 91234-5678",
  "blood": "O+",
  "biometrics": "72 kg / 1,68 m",
  "meds": "Metformina 850mg, Losartana 50mg",
  "allergies": "Contraste iodado",
  "diet": "Dieta hipossódica",
  "autonomyLevel": 4,
  "mobility": "bengala",
  "communication": "verbal_clara",
  "sleep": "7-8h",
  "env": {
    "ac": "permitido",
    "sun": "moderado",
    "cold": "moderado",
    "humidity": "permitido"
  },
  "notes": "Paciente muito comunicativo",
  "tags": ["Diabetes", "Hipertensão"]
}
```

**Response (201)**:
```json
{
  "success": true,
  "message": "Paciente criado com sucesso",
  "patientId": 1
}
```

**Erros**:
- `400`: Nome obrigatório / Paciente com este nome já existe
- `401`: Não autenticado

---

#### **PUT /api/patients/:id**
Atualizar dados de um paciente

```bash
PUT /api/patients/1
```

```json
{
  "age": 83,
  "diagnosis": "Hipertensão + Diabetes tipo 2 (controlada)",
  "meds": "Metformina 850mg, Losartana 50mg, Atorvastatina 20mg"
}
```

**Response (200)**:
```json
{
  "success": true,
  "message": "Paciente atualizado com sucesso"
}
```

---

#### **DELETE /api/patients/:id**
Deletar um paciente (e suas atividades)

```bash
DELETE /api/patients/1
```

**Response (200)**:
```json
{
  "success": true,
  "message": "Paciente deletado com sucesso"
}
```

**Erros**:
- `404`: Paciente não encontrado

---

### 📝 Atividades

#### **GET /api/patients/:patientId/activities**
Listar atividades de um paciente

```bash
GET /api/patients/1/activities
```

**Response (200)**:
```json
{
  "success": true,
  "data": [
    {
      "id": 101,
      "type": "med",
      "desc": "Donepezil 5mg com água",
      "date": "2025-06-15T08:00",
      "created_at": "2024-03-31T10:00:00.000Z"
    },
    {
      "id": 102,
      "type": "meal",
      "desc": "Café da manhã – boa aceitação",
      "date": "2025-06-15T07:30"
    }
  ]
}
```

---

#### **POST /api/patients/:patientId/activities**
Adicionar atividade a um paciente

```json
{
  "type": "med",
  "desc": "Donepezil 5mg com água",
  "date": "2024-03-31T10:00:00.000Z"
}
```

**Tipos de atividade**:
- `med` - Medicação
- `meal` - Refeição
- `check` - Check-up/Monitoramento
- `note` - Anotação
- `hygiene` - Higiene
- `social` - Social
- `exercise` - Exercício

**Response (201)**:
```json
{
  "success": true,
  "message": "Atividade adicionada com sucesso",
  "activityId": 101
}
```

**Erros**:
- `400`: Tipo ou descrição faltando
- `404`: Paciente não encontrado

---

#### **PUT /api/patients/:patientId/activities/:activityId**
Atualizar uma atividade

```bash
PUT /api/patients/1/activities/101
```

```json
{
  "desc": "Donepezil 5mg com água (confirmado)"
}
```

**Response (200)**:
```json
{
  "success": true,
  "message": "Atividade atualizada com sucesso"
}
```

---

#### **DELETE /api/patients/:patientId/activities/:activityId**
Deletar uma atividade

```bash
DELETE /api/patients/1/activities/101
```

**Response (200)**:
```json
{
  "success": true,
  "message": "Atividade deletada com sucesso"
}
```

---

### 👤 Perfil

#### **GET /api/me**
Obter dados do usuário autenticado

```bash
GET /api/me
```

**Response (200)**:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Ana Clara Souza",
    "email": "ana@example.com",
    "role": "Enfermeiro Técnico",
    "registration": "CRE: 12345/SP",
    "status": "Ativa",
    "avatar": "👩‍⚕️",
    "two_factor_enabled": 1
  }
}
```

---

### 🏥 Health Check

#### **GET /health**
Verificar saúde da API

```bash
GET /health
```

**Response (200)**:
```json
{
  "status": "healthy",
  "timestamp": "2024-03-31T10:00:00.000Z",
  "version": "1.0.0"
}
```

---

## 🧪 Testes

A API inclui testes automatizados para todos os endpoints e cenários de erro.

### Executar Testes

```bash
# Você precisa manter o servidor rodando em outro terminal
# Terminal 1:
npm run dev

# Terminal 2:
npm test
```

Testes incluem:

✅ Health check  
✅ Registro de usuário (sucesso e validações)  
✅ Login (sucesso e falhas)  
✅ 2FA (OTP válido e inválido)  
✅ Proteção de rotas (sem token, token inválido)  
✅ CRUD de pacientes (validação de duplicidade)  
✅ CRUD de atividades  
✅ Perfil do usuário  

---

## 📊 Estrutura do Banco de Dados

### 🔹 Tabela `users`
```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  registration TEXT,
  role TEXT DEFAULT 'Enfermeiro Técnico',
  status TEXT DEFAULT 'Ativa',
  avatar TEXT DEFAULT '👩‍⚕️',
  two_factor_enabled BOOLEAN DEFAULT 0,
  otp_code TEXT,
  otp_expires_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
)
```

### 🔹 Tabela `patients`
```sql
CREATE TABLE patients (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  age INTEGER,
  emoji TEXT,
  status TEXT,
  diagnosis TEXT,
  conditions TEXT,
  contact TEXT,
  blood TEXT,
  biometrics TEXT,
  meds TEXT,
  allergies TEXT,
  diet TEXT,
  autonomy_level INTEGER,
  mobility TEXT,
  communication TEXT,
  sleep TEXT,
  env_ac TEXT,
  env_sun TEXT,
  env_cold TEXT,
  env_humidity TEXT,
  notes TEXT,
  tags TEXT (JSON),
  created_at DATETIME,
  updated_at DATETIME,
  UNIQUE(user_id, name),
  FOREIGN KEY(user_id) REFERENCES users(id)
)
```

### 🔹 Tabela `activities`
```sql
CREATE TABLE activities (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  patient_id INTEGER NOT NULL,
  type TEXT NOT NULL,
  description TEXT NOT NULL,
  date DATETIME NOT NULL,
  created_at DATETIME,
  updated_at DATETIME,
  FOREIGN KEY(patient_id) REFERENCES patients(id)
)
```

---

## 🔒 Recursos de Segurança

### ✅ Proteção de Dados Sensíveis
- `.env` automaticamente adicionado ao `.gitignore`
- Senhas armazenadas com hash SHA-256
- Dados nunca são logados em produção

### ✅ Autenticação & Autorização
- JWT com expiração 24h
- Verificação em todas as rotas protegidas
- 2FA obrigatório após login

### ✅ Validação de Entrada
- Campos obrigatórios verificados
- Prepared statements contra SQL injection
- Sanitização de dados

### ✅ Controle de Dados
- Foreign keys habilitadas (cascata)
- Usuário só acessa seus próprios dados
- Verificação de duplicidade de pacientes

### ✅ CORS Configurado
- Apenas origem permitida pelo frontend
- Métodos permitidos: GET, POST, PUT, DELETE
- Credenciais habilitadas

---

## 📁 Estrutura de Arquivos

```
.
├── database.js           # SQLite schema e funções de CRUD
├── server.js             # Express API com todas as rotas
├── package.json          # Dependências do projeto
├── .env.example          # Template de variáveis de ambiente
├── .env                  # Variáveis de ambiente (NUNCA COMMITAR)
├── .gitignore            # Arquivos ignorados pelo git
├── notcare.db            # Banco de dados SQLite (criado automaticamente)
├── README.md             # Este arquivo
└── tests/
    └── test-api.js       # Testes automatizados da API
```

---

## 🚨 Tratamento de Erros

A API retorna erros consistentes com HTTP status apropriados:

| Status | Situação |
|--------|----------|
| `200` | Sucesso GET/PUT/DELETE |
| `201` | Sucesso POST (criação) |
| `400` | Validação falhou / Dados inválidos |
| `401` | Não autenticado / Credenciais inválidas |
| `403` | Token inválido / Expirado |
| `404` | Recurso não encontrado |
| `409` | Conflito (ex: email duplicado) |
| `500` | Erro interno do servidor |

**Formato de Erro**:
```json
{
  "error": "Mensagem descritiva do erro"
}
```

---

## 🔄 Fluxo de Autenticação 2FA

```
1. Usuário faz POST /auth/login
   ↓
2. API valida credenciais
   ↓
3. API gera OTP de 6 dígitos
   ↓
4. API envia OTP para email do usuário
   ↓
5. Usuário recebe email com código
   ↓
6. Usuário envia código via POST /auth/verify-otp
   ↓
7. API valida código (válido por 10 minutos)
   ↓
8. API retorna JWT token válido por 24h
   ↓
9. Frontend armazena token e usa em Authorization header
   ↓
10. Usuário pode acessar rotas protegidas (/api/*)
```

---

## 💾 Integração com Frontend

### 1. Configurar CORS
No arquivo `.env` do backend, adicione:
```env
FRONTEND_URL=http://localhost:3000
```

### 2. Usar Token nas Requisições

```javascript
// Exemplo em JavaScript/React
const token = localStorage.getItem('auth_token');

const response = await fetch('http://localhost:5000/api/patients', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});
```

### 3. Arquivos Frontend Compatíveis

O backend foi desenvolvido para se integrar com:
- `AuthContext.js` - Maneja autenticação e 2FA
- `DataContext.js` - Maneja dados de pacientes e atividades
- Formulários de pacientes e atividades

---

## 🐛 Troubleshooting

### "Erro ao conectar ao SQLite"
- Verifique se a pasta tem permissões de escrita
- Tente deletar `notcare.db` e reiniciar

### "Email não envia OTP"
- Verifique credenciais no `.env`
- Para Gmail: use [Senha de App](https://support.google.com/accounts/answer/185833)
- Ative acesso de "Aplicativos menos seguros"

### "CORS Error"
- Verifique `FRONTEND_URL` no `.env`
- Certifique-se de que matches com URL do frontend

### "Token expirou"
- User precisa fazer login novamente
- Frontend deve redirecionar para login

---

## 📝 Logging

O servidor escreve logs com prefixos para facilitar debug:

```
[DATABASE] - Eventos do banco de dados
[AUTH] - Eventos de autenticação
[PATIENTS] - Operações com pacientes
[ACTIVITIES] - Operações com atividades
[PROFILE] - Eventos de perfil
[EMAIL] - Eventos de email
[SERVER] - Eventos do servidor
[ERROR] - Erros gerais
```

---

## 🌐 Deploy

### Antes de Deploy
1. Crie um arquivo `.env` com variáveis seguras
2. Mude `JWT_SECRET` para uma chave forte aleatória
3. Configure `EMAIL_USER` e `EMAIL_PASSWORD`
4. Defina `NODE_ENV=production`
5. Use `FRONTEND_URL` da aplicação deployada

### Plataformas Recomendadas
- **Heroku** (fácil, grátis com limitações)
- **Railway** (moderno, boa documentação)
- **AWS ec2** (mais controle)
- **DigitalOcean App Platform** (simples)

---

## 📞 Suporte

Para erros ou sugestões, verifique:
1. Os logs do terminal
2. Console do navegador (frontend)
3. Arquivo de testes (`npm test`)

---

## 📄 Licença

ISC

---

## ✨ Próximas Melhorias

- [ ] Rate limiting
- [ ] Refresh tokens
- [ ] Backup automático de banco de dados
- [ ] Logs em arquivo
- [ ] Documentação OpenAPI/Swagger
- [ ] Autenticação OAuth
- [ ] Relatórios em PDF
- [ ] Integração com WhatsApp para alertas

---

**Desenvolvido com ❤️ para cuidadores de idosos**
