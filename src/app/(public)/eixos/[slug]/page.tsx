import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ChevronRight } from "lucide-react";
import { OrbitalLogo } from "@/components/brand/orbital-logo";

const pages = {
  "modelo-de-ensino": {
    title: "Modelo de Ensino",
    subtitle: "Aprendizagem progressiva para transformar teoria em produção científica.",
    description:
      "O modelo de ensino do E-AIMS organiza o aprendizado em etapas claras, combinando conteúdo objetivo, materiais de apoio e aplicação prática em projetos reais de revisão sistemática e meta-análise.",
    sections: [
      {
        title: "Videoaulas e apostilas",
        text: "Conteúdos objetivos para introduzir conceitos essenciais, padronizar a linguagem científica e facilitar a revisão dos temas ao longo do curso."
      },
      {
        title: "Trilhas por módulos",
        text: "Percurso organizado para que o aluno avance de forma progressiva, entendendo cada etapa antes de seguir para decisões metodológicas mais complexas."
      },
      {
        title: "Aplicação em projetos reais",
        text: "O aprendizado é conectado ao desenvolvimento de projetos em andamento, aproximando o aluno da rotina de produção científica."
      },
      {
        title: "Autonomia progressiva",
        text: "A proposta é capacitar o estudante para reconhecer problemas, tomar decisões fundamentadas e conduzir seus próprios projetos com segurança."
      }
    ],
    detail: {
      subtitle: "Do aprendizado à autonomia científica",
      paragraphs: [
        "O modelo de ensino do E-AIMS combina formação teórica, aprendizagem prática progressiva e acompanhamento por monitoria. A proposta é que o aluno aprenda o delineamento de revisões sistemáticas e meta-análises não apenas por meio de videoaulas e materiais complementares, mas principalmente pela participação ativa em projetos reais de pesquisa.",
        "A formação teórica é organizada em módulos sequenciais, que apresentam os principais fundamentos metodológicos de uma revisão sistemática: formulação da pergunta de pesquisa, construção do PICO, elaboração da estratégia de busca, triagem dos estudos, extração de dados, avaliação de risco de viés, síntese dos resultados, meta-análise e interpretação crítica dos achados.",
        "Paralelamente, o E-AIMS utiliza um modelo prático baseado em progressão por etapas. Os monitores atuam como gestores e primeiros autores dos projetos de pesquisa em andamento. Novos alunos ingressam nesses projetos inicialmente em etapas mais simples, sob orientação direta do monitor responsável. Ao repetir a mesma etapa algumas vezes, o aluno desenvolve familiaridade, segurança e domínio técnico sobre aquela parte do processo.",
        "À medida que demonstra autonomia, responsabilidade e compreensão metodológica, o aluno passa progressivamente para etapas mais complexas da revisão sistemática. Dessa forma, sua formação ocorre de maneira gradual, estruturada e aplicada, respeitando a complexidade crescente de cada fase do projeto científico.",
        "O monitor é responsável por acompanhar o novo aluno durante a execução das atividades, esclarecer dúvidas, revisar entregas, orientar correções e cobrar o cumprimento dos prazos estabelecidos. Além de conduzir o projeto, o monitor exerce uma função formativa, garantindo que o aluno compreenda a lógica metodológica por trás de cada etapa, e não apenas execute tarefas de forma operacional.",
        "Ao completar a participação em todas as etapas de uma revisão sistemática, o aluno passa a estar apto a assumir maior autonomia dentro do E-AIMS e, futuramente, tornar-se monitor. Assim, o modelo cria um ciclo contínuo de formação: alunos iniciantes são treinados por monitores experientes e, com o tempo, tornam-se capazes de liderar novos projetos e formar outros alunos.",
        "Esse formato permite que o E-AIMS desenvolva uma comunidade científica sustentável, em que o conhecimento é transmitido de forma prática, supervisionada e progressiva. O objetivo final é formar alunos capazes de compreender, executar e liderar revisões sistemáticas e meta-análises com rigor metodológico, responsabilidade científica e integração institucional."
      ]
    }
  },
  "sistema-de-monitoria": {
    title: "Sistema de Monitoria",
    subtitle: "Acompanhamento próximo sem retirar a autonomia do estudante.",
    description:
      "O sistema de monitoria do E-AIMS oferece suporte durante as etapas do projeto, conectando alunos, monitores, pesquisadores e docentes em um fluxo de orientação mais claro e acessível.",
    sections: [
      {
        title: "Acompanhamento contínuo",
        text: "Os monitores ajudam o aluno a navegar pelas etapas do projeto, revisar dúvidas frequentes e manter a evolução do trabalho organizada."
      },
      {
        title: "Suporte à tomada de decisão",
        text: "A monitoria apoia decisões metodológicas importantes, sempre estimulando que o estudante compreenda o raciocínio por trás de cada escolha."
      },
      {
        title: "Integração institucional",
        text: "Quando necessário, o aluno é direcionado aos núcleos e pesquisadores adequados dentro da estrutura institucional do Einstein."
      },
      {
        title: "Autonomia com suporte",
        text: "O objetivo não é substituir o protagonismo do estudante, mas oferecer acompanhamento para que ele se desenvolva com mais segurança."
      }
    ]
  },
  "proposito-missao-visao": {
    title: "Propósito, Missão e Visão",
    subtitle: "Os princípios que orientam a formação científica no E-AIMS.",
    description:
      "O E-AIMS foi criado para tornar mais acessível e organizado o caminho entre o interesse inicial do estudante e a realização de pesquisas científicas de alta qualidade.",
    sections: [
      {
        title: "Propósito",
        text: "Democratizar e estruturar o aprendizado em revisões sistemáticas e meta-análises na FICSAE, conectando o estudante aos recursos educacionais e institucionais disponíveis."
      },
      {
        title: "Missão",
        text: "Ensinar aos alunos, de maneira progressiva, prática e individualizada, todas as etapas do desenvolvimento de revisões sistemáticas e meta-análises."
      },
      {
        title: "Visão",
        text: "Tornar-se uma referência institucional no ensino e no desenvolvimento de revisões sistemáticas e meta-análises, formando uma comunidade científica colaborativa e rigorosa."
      },
      {
        title: "Valores",
        text: "Acessibilidade, qualidade educacional, rigor científico, colaboração, inclusão, inovação, autonomia do estudante e compromisso com a qualidade das evidências."
      }
    ]
  }
} as const;

