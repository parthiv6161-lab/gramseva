function Mark({ small = false }) {
  return <span className={`inline-flex items-center justify-center rounded-xl bg-[#e6f0e5] text-[#34734e] ${small ? 'h-9 w-9' : 'h-11 w-11'}`} aria-hidden="true"><svg viewBox="0 0 32 32" className="h-7 w-7" fill="none"><path d="M5 25h22M8 24V13l8-6 8 6v11M12 24v-7h8v7M4 13l12-8 12 8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/><path d="M12 11h.01M20 11h.01" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/></svg></span>;
}

export default function Home() {
  return <main className="min-h-screen overflow-hidden">
    <section id="home" className="relative flex min-h-[100svh] flex-col overflow-hidden bg-[#0e241b]">
      <img src="/hero-village.jpg" alt="" aria-hidden="true" className="pointer-events-none absolute inset-0 h-full w-full object-cover object-center opacity-45" />
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#06170f]/55 via-[#06170f]/15 to-[#06170f]/55" />
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_35%,rgba(6,23,15,0.3)_100%)]" />

      <header className="relative z-20 mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between gap-y-3 px-5 py-5 sm:px-8 lg:px-12">
        <a href="#home" className="flex items-center gap-3" aria-label="GRAMASEVA home"><Mark/><span><span className="block text-[17px] font-extrabold tracking-[.12em] text-white">GRAMASEVA</span><span className="block text-[10px] tracking-wide text-white/60">A better village, together</span></span></a>
        <nav className="flex w-full flex-wrap items-center justify-center gap-1.5 rounded-full border border-white/15 bg-[#0e241b]/30 p-1.5 text-[11px] font-semibold text-white/75 backdrop-blur-sm sm:w-auto sm:gap-1 sm:text-[12px]">
          <a href="#home" aria-current="page" className="rounded-full bg-white/15 px-3 py-2 text-white ring-1 ring-white/20 transition sm:px-4">Home</a>
          <a href="/report" className="rounded-full px-3 py-2 transition hover:bg-white/10 hover:text-white sm:px-4">Report an Issue</a>
          <a href="/track" className="rounded-full px-3 py-2 transition hover:bg-white/10 hover:text-white sm:px-4">Track Complaint</a>
          <a href="/about" className="rounded-full px-3 py-2 transition hover:bg-white/10 hover:text-white sm:px-4">About</a>
          <a href="/admin/login" className="rounded-full px-3 py-2 transition hover:bg-white/10 hover:text-white sm:px-4">Admin</a>
        </nav>
      </header>

      <div className="relative z-20 mx-auto flex w-full max-w-4xl flex-1 flex-col items-center justify-center px-5 pb-20 pt-10 text-center sm:px-8 sm:pb-24">
        <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-3.5 py-2 text-[11px] font-semibold tracking-wide text-white/85 backdrop-blur-sm"><span className="h-2 w-2 rounded-full bg-[#9ad19f]"></span>YOUR VOICE. YOUR VILLAGE.</div>
        <h1 className="serif max-w-[900px] text-[46px] leading-[1.06] tracking-[-.04em] text-white drop-shadow-[0_4px_24px_rgba(0,0,0,.35)] sm:text-[64px] lg:text-[78px]">A better village<br/>starts with <span className="italic text-[#c2e0c4]">being heard.</span></h1>
        <p className="mt-6 max-w-[540px] text-[15px] leading-7 text-white/80 sm:text-[16px]">GRAMASEVA makes it easy to bring local concerns to light. Share an issue in your community and help the people responsible take action.</p>
        <div className="mt-9 flex flex-wrap items-center justify-center gap-5"><a href="/report" className="inline-flex items-center gap-3 rounded-full bg-[#285f43] px-7 py-4 text-[14px] font-semibold text-white shadow-[0_10px_30px_rgba(0,0,0,.35)] ring-1 ring-white/25 transition hover:-translate-y-0.5 hover:bg-[#34734e]">Register a complaint <span className="text-lg">→</span></a><span className="text-[12px] text-white/65">Takes just a few minutes</span></div>
                <div className="mt-12 flex items-center justify-center gap-4 border-t border-white/15 pt-6"><div className="flex -space-x-2"><img src="/avatar-1.jpg" alt="" className="h-8 w-8 rounded-full border-2 border-[#0e241b] bg-[#dfe9d9] object-cover" /><img src="/avatar-2.jpg" alt="" className="h-8 w-8 rounded-full border-2 border-[#0e241b] bg-[#f1e3d1] object-cover" /><img src="/avatar-3.jpg" alt="" className="h-8 w-8 rounded-full border-2 border-[#0e241b] bg-[#e7dfec] object-cover" /></div><p className="text-[12px] text-white/65">Built for every voice in every village</p></div>
      </div>
    </section>

    <section id="how-it-works" className="border-y border-[#e9eae4] bg-[#f4f5ef] py-12"><div className="mx-auto grid max-w-7xl gap-8 px-5 sm:grid-cols-3 sm:px-8 lg:px-12"><div className="flex items-start gap-4"><span className="serif text-2xl text-[#85a582]">01</span><div><h2 className="text-sm font-semibold">Tell us what’s happening</h2><p className="mt-1 text-xs leading-5 text-[#7b887f]">Share the details of an issue in your village.</p></div></div><div className="flex items-start gap-4"><span className="serif text-2xl text-[#85a582]">02</span><div><h2 className="text-sm font-semibold">We’ll keep a record</h2><p className="mt-1 text-xs leading-5 text-[#7b887f]">Your complaint receives a unique reference ID.</p></div></div><div className="flex items-start gap-4"><span className="serif text-2xl text-[#85a582]">03</span><div><h2 className="text-sm font-semibold">Help make change</h2><p className="mt-1 text-xs leading-5 text-[#7b887f]">Clear information helps your community move forward.</p></div></div></div></section>

    <section id="about" className="bg-[#244b38] px-5 py-12 text-center text-white sm:px-8"><p className="serif text-2xl italic">“A community grows stronger when every voice counts.”</p><p className="mt-3 text-[11px] tracking-[.12em] text-[#c4d5c6]">GRAMASEVA · TOGETHER FOR OUR VILLAGES</p></section>
    <footer className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-5 py-6 text-[11px] text-[#8b968e] sm:flex-row sm:px-8 lg:px-12"><a href="#home" className="flex items-center gap-2"><Mark small/><span className="font-bold tracking-[.12em] text-[#45614e]">GRAMASEVA</span></a><p>Made with care for stronger rural communities.</p><a href="/report" className="transition hover:text-[#34734e]">Register a complaint ↑</a></footer>
  </main>;
}
