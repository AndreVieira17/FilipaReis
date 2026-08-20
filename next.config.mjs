import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
  experimental: {
    // Todo o site é renderizado dinamicamente (o idioma vem de um cookie,
    // lido no root layout). Sem isto, o Router Cache do browser pode
    // reutilizar uma versão em cache de uma rota já visitada/pré-carregada
    // antes de o idioma mudar, fazendo a página parecer "voltar" à língua
    // anterior ao navegar sem um pedido novo ao servidor.
    staleTimes: {
      dynamic: 0,
    },
  },
};

export default withNextIntl(nextConfig);
