# 🚀 Guia Passo a Passo: Publicação Definitiva na Hostinger (militancia.mastervisionmarketing.com)

Se o site está preso na tela de carregamento (*"Carregando módulos e painel de controle..."*), isso acontece porque os **arquivos brutos de código-fonte (TypeScript `.tsx`)** foram enviados para o servidor, em vez da **pasta de produção compilada (`dist`)**.

Servidores web tradicionais da Hostinger (Apache/LiteSpeed em `public_html`) leem apenas arquivos **HTML, CSS e JavaScript compilados**.

---

## 📌 Método Rápido (Recomendado): Publicando os arquivos compilados

### 1️⃣ Passo 1: Gerar a compilação de produção (`dist`)
Se estiver em seu computador:
1. Abra a pasta do projeto no terminal.
2. Execute o comando:
   ```bash
   npm run build
   ```
   *(ou `npx vite build`)*
3. Uma pasta chamada **`dist`** será gerada na raiz do projeto.

---

### 2️⃣ Passo 2: O que enviar para a Hostinger
Abra a pasta **`dist`** recém-gerada. Você verá arquivos como:
- `index.html` (o arquivo compilado)
- `.htaccess` (configuração do Apache para rotas)
- pasta `assets/` (contendo os scripts `.js` e estilos `.css` minificados)

⚠️ **ATENÇÃO:** Não envie a pasta `src`, `server.ts` ou `package.json` para o `public_html`. Você deve enviar **OS ARQUIVOS QUE ESTÃO DENTRO DA PASTA `dist`** diretamente para o diretório raiz do seu subdomínio na Hostinger.

---

### 3️⃣ Passo 3: Envio pelo Gerenciador de Arquivos da Hostinger (hPanel)

1. Acesse o **hPanel da Hostinger** (https://hpanel.hostinger.com/).
2. Vá em **Sites** > Selecione seu domínio/subdomínio `militancia.mastervisionmarketing.com`.
3. Clique em **Gerenciador de Arquivos** (File Manager).
4. Navegue até a pasta do subdomínio:
   - Geralmente `public_html` (ou `domains/mastervisionmarketing.com/public_html/militancia`).
5. **Apague os arquivos antigos que não funcionavam** (ou substitua-os).
6. Faça o Upload de **todos os arquivos de dentro da pasta `dist/`**:
   - `index.html`
   - `.htaccess`
   - pasta `assets/`
7. Certifique-se de que o arquivo `.htaccess` está presente. Ele garante o funcionamento correto de todas as rotas e tipos MIME.

---

### 4️⃣ Passo 4: Teste o Acesso
1. Abra no navegador: `https://militancia.mastervisionmarketing.com/`
2. Pressione `Ctrl + F5` (ou `Cmd + Shift + R` no Mac) para limpar o cache do navegador.
3. A tela de **Login** aparecerá instantaneamente:
   - **Coordenador Geral:** Usuário `coordenador01` | Senha `2211`
   - **Militantes de Campo:** Usuário `Mil001` a `Mil050` | Senha `2211`

---

## 🔒 Arquivo `.htaccess` (Já incluso no projeto)
O arquivo `.htaccess` abaixo já está configurado no projeto para a Hostinger:

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>

<IfModule mod_mime.c>
  AddType application/javascript .js .mjs
  AddType text/css .css
  AddType application/json .json
  AddType image/svg+xml .svg
</IfModule>

Options -Indexes
```
