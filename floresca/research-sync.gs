// ============================================================
// Floresca - Script de Recolha de Dados para Investigacao
// Psicoterapia e Afins (c) 2026
//
// INSTALACAO (1 vez):
// 1. Crie uma planilha nova no Google Sheets (ex.: "Floresca - Pesquisa")
// 2. Na planilha: Extensoes -> Apps Script
// 3. Apague TUDO que estiver no editor e cole este arquivo INTEIRO
//    (Ctrl+A e Ctrl+C aqui; Ctrl+A e Ctrl+V la)
// 4. Clique em Implantar -> Nova implantacao
//    - Tipo: App da Web
//    - Executar como: Eu (Paula)
//    - Quem pode acessar: Qualquer pessoa
// 5. Autorize as permissoes quando pedido
// 6. Copie o URL de implantacao (termina em /exec)
// 7. Cole esse URL em app.js: const RESEARCH_ENDPOINT = 'URL_AQUI';
//
// TESTE: abrir o URL /exec no navegador deve mostrar
// "Floresca Research API - OK"
// ============================================================

const SHEET_NAME = 'Participantes';

// Cabecalhos da folha (criados automaticamente na primeira execucao)
const HEADERS = [
  'participantId',
  'syncedAt',
  'consentDate',
  // Dados demograficos
  'demo_gender',
  'demo_age',
  'demo_city',
  'demo_country',
  'demo_therapy',
  // SPANE Pre-teste (Diener et al., 2009)
  'pretestDate',
  'spanePre_P',
  'spanePre_N',
  'spanePre_B',
  'spanePre_q1','spanePre_q2','spanePre_q3','spanePre_q4','spanePre_q5','spanePre_q6',
  'spanePre_q7','spanePre_q8','spanePre_q9','spanePre_q10','spanePre_q11','spanePre_q12',
  // Crencas sobre emocoes positivas - Pre (0-32)
  'beliefsPre_score',
  'beliefsPre_q1','beliefsPre_q2','beliefsPre_q3','beliefsPre_q4',
  'beliefsPre_q5','beliefsPre_q6','beliefsPre_q7','beliefsPre_q8',
  // SPANE Pos-teste
  'posttestDate',
  'spanePost_P',
  'spanePost_N',
  'spanePost_B',
  'spanePost_q1','spanePost_q2','spanePost_q3','spanePost_q4','spanePost_q5','spanePost_q6',
  'spanePost_q7','spanePost_q8','spanePost_q9','spanePost_q10','spanePost_q11','spanePost_q12',
  // Crencas - Pos
  'beliefsPost_score',
  'beliefsPost_q1','beliefsPost_q2','beliefsPost_q3','beliefsPost_q4',
  'beliefsPost_q5','beliefsPost_q6','beliefsPost_q7','beliefsPost_q8',
  // Deltas (P e B: positivo = melhoria | N e crencas: negativo = melhoria)
  'spane_P_delta',
  'spane_N_delta',
  'spane_B_delta',
  'beliefs_delta',
  // Uso do app
  'daysOfUse',
  'firstUseDate',
  'totalMoments',
  'modulesCompleted',
  'modulesCompletedList',
  'xp',
  'streakDays',
  'appOpenCount',
  // Laboratorio de experimentos
  'experimentsDone',
  'expPredictedAvg',
  'expActualAvg',
  'expUnderestimation',
  // Dados detalhados (JSON)
  'momentsJSON',
  'experimentsJSON',
];

function getOrCreateSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
    sheet.getRange(1, 1, 1, HEADERS.length)
      .setBackground('#1B6A58')
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
    const sPre  = pre.spane   || {};
    const sPost = post.spane  || {};
    const bPre  = pre.beliefs  || {};
    const bPost = post.beliefs || {};

    const delta = (a, b) => (a != null && b != null) ? (b - a) : '';

    // Dias de uso (com base nos momentos registrados)
    const entries = data.entries || [];
    const dates = entries.map(e2 => e2.date).filter(Boolean);
    const uniqueDates = [...new Set(dates)].sort();
    const daysOfUse = uniqueDates.length;
    const firstUse = uniqueDates[0] || '';

    // Modulos
    const modsDone = (data.modulesCompletedList || []);

    // Aberturas do app
    const opens = (data.analytics && data.analytics.sessions || [])
      .filter(s => s.event === 'app_open').length;

    // Streak maximo simples
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

    // Experimentos concluidos
    const expsDone = (data.experiments || []).filter(x => x.status === 'done');
    const avg = arr => arr.length ? arr.reduce((a,b)=>a+b,0) / arr.length : '';
    const predAvg = avg(expsDone.map(x => x.predicted));
    const actAvg  = avg(expsDone.map(x => x.actual));
    const underEst = (predAvg !== '' && actAvg !== '') ? (actAvg - predAvg) : '';
    const round2 = v => v === '' ? '' : Math.round(v * 100) / 100;

    const row = [
      data.participantId || '',
      new Date().toISOString(),
      data.consentDate || '',
      // Dados demograficos
      (data.demographics && data.demographics.gender  || ''),
      (data.demographics && data.demographics.age     || ''),
      (data.demographics && data.demographics.city    || ''),
      (data.demographics && data.demographics.country || ''),
      (data.demographics && data.demographics.therapy || ''),
      // SPANE pre
      pre.date || '',
      sPre.p != null ? sPre.p : '',
      sPre.n != null ? sPre.n : '',
      sPre.b != null ? sPre.b : '',
      ...(sPre.answers || Array(12).fill('')),
      // Crencas pre
      bPre.score != null ? bPre.score : '',
      ...(bPre.answers || Array(8).fill('')),
      // SPANE pos
      post.date || '',
      sPost.p != null ? sPost.p : '',
      sPost.n != null ? sPost.n : '',
      sPost.b != null ? sPost.b : '',
      ...(sPost.answers || Array(12).fill('')),
      // Crencas pos
      bPost.score != null ? bPost.score : '',
      ...(bPost.answers || Array(8).fill('')),
      // Deltas
      delta(sPre.p, sPost.p),
      delta(sPre.n, sPost.n),
      delta(sPre.b, sPost.b),
      delta(bPre.score, bPost.score),
      // Uso
      daysOfUse,
      firstUse,
      entries.length,
      modsDone.length,
      modsDone.join(' | '),
      data.xp || 0,
      maxStreak,
      opens,
      // Laboratorio
      expsDone.length,
      round2(predAvg),
      round2(actAvg),
      round2(underEst),
      // Dados completos
      JSON.stringify(entries.map(e2 => ({
        date: e2.date,
        moment: e2.moment,
        emotions: e2.emotions,
        savoring: e2.savoring,
        intensity: e2.intensity,
      }))),
      JSON.stringify(expsDone.map(x => ({
        date: x.date,
        expId: x.expId,
        predicted: x.predicted,
        predictNote: x.predictNote,
        actual: x.actual,
        noticed: x.noticed,
      }))),
    ];

    // Upsert: atualiza a linha se o participantId ja existe, senao acrescenta
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
    .createTextOutput('Floresca Research API - OK')
    .setMimeType(ContentService.MimeType.TEXT);
}
