import Link from 'next/link';
import PrimaryButton from '../components/PrimaryButton';
import WaitlistForm from '../components/WaitlistForm';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-sand">
      <section className="max-w-5xl mx-auto px-6 py-16">
        <div className="grid gap-10 md:grid-cols-2 items-center">
          <div>
            <p className="text-teal uppercase tracking-wide text-sm">Serenity AI</p>
            <h1 className="text-4xl md:text-5xl font-semibold text-navy mt-3">
              Your AI Meditation Guide
            </h1>
            <p className="text-lg text-slate-700 mt-4">
              Tell us what is weighing on you. We generate a guided meditation tailored to your
              moment, in minutes.
            </p>
            <div className="mt-6 flex gap-3">
              <Link href="/signup">
                <PrimaryButton>Start free</PrimaryButton>
              </Link>
              <Link href="/login" className="px-4 py-2 rounded-md border border-slate-300">
                Log in
              </Link>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-8 shadow-sm">
            <h2 className="text-xl font-semibold text-navy">How it works</h2>
            <ol className="mt-4 space-y-3 text-slate-700">
              <li>1. Share what is on your mind.</li>
              <li>2. We craft a calming, personalized script.</li>
              <li>3. Listen and reset in 10–30 minutes.</li>
            </ol>
          </div>
        </div>
        <div className="mt-16 bg-white rounded-2xl p-8 shadow-sm">
          <h2 className="text-xl font-semibold text-navy">Join the waitlist</h2>
          <p className="text-slate-600 mt-2">
            Get early access updates and new feature drops.
          </p>
          <WaitlistForm />
        </div>
      </section>
    </main>
  );
}
