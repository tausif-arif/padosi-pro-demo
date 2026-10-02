import type { Request, Response } from 'express';
import * as tasksService from './tasks.service';
import type { ListTasksQuery, SaveSelectionInput } from './tasks.schema';

export async function listTasks(req: Request, res: Response): Promise<void> {
  const [tasks, categories, selectedTaskIds] = await Promise.all([
    tasksService.listTasks(req.query as unknown as ListTasksQuery),
    tasksService.listCategories(),
    req.user ? tasksService.getSelectedTaskIds(req.user.id) : Promise.resolve([]),
  ]);
  res.json({ tasks, categories, selectedTaskIds });
}

export async function getSelectedTasks(req: Request, res: Response): Promise<void> {
  const tasks = await tasksService.getSelectedTasks(req.user!.id);
  res.json({ tasks, count: tasks.length });
}

export async function saveSelection(req: Request, res: Response): Promise<void> {
  const tasks = await tasksService.saveSelection(req.user!.id, req.body as SaveSelectionInput);
  res.json({ tasks, count: tasks.length, message: 'Selection saved' });
}
