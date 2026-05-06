// scripts/test-redis.js
const Redis = require('ioredis');

const redis = new Redis("redis://default:pSmFiVMqweddAg0OgA8424536dcV3V29@redis-12270.crce181.sa-east-1-2.ec2.cloud.redislabs.com:12270");

async function test() {
  try {
    await redis.set('test', 'Hello Redis!');
    const result = await redis.get('test');
    console.log('✅ Redis test exitoso:', result);
    process.exit(0);
  } catch (error) {
    console.error('❌ Error conectando a Redis:', error.message);
    process.exit(1);
  }
}

test();