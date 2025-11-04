const QRCode = require('qrcode');
const url = 'https://soymatudev.github.io/QR_Etico/'; // reemplaza

QRCode.toFile('qr_demo.png', url, { width: 400 }, function (err) {
  if (err) throw err;
  console.log('QR guardado en qr_demo.png');
});
