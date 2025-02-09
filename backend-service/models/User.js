module.exports = {
  createUser: async (pool, username, email, hashedPassword) => {
    return pool.query(
      "INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING id, username, email",
      [username, email, hashedPassword]
    );
  },
  getUserByEmail: async (pool, email) => {
    return pool.query("SELECT * FROM users WHERE email = $1", [email]);
  },
};
