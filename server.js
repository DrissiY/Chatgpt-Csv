const express = require('express');
const multer = require('multer');
const fs = require('fs').promises; // Use fs.promises for async file writing
const axios = require('axios');
const cors = require('cors');

const app = express();
const port = 8000;
app.use(cors());

const openaiApiKey = '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';
const openaiEndpoint = 'https://api.openai.com/v1/engines/davinci-codex/completions';

const processCSV = async (csvData) => {
  const lines = csvData.split('\n');
  const requests = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line !== '') {
      const columns = line.split(',');
      const productName = columns[0].trim();
      const productDescription = columns[1].trim();

      const prompt = `Classify the category for the product: "${productName}" with description: "${productDescription}". Options:  Visage - soin 	
      Visage - soin - crème	
      Visage - soin - huile	
      Visage - soin - sérum	
      Visage - soin - contour des yeux 	
      Visage - soin - lèvres	
      Visage - soin - cils & sourcils	
      Visage - soin - crèmes solaire	
        
      Visage - besoins	
      Visage - besoins - hydratant & nourrissant	
      Visage - besoins - anti-ride & anti-age 	
      Visage - besoins - anti-imperfections	
      Visage - besoins - matifiant	
      Visage - besoins - anti-taches	
      Visage - besoins - peaux sensibles	
      Visage - besoins - peaux normales 	
      Visage - besoins - peaux mixtes à grasses 	
        
      Visage - masque & gommage 	
      Visage - masque & gommage - masques	
      Visage - masque & gommage - gommages 	
      Visage - masque & gommage - peeling 	
        
      Visage - démaquillant & nettoyant 	
      Visage - démaquillant & nettoyant - eau micellaire	
      Visage - démaquillant & nettoyant - nettoyant	
      Visage - démaquillant & nettoyant - lotion 	
      Visage - démaquillant & nettoyant - démaquillant 	
        
      Corps	
      Corps - huile, crème & lait  	
      Corps - huile, crème & lait - crème hydratante	
      Corps - huile, crème & lait - lait hydratant 	
      Corps - huile, crème & lait - huile nourrissante 	
      Corps - huile, crème & lait - crème solaire	
        
      Corps - gommage 	
      Corps - gommage - gommage pour le corps 	
        
      Corps - mains & pieds	
      Corps - mains & pieds - crème pour les mains 	
      Corps - mains & pieds - crème pour les pieds 	
      Corps - mains & pieds - exfoliant 	
        
      Cheveux 	
      Cheveux - shampoing 	
      Cheveux - shampoing - après shampoing	
      Cheveux - shampoing - shampoing 	
      Cheveux - shampoing - pré-shampoing 	
        
      Cheveux - co-wash, conditionner & soin	
      Cheveux - co-wash, conditionner & soin - masque	
      Cheveux - co-wash, conditionner & soin - co-wash	
      Cheveux - co-wash, conditionner & soin - conditionner	
      Cheveux - co-wash, conditionner & soin - soin sans rinçage 	
      Cheveux - co-wash, conditionner & soin - huile capillaire 	
        
      Cheveux - coiffant & fixant 	
      Cheveux - coiffant & fixant - gel	
      Cheveux - coiffant & fixant - mousse 	
      Cheveux - coiffant & fixant - beurre	
      Cheveux - coiffant & fixant - laque 	
      Cheveux - coiffant & fixant - cire	
      Cheveux - coiffant & fixant - spray	
      Cheveux - coiffant & fixant - crème 	
        
      Cheveux - coloration 	
      Cheveux - coloration - coloration 	
      Cheveux - coloration - décoloration 	
        
      Cheveux - soins spécifiques 	
      Cheveux - soins spécifiques - sérum	
      Cheveux - soins spécifiques - défrisant 	
      Cheveux - soins spécifiques - texturisant	
      Cheveux - soins spécifiques - assouplissant 	
      Cheveux - soins spécifiques - thermoprotecteur 	
        
      Cheveux - complément alimentaire	
      Cheveux - complément alimentaire - cheveux 	
      Cheveux - complément alimentaire - détox 	
      Cheveux - complément alimentaire - peau	
        
      Maquillage 	
      Maquillage - teint 	
      Maquillage - teint - fond de teint 	
      Maquillage - teint - poudre de teint 	
      Maquillage - teint - anti-cerne / correcteur 	
      Maquillage - teint - blush 	
      Maquillage - teint - hilighter	
      Maquillage - teint - base de teint 	
      Maquillage - teint - démaquillant 	
        
      Maquillage - yeux 	
      Maquillage - yeux - mascara 	
      Maquillage - yeux - fard à paupière 	
      Maquillage - yeux - eyeliner 	
      Maquillage - yeux - crayon 	
      Maquillage - yeux - base à paupières 	
      Maquillage - yeux - faux cils 	
      Maquillage - yeux - démaquillant  	
        
      Maquillage - lèvres 	
      Maquillage - lèvres - rouge à lèvres 	
      Maquillage - lèvres - gloss	
      Maquillage - lèvres - baume	
      Maquillage - lèvres - crayons	
      Maquillage - lèvres - base 	
      Maquillage - lèvres - repulpeur	
        
      Maquillage - sourcils	
      Maquillage - sourcils - crayons & poudre 	
      Maquillage - sourcils - gel & mascara 	
      Maquillage - sourcils - kit	
        
      Maquillage - palette	
      Maquillage - palette - yeux	
      Maquillage - palette - teint	
      Maquillage - palette - contouring 	
      Maquillage - palette - rouge à lèvres 	
        
      Maquillage - pinceau	
      Maquillage - pinceau - teint 	
      Maquillage - pinceau - yeux & sourcils	
      Maquillage - pinceau - kit	
        
      Maquillage - ongle	
      Maquillage - ongle - vernis 	
      Maquillage - ongle - soins	
      Maquillage - ongle - base & top-coat 	
      Maquillage - ongle - dissolvant	
        
      Coffret 	
      Coffret - coffret cheveux 	
      Coffret - coffret visage	
      Coffret - coffret corps	
        
      Parfum 	
      Parfum - femme	
      Parfum - femme - marque*	
        
      Parfum - homme	
      Parfum - homme - marque*	
        
      Parfum - enfant 	
      Parfum - enfant - marque*	
        
      Accessoires 	
      Accessoires - cheveux 	
      Accessoires - cheveux - brosse & peigne	
      Accessoires - cheveux - élastique & bandeau	
      Accessoires - cheveux - bonnet & serviette 	
        
      Accessoires - visage	
      Accessoires - visage - éponge 	
      Accessoires - visage - bandeau 	
      Accessoires - visage - brosse nettoyante	
      Accessoires - visage - cotton	
        
      Accessoires - corps	
      Accessoires - corps - éponge	
      Accessoires - corps - gant	
      Accessoires - corps - fleur de douche 	
        
      Accessoires - barbe	
      Accessoires - barbe - peigne	
      Accessoires - barbe - ciseaux	`;

      // Push the API request promise to the array
      requests.push(
        axios.post(
          openaiEndpoint,
          {
            prompt,
            max_tokens: 1,
          },
          {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${openaiApiKey}`,
            },
          }
        ).then(response => ({
          productName,
          category: response.data.choices[0].text.trim(),
        })).catch(error => {
          console.error(`Error calling OpenAI API for ${productName}:`, error);
          throw new Error('Failed to process CSV');
        })
      );
    }
  }

  try {
    // Use Promise.all to concurrently execute the API requests
    const results = await Promise.all(requests);

    // Create a new CSV with the results
    const newCSV = 'Product Name,Category\n' + results.map(result => `${result.productName},${result.category}`).join('\n');
    await fs.writeFile('path/to/your/generated/file.csv', newCSV);

    return results;
  } catch (error) {
    console.error('Error processing CSV:', error);
    throw new Error('Failed to process CSV');
  }
};

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

app.post('/upload', upload.single('file'), async (req, res) => {
  const csvData = req.file.buffer.toString('utf8');

  try {
    const processingResults = await processCSV(csvData);
    res.send('File processed successfully!');
  } catch (error) {
    console.error('Error processing CSV:', error);
    res.status(500).send('Internal server error');
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
