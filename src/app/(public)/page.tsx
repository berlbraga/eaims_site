import Link from "next/link";
import { ChevronRight, GraduationCap, Microscope, UsersRound } from "lucide-react";
import { OrbitalLogo } from "@/components/brand/orbital-logo";

const organizationMembers = [
  { name: "Luiz Eduardo Ceccon", role: "Fundador e corpo organizador" },
  { name: "Bernardo Loureiro Braga Araujo", role: "Fundador e corpo organizador" },
  { name: "Lucca Miguel Duda Tavares", role: "Fundador e corpo organizador" },
  { name: "Luiz Berthier Jacomino", role: "Corpo organizador" },
  { name: "Amanda Markovna Falcone Rozhanskiy", role: "Corpo organizador" }
];

const featureCards = [
  {
    title: "Modelo de Ensino",
    icon: GraduationCap,
    href: "/eixos/modelo-de-ensino",
    description:
      "Aprendizagem progressiva com videoaulas, apostilas, materiais de apoio e aplicação prática em projetos reais de revisão sistemática e meta-análise.",
  },
  {
    title: "Sistema de Monitoria",
    icon: UsersRound,
    href: "/eixos/sistema-de-monitoria",
    description:
      "Acompanhamento por monitores, pesquisadores e docentes para orientar o aluno ao longo das etapas do projeto, preservando sua autonomia.",
  },
  {
    title: "Propósito, Missão e Visão",
    icon: Microscope,
    href: "/eixos/proposito-missao-visao",
    description:
      "Um programa criado para tornar o caminho da produção científica mais acessível, organizado, rigoroso e conectado à estrutura institucional da FICSAE.",
  }
];

const faqs = [
  {
    question: "Quem pode participar?",
    answer: "Alunos, médicos e residentes com e-mail institucional autorizado do Einstein Hospital Israelita."
  },
  {
    question: "Quanto custa?",
    answer: "O curso é gratuito para profissionais e alunos do Einstein com acesso institucional autorizado."
  },
  {
    question: "Terei ao menos uma publicação ao final do curso?",
    answer:
      "O E-AIMS tem como objetivo inserir os alunos nas etapas de produção de projetos de revisão sistemática e meta-análise em andamento, com potencial posterior de apresentação em congressos e publicação em revistas científicas. A participação na autoria dependerá da contribuição efetiva do aluno no desenvolvimento do projeto, conforme os critérios de autoria aplicáveis."
  }
];

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("");
}

