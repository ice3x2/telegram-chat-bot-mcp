#!/usr/bin/env node
/**
 * Marked 라이브러리의 테이블 파싱 분석
 * [object object] 문제의 원인을 찾기 위한 디버그 스크립트
 */

import { marked } from 'marked';

const tableMarkdown = `# Table Test

| Name | Age | City |
|------|-----:|------|
| Alice | 30 | Seoul |
| Bob | 25 | Busan |
`;

console.log('🧪 Marked 라이브러리 테이블 파싱 분석\n');

const tokens = marked.lexer(tableMarkdown);

console.log('📊 모든 토큰:');
console.log(JSON.stringify(tokens, null, 2));

console.log('\n\n🔍 테이블 토큰 상세 분석:');
for (const token of tokens) {
  if (token.type === 'table') {
    console.log('\n=== Table Token ===');
    console.log('Token type:', token.type);
    console.log('Token keys:', Object.keys(token));

    console.log('\nHeader 분석:');
    console.log('  Type:', typeof (token as any).header);
    console.log('  Value:', (token as any).header);

    if (Array.isArray((token as any).header)) {
      console.log('  Length:', (token as any).header.length);
      (token as any).header.forEach((item: any, idx: number) => {
        console.log(`  [${idx}] Type: ${typeof item}, Value: ${JSON.stringify(item)}`);
      });
    }

    console.log('\nRows 분석:');
    console.log('  Type:', typeof (token as any).rows);
    console.log('  Length:', (token as any).rows?.length);

    if (Array.isArray((token as any).rows)) {
      (token as any).rows.forEach((row: any, rowIdx: number) => {
        console.log(`  Row[${rowIdx}]:`);
        console.log(`    Type: ${typeof row}`);
        console.log(`    Value:`, row);

        if (Array.isArray(row)) {
          row.forEach((cell: any, cellIdx: number) => {
            console.log(`      Cell[${cellIdx}] Type: ${typeof cell}, Value: ${JSON.stringify(cell)}`);
          });
        }
      });
    }

    console.log('\nAlign 분석 (있다면):');
    if ((token as any).align) {
      console.log('  Value:', (token as any).align);
      console.log('  Type:', typeof (token as any).align);
    }
  }
}

console.log('\n\n✅ 분석 완료');
