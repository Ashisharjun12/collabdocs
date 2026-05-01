import { defineConfig , loadEnv} from 'vite'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'


// // https://vite.dev/config/
// export default defineConfig({
//   plugins: [
//     react(),
//     babel({ presets: [reactCompilerPreset()] }),
//     tailwindcss(),
    
//   ],
//     resolve: {
//     alias: {
//       "@": path.resolve(__dirname, "./src"),
//     },
//   },
// })

export default ({ mode }) => {
  // load env variables based on mode (development / production)
  const env = loadEnv(mode, process.cwd(), "");

  return defineConfig({
    plugins: [
      react(),
   babel({ presets: [reactCompilerPreset()] }),
   tailwindcss(),

    ],

    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },

    server: {
      proxy: {
        "/api": {
          target: env.VITE_APP_URL,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, "/api/v1"),
          secure: true,
        },
      },
    },
  });
};

