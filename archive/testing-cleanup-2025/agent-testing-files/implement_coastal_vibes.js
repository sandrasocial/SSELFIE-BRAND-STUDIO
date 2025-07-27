// Complete Coastal Vibes implementation with all 76 authentic PostImg URLs
import { promises as fs } from 'fs';

const coastalVibesUrls = [
'https://i.postimg.cc/rynDPfn4/marga888-Aesthetic-close-up-of-a-female-surfers-hand-gripping-53ec62d8-1ab9-4048-b02d-b4b30a837b43-0.png',
'https://i.postimg.cc/JnKsmxR9/marga888-Aesthetic-close-up-of-a-female-surfers-hand-gripping-53ec62d8-1ab9-4048-b02d-b4b30a837b43-1.png',
'https://i.postimg.cc/mk5h1rzj/marga888-Aesthetic-close-up-of-a-female-surfers-hand-gripping-53ec62d8-1ab9-4048-b02d-b4b30a837b43-2.png',
'https://i.postimg.cc/yNmJpBt6/marga888-Aesthetic-close-up-of-a-female-surfers-hand-gripping-d3815090-665c-4be9-a02c-74277a9c3c26-0.png',
'https://i.postimg.cc/4dXYrqR6/marga888-Aesthetic-close-up-of-a-female-surfers-hand-gripping-d3815090-665c-4be9-a02c-74277a9c3c26-1.png',
'https://i.postimg.cc/SQr6NLZQ/marga888-Aesthetic-close-up-of-a-surfers-feet-walking-on-the-45e6acf0-43b6-411e-930f-87e29423eae9-0.png',
'https://i.postimg.cc/mgr8GpBG/marga888-Aesthetic-close-up-of-a-surfers-feet-walking-on-the-45e6acf0-43b6-411e-930f-87e29423eae9-2.png',
'https://i.postimg.cc/tC4h11f3/marga888-Aesthetic-close-up-of-a-surfers-feet-walking-on-the-45e6acf0-43b6-411e-930f-87e29423eae9-3.png',
'https://i.postimg.cc/vHTVYJgX/marga888-Aesthetic-close-up-of-a-woman-sitting-on-her-surfboa-0782d245-53e7-4d06-9a8e-9fcd5489c440-0.png',
'https://i.postimg.cc/GhfsHXvR/marga888-Aesthetic-close-up-of-a-woman-sitting-on-her-surfboa-0782d245-53e7-4d06-9a8e-9fcd5489c440-2.png',
'https://i.postimg.cc/mkDtr9Dh/marga888-Aesthetic-close-up-of-a-woman-sitting-on-her-surfboa-0782d245-53e7-4d06-9a8e-9fcd5489c440-3.png',
'https://i.postimg.cc/dVTZdG9y/marga888-Aesthetic-close-up-of-a-woman-sitting-on-her-surfboa-fb015995-34d5-4d7f-a729-429ce6474a54-1.png',
'https://i.postimg.cc/3w54ZWLb/marga888-Aesthetic-close-up-of-a-woman-sitting-on-her-surfboa-fb015995-34d5-4d7f-a729-429ce6474a54-2.png',
'https://i.postimg.cc/Wb5wSmrY/marga888-A-close-up-of-a-surfboards-waxed-surface-with-sand-g-bc113a5a-d6b2-4d1d-8e34-822623cd80c8-0.png',
'https://i.postimg.cc/bwdH5G9y/marga888-A-close-up-of-a-surfboards-waxed-surface-with-sand-g-bc113a5a-d6b2-4d1d-8e34-822623cd80c8-1.png',
'https://i.postimg.cc/0y3d18Vp/marga888-A-close-up-of-a-surfboards-waxed-surface-with-sand-g-bc113a5a-d6b2-4d1d-8e34-822623cd80c8-3.png',
'https://i.postimg.cc/2yzn735f/marga888-A-close-up-of-a-wetsuit-hanging-to-dry-on-a-rustic-f-4bfecd60-74a4-46e2-9ed8-78622125a271-3.png',
'https://i.postimg.cc/QtD7jV1W/marga888-A-close-up-of-fringed-beach-umbrellas-standing-on-a-384afec0-b5a2-4f53-9f38-1c559b49345f-2.png',
'https://i.postimg.cc/9fZT3yRh/marga888-A-close-up-of-fringed-beach-umbrellas-standing-on-a-384afec0-b5a2-4f53-9f38-1c559b49345f-3.png',
'https://i.postimg.cc/sg9ytXjL/marga888-A-close-up-of-fringed-beach-umbrellas-standing-on-a-73bb9921-c92c-4358-bcc5-99e297145ec2-0.png',
'https://i.postimg.cc/Ls9RRph8/marga888-A-close-up-of-fringed-beach-umbrellas-standing-on-a-73bb9921-c92c-4358-bcc5-99e297145ec2-1.png',
'https://i.postimg.cc/GpXRm5sJ/marga888-A-close-up-of-fringed-beach-umbrellas-standing-on-a-73bb9921-c92c-4358-bcc5-99e297145ec2-2.png',
'https://i.postimg.cc/nz5tv92X/marga888-A-close-up-of-fringed-beach-umbrellas-standing-on-a-73bb9921-c92c-4358-bcc5-99e297145ec2-3.png',
'https://i.postimg.cc/F1X56t2m/marga888-A-close-up-shot-of-palm-leaves-gently-swaying-in-the-21544c8c-b3e1-4ef4-9f09-3725377a3d10-1.png',
'https://i.postimg.cc/jqwDBzGk/marga888-A-close-up-shot-of-palm-leaves-gently-swaying-in-the-21544c8c-b3e1-4ef4-9f09-3725377a3d10-2.png',
'https://i.postimg.cc/vH255YFp/marga888-A-close-up-shot-of-palm-leaves-gently-swaying-in-the-2977131a-052b-40d6-91fa-20948bb8bb81-2.png',
'https://i.postimg.cc/4xrtFW3P/marga888-A-close-up-shot-of-palm-leaves-gently-swaying-in-the-2977131a-052b-40d6-91fa-20948bb8bb81-3.png',
'https://i.postimg.cc/HkJX2qTj/marga888-A-close-up-shot-of-palm-tree-gently-swaying-in-the-b-a4aed3b6-44a1-4c4f-aa8a-38ea30330bce-2.png',
'https://i.postimg.cc/XvkJcLBp/marga888-a-close-up-of-feet-on-the-sand-next-to-an-surfboard-f73af47f-725c-45cf-ae7d-e235c4cf1c28-0.png',
'https://i.postimg.cc/gJc0Mh34/marga888-a-close-up-of-feet-on-the-sand-next-to-an-surfboard-f73af47f-725c-45cf-ae7d-e235c4cf1c28-2.png',
'https://i.postimg.cc/gk3n2GcV/marga888-A-collection-of-surfboards-in-various-pastel-colors-ea89ad4b-4514-46c6-9773-ce3fb6a1f980-0.png',
'https://i.postimg.cc/FHm1fw12/marga888-A-collection-of-surfboards-in-various-pastel-colors-ea89ad4b-4514-46c6-9773-ce3fb6a1f980-1.png',
'https://i.postimg.cc/Z5cn6jd0/marga888-A-collection-of-surfboards-in-various-pastel-colors-ea89ad4b-4514-46c6-9773-ce3fb6a1f980-2.png',
'https://i.postimg.cc/0NyQnmYn/marga888-A-collection-of-surfboards-in-various-pastel-colors-ea89ad4b-4514-46c6-9773-ce3fb6a1f980-3.png',
'https://i.postimg.cc/JntLD5Nw/marga888-A-lone-surfer-walking-along-a-deserted-beach-with-a-32c02e44-3861-489f-87d1-6624cc6c5441-2.png',
'https://i.postimg.cc/8zVNKWSW/marga888-A-photograph-of-an-Australian-surfer-walking-along-t-bd7fdb7f-9255-4173-a6e3-3c66df0304dd-1.png',
'https://i.postimg.cc/J72hqG0c/marga888-A-photograph-of-surfboards-stacked-on-an-old-wooden-0d42390a-67dd-4ace-b7e0-68a5d14ddaa3-0.png',
'https://i.postimg.cc/vHxZSb6R/marga888-A-photograph-of-surfboards-stacked-on-an-old-wooden-0d42390a-67dd-4ace-b7e0-68a5d14ddaa3-1.png',
'https://i.postimg.cc/yxk8KzQZ/marga888-A-photograph-of-surfboards-stacked-on-an-old-wooden-73c3f3ba-4c22-4f6a-bc3c-54bd59222563-2.png',
'https://i.postimg.cc/hv6PP363/marga888-A-photograph-of-surfboards-stacked-on-an-old-wooden-73c3f3ba-4c22-4f6a-bc3c-54bd59222563-3.png',
'https://i.postimg.cc/nh8cygvX/marga888-A-photograph-of-surfboards-stacked-on-an-old-wooden-fbfb5819-b205-415f-bd45-52447cf628c9-0.png',
'https://i.postimg.cc/3JG3F1PY/marga888-A-photograph-shows-an-Australian-surfer-walking-on-t-b8fb4324-a61c-4257-9606-2bbd686f27ac-0.png',
'https://i.postimg.cc/HnqdC88q/marga888-A-surfboard-leaning-against-the-wall-of-an-open-air-9a02a907-86aa-4334-8d97-dd02280a6b8d-2.png',
'https://i.postimg.cc/7PdxzdtK/marga888-A-surfboard-leaning-against-the-wall-of-an-open-air-9a02a907-86aa-4334-8d97-dd02280a6b8d-3.png',
'https://i.postimg.cc/G2pcPC15/marga888-A-surfboard-leaning-against-the-wall-of-an-outdoor-b-e88b9c62-e8b7-459b-8dc3-49fa56581ee7-0.png',
'https://i.postimg.cc/gJBGNTzk/marga888-A-surfboard-leaning-against-the-wall-of-an-outdoor-b-e88b9c62-e8b7-459b-8dc3-49fa56581ee7-1.png',
'https://i.postimg.cc/D0JnDP0Q/marga888-A-surfboard-leaning-against-the-wall-of-an-outdoor-b-e88b9c62-e8b7-459b-8dc3-49fa56581ee7-3.png',
'https://i.postimg.cc/W1MbT8nX/marga888-A-surfboard-leaning-against-the-wall-of-an-outdoor-b-ec1e6e44-edf5-420d-94c2-10513635e7a4-0.png',
'https://i.postimg.cc/yNs6dRpB/marga888-A-surfboard-leaning-against-the-wall-of-an-outdoor-b-ec1e6e44-edf5-420d-94c2-10513635e7a4-2.png',
'https://i.postimg.cc/VNgfbN2t/marga888-A-surfboard-leaning-against-the-wall-of-an-outdoor-b-ec1e6e44-edf5-420d-94c2-10513635e7a4-3.png',
'https://i.postimg.cc/PqVqRxKj/marga888-A-vintage-Jeep-parked-on-a-serene-beach-with-surfboa-0570da5b-92ef-49aa-9abb-8950edb1d252-0.png',
'https://i.postimg.cc/qRt7VTZC/marga888-A-vintage-Jeep-parked-on-a-serene-beach-with-surfboa-0570da5b-92ef-49aa-9abb-8950edb1d252-3.png',
'https://i.postimg.cc/fLv9yZfq/marga888-A-wide-angle-shot-of-a-beachfront-surf-shack-surfboa-0916d678-34ae-4a38-b5af-9dd18b8da3b8-0.png',
'https://i.postimg.cc/VvLbbT7f/marga888-A-wide-angle-shot-of-a-beachfront-surf-shack-surfboa-0916d678-34ae-4a38-b5af-9dd18b8da3b8-1.png',
'https://i.postimg.cc/7hsJ1Vcg/marga888-A-wide-angle-shot-of-a-beachfront-surf-shack-surfboa-0916d678-34ae-4a38-b5af-9dd18b8da3b8-2.png',
'https://i.postimg.cc/gcNhPzJn/marga888-A-wide-angle-shot-of-a-beachfront-surf-shack-surfboa-0916d678-34ae-4a38-b5af-9dd18b8da3b8-3.png',
'https://i.postimg.cc/GpCtyV2W/marga888-A-wide-shot-of-a-surfer-standing-on-a-sandy-cliff-lo-b05e0fc0-8dbc-4d12-b25b-9adb8473fbe3-2.png',
'https://i.postimg.cc/28gVzVf8/marga888-A-wide-shot-of-a-surfer-standing-on-a-sandy-shore-lo-ffd78bad-1d17-4e16-9ecb-cb4b2003f401-2.png',
'https://i.postimg.cc/DySSk1HM/marga888-a-woman-waxing-her-surfboard-near-the-shore-with-a-b-f6239216-9f83-49ee-bf09-d285a22ca159-0.png',
'https://i.postimg.cc/Z53004TP/marga888-a-woman-waxing-her-surfboard-near-the-shore-with-a-b-f6239216-9f83-49ee-bf09-d285a22ca159-2.png',
'https://i.postimg.cc/L51Fv4QN/marga888-calm-empty-beach-with-two-beach-umbrellas-and-a-sing-a2458560-7502-4de2-bf51-21f450b34ba3-2.png',
'https://i.postimg.cc/7PMVJrLk/marga888-Close-up-of-a-surfboard-fin-slicing-through-the-wate-49dbbf2e-2e82-4135-ad5f-b941ac4e1fb1-2.png',
'https://i.postimg.cc/HLq2Xp5p/marga888-Close-up-shot-of-a-surfers-hands-tying-an-ankle-leas-78ac1213-9898-4443-a528-844efefb5913-3.png',
'https://i.postimg.cc/nzdhNLkx/marga888-photo-of-white-surfboard-with-black-sticker-laying-o-1eeed837-ce38-463a-a48d-1e57ab0abc0a-2.png',
'https://i.postimg.cc/G3W4R4R3/marga888-Two-surfers-relaxing-on-their-boards-in-crystal-clea-3d4c5fd8-50c1-4d52-88f3-169774617a6d-1.png',
'https://i.postimg.cc/26nxxPFn/marga888-Wide-angle-shot-of-surfers-gear-scattered-on-the-san-a375bdaa-4fb7-4fa9-97c2-7797a0b8894a-1.png',
'https://i.postimg.cc/NfDpSvh4/marga888-Wide-angle-shot-of-surfers-silhouetted-against-a-pas-3ed7b292-5157-464f-8541-d9a29ec32ba5-0.png',
'https://i.postimg.cc/SxtVQLxY/marga888-Wide-angle-shot-of-surfers-silhouetted-against-a-pas-3ed7b292-5157-464f-8541-d9a29ec32ba5-2.png',
'https://i.postimg.cc/fbtCV3V2/marga888-Wide-angle-shot-of-surfers-silhouetted-against-a-pas-3ed7b292-5157-464f-8541-d9a29ec32ba5-3.png',
'https://i.postimg.cc/zBYC3xZv/marga888-Wide-angle-view-of-a-camper-van-parked-by-the-beach-fe4cfb5d-a544-4d07-a9db-aa5c116cda26-1.png',
'https://i.postimg.cc/DZQqG1ng/marga888-Wide-angle-view-of-a-camper-van-parked-by-the-beach-fe4cfb5d-a544-4d07-a9db-aa5c116cda26-2.png',
'https://i.postimg.cc/1XJwCPgV/marga888-Wide-angle-view-of-a-camper-van-parked-by-the-beach-fe4cfb5d-a544-4d07-a9db-aa5c116cda26-3.png',
'https://i.postimg.cc/02kCpX6J/marga888-Wide-shot-of-a-sandy-pathway-leading-through-beach-g-65a48781-dc89-4797-b993-d37623983598-0.png',
'https://i.postimg.cc/wBm56Srn/marga888-Wide-shot-of-a-sandy-pathway-leading-through-beach-g-80fb2868-643d-4ba2-bdcc-2b3aba0e0194-2.png',
'https://i.postimg.cc/2ym7922M/marga888-Wide-shot-of-a-sandy-pathway-leading-through-beach-g-ec049191-c050-4e52-b565-307e33f28011-1.png',
'https://i.postimg.cc/VvRBxnh6/marga888-Wide-shot-of-a-sandy-pathway-leading-through-beach-g-ec049191-c050-4e52-b565-307e33f28011-3.png'
];

