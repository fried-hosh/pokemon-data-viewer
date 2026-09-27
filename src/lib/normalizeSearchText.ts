// 検索の比較用に文字列を揃える
// - NFKC：全角英数字を半角に（「Ｘ」→「X」）、半角カタカナを全角に
// - ひらがなをカタカナに（「りざーどん」→「リザードン」）
export const normalizeSearchText = (text: string) => {
  return text.normalize("NFKC").replace(/[ぁ-ゖ]/g, (char) => String.fromCharCode(char.charCodeAt(0) + 0x60));
};
