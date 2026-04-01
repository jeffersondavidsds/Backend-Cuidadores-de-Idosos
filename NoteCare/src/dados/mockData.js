export const initialPatients = [
  {
    id: 1,
    name: 'Maria das Graças',
    age: 78,
    emoji: '👵',
    status: 'alert',
    diagnosis: 'Alzheimer leve',
    conditions: 'Hipertensão arterial',
    contact: '(11) 98765-4321',
    blood: 'A+',
    biometrics: '60 kg / 1,58 m',
    meds: 'Donepezil 5mg, Omeprazol 20mg',
    allergies: 'Nenhuma conhecida',
    diet: 'Dieta pastosa, redução de sal',
    autonomyLevel: 2,
    mobility: 'cadeira_parcial',
    communication: 'verbal_dif',
    sleep: '6-7h, interrupções frequentes',
    risks: ['quedas', 'confusao', 'desidratacao'],
    env: {
      ac: 'moderado',
      sun: 'moderado',
      cold: 'proibido',
      humidity: 'moderado'
    },
    notes: 'Agitação comum no fim da tarde (sundowning). Família avisada sempre que necessário. Gosta de músicas dos anos 60.',
    tags: ['Alzheimer', 'Hipertensão', 'Atenção'],
    activities: [
      {
        id: 101,
        type: 'med',
        desc: 'Donepezil 5mg com água',
        date: '2025-06-15T08:00'
      },
      {
        id: 102,
        type: 'meal',
        desc: 'Café da manhã – boa aceitação',
        date: '2025-06-15T07:30'
      },
      {
        id: 103,
        type: 'check',
        desc: 'PA: 130/80 mmHg. Bem disposta.',
        date: '2025-06-14T09:00'
      },
      {
        id: 104,
        type: 'note',
        desc: 'Episódio de agitação às 18h, revertido.',
        date: '2025-06-13T18:30'
      },
      {
        id: 105,
        type: 'hygiene',
        desc: 'Banho assistido, sem intercorrências.',
        date: '2025-06-12T08:00'
      },
      {
        id: 106,
        type: 'meal',
        desc: 'Almoço – aceitação parcial (60%).',
        date: '2025-06-08T12:00'
      },
      {
        id: 107,
        type: 'check',
        desc: 'Glicemia: 95 mg/dL.',
        date: '2025-06-07T07:30'
      }
    ]
  },
  {
    id: 2,
    name: 'José Antônio',
    age: 82,
    emoji: '👴',
    status: 'stable',
    diagnosis: 'Hipertensão + Diabetes tipo 2',
    conditions: 'Insuficiência renal leve',
    contact: '(11) 91234-5678',
    blood: 'O+',
    biometrics: '72 kg / 1,68 m',
    meds: 'Metformina 850mg, Losartana 50mg, AAS 100mg',
    allergies: 'Contraste iodado',
    diet: 'Dieta hipossódica, controle glicêmico',
    autonomyLevel: 4,
    mobility: 'bengala',
    communication: 'verbal_clara',
    sleep: '7-8h, acorda 1-2x',
    risks: ['hipoglicemia', 'hiper_crise', 'incontinencia'],
    env: {
      ac: 'permitido',
      sun: 'moderado',
      cold: 'moderado',
      humidity: 'permitido'
    },
    notes: 'Controle glicêmico em dia. Muito comunicativo, gosta de rádio e jogos de cartas.',
    tags: ['Diabetes', 'Hipertensão'],
    activities: [
      {
        id: 201,
        type: 'check',
        desc: 'Glicemia: 118 mg/dL. PA: 128/78.',
        date: '2025-06-15T08:30'
      },
      {
        id: 202,
        type: 'med',
        desc: 'Metformina e Losartana.',
        date: '2025-06-15T07:00'
      },
      {
        id: 203,
        type: 'social',
        desc: 'Jogo de cartas com a família.',
        date: '2025-06-14T15:00'
      },
      {
        id: 204,
        type: 'meal',
        desc: 'Almoço: frango, legumes e arroz.',
        date: '2025-06-13T12:30'
      },
      {
        id: 205,
        type: 'exercise',
        desc: 'Caminhada leve 15 min.',
        date: '2025-06-12T09:00'
      },
      {
        id: 206,
        type: 'check',
        desc: 'Glicemia em jejum: 102 mg/dL.',
        date: '2025-06-08T07:00'
      }
    ]
  },
  {
    id: 3,
    name: 'Conceição Lima',
    age: 74,
    emoji: '👩‍🦳',
    status: 'stable',
    diagnosis: 'Parkinson estágio II',
    conditions: 'Osteoporose moderada',
    contact: '(11) 99887-6655',
    blood: 'B-',
    biometrics: '58 kg / 1,55 m',
    meds: 'Levodopa/Carbidopa 250/25mg, Clonazepam 0,5mg',
    allergies: 'Ibuprofeno',
    diet: 'Dieta normal, rica em fibras e cálcio',
    autonomyLevel: 3,
    mobility: 'bengala',
    communication: 'verbal_clara',
    sleep: '7h, sono fragmentado',
    risks: ['quedas', 'ulcera', 'aspiracao'],
    env: {
      ac: 'moderado',
      sun: 'permitido',
      cold: 'proibido',
      humidity: 'permitido'
    },
    notes: 'Fisioterapia às terças e quintas. Boa adesão ao tratamento. Tremor de repouso nas mãos.',
    tags: ['Parkinson', 'Fisioterapia', 'Osteoporose'],
    activities: [
      {
        id: 301,
        type: 'exercise',
        desc: 'Fisioterapia motora – 40 min.',
        date: '2025-06-14T10:00'
      },
      {
        id: 302,
        type: 'hygiene',
        desc: 'Banho assistido.',
        date: '2025-06-14T08:30'
      },
      {
        id: 303,
        type: 'meal',
        desc: 'Almoço – purê + frango.',
        date: '2025-06-14T12:00'
      },
      {
        id: 304,
        type: 'med',
        desc: 'Levodopa/Carbidopa tarde.',
        date: '2025-06-13T14:00'
      },
      {
        id: 305,
        type: 'check',
        desc: 'Marcha estável com andador.',
        date: '2025-06-11T09:30'
      },
      {
        id: 306,
        type: 'social',
        desc: 'Tarde assistindo novela.',
        date: '2025-06-09T15:00'
      }
    ]
  }
];

