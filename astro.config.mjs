// @ts-check

import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
	site: 'https://www.dskim.dev',
	integrations: [mdx(), sitemap()],
	image: {
		service: {
			entrypoint: 'astro/assets/services/sharp',
			config: {
				limitInputPixels: 268402689, // 16383^2 (기본값의 약 4배)
			},
		},
	},
});
