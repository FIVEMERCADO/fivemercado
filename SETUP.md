# FiveMercado — Setup de Backend

## 1. Supabase

1. Ir a https://supabase.com → New project
2. Guardar: **Project URL** y **service_role key** (Settings → API)
3. En el SQL Editor, ejecutar `supabase/schema.sql` completo
4. En Authentication → Providers → Discord: activar y pegar Client ID + Secret

## 2. Discord OAuth2

1. Ir a https://discord.com/developers/applications → New Application
2. OAuth2 → Redirects → agregar:
   ```
   https://fivemercado.vercel.app/api/auth/callback/discord
   ```
3. Guardar: **Client ID** y **Client Secret**

## 3. Discord Bot (para /redeem)

1. En la misma app → Bot → Add Bot
2. Token → Reset Token → copiar
3. OAuth2 → URL Generator → scopes: `bot` + `applications.commands`
4. Permissions: `Send Messages`, `Read Message History`
5. Invitar el bot al servidor

## 4. Variables en Vercel

En vercel.com → proyecto → Settings → Environment Variables:

```
AUTH_SECRET            = (genera con: openssl rand -base64 32)
NEXTAUTH_URL           = https://fivemercado.vercel.app
DISCORD_CLIENT_ID      = (de paso 2)
DISCORD_CLIENT_SECRET  = (de paso 2)
DISCORD_BOT_TOKEN      = (de paso 3)
NEXT_PUBLIC_SUPABASE_URL  = (de paso 1)
SUPABASE_SERVICE_KEY      = (de paso 1)
SITE_URL               = https://fivemercado.vercel.app
```

## 5. Deploy del bot

```bash
cd bot
npm install
# Crear .env con las variables de arriba
node index.js
```

El bot necesita correr 24/7. Opciones gratis: Railway, Fly.io, o un VPS.

## 6. Cloudflare (opcional pero recomendado)

1. Agregar dominio en Cloudflare
2. DNS → agregar CNAME apuntando a cname.vercel-dns.com
3. Security → Bot Fight Mode → ON
4. Security → WAF → crear regla para bloquear requests sin User-Agent
