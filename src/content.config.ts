import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const blog = defineCollection({
	// Load Markdown and MDX files in the `src/content/blog/` directory.
	loader: glob({ base: './src/content/blog', pattern: '**/*.{md,mdx}' }),
	// Type-check frontmatter using a schema
	schema: ({ image }) =>
		z.object({
			title: z.string(),
			description: z.string(),
			// Transform string to Date object
			pubDate: z.coerce.date(),
			updatedDate: z.coerce.date().optional(),
			heroImage: image().optional(),
			tags: z.array(z.string()).optional(),
		}),
});

const resume = defineCollection({
	// Load Markdown and MDX files in the `src/content/resume/` directory.
	loader: glob({ base: './src/content/resume', pattern: '**/*.{md,mdx}' }),
	// Type-check frontmatter using a schema
	schema: ({ image }) =>
		z.object({
			title: z.string().optional(),
			description: z.string().optional(),
		}),
});

const project = defineCollection({
	// Load Markdown and MDX files in the `src/content/project/` directory.
	loader: glob({ base: './src/content/project', pattern: '*.{md,mdx}' }),
	// Type-check frontmatter using a schema
	schema: ({ image }) =>
		z.object({
			title: z.string(),
			description: z.string(),
			pubDate: z.coerce.date(),
			updatedDate: z.coerce.date().optional(),
			startDate: z.coerce.date().optional(),
			endDate: z.coerce.date().optional(),
			thumbnail: image().optional(),
			heroImage: image().optional(),
			tags: z.array(z.string()).optional(),
			gitHub: z.string().url().optional(),
			gitHubPrivate: z.boolean().optional(),
			gitLab: z.string().url().optional(),
			gitLabPrivate: z.boolean().optional(),
			link: z.string().url().optional(),
			linkClosed: z.boolean().optional(),
			teamSize: z.string().optional(),
		}),
});

export const collections = { blog, resume, project };
