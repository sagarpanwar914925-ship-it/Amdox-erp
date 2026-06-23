"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function getProjects(organizationId?: string) {
  try {
    const projects = await prisma.project.findMany({
      where: organizationId ? { organizationId } : undefined,
      include: {
        manager: true,
        tasks: true
      },
      orderBy: { endDate: 'asc' },
      take: 20
    });

    const colors = ["#6366f1", "#22c55e", "#f59e0b", "#3b82f6", "#ec4899"];

    return projects.map((proj, i) => {
      const doneTasks = proj.tasks.filter(t => t.status === "DONE").length;
      const totalTasks = proj.tasks.length;
      const progress = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;
      
      return {
        id: proj.code,
        name: proj.name,
        code: proj.code,
        status: proj.status,
        priority: "MEDIUM", // Priority is not directly on Project schema, fallback
        start: proj.startDate.toISOString().split('T')[0],
        end: proj.endDate.toISOString().split('T')[0],
        budget: Number(proj.budget),
        actual: Math.floor(Number(proj.budget) * (Math.random() * 0.8)), // Mocking actual spend
        progress,
        manager: proj.manager ? `${proj.manager.firstName} ${proj.manager.lastName}` : "Unassigned",
        team: Math.floor(Math.random() * 10) + 2, // Mocking team size
        tasks: { total: totalTasks, done: doneTasks },
        color: colors[i % colors.length],
      };
    });
  } catch (error) {
    console.error("Failed to fetch projects:", error);
    return null;
  }
}

export async function getTasks(organizationId?: string) {
  try {
    const tasks = await prisma.task.findMany({
      where: organizationId ? { project: { organizationId } } : undefined,
      include: {
        project: true,
        assignee: true
      },
      orderBy: { dueDate: 'asc' },
      take: 50
    });

    return tasks.map(task => ({
      id: task.id, // Or task code if added
      project: task.project.code,
      title: task.title,
      assignee: task.assignee ? `${task.assignee.firstName} ${task.assignee.lastName}` : "Unassigned",
      priority: task.priority,
      due: task.dueDate ? task.dueDate.toLocaleDateString('en-US', { month: 'short', day: '2-digit' }) : "No Date",
      status: task.status,
      hrs: Math.floor(Math.random() * 40) + 8 // Mocking estimated hours
    }));
  } catch (error) {
    console.error("Failed to fetch tasks:", error);
    return null;
  }
}
