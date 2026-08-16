import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Small Docker image: ships only the traced server + its dependencies.
  output: 'standalone',

  // No basePath: the public URL is /{state}/library/{slug} straight off the root, so
  // the route folders carry the whole shape and dev URLs match production exactly.

  // Activity photos are S3 presigned URLs with short-lived query signatures. The
  // optimizer would cache the signed URL and serve a 403 once it expires, so images
  // are passed through untouched.
  images: { unoptimized: true },

  poweredByHeader: false,
}

export default nextConfig
