'use client';

export default function Header() {
  return (
    <header className="aura-header">
      <div className="aura-badge">
        <span className="pulsing-dot"></span>
        <span>AURA CEP PRO • VIA CEP ONLINE</span>
      </div>
      <h1 className="aura-title">Busca de CEP</h1>
      <p className="aura-subtitle">
        Localize logradouros, bairros, cidades e UFs em todo o Brasil com precisão em tempo real.
      </p>
    </header>
  );
}