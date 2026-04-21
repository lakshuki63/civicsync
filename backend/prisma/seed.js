const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Admin user
  const adminHash = await bcrypt.hash('Admin@123', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@civicsync.gov.in' },
    update: {},
    create: {
      name: 'System Administrator',
      email: 'admin@civicsync.gov.in',
      phone: '9000000001',
      passwordHash: adminHash,
      role: 'ADMIN',
      aadhaarVerified: true,
    },
  });

  // Officer users per department
  const departments = ['PROPERTY_TAX', 'ELECTRICITY', 'WATER', 'GAS', 'LAND_RECORDS'];
  const officerNames = {
    PROPERTY_TAX: 'Priya Sharma',
    ELECTRICITY: 'Arjun Reddy',
    WATER: 'Meera Patel',
    GAS: 'Suresh Nair',
    LAND_RECORDS: 'Kavitha Rao',
  };

  for (const dept of departments) {
    const hash = await bcrypt.hash('Officer@123', 12);
    const phone = `900000000${departments.indexOf(dept) + 2}`;
    await prisma.user.upsert({
      where: { email: `officer.${dept.toLowerCase()}@civicsync.gov.in` },
      update: {},
      create: {
        name: officerNames[dept],
        email: `officer.${dept.toLowerCase()}@civicsync.gov.in`,
        phone,
        passwordHash: hash,
        role: 'OFFICER',
        department: dept,
        aadhaarVerified: true,
      },
    });
  }

  // Demo citizen
  const citizenHash = await bcrypt.hash('Citizen@123', 12);
  const citizen = await prisma.user.upsert({
    where: { email: 'citizen@example.com' },
    update: {},
    create: {
      name: 'Rajesh Kumar',
      email: 'citizen@example.com',
      phone: '9876543210',
      passwordHash: citizenHash,
      role: 'CITIZEN',
      aadhaarLast4: '4521',
      aadhaarVerified: true,
    },
  });

  // Demo property
  const property = await prisma.property.upsert({
    where: { registrationNumber: 'KA-BLR-2023-00421' },
    update: {},
    create: {
      registrationNumber: 'KA-BLR-2023-00421',
      plotNumber: 'Plot 45-B',
      address: '123, MG Road, Whitefield, Bengaluru',
      district: 'Bengaluru Urban',
      state: 'Karnataka',
      area: 1200,
      previousOwnerName: 'Mohan Das',
      previousOwnerPhone: '9811223344',
    },
  });

  // Demo transfer request
  const existing = await prisma.transferRequest.findFirst({ where: { propertyId: property.id } });
  if (!existing) {
    await prisma.transferRequest.create({
      data: {
        propertyId: property.id,
        citizenId: citizen.id,
        status: 'IN_REVIEW',
        totalFee: 2150,
        submittedAt: new Date(Date.now() - 3 * 24 * 3600000),
        departmentStatuses: {
          create: departments.map((dept, i) => ({
            department: dept,
            status: i < 2 ? 'APPROVED' : 'PENDING',
          })),
        },
      },
    });
  }

  console.log('✅ Seed complete!');
  console.log('\n📋 Demo Credentials:');
  console.log('  Admin     → admin@civicsync.gov.in     / Admin@123');
  console.log('  Officer   → officer.property_tax@civicsync.gov.in / Officer@123');
  console.log('  Citizen   → citizen@example.com        / Citizen@123');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
