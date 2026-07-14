import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';

interface RealQrCodeProps {
  value: string;
  size?: number;
  className?: string;
}

export default function RealQrCode({ value, size = 150, className = '' }: RealQrCodeProps) {
  const [qrUrl, setQrUrl] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!value) return;

    QRCode.toDataURL(value, {
      margin: 1,
      width: size,
      color: {
        dark: '#0f172a', // Deep slate for rich contrast
        light: '#ffffff', // Clean white background
      },
      errorCorrectionLevel: 'H', // High error correction for robust phone scanning
    })
      .then((url) => {
        setQrUrl(url);
        setError(null);
      })
      .catch((err) => {
        console.error('Failed to generate QR Code:', err);
        setError('QR Code error');
      });
  }, [value, size]);

  if (error) {
    return (
      <div 
        style={{ width: size, height: size }} 
        className={`bg-red-50 text-red-500 rounded-xl flex items-center justify-center text-[10px] font-bold border border-red-100 ${className}`}
      >
        {error}
      </div>
    );
  }

  if (!qrUrl) {
    return (
      <div 
        style={{ width: size, height: size }} 
        className={`bg-slate-100 animate-pulse rounded-xl flex items-center justify-center text-[10px] text-slate-400 font-bold ${className}`}
      >
        កំពុងបង្កើត...
      </div>
    );
  }

  return (
    <img 
      src={qrUrl} 
      alt="Scannable QR Code" 
      width={size} 
      height={size} 
      className={`rounded-xl shadow-xs border border-slate-100 p-1.5 bg-white ${className}`}
    />
  );
}
