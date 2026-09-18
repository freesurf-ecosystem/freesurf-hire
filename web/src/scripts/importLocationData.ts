import { importAllLocationData, getLocationDataStats } from '../utils/dataImport';

// Direct script to import location data
async function runImport() {
  console.log('🚀 Starting location data import...');
  
  try {
    // Import all data
    await importAllLocationData();
    
    // Get final statistics
    const stats = await getLocationDataStats();
    
    console.log('✅ Import completed successfully!');
    console.log(`📊 Final Statistics:`);
    console.log(`   Cities: ${stats.cities.toLocaleString()}`);
    console.log(`   Counties: ${stats.counties.toLocaleString()}`);
    console.log(`   Total: ${stats.total.toLocaleString()}`);
    console.log(`   Potential Landing Pages: ${(25 * stats.total).toLocaleString()}`);
    
  } catch (error) {
    console.error('❌ Import failed:', error);
  }
}

// Run the import
runImport();