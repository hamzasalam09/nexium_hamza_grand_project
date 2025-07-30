// Configuration utility to handle environment variable access issues
export function getEnvConfig() {
  // Try multiple ways to access environment variables
  const config = {
    OPENAI_API_KEY: 
      process.env.OPENAI_API_KEY || 
      process.env['OPENAI_API_KEY'] || 
      globalThis.process?.env?.OPENAI_API_KEY ||
      // Try to access through different methods that sometimes work in Vercel
      (typeof process !== 'undefined' && process.env ? process.env.OPENAI_API_KEY : '') ||
      '',
    N8N_WEBHOOK_URL: 
      process.env.N8N_WEBHOOK_URL || 
      process.env['N8N_WEBHOOK_URL'] || 
      globalThis.process?.env?.N8N_WEBHOOK_URL ||
      (typeof process !== 'undefined' && process.env ? process.env.N8N_WEBHOOK_URL : '') ||
      '',
    NODE_ENV: process.env.NODE_ENV,
    VERCEL_ENV: process.env.VERCEL_ENV
  };

  // Special handling for Vercel runtime
  if (process.env.VERCEL && !config.OPENAI_API_KEY) {
    console.log('Vercel runtime detected, trying alternative access methods...');
    
    // Check if environment variables are in a different location in Vercel runtime
    const allEnvKeys = Object.keys(process.env);
    const openaiRelated = allEnvKeys.filter(key => key.toLowerCase().includes('openai'));
    
    console.log('OpenAI-related env keys found:', openaiRelated);
    
    // If we find environment variables but they're empty, try to access them again
    if (allEnvKeys.includes('OPENAI_API_KEY') && !config.OPENAI_API_KEY) {
      console.log('OPENAI_API_KEY exists in env but value is empty, investigating...');
      const value = process.env.OPENAI_API_KEY;
      console.log('Direct access result:', {
        type: typeof value,
        length: value?.length,
        isString: typeof value === 'string',
        isEmpty: value === '',
        isUndefined: value === undefined,
        isNull: value === null
      });
    }
  }

  console.log('Config access attempt:', {
    methods_tried: [
      'process.env.OPENAI_API_KEY',
      'process.env["OPENAI_API_KEY"]',
      'globalThis.process?.env?.OPENAI_API_KEY'
    ],
    results: {
      OPENAI_API_KEY_length: config.OPENAI_API_KEY.length,
      N8N_WEBHOOK_URL_length: config.N8N_WEBHOOK_URL.length,
      has_openai_key: !!config.OPENAI_API_KEY,
      has_webhook_url: !!config.N8N_WEBHOOK_URL
    },
    process_env_keys_count: Object.keys(process.env).length,
    process_env_sample_keys: Object.keys(process.env).slice(0, 10),
    is_vercel: !!process.env.VERCEL
  });

  return config;
}

export function debugEnvironment() {
  const env = process.env;
  return {
    total_keys: Object.keys(env).length,
    openai_keys: Object.keys(env).filter(key => key.includes('OPENAI')),
    supabase_keys: Object.keys(env).filter(key => key.includes('SUPABASE')),
    vercel_keys: Object.keys(env).filter(key => key.includes('VERCEL')),
    all_keys_sample: Object.keys(env).slice(0, 20),
    has_specific_keys: {
      OPENAI_API_KEY: 'OPENAI_API_KEY' in env,
      SUPABASE_SERVICE_ROLE_KEY: 'SUPABASE_SERVICE_ROLE_KEY' in env,
      N8N_WEBHOOK_URL: 'N8N_WEBHOOK_URL' in env,
      NODE_ENV: 'NODE_ENV' in env
    }
  };
}
