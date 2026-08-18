export function Testimonials() {
  return (
    <section className="bg-sand py-16">
      <div className="container-app">
        <h2 className="text-center font-display text-2xl text-charcoal">
          O que dizem sobre nós
        </h2>
        {/*
          PLACEHOLDER — secção pronta a preencher com testemunhos reais de
          clientes (nome + citação). Sem avaliações reais ainda, por isso
          mostramos espaços reservados em vez de inventar conteúdo.
        */}
        <div className="mt-10 grid gap-6 sm:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="rounded-lg border border-dashed border-line bg-cream p-6 text-center"
            >
              <p className="text-sm text-stone/70">
                Espaço reservado para um testemunho real de cliente.
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
