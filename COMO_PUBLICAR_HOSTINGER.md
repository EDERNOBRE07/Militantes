# 🚀 Guia de Implantação e Publicação na Hostinger (militancia.mastervisionmarketing.com)

Existem duas formas simples de colocar o sistema no ar na Hostinger:

---

## 🅰️ Método 1: Implantação Automática via GitHub (Recomendado)

Se você conectou o repositório **Militantes** na Hostinger (como na tela do hPanel):

### 1. Alterar a Versão do Node.js para 20.x ou 22.x
Nos logs de compilação da Hostinger, o motor estava configurado na versão **Node 18.x** (`v18.20.8`). Os pacotes modernos (Tailwind CSS v4, React 19, Google GenAI SDK) requerem **Node.js 20.x ou superior**.

**Como alterar no hPanel:**
1. No menu lateral do hPanel, vá em **Implantações** ou **Configurações do Aplicativo Node.js**.
2. No campo **Versão do Node**, altere de `18.x` para **`20.x`** (ou `22.x`).
3. Verifique os campos:
   - **Framework:** `Express`
   - **Diretório raiz:** `./`
   - **Comando de compilação:** `npm run build`
   - **Arquivo de inicialização:** `server.js` (ou `dist/server.cjs`)
4. Clique no botão **"Reimplantar"** (ou faça push na branch `main` do GitHub).

---

## 🅱️ Método 2: Envio Direto dos Arquivos Compilados (Pasta `dist/`)

Caso sua hospedagem na Hostinger seja do tipo **Hospedagem Compartilhada / Web / LiteSpeed** tradicional (sem container Node.js):

1. Execute no terminal:
   ```bash
   npm run build
   ```
2. Uma pasta chamada **`dist`** será gerada na raiz do projeto.
3. Abra o **Gerenciador de Arquivos (File Manager)** no hPanel da Hostinger.
4. Navegue até a pasta `public_html` do subdomínio `militancia.mastervisionmarketing.com`.
5. Envie todo o conteúdo de dentro de `dist/` para a raiz da pasta `public_html`:
   - `index.html`
   - `.htaccess`
   - pasta `assets/`
6. Acesse **`https://militancia.mastervisionmarketing.com/`** e faça login normalmente.

