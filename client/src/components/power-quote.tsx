export default function PowerQuote() {
  return (
    <section className="min-h-[70vh] flex items-center justify-center bg-[#171719] px-10 py-16">
      <div className="max-w-4xl text-center">
        <h2 className="text-[clamp(2.2rem,5vw,4rem)] leading-tight text-[#F1F1F1] mb-8 font-light tracking-[-0.01em]" style={{ fontFamily: 'Times New Roman, serif', fontWeight: 300 }}>
          I didn&apos;t need a full plan.<br />
          I needed one brave post.<br />
          One real story.<br />
          One step back to myself.
        </h2>
        <p 
          className="text-[11px] tracking-[0.4em] uppercase text-[#F1F1F1]/60 font-light"
          style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
        >
          Sandra Sigurjonsdottir
        </p>
      </div>
    </section>
  );
}