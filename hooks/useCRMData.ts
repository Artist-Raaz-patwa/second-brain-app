import { useLocalStorage } from './useLocalStorage';
import { Project, Task, Subtask } from '../types';

const initialProjects: Project[] = [
    { id: 'proj-1', name: 'Website Redesign', companyName: 'Innovate Corp', description: 'Complete overhaul of the main corporate website.', status: 'In Progress', isArchived: false },
    { id: 'proj-2', name: 'Mobile App Development', companyName: 'Tech Solutions', description: 'Develop a new cross-platform mobile application.', status: 'Not Started', isArchived: false },
];

const initialTasks: Task[] = [
    { id: 'task-1', projectId: 'proj-1', title: 'Design Mockups', price: 1500, status: 'In Progress', subtasks: [{id: 'sub-1', title: 'Homepage design', completionTime: { hours: 5, minutes: 30 }}, {id: 'sub-2', title: 'About page design', completionTime: null}], completionTime: null },
    { id: 'task-2', projectId: 'proj-1', title: 'Frontend Development', price: 4000, status: 'To Do', subtasks: [], completionTime: null },
    { id: 'task-3', projectId: 'proj-2', title: 'Setup Project Environment', price: 500, status: 'To Do', subtasks: [], completionTime: null },
]

export const useCRMData = () => {
    const [projects, setProjects] = useLocalStorage<Project[]>('secondbrain-crm-projects', initialProjects);
    const [tasks, setTasks] = useLocalStorage<Task[]>('secondbrain-crm-tasks', initialTasks);

    // Project functions
    const addProject = (project: Omit<Project, 'id' | 'isArchived'>) => {
        const newProject: Project = { ...project, id: `proj-${Date.now()}`, isArchived: false };
        setProjects(prev => [newProject, ...prev]);
        return newProject;
    };
    const updateProject = (projectId: string, updates: Partial<Project>) => {
        setProjects(prev => prev.map(p => p.id === projectId ? { ...p, ...updates } : p));
    };
    const deleteProject = (projectId: string) => {
        setProjects(prev => prev.filter(p => p.id !== projectId));
        setTasks(prev => prev.filter(t => t.projectId !== projectId)); // also delete associated tasks
    };
    const toggleProjectArchiveStatus = (projectId: string) => {
        setProjects(prev => prev.map(p => 
            p.id === projectId ? { ...p, isArchived: !(p.isArchived ?? false) } : p
        ));
    };


    // Task functions
    const addTask = (task: Omit<Task, 'id' | 'subtasks' | 'completionTime' | 'completedAt'>) => {
        const newTask: Task = { ...task, id: `task-${Date.now()}`, subtasks: [], completionTime: null };
        setTasks(prev => [...prev, newTask]);
        return newTask;
    };
    const updateTask = (taskId: string, updates: Partial<Task>) => {
        setTasks(prev => prev.map(t => {
            if (t.id === taskId) {
                const newT = { ...t, ...updates };
                // If status is changed to 'Done', set completedAt
                if (updates.status === 'Done' && t.status !== 'Done') {
                    newT.completedAt = new Date().toISOString();
                }
                // If status is changed from 'Done' to something else, clear completion data
                if (updates.status && updates.status !== 'Done' && t.status === 'Done') {
                    newT.completedAt = undefined;
                    newT.completionTime = null;
                }
                return newT;
            }
            return t;
        }));
    };
    const deleteTask = (taskId: string) => {
        setTasks(prev => prev.filter(t => t.id !== taskId));
    };

    // Subtask functions
    const addSubtask = (taskId: string, subtaskTitle: string) => {
        const newSubtask: Subtask = { id: `sub-${Date.now()}`, title: subtaskTitle, completionTime: null };
        setTasks(prev => prev.map(t => t.id === taskId ? { ...t, subtasks: [...t.subtasks, newSubtask] } : t));
    };
    const updateSubtask = (taskId: string, subtaskId: string, updates: Partial<Subtask>) => {
        setTasks(prev => prev.map(t => {
            if (t.id === taskId) {
                return { ...t, subtasks: t.subtasks.map(st => st.id === subtaskId ? { ...st, ...updates } : st) };
            }
            return t;
        }));
    };
    const deleteSubtask = (taskId: string, subtaskId: string) => {
        setTasks(prev => prev.map(t => {
            if (t.id === taskId) {
                return { ...t, subtasks: t.subtasks.filter(st => st.id !== subtaskId) };
            }
            return t;
        }));
    };

    return {
        projects,
        tasks,
        addProject,
        updateProject,
        deleteProject,
        toggleProjectArchiveStatus,
        addTask,
        updateTask,
        deleteTask,
        addSubtask,
        updateSubtask,
        deleteSubtask,
    };
};