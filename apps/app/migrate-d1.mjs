import 'dotenv/config';
import payload from 'payload';
import { pathToFileURL } from 'url';
import path from 'path';
import { getPlatformProxy } from 'wrangler';

const migrate = async () => {
  let dispose;
  try {
    console.log('Initializing Cloudflare local environment via wrangler...');
    const proxy = await getPlatformProxy();
    dispose = proxy.dispose;
    
    const d1Binding = proxy.env.D1;

    if (!d1Binding) {
      throw new Error("D1 binding not found in wrangler's environment. Check your wrangler.toml file.");
    }
    console.log('Wrangler environment initialized. D1 binding received.');

    console.log('Loading Payload config...');
    const configPath = path.resolve(process.cwd(), 'src', 'payload.d1.config.ts');
    const { createD1Config } = await import(pathToFileURL(configPath).href);

    const config = createD1Config(d1Binding);

    console.log('Config:',  proxy.env.D1);
    console.log('Starting database migration...');
    await payload.init({
      config: config,
      local: true,
    });

    console.log('Migration completed successfully.');
    
    await dispose();
    process.exit(0);

  } catch (err) {
    console.error('\nError during migration:', err);
    if (dispose) await dispose();
    process.exit(1);
  }
};

migrate();