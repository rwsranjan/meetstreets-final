import QRCode from 'qrcode';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { amount, upiId, name } = req.body;

    if (!amount || !upiId) {
      return res.status(400).json({ message: 'Amount and UPI ID required' });
    }

    // Create UPI payment string
    const upiString = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(name || 'MeetStreet')}&am=${amount}&cu=INR&tn=${encodeURIComponent('MeetStreet Coins Purchase')}`;

    // Generate QR code
    const qrCode = await QRCode.toDataURL(upiString);

    res.status(200).json({
      qrCode,
      upiString,
      amount,
      message: 'Scan this QR code with any UPI app to pay'
    });
  } catch (error) {
    console.error('Generate QR error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
}