const QRCode = require('qrcode');

/**
 * Generate UPI QR code as base64 data URL
 * @param {string} upiId - UPI ID (e.g., "123@ybl.com")
 * @param {number} [amount] - Optional payment amount
 * @param {string} [note] - Optional payment note
 * @returns {Promise<string>} Base64 data URL of the QR code
 */
async function generateUPIQR(upiId, amount, note) {
  // Build UPI deep link
  let upiUrl = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=POS%20Cafe`;

  if (amount) {
    upiUrl += `&am=${amount}`;
  }

  if (note) {
    upiUrl += `&tn=${encodeURIComponent(note)}`;
  }

  upiUrl += '&cu=INR';

  const qrBase64 = await QRCode.toDataURL(upiUrl, {
    width: 300,
    margin: 2,
    color: {
      dark: '#000000',
      light: '#FFFFFF',
    },
  });

  return qrBase64;
}

module.exports = { generateUPIQR };
