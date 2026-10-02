import { prisma } from '../../config/prisma';
import { ApiError } from '../../common/errors/apiError';
import type { ListTasksQuery, SaveSelectionInput } from './tasks.schema';

export interface TaskView {
  id: string;
  category: string;
  title: string;
  description: string;
}

const taskSelect = { id: true, category: true, title: true, description: true } as const;

export async function listTasks({ search, category }: ListTasksQuery = {}): Promise<TaskView[]> {
  return prisma.task.findMany({
    where: {
      ...(category ? { category: { equals: category, mode: 'insensitive' as const } } : {}),
      ...(search
        ? {
            OR: [
              { title: { contains: search, mode: 'insensitive' as const } },
              { description: { contains: search, mode: 'insensitive' as const } },
            ],
          }
        : {}),
    },
    select: taskSelect,
    orderBy: [{ category: 'asc' }, { title: 'asc' }],
  });
}

export async function listCategories(): Promise<string[]> {
  const rows = await prisma.task.findMany({ distinct: ['category'], select: { category: true } });
  return rows.map((row) => row.category);
}

export async function getSelectedTasks(userId: string): Promise<TaskView[]> {
  const rows = await prisma.userTask.findMany({
    where: { userId },
    select: { task: { select: taskSelect } },
    orderBy: { createdAt: 'asc' },
  });
  return rows.map((row) => row.task);
}

export async function getSelectedTaskIds(userId: string): Promise<string[]> {
  const rows = await prisma.userTask.findMany({
    where: { userId },
    select: { taskId: true },
  });
  return rows.map((row) => row.taskId);
}

export async function saveSelection(userId: string, { taskIds }: SaveSelectionInput): Promise<TaskView[]> {
  if (taskIds.length === 0) {
    await prisma.userTask.deleteMany({ where: { userId } });
    return [];
  }

  const found = await prisma.task.findMany({ where: { id: { in: taskIds } }, select: { id: true } });
  if (found.length !== taskIds.length) {
    const known = new Set(found.map((task) => task.id));
    const unknown = taskIds.filter((id) => !known.has(id));
    throw ApiError.badRequest('UNKNOWN_TASKS', 'One or more selected tasks do not exist', { taskIds: unknown });
  }

  await prisma.$transaction([
    prisma.userTask.deleteMany({ where: { userId } }),
    prisma.userTask.createMany({ data: taskIds.map((taskId) => ({ userId, taskId })) }),
  ]);

  return getSelectedTasks(userId);
}
