/**
 * LocalStorage Utilities
 * 
 * Helper functions for persisting user preferences and settings.
 * Handles edge cases like localStorage being unavailable or invalid data.
 */

const STORAGE_KEYS = {
  LAST_PROJECT: 'time-trackr-last-project'
} as const

/**
 * Get the last used project ID from localStorage
 * @returns The project ID or null if not found/invalid
 */
export const getLastProject = (): string | null => {
  try {
    if (typeof window === 'undefined') return null
    
    const stored = localStorage.getItem(STORAGE_KEYS.LAST_PROJECT)
    if (!stored) return null
    
    // Basic validation - should be a non-empty string
    if (typeof stored === 'string' && stored.trim().length > 0) {
      return stored
    }
    
    return null
  } catch (error) {
    console.warn('Failed to get last project from localStorage:', error)
    return null
  }
}

/**
 * Set the last used project ID in localStorage
 * @param projectId The project ID to store
 */
export const setLastProject = (projectId: string): void => {
  try {
    if (typeof window === 'undefined') return
    
    if (!projectId || typeof projectId !== 'string' || projectId.trim().length === 0) {
      console.warn('Invalid project ID provided to setLastProject:', projectId)
      return
    }
    
    localStorage.setItem(STORAGE_KEYS.LAST_PROJECT, projectId)
  } catch (error) {
    console.warn('Failed to set last project in localStorage:', error)
  }
}

/**
 * Clear the last used project from localStorage
 */
export const clearLastProject = (): void => {
  try {
    if (typeof window === 'undefined') return
    
    localStorage.removeItem(STORAGE_KEYS.LAST_PROJECT)
  } catch (error) {
    console.warn('Failed to clear last project from localStorage:', error)
  }
}

/**
 * Check if localStorage is available
 * @returns True if localStorage is available and working
 */
export const isLocalStorageAvailable = (): boolean => {
  try {
    if (typeof window === 'undefined') return false
    
    const test = '__localStorage_test__'
    localStorage.setItem(test, test)
    localStorage.removeItem(test)
    return true
  } catch {
    return false
  }
}
