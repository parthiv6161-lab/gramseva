import Link from 'next/link';

export const metadata = {
  title: 'About | GRAMASEVA',
  description: 'Learn about GRAMASEVA, a digital rural complaint management system connecting citizens with local authorities.',
};

function Mark({ small = false }) {
  return <span className={`inline-flex items-center justify-center rounded-xl bg-[#e6f0e5] text-[#34734e] ${small ? 'h-9 w-9' : 'h-11 w-11'}`} aria-hidden="true"><svg viewBox="0 0 32 32" className="h-7 w-7" fill="none"><path d="M5 25h22M8 24V13l8-6 8 6v11M12 24v-7h8v7M4 13l12-8 12 8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/><path d="M12 11h.01M20 11h.01" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/></svg></span>;
}

const steps = [
  { title: 'Register a Complaint', text: 'Citizens submit details of their village-related problems.' },
  { title: 'Get Complaint ID', text: 'A unique ID is generated for every complaint.' },
  { title: 'Admin Review', text: 'Administrators review and manage submitted complaints.' },
  { title: 'Status Updates', text: 'Complaints can be marked as Pending, In Progress or Resolved.' },
  { title: 'Track Complaints', text: 'Citizens can check the latest status using their Complaint ID.' },
];

export default function About() {
  return <main className="min-h-screen overflow-hidden">
    <header className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-y-3 px-5 py-5 sm:px-8 lg:px-12">
      <Link href="/" className="flex items-center gap-3" aria-label="GRAMASEVA home"><Mark/><span><span className="block text-[17px] font-extrabold tracking-[.12em] text-[#244c3b]">GRAMASEVA</span><span className="block text-[10px] tracking-wide text-[#839088]">A better village, together</span></span></Link>
      <nav className="flex w-full flex-wrap items-center justify-center gap-1.5 rounded-full border border-[#e4e9df] bg-white/60 p-1.5 text-[11px] font-semibold text-[#607168] backdrop-blur-sm sm:w-auto sm:gap-1 sm:text-[12px]">
        <Link href="/" className="rounded-full px-3 py-2 transition hover:bg-[#eef2e9] hover:text-[#34734e] sm:px-4">Home</Link>
        <Link href="/report" className="rounded-full px-3 py-2 transition hover:bg-[#eef2e9] hover:text-[#34734e] sm:px-4">Report an Issue</Link>
        <Link href="/track" className="rounded-full px-3 py-2 transition hover:bg-[#eef2e9] hover:text-[#34734e] sm:px-4">Track Complaint</Link>
        <Link href="/about" aria-current="page" className="rounded-full bg-[#285f43] px-3 py-2 text-white transition sm:px-4">About</Link>
        <Link href="/admin/login" className="rounded-full px-3 py-2 transition hover:bg-[#eef2e9] hover:text-[#34734e] sm:px-4">Admin</Link>
      </nav>
    </header>

    <section className="relative mx-auto max-w-7xl px-5 pb-16 pt-12 sm:px-8 md:pt-20 lg:px-12">
      <div className="mx-auto max-w-[820px] text-center">
        <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-[#dce8da] bg-white/70 px-3 py-2 text-[11px] font-semibold tracking-wide text-[#52745f]"><span className="h-2 w-2 rounded-full bg-[#74a875]"></span>ABOUT GRAMASEVA</div>
        <h1 className="serif text-[40px] leading-[1.1] tracking-[-.035em] text-[#1b3c30] sm:text-[56px]">Making Villages Better Through <span className="italic text-[#5c9269]">Digital Solutions</span></h1>
        <p className="mx-auto mt-6 max-w-[640px] text-[15px] leading-7 text-[#6c7a71] sm:text-[16px]">A simple, transparent platform where citizens and local authorities work together for stronger village services.</p>
      </div>

      <div className="mx-auto mt-14 grid max-w-5xl gap-6 md:grid-cols-3">
        <div className="anim-card rounded-[22px] border border-[#e9eae4] bg-white p-6 shadow-[0_16px_50px_rgba(38,66,49,.05)]"><span className="grid h-10 w-10 place-items-center rounded-full bg-[#eaf1e6] text-lg text-[#588361]">✍️</span><h3 className="mt-4 text-sm font-bold text-[#244436]">Simple Reporting</h3><p className="mt-2 text-xs leading-5 text-[#7b887f]">Submit a complaint online in just a few minutes.</p></div>
        <div className="anim-card rounded-[22px] border border-[#e9eae4] bg-white p-6 shadow-[0_16px_50px_rgba(38,66,49,.05)]"><span className="grid h-10 w-10 place-items-center rounded-full bg-[#eaf1e6] text-lg text-[#588361]">🔎</span><h3 className="mt-4 text-sm font-bold text-[#244436]">Full Transparency</h3><p className="mt-2 text-xs leading-5 text-[#7b887f]">Track your complaint status with a unique Complaint ID.</p></div>
        <div className="anim-card rounded-[22px] border border-[#e9eae4] bg-white p-6 shadow-[0_16px_50px_rgba(38,66,49,.05)]"><span className="grid h-10 w-10 place-items-center rounded-full bg-[#eaf1e6] text-lg text-[#588361]">🌱</span><h3 className="mt-4 text-sm font-bold text-[#244436]">Better Villages</h3><p className="mt-2 text-xs leading-5 text-[#7b887f]">Help build cleaner, safer and better-connected communities.</p></div>
      </div>
    </section>

    <section className="border-y border-[#e9eae4] bg-[#f4f5ef] py-16 sm:py-20">
      <div className="mx-auto grid max-w-6xl items-start gap-10 px-5 sm:px-8 lg:grid-cols-[.8fr_1.2fr] lg:gap-16 lg:px-12">
        <div className="lg:sticky lg:top-10">
          <div className="mb-5 inline-flex items-center gap-2 text-[11px] font-bold tracking-[.15em] text-[#6e9873]"><span className="h-px w-6 bg-[#6e9873]"></span>WHO WE ARE</div>
          <h2 className="serif text-[32px] leading-tight tracking-[-.03em] text-[#1b3c30] sm:text-[40px]">Connecting citizens with <span className="italic text-[#5c9269]">local authorities.</span></h2>
        </div>
        <div className="space-y-5 text-[14px] leading-7 text-[#6c7a71]">
          <p>GRAMASEVA is a digital rural complaint management system designed to connect citizens with local authorities and help improve village services. It provides a simple and transparent platform where citizens can register complaints about common village problems such as damaged roads, water supply issues, electricity problems, waste management and other public concerns.</p>
          <p>Through GRAMASEVA, citizens can submit complaints online and receive a unique Complaint ID to track their requests. The submitted complaints are stored securely in Google Sheets, while administrators can access the Admin Dashboard to review complaints, update their status and provide solutions.</p>
        </div>
      </div>
    </section>

    <section className="mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-20 lg:px-12">
      <div className="grid gap-6 md:grid-cols-2">
        <div className="anim-card rounded-[26px] border border-[#e4e9df] bg-white p-7 shadow-[0_16px_60px_rgba(38,66,49,.06)] sm:p-9">
          <div className="mb-4 inline-flex items-center gap-2 text-[11px] font-bold tracking-[.15em] text-[#6e9873]"><span className="h-px w-6 bg-[#6e9873]"></span>OUR MISSION</div>
          <h2 className="serif text-[28px] leading-tight tracking-[-.02em] text-[#1b3c30] sm:text-[32px]">Easier, faster and more transparent.</h2>
          <p className="mt-4 text-[14px] leading-7 text-[#6c7a71]">Our mission is to make rural complaint management easier, faster and more transparent by using digital technology. We aim to encourage citizen participation and support the development of cleaner, safer and better-connected villages.</p>
        </div>
        <div className="anim-card rounded-[26px] bg-[#244b38] p-7 text-white shadow-[0_16px_60px_rgba(38,66,49,.14)] sm:p-9">
          <div className="mb-4 inline-flex items-center gap-2 text-[11px] font-bold tracking-[.15em] text-[#b8d3ba]"><span className="h-px w-6 bg-[#b8d3ba]"></span>OUR VISION</div>
          <h2 className="serif text-[28px] leading-tight tracking-[-.02em] sm:text-[32px]">A digitally connected village community.</h2>
          <p className="mt-4 text-[14px] leading-7 text-[#d7e3d6]">To build a digitally connected village community where every citizen has an easy way to report public problems and contribute towards a better rural environment.</p>
        </div>
      </div>
    </section>

    <section className="border-y border-[#e9eae4] bg-[#f4f5ef] py-16 sm:py-20">
      <div className="mx-auto max-w-6xl px-5 sm:px-8 lg:px-12">
        <div className="mb-10 text-center">
          <div className="mb-4 inline-flex items-center gap-2 text-[11px] font-bold tracking-[.15em] text-[#6e9873]"><span className="h-px w-6 bg-[#6e9873]"></span>HOW IT WORKS<span className="h-px w-6 bg-[#6e9873]"></span></div>
          <h2 className="serif text-[32px] leading-tight tracking-[-.03em] text-[#1b3c30] sm:text-[40px]">From a complaint to a <span className="italic text-[#5c9269]">solution.</span></h2>
        </div>
        <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {steps.map((step, index) => (
            <li key={step.title} className="anim-card rounded-[20px] border border-[#e4e9df] bg-white p-5">
              <span className="serif text-2xl text-[#85a582]">{String(index + 1).padStart(2, '0')}</span>
              <h3 className="mt-3 text-sm font-bold text-[#244436]">{step.title}</h3>
              <p className="mt-1.5 text-xs leading-5 text-[#7b887f]">{step.text}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>

    <section className="mx-auto max-w-6xl px-5 py-16 text-center sm:px-8 sm:py-20 lg:px-12">
      <p className="serif mx-auto max-w-[720px] text-[26px] leading-snug tracking-[-.02em] text-[#1b3c30] sm:text-[34px]">GRAMASEVA – <span className="italic text-[#5c9269]">Your Voice, Your Village, Our Responsibility.</span></p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
        <Link href="/report" className="inline-flex items-center gap-3 rounded-full bg-[#285f43] px-6 py-3.5 text-[14px] font-semibold text-white shadow-[0_8px_22px_rgba(40,95,67,.18)] transition hover:-translate-y-0.5 hover:bg-[#1d4d35]">Register a complaint <span className="text-lg">→</span></Link>
        <Link href="/" className="text-[13px] font-semibold text-[#34734e] transition hover:text-[#1d4d35]">Back to home</Link>
      </div>
    </section>

    <footer className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-5 py-6 text-[11px] text-[#8b968e] sm:flex-row sm:px-8 lg:px-12"><Link href="/" className="flex items-center gap-2"><Mark small/><span className="font-bold tracking-[.12em] text-[#45614e]">GRAMASEVA</span></Link><p>Made with care for stronger rural communities.</p><Link href="/report" className="transition hover:text-[#34734e]">Register a complaint ↑</Link></footer>
  </main>;
}
