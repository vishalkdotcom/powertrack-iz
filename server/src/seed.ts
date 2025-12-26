import { db } from './db';
import { users, readings, bills } from './db/schema';
import { eq } from 'drizzle-orm';
import * as dotenv from 'dotenv';

dotenv.config();

async function seed() {
  console.log('🌱 Starting seed...');

  // 1. Create Default User
  const defaultEmail = 'default@example.com';
  let userId: string;

  const existingUser = await db.select().from(users).where(eq(users.email, defaultEmail));

  if (existingUser.length > 0) {
    console.log('User already exists, skipping creation.');
    userId = existingUser[0].id;
  } else {
    const newUser = await db.insert(users).values({
      email: defaultEmail,
    }).returning();
    userId = newUser[0].id;
    console.log(`User created: ${userId}`);
  }

  // 2. Create Sample Readings
  console.log('Creating sample readings...');
  // Check if any readings exist to avoid duplicates if run multiple times
  const existingReadings = await db.select().from(readings).where(eq(readings.userId, userId));

  if (existingReadings.length === 0) {
      await db.insert(readings).values([
        {
          userId: userId,
          date: '2023-08-01',
          groundFloorReading: 1000,
          firstFloorReading: 500,
          notes: 'Initial reading',
        },
        {
          userId: userId,
          date: '2023-09-01',
          groundFloorReading: 1200,
          firstFloorReading: 600,
          notes: 'September reading',
        },
      ]);
      console.log('Sample readings inserted.');
  } else {
      console.log('Readings already exist, skipping.');
  }

  // 3. Create Sample Bills
  console.log('Creating sample bills...');
  const existingBills = await db.select().from(bills).where(eq(bills.userId, userId));

  if (existingBills.length === 0) {
      await db.insert(bills).values([
        {
          userId: userId,
          billNumber: 'BILL-2023-001',
          billingPeriod: '2023-08',
          dueDate: '2023-09-15',
          amount: '150.50',
          unitsConsumed: 300,
          paidDate: '2023-09-10', // Paid
        },
        {
          userId: userId,
          billNumber: 'BILL-2023-002',
          billingPeriod: '2023-09',
          dueDate: '2023-10-15',
          amount: '180.00',
          unitsConsumed: 350,
          paidDate: null, // Unpaid
        },
      ]);
      console.log('Sample bills inserted.');
  } else {
      console.log('Bills already exist, skipping.');
  }

  console.log('✅ Seed complete.');
  process.exit(0);
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
