const officeNameToCode = {
  "서울특별시교육청": "B10",
  "부산광역시교육청": "C10",
  "대구광역시교육청": "D10",
  "인천광역시교육청": "E10",
  "광주광역시교육청": "F10",
  "대전광역시교육청": "G10",
  "울산광역시교육청": "H10",
  "세종특별자치시교육청": "I10",
  "경기도교육청": "J10",
  "강원도교육청": "K10",
  "충청북도교육청": "M10",
  "충청남도교육청": "N10",
  "전라북도교육청": "P10",
  "전라남도교육청": "Q10",
  "경상북도교육청": "R10",
  "경상남도교육청": "S10",
  "제주특별자치도교육청": "T10"
};

async function getApiKey() {
  const res = await fetch('api.txt');
  const key = await res.text();
  return key.trim();
}

// 학교명으로 학교코드 조회
async function getSchoolCode(apiKey, officeCode, schoolName) {
  const url = `https://open.neis.go.kr/hub/schoolInfo?KEY=${apiKey}&Type=json&ATPT_OFCDC_SC_CODE=${officeCode}&SCHUL_NM=${encodeURIComponent(schoolName)}`;
  const res = await fetch(url);
  const data = await res.json();
  if (data.schoolInfo && data.schoolInfo[1].row.length > 0) {
    return data.schoolInfo[1].row[0].SD_SCHUL_CODE;
  }
  return null;
}

document.getElementById('mealForm').addEventListener('submit', async function(e) {
  e.preventDefault();
  const officeName = document.getElementById('officeName').value.trim();
  const schoolName = document.getElementById('schoolName').value.trim();
  const mealDate = document.getElementById('mealDate').value.replace(/-/g, '');

  const officeCode = officeNameToCode[officeName];
  const resultDiv = document.getElementById('result');

  if (!officeCode) {
    resultDiv.innerHTML = '시도교육청명을 정확히 입력해주세요.<br>예: 서울특별시교육청, 경기도교육청 등';
    return;
  }

  const API_KEY = await getApiKey();

  // 학교코드 조회
  resultDiv.innerHTML = '학교코드 조회 중...';
  const schoolCode = await getSchoolCode(API_KEY, officeCode, schoolName);

  if (!schoolCode) {
    resultDiv.innerHTML = '학교명을 정확히 입력해주세요.<br>예: 서울고등학교';
    return;
  }

  // 급식메뉴 조회
  resultDiv.innerHTML = '급식 정보 조회 중...';
  const url = `https://open.neis.go.kr/hub/mealServiceDietInfo?KEY=${API_KEY}&Type=json&ATPT_OFCDC_SC_CODE=${officeCode}&SD_SCHUL_CODE=${schoolCode}&MLSV_YMD=${mealDate}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data.mealServiceDietInfo && data.mealServiceDietInfo[1].row.length > 0) {
      const meal = data.mealServiceDietInfo[1].row[0];
      resultDiv.innerHTML = `
        <h2>${meal.MLSV_YMD} 급식메뉴</h2>
        <p><strong>학교명:</strong> ${meal.SCHUL_NM}</p>
        <p><strong>식사명:</strong> ${meal.MMEAL_SC_NM}</p>
        <p><strong>메뉴:</strong><br>${meal.DDISH_NM.replace(/<br\/>/g, '<br>')}</p>
        <p><strong>칼로리:</strong> ${meal.CAL_INFO}</p>
        <p><strong>영양정보:</strong> ${meal.NTR_INFO}</p>
      `;
    } else {
      resultDiv.innerHTML = '해당 날짜의 급식 정보가 없습니다.';
    }
  } catch (err) {
    resultDiv.innerHTML = '오류가 발생했습니다. 입력값을 확인해주세요.';
  }
});