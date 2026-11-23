# Normatização 360º — Liz Gomes Sociedade de Advogados

Landing page de vendas (site estático) para o serviço **Normatização 360º**:
revisão da Lei Orgânica, Regimento Interno e Código de Ética para Câmaras Municipais.

## Estrutura
- `index.html` — página
- `styles.css` — estilos
- `script.js` — interações (WhatsApp, animações, carrossel, menu)
- `assets/` — imagens e logo

## Rodar localmente
É um site estático, sem build. Basta servir a pasta:

```bash
npx serve .
# ou
python3 -m http.server 8000
```

## Deploy (Vercel)
Importe este repositório na Vercel. Framework Preset: **Other**. Sem build command e sem output directory — a Vercel serve o `index.html` da raiz.
