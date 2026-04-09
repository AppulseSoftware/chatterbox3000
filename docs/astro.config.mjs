// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

// https://astro.build/config
export default defineConfig({
	integrations: [
		starlight({
			title: 'Chatterbox3000',
			social: [{ icon: 'github', label: 'GitHub', href: 'https://github.com/AppulseSoftware/chatterbox3000' }],
			sidebar: [
				{
					label: 'Getting Started',
					items: [
						{ label: 'Introduction', slug: 'getting-started/introduction' },
						{ label: 'Quick Start', slug: 'getting-started/quick-start' },
					],
				},
				{
					label: 'Guides',
					items: [
						{ label: 'DNS & Email Setup', slug: 'guides/dns-setup' },
						{ label: 'Worker Deployment', slug: 'guides/worker-deployment' },
						{ label: 'Chrome Extension', slug: 'guides/chrome-extension' },
						{ label: 'Email Forwarding', slug: 'guides/smtp-relay' },
					],
				},
				{
					label: 'Reference',
					autogenerate: { directory: 'reference' },
				},
			],
		}),
	],
});
