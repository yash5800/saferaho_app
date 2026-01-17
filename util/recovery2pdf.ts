import { Platform } from 'react-native';
import RNFS from "react-native-fs";
import { generatePDF } from 'react-native-html-to-pdf';
import Share from 'react-native-share';


const html_template = (userGmail: string, words: string) => `<style>
  :root {
    --bg: #f8fafc;
    --card: #ffffff;
    --text: #0f172a;
    --muted: #475569;
    --border: #e5e7eb;
    --primary: #2563eb;
    --accent-soft: #eef2ff;
    --success-soft: #ecfdf5;
    --success-border: #86efac;
    --danger-soft: #fff7ed;
  }

  * {
    box-sizing: border-box;
  }

  body {
    margin: 0;
    font-family: Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif;
    background: var(--bg);
    color: var(--text);
    padding: 48px 20px;
  }

  .page {
    max-width: 760px;
    margin: auto;
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: 16px;
    padding: 48px;
  }

  /* Header */
  .header {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    margin-bottom: 40px;
  }

  .logo-title {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .logo-title h1 {
    font-size: 26px;
    margin: 0;
    letter-spacing: -0.02em;
  }

  .logo-title span {
    font-size: 13px;
    color: var(--muted);
  }

  .user-email {
    font-size: 14px;
    color: var(--muted);
    word-break: break-all;
  }

  h2 {
    font-size: 18px;
    margin-top: 36px;
    margin-bottom: 8px;
    letter-spacing: -0.01em;
  }

  p {
    font-size: 14px;
    line-height: 1.7;
    color: var(--muted);
    margin: 0;
  }

  /* Recovery Phrase */
  .phrase-section {
    margin-top: 20px;
    padding: 20px;
    border-radius: 14px;
    background: #fff7ed; /* soft amber */
    border: 1px solid #fed7aa;
  }

  .tip{
    font-size: 13px;
    color: #b45309;
  }

  .phrase {
    margin-top: 12px;
    padding: 14px;
    border: 1px solid #e5e7eb;
    font-family: monospace;
    font-size: 14px;
    line-height: 1.6;
    white-space: pre-wrap;
    word-break: break-word;
    overflow-wrap: anywhere;
  }

  /* Info blocks */
  .info-box {
    margin-top: 24px;
    padding: 20px 22px;
    border-radius: 14px;
    background: var(--success-soft);
    border: 1px solid var(--success-border);
  }

  .info-box h3 {
    margin: 0 0 8px 0;
    font-size: 16px;
    color: #047857;
  }

  .storage-tips {
    margin: 0;
    padding-left: 18px;
    font-size: 14px;
    color: #065f46;
  }

  .storage-tips li {
    margin-bottom: 8px;
  }

  /* Footer */
  .footer {
    margin-top: 48px;
    padding-top: 16px;
    border-top: 1px solid var(--border);
    font-size: 12px;
    color: #64748b;
    text-align: center;
  }
</style>

<div class="page">
  <div class="header">
    <div class="logo-title">
      <h1>Recovery kit</h1>
      <span>Keep this document safe</span>
    </div>
    <div class="user-email">${userGmail}</div>
  </div>

  <h2>Recovery phrase</h2>
  <p>
    If you get locked out of your account, this phrase lets you recover access and data.
  </p>

  <div class="phrase-section">
    <span class="tip">Copy without missing any word</span>
    <div class="phrase">
      ${words}
    </div>
  </div>

  <h2>Why this matters</h2>
  <p>
    Due to strong encryption, nobody — not even us — can access your account without this phrase.
    Losing it may permanently lock your data.
  </p>

  <div class="info-box">
    <h3>Safe storage tips</h3>
    <ul class="storage-tips">
      <li>Write it down and store it in a secure location.</li>
      <li>Use an encrypted password manager for digital storage.</li>
      <li>Avoid screenshots or cloud photos.</li>
      <li>Never share this phrase with anyone.</li>
    </ul>
  </div>

  <div class="footer">
    By SafeRaho • Created on ${new Date().toLocaleDateString()}
  </div>
</div>`

export const recovery2Pdf = async (userGmail: string, words: string) => {
  try {
    await new Promise(r => setTimeout(r, 300)); // WebView stabilize

    const downloadPath =
      Platform.OS === 'android'
        ? `${RNFS.DownloadDirectoryPath}/recovery_keys_${Date.now()}.pdf`
        : `${RNFS.DocumentDirectoryPath}/recovery_keys.pdf`;

    const file = await generatePDF({
      html: html_template(userGmail, words),
      fileName: 'recovery_keys',
      directory: Platform.OS === 'android' ? undefined : 'Documents',
      base64: false,
    });

    if (!file.filePath) {
      throw new Error('PDF generation failed');
    }

    // Android: copy to Downloads
    if (Platform.OS === 'android') {
      await RNFS.copyFile(file.filePath, downloadPath);
    }

    return downloadPath;
  } catch (e) {
    console.error('Auto download failed:', e);
    throw new Error('Could not download recovery file');
  }
};


export const backupRecoveryKeys = async (pdfPath: string) => {
  try {
    await Share.open({
      url: `file://${pdfPath}`,
      type: 'application/pdf',
      title: 'Backup Recovery Keys',
      failOnCancel: false,
    });
  } catch (err) {
    console.log('Backup cancelled or failed', err);
  }
};