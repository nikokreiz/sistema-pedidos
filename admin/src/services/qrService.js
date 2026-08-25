import QRCode from 'qrcode';

const generarQR = async (mesaId, qrCodigo) => {
  try {
    // Genera QR como imagen PNG
    const qrDataUrl = await QRCode.toDataURL(qrCodigo, {
      errorCorrectionLevel: 'H',
      type: 'image/png',
      quality: 0.95,
      margin: 1,
      width: 300,
    });
    return qrDataUrl;
  } catch (err) {
    console.error("Error generando QR:", err);
    throw err;
  }
};

const descargarQR = async (mesaNumero, qrCodigo) => {
  try {
    const qrDataUrl = await generarQR(mesaNumero, qrCodigo);
    
    // Crea un link temporal y descarga
    const link = document.createElement('a');
    link.href = qrDataUrl;
    link.download = `QR-MESA-${mesaNumero}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (err) {
    console.error("Error descargando QR:", err);
    throw err;
  }
};

const descargarMultiplesQRs = async (mesas) => {
  try {
    for (const mesa of mesas) {
      await descargarQR(mesa.numero, mesa.qr_codigo_unico);
      // Pequeño delay entre descargas
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  } catch (err) {
    console.error("Error descargando múltiples QRs:", err);
    throw err;
  }
};

export const qrService = { generarQR, descargarQR, descargarMultiplesQRs };