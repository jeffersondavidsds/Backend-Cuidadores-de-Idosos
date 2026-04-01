# 🚀 Quick Reference - NoteCare API

**Acesso Rápido a Tudo que Você Precisa**

---

## ⚡ Início Rápido (1 minuto)

```bash
# 1. Instalar
npm install

# 2. Configurar
cp .env.example .env
# Editar .env com EMAIL_USER e EMAIL_PASSWORD

# 3. Rodar
npm run dev

# 4. Testar (outro terminal)
npm test
```

---

## 📍 URLs Importantes

| Item | URL |
|------|-----|
| API Base | http://localhost:5000 |
| Health Check | http://localhost:5000/health |
| Frontend | http://localhost:3000 |
| Documentação | ./README_API.md |
| Setup Frontend | ./FRONTEND_SETUP.js |

---

## 🔐 Fluxo de Login

```
1. POST /auth/register
   ↓ email + senha
2. POST /auth/login  
   ↓ (OTP enviado por email)
3. POST /auth/verify-otp
   ↓ (código do email)
4. Receber JWT token (valid 24h)
   ↓
5. Usar token em Header: Authorization: Bearer {token}
```

---

## 📡 Endpoints Básicos

### Autenticação
```bash
# Registrar
curl -X POST http://localhost:5000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Ana","email":"ana@example.com","password":"senha123"}'

# Login
curl -X POST http://localhost:5000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"ana@example.com","password":"senha123"}'

# Verificar OTP (usar código recebido no email)
curl -X POST http://localhost:5000/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{"userId":1,"otpCode":"123456"}'
```

### Pacientes
```bash
# Listar
curl -X GET http://localhost:5000/api/patients \
  -H "Authorization: Bearer {token}"

# Criar
curl -X POST http://localhost:5000/api/patients \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {token}" \
  -d '{"name":"Maria","age":78,"diagnosis":"Alzheimer"}'

# Atualizar
curl -X PUT http://localhost:5000/api/patients/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {token}" \
  -d '{"age":79}'

# Deletar
curl -X DELETE http://localhost:5000/api/patients/1 \
  -H "Authorization: Bearer {token}"
```

### Atividades
```bash
# Adicionar
curl -X POST http://localhost:5000/api/patients/1/activities \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {token}" \
  -d '{"type":"med","desc":"Donepezil 5mg"}'

# Deletar
curl -X DELETE http://localhost:5000/api/patients/1/activities/101 \
  -H "Authorization: Bearer {token}"
```

---

## 🧪 Testes Rápidos

```bash
# Rodar todos os testes
npm test

# Resultado esperado: ✓ Testes Passados: X
```

---

## 📊 Status Codes HTTP

| Código | Significado | Ação |
|--------|-------------|------|
| 200 | OK (GET/PUT/DELETE bem-sucedido) | ✅ |
| 201 | Created (POST bem-sucedido) | ✅ |
| 400 | Bad Request (validação falhou) | ❌ |
| 401 | Unauthorized (não autenticado) | 🔐 |
| 403 | Forbidden (token inválido) | 🔐 |
| 404 | Not Found (recurso não existe) | ❌ |
| 409 | Conflict (email/paciente duplicado) | ⚠️ |
| 500 | Server Error | 🔥 |

---

## 🔧 Troubleshooting

```bash
# Erro: "Erro ao conectar ao SQLite"
rm notcare.db
npm run dev

# Erro: "Address already in use"
# (Porta 5000 já está usando)
lsof -i :5000        # Ver o que está usando
kill -9 <PID>        # Matar processo

# Erro: "ECONNREFUSED" no frontend
# (Backend não está rodando)
npm run dev          # Em outro terminal

# Erro: "No 'Access-Control-Allow-Origin'"
# Verifique .env: FRONTEND_URL=http://localhost:3000
```

---

## 📝 Estrutura de Request/Response

### Request Login
```json
POST /auth/login
{
  "email": "ana@example.com",
  "password": "senha123"
}
```

### Response (Success)
```json
{
  "success": true,
  "message": "Código enviado para seu email",
  "userId": 1,
  "requiresMFA": true
}
```

### Response (Error)
```json
{
  "error": "Credenciais inválidas"
}
```

---

## 🗄️ Banco de Dados (SQLite)

```bash
# Ver dados em sqlite3 (se instalado)
sqlite3 notcare.db

# Comandos SQL úteis
SELECT * FROM users;
SELECT * FROM patients WHERE user_id = 1;
SELECT * FROM activities WHERE patient_id = 1;

# Deletar dados (reset)
DELETE FROM activities;
DELETE FROM patients;
DELETE FROM users;

# Sair do sqlite3
.quit
```

---

## 📦 Estrutura de Pastas

```
Backend Cuidadores de Idosos/
├── database.js            # SQLite + CRUD
├── server.js              # Express API
├── package.json           # Dependências
├── .env                   # Variáveis (NÃO COMMITAR)
├── .env.example           # Template
├── .gitignore             # Proteção
├── *.md                   # Documentação
├── notcare.db             # Banco (criado auto)
└── tests/
    └── test-api.js        # Testes
```