export const AUTONOMY_LABELS = [
  '',
  'Dependência Total',
  'Grande Dependência',
  'Dependência Parcial',
  'Supervisão Leve',
  'Autonomia Total'
];

export const AUTONOMY_DESCRIPTIONS = [
  '',
  'Necessita de auxílio em TODAS as atividades básicas do dia a dia.',
  'Dependente na maioria das AVDs; pequenas tarefas requerem supervisão intensa.',
  'Independente em algumas tarefas, mas precisa de ajuda nas complexas.',
  'Realiza quase tudo sozinho(a), com supervisão ocasional.',
  'Completamente independente nas atividades cotidianas.'
];

export const RISK_OPTIONS = {
  quedas: '🚶 Quedas',
  desidratacao: '💧 Desidratação',
  ulcera: '🩹 Úlcera pressão',
  aspiracao: '🫁 Broncoaspiração',
  confusao: '🧠 Confusão/agit.',
  hipoglicemia: '🩸 Hipoglicemia',
  hiper_crise: '❤️ Crise hipert.',
  incontinencia: '🚿 Incontinência'
};

export const MOBILITY_OPTIONS = {
  independente: '🚶 Independente',
  bengala: '🦯 Bengala/andador',
  cadeira_parcial: '♿ Cadeira (parcial)',
  cadeira_total: '♿ Cadeira (total)',
  acamado_parcial: '🛏️ Semiacamado',
  acamado: '🛏️ Acamado'
};

export const COMMUNICATION_OPTIONS = {
  verbal_clara: '🗣️ Verbal clara',
  verbal_dif: '🗣️ Verbal c/ dif.',
  nao_verbal: '✋ Não verbal',
  limitada: '🤫 Muito limitada'
};

export const ENV_OPTIONS = {
  ac: { icon: '❄️', name: 'Ar-cond.' },
  sun: { icon: '☀️', name: 'Sol' },
  cold: { icon: '🥶', name: 'Frio' },
  humidity: { icon: '💦', name: 'Umidade' }
};

export const ENV_STATUS_LABELS = {
  permitido: 'Permitido',
  moderado: 'Com moderação',
  proibido: 'Não recom.'
};

export const ACTIVITY_CONFIG = {
  med: {
    icon: '💊',
    label: 'Medicação',
    color: 'act-med'
  },
  meal: {
    icon: '🍽️',
    label: 'Alimentação',
    color: 'act-meal'
  },
  hygiene: {
    icon: '🛁',
    label: 'Higiene',
    color: 'act-bath'
  },
  check: {
    icon: '🩺',
    label: 'Avaliação',
    color: 'act-check'
  },
  exercise: {
    icon: '🏃',
    label: 'Exercício',
    color: 'act-check'
  },
  note: {
    icon: '📝',
    label: 'Observação',
    color: 'act-note'
  },
  social: {
    icon: '🗣️',
    label: 'Ativ. Social',
    color: 'act-note'
  }
};
