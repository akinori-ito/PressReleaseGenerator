function doGet() {
  return HtmlService.createHtmlOutputFromFile('index')
    .setTitle('PDF Analyzer with Gemini');
}

/**
 * フォームから送られたPDFデータを処理する
 * @param {Object} fileData {data: Base64文字列, mimeType: 文字列}
 * @param {string} prompt ユーザーからの指示
 */
function processPdf(fileData, prompt) {
  const apiKey = PropertiesService.getScriptProperties().getProperty('GEMINI_API_KEY');
  const model = 'gemini-2.5-flash'; // PDF解析には1.5系を使用
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  // Gemini APIのマルチモーダル用ペイロード
  const payload = {
    "contents": [{
      "parts": [
        { "text": prompt || "このPDFの内容を要約してください。" },
        {
          "inline_data": {
            "mime_type": "application/pdf",
            "data": fileData.data // Base64エンコードされたデータ
          }
        }
      ]
    }]
  };

  const options = {
    "method": "post",
    "contentType": "application/json",
    "payload": JSON.stringify(payload)
  };

  try {
    const response = UrlFetchApp.fetch(url, options);
    const json = JSON.parse(response.getContentText());
    return json.candidates[0].content.parts[0].text;
  } catch (e) {
    return "エラーが発生しました: " + e.toString();
  }
}