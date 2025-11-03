import { TestCase } from '../src/test/snapshotTester';

export const testCases: TestCase[] = [
  // 1. 기본 포맷팅
  {
    name: 'Basic Formatting',
    markdown: `# Heading 1

This is a paragraph with **bold** text and *italic* text.

Here is some \`inline code\` and a [link](https://example.com).`,
    cardTitle: 'Basic Formatting Test',
    description: 'Tests basic markdown formatting: headers, bold, italic, inline code, links',
  },

  // 2. 중첩 리스트
  {
    name: 'Nested Lists',
    markdown: `## Task List

- Top level item 1
- Top level item 2
  - Nested item 2.1
  - Nested item 2.2
    - Deep nested 2.2.1
- Top level item 3

### Ordered List
1. First item
2. Second item
3. Third item`,
    cardTitle: 'Nested Lists',
    description: 'Tests nested lists with multiple levels',
  },

  // 3. 코드 블록
  {
    name: 'Code Blocks',
    markdown: `## Code Examples

JavaScript:
\`\`\`javascript
function hello() {
  console.log('Hello World');
}
\`\`\`

Python:
\`\`\`python
def greet(name):
    print(f"Hello {name}")
\`\`\``,
    cardTitle: 'Code Blocks',
    description: 'Tests code blocks with syntax highlighting',
  },

  // 4. 표
  {
    name: 'Tables',
    markdown: `## Data Table

| Name | Age | City |
|------|-----|------|
| Alice | 30 | Seoul |
| Bob | 25 | Busan |
| Charlie | 35 | Incheon |`,
    cardTitle: 'Table Test',
    description: 'Tests markdown table rendering',
  },

  // 5. 이미지 (유효한 URL)
  {
    name: 'Valid Images',
    markdown: `## Images

GitHub logo (should work):
![GitHub](https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png)

Note: Image validation may timeout in CI environments.`,
    cardTitle: 'Images',
    description: 'Tests image rendering with valid URLs',
  },

  // 6. 이미지 (잘못된 URL)
  {
    name: 'Invalid Images',
    markdown: `## Broken Images

This image does not exist:
![Broken](https://example.com/nonexistent.jpg)

This is not an image:
![Not Image](https://www.google.com)`,
    cardTitle: 'Invalid Images',
    description: 'Tests image validation with invalid URLs',
  },

  // 7. 복합 컨텐츠
  {
    name: 'Mixed Content',
    markdown: `# Project Overview

## Description
This is a **comprehensive** test with *multiple* elements.

### Features
- Feature 1: \`code inline\`
- Feature 2: [Documentation](https://docs.example.com)
  - Sub-feature A
  - Sub-feature B

### Code Sample
\`\`\`typescript
interface User {
  name: string;
  age: number;
}
\`\`\`

### Data
| ID | Name | Status |
|----|------|--------|
| 1 | Task A | ✅ Done |
| 2 | Task B | 🔄 In Progress |`,
    cardTitle: 'Mixed Content',
    description: 'Tests combination of multiple markdown elements',
  },

  // 8. 엣지 케이스: 빈 컨텐츠
  {
    name: 'Edge Case - Minimal',
    markdown: `# Title Only`,
    cardTitle: 'Minimal',
    description: 'Tests minimal markdown content',
  },

  // 9. 엣지 케이스: 특수 문자
  {
    name: 'Edge Case - Special Characters',
    markdown: `## Special Characters

Text with <html> tags and & ampersands.

Code: \`<div>test</div>\`

Link: [Test & Go](https://example.com?a=1&b=2)`,
    cardTitle: 'Special Characters',
    description: 'Tests handling of special characters and HTML',
  },

  // 10. 엣지 케이스: 긴 텍스트
  {
    name: 'Edge Case - Long Text',
    markdown: `## Long Content

${'Lorem ipsum dolor sit amet, consectetur adipiscing elit. '.repeat(10)}

### List
${Array.from({ length: 20 }, (_, i) => `- Item ${i + 1}`).join('\n')}`,
    cardTitle: 'Long Content',
    description: 'Tests handling of long text and many list items',
  },

  // 11. 한글 컨텐츠
  {
    name: 'Korean Content',
    markdown: `# 한글 제목

## 설명
이것은 **한글** 테스트입니다. *기울임*도 잘 작동합니다.

### 목록
- 첫 번째 항목
- 두 번째 항목
  - 중첩된 항목
- 세 번째 항목

### 코드
\`\`\`javascript
// 한글 주석
console.log('안녕하세요');
\`\`\``,
    cardTitle: '한글 테스트',
    description: 'Tests Korean language content',
  },

  // 12. 여러 헤더 레벨
  {
    name: 'Multiple Header Levels',
    markdown: `# H1 Header

## H2 Header

### H3 Header

#### H4 Header

##### H5 Header

###### H6 Header`,
    cardTitle: 'Headers',
    description: 'Tests all header levels',
  },
];
