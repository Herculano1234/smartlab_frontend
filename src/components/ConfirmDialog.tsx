import React from 'react';

export default function ConfirmDialog({ open, title, message, onConfirm, onCancel }: { open:boolean; title?:string; message:string; onConfirm:()=>void; onCancel:()=>void }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onCancel}></div>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-md w-full p-5 z-10">
        {title && <h3 className="text-lg font-semibold mb-2">{title}</h3>}
        <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">{message}</p>
        <div className="flex justify-end space-x-2">
          <button onClick={onCancel} className="px-4 py-2 rounded bg-gray-200 dark:bg-gray-700">Cancelar</button>
          <button onClick={onConfirm} className="px-4 py-2 rounded bg-sky-600 text-white">Confirmar</button>
        </div>
      </div>
    </div>
  );
}
