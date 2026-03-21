import { useCallback, useRef, useState } from 'react';

interface Props {
  onBestanden: (files: File[]) => void;
  isLaden: boolean;
  geladenBestanden: string[];
}

const TOEGESTANE_EXTENSIES = ['.ods', '.xlsx', '.xls'];

export function BestandUpload({ onBestanden, isLaden, geladenBestanden }: Props) {
  const [isDragOver, setIsDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const valideerEnLaad = useCallback((fileList: FileList | File[]) => {
    const bestanden = Array.from(fileList);
    const geldig: File[] = [];
    const ongeldig: string[] = [];

    for (const file of bestanden) {
      const extensie = '.' + file.name.split('.').pop()?.toLowerCase();
      if (TOEGESTANE_EXTENSIES.includes(extensie)) {
        geldig.push(file);
      } else {
        ongeldig.push(file.name);
      }
    }

    if (ongeldig.length > 0) {
      alert(`De volgende bestanden hebben een ongeldig formaat en worden overgeslagen:\n${ongeldig.join('\n')}\n\nAlleen ODS- en Excel-bestanden (.ods, .xlsx, .xls) worden geaccepteerd.`);
    }

    if (geldig.length > 0) {
      onBestanden(geldig);
    }
  }, [onBestanden]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files.length > 0) {
      valideerEnLaad(e.dataTransfer.files);
    }
  }, [valideerEnLaad]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      valideerEnLaad(e.target.files);
      // Reset input zodat hetzelfde bestand opnieuw gekozen kan worden
      e.target.value = '';
    }
  }, [valideerEnLaad]);

  return (
    <div className="space-y-3">
      <div
        onDragOver={e => { e.preventDefault(); setIsDragOver(true); }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`
          border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-colors
          ${isDragOver
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
          }
          ${isLaden ? 'opacity-50 pointer-events-none' : ''}
        `}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".ods,.xlsx,.xls"
          multiple
          onChange={handleChange}
          className="hidden"
        />
        {isLaden ? (
          <div>
            <div className="text-lg font-medium text-gray-700">Bestanden worden verwerkt...</div>
            <div className="mt-2 text-sm text-gray-500">Even geduld alstublieft</div>
          </div>
        ) : (
          <div>
            <div className="text-4xl mb-3">📂</div>
            <div className="text-lg font-medium text-gray-700">
              Sleep inspectiebestanden hierheen
            </div>
            <div className="mt-2 text-sm text-gray-500">
              of klik om bestanden te kiezen (meerdere ODS/Excel-bestanden tegelijk)
            </div>
            {geladenBestanden.length > 0 && (
              <div className="mt-3 text-sm text-blue-600">
                Extra bestanden toevoegen aan het huidige overzicht
              </div>
            )}
          </div>
        )}
      </div>

      {/* Geladen bestanden lijst */}
      {geladenBestanden.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-3">
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
            Geladen bestanden ({geladenBestanden.length})
          </div>
          <div className="flex flex-wrap gap-2">
            {geladenBestanden.map(naam => (
              <span
                key={naam}
                className="inline-flex items-center px-2.5 py-1 rounded-full text-xs bg-blue-50 text-blue-700 border border-blue-200"
              >
                {naam}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
