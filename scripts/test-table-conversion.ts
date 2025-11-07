#!/usr/bin/env node
/**
 * 테이블 마크다운 변환 테스트
 * [object object] 버그 수정 확인
 */

import { markdownToTelegramHTML } from '../src/tools/markdownToTelegram.js';

console.log('🧪 테이블 마크다운 변환 테스트\n');

// 테스트 1: 간단한 테이블
console.log('📝 테스트 1: 기본 테이블');
const simpleTable = `| Name | Age | City |
|------|-----:|------|
| Alice | 30 | Seoul |
| Bob | 25 | Busan |`;

try {
  const result1 = markdownToTelegramHTML(simpleTable);
  console.log('✅ 변환 성공');
  console.log('결과:\n');
  console.log(result1);

  if (result1.includes('[object object]')) {
    console.error('❌ [object object]가 여전히 존재합니다!');
  } else if (result1.includes('Alice') && result1.includes('Seoul')) {
    console.log('\n✅ 데이터가 올바르게 변환되었습니다');
  }
} catch (error) {
  console.error('❌ 에러:', error);
}

// 테스트 2: 제목이 있는 테이블
console.log('\n\n📝 테스트 2: 제목이 있는 테이블');
const tableWithHeading = `# 사용자 정보

| 이름 | 나이 | 도시 |
|------|-----:|------|
| Alice | 30 | Seoul |
| Bob | 25 | Busan |
| Charlie | 35 | Daegu |`;

try {
  const result2 = markdownToTelegramHTML(tableWithHeading);
  console.log('✅ 변환 성공');
  console.log('결과:\n');
  console.log(result2);

  if (result2.includes('[object object]')) {
    console.error('❌ [object object]가 여전히 존재합니다!');
  } else if (result2.includes('Charlie') && result2.includes('Daegu')) {
    console.log('\n✅ 모든 데이터가 올바르게 변환되었습니다');
  }
} catch (error) {
  console.error('❌ 에러:', error);
}

// 테스트 3: 복잡한 테이블
console.log('\n\n📝 테스트 3: 복잡한 테이블 (여러 열)');
const complexTable = `| 상품명 | 가격 | 수량 | 총액 |
|--------|-----:|-----:|-----:|
| Apple | 1000 | 5 | 5000 |
| Orange | 1500 | 3 | 4500 |
| Banana | 800 | 10 | 8000 |
| Mango | 2000 | 2 | 4000 |`;

try {
  const result3 = markdownToTelegramHTML(complexTable);
  console.log('✅ 변환 성공');
  console.log('결과:\n');
  console.log(result3);

  if (result3.includes('[object object]')) {
    console.error('❌ [object object]가 여전히 존재합니다!');
  } else if (result3.includes('Apple') && result3.includes('Mango')) {
    console.log('\n✅ 모든 데이터가 올바르게 변환되었습니다');
  }
} catch (error) {
  console.error('❌ 에러:', error);
}

// 테스트 4: 특수문자가 있는 테이블
console.log('\n\n📝 테스트 4: 특수문자가 있는 테이블');
const specialCharTable = `| 이름 | 직책 | 부서 |
|------|------|------|
| Kim & Lee | CEO | Engineering |
| Park | <Manager> | Sales |
| Choi & Jo | Dev | R&D |`;

try {
  const result4 = markdownToTelegramHTML(specialCharTable);
  console.log('✅ 변환 성공');
  console.log('결과:\n');
  console.log(result4);

  if (result4.includes('[object object]')) {
    console.error('❌ [object object]가 여전히 존재합니다!');
  } else if (result4.includes('Kim')) {
    console.log('\n✅ 특수문자가 올바르게 처리되었습니다');
  }
} catch (error) {
  console.error('❌ 에러:', error);
}

console.log('\n\n✅ 모든 테이블 변환 테스트 완료!');
