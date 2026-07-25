const DISCORD_CLIENT_ID = '1530666304569081938';
const DISCORD_CLIENT_SECRET = '8GT6BpkoJSnwpB2Yo2KjuLZ-W0rA5KZE';
const REDIRECT_URI = 'http://localhost:3000/auth/discord/callback';

export default function discordAuthPlugin() {
  return {
    name: 'discord-auth',
    configureServer(server) {
      server.middlewares.use('/auth/discord', (req, res) => {
        const url = `https://discord.com/api/oauth2/authorize?client_id=${DISCORD_CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&response_type=code&scope=identify`;
        res.writeHead(302, { Location: url });
        res.end();
      });

      server.middlewares.use('/auth/discord/callback', async (req, res) => {
        try {
          const urlObj = new URL(req.url, 'http://localhost');
          const code = urlObj.searchParams.get('code');
          if (!code) {
            res.writeHead(302, { Location: '/login?error=no_code' });
            res.end();
            return;
          }

          const tokenRes = await fetch('https://discord.com/api/oauth2/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
              client_id: DISCORD_CLIENT_ID,
              client_secret: DISCORD_CLIENT_SECRET,
              grant_type: 'authorization_code',
              code,
              redirect_uri: REDIRECT_URI,
            }).toString(),
          });
          const tokenData = await tokenRes.json();
          if (tokenData.error) {
            res.writeHead(302, { Location: '/login?error=token_failed' });
            res.end();
            return;
          }

          const userRes = await fetch('https://discord.com/api/users/@me', {
            headers: { Authorization: `Bearer ${tokenData.access_token}` },
          });
          const userData = await userRes.json();

          const avatarUrl = userData.avatar
            ? `https://cdn.discordapp.com/avatars/${userData.id}/${userData.avatar}.png?size=256`
            : `https://cdn.discordapp.com/embed/avatars/${parseInt(userData.discriminator || '0') % 5}.png`;

          const params = new URLSearchParams({
            id: userData.id,
            username: userData.username,
            avatar: avatarUrl,
            discriminator: userData.discriminator || '0',
          });
          res.writeHead(302, { Location: `/app?discord=${encodeURIComponent(params.toString())}` });
          res.end();
        } catch (err) {
          console.error('Discord OAuth error:', err);
          res.writeHead(302, { Location: '/login?error=server_error' });
          res.end();
        }
      });
    },
  };
}
