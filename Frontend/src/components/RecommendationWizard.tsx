import { useState } from 'react';
import { postRecommend, type RecommendResponse } from '../api/api';
import ResultCard from './ResultCard';
import { Skeleton } from './ui/skeleton';

type Step = 1 | 2 | 3 | 4 | 5 | 'result';

interface WizardState {
  filing_type: string;
  income_sources: string[];
  deductions: string[];
  help_preference: string;
  company_revenue: string;
}

const INITIAL_STATE: WizardState = {
  filing_type: '',
  income_sources: [],
  deductions: [],
  help_preference: '',
  company_revenue: '',
};

const INCOME_OPTIONS = [
  { value: 'salary_income', label: 'Salary income' },
  { value: 'student_income', label: 'Student income' },
  { value: 'investment_income', label: 'Investment income' },
  { value: 'capital_gains', label: 'Capital gains' },
  { value: 'rental_income', label: 'Rental income' },
  { value: 'freelance_income', label: 'Freelance income' },
  { value: 'gig_work_income', label: 'Gig-work income' },
  { value: 'business_revenue', label: 'Business revenue' },
  { value: 'foreign_income', label: 'Foreign income' },
];

const DEDUCTION_OPTIONS = [
  { value: 'medical_expenses', label: 'Medical expenses' },
  { value: 'donations', label: 'Donations' },
  { value: 'employment_expenses', label: 'Employment expenses' },
  { value: 'home_office_expenses', label: 'Home-office expenses' },
  { value: 'vehicle_expenses', label: 'Vehicle expenses' },
  { value: 'business_expenses', label: 'Business expenses' },
  { value: 'no_deductions', label: 'No special deductions' },
];

function ProgressBar({ current, total }: { current: number; total: number }) {
  const pct = Math.round((current / total) * 100);
  return (
    <div style={{ marginBottom: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
        <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 500 }}>Step {current} of {total}</span>
        <span style={{ fontSize: '0.8rem', color: 'var(--color-accent)', fontWeight: 600 }}>{pct}% complete</span>
      </div>
      <div className="h-2 w-full rounded-full bg-slate-200">
        <div
          className="h-2 rounded-full bg-emerald-500 transition-all duration-500 ease-out"
          style={{ width: `${(current / total) * 100}%` }}
        />
      </div>
    </div>
  );
}

function RadioOption({
  name,
  option,
  selected,
  onSelect,
}: {
  name: string;
  option: { value: string; label: string };
  selected: string;
  onSelect: (value: string) => void;
}) {
  return (
    <label
      className={`flex cursor-pointer items-center gap-3 rounded-xl border-2 p-4 transition-colors duration-150 ${
        selected === option.value
          ? "border-emerald-500 bg-emerald-50"
          : "border-slate-200 bg-white hover:border-emerald-300"
      }`}
    >
      <span
        className={`flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border-2 transition-colors duration-150 ${
          selected === option.value ? "border-emerald-500" : "border-slate-300"
        }`}
      >
        {selected === option.value && (
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
        )}
      </span>
      <input
        type="radio"
        name={name}
        value={option.value}
        checked={selected === option.value}
        onChange={() => onSelect(option.value)}
        className="sr-only"
      />
      <span className="text-slate-800">{option.label}</span>
    </label>
  );
}

