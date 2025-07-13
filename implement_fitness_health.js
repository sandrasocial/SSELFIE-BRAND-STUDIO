// Complete Fitness & Health implementation with all 66 authentic PostImg URLs
import { promises as fs } from 'fs';

const fitnessHealthUrls = [
'https://i.postimg.cc/T1dT95WG/Fitness-Aesthetic1.png',
'https://i.postimg.cc/85B1Mmct/Fitness-Aesthetic2.png',
'https://i.postimg.cc/wvdq1Gq1/Fitness-Aesthetic3.png',
'https://i.postimg.cc/g2QkW01q/Fitness-Aesthetic4.png',
'https://i.postimg.cc/bwsNWnVw/Fitness-Aesthetic5.png',
'https://i.postimg.cc/yNR6YHHq/Fitness-Aesthetic6.png',
'https://i.postimg.cc/02tyVnf4/Fitness-Aesthetic7.png',
'https://i.postimg.cc/SNQKL3W8/Fitness-Aesthetic8.png',
'https://i.postimg.cc/C57xTsVz/Fitness-Aesthetic9.png',
'https://i.postimg.cc/Bb4nVwkr/Fitness-Aesthetic10.png',
'https://i.postimg.cc/ZRrqjh7P/Fitness-Aesthetic11.png',
'https://i.postimg.cc/k4r4x5cX/Fitness-Aesthetic12.png',
'https://i.postimg.cc/CKn5B8bQ/Fitness-Aesthetic13.png',
'https://i.postimg.cc/7ZWbZ9Jz/Fitness-Aesthetic14.png',
'https://i.postimg.cc/jdRDgLrD/Fitness-Aesthetic15.png',
'https://i.postimg.cc/PrKPBTt2/Fitness-Aesthetic16.png',
'https://i.postimg.cc/8kRFmLx8/Fitness-Aesthetic17.png',
'https://i.postimg.cc/QCJHNrcN/Fitness-Aesthetic18.png',
'https://i.postimg.cc/D0TSKzJY/Fitness-Aesthetic19.png',
'https://i.postimg.cc/NMTKVXMH/Fitness-Aesthetic20.png',
'https://i.postimg.cc/wB1yXZYF/Fitness-Aesthetic21.png',
'https://i.postimg.cc/L8CgZRwn/Fitness-Aesthetic22.png',
'https://i.postimg.cc/9fs4JbW2/Fitness-Aesthetic23.png',
'https://i.postimg.cc/y8YSdWfM/Fitness-Aesthetic24.png',
'https://i.postimg.cc/RVTH4wT1/Fitness-Aesthetic25.png',
'https://i.postimg.cc/9F276LyF/Fitness-Aesthetic26.png',
'https://i.postimg.cc/nVBmSyjP/Fitness-Aesthetic27.png',
'https://i.postimg.cc/GtFsBDnC/Fitness-Aesthetic28.png',
'https://i.postimg.cc/0jRw2f3n/Fitness-Aesthetic29.png',
'https://i.postimg.cc/XvP5t3kT/Fitness-Aesthetic30.png',
'https://i.postimg.cc/hj7mBwCh/Fitness-Aesthetic31.png',
'https://i.postimg.cc/GptYM9GF/Fitness-Aesthetic32.png',
'https://i.postimg.cc/bw3kH1DY/Fitness-Aesthetic33.png',
'https://i.postimg.cc/7ZxS2KLQ/Fitness-Aesthetic34.png',
'https://i.postimg.cc/X7KwqRnC/Fitness-Aesthetic35.png',
'https://i.postimg.cc/FsXy9rXv/Fitness-Aesthetic36.png',
'https://i.postimg.cc/zDgwZLMp/Fitness-Aesthetic37.png',
'https://i.postimg.cc/8cMLh3Wx/Fitness-Aesthetic38.png',
'https://i.postimg.cc/bJKQS8GQ/Fitness-Aesthetic39.png',
'https://i.postimg.cc/Y946SjSr/Fitness-Aesthetic40.png',
'https://i.postimg.cc/VNZ91XmZ/Fitness-Aesthetic41.png',
'https://i.postimg.cc/fbR768n0/Fitness-Aesthetic42.png',
'https://i.postimg.cc/g2DqSf5W/Fitness-Aesthetic43.png',
'https://i.postimg.cc/8zDmb1Z4/Fitness-Aesthetic44.png',
'https://i.postimg.cc/gk3KRwHr/Fitness-Aesthetic45.png',
'https://i.postimg.cc/G3WQHPYZ/Fitness-Aesthetic46.png',
'https://i.postimg.cc/pVhCWc9f/Fitness-Aesthetic47.png',
'https://i.postimg.cc/1Xqrv4xC/Fitness-Aesthetic48.png',
'https://i.postimg.cc/NMVx8mn2/Fitness-Aesthetic49.png',
'https://i.postimg.cc/pTyZnqst/Fitness-Aesthetic50.png',
'https://i.postimg.cc/TPt0wZq9/Fitness-Aesthetic51.png',
'https://i.postimg.cc/wBqF96JM/Fitness-Aesthetic52.png',
'https://i.postimg.cc/qvXjftNW/Fitness-Aesthetic53.png',
'https://i.postimg.cc/T3XCHj3r/Fitness-Aesthetic54.png',
'https://i.postimg.cc/ryKndFHt/Fitness-Aesthetic55.png',
'https://i.postimg.cc/h46CVRFZ/Fitness-Aesthetic56.png',
'https://i.postimg.cc/LhF53bDg/Fitness-Aesthetic57.png',
'https://i.postimg.cc/WzktrvGP/Fitness-Aesthetic58.png',
'https://i.postimg.cc/B6tjSDtb/Fitness-Aesthetic59.png',
'https://i.postimg.cc/LX7nnXZT/Fitness-Aesthetic60.png',
'https://i.postimg.cc/JhpyCKrS/Fitness-Aesthetic61.png',
'https://i.postimg.cc/JhryFSLb/Fitness-Aesthetic62.png',
'https://i.postimg.cc/vTJgSBYB/Fitness-Aesthetic63.png',
'https://i.postimg.cc/SxpY6J11/Fitness-Aesthetic64.png',
'https://i.postimg.cc/fWp9bHcN/Fitness-Aesthetic65.png',
'https://i.postimg.cc/dtCTZ86T/Fitness-Aesthetic66.png'
];

