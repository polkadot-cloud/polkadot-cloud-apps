// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { readdir, readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import type { Plugin } from 'vite'

const faviconDir = fileURLToPath(new URL('../public/favicons', import.meta.url))

const contentTypes: Record<string, string> = {
	'.ico': 'image/x-icon',
	'.png': 'image/png',
	'.svg': 'image/svg+xml',
}

const serveSharedFavicons = (): Plugin => ({
	name: 'serve-shared-favicons',
	apply: 'serve',
	configureServer(server) {
		server.middlewares.use(async (request, response, next) => {
			let pathname: string
			try {
				pathname = new URL(request.url ?? '/', 'http://localhost').pathname
			} catch {
				next()
				return
			}
			const match = pathname.match(/^\/favicons\/([^/]+)$/)

			if (!match) {
				next()
				return
			}

			try {
				const filename = decodeURIComponent(match[1])

				if (filename !== path.basename(filename)) {
					next()
					return
				}

				const contents = await readFile(path.join(faviconDir, filename))
				response.setHeader(
					'Content-Type',
					contentTypes[path.extname(filename)] ?? 'application/octet-stream',
				)
				response.end(contents)
			} catch {
				next()
			}
		})
	},
})

const buildSharedFavicons = (): Plugin => ({
	name: 'build-shared-favicons',
	apply: 'build',
	async buildStart() {
		for (const entry of await readdir(faviconDir, { withFileTypes: true })) {
			if (!entry.isFile()) continue
			const filename = entry.name
			if (!(path.extname(filename) in contentTypes)) continue

			this.emitFile({
				type: 'asset',
				fileName: `favicons/${filename}`,
				source: await readFile(path.join(faviconDir, filename)),
			})
		}
	},
})

export const sharedFaviconPlugins = (): Plugin[] => [
	serveSharedFavicons(),
	buildSharedFavicons(),
]
