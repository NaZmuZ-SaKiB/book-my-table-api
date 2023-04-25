const jwt = require("jsonwebtoken");

exports.generateToken = (user) => {
  const payload = {
    email: user.email,
    role: user.role,
    id: user.id,
  };
  const token = jwt.sign(payload, process.env.TOKEN_SECRET, {
    expiresIn: "3days",
  });

  return token;
};