async function implementFitnessHealthCollection() {
  try {
    console.log(`\n🎯 IMPLEMENTING FITNESS & HEALTH COLLECTION`);
    console.log(`Total URLs: ${fitnessHealthUrls.length}`);

    // Generate all image objects
    const allImages = fitnessHealthUrls.map((url, index) => ({
      id: `fh-${index + 1}`,
      url: url,
      title: `Fitness & Health ${index + 1}`,
      category: 'Fitness & Health',
      description: 'Fitness & Health aesthetic flatlay'
    }));

    // Read current file
    const filePath = 'client/src/pages/flatlay-library.tsx';
    const fileContent = await fs.readFile(filePath, 'utf8');

    // Find Fitness & Health collection start and end
    const startMarker = "id: 'fitness-health',";
    const endMarker = "id: 'coastal-vibes',";
    
    const startIndex = fileContent.indexOf(startMarker);
    const endIndex = fileContent.indexOf(endMarker);
    
    if (startIndex === -1 || endIndex === -1) {
      throw new Error('Could not locate Fitness & Health collection boundaries');
    }

    // Find the images array within the collection
    const collectionSection = fileContent.substring(startIndex, endIndex);
    const imagesStartMarker = 'images: [';
    const imagesEndMarker = '    ]\n  },';
    
    const imagesStart = startIndex + collectionSection.indexOf(imagesStartMarker);
    const imagesEnd = startIndex + collectionSection.indexOf(imagesEndMarker) + imagesEndMarker.length - 6; // Just before the ]
    
    // Generate new images string
    const newImagesString = allImages.map(img => 
      `      {\n        id: '${img.id}',\n        url: '${img.url}',\n        title: '${img.title}',\n        category: '${img.category}',\n        description: '${img.description}'\n      }`
    ).join(',\n');

    // Replace the images section
    const beforeImages = fileContent.substring(0, imagesStart + imagesStartMarker.length);
    const afterImages = fileContent.substring(imagesEnd);
    const newFileContent = beforeImages + '\n' + newImagesString + '\n    ' + afterImages;

    // Write back to file
    await fs.writeFile(filePath, newFileContent);

    console.log(`✅ Successfully implemented Fitness & Health collection with ${allImages.length} images`);
    console.log(`📊 Collection Status: COMPLETE`);

  } catch (error) {
    console.error('❌ Error implementing Fitness & Health collection:', error.message);
  }
}

implementFitnessHealthCollection();