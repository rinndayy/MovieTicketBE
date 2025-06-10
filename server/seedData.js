// backend/seedData.js
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Movie = require('./src/models/Movie'); // Model của bạn
const connectDB = require('./src/config/db'); // File connect DB
const fs = require('fs');

dotenv.config();
connectDB();

// Đọc dữ liệu từ 1 file JSON (ví dụ: data/movies.json)
const movies = JSON.parse(fs.readFileSync('./src/data/movie.json', 'utf-8'));

const seedMovies = async () => {
  try {
    await Movie.deleteMany();
    await Movie.insertMany(movies);
    console.log('✅ Movies Seeded!');
    process.exit();
  } catch (error) {
    console.error('❌ Error seeding movies:', error);
    process.exit(1);
  }
};

seedMovies();
