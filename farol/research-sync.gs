/**
 * Farol — Script de Recolha de Dados para Investigação
 * Psicoterapia e Afins © 2025
 *
 * INSTALAÇÃO (1 vez):
 * 1. Acede a https://script.google.com → "Novo projecto"
 * 2. Cola todo este código, substitui o código existente
 * 3. Clica em "Implementar" → "Nova implementação"
 *    - Tipo: Aplicação Web
 *    - Executar como: Eu (Paula)
 *    - Quem tem acesso: Qualquer pessoa
 * 4. Autoriza as permissões quando pedido
 * 5. Copia o URL de implementação (parece: https://script.google.com/macros/s/XXXXX/exec)
 * 6. Cola esse URL em app.js na linha: const RESEARCH_ENDPOINT = 'COLA_AQUI';
 */

const SHEET_NAME = 'Participantes';

// Cabeçalhos da folha de cálculo (cria automaticamente na primeira execução)
const HEADERS = [
  'participantId',
  'syncedAt',
  'consentDate',
  // Dados demográficos
  'demo_gender',
  'demo_age',
  'demo_city',
  'demo_country',
  'demo_therapy',
  // GAD-7 Pré-teste
  'pretestDate',
  'gad7Pre_score',
  'gad7Pre_level',
  'gad7Pre_q1','gad7Pre_q2','gad7Pre_q3','gad7Pre_q4','gad7Pre_q5','gad7Pre_q6','gad7Pre_q7',
  // MCQ-30 Pré-teste (5 subescalas)
  'mcq30Pre_pr','mcq30Pre_nc','mcq30Pre_cw','mcq30Pre_nb','mcq30Pre_wf',
  // GAD-7 Pós-teste
  'posttestDate',
  'gad7Post_score',
  'gad7Post_level',
  'gad7Post_q1','gad7Post_q2','gad7Post_q3','gad7Post_q4','gad7Post_q5','gad7Post_q6','gad7Post_q7',
  // MCQ-30 Pós-teste
  'mcq30Post_pr','mcq30Post_nc','mcq30Post_cw','mcq30Post_nb','mcq30Post_wf',
  // Deltas (negativo = melhoria)
  'gad7_delta',
  'mcq30_pr_delta','mcq30_nc_delta','mcq30_cw_delta','mcq30_nb_delta','mcq30_wf_delta',
  // Uso do app
  'daysOfUse',
  'firstUseDate',
  'totalDiaryEntries',
  'modulesCompleted',
  'modulesCompletedList',
  'xp',
  'streakDays',
  'appOpenCount',
  // Dados detalhados do diário (JSON)
  'diaryEntriesJSON',
];

function getOrCreateSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
    sheet.getRange(1, 1, 1, HEADERS.length)
      .setBackground('#3D5A52')
      .setFontColor('#FFFFFF')
      .setFontWeight('bold');
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const sheet = getOrCreateSheet();

    const pre  = data.pretest  || {};
    const post = data.posttest || {};
    const gPre  = pre.gad7  || {};
    const gPost = post.gad7 || {};
    const mPre  = pre.mcq30?.scores  || {};
    const mPost = post.mcq30?.scores || {};

    const delta = (a, b) => (a !== '' && b !== '') ? (b - a) : '';
    const gDelta = (gPost.score != null && gPre.score != null) ? gPost.score - gPre.score : '';

    // Dias de uso
    const entries = data.entries || [];
    const dates = entries.map(e2 => e2.date).filter(Boolean);
    const uniqueDates = [...new Set(dates)].sort();
    const daysOfUse = uniqueDates.length;
    const firstUse = uniqueDates[0] || '';

    // Módulos
    const modsDone = (data.modulesCompletedList || []);

    // App opens
    const opens = (data.analytics?.sessions || []).filter(s => s.event === 'app_open').length;

    // Streak máximo simples
    let maxStreak = 0, streak = 0;
    for (let i = 0; i < uniqueDates.length; i++) {
      if (i === 0) { streak = 1; }
      else {
        const prev = new Date(uniqueDates[i-1]+'T12:00');
        const curr = new Date(uniqueDates[i]+'T12:00');
        const diff = Math.round((curr - prev) / 864e5);
        streak = diff === 1 ? streak + 1 : 1;
      }
      maxStreak = Math.max(maxStreak, streak);
    }

    const row = [
      data.participantId || '',
      new Date().toISOString(),
      data.consentDate || '',
      // Dados demográficos
      (data.demographics?.gender  || ''),
      (data.demographics?.age     || ''),
      (data.demographics?.city    || ''),
      (data.demographics?.country || ''),
      (data.demographics?.therapy || ''),
      // GAD-7 pre
      pre.date || '',
      gPre.score != null ? gPre.score : '',
      gPre.level || '',
      ...(gPre.answers || Array(7).fill('')),
      // MCQ-30 pre
      mPre.pr || '', mPre.nc || '', mPre.cw || '', mPre.nb || '', mPre.wf || '',
      // GAD-7 post
      post.date || '',
      gPost.score != null ? gPost.score : '',
      gPost.level || '',
      ...(gPost.answers || Array(7).fill('')),
      // MCQ-30 post
      mPost.pr || '', mPost.nc || '', mPost.cw || '', mPost.nb || '', mPost.wf || '',
      // Deltas
      gDelta,
      delta(mPre.pr, mPost.pr), delta(mPre.nc, mPost.nc),
      delta(mPre.cw, mPost.cw), delta(mPre.nb, mPost.nb), delta(mPre.wf, mPost.wf),
      // Uso
      daysOfUse,
      firstUse,
      entries.length,
      modsDone.length,
      modsDone.join(' | '),
      data.xp || 0,
      maxStreak,
      opens,
      // Diário completo
      JSON.stringify(entries.map(e2 => ({
        date: e2.date,
        type: e2.type,
        worry: e2.worry,
        strategies: e2.strategies,
        intensityBefore: 5, // not stored separately
        intensityAfter: e2.after,
      }))),
    ];

    // Upsert: actualiza linha se participantId já existe, senão acrescenta
    const allData = sheet.getDataRange().getValues();
    let existingRow = -1;
    for (let i = 1; i < allData.length; i++) {
      if (allData[i][0] === data.participantId) {
        existingRow = i + 1;
        break;
      }
    }

    if (existingRow > 0) {
      sheet.getRange(existingRow, 1, 1, row.length).setValues([row]);
    } else {
      sheet.appendRow(row);
    }

    return ContentService
      .createTextOutput(JSON.stringify({ success: true, participantId: data.participantId }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet() {
  return ContentService
    .createTextOutput('Farol Research API — OK')
    .setMimeType(ContentService.MimeType.TEXT);
}