---

## 💻 Variáveis de Ambiente (.env)

```env
# Obrigatórias
PORT=5000
JWT_SECRET=sua_chave_secreta_aqui
EMAIL_USER=seu_email@gmail.com
EMAIL_PASSWORD=sua_senha_de_app

# Opcional
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
DATABASE_PATH=./notcare.db
```

---

## 🎯 Tipos de Atividade

```
med       - Medicação
meal      - Refeição
check     - Check-up/Monitoramento
note      - Anotação
hygiene   - Higiene
social    - Social
exercise  - Exercício
```

---

## 🔐 Campos Sensíveis (Nunca Logar!)

```javascript
// ❌ NUNCA LOGAR ISSO:
- password
- password_hash
- otp_code
- JWT token
- EMAIL_PASSWORD
- JWT_SECRET
- Dados pessoais (email, nome completo)

// ✅ OK LOGAR:
- User ID
- Timestamps
- Status codes
- Métodos HTTP
- Endpoints (sem parâmetros)
```

---

## 📞 Arquivos de Ajuda

| Arquivo | Conteúdo |
|---------|----------|
| README_API.md | 📖 Documentação completa |
| INTEGRATION_GUIDE.js | 🔗 Como integrar frontend |
| FRONTEND_SETUP.js | ⚙️ Setup frontend rápido |
| IMPLEMENTATION_CHECKLIST.md | ✅ Verificação final |
| RESUMO_FINAL.md | 🎯 Resumo executivo |

---

## 🚀 Deploy Rápido (Heroku)

```bash
# 1. Login no Heroku
heroku login

# 2. Criar app
heroku create notcare-api

# 3. Configurar variáveis
heroku config:set JWT_SECRET=sua_chave
heroku config:set EMAIL_USER=seu_email@gmail.com
heroku config:set EMAIL_PASSWORD=sua_senha

# 4. Deploy
git push heroku main

# 5. Ver logs
heroku logs --tail
```

---

## 🧠 Dicas Importantes

1. **Sempre use token** no header Authorization: Bearer {token}
2. **OTP expira em 10 minutos** - não esqueça de reenviar
3. **Senhas têm mínimo 6 caracteres** - valide no frontend
4. **Nomes de pacientes são únicos** por usuário
5. **Deletar paciente** deleta todas suas atividades também
6. **JWT válido 24 horas** - user faz login novamente depois
7. **Nunca commite .env** - adicione ao .gitignore
8. **use Senha de App do Gmail** - não sua senha normal

---

## 📋 Checklist Pré-Launch

- [ ] npm install funcionou
- [ ] .env criado e preenchido
- [ ] npm run dev rodando
- [ ] npm test passando
- [ ] Postman / Insomnia testou endpoints
- [ ] Frontend conectado
- [ ] 2FA funciona (email recebido)
- [ ] Criar paciente sem duplicatas
- [ ] Adicionar atividades bem
- [ ] Deletar paciente deleta atividades
- [ ] Token expira corretamente
- [ ] .env em .gitignore

---

## 🎓 Próximas Features

- [ ] Rate limiting
- [ ] Refresh tokens
- [ ] Logs em arquivo
- [ ] Webhooks
- [ ] Sync offline
- [ ] Relatórios PDF
- [ ] Alertas SMS
- [ ] App mobile

---

## 💡 Exemplos Rápidos

### Registrar Novo Usuário (JavaScript)
```javascript
const response = await fetch('http://localhost:5000/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'Ana Clara',
    email: 'ana@example.com',
    password: 'senha123',
    registration: 'CRE: 12345/SP'
  })
});
const data = await response.json();
console.log(data.userId); // ID do novo usuário
```

### Criar Paciente (JavaScript)
```javascript
const token = localStorage.getItem('imhomecare_token');

const response = await fetch('http://localhost:5000/api/patients', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    name: 'Maria da Silva',
    age: 78,
    diagnosis: 'Alzheimer'
  })
});
const data = await response.json();
console.log(data.patientId); // ID do novo paciente
```

---

## 🆘 SOS - Algo Quebrou!

```bash
# 1. Verificar se backend está rodando
curl http://localhost:5000/health

# 2. Verificar logs (saída do npm run dev)
# Procure por [ERROR] ou [DATABASE]

# 3. Verificar .env
nano .env
# EMAIL_USER e EMAIL_PASSWORD preenchidos?

# 4. Reiniciar backend
# Ctrl+C no terminal
# npm run dev

# 5. Reset banco (última opção)
rm notcare.db
npm run dev
```

---

## 📊 Performance

- Queries preparadas (sem N+1)
- Índices automaticamente em PRIMARY KEY
- Paginação suportada (via query params no futuro)
- Cache em localStorage (frontend)
- Compression habilitado por padrão (Express)

---

## 🎉 Pronto!

Você tem tudo que precisa!

```bash
npm install && npm run dev
# E vá brincar! 🚀
```

---

**Última atualização**: 31 de Março de 2024  
**Versão**: 1.0.0  
**Status**: ✅ Pronto para Uso
