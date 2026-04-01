import { jsPDF } from 'jspdf';
import {
  RISK_OPTIONS,
  MOBILITY_OPTIONS,
  COMMUNICATION_OPTIONS,
  ENV_OPTIONS,
  ENV_STATUS_LABELS,
  ACTIVITY_CONFIG,
  AUTONOMY_LABELS
} from '../dados/mockData';

const sanitizePdfText = (value) => {
  if (value === null || value === undefined) return '';

  return String(value)
    .replace(/[\u200B-\u200D\uFE0F]/g, '')
    .replace(/[\u{1F000}-\u{1FAFF}]/gu, '')
    .replace(/[•]/g, ' | ')
    .replace(/[–—]/g, '-')
    .replace(/\s+/g, ' ')
    .trim();
};

const formatValue = (value, fallback = 'Não informado') => {
  if (value === null || value === undefined || value === '') return fallback;
  return sanitizePdfText(value);
};

const formatDateTime = (value) => {
  if (!value) return 'Não informado';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return formatValue(value);

  return date.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const ensureSpace = (pdf, y, requiredHeight = 12) => {
  if (y + requiredHeight > 280) {
    pdf.addPage();
    return 20;
  }
  return y;
};

const addSectionTitle = (pdf, title, y) => {
  y = ensureSpace(pdf, y, 16);
  pdf.setFillColor(244, 239, 232);
  pdf.roundedRect(14, y - 5, 182, 10, 3, 3, 'F');
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(82, 67, 56);
  pdf.setFontSize(12);
  pdf.text(formatValue(title), 18, y + 1.5);
  return y + 12;
};

const addInfoRow = (pdf, label, value, y) => {
  const safeValue = formatValue(value);
  const lines = pdf.splitTextToSize(safeValue, 164);
  const blockHeight = Math.max(13, 7 + lines.length * 5.2);

  y = ensureSpace(pdf, y, blockHeight + 6);

  pdf.setFillColor(252, 249, 245);
  pdf.roundedRect(18, y - 4, 174, blockHeight, 3, 3, 'F');

  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(98, 82, 70);
  pdf.setFontSize(9.3);
  pdf.text(`${formatValue(label)}:`, 22, y + 1);

  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(60, 54, 49);
  pdf.setFontSize(10.5);
  pdf.text(lines, 22, y + 6);

  return y + blockHeight + 3;
};

const drawCanvasRoundedRect = (ctx, x, y, width, height, radius) => {
  const r = Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + width - r, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + r);
  ctx.lineTo(x + width, y + height - r);
  ctx.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
  ctx.lineTo(x + r, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
};

const buildChipBlockImage = (label, items) => {
  if (typeof document === 'undefined') return null;

  const chipItems = items && items.length ? items : ['Nenhum item informado'];
  const width = 1100;
  const paddingX = 28;
  const chipHeight = 38;
  const chipGapX = 10;
  const chipGapY = 10;
  const maxRowWidth = width - paddingX * 2;

  const canvas = document.createElement('canvas');
  const measureCtx = canvas.getContext('2d');
  if (!measureCtx) return null;

  measureCtx.font = '600 18px "Segoe UI", "Segoe UI Emoji", "Apple Color Emoji", Arial, sans-serif';

  let currentX = paddingX;
  let currentY = 62;
  const chipLayouts = chipItems.map((item) => {
    const chipText = String(item);
    const chipWidth = Math.min(maxRowWidth, Math.max(120, measureCtx.measureText(chipText).width + 28));

    if (currentX + chipWidth > width - paddingX) {
      currentX = paddingX;
      currentY += chipHeight + chipGapY;
    }

    const layout = { text: chipText, x: currentX, y: currentY, width: chipWidth };
    currentX += chipWidth + chipGapX;
    return layout;
  });

  const height = currentY + chipHeight + 22;
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  ctx.fillStyle = '#fcf9f5';
  drawCanvasRoundedRect(ctx, 0, 0, width, height, 18);
  ctx.fill();

  ctx.fillStyle = '#625246';
  ctx.font = '700 20px "Segoe UI", Arial, sans-serif';
  ctx.fillText(`${label}:`, paddingX, 36);

  ctx.font = '600 18px "Segoe UI", "Segoe UI Emoji", "Apple Color Emoji", Arial, sans-serif';

  chipLayouts.forEach((chip) => {
    ctx.fillStyle = '#fff3ee';
    ctx.strokeStyle = '#e7b8a6';
    ctx.lineWidth = 2;
    drawCanvasRoundedRect(ctx, chip.x, chip.y, chip.width, chipHeight, 18);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#8f4638';
    ctx.fillText(chip.text, chip.x + 14, chip.y + 24);
  });

  return {
    dataUrl: canvas.toDataURL('image/png'),
    width,
    height
  };
};

const addImageInfoRow = (pdf, label, items, y) => {
  const imageBlock = buildChipBlockImage(label, items);

  if (!imageBlock) {
    return addInfoRow(pdf, label, Array.isArray(items) ? items.join(' | ') : items, y);
  }

  const renderWidth = 174;
  const renderHeight = (imageBlock.height * renderWidth) / imageBlock.width;
  y = ensureSpace(pdf, y, renderHeight + 6);
  pdf.addImage(imageBlock.dataUrl, 'PNG', 18, y - 4, renderWidth, renderHeight);
  return y + renderHeight + 3;
};

const addActivityRow = (pdf, index, title, description, date, y) => {
  const content = `${formatValue(description)} (${formatDateTime(date)})`;
  const lines = pdf.splitTextToSize(content, 156);
  const blockHeight = Math.max(15, 8 + lines.length * 5.2);

  y = ensureSpace(pdf, y, blockHeight + 6);

  pdf.setDrawColor(225, 216, 206);
  pdf.setFillColor(255, 255, 255);
  pdf.roundedRect(18, y - 4, 174, blockHeight, 3, 3, 'FD');

  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(82, 67, 56);
  pdf.setFontSize(10.5);
  pdf.text(`${index + 1}. ${formatValue(title)}`, 22, y + 1);

  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(60, 54, 49);
  pdf.setFontSize(10);
  pdf.text(lines, 28, y + 6);

  return y + blockHeight + 3;
};

export const generatePatientReportPDF = ({ patient, caregiverName }) => {
  if (!patient) {
    throw new Error('Paciente não informado para gerar o relatório.');
  }

  const pdf = new jsPDF('p', 'mm', 'a4');
  const selectedRisks = (patient.risks || []).map(
    (riskKey) => patient.customRiskOptions?.[riskKey] || RISK_OPTIONS[riskKey] || riskKey
  );

  const environmentSummary = Object.entries(ENV_OPTIONS)
    .map(([key, config]) => `${config.icon} ${config.name}: ${ENV_STATUS_LABELS[patient.env?.[key] || 'permitido']}`);

  const activities = [...(patient.activities || [])]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 12);

  let y = 20;

  pdf.setFillColor(139, 175, 139);
  pdf.roundedRect(14, 12, 182, 24, 6, 6, 'F');
  pdf.setTextColor(255, 255, 255);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(18);
  pdf.text("I'm Home Care", 18, 22);
  pdf.setFontSize(11);
  pdf.setFont('helvetica', 'normal');
  pdf.text('Relatório detalhado do paciente', 18, 29);

  pdf.setTextColor(70, 60, 54);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(16);
  pdf.text(formatValue(patient.name || 'Paciente'), 18, 48);
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(10.5);
  pdf.text(`Emitido em: ${formatDateTime(new Date())}`, 18, 55);
  pdf.text(`Responsável: ${formatValue(caregiverName, 'Cuidador(a) responsável')}`, 18, 61);

  y = 72;
  y = addSectionTitle(pdf, 'Dados principais', y);
  y = addInfoRow(pdf, 'Idade', `${formatValue(patient.age)} anos`, y);
  y = addInfoRow(pdf, 'Contato familiar', patient.contact, y);
  y = addInfoRow(pdf, 'Tipo sanguíneo', patient.blood, y);
  y = addInfoRow(pdf, 'Biometria', patient.biometrics, y);
  y = addInfoRow(pdf, 'Status atual', patient.status === 'critical' ? 'Crítico' : patient.status === 'alert' ? 'Atenção' : 'Estável', y);
  y = addInfoRow(pdf, 'Autonomia', AUTONOMY_LABELS[patient.autonomyLevel] || `Nível ${formatValue(patient.autonomyLevel)}`, y);
  y = addInfoRow(pdf, 'Mobilidade', MOBILITY_OPTIONS[patient.mobility] || patient.mobility, y);
  y = addInfoRow(pdf, 'Comunicação', COMMUNICATION_OPTIONS[patient.communication] || patient.communication, y);

  y = addSectionTitle(pdf, 'Saúde e observações', y + 2);
  y = addInfoRow(pdf, 'Diagnóstico principal', patient.diagnosis, y);
  y = addInfoRow(pdf, 'Condições secundárias', patient.conditions, y);
  y = addInfoRow(pdf, 'Medicações', patient.meds, y);
  y = addInfoRow(pdf, 'Alergias', patient.allergies, y);
  y = addInfoRow(pdf, 'Dieta / alimentação', patient.diet, y);
  y = addInfoRow(pdf, 'Padrão de sono', patient.sleep, y);
  y = addInfoRow(pdf, 'Observações gerais', patient.notes, y);

  y = addSectionTitle(pdf, 'Fatores de risco e ambiente', y + 2);
  y = addImageInfoRow(pdf, 'Fatores de risco', selectedRisks.length ? selectedRisks : ['Nenhum risco marcado'], y);
  y = addImageInfoRow(pdf, 'Restrições ambientais', environmentSummary.length ? environmentSummary : ['Sem restrições registradas'], y);

  y = addSectionTitle(pdf, 'Atividades recentes', y + 2);
  if (!activities.length) {
    y = addInfoRow(pdf, 'Atividades', 'Nenhuma atividade registrada até o momento.', y);
  } else {
    activities.forEach((activity, index) => {
      const activityLabel = ACTIVITY_CONFIG[activity.type]?.label || 'Atividade';
      y = addActivityRow(pdf, index, activityLabel, activity.desc, activity.date, y);
    });
  }

  y = ensureSpace(pdf, y, 20);
  pdf.setDrawColor(220, 211, 201);
  pdf.line(18, y + 3, 188, y + 3);
  pdf.setFont('helvetica', 'italic');
  pdf.setFontSize(9);
  pdf.setTextColor(120, 108, 99);
  pdf.text('Documento gerado automaticamente pelo sistema front-end para apresentação ao contratante.', 18, y + 10);

  const fileName = `relatorio-${(patient.name || 'paciente')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/gi, '-')}.pdf`;

  pdf.save(fileName);
};