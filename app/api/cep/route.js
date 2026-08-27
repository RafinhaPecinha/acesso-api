export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const cep = searchParams.get('cep');

  if (!cep) {
    return Response.json({ erro: true, mensagem: 'CEP não informado.' }, { status: 400 });
  }

  const cleaned = cep.replace(/\D/g, '');

  if (cleaned.length !== 8) {
    return Response.json({ erro: true, mensagem: 'CEP inválido.' }, { status: 400 });
  }

  try {
    // Tenta primeiro com HTTPS
    let res = await fetch(`https://viacep.com.br/ws/${cleaned}/json/`, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
      cache: 'no-store'
    });

    if (!res.ok) {
      // Fallback para HTTP caso haja algum bloqueio no servidor
      res = await fetch(`http://viacep.com.br/ws/${cleaned}/json/`, { cache: 'no-store' });
    }

    const data = await res.json();
    return Response.json(data);
  } catch (error) {
    console.error('Erro na API route proxy de CEP:', error);
    try {
      const httpRes = await fetch(`http://viacep.com.br/ws/${cleaned}/json/`, { cache: 'no-store' });
      const data = await httpRes.json();
      return Response.json(data);
    } catch (fallbackError) {
      return Response.json(
        { erro: true, mensagem: 'Não foi possível se conectar ao ViaCEP.' },
        { status: 500 }
      );
    }
  }
}
