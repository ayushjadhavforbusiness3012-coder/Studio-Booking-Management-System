import { dataService } from './services/dataService';

async function run() {
  console.log("Calling getStats...");
  const stats = await dataService.getStats();
  console.log("getStats result:", stats);

  console.log("Calling getBookings...");
  const bookings = await dataService.getBookings();
  console.log("getBookings result length:", bookings.length);
}

run().catch(console.error);
