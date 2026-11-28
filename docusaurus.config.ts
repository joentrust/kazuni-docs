import { themes as prismThemes } from 'prism-react-renderer';
import type { Config } from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

const config: Config = {
  title: 'Kazuni',
  tagline: 'Unified notifications platform for African businesses - email today, SMS and WhatsApp next',
  favicon: 'img/favicon.svg',

  future: {
    v4: true,
  },

  url: 'https://docs.usekazuni.com',
  baseUrl: '/',

  organizationName: 'joentrust',
  projectName: 'kazuni-docs',

  onBrokenLinks: 'throw',

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  plugins: [
    require.resolve('./plugins/package-versions'),
    [
      require.resolve('@easyops-cn/docusaurus-search-local'),
      {
        hashed: true,
        indexBlog: false,
        indexPages: true,
        language: ['en'],
      },
    ],
  ],

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          editUrl: 'https://github.com/joentrust/kazuni-docs/tree/main/',
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    metadata: [
      {
        name: 'description',
        content:
          'Kazuni documentation for the notifications platform and JavaScript/TypeScript SDK. Send transactional email today, with SMS and WhatsApp planned.',
      },
      {
        name: 'keywords',
        content:
          'Kazuni, African businesses, transactional email, notifications platform, SDK, SES, DKIM, sending domains, API',
      },
      { property: 'og:site_name', content: 'Kazuni' },
      { property: 'og:type', content: 'website' },
      { name: 'twitter:card', content: 'summary' },
      { name: 'twitter:title', content: 'Kazuni Documentation' },
      {
        name: 'twitter:description',
        content:
          'A unified notifications platform for African businesses. Email today, SMS and WhatsApp next.',
      },
    ],
    colorMode: {
      defaultMode: 'light',
      disableSwitch: false,
      respectPrefersColorScheme: true,
    },
    navbar: {
      title: 'Kazuni',
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'platformSidebar',
          position: 'left',
          label: 'Platform',
        },
        {
          type: 'docSidebar',
          sidebarId: 'sdkSidebar',
          position: 'left',
          label: 'SDK',
        },
        {
          href: 'https://www.npmjs.com/package/@kazuni/sdk',
          label: 'npm',
          position: 'right',
        },
        {
          href: 'https://github.com/joentrust/kazuni-sdk',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'light',
      links: [
        {
          title: 'Documentation',
          items: [
            {
              label: 'Platform Guide',
              to: '/docs/platform/overview',
            },
            {
              label: 'SDK Guide',
              to: '/docs/sdk/overview',
            },
            {
              label: 'API Reference',
              to: '/docs/sdk/api-reference',
            },
          ],
        },
        {
          title: 'Resources',
          items: [
            {
              label: 'npm',
              href: 'https://www.npmjs.com/package/@kazuni/sdk',
            },
            {
              label: 'GitHub',
              href: 'https://github.com/joentrust/kazuni-sdk',
            },
          ],
        },
        {
          title: 'Kazuni',
          items: [
            {
              label: 'usekazuni.com',
              href: 'https://usekazuni.com',
            },
          ],
        },
      ],
      copyright: `Copyright ${new Date().getFullYear()} Kazuni. Built for African businesses.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
      additionalLanguages: ['bash', 'json', 'typescript'],
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
