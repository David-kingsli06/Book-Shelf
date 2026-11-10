export interface BookDef {
  x: number;
  y: number;
  w: number;
  h: number;
  spineColor: string;
  sheet: 'A' | 'B';
}

// Sheet A: 2336 x 1744
export const SHEET_A_URL = "https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20261030_003447_7862e2d0-751c-4d7c-9c8a-e682415d908f.png&w=2336&q=90";
// Sheet B: 2336 x 1744
export const SHEET_B_URL = "https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20261030_003448_95f1eed5-2ae5-4736-a53c-f3b3f87acd3b.png&w=2336&q=90";

export const SHEET_A_CELLS: Omit<BookDef, 'sheet'>[] = [
  { x: 6, y: 0, w: 386, h: 575, spineColor: '#2c4f63' }, // 0
  { x: 401, y: 0, w: 376, h: 575, spineColor: '#195433' }, // 1
  { x: 787, y: 0, w: 377, h: 575, spineColor: '#c62420' }, // 2
  { x: 1175, y: 0, w: 379, h: 575, spineColor: '#f4f3ef' }, // 3
  { x: 1564, y: 0, w: 377, h: 575, spineColor: '#2d86cf' }, // 4
  { x: 1949, y: 0, w: 383, h: 575, spineColor: '#f7d547' }, // 5
  { x: 6, y: 583, w: 386, h: 573, spineColor: '#494e68' }, // 6
  { x: 401, y: 583, w: 376, h: 573, spineColor: '#f2ecde' }, // 7
  { x: 787, y: 583, w: 377, h: 573, spineColor: '#7893a3' }, // 8
  { x: 1175, y: 583, w: 379, h: 573, spineColor: '#0c0b0b' }, // 9
  { x: 1564, y: 583, w: 377, h: 573, spineColor: '#ddd0c1' }, // 10
  { x: 1949, y: 583, w: 383, h: 573, spineColor: '#013eb0' }, // 11
  { x: 6, y: 1164, w: 386, h: 578, spineColor: '#f2f1ed' }, // 12
  { x: 401, y: 1164, w: 376, h: 578, spineColor: '#0a291c' }, // 13
  { x: 787, y: 1164, w: 377, h: 578, spineColor: '#c61111' }, // 14
  { x: 1175, y: 1164, w: 379, h: 578, spineColor: '#7f7263' }, // 15
  { x: 1564, y: 1164, w: 377, h: 578, spineColor: '#ae4716' }, // 16
  { x: 1949, y: 1164, w: 383, h: 578, spineColor: '#021f42' }  // 17
];

export const SHEET_B_CELLS: Omit<BookDef, 'sheet'>[] = [
  { x: 3, y: 2, w: 383, h: 574, spineColor: '#d1cd8c' }, // 0 (+18 = 18)
  { x: 394, y: 2, w: 381, h: 574, spineColor: '#000621' }, // 1 (+18 = 19)
  { x: 784, y: 2, w: 381, h: 574, spineColor: '#b8acd3' }, // 2 (+18 = 20)
  { x: 1172, y: 2, w: 381, h: 574, spineColor: '#e6bd7e' }, // 3 (+18 = 21)
  { x: 1562, y: 2, w: 381, h: 574, spineColor: '#076368' }, // 4 (+18 = 22)
  { x: 1952, y: 2, w: 382, h: 574, spineColor: '#ad8357' }, // 5 (+18 = 23)
  { x: 3, y: 586, w: 383, h: 572, spineColor: '#cfa94d' }, // 6 (+18 = 24)
  { x: 394, y: 586, w: 381, h: 572, spineColor: '#497f9d' }, // 7 (+18 = 25)
  { x: 784, y: 586, w: 381, h: 572, spineColor: '#02878a' }, // 8 (+18 = 26)
  { x: 1172, y: 586, w: 381, h: 572, spineColor: '#170402' }, // 9 (+18 = 27)
  { x: 1562, y: 586, w: 381, h: 572, spineColor: '#09150b' }, // 10 (+18 = 28)
  { x: 1952, y: 586, w: 382, h: 572, spineColor: '#f57664' }, // 11 (+18 = 29)
  { x: 3, y: 1167, w: 383, h: 574, spineColor: '#f3f3f3' }, // 12 (+18 = 30)
  { x: 394, y: 1167, w: 381, h: 574, spineColor: '#2a2929' }, // 13 (+18 = 31)
  { x: 784, y: 1167, w: 381, h: 574, spineColor: '#3fb1b9' }, // 14 (+18 = 32)
  { x: 1172, y: 1167, w: 381, h: 574, spineColor: '#6b1405' }, // 15 (+18 = 33)
  { x: 1562, y: 1167, w: 381, h: 574, spineColor: '#ceba9f' }, // 16 (+18 = 34)
  { x: 1952, y: 1167, w: 382, h: 574, spineColor: '#1c565e' }  // 17 (+18 = 35)
];

export const ALL_COVERS: BookDef[] = [
  ...SHEET_A_CELLS.map(c => ({ ...c, sheet: 'A' as const })),
  ...SHEET_B_CELLS.map(c => ({ ...c, sheet: 'B' as const }))
];

// Order: 0, 22, 5, 30, 9, 13, 26, 2, 19, 11, 33, 7, 15, 24, 4, 28, 17, 21, 1, 31, 14, 8, 25, 35, 3, 18, 10, 29, 16, 23, 6, 34
export const BOOK_INDICES = [
  0, 22, 5, 30, 9, 13, 26, 2, 19, 11, 33, 7, 15, 24, 4, 28, 17, 21, 1, 31, 14, 8, 25, 35, 3, 18, 10, 29, 16, 23, 6, 34
];
