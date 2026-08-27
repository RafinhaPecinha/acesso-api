'use client';

import { useState } from "react";
import Header from "../components/header";

const QUICK_SAMPLES = [
  { label: "São Paulo - Sé", cep: "01001-000" },
  { label: "Rio - Copacabana", cep: "22041-001" },
  { label: "Brasília - Esplanada", cep: "70040-010" },
  { label: "Salvador - Pelourinho", cep: "40020-000" },
];

export default function BuscarCep() {
    const [cep, setCep] = useState('');
    const [endereco, setEndereco] = useState(null);
    const [loading, setLoading] = useState(false);
    const [erro, setErro] = useState('');
    const [copiado, setCopiado] = useState(false);

    // Auto-formata a digitação como 00000-000
    const handleChange = (e) => {
        const raw = e.target.value.replace(/\D/g, '').slice(0, 8);
        if (raw.length > 5) {
            setCep(`${raw.slice(0, 5)}-${raw.slice(5)}`);
        } else {
            setCep(raw);
        }
        if (erro) setErro('');
    };

    const search = async (cepTarget) => {
        const valorOriginal = cepTarget !== undefined ? cepTarget : cep;
        const cleanedCep = valorOriginal.replace(/\D/g, '');
        
        if (cleanedCep.length !== 8) {
            setErro('Por favor, informe um CEP válido com 8 dígitos.');
            setEndereco(null);
            return;
        }

        setLoading(true);
        setErro('');
        setEndereco(null);
        setCopiado(false);

        try {
            // Tenta via rota interna /api/cep e se falhar vai direto ao ViaCEP
            let resposta = await fetch(`/api/cep?cep=${cleanedCep}`);
            if (!resposta.ok) {
                resposta = await fetch(`https://viacep.com.br/ws/${cleanedCep}/json/`);
            }

            const dados = await resposta.json();

            if (dados.erro === true || dados.erro === "true") {
                setErro('CEP não encontrado. Verifique o número e tente novamente.');
            } else {
                setEndereco(dados);
            }
        } catch (e) {
            console.error('Erro na busca:', e);
            setErro('Erro ao se conectar com o serviço de CEP.');
        } finally {
            setLoading(false);
        }
    };

    const handleQuickClick = (sampleCep) => {
        setCep(sampleCep);
        search(sampleCep);
    };

    const copyAddress = () => {
        if (!endereco) return;
        const texto = `${endereco.logradouro || ''}${endereco.bairro ? ', ' + endereco.bairro : ''} - ${endereco.localidade}/${endereco.uf} (CEP: ${endereco.cep})`;
        navigator.clipboard.writeText(texto);
        setCopiado(true);
        setTimeout(() => setCopiado(false), 2000);
    };

    const openMaps = () => {
        if (!endereco) return;
        const query = `${endereco.logradouro || ''}, ${endereco.bairro || ''}, ${endereco.localidade} - ${endereco.uf}`;
        window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`, '_blank');
    };

    return (
        <main className="aura-wrapper">
            <div className="aura-card-border">
                <div className="aura-card">
                    <Header />

                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            search();
                        }}
                        className="aura-search-box"
                    >
                        <div className="aura-input-wrapper">
                            <input
                                type="text"
                                value={cep}
                                onChange={handleChange}
                                placeholder="Digite o CEP (ex: 01001-000)"
                                maxLength={9}
                                className="aura-input"
                                autoFocus
                            />
                            <span className="aura-input-glow"></span>
                        </div>

                        <button type="submit" className="aura-button" disabled={loading}>
                            {loading ? <span className="aura-spinner"></span> : (
                                <>
                                    <span>Buscar</span>
                                    <span className="btn-glow"></span>
                                </>
                            )}
                        </button>
                    </form>

                    <div className="aura-samples">
                        <span className="samples-title">⚡ Testar rápido:</span>
                        <div className="samples-chips">
                            {QUICK_SAMPLES.map((s) => (
                                <button
                                    key={s.cep}
                                    type="button"
                                    className="aura-chip"
                                    onClick={() => handleQuickClick(s.cep)}
                                >
                                    {s.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {erro && (
                        <div className="aura-error-box">
                            <span className="error-icon">⚠️</span>
                            <span>{erro}</span>
                        </div>
                    )}

                    {endereco && (
                        <div className="aura-result-box">
                            <div className="aura-result-header">
                                <div className="location-title">
                                    <h2>{endereco.localidade}</h2>
                                    <span className="aura-uf-badge">{endereco.uf}</span>
                                </div>
                                <span className="aura-cep-badge">📍 {endereco.cep}</span>
                            </div>

                            <div className="aura-result-grid">
                                <div className="aura-info-card full-width">
                                    <span className="aura-info-label">LOGRADOURO / RUA</span>
                                    <span className="aura-info-value">{endereco.logradouro || 'Geral / Área rural'}</span>
                                </div>
                                <div className="aura-info-card">
                                    <span className="aura-info-label">BAIRRO</span>
                                    <span className="aura-info-value">{endereco.bairro || 'Geral / Centro'}</span>
                                </div>
                                <div className="aura-info-card">
                                    <span className="aura-info-label">CIDADE</span>
                                    <span className="aura-info-value">{endereco.localidade}</span>
                                </div>
                                <div className="aura-info-card">
                                    <span className="aura-info-label">ESTADO (UF)</span>
                                    <span className="aura-info-value">{endereco.uf}</span>
                                </div>
                                {endereco.ddd && (
                                    <div className="aura-info-card">
                                        <span className="aura-info-label">DDD</span>
                                        <span className="aura-info-value">({endereco.ddd})</span>
                                    </div>
                                )}
                            </div>

                            <div className="aura-actions">
                                <button
                                    type="button"
                                    className={`aura-action-btn ${copiado ? 'copied' : ''}`}
                                    onClick={copyAddress}
                                >
                                    {copiado ? '✓ Copiado!' : '📋 Copiar Endereço'}
                                </button>
                                <button type="button" className="aura-action-btn" onClick={openMaps}>
                                    🗺️ Ver no Google Maps
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
}