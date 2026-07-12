import { HiOutlineAcademicCap, HiOutlineShieldCheck, HiOutlineUserGroup } from 'react-icons/hi2';

export default function About() {
  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 py-14">
      <span className="section-eyebrow">Our story</span>
      <h1 className="mt-2 font-display text-3xl font-bold">Built by students, for students</h1>
      <p className="mt-4 text-slate-500 dark:text-slate-400">
        CollegeKart started with a simple frustration: every semester, students buy new textbooks, calculators, and furniture —
        then leave them behind when they move on. We built a marketplace where that value stays on campus, trusted and verified,
        student to student.
      </p>

      <div className="mt-10 grid gap-6 sm:grid-cols-3">
        {[
          { icon: HiOutlineAcademicCap, title: 'Campus First', desc: 'Every feature is designed around how students actually buy and sell.' },
          { icon: HiOutlineShieldCheck, title: 'Trust & Safety', desc: 'Verified student emails and seller ratings keep the community safe.' },
          { icon: HiOutlineUserGroup, title: 'Community Driven', desc: 'Built with feedback from real students across 40+ campuses.' }
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
