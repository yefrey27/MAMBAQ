// @ts-check
import {themes as prismThemes} from 'prism-react-renderer';

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'MAMBAQ',
  tagline: 'Museo de Arte Moderno de Barranquilla — Documentación del Proyecto',
  favicon: 'img/favicon.ico',

  url: 'https://mambaqsite2026-secondary.z13.web.core.windows.net',
  baseUrl: '/',

  organizationName: 'MAMBAQ',
  projectName: 'mambaq-docs',

  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',

  i18n: {
    defaultLocale: 'es',
    locales: ['es'],
  },

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: './sidebars.js',
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      navbar: {
        title: 'MAMBAQ',
        logo: {
          alt: 'MAMBAQ Logo',
          src: 'img/logo.svg',
        },
        items: [
          {
            type: 'docSidebar',
            sidebarId: 'tutorialSidebar',
            position: 'left',
            label: 'Documentación',
          },
          {
            href: 'https://www.mambaqsite.online',
            label: 'Ver Sitio',
            position: 'right',
          },
          {
            href: 'https://github.com/yefrey27/MAMBAQ',
            label: 'GitHub',
            position: 'right',
          },
        ],
      },
      footer: {
        style: 'dark',
        links: [
          {
            title: 'Documentación',
            items: [
              { label: 'Introducción', to: '/docs/intro' },
              { label: 'Arquitectura', to: '/docs/arquitectura' },
              { label: 'Funcionalidades', to: '/docs/funcionalidades' },
            ],
          },
          {
            title: 'Proyecto',
            items: [
              {
                label: 'Sitio en Azure',
                href: 'https://mambaqsite2026-secondary.z13.web.core.windows.net/index.html',
              },
              {
                label: 'GitHub',
                href: 'https://github.com/yefrey27/MAMBAQ',
              },
            ],
          },
        ],
        copyright: `© ${new Date().getFullYear()} MAMBAQ — Museo de Arte Moderno de Barranquilla. Proyecto académico.`,
      },
      prism: {
        theme: prismThemes.github,
        darkTheme: prismThemes.dracula,
      },
      colorMode: {
        defaultMode: 'dark',
        disableSwitch: false,
      },
    }),
};

export default config;
