import Dexie, { type Table } from 'dexie'
import { v4 as uuidv4 } from 'uuid'

// Define the database schema
export interface Project {
  id: string
  name: string
  color?: string
  createdAt: string
}

export interface Entry {
  id: string
  projectId?: string
  startTs: string
  endTs?: string
  note?: string
  source: 'manual' | 'timer'
  createdAt: string
}

export class TimeTrackrDB extends Dexie {
  projects!: Table<Project>
  entries!: Table<Entry>

  constructor() {
    super('TimeTrackrDB')
    this.version(1).stores({
      projects: 'id, name, color, createdAt',
      entries: 'id, projectId, startTs, endTs, note, source, createdAt'
    })
  }
}

export const db = new TimeTrackrDB()

// Utility functions for CRUD operations
export const projectService = {
  async create(name: string, color?: string): Promise<Project> {
    const project: Project = {
      id: uuidv4(),
      name,
      color,
      createdAt: new Date().toISOString()
    }
    await db.projects.add(project)
    return project
  },

  async getAll(): Promise<Project[]> {
    return await db.projects.orderBy('createdAt').toArray()
  },

  async getById(id: string): Promise<Project | undefined> {
    return await db.projects.get(id)
  },

  async update(id: string, updates: Partial<Omit<Project, 'id' | 'createdAt'>>): Promise<void> {
    await db.projects.update(id, updates)
  },

  async delete(id: string): Promise<void> {
    // Check if project has entries
    const entryCount = await db.entries.where('projectId').equals(id).count()
    if (entryCount > 0) {
      throw new Error('Cannot delete project with existing entries')
    }
    await db.projects.delete(id)
  }
}

export const entryService = {
  async create(data: Omit<Entry, 'id' | 'createdAt'>): Promise<Entry> {
    const entry: Entry = {
      id: uuidv4(),
      ...data,
      createdAt: new Date().toISOString()
    }
    await db.entries.add(entry)
    return entry
  },

  async getAll(): Promise<Entry[]> {
    return await db.entries.orderBy('startTs').reverse().toArray()
  },

  async getByDateRange(startDate: string, endDate: string): Promise<Entry[]> {
    return await db.entries
      .where('startTs')
      .between(startDate, endDate, true, true)
      .reverse()
      .toArray()
  },

  async getByProject(projectId: string): Promise<Entry[]> {
    return await db.entries
      .where('projectId')
      .equals(projectId)
      .reverse()
      .toArray()
  },

  async getRunning(): Promise<Entry | undefined> {
    return await db.entries
      .where('endTs')
      .equals('')
      .first()
  },

  async getById(id: string): Promise<Entry | undefined> {
    return await db.entries.get(id)
  },

  async update(id: string, updates: Partial<Omit<Entry, 'id' | 'createdAt'>>): Promise<void> {
    await db.entries.update(id, updates)
  },

  async delete(id: string): Promise<void> {
    await db.entries.delete(id)
  },

  async stopRunning(): Promise<void> {
    const runningEntry = await this.getRunning()
    if (runningEntry) {
      await this.update(runningEntry.id, { endTs: new Date().toISOString() })
    }
  }
}

// React hooks for data management
import { useLiveQuery } from 'dexie-react-hooks'

export const useProjects = () => {
  return useLiveQuery(() => projectService.getAll())
}

export const useEntries = () => {
  return useLiveQuery(() => entryService.getAll())
}

export const useRunningEntry = () => {
  return useLiveQuery(() => entryService.getRunning())
}

export const useEntriesByDateRange = (startDate: string, endDate: string) => {
  return useLiveQuery(() => entryService.getByDateRange(startDate, endDate))
}

export const useEntriesByProject = (projectId: string) => {
  return useLiveQuery(() => entryService.getByProject(projectId))
}
