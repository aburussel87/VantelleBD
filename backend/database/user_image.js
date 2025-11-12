const path = require('path');
const fs = require('fs');
const pool = require('./db'); // your PostgreSQL pool connection

// Update a single user's profile image
async function insertUserProfileImage(userId, imageFileName) {
  try {
    const imagePath = path.join(__dirname, '../images', imageFileName);
    const imageBuffer = fs.readFileSync(imagePath);

    const query = `
      UPDATE vantelle.users
      SET profile_image = $1
      WHERE user_id = $2
      RETURNING user_id;
    `;
    const values = [imageBuffer, userId];

    const result = await pool.query(query, values);
    console.log(`✅ Profile image updated for user ${result.rows[0].user_id}`);
  } catch (error) {
    console.error(`❌ Error updating profile image for user ${userId}:`, error.message);
  }
}

// Update images for all users
async function insertImagesForAllUsers() {
  try {
    const res = await pool.query(`SELECT user_id FROM vantelle.users`);
    const userIds = res.rows.map(row => row.user_id);

    console.log(`Found ${userIds.length} users. Updating profile images...`);

    for (const id of userIds) {
      await insertUserProfileImage(id, 'default-profile.jpg'); // Change filename if needed
    }

    console.log('🎉 All user profile images updated successfully!');
  } catch (error) {
    console.error('❌ Error during bulk update:', error.message);
  } finally {
    pool.end();
  }
}

// Run the function
insertUserProfileImage(1,'photo.jpeg'); // Example for user with ID 1
