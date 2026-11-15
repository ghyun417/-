/**
 * 리프레임 설문 응답 수집기 (Google Apps Script, 구글 시트에 붙여서 사용)
 *
 * docs/index.html 이 제출 시 payload(JSON)를 POST 하면
 * '응답' 시트에 한 줄씩 저장하고, 저장 결과를 페이지에 postMessage 로 알려 줍니다.
 *
 * 설치
 *  1. 새 구글 시트 → 확장 프로그램 → Apps Script
 *  2. 이 파일 내용을 Code.gs 에 붙여넣고 저장
 *  3. 배포 → 새 배포 → 유형: 웹 앱
 *     - 다음 사용자 인증 정보로 실행: 나
 *     - 액세스 권한이 있는 사용자: 모든 사용자
 *  4. 나온 /exec 주소를 docs/index.html 의 COLLECTION_URL 에 넣기
 */

const SHEET_NAME = '응답';

// 시트 열 순서 (설문 화면의 문항 순서). 여기에 없는 항목은 맨 뒤에 자동 추가됩니다.
function columns_() {
  const range = (prefix, n) => Array.from({length: n}, (_, i) => `${prefix}_${i + 1}`);
  const grid = (prefix, rows, cols) =>
    Array.from({length: rows}, (_, r) => range(`${prefix}_${r + 1}`, cols)).flat();
  return [
    '제출시각', '응답ID',
    'age', 'region', 'driving',
    'q1_purpose', 'q1_frequency', 'q1_distance', 'q1_people', 'q1_luggage',
    'q2', 'q2_other', 'q3', 'q4', 'q4_other',
    ...range('q5', 6), ...range('q5_other', 6), 'q6', 'q7',
    ...range('q8', 5), ...range('q9', 3), ...grid('q10', 9, 5), ...grid('q11', 1, 5),
    ...range('q12', 5), ...range('q13', 3), ...grid('q14', 13, 5), ...grid('q15', 1, 5),
    'q16', 'q17', 'q18', 'q18_other', 'q19',
  ];
}

function doGet() {
  return ContentService.createTextOutput('리프레임 설문 수집기가 작동 중입니다.');
}

function doPost(e) {
  let token = '';
  let saved = false;
  try {
    const payload = JSON.parse((e && e.parameter && e.parameter.payload) || '{}');
    token = String(payload.token || '').replace(/[^A-Za-z0-9-]/g, '').slice(0, 64);
    saved = save_(payload);
  } catch (err) {
    console.error(err);
  }
  return receipt_(token, saved);
}

function save_(payload) {
  if (!payload || payload.consent !== true || !payload.answers || typeof payload.answers !== 'object') {
    return false;
  }
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    const book = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = book.getSheetByName(SHEET_NAME) || book.insertSheet(SHEET_NAME);
    const id = String(payload.id || '').replace(/[^A-Za-z0-9-]/g, '').slice(0, 64);

    let header = sheet.getLastRow() > 0
      ? sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0].map(String)
      : [];
    if (header.length === 0) {
      header = columns_();
      sheet.getRange(1, 1, 1, header.length).setValues([header]);
      sheet.setFrozenRows(1);
    }

    // 같은 응답을 다시 제출(재시도)한 경우 중복 저장하지 않음
    if (id && sheet.getLastRow() > 1) {
      const idCol = header.indexOf('응답ID') + 1;
      const dup = sheet.getRange(2, idCol, sheet.getLastRow() - 1, 1)
        .createTextFinder(id).matchEntireCell(true).findNext();
      if (dup) return true;
    }

    const answers = payload.answers;
    const keys = Object.keys(answers).filter(k => /^[A-Za-z0-9_]{1,40}$/.test(k)).slice(0, 400);
    const extra = keys.filter(k => header.indexOf(k) === -1);
    if (extra.length) {
      sheet.getRange(1, header.length + 1, 1, extra.length).setValues([extra]);
      header = header.concat(extra);
    }

    const row = header.map(name => {
      if (name === '제출시각') return new Date();
      if (name === '응답ID') return id;
      const value = answers[name];
      if (!Array.isArray(value)) return '';
      const text = value.map(v => String(v).slice(0, 1000)).join(' | ');
      return /^[=+\-@]/.test(text) ? "'" + text : text; // 수식으로 해석되지 않게
    });
    sheet.appendRow(row);
    return true;
  } finally {
    lock.releaseLock();
  }
}

function receipt_(token, saved) {
  const message = JSON.stringify({type: 'reframe-receipt', token: token, saved: saved === true})
    .replace(/</g, '\\u003c');
  return HtmlService
    .createHtmlOutput('<script>window.top.postMessage(' + message + ', "*");</script>')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}
