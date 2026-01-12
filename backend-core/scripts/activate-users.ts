import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function activateUsers() {
  try {
    console.log('🔄 Updating users with PENDING_VERIFICATION status to ACTIVE...');
    
    const result = await prisma.user.updateMany({
      where: {
        status: 'PENDING_VERIFICATION',
      },
      data: {
        status: 'ACTIVE',
      },
    });

    console.log(`✅ Successfully updated ${result.count} user(s) to ACTIVE status`);
    
    // Also check for any INACTIVE users that should be ACTIVE
    const inactiveResult = await prisma.user.updateMany({
      where: {
        status: 'INACTIVE',
      },
      data: {
        status: 'ACTIVE',
      },
    });

    if (inactiveResult.count > 0) {
      console.log(`✅ Also updated ${inactiveResult.count} INACTIVE user(s) to ACTIVE status`);
    }

    console.log('\n✨ All users are now ACTIVE and can access the platform!');
  } catch (error) {
    console.error('❌ Error updating users:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

activateUsers();

