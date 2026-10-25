import { useRef, useState } from 'react';
import { Icon } from '@/components/Icon';
import { PageHeader } from '@/components/PageHeader';
import { VoiceInstructions } from '@/components/VoiceHelp';
import { useSpeech } from '@/hooks/useSpeech';
import { exportBackup, parseBackup, useProgress, type Theme } from '@/store/progress';

export function SettingsPage() {
  const settings = useProgress((s) => s.settings);
  const update = useProgress((s) => s.updateSettings);
  const importData = useProgress((s) => s.importData);
  const resetAll = useProgress((s) => s.resetAll);
  const { voices, voice, speak, supported, status } = useSpeech();
  const fileInput = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const [confirmReset, setConfirmReset] = useState(false);

  const download = () => {
    const blob = new Blob([exportBackup(useProgress.getState())], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `palabra-progreso-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const upload = async (file: File) => {
    try {
      const data = parseBackup(await file.text());
      importData({ app: 'palabra', data });
      setMessage({ ok: true, text: 'Progreso importado correctamente.' });
    } catch (error) {
      setMessage({ ok: false, text: (error as Error).message || 'No se pudo leer el archivo.' });
    }
  };

  return (
    <>
      <PageHeader
        eyebrow="Preferencias"
        title="Ajustes"
        lead="Todo se guarda en este navegador. Exporta una copia para llevar tu progreso a otro dispositivo."
      />
      <div className="settings">
        <section className="panel">
          <h2 className="panel__title">Apariencia</h2>
          <fieldset className="segmented">
            <legend>Tema</legend>
            {(
              [
                ['system', 'Sistema'],
                ['light', 'Claro'],
                ['dark', 'Oscuro'],
              ] as Array<[Theme, string]>
            ).map(([value, label]) => (
              <label key={value} className={settings.theme === value ? 'segmented--active' : ''}>
                <input
                  type="radio"
                  name="theme"
                  value={value}
                  checked={settings.theme === value}
                  onChange={() => update({ theme: value })}
                />
                {label}
              </label>
            ))}
          </fieldset>
          <label className="field">
            <span>Objetivo diario: {settings.dailyGoal} actividades</span>
            <input
              type="range"
              min={10}
              max={90}
              step={5}
              value={settings.dailyGoal}
              onChange={(e) => update({ dailyGoal: Number(e.target.value) })}
            />
          </label>
        </section>

        <section className="panel">
          <h2 className="panel__title">Voz</h2>
          {!supported ? (
            <p className="muted">Este navegador no permite síntesis de voz.</p>
          ) : status === 'missing' ? (
            <>
              <p>
                <strong>No hay ninguna voz en inglés instalada.</strong> El audio está desactivado
                para no enseñarte una pronunciación incorrecta con la voz española.
              </p>
              <VoiceInstructions />
            </>
          ) : (
            <>
              <label className="field">
                <span>
                  Voz en inglés ({voices.length} disponibles)
                  {voice && <span className="muted"> · en uso: {voice.name}</span>}
                </span>
                <select
                  className="input"
                  value={settings.voiceURI ?? ''}
                  onChange={(e) => update({ voiceURI: e.target.value || null })}
                >
                  <option value="">Automática (la de mejor calidad)</option>
                  {voices.map((v) => (
                    <option key={v.voiceURI} value={v.voiceURI}>
                      {v.name} ({v.lang})
                    </option>
                  ))}
                </select>
              </label>
              <label className="field">
                <span>Velocidad: {settings.rate.toFixed(2)}×</span>
                <input
                  type="range"
                  min={0.5}
                  max={1.3}
                  step={0.05}
                  value={settings.rate}
                  onChange={(e) => update({ rate: Number(e.target.value) })}
                />
              </label>
              <button
                type="button"
                className="button button--ghost"
                onClick={() => speak('Hello! This is how I sound. Could you repeat that, please?')}
              >
                <Icon name="play" size={16} /> Probar voz
              </button>
            </>
          )}
        </section>

        <section className="panel">
          <h2 className="panel__title">Tus datos</h2>
          <div className="task__actions">
            <button type="button" className="button button--ghost" onClick={download}>
              <Icon name="download" size={16} /> Exportar progreso
            </button>
            <button
              type="button"
              className="button button--ghost"
              onClick={() => fileInput.current?.click()}
            >
              <Icon name="upload" size={16} /> Importar progreso
            </button>
            <input
              ref={fileInput}
              type="file"
              accept="application/json"
              hidden
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) void upload(file);
                e.target.value = '';
              }}
            />
          </div>
          {message && (
            <p className={message.ok ? 'success' : 'error'} role="status">
              {message.text}
            </p>
          )}
          <hr />
          {confirmReset ? (
            <div className="inline-confirm">
              <span>Se borrará todo el progreso, tarjetas y ajustes. ¿Seguro?</span>
              <button
                type="button"
                className="button button--danger"
                onClick={() => {
                  resetAll();
                  setConfirmReset(false);
                  setMessage({ ok: true, text: 'Progreso borrado.' });
                }}
              >
                Sí, borrar todo
              </button>
              <button
                type="button"
                className="button button--ghost"
                onClick={() => setConfirmReset(false)}
              >
                Cancelar
              </button>
            </div>
          ) : (
            <button
              type="button"
              className="button button--danger-ghost"
              onClick={() => setConfirmReset(true)}
            >
              Borrar todo el progreso
            </button>
          )}
        </section>
      </div>
    </>
  );
}
