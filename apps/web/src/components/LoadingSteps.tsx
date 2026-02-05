'use client';

const steps = [
  'Analyzing your input...',
  'Writing your meditation...',
  'Structuring the phases...',
  'Finalizing your session...'
];

export default function LoadingSteps({ stepIndex }: { stepIndex: number }) {
  return (
    <div className="space-y-2">
      {steps.map((step, index) => (
        <div key={step} className={index <= stepIndex ? 'text-teal' : 'text-slate-400'}>
          {step}
        </div>
      ))}
    </div>
  );
}