export default function InstitutionalHomePage() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#fbf8ef] text-[#0e496d]">
      <header className="sticky top-0 z-40 border-b border-[#0e496d]/10 bg-[#fbf8ef]/92 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5">
          <Link href="/" className="text-lg font-semibold tracking-[0.18em]">
            E-AIMS
          </Link>
          <nav className="hidden items-center gap-7 text-xs font-semibold uppercase tracking-[0.16em] md:flex">
            <a href="#eixos" className="hover:opacity-70">Eixos</a>
            <a href="#organizacao" className="hover:opacity-70">Organização</a>
            <a href="#faq" className="hover:opacity-70">FAQ</a>
          </nav>
          <Link
            href="/login"
            className="inline-flex h-10 items-center justify-center rounded-md bg-[#0e496d] px-4 text-sm font-semibold text-white transition hover:bg-[#0b3955] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0e496d]"
          >
            Acessar plataforma
          </Link>
        </div>
      </header>

      <section id="quem-somos" className="relative min-h-[calc(100vh-4rem)]">
        <OrbitalLogo priority className="pointer-events-none absolute -right-44 top-2 hidden h-[760px] w-[760px] object-contain lg:block" />
        <OrbitalLogo className="pointer-events-none absolute -right-32 top-12 h-[430px] w-[430px] object-contain opacity-10 lg:hidden" />

        <div className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-7xl items-center gap-10 px-5 py-16 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="max-w-3xl">
            <h1 className="text-6xl font-normal uppercase tracking-[0.14em] sm:text-7xl lg:text-8xl">
              E-AIMS
            </h1>
            <p className="mt-5 max-w-xl text-sm font-semibold uppercase tracking-[0.18em]">
              Einstein Academic Initiative for Meta-analysis and Systematic Reviews
            </p>
            <p className="mt-10 text-3xl font-semibold leading-tight sm:text-5xl">
              Feito para estudantes. Criado por estudantes.
            </p>
            <p className="mt-7 max-w-2xl text-lg leading-8 text-[#0e496d]/82">
              Uma iniciativa acadêmica da FICSAE criada para tornar o aprendizado em revisões sistemáticas e meta-análises mais acessível, estruturado e conectado à prática científica.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/login"
                className="inline-flex h-12 items-center justify-center rounded-md bg-[#0e496d] px-6 text-sm font-bold uppercase tracking-[0.14em] text-white transition hover:bg-[#0b3955] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0e496d]"
              >
                Acessar plataforma
              </Link>
              <a
                href="#eixos"
                className="inline-flex h-12 items-center justify-center rounded-md border border-[#0e496d] px-6 text-sm font-bold uppercase tracking-[0.14em] transition hover:bg-[#0e496d] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0e496d]"
              >
                Conheça o E-AIMS
              </a>
            </div>
            <p className="mt-5 max-w-xl text-sm leading-6 text-[#0e496d]/70">
              O acesso à plataforma é realizado por e-mail institucional autorizado.
            </p>
          </div>
        </div>
      </section>

      <section id="eixos" className="px-5 py-20">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10">
            <h2 className="text-4xl font-semibold uppercase tracking-[0.08em] md:text-5xl">Estrutura do E-AIMS</h2>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {featureCards.map((card) => (
              <article
                key={card.title}
                className="overflow-hidden rounded-lg border border-[#0e496d]/18 bg-[#fffdf7] shadow-sm"
              >
                <div className="relative flex h-44 items-end overflow-hidden bg-[#0e496d] p-6 text-white">
                  <OrbitalLogo variant="white" className="absolute -right-16 -top-24 h-72 w-72 object-contain opacity-[0.14]" />
                  <card.icon className="relative h-9 w-9" aria-hidden />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold uppercase tracking-[0.08em]">{card.title}</h3>
                  <p className="mt-4 min-h-32 text-sm leading-7 text-[#0e496d]/76">{card.description}</p>
                  <Link
                    href={card.href}
                    className="mt-5 inline-flex h-10 items-center justify-center rounded-md border border-[#0e496d] px-4 text-xs font-bold uppercase tracking-[0.14em] transition hover:bg-[#0e496d] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0e496d]"
                  >
                    Saiba mais
                    <ChevronRight className="ml-2 h-4 w-4" aria-hidden />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="organizacao" className="bg-[#fffdf7] px-5 py-20">
        <div className="mx-auto max-w-7xl">
          <h2 className="text-4xl font-semibold uppercase tracking-[0.08em] md:text-5xl">Fundadores e Corpo Organizador</h2>

          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
            {organizationMembers.map((person) => (
              <article key={person.name} className="overflow-hidden rounded-lg border border-[#0e496d]/18 bg-[#fbf8ef]">
                <div className="relative grid aspect-square place-items-center overflow-hidden bg-[#0e496d] text-white">
                  <OrbitalLogo variant="white" className="absolute -right-16 -top-20 h-60 w-60 object-contain opacity-[0.14]" />
                  <span className="relative text-3xl font-light tracking-[0.16em]">{initials(person.name)}</span>
                </div>
                <div className="p-5">
                  <p className="text-sm font-bold uppercase leading-6 tracking-[0.08em]">{person.name}</p>
                  <p className="mt-2 text-[11px] font-semibold uppercase leading-5 tracking-[0.16em] text-[#0e496d]/60">
                    {person.role}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="faq" className="px-5 py-20">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.28em]">FAQ</p>
            <h2 className="mt-3 text-4xl font-semibold uppercase tracking-[0.08em] md:text-5xl">Perguntas Frequentes</h2>
          </div>
          <div className="space-y-4">
            {faqs.map((faq) => (
              <details key={faq.question} className="group rounded-lg border border-[#0e496d]/18 bg-[#fffdf7] p-5">
                <summary className="cursor-pointer list-none text-lg font-bold uppercase tracking-[0.06em] marker:hidden">
                  <span className="flex items-center justify-between gap-5">
                    {faq.question}
                    <ChevronRight className="h-5 w-5 shrink-0 transition group-open:rotate-90" aria-hidden />
                  </span>
                </summary>
                <p className="mt-4 text-base leading-8 text-[#0e496d]/76">{faq.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-[#0e496d]/12 px-5 py-10">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 text-sm text-[#0e496d]/70 md:flex-row md:items-center md:justify-between">
          <p className="font-semibold tracking-[0.16em]">E-AIMS · FICSAE</p>
          <Link href="/login" className="font-bold uppercase tracking-[0.14em] text-[#0e496d] hover:opacity-70">
            Acessar plataforma
          </Link>
        </div>
      </footer>
    </main>
  );
}
