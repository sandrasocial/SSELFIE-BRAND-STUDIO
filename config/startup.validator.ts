import { env } from './environment.validator';
import { createConnection } from 'typeorm';
import axios from 'axios';

async function validateDatabaseConnection() {
  try {
    const connection = await createConnection();
    await connection.query('SELECT 1');
    console.log('✅ Database connection successful');
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    return false;
  }
}

async function validateExternalServices() {
  const services = [
    {
      name: 'Stripe API',
      validate: async () => {
        const stripe = require('stripe')(env.STRIPE_SECRET_KEY);
        await stripe.paymentMethods.list({ limit: 1 });
      }
    },
    {
      name: 'Victoria AI',
      validate: async () => {
        const response = await axios.get('YOUR_VICTORIA_AI_HEALTH_ENDPOINT', {
          headers: { Authorization: `Bearer ${env.VICTORIA_AI_KEY}` }
        });
        if (!response.data.healthy) throw new Error('Service unhealthy');
      }
    },
    {
      name: 'Email Service',
      validate: async () => {
        // Add your email service health check here
        const response = await axios.get('YOUR_EMAIL_SERVICE_HEALTH_ENDPOINT', {
          headers: { Authorization: `Bearer ${env.EMAIL_API_KEY}` }
        });
        if (!response.data.status === 'ok') throw new Error('Email service unhealthy');
      }
    }
  ];

  const results = await Promise.allSettled(
    services.map(async (service) => {
      try {
        await service.validate();
        console.log(`✅ ${service.name} connection successful`);
        return true;
      } catch (error) {
        console.error(`❌ ${service.name} validation failed:`, error);
        return false;
      }
    })
  );

  return results.every(result => result.status === 'fulfilled' && result.value === true);
}

async function validateStorageAccess() {
  try {
    const AWS = require('aws-sdk');
    const s3 = new AWS.S3({
      accessKeyId: env.AWS_ACCESS_KEY_ID,
      secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
      region: env.AWS_REGION
    });

    await s3.headBucket({ Bucket: env.S3_BUCKET }).promise();
    console.log('✅ S3 storage access validated');
    return true;
  } catch (error) {
    console.error('❌ S3 storage access failed:', error);
    return false;
  }
}

export async function validateStartupRequirements() {
  console.log('🔍 Starting system validation...');
  
  const validations = [
    { name: 'Database', validate: validateDatabaseConnection },
    { name: 'External Services', validate: validateExternalServices },
    { name: 'Storage', validate: validateStorageAccess }
  ];

  for (const validation of validations) {
    console.log(`\n🔄 Validating ${validation.name}...`);
    const isValid = await validation.validate();
    
    if (!isValid) {
      console.error(`\n❌ ${validation.name} validation failed. System startup aborted.`);
      process.exit(1);
    }
  }

  console.log('\n✅ All system validations passed successfully!');
  return true;
}