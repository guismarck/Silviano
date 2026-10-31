import React, { useEffect, useRef, useCallback } from 'react';
import { Button } from 'primereact/button';

export const SimpleCaptcha = ({ onCaptchaGenerate }) => {
  const canvasRef = useRef(null);

  // Genera un código alfanumérico aleatorio legible
  const generateRandomCode = useCallback(() => {
    const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
    let code = '';
    for (let i = 0; i < 5; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }, []);

  // Dibuja el Captcha en un Canvas con distorsión visual para evitar bot scraping simple
  const drawCaptcha = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const newCode = generateRandomCode();

    // Notifica al padre el valor actual esperado
    onCaptchaGenerate(newCode);

    // Fondo del Canvas
    ctx.fillStyle = '#f8f9fa';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Delineado de ruido visual (líneas aleatorias)
    for (let i = 0; i < 5; i++) {
      ctx.strokeStyle = '#cbd5e1';
      ctx.beginPath();
      ctx.moveTo(Math.random() * canvas.width, Math.random() * canvas.height);
      ctx.lineTo(Math.random() * canvas.width, Math.random() * canvas.height);
      ctx.stroke();
    }

    // Dibujado del texto con ligera rotación aleatoria
    ctx.font = 'bold 22px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const charWidth = canvas.width / (newCode.length + 1);
    for (let i = 0; i < newCode.length; i++) {
      ctx.save();
      const x = charWidth * (i + 1);
      const y = canvas.height / 2 + (Math.random() * 4 - 2);
      const angle = (Math.random() - 0.5) * 0.4;

      ctx.translate(x, y);
      ctx.rotate(angle);
      ctx.fillStyle = i % 2 === 0 ? '#1e3a8a' : '#0d9488';
      ctx.fillText(newCode[i], 0, 0);
      ctx.restore();
    }
  }, [generateRandomCode, onCaptchaGenerate]);

  useEffect(() => {
    drawCaptcha();
  }, [drawCaptcha]);

  return (
    <div className="flex align-items-center gap-2">
      <div className="border-1 surface-border border-round p-1 bg-light flex align-items-center justify-content-center">
        <canvas ref={canvasRef} width={130} height={40} className="block" />
      </div>
      <Button
        type="button"
        icon="pi pi-refresh"
        className="p-button-outlined p-button-secondary p-button-sm"
        onClick={drawCaptcha}
        tooltip="Refrescar código"
        tooltipOptions={{ position: 'top' }}
      />
    </div>
  );
};