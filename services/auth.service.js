const { PrismaClient } = require("@prisma/client");

// Local Imports
const comparePassword = require("../utils/comparePassword");

const prisma = new PrismaClient();

exports.findMeService = async (id) => {
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) return null;

  delete user.password;
  return user;
};

exports.signinService = async (email, password) => {
  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      password: true,
      email: true,
      role: true,
      first_name: true,
      last_name: true,
      phone: true,
      city: true,
    },
  });
  if (!user) return null;

  const checkPassword = comparePassword(password, user.password);
  if (!checkPassword) return null;

  delete user?.password;
  return user;
};

exports.signupService = async (userData) => {
  const user = await prisma.user.create({
    data: userData,
  });

  delete user?.password;
  return user;
};

exports.updateUserService = async (id, userData) => {
  const user = await prisma.user.update({
    where: { id },
    data: userData,
  });

  delete user?.password;
  return user;
};

exports.updatePasswordService = async (id, newPassword) => {
  await prisma.user.update({
    where: { id },
    data: {
      password: newPassword,
    },
  });

  return;
};

exports.makeOwnerService = async (id) => {
  await prisma.user.update({ where: { id }, data: { role: "OWNER" } });
  return;
};
