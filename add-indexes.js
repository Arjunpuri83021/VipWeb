// Database indexing script for performance optimization
// Run this script once to add indexes for better query performance

const mongoose = require('mongoose');
const Data = require('./model/dataModel');

// MongoDB connection (update with your connection string)
const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/your-database-name';

async function addIndexes() {
    try {
        console.log('🚀 Connecting to MongoDB...');
        await mongoose.connect(mongoUri);
        console.log('✅ Connected to MongoDB');

        console.log('📊 Adding performance indexes...');

        // Add index on tags array for faster tag-based queries
        await Data.collection.createIndex({ "tags": 1 });
        console.log('✅ Added index on tags field');

        // Add index on createdAt for sorting performance
        await Data.collection.createIndex({ "createdAt": -1 });
        console.log('✅ Added index on createdAt field (descending)');

        // Add compound index for tags + createdAt (for tag pages with sorting)
        await Data.collection.createIndex({ "tags": 1, "createdAt": -1 });
        console.log('✅ Added compound index on tags + createdAt');

        // Add index on imageUrl for tag image queries
        await Data.collection.createIndex({ "imageUrl": 1 });
        console.log('✅ Added index on imageUrl field');

        // Add index on name array for pornstar queries
        await Data.collection.createIndex({ "name": 1 });
        console.log('✅ Added index on name field');

        // Add text index for search functionality
        await Data.collection.createIndex({ 
            "titel": "text", 
            "desc": "text", 
            "tags": "text", 
            "name": "text" 
        });
        console.log('✅ Added text index for search functionality');

        console.log('🎉 All indexes added successfully!');
        
        // Show current indexes
        const indexes = await Data.collection.indexes();
        console.log('\n📋 Current indexes:');
        indexes.forEach((index, i) => {
            console.log(`${i + 1}. ${JSON.stringify(index.key)} - ${index.name}`);
        });

    } catch (error) {
        console.error('❌ Error adding indexes:', error);
    } finally {
        await mongoose.disconnect();
        console.log('🔌 Disconnected from MongoDB');
        process.exit(0);
    }
}

// Run the indexing script
addIndexes();
