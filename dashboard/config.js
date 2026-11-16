// =====================================================================
//  대시보드 설정 파일
//  이 파일만 고치면 됩니다. 따옴표("") 안의 내용만 바꾸세요.
// =====================================================================
window.DASHBOARD_CONFIG = {
  // 화면 맨 위에 보이는 제목
  title: "설문 응답 현황",

  // 응답 시트
  // csv: 구글 시트 [파일 → 공유 → 웹에 게시]에서 '웹 설문 응답' 탭을 CSV로 게시한 링크를 붙여 넣으세요.
  //      비워 두면 예시 데이터가 보입니다.
  sheets: [
    { name: "웹 설문 응답", csv: "https://docs.google.com/spreadsheets/d/e/2PACX-1vTlpRfYnM_OEva6FwNaW25aBiUG6MSMO0_5oeYbJAQeSkp-ztf4KLGttVHM2YUOdBbkkjVh9ubHPPaC/pub?gid=1994270977&single=true&output=csv" },
  ],

  // 설문 마감일 (YYYY-MM-DD). 남은 기간과 예상 응답 수 계산에 씁니다.
  endDate: "2026-11-30",

  // 목표 응답 수. 0이면 표시하지 않습니다.
  goal: 0,

  // 몇 초마다 새 응답을 확인할지
  refreshSeconds: 60,

  // 닉네임에 '테스트'나 'test'가 들어간 응답은 빼고 셉니다. 포함하려면 false로 바꾸세요.
  excludeTest: true,
};
