"use client";
import { useEffect, useRef } from "react";
import QRCode from "qrcode";

export default function QRMesa({ mesa, baseUrl, onClose }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current) return;
   const url = `${baseUrl}/menu?mesa=${mesa.numero}&t=${mesa.token}`;
    QRCode.toCanvas(canvasRef.current, url, {
      width: 250,
      margin: 2,
      color: {
        dark: "#1c1917",
        light: "#ffffff",
      },
    });
  }, [mesa, baseUrl]);

  const descargar = () => {
    const canvas = canvasRef.current;
    const link = document.createElement("a");
    link.download = `mesa-${mesa.numero}-qr.png`;
    link.href = canvas.toDataURL();
    link.click();
  };

  const imprimir = () => {
    const canvas = canvasRef.current;
    const url = canvas.toDataURL();
    const ventana = window.open("", "_blank");
    ventana.document.write(`
      <html>
        <head>
          <title>QR Mesa #${mesa.numero}</title>
          <style>
            body { 
              display: flex; 
              flex-direction: column;
              align-items: center; 
              justify-content: center; 
              min-height: 100vh;
              margin: 0;
              font-family: sans-serif;
            }
            img { width: 250px; height: 250px; }
            h2 { margin-bottom: 8px; font-size: 24px; }
            p { margin: 4px 0; color: #666; font-size: 14px; }
          </style>
        </head>
        <body>
          <h2>Mesa #${mesa.numero}</h2>
          <p>Escanea para ver el menú y hacer tu pedido</p>
          <img src="${url}" />
          <p style="margin-top: 16px;">Capacidad: ${mesa.capacidad} personas</p>
        </body>
      </html>
    `);
    ventana.document.close();
    ventana.print();
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center px-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-stone-900 px-6 py-5 flex justify-between items-center">
          <div>
            <p className="text-amber-400 text-xs uppercase tracking-widest mb-1">Código QR</p>
            <h2 className="text-white font-bold text-xl">Mesa #{mesa.numero}</h2>
          </div>
          <button onClick={onClose} className="text-stone-400 hover:text-white transition text-2xl">✕</button>
        </div>

        <div className="p-6 flex flex-col items-center">
          <p className="text-stone-400 text-sm mb-6 text-center">
            El cliente escanea este QR para ver el menú y hacer su pedido directamente desde la mesa.
          </p>

          {/* QR */}
          <div className="border-2 border-stone-100 rounded-2xl p-4 mb-6">
            <canvas ref={canvasRef} />
          </div>

          <p className="text-stone-400 text-xs mb-6 text-center">
            Apunta a: <span className="text-stone-600 font-medium">/menu?mesa={mesa.numero}</span>
          </p>

          {/* Botones */}
          <div className="flex gap-3 w-full">
            <button
              onClick={descargar}
              className="flex-1 border border-stone-200 text-stone-600 rounded-xl py-3 text-sm hover:bg-stone-50 transition"
            >
              ⬇️ Descargar
            </button>
            <button
              onClick={imprimir}
              className="flex-1 bg-stone-900 hover:bg-stone-800 text-white font-semibold rounded-xl py-3 text-sm transition"
            >
              🖨️ Imprimir
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}