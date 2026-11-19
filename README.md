# Face Analyzer — PES 2021

Site independente para enviar fotos de um rosto e receber um relatório de características visíveis, organizado para ajudar na reprodução manual no editor do PES 2021.

## Requisitos
- Node.js 20 ou superior
- Uma chave da API da OpenAI
- Um modelo habilitado na sua conta que aceite imagens pela Responses API

## Configuração local
1. Extraia o ZIP.
2. Abra um terminal dentro da pasta `face-analyzer-pes`.
3. Execute `npm install`.
4. Copie `.env.example` para `.env`.
5. Preencha `OPENAI_API_KEY` e `OPENAI_MODEL` no `.env`.
6. Execute `npm start`.
7. Acesse `http://localhost:3000`.

A chave fica no servidor e não é enviada ao navegador. Não publique o arquivo `.env`.

## Como usar
- Envie pelo menos uma foto frontal.
- Opcionalmente, envie uma foto lateral e uma de três quartos.
- Clique em **Analisar rosto**.
- Leia ou copie o relatório.

## Observações
- O projeto não identifica a pessoa. Analisa apenas características físicas visíveis.
- Uma única foto não permite avaliar com segurança profundidade e projeção; o relatório deve apontar essas limitações.
- A análise é uma estimativa visual, não uma medição biométrica precisa.
- Para disponibilizar o site na internet, hospede o servidor Node em um serviço compatível com variáveis de ambiente e configure HTTPS.
- O uso da API pode gerar custos conforme modelo e imagens enviados. Consulte a documentação oficial de imagens: https://developers.openai.com/api/docs/guides/images-vision
