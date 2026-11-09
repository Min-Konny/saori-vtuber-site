// Original supplied artwork, copied byte for byte. Add creator/source when supplied.
const descriptions = [
  'グラスを持つ赤い衣装のさおり', '白と赤の衣装のさおりと淡い背景',
  'ピンクの背景とゴリラのファンアート', 'チャンネル登録者7000人記念のさおり',
  'メモを持つさおり', '動画配信画面風のさおり', 'ドレス姿のさおりと赤い花びら',
  'ハロウィンの衣装のさおり', '焼きそばを食べるデフォルメのさおり',
  '雑誌の表紙風のさおり', 'ゆずに挟まれたデフォルメのさおり',
  'スイーツを持つさおり', '11月17日の誕生日ファンアート',
  'ハートとキャンディに囲まれたさおり', '頬に手を添えたさおり',
  'ピンクのセーター姿のさおり',
];
export const artworks = descriptions.map((alt, index) => ({
  id: `s${index + 1}`, image: `assets/fanart/s${index + 1}.jpg`, preview: `assets/fanart/s${index + 1}.webp`,
  title: `Fan art ${String(index + 1).padStart(2, '0')}`,
  subtitle: '#さおり見てくれ', credit: '', alt, kind: 'artwork', creator: '', source: '',
}));
export const exhibition = [14, 2, 8, 15, 16, 7].map(number => artworks[number - 1]);
