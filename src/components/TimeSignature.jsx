import { SUBDIVISIONS, TIME_SIG_PRESETS } from '../utils/rhythm';

export default function TimeSignature({ numerator, denominator, subdivision, onChangeSig, onChangeSubdivision }) {
  const applyPreset = (preset) => {
    const [n, d] = preset.split('/').map(Number);
    onChangeSig(n, d);
  };

  return (
    <div className="timesig-control">
      <div className="timesig-display">
        <div className="timesig-numbers">
          <button
            className="timesig-num"
            onClick={() => onChangeSig(numerator, denominator)}
            aria-label={`Time signature ${numerator} over ${denominator}`}
          >
            {numerator}
          </button>
          <div className="timesig-slash">/</div>
          <div className="timesig-num timesig-num--static">{denominator}</div>
        </div>

        <div className="timesig-steppers">
          <div className="stepper">
            <button aria-label="Decrease beats per measure" onClick={() => onChangeSig(Math.max(1, numerator - 1), denominator)}>−</button>
            <span>beats</span>
            <button aria-label="Increase beats per measure" onClick={() => onChangeSig(Math.min(16, numerator + 1), denominator)}>+</button>
          </div>
          <div className="stepper">
            <button aria-label="Halve note value" onClick={() => onChangeSig(numerator, Math.max(2, denominator / 2))}>−</button>
            <span>note value</span>
            <button aria-label="Double note value" onClick={() => onChangeSig(numerator, Math.min(16, denominator * 2))}>+</button>
          </div>
        </div>
      </div>

      <div className="timesig-presets" role="group" aria-label="Time signature presets">
        {TIME_SIG_PRESETS.map((p) => (
          <button
            key={p}
            className={`chip ${p === `${numerator}/${denominator}` ? 'chip--active' : ''}`}
            onClick={() => applyPreset(p)}
          >
            {p}
          </button>
        ))}
      </div>

      <div className="subdivision-row" role="group" aria-label="Subdivision">
        <div className="subdivision-label">SUBDIVISION</div>
        <div className="subdivision-chips">
          {SUBDIVISIONS.map((s) => (
            <button
              key={s.id}
              className={`chip chip--sub ${subdivision === s.id ? 'chip--active' : ''}`}
              onClick={() => onChangeSubdivision(s.id)}
              aria-label={`${s.name} subdivision`}
              aria-pressed={subdivision === s.id}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
