/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // DB drivers must run on the server, not be bundled (PGlite ships wasm).
  serverExternalPackages: ["postgres", "@electric-sql/pglite", "drizzle-orm"],
  webpack: (config, { nextRuntime, webpack }) => {
    // instrumentation.ts is compiled for the Edge runtime as well, but the Edge
    // bundler can't resolve `node:` builtins (node:crypto/fs/path from our DB +
    // auth boot code). That code is guarded to run only on the Node.js runtime
    // (NEXT_RUNTIME === "nodejs"), so it's safe to strip `node:` imports from the
    // Edge bundle — they're never executed there. Without this, `next dev`
    // throws UnhandledSchemeError and every page 500s.
    if (nextRuntime === "edge") {
      config.plugins.push(new webpack.IgnorePlugin({ resourceRegExp: /^node:/ }));
    }
    return config;
  },
};

export default nextConfig;
