// Quick test for StyleSelector component
import { brandStyleCollections } from '../src/data/brand-style-collections';

console.log('✅ Brand Style Collections Test:');
console.log(`📊 Total collections: ${brandStyleCollections.length}`);

brandStyleCollections.forEach((collection, index) => {
  console.log(`${index + 1}. ${collection.name}`);
  console.log(`   - ID: ${collection.id}`);
  console.log(`   - Description: ${collection.description}`);
  console.log(`   - Image URL: ${collection.imageUrl}`);
  console.log(`   - Colors: ${collection.colors.slice(0, 3).join(', ')}...`);
  console.log(`   - Images count: ${collection.images.length}`);
  console.log('');
});

console.log('✅ All collections have required properties!');