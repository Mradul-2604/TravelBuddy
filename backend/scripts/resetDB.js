const mongoose = require('mongoose');
require('dotenv').config();

const resetDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/travelbuddy', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    console.log('Connected to MongoDB');

    // Get all collections
    const collections = await mongoose.connection.db.listCollections().toArray();

    // Clear each collection
    for (const collection of collections) {
      await mongoose.connection.db.collection(collection.name).deleteMany({});
      console.log(`Cleared collection: ${collection.name}`);
    }

    console.log('Database reset completed successfully');
  } catch (error) {
    console.error('Error resetting database:', error);
  } finally {
    // Close the connection
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
};

// Run the reset function
resetDatabase();