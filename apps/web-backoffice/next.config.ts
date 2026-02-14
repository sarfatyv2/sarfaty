import type { NextConfig } from 'next';

const config: NextConfig = {
  transpilePackages: ['@nexus/ui', '@nexus/types', '@nexus/validators', '@nexus/utils'],
};

export default config;
