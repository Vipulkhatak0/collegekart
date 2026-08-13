import { HiOutlineAcademicCap, HiOutlineShieldCheck, HiOutlineUserGroup } from 'react-icons/hi2';

export default function About() {
  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 py-14">
      <span className="section-eyebrow">Our story</span>
      <h1 className="mt-2 font-display text-3xl font-bold">Built by a student, for students</h1>
      <p className="mt-4 text-slate-500 dark:text-slate-400">
        CollegeKart started with a simple frustration: every semester, students buy textbooks, calculators, and furniture — then leave them behind when they graduate or move out, while the next batch of students goes and buys the exact same things brand new. That's a lot of value going to waste.
      </p>
      <p className="mt-4 text-slate-500 dark:text-slate-400">
        I built CollegeKart as a single student developer to fix that — a marketplace where that value stays on campus, passed from one student to the next, with verified accounts and simple in-app chat so buying and selling feels safe rather than sketchy.
      </p>
      <p className="mt-4 text-slate-500 dark:text-slate-400">
        Beyond buying and selling, CollegeKart also covers a few other things students actually need: a place to share and download class notes, a way to post or pick up small freelance gigs like tutoring and design work, and a service-request board where you can post a task and let other students bid on it.
      </p>
      <p className="mt-4 text-slate-500 dark:text-slate-400">
        It's still actively growing, and being built by one person means I hear directly from users — if something's broken, confusing, or missing, reach out through the Contact page and it goes straight to me.
      </p>

      <div className="mt-10 grid gap-6 sm:grid-cols-3">
        {[
          { icon: HiOutlineAcademicCap, title: 'Campus First', desc: 'Every feature is designed around how students actually buy and sell.' },
          { icon: HiOutlineShieldCheck, title: 'Trust & Safety', desc: 'Verified student emails and seller ratings keep the community safe.' },
          { icon: HiOutlineUserGroup, title: 'Community Driven', desc: 'Built and shaped directly by feedback from the students who use it.' }
        ].map((f, i) => (
          <div key={i} className="glass-card p-5">
            <f.icon className="h-6 w-6 text-primary-500" />
            <h3 className="mt-3 font-semibold">{f.title}</h3>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{f.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}