# Militância São José - Gestão e Monitoramento de Campanha

Sistema completo de controle operacional de militância, distribuição de materiais por bairros e ruas de São José - SC, geolocalização GPS de campo, rotas de van, folha de pagamento semanal de diárias e relatórios.

---

## 🚀 Como Publicar na Hostinger

Existem duas formas fáceis de rodar o projeto na Hostinger:

### Opção A: Hospedagem de Site Estático (Recomendado - Mais Simples e Sem Custos de Servidor)
Como o sistema utiliza armazenamento local inteligente (LocalStorage e exportação de dados/backup), você pode publicar diretamente na hospedagem web padrão da Hostinger:

1. **Gerar a pasta de publicação (dist):**
   ```bash
   npm run build:static
   ```
2. Abra o **Gerenciador de Arquivos (File Manager)** no painel hPanel da Hostinger.
3. Acesse a pasta `public_html`.
4. Envie todo o conteúdo da pasta `dist/` (incluindo `index.html`, pasta `assets/` e o arquivo `.htaccess`) para dentro de `public_html`.
5. Pronto! O site estará online com roteamento SPA seguro e sem erro 404.

---

### Opção B: Importar via Git / Node.js no hPanel
Se você está usando o instalador Git ou o módulo Node.js da Hostinger:

1. **Certifique-se de que o `package.json` está na RAIZ do repositório no GitHub:**
   - O arquivo `package.json` deve estar localizado diretamente na raiz (`/package.json`), e **não dentro de uma subpasta** como `/militancia/package.json`.
2. No hPanel da Hostinger:
   - **Diretório raiz da aplicação:** `/` (ou deixe o padrão)
   - **Versão do Node.js:** Selecione `18.x` ou `20.x`
   - **Comando de Build:** `npm run build`
   - **Comando de Inicialização (Start):** `npm start`
