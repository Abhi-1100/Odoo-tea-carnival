const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Seed default payment methods
  const paymentMethods = [
    { name: 'Cash', type: 'cash', isEnabled: true },
    { name: 'Digital / Card', type: 'digital', isEnabled: true },
    { name: 'UPI QR', type: 'upi', isEnabled: false },
  ];

  for (const pm of paymentMethods) {
    await prisma.paymentMethod.upsert({
      where: { name: pm.name },
      update: {},
      create: pm,
    });
  }

  console.log('✅ Default payment methods seeded');

  // Seed a default admin user (password: admin123)
  const bcrypt = require('bcryptjs');
  const passwordHash = await bcrypt.hash('admin123', 10);

  await prisma.user.upsert({
    where: { email: 'admin@pos.com' },
    update: {},
    create: {
      name: 'Admin',
      email: 'admin@pos.com',
      passwordHash,
      role: 'admin',
    },
  });

  console.log('✅ Default admin user seeded (admin@pos.com / admin123)');

  const existingSettings = await prisma.selfOrderSettings.findFirst();
  if (!existingSettings) {
    await prisma.selfOrderSettings.create({
      data: {
        isEnabled: false,
        mode: 'online_ordering',
        payAtCounter: true,
          backgroundColor: '#95416a',
        backgroundImages: [],
      },
    });
  }

  console.log('✅ Default self-order settings seeded');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
