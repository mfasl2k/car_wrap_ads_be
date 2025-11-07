import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Default admin credentials
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@carwrapad.com';
  const adminPassword = process.env.ADMIN_PASSWORD || 'Admin123!';

  // Hash the password
  const hashedPassword = await bcrypt.hash(adminPassword, 10);

  // Create or update admin user
  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      passwordHash: hashedPassword,
      userType: 'admin',
      isActive: true,
    },
    create: {
      email: adminEmail,
      passwordHash: hashedPassword,
      userType: 'admin',
      isActive: true,
      isVerified: true,
    },
  });

  console.log('✅ Admin user created/updated:');
  console.log(`   Email: ${admin.email}`);
  console.log(`   User ID: ${admin.userId}`);
  console.log(`   User Type: ${admin.userType}`);
  console.log('\n⚠️  IMPORTANT: Please change the default password immediately after first login!');
  console.log(`   Default credentials:\n   Email: ${adminEmail}\n   Password: ${adminPassword}`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
    console.log('\n🎉 Seeding completed successfully!');
  })
  .catch(async (e) => {
    console.error('❌ Error during seeding:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