type PageSlug = keyof typeof pages;

export function generateStaticParams() {
  return Object.keys(pages).map((slug) => ({ slug }));
}

export default async function PublicAxisPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const page = pages[slug as PageSlug];

  if (!page) {
    notFound();
  }

  return (
    <main className="min-h-screen overflow-hidden bg-[#fbf8ef] text-[#0e496d]">
      <header className="sticky top-0 z-40 border-b border-[#0e496d]/10 bg-[#fbf8ef]/92 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5">
          <Link href="/" className="text-lg font-semibold tracking-[0.18em]">
            E-AIMS
          </Link>
          <Link
            href="/login"
            className="inline-flex h-10 items-center justify-center rounded-md bg-[#0e496d] px-4 text-sm font-semibold text-white transition hover:bg-[#0b3955] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0e496d]"
          >
            Acessar plataforma
          </Link>
        </div>
      </header>

      <section className="relative px-5 py-16 md:py-24">
        <OrbitalLogo className="pointer-events-none absolute -right-40 top-16 hidden h-[560px] w-[560px] object-contain opacity-10 lg:block" />

        <div className="relative mx-auto max-w-7xl">
          <Link
            href="/#eixos"
            className="inline-flex items-center text-sm font-bold uppercase tracking-[0.14em] transition hover:opacity-70"
          >
            <ArrowLeft className="mr-2 h-4 w-4" aria-hidden />
            Voltar para estrutura
          </Link>

          <div className="mt-12 max-w-4xl">
            <p className="text-xs font-bold uppercase tracking-[0.28em]">Estrutura do E-AIMS</p>
            <h1 className="mt-4 text-5xl font-semibold uppercase tracking-[0.08em] md:text-7xl">{page.title}</h1>
            <p className="mt-7 text-2xl font-semibold leading-tight md:text-4xl">{page.subtitle}</p>
            <p className="mt-6 max-w-3xl text-lg leading-8 text-[#0e496d]/78">{page.description}</p>
          </div>
        </div>
      </section>

      <section className="px-5 pb-20">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-6 md:grid-cols-2">
            {page.sections.map((section) => (
              <article key={section.title} className="rounded-lg border border-[#0e496d]/18 bg-[#fffdf7] p-6 shadow-sm">
                <h2 className="text-xl font-bold uppercase tracking-[0.08em]">{section.title}</h2>
                <p className="mt-4 text-base leading-8 text-[#0e496d]/76">{section.text}</p>
              </article>
            ))}
          </div>
          {"detail" in page ? (
            <section className="mt-12 max-w-5xl">
              <h2 className="text-2xl font-bold uppercase tracking-[0.08em] md:text-3xl">{page.detail.subtitle}</h2>
              <div className="mt-6 space-y-5 text-base leading-8 text-[#0e496d]/78">
                {page.detail.paragraphs.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            </section>
          ) : null}
        </div>
      </section>

      <section className="bg-[#0e496d] px-5 py-14 text-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-white/70">E-AIMS</p>
            <h2 className="mt-2 text-2xl font-semibold uppercase tracking-[0.08em]">Acesse a plataforma educacional</h2>
          </div>
          <Link
            href="/login"
            className="inline-flex h-12 items-center justify-center rounded-md bg-white px-6 text-sm font-bold uppercase tracking-[0.14em] text-[#0e496d] transition hover:bg-[#fbf8ef] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            Acessar plataforma
            <ChevronRight className="ml-2 h-4 w-4" aria-hidden />
          </Link>
        </div>
      </section>
    </main>
  );
}
