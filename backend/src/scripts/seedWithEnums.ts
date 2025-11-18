import sequelize from '../config/database';
import User from '../models/User';
import { hashPassword } from '../utils/password';

async function seedDatabase() {
  try {
    console.log('Connecting to database...');
    await sequelize.authenticate();
    console.log('✓ Database connection established');

    console.log('\nSyncing database models...');
    await sequelize.sync({ force: true }); // WARNING: Drops all tables
    console.log('✓ Database synced');

    console.log('\n========== Seeding Users ==========\n');

    // Common password for all users
    const COMMON_PASSWORD = 'EmpChartIO@123';

    // Create preloaded users based on the org chart from PDF
    const users = [
      // System Admin
      {
        email: 'admin@empchartio.com',
        password: COMMON_PASSWORD,
        department: 'EXECUTIVE' as const,
        role: 'admin' as const,
        name: 'System Admin',
      },
      // L1 - CEO (Executive)
      {
        email: 'mark.hill@empchartio.com',
        password: COMMON_PASSWORD,
        department: 'EXECUTIVE' as const,
        role: 'L1' as const,
        name: 'Mark Hill',
      },
      // L1 - C-Suite Officers
      {
        email: 'joe.linux@empchartio.com',
        password: COMMON_PASSWORD,
        department: 'TECHNOLOGY' as const,
        role: 'L1' as const,
        name: 'Joe Linux',
      },
      {
        email: 'linda.may@empchartio.com',
        password: COMMON_PASSWORD,
        department: 'BUSINESS' as const,
        role: 'L1' as const,
        name: 'Linda May',
      },
      {
        email: 'john.green@empchartio.com',
        password: COMMON_PASSWORD,
        department: 'FINANCE' as const,
        role: 'L1' as const,
        name: 'John Green',
      },
      // L2 - Direct reports to Joe Linux (CTO)
      {
        email: 'ron.blomquist@empchartio.com',
        password: COMMON_PASSWORD,
        department: 'TECHNOLOGY' as const,
        role: 'L2' as const,
        name: 'Ron Blomquist',
      },
      {
        email: 'michael.rubin@empchartio.com',
        password: COMMON_PASSWORD,
        department: 'TECHNOLOGY' as const,
        role: 'L2' as const,
        name: 'Michael Rubin',
      },
      // L2 - Direct reports to Linda May (CBO)
      {
        email: 'alice.lopez@empchartio.com',
        password: COMMON_PASSWORD,
        department: 'BUSINESS' as const,
        role: 'L2' as const,
        name: 'Alice Lopez',
      },
      {
        email: 'mary.johnson@empchartio.com',
        password: COMMON_PASSWORD,
        department: 'BUSINESS' as const,
        role: 'L2' as const,
        name: 'Mary Johnson',
      },
      {
        email: 'kirk.douglas@empchartio.com',
        password: COMMON_PASSWORD,
        department: 'BUSINESS' as const,
        role: 'L2' as const,
        name: 'Kirk Douglas',
      },
      // L2 - Direct report to John Green (CFO)
      {
        email: 'erica.reel@empchartio.com',
        password: COMMON_PASSWORD,
        department: 'FINANCE' as const,
        role: 'L2' as const,
        name: 'Erica Reel',
      },
    ];

    for (const userData of users) {
      const passwordHash = await hashPassword(userData.password);
      await User.create({
        email: userData.email,
        passwordHash,
        department: userData.department,
        role: userData.role,
        isActive: true,
      });
      console.log(`✓ User created: ${userData.email} (${userData.role}) - Password: ${userData.password}`);
    }

    console.log('\n========================================');
    console.log('Preloaded Users - Common Password: EmpChartIO@123');
    console.log('========================================');
    console.log('ADMIN:');
    console.log('  - admin@empchartio.com (Admin)');
    console.log('\nEXECUTIVE (L1 - CEO):');
    console.log('  - mark.hill@empchartio.com (Chief Executive Officer)');
    console.log('\nTECHNOLOGY:');
    console.log('  L1 - joe.linux@empchartio.com (Chief Technology Officer)');
    console.log('  L2 - ron.blomquist@empchartio.com (Chief Information Security Officer)');
    console.log('  L2 - michael.rubin@empchartio.com (Chief Innovation Officer)');
    console.log('\nBUSINESS:');
    console.log('  L1 - linda.may@empchartio.com (Chief Business Officer)');
    console.log('  L2 - alice.lopez@empchartio.com (Chief Communications Officer)');
    console.log('  L2 - mary.johnson@empchartio.com (Chief Brand Officer)');
    console.log('  L2 - kirk.douglas@empchartio.com (Chief Business Development Officer)');
    console.log('\nFINANCE:');
    console.log('  L1 - john.green@empchartio.com (Chief Financial Officer)');
    console.log('  L2 - erica.reel@empchartio.com (Chief Customer Officer)');
    console.log('========================================\n');

    console.log('\n========================================');
    console.log('✓ Database seeded successfully!');
    console.log('========================================');
    console.log('Summary:');
    console.log('- Users: 11 (all from PDF org chart)');
    console.log('- Common Password: EmpChartIO@123');
    console.log('- Departments: 4 (EXECUTIVE, TECHNOLOGY, FINANCE, BUSINESS)');
    console.log('- Roles: admin, L1 (Officers), L2 (Managers/Chiefs)');
    console.log('========================================\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase();