function CheckboxOption({ value, label, checked, onChange }: { value: string; label: string; checked: boolean; onChange: () => void }) {
  return (
    <label style={{
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
      padding: '0.75rem 1rem',
      border: `2px solid ${checked ? 'var(--color-accent)' : '#e2e8f0'}`,
      borderRadius: '0.625rem',
      cursor: 'pointer',
      backgroundColor: checked ? 'rgba(16, 185, 129, 0.08)' : '#fff',
      transition: 'all 0.15s',
    }}>
      <input type="checkbox" value={value} checked={checked} onChange={onChange} style={{ display: 'none' }} />
      <div style={{
        width: '1.1rem',
        height: '1.1rem',
        borderRadius: '0.25rem',
        border: `2px solid ${checked ? 'var(--color-accent)' : '#cbd5e1'}`,
        backgroundColor: checked ? 'var(--color-accent)' : '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}>
        {checked && <span style={{ color: '#fff', fontSize: '0.65rem', fontWeight: 900 }}>✓</span>}
      </div>
      <span style={{ fontSize: '0.9rem', color: checked ? 'var(--color-accent-hover)' : '#374151', fontWeight: checked ? 500 : 400 }}>{label}</span>
    </label>
  );
}

export default function RecommendationWizard() {
  const [step, setStep] = useState<Step>(1);
  const [state, setState] = useState<WizardState>(INITIAL_STATE);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [result, setResult] = useState<RecommendResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const totalSteps = state.filing_type === 'incorporated_company' ? 5 : 4;

  function toggleMulti(field: 'income_sources' | 'deductions', value: string) {
    if (field === 'deductions') {
      if (value === 'no_deductions') {
        setState((s) => ({ ...s, deductions: s.deductions.includes('no_deductions') ? [] : ['no_deductions'] }));
        return;
      }
      setState((s) => {
        const current = s.deductions.filter((d) => d !== 'no_deductions');
        if (current.includes(value)) {
          return { ...s, deductions: current.filter((d) => d !== value) };
        }
        return { ...s, deductions: [...current, value] };
      });
      return;
    }
    setState((s) => {
      const current = s[field];
      return {
        ...s,
        [field]: current.includes(value) ? current.filter((v) => v !== value) : [...current, value],
      };
    });
  }

  function validateStep(s: Step): boolean {
    const errs: Record<string, string> = {};
    if (s === 1 && !state.filing_type) errs.filing_type = 'Filing type is required.';
    if (s === 2 && state.income_sources.length === 0) errs.income_sources = 'At least one income source is required.';
    if (s === 4 && !state.help_preference) errs.help_preference = 'Help preference is required.';
    if (s === 5 && !state.company_revenue) errs.company_revenue = 'Please indicate whether the company had revenue.';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function next() {
    if (!validateStep(step as Step)) return;

    if (step === 4 && state.filing_type !== 'incorporated_company') {
      await submit();
      return;
    }

    if (step === 5) {
      await submit();
      return;
    }

    setStep((s) => (s as number) + 1 as Step);
  }

  function back() {
    setStep((s) => (s as number) - 1 as Step);
    setErrors({});
  }

  async function submit() {
    setLoading(true);
    try {
      const res = await postRecommend(state);
      setResult(res);
      setStep('result');
    } catch {
      setErrors({ submit: 'Failed to get recommendation. Please ensure the backend server is running.' });
    } finally {
      setLoading(false);
    }
  }

  function restart() {
    setState(INITIAL_STATE);
    setResult(null);
    setErrors({});
    setStep(1);
  }

  if (step === 'result' && result) {
    return <ResultCard result={result} onRestart={restart} />;
  }

  if (loading) {
    return (
      <div className="card" style={{ maxWidth: '640px', margin: '0 auto' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <Skeleton className="h-2 w-32" style={{ height: '0.5rem', width: '8rem' }} />
          <Skeleton style={{ height: '0.9rem', width: '60%' }} />
          <Skeleton style={{ height: '0.9rem', width: '85%' }} />
          <div style={{ display: 'grid', gap: '0.75rem', marginTop: '0.5rem' }}>
            <Skeleton style={{ height: '3.25rem', borderRadius: '0.75rem' }} />
            <Skeleton style={{ height: '3.25rem', borderRadius: '0.75rem' }} />
            <Skeleton style={{ height: '3.25rem', borderRadius: '0.75rem' }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', marginTop: '1rem' }}>
            <Skeleton style={{ height: '2.75rem', width: '6rem', borderRadius: '0.75rem' }} />
            <Skeleton style={{ height: '2.75rem', width: '10rem', borderRadius: '0.75rem' }} />
          </div>
        </div>
      </div>
    );
  }

  const currentStep = step as number;

  return (
    <div className="card" style={{ maxWidth: '640px', margin: '0 auto' }}>
      <ProgressBar current={currentStep} total={totalSteps} />

      {step === 1 && (
        <div className="fade-in">
          <h2 className="font-heading" style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>What are you filing for?</h2>
          <p style={{ color: 'var(--color-body-text)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>Select the option that best describes your filing situation.</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
            {[
              { value: 'personal', label: 'Personal return' },
              { value: 'freelancer_self_employed', label: 'Freelancer / self-employed' },
              { value: 'incorporated_company', label: 'Incorporated company' },
            ].map((opt) => (
              <RadioOption
                key={opt.value}
                name="filing_type"
                option={opt}
                selected={state.filing_type}
                onSelect={(value) => { setState((s) => ({ ...s, filing_type: value })); setErrors({}); }}
              />
            ))}
          </div>
          {errors.filing_type && <p style={{ color: '#dc2626', fontSize: '0.85rem', marginTop: '0.75rem' }}>{errors.filing_type}</p>}
        </div>
      )}

      {step === 2 && (
        <div className="fade-in">
          <h2 className="font-heading" style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>Which income sources apply to you?</h2>
          <p style={{ color: 'var(--color-body-text)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>Select all that apply. At least one is required.</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {INCOME_OPTIONS.map((opt) => (
              <CheckboxOption
                key={opt.value}
                value={opt.value}
                label={opt.label}
                checked={state.income_sources.includes(opt.value)}
                onChange={() => { toggleMulti('income_sources', opt.value); setErrors({}); }}
              />
            ))}
          </div>
          {errors.income_sources && <p style={{ color: '#dc2626', fontSize: '0.85rem', marginTop: '0.75rem' }}>{errors.income_sources}</p>}
        </div>
      )}

      {step === 3 && (
        <div className="fade-in">
          <h2 className="font-heading" style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>Which deductions or expenses apply?</h2>
          <p style={{ color: 'var(--color-body-text)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>Select all that apply. Selecting "No special deductions" clears other selections.</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {DEDUCTION_OPTIONS.map((opt) => (
              <CheckboxOption
                key={opt.value}
                value={opt.value}
                label={opt.label}
                checked={state.deductions.includes(opt.value)}
                onChange={() => { toggleMulti('deductions', opt.value); setErrors({}); }}
              />
            ))}
          </div>
          {state.deductions.length === 0 && (
            <p style={{ color: '#64748b', fontSize: '0.8rem', marginTop: '0.75rem', fontStyle: 'italic' }}>
              Tip: If none apply, select "No special deductions" or leave blank to continue.
            </p>
          )}
        </div>
      )}

      {step === 4 && (
        <div className="fade-in">
          <h2 className="font-heading" style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>How much help do you want?</h2>
          <p style={{ color: 'var(--color-body-text)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>Choose your preferred level of support.</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
            {[
              { value: 'file_myself', label: 'I want to file myself' },
              { value: 'expert_help_while_filing', label: 'I want expert help while filing' },
              { value: 'expert_file_for_me', label: 'I want an expert to file for me' },
            ].map((opt) => (
              <RadioOption
                key={opt.value}
                name="help_preference"
                option={opt}
                selected={state.help_preference}
                onSelect={(value) => { setState((s) => ({ ...s, help_preference: value })); setErrors({}); }}
              />
            ))}
          </div>
          {errors.help_preference && <p style={{ color: '#dc2626', fontSize: '0.85rem', marginTop: '0.75rem' }}>{errors.help_preference}</p>}
        </div>
      )}

      {step === 5 && (
        <div className="fade-in">
          <h2 className="font-heading" style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>Did the company have revenue?</h2>
          <p style={{ color: 'var(--color-body-text)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>This determines the correct corporate filing product.</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
            {[
              { value: 'yes', label: 'Yes, the company had revenue' },
              { value: 'no', label: 'No, the company had no revenue' },
            ].map((opt) => (
              <RadioOption
                key={opt.value}
                name="company_revenue"
                option={opt}
                selected={state.company_revenue}
                onSelect={(value) => { setState((s) => ({ ...s, company_revenue: value })); setErrors({}); }}
              />
            ))}
          </div>
          {errors.company_revenue && <p style={{ color: '#dc2626', fontSize: '0.85rem', marginTop: '0.75rem' }}>{errors.company_revenue}</p>}
        </div>
      )}

      {errors.submit && (
        <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '0.5rem', padding: '0.875rem', marginTop: '1rem' }}>
          <p style={{ color: '#b91c1c', fontSize: '0.875rem', margin: 0 }}>{errors.submit}</p>
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2rem', paddingTop: '1.25rem', borderTop: '1px solid #f1f5f9' }}>
        <button
          onClick={back}
          className="btn-outline"
          disabled={currentStep === 1}
          style={{ visibility: currentStep === 1 ? 'hidden' : 'visible' }}
        >
          Back
        </button>
        <button
          onClick={next}
          className="btn-primary"
          disabled={loading}
          style={{ minWidth: '140px' }}
        >
          {loading ? <span className="loading-spinner" style={{ width: '1rem', height: '1rem' }} /> :
            (currentStep === totalSteps ? 'Get My Recommendation' : 'Next')}
        </button>
      </div>
    </div>
  );
}
