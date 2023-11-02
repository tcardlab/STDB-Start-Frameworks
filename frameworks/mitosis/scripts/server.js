import { fileURLToPath, URL } from 'node:url'

import { createServer } from 'vite'
import script_loader from "./script_loader.js"

let givenArg = process.argv.at(-1) //process.argv[3]

if (!givenArg) {
  console.error(`Please provide a framework to run.`);
  process.exit(1)
}

;(async () => {

  let entryPath;
  let plugin;
  switch (givenArg) {
    case 'vue':
      entryPath = "./entries/vue.ts"
      plugin = (await import('@vitejs/plugin-vue')).default
      break;
    case 'svelte':
      entryPath = "./entries/svelte.ts"
      plugin = (await import('@sveltejs/vite-plugin-svelte')).svelte
      break;
    case 'react':
      entryPath = "./entries/react.ts"
      let react = (await import('@vitejs/plugin-react')).default
      plugin = ()=> {
        return react({
          babel: { plugins: ['styled-jsx/babel'] }
        })
      }
      break;
  
    default:
      console.error(`Could not match give arg "${givenArg}" to a framework`);
      process.exit(1)
  }
  
  const server = await createServer({
    configFile: false,
    server: {
      port: 3000,
      open: true
    },
    plugins: [
      script_loader(entryPath),
      plugin()
    ],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('../../..', import.meta.url))
      }
    }
  })

  await server.listen()
  server.printUrls()
})()
