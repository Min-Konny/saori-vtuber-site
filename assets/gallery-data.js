// Original supplied artwork, copied byte for byte. Add creator/source when supplied.
const descriptions = [
  'グラスを持つ赤い衣装のさおり', '白と赤の衣装のさおりと淡い背景',
  'ピンクの背景とゴリラのファンアート', 'チャンネル登録者7000人記念のさおり',
  'メモを持つさおり', '動画配信画面風のさおり', 'ドレス姿のさおりと赤い花びら',
  'ハロウィンの衣装のさおり', '焼きそばを食べるデフォルメのさおり',
  '雑誌の表紙風のさおり', 'ゆずに挟まれたデフォルメのさおり',
  'スイーツを持つさおり', null,
  'ハートとキャンディに囲まれたさおり', '頬に手を添えたさおり',
  null,
  'YouTubeチャンネル登録者1000人記念のさおり',
  '学校の廊下にいるさおりたちのファンアート',
  'ハートのポーズとピンクの衣装のさおり',
];
export const artworks = descriptions.flatMap((alt, index) => alt ? [{
  id: `s${index + 1}`, image: `assets/fanart/s${index + 1}.jpg`, preview: `assets/fanart/s${index + 1}.webp`,
  title: `Fan art ${String(index + 1).padStart(2, '0')}`,
  subtitle: '#さおり見てくれ', credit: '', alt, kind: 'artwork', creator: '', source: '',
}] : []);
export const exhibition = [14, 2, 8, 15, 19, 7].map(number => artworks.find(art => art.id === `s${number}`));
export const companions = [4, 5, 12, 17, 18, 11].map(number => artworks.find(art => art.id === `s${number}`));
