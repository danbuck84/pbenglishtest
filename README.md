# 📝 PB English Level Test

Aplicação web para **Teste de Nivelamento de Inglês** usada em eventos comunitários da igreja.

## Tecnologias

- **Frontend:** React (Vite) + Tailwind CSS
- **Backend/Database:** Firebase Firestore (sincronização em tempo real)
- **IA:** Google Gemini API (avaliação de respostas e plano de estudos)
- **Hospedagem:** Netlify

## Arquitetura

| Rota | Descrição |
|------|-----------|
| `/` | Página inicial com links para Admin e Display |
| `/admin` | Painel do administrador — registrar candidato, ler perguntas, inserir respostas |
| `/display` | Tela de exibição — monitor externo voltado para o candidato |
| `/plan/:id` | Plano de estudos personalizado (acessível via QR Code) |

## Configuração Local

```bash
# 1. Instalar dependências
npm install

# 2. Copiar e preencher variáveis de ambiente
cp .env.example .env
# Editar .env com suas chaves Firebase e Gemini

# 3. Rodar em desenvolvimento
npm run dev
```

## Deploy no Netlify

1. Conecte o repositório GitHub ao Netlify.
2. Configure as variáveis de ambiente no painel do Netlify (**Site Settings → Environment Variables**):
   - `VITE_FIREBASE_API_KEY`
   - `VITE_FIREBASE_AUTH_DOMAIN`
   - `VITE_FIREBASE_PROJECT_ID`
   - `VITE_FIREBASE_STORAGE_BUCKET`
   - `VITE_FIREBASE_MESSAGING_SENDER_ID`
   - `VITE_FIREBASE_APP_ID`
   - `VITE_FIREBASE_MEASUREMENT_ID`
   - `VITE_GEMINI_API_KEY`
3. O deploy é automático a cada push na branch principal.

## Firebase Setup

Certifique-se de que o **Cloud Firestore** está habilitado no console Firebase em modo de teste.
