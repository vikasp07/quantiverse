// utils/simulations.js
import { supabase } from './supabaseClient';

// Fetch all simulations
export async function fetchSimulations() {
  try {
    // Try backend endpoint first (has fallback to JSON)
    const response = await fetch('http://localhost:5000/admin/internships');
    if (response.ok) {
      const result = await response.json();
      if (result.data) {
        console.log('Fetched simulations from backend');
        return result.data;
      }
    }
  } catch (err) {
    console.warn('Backend fetch failed, trying Supabase...', err.message);
  }
  
  // Fallback to direct Supabase
  const { data, error } = await supabase
    .from('simulations')
    .select('*')
    .order('id', { ascending: true });

  if (error) {
    console.error('Error fetching simulations:', error.message);
    return [];
  }
  return data;
}

// Fetch tasks for a specific simulation - sorted by sequence (correct order)
export async function fetchTasksForSimulation(simulationId) {
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('simulation_id', simulationId)
    .order('sequence', { ascending: true, nullsLast: true });

  if (error) {
    console.error(`Error fetching tasks for simulation ${simulationId}:`, error.message);
    return [];
  }
  
  return data || [];
}


export const updateTaskProgress = async (userId, simulationId, taskId, status) => {
  try {
    console.log('Updating task progress:', { userId, simulationId, taskId, status });
    
    const now = new Date().toISOString();

    // Try to update first
    const { data: updateData, error: updateError, count } = await supabase
      .from('user_task_progress')
      .update({
        status: status,
        updated_at: now
      })
      .eq('user_id', userId)
      .eq('simulation_id', simulationId)
      .eq('task_id', taskId)
      .select()
      .single();

    // If update was successful, return the result
    if (updateError?.code !== 'PGRST116' && !updateError) {
      console.log('Task progress updated:', updateData);
      return updateData;
    }

    // If no row was found (404/PGRST116), insert a new record
    if (updateError?.code === 'PGRST116' || updateError?.message?.includes('0 rows')) {
      console.log('No existing record found, creating new one...');
      
      const { data: insertData, error: insertError } = await supabase
        .from('user_task_progress')
        .insert({
          user_id: userId,
          simulation_id: simulationId,
          task_id: taskId,
          status: status,
          updated_at: now,
          comment: null,
        })
        .select()
        .single();

      if (insertError) {
        console.error('Error inserting task progress:', insertError);
        throw insertError;
      }
      
      console.log('Task progress inserted:', insertData);
      return insertData;
    }

    // If there's any other error, throw it
    if (updateError) {
      console.error('Error updating task progress:', updateError);
      throw updateError;
    }

    return updateData;
  } catch (error) {
    console.error('Error in updateTaskProgress:', error);
    // Return a safe default instead of throwing to prevent UI crashes
    return {
      user_id: userId,
      simulation_id: simulationId,
      task_id: taskId,
      status: status,
      updated_at: new Date().toISOString()
    };
  }
};

// Get tasks with user progress
export async function getTasksWithUserProgress(simulationId, userId) {
  try {
    // First get all tasks for the simulation
    const tasks = await fetchTasksForSimulation(simulationId);
    
    if (!userId) {
      // If no user, return tasks with default status
      return tasks.map(task => ({
        ...task,
        status: 'not_started'
      }));
    }

    // Get user progress for these tasks
    const { data: progressData, error } = await supabase
      .from('user_task_progress')
      .select('task_id, status, updated_at')
      .eq('user_id', userId)
      .eq('simulation_id', simulationId)
      .in('task_id', tasks.map(t => t.id));

    if (error) {
      console.error('Error fetching user progress:', error);
      return tasks.map(task => ({ ...task, status: 'not_started' }));
    }

    // Merge tasks with progress
    return tasks.map(task => {
      const progress = progressData?.find(p => p.task_id === task.id);
      return {
        ...task,
        status: progress?.status || 'not_started',
        updated_at: progress?.updated_at || null
      };
    });
  } catch (error) {
    console.error('Error loading tasks with progress:', error);
    return [];
  }
}


