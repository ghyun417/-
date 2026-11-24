// =====================================================================
//  설문 코드표: 시트의 열 이름(q10_3_2 등)을 실제 문항으로 바꿉니다.
//  설문 웹페이지(reframe-survey, 버전 5.0)의 문항 정의를 그대로 옮겼습니다.
//  설문 문항이 바뀌면 이 파일도 같이 고쳐야 합니다.
// =====================================================================
(function () {
  const BRANDS = ["현대", "토요타", "폭스바겐", "포드", "테슬라"];
  const BRAND_CRITERIA = ["보유비용의 경제성", "구매가격의 경제성", "안전성", "품질 및 내구 신뢰성", "주행 성능", "디자인 매력", "브랜드 이미지 및 위상", "운전자 보조 편의", "환경에 대한 우려"];
  const BRAND_EXP = ["소유·주로 이용", "시승·렌트로 직접 운전", "동승만 해 봄", "리뷰·지인 등 정보만 앎", "잘 모름"];
  const MODES = ["자가용", "장기렌트", "대중교통", "택시", "카셰어링"];
  const MODE_CRITERIA = ["전체 이동 비용의 경제성", "월 지불 부담", "이용 시작의 접근성", "전체 이동 시간", "도착시간의 예측 가능성", "일정과 경로의 유연성", "신체적 편안함", "인식된 안전성", "사적 공간의 확보", "동행인과 짐의 수용 편의", "직접 운전 부담", "주차 부담", "차량 관리 책임"];
  const MODE_OMITTED = [2, 5, 8]; // Q13·Q14에서 뺀 기준 (설문 페이지와 동일)
  const MODE_RANKED = MODE_CRITERIA.filter((_, i) => !MODE_OMITTED.includes(i + 1));
  const MODE_EXP = ["최근 3년 안에 직접 이용", "3년 전에만 이용", "이용 안 했지만 정보는 앎", "잘 모름"];
  // Q5 단계와 보기: 설문 페이지(버전 7)의 문구 그대로
  const STAGES = ["이동수단을 고를 때", "타러 가거나 기다릴 때", "타고 가거나 운전할 때", "보완재 활용할 때", "꾸준히 이용하면서 관리할 때", "이용을 마치거나 다른 수단으로 바꿀 때"];
  const PAIN = {
    A: "A · 돈이 많이 든다", B: "B · 시간이나 수고가 많이 든다", C: "C · 절차·방법이 복잡하다",
    D: "D · 원할 때, 원하는 곳에서 하기 어렵다", E: "E · 손해·사고·고장이 걱정된다",
    F: "F · 즐겁지 않거나 내 이미지·취향과 맞지 않다", G: "G · 환경에 부담이 된다",
    H: "H · 겪어 봤지만 특별히 불편 없었음", I: "I · 이 단계는 겪지 않았음·모르겠음",
  };

  // 국가 문항은 설문 버전 7부터 생겼습니다. 그 전 응답은 국가가 비어 있어 따로 묶습니다.
  const COUNTRIES = ["대한민국", "북아메리카(미국·캐나다)", "유럽", "라틴아메리카(멕시코·중남미)", "기타"];
  const NO_COUNTRY = "이전 버전 응답 (국가 문항 없음)";

  const SIMPLE = {
    submitted_at: "제출 시각",
    age: "연령대", country: "국가", region: "생활 지역", driving: "운전",
    q1_purpose: "Q1. 자주 한 이동 · 목적", q1_frequency: "Q1. 자주 한 이동 · 횟수", q1_distance: "Q1. 자주 한 이동 · 편도 거리",
    q1_people: "Q1. 자주 한 이동 · 함께 간 사람", q1_luggage: "Q1. 자주 한 이동 · 짐",
    q2: "Q2. 주로 이용한 방법", q2_other: "Q2. 기타 방법 (직접 입력)",
    q3: "Q3. 나와 자가용의 관계", q4: "Q4. Q3처럼 답한 가장 큰 이유", q4_other: "Q4. 기타 이유 (직접 입력)",
    q6: "Q6. 가장 크게 방해가 된 단계", q7: "Q7. 그 불편이 준 영향",
    q16: "Q16. 현대자동차와 나의 관계", q17: "Q17. 다음 차 후보로 현대자동차를 넣을 생각",
    q18: "Q18. Q17처럼 답한 이유 (최대 2개)", q18_other: "Q18. 기타 이유 (직접 입력)",
    q19: "Q19. 어떤 조건·서비스가 생기면 바꾸겠는가",
  };
  const DROP = new Set(["submission_id", "survey_version", "consent", "nickname"]);

  const ORDER = {
    "연령대": ["만 19~29세", "30대", "40대", "50대", "60대 이상", "해당 없음", "응답 안 함"],
    "국가": [...COUNTRIES, NO_COUNTRY],
    "생활 지역": ["대도시", "중소도시", "농어촌"],
    "운전": ["직접 운전함", "면허는 있지만 거의 안 함", "면허 없음"],
    "Q1. 자주 한 이동 · 횟수": ["주 1일 미만", "주 1~2일", "주 3~4일", "주 5일 이상"],
    "Q1. 자주 한 이동 · 편도 거리": ["5km 미만", "5~15km", "15~30km", "30km 이상"],
    "Q3. 나와 자가용의 관계": ["자가용을 쓰고 있고, 앞으로도 계속 쓸 생각이다", "자가용을 쓰지만, 줄이거나 다른 방법으로 바꾸려고 한다", "예전에는 썼지만 지금은 쓰지 않는다", "자가용을 알아본 적이 있지만, 쓰지 않기로 했거나 미뤘다", "자가용을 쓸 생각이 없다.", "잘 모르겠다"],
    "Q6. 가장 크게 방해가 된 단계": STAGES.map((s, i) => `${i + 1}. ${s}`).concat(["모르겠음"]),
    "Q7. 그 불편이 준 영향": ["1 불편했지만 거의 지장 없었음", "2 조금 늦어지거나 수고가 더 들었음", "3 눈에 띄게 어려워졌음", "4 일부를 포기했음", "5 아예 하지 못했음", "모르겠음"],
    "Q16. 현대자동차와 나의 관계": ["지금 주로 이용함", "예전에 이용했지만 지금은 아님", "고려했지만 선택하지 않음", "고려해 본 적 없음", "브랜드를 잘 모름"],
    "Q17. 다음 차 후보로 현대자동차를 넣을 생각": ["전혀 없음", "낮음", "보통", "높음", "매우 높음", "차를 마련할 생각 없음"],
    "Q5. 단계별 가장 불편했던 점": Object.values(PAIN),
    "Q8. 브랜드 경험": BRAND_EXP,
    "Q12. 이동 방법 경험": MODE_EXP,
  };

  // 열 이름 하나를 [새 이름, 값 바꾸는 함수]로
  function mapColumn(h) {
    if (DROP.has(h)) return null;
    if (SIMPLE[h]) return [SIMPLE[h]];
    let m;
    if ((m = h.match(/^q5_(\d)$/))) return [`Q5. 단계별 가장 불편했던 점 [${+m[1]}. ${STAGES[m[1] - 1]}]`, (v) => PAIN[v] || v];
    if ((m = h.match(/^q5_other_(\d)$/))) return [`Q5. 기타 불편 (직접 입력) · ${STAGES[m[1] - 1]}`];
    if ((m = h.match(/^q8_(\d)$/))) return [`Q8. 브랜드 경험 [${BRANDS[m[1] - 1]}]`];
    if ((m = h.match(/^q9_(\d)$/))) return [`Q9. 자동차를 고를 때 중요한 기준 [${m[1]}순위]`, (v) => BRAND_CRITERIA[+v - 1] || v];
    if ((m = h.match(/^q10_(\d+)_(\d)$/))) return [`Q10 · ${BRAND_CRITERIA[m[1] - 1]} [${BRANDS[m[2] - 1]}]`];
    if ((m = h.match(/^q11_1_(\d)$/))) return [`Q11. 브랜드 종합 평가 (0~10점) [${BRANDS[m[1] - 1]}]`];
    if ((m = h.match(/^q12_(\d)$/))) return [`Q12. 이동 방법 경험 [${MODES[m[1] - 1]}]`];
    if ((m = h.match(/^q13_(\d)$/))) return [`Q13. 이동 방법을 고를 때 중요한 기준 [${m[1]}순위]`, (v) => MODE_RANKED[+v - 1] || v];
    if ((m = h.match(/^q14_(\d+)_(\d)$/))) return [`Q14 · ${MODE_CRITERIA[m[1] - 1]} [${MODES[m[2] - 1]}]`];
    if ((m = h.match(/^q15_1_(\d)$/))) return [`Q15. 이동 방법 종합 평가 (0~10점) [${MODES[m[1] - 1]}]`];
    return [h];
  }
  const cleanNum = (v) => (/^-?\d+\.0+$/.test(v) ? v.replace(/\.0+$/, "") : v);
  const jsonList = (v) => {
    if (!/^\s*\[/.test(v)) return v;
    try { const a = JSON.parse(v); return Array.isArray(a) ? a.join(", ") : v; } catch (e) { return v; }
  };
  const OLD_REGION = { "대도시 중심": "대도시", "대도시 외곽": "대도시", "읍·면·농어촌": "농어촌" };
  const fixRegion = (v) => OLD_REGION[v] || v;
  const fixQ6 = (v) => (v === "?" ? "모르겠음" : STAGES[+v - 1] ? `${+v}. ${STAGES[+v - 1]}` : v);

  window.SURVEY_SCHEMA = {
    detect: (headers) => headers.includes("submission_id") && headers.some((h) => /^q10_\d+_\d$/.test(h)),
    transform(headers, rows, opts) {
      const nick = headers.indexOf("nickname");
      const ver = headers.indexOf("survey_version"), ctry = headers.indexOf("country");
      let excluded = 0;
      if (opts && opts.excludeTest && nick >= 0) {
        rows = rows.filter((r) => { const t = opts.excludeTest.test((r[nick] || "").trim()); if (t) excluded++; return !t; });
      }
      const keep = []; // [원래 위치, 새 이름, 값 함수]
      headers.forEach((h, i) => {
        const m = mapColumn(h.trim());
        if (!m) return;
        let fn = m[1] || ((v) => v);
        if (h === "q6") fn = fixQ6;
        if (h === "region") fn = fixRegion;
        if (["q1_people", "q1_luggage", "q18"].includes(h)) fn = jsonList;
        keep.push([i, m[0], fn]);
      });
      return {
        headers: keep.map((k) => k[1]),
        rows: rows.map((r) => keep.map(([i, , fn]) => {
          const v = cleanNum(String(r[i] ?? "").trim());
          // 국가 문항이 없던 버전(7 미만)은 모두 국내 지인 배포분이라 대한민국으로 셉니다.
          if (i === ctry && !v && ver >= 0 && Number(r[ver]) < 7) return "대한민국";
          return v ? fn(v) : "";
        })),
        excluded,
        hints: {
          multi: new Set(["Q1. 자주 한 이동 · 함께 간 사람", "Q1. 자주 한 이동 · 짐", "Q18. Q17처럼 답한 이유 (최대 2개)"]),
          text: new Set(["Q19. 어떤 조건·서비스가 생기면 바꾸겠는가", "Q2. 기타 방법 (직접 입력)", "Q4. 기타 이유 (직접 입력)", "Q18. 기타 이유 (직접 입력)", ...STAGES.map((s) => `Q5. 기타 불편 (직접 입력) · ${s}`)]),
          order: ORDER,
          canvasTitles: {
            "Q10": "자동차 브랜드 전략캔버스 (Q10)",
            "Q14": "이동 방법 전략캔버스 (Q14)",
          },
          // 전략캔버스 표 마지막 줄에 넣을 전반적 평가 (논문의 '전반적 만족감')
          canvasOverall: {
            "Q10": "Q11. 브랜드 종합 평가 (0~10점)",
            "Q14": "Q15. 이동 방법 종합 평가 (0~10점)",
          },
          // 구매자 효용지도: Q5 보기(A~I)를 6개 효용 레버로 묶습니다.
          utilityMap: {
            grid: "Q5. 단계별 가장 불편했던 점",
            theoryStages: ["구매", "인도", "사용", "보완", "유지보수", "처분"],
            levers: [
              // desc에는 설문 Q5 보기 문구를 그대로 넣습니다.
              { name: "고객 생산성", desc: [PAIN.A, PAIN.B], codes: ["A", "B"] },
              { name: "단순성", desc: [PAIN.C], codes: ["C"] },
              { name: "편리성", desc: [PAIN.D], codes: ["D"] },
              { name: "위험 감소", desc: [PAIN.E], codes: ["E"] },
              { name: "재미와 이미지", desc: [PAIN.F], codes: ["F"] },
              { name: "환경 친화성", desc: [PAIN.G], codes: ["G"] },
            ],
            none: "H",
            noneDesc: PAIN.H,
            skip: "I",
          },
          ageColumn: "연령대",
          countryColumn: "국가",
          // 화면을 설문 순서대로 묶는 단위. match = 카드 제목이 이 규칙에 맞으면 그 묶음으로 갑니다.
          sections: [
            { id: "who", icon: "users", color: "sky", title: "누가 응답했나요", desc: "응답자가 사는 곳과 운전 여부입니다.", match: "^(생활 지역|운전)$" },
            { id: "move", icon: "route", color: "sage", title: "평소 어떻게 이동하나요", desc: "최근 한 달 동안 가장 자주 한 이동과, 그때 주로 쓴 방법입니다. (Q1~Q2)", match: "^Q[12]\\." },
            { id: "car", icon: "car", color: "amber", title: "자가용을 어떻게 생각하나요", desc: "지금 자가용과의 관계와 그 이유입니다. (Q3~Q4)", match: "^Q[34]\\." },
            { id: "pain", icon: "alert", color: "coral", title: "이동하면서 어디가 불편했나요", desc: "이동을 알아보는 단계부터 끝내는 단계까지, 단계별로 가장 불편했던 점입니다. (Q5~Q7)", match: "^Q[567]\\." },
            { id: "brand", icon: "award", color: "mauve", title: "자동차 브랜드 비교", desc: "현대·토요타·폭스바겐·포드·테슬라를 알고 있는 사람들이 매긴 점수입니다. (Q8~Q11)", match: "^Q(8|9|10|11)\\b" },
            { id: "mode", icon: "bus", color: "sky", title: "이동 방법 비교", desc: "자가용·대중교통·택시·카셰어링을 같은 이동에 쓴다고 생각하고 매긴 점수입니다. (Q12~Q15)", match: "^Q(12|13|14|15)\\b" },
            { id: "hyundai", icon: "star", color: "amber", title: "현대자동차에 대해", desc: "현대자동차와의 관계와 다음 차 후보로 생각하는지입니다. (Q16~Q18)", match: "^Q1[678]\\." },
            { id: "voice", icon: "message", color: "sage", title: "자유 의견", desc: "어떤 조건이나 서비스가 생기면 이동 방법을 바꾸겠는지 직접 적은 답입니다. (Q19)", match: "^Q19" },
          ],
          crossDefault: ["연령대", "Q3. 나와 자가용의 관계"],
          rowShareNote: { "Q5. 단계별 가장 불편했던 점": "I(겪지 않았음)를 뺀 응답 중 비율" },
          rowShareExclude: { "Q5. 단계별 가장 불편했던 점": [PAIN.I] },
        },
      };
    },
    // 시트를 연결하기 전 보여 줄 예시 데이터 (실제 응답 아님)
    demo() {
      let seed = 11; const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
      const pick = (arr, w) => { const t = (w || arr.map(() => 1)).reduce((a, b) => a + b, 0); let r = rnd() * t; for (let k = 0; k < arr.length; k++) { r -= w ? w[k] : 1; if (r <= 0) return arr[k]; } return arr[arr.length - 1]; };
      const H = ["submitted_at", "submission_id", "survey_version", "consent", "age", "region", "driving", "q1_purpose", "q1_frequency", "q1_distance", "q1_people", "q1_luggage", "q2", "q2_other", "q3", "q4", "q4_other"];
      for (let i = 1; i <= 6; i++) H.push(`q5_${i}`);
      H.push("q6", "q7");
      for (let j = 1; j <= 5; j++) H.push(`q8_${j}`);
      for (let k = 1; k <= 3; k++) H.push(`q9_${k}`);
      for (let i = 1; i <= 9; i++) for (let j = 1; j <= 5; j++) H.push(`q10_${i}_${j}`);
      for (let j = 1; j <= 5; j++) H.push(`q11_1_${j}`);
      for (let j = 1; j <= 5; j++) H.push(`q12_${j}`);
      for (let k = 1; k <= 3; k++) H.push(`q13_${k}`);
      for (let i = 1; i <= 13; i++) for (let j = 1; j <= 5; j++) H.push(`q14_${i}_${j}`);
      for (let j = 1; j <= 5; j++) H.push(`q15_1_${j}`);
      H.push("q16", "q17", "q18", "q19", "nickname");
      const bB = BRANDS.map(() => BRAND_CRITERIA.map(() => 2.3 + rnd() * 2.2));
      const bM = MODES.map(() => MODE_CRITERIA.map(() => 2 + rnd() * 2.6));
      const notes = ["유지비가 줄어든다면 좋겠다", "주차 걱정이 없으면 차를 살 것 같다", "필요할 때만 쓰는 구독형 차가 있으면", "대중교통 배차 간격이 짧아지면", "전기차 충전이 쉬워지면"];
      const rows = []; const start = Date.now() - 5 * 864e5; const n = 72;
      for (let k = 0; k < n; k++) {
        const d = new Date(start + (k / n) * (Date.now() - start));
        const ts = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}:00`;
        const sc = (base) => (rnd() < 0.07 ? "?" : String(Math.max(1, Math.min(5, Math.round(base + (rnd() - 0.5) * 2)))));
        const r = { submitted_at: ts, submission_id: "demo-" + k, survey_version: "5.0", consent: "True",
          age: pick(ORDER["연령대"].slice(0, 5), [5, 4, 3, 2, 1]), region: pick(ORDER["생활 지역"], [4, 3, 2, 1]), driving: pick(ORDER["운전"], [5, 2, 2]),
          q1_purpose: pick(["출퇴근·통학", "업무", "장보기·일상 용무", "가족 돌봄", "여가"], [5, 2, 2, 1, 2]), q1_frequency: pick(ORDER["Q1. 자주 한 이동 · 횟수"], [1, 2, 2, 4]),
          q1_distance: pick(ORDER["Q1. 자주 한 이동 · 편도 거리"], [3, 4, 2, 1]), q1_people: JSON.stringify([...new Set([pick(["주로 혼자", "성인"]), pick(["주로 혼자", "어린 자녀"])])]),
          q1_luggage: pick(["소지품 정도", "장보기 짐", "유모차·큰 짐"]), q2: pick(["자가용(내 차·가족 차)", "대중교통", "택시·호출", "카셰어링·단기렌트", "걷기·자전거·킥보드"], [5, 4, 1, 1, 1]),
          q3: pick(ORDER["Q3. 나와 자가용의 관계"], [5, 2, 1, 2, 2, 1]), q4: pick(["지금 방법으로 충분함", "매달 나가는 돈", "운전하는 부담", "주차가 어려움", "동행·짐 때문에 차가 필요함"], [4, 2, 2, 2, 2]),
          q16: pick(ORDER["Q16. 현대자동차와 나의 관계"], [3, 1, 1, 2, 1]), q17: pick(ORDER["Q17. 다음 차 후보로 현대자동차를 넣을 생각"], [1, 2, 4, 3, 1, 1]),
          q18: JSON.stringify([...new Set([pick(MODE_RANKED), pick(MODE_RANKED)])]), q19: rnd() < 0.4 ? pick(notes) : "", nickname: "예시" };
        for (let i = 1; i <= 6; i++) r[`q5_${i}`] = pick(Object.keys(PAIN), [3, 3, 1, 2, 1, 1, 1, 2, 2]);
        r.q6 = String(1 + Math.floor(rnd() * 6)); r.q7 = pick(ORDER["Q7. 그 불편이 준 영향"]);
        BRANDS.forEach((_, j) => { r[`q8_${j + 1}`] = pick(BRAND_EXP, [2, 2, 2, 3, 1]); });
        const rk = []; while (rk.length < 3) { const v = String(1 + Math.floor(rnd() * 9)); if (!rk.includes(v)) rk.push(v); } rk.forEach((v, k) => (r[`q9_${k + 1}`] = v));
        BRAND_CRITERIA.forEach((_, i) => BRANDS.forEach((_, j) => (r[`q10_${i + 1}_${j + 1}`] = r[`q8_${j + 1}`] === "잘 모름" ? "" : sc(bB[j][i]))));
        BRANDS.forEach((_, j) => (r[`q11_1_${j + 1}`] = r[`q8_${j + 1}`] === "잘 모름" ? "" : String(Math.round(bB[j].reduce((a, b) => a + b, 0) / 9 * 2 + (rnd() - 0.5) * 3))));
        MODES.forEach((_, j) => (r[`q12_${j + 1}`] = j === 1 ? "" : pick(MODE_EXP, [4, 1, 2, 1])));
        const rm = []; while (rm.length < 3) { const v = String(1 + Math.floor(rnd() * 10)); if (!rm.includes(v)) rm.push(v); } rm.forEach((v, k) => (r[`q13_${k + 1}`] = v));
        MODE_CRITERIA.forEach((_, i) => MODES.forEach((_, j) => (r[`q14_${i + 1}_${j + 1}`] = j === 1 || MODE_OMITTED.includes(i + 1) || r[`q12_${j + 1}`] === "잘 모름" ? "" : sc(bM[j][i]))));
        MODES.forEach((_, j) => (r[`q15_1_${j + 1}`] = j === 1 || r[`q12_${j + 1}`] === "잘 모름" ? "" : String(Math.round(bM[j].reduce((a, b) => a + b, 0) / 13 * 2 + (rnd() - 0.5) * 3))));
        rows.push(H.map((h) => r[h] ?? ""));
      }
      return { headers: H, rows };
    },
  };
})();
