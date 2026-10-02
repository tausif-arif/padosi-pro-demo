import { PrismaClient } from '@prisma/client';
import { tasks } from './taskCatalogue';

const prisma = new PrismaClient();

async function main(): Promise<void> {
  console.log(`Seeding ${tasks.length} tasks across 4 categories...`);

  for (const task of tasks) {
    await prisma.task.upsert({
      where: { title: task.title },
      create: task,
      update: { category: task.category, description: task.description },
    });
  }

  const count = await prisma.task.count();
  const byCategory = await prisma.task.groupBy({ by: ['category'], _count: { _all: true } });
  console.log(`Catalogue now holds ${count} tasks:`);
  byCategory.forEach((row) => console.log(`  ${row._count._all} x ${row.category}`));
}

main()
  .catch((error) => {
    console.error('Seed failed:', error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
