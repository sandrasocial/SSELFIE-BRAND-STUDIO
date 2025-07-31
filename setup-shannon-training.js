import fs from 'fs';
import path from 'path';
import archiver from 'archiver';
import unzipper from 'unzipper';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function setupShannonTraining() {
  const shannonZipPath = path.join(__dirname, 'attached_assets', 'Shannon Training DATA _1753943333045.zip');
  const extractPath = path.join(__dirname, 'temp_training', 'shannon_extracted');
  
  console.log('🎯 Setting up Shannon\'s training data...');
  
  // Create extraction directory
  if (!fs.existsSync(extractPath)) {
    fs.mkdirSync(extractPath, { recursive: true });
  }
  
  try {
    // Extract Shannon's training ZIP
    console.log('📦 Extracting Shannon\'s training data...');
    await fs.createReadStream(shannonZipPath)
      .pipe(unzipper.Extract({ path: extractPath }))
      .promise();
    
    // Look for images in the subfolder
    const subfolderPath = path.join(extractPath, 'Shannon Training DATA ');
    let imageFiles = [];
    
    if (fs.existsSync(subfolderPath)) {
      const subfolderFiles = fs.readdirSync(subfolderPath);
      console.log('📁 Found subfolder with files:', subfolderFiles.length);
      
      imageFiles = subfolderFiles.filter(file => 
        /\.(jpg|jpeg|png|webp)$/i.test(file)
      );
    } else {
      // Fallback to root level
      const extractedFiles = fs.readdirSync(extractPath);
      imageFiles = extractedFiles.filter(file => 
        /\.(jpg|jpeg|png|webp)$/i.test(file)
      );
    }
    
    console.log('🖼️ Image files found:', imageFiles.length);
    console.log('📸 Images:', imageFiles);
    
    // Create training data structure
    const trainingData = {
      userId: 'shannon-1753945376880',
      userEmail: 'shannon@soulresets.com',
      imageCount: imageFiles.length,
      imagePaths: imageFiles.map(file => 
        fs.existsSync(path.join(extractPath, 'Shannon Training DATA ')) 
          ? path.join(extractPath, 'Shannon Training DATA ', file)
          : path.join(extractPath, file)
      ),
      triggerWord: 'usershannon1753945376880'
    };
    
    // Save training data info
    fs.writeFileSync(
      path.join(__dirname, 'shannon-training-data.json'),
      JSON.stringify(trainingData, null, 2)
    );
    
    console.log('✅ Shannon training data prepared successfully');
    console.log(`📊 Found ${imageFiles.length} training images`);
    
    return trainingData;
    
  } catch (error) {
    console.error('❌ Error setting up Shannon training:', error);
    throw error;
  }
}

setupShannonTraining()
  .then(data => {
    console.log('🎉 Shannon training setup complete:', data);
  })
  .catch(error => {
    console.error('💥 Setup failed:', error);
  });