async function implementCoastalVibesCollection() {
  try {
    console.log(`\n🎯 IMPLEMENTING COASTAL VIBES COLLECTION`);
    console.log(`Total URLs: ${coastalVibesUrls.length}`);

    // Generate all image objects
    const allImages = coastalVibesUrls.map((url, index) => ({
      id: `cv-${index + 1}`,
      url: url,
      title: `Coastal Vibes ${index + 1}`,
      category: 'Coastal Vibes',
      description: 'Coastal Vibes aesthetic flatlay'
    }));

    // Read current file
    const filePath = 'client/src/pages/flatlay-library.tsx';
    const fileContent = await fs.readFile(filePath, 'utf8');

    // Find Coastal Vibes collection start and end - this should be at the end
    const startMarker = "id: 'coastal-vibes',";
    const endMarker = "];";
    
    const startIndex = fileContent.indexOf(startMarker);
    if (startIndex === -1) {
      throw new Error('Could not locate Coastal Vibes collection start marker');
    }

    // Find the images array within the collection
    const collectionSection = fileContent.substring(startIndex);
    const imagesStartMarker = 'images: [';
    const imagesEndMarker = '    ]\n  }';
    
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

    console.log(`✅ Successfully implemented Coastal Vibes collection with ${allImages.length} images`);
    console.log(`📊 Collection Status: COMPLETE`);

  } catch (error) {
    console.error('❌ Error implementing Coastal Vibes collection:', error.message);
  }
}

implementCoastalVibesCollection();