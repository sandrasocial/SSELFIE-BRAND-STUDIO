#!/usr/bin/env node

/**
 * TRAINING STATUS CHECKER
 * Checks Replicate training status and updates database accordingly
 */

import fetch from 'node-fetch';

const REPLICATE_API_TOKEN = process.env.REPLICATE_API_TOKEN;

async function checkTrainingStatus() {
  try {
    console.log('🔍 Checking Replicate training status...');
    
    const trainings = [
      { id: '2wfb0ats4hrma0cr23htkp24yc', user: 'ssa@ssasocial.com' },
      { id: '13p0vatdd9rmc0cr23kb914b3w', user: 'sandra@dibssocial.com' }
    ];
    
    for (const training of trainings) {
      console.log(`\nChecking ${training.user} (${training.id})...`);
      
      const response = await fetch(`https://api.replicate.com/v1/trainings/${training.id}`, {
        headers: {
          'Authorization': `Token ${REPLICATE_API_TOKEN}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log(`Status: ${data.status}`);
        
        if (data.version) {
          console.log(`Model Version: ${data.version}`);
          console.log(`✅ Training COMPLETED for ${training.user}`);
        } else {
          console.log(`❌ Training still in progress for ${training.user}`);
        }
      } else {
        console.log(`❌ API Error: ${response.status}`);
      }
    }
    
  } catch (error) {
    console.log(`❌ Error: ${error.message}`);
  }
}

checkTrainingStatus();
