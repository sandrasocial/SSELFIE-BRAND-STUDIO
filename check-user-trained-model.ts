import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './shared/schema.js';
import { eq, and } from 'drizzle-orm';

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error('DATABASE_URL environment variable is required');
}

const client = postgres(connectionString);
const db = drizzle(client, { schema });

async function checkUserTrainedModel() {
  try {
    // Find user by email
    const user = await db.query.users.findFirst({
      where: eq(schema.users.email, 'ssa@ssasocial.com')
    });

    if (!user) {
      console.log('❌ User not found');
      return;
    }

    console.log('👤 User found:', {
      id: user.id,
      email: user.email,
      stackAuthId: user.stackAuthId,
      trainingCoachingCompleted: user.trainingCoachingCompleted
    });

    // Check for trained models
    const userModels = await db.query.userModels.findMany({
      where: eq(schema.userModels.userId, user.id)
    });

    console.log('\n🤖 Trained Models (userModels):');
    if (userModels.length === 0) {
      console.log('❌ No trained models found for this user');
    } else {
      userModels.forEach((model: any, index: number) => {
        console.log(`\n📋 Model ${index + 1}:`);
        console.log(`  - ID: ${model.id}`);
        console.log(`  - Training ID: ${model.trainingId}`);
        console.log(`  - Replicate Model ID: ${model.replicateModelId}`);
        console.log(`  - Replicate Version ID: ${model.replicateVersionId}`);
        console.log(`  - Trained Model Path: ${model.trainedModelPath}`);
        console.log(`  - Trigger Word: ${model.triggerWord}`);
        console.log(`  - Training Status: ${model.trainingStatus}`);
        console.log(`  - Model Name: ${model.modelName}`);
        console.log(`  - Is Luxury: ${model.isLuxury}`);
        console.log(`  - Model Type: ${model.modelType}`);
        console.log(`  - Training Progress: ${model.trainingProgress}%`);
        console.log(`  - Created: ${model.createdAt}`);
        console.log(`  - Completed: ${model.completedAt || 'Not completed'}`);
      });
    }

    // Check for generated images
    const generatedImages = await db.query.generatedImages.findMany({
      where: eq(schema.generatedImages.userId, user.id)
    });

    console.log('\n🎨 Generated Images:');
    if (generatedImages.length === 0) {
      console.log('❌ No generated images found');
    } else {
      console.log(`✅ Found ${generatedImages.length} generated images`);
      const recent = generatedImages.slice(-5);
      recent.forEach((img: any, index: number) => {
        console.log(`  ${index + 1}. Category: ${img.category}, Subcategory: ${img.subcategory}, Created: ${img.createdAt}`);
      });
    }

  } catch (error) {
    console.error('Error checking user trained model:', error);
  } finally {
    await client.end();
  }
}

checkUserTrainedModel();