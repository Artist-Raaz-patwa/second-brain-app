import React, { useState, useMemo, useEffect } from 'react';
import { useCRMData } from '../../hooks/useCRMData';
import { Project, Task, Subtask } from '../../types';
import { useSettings } from '../../contexts/SettingsContext';

// --- ICONS --- //
const ProjectIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"></polygon><polyline points="2 17 12 22 22 17"></polyline><polyline points="2 12 12 17 22 12"></polyline></svg>;
const TaskIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path><rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect></svg>;
const CheckIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>;
const ValueIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>;
const CompletedIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>;
const PriceIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>;
const DotsIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1"></circle><circle cx="19" cy="12" r="1"></circle><circle cx="5" cy="12" r="1"></circle></svg>;
const TimeLogIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>;
const ArchiveIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="21 8 21 21 3 21 3 8"></polyline><rect x="1" y="3" width="22" height="5"></rect><line x1="10" y1="12" x2="14" y2="12"></line></svg>;
const UnarchiveIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="21 8 21 21 3 21 3 8"></polyline><rect x="1" y="3" width="22" height="5"></rect><polyline points="10 12 12 10 14 12"></polyline><line x1="12" y1="10" x2="12" y2="16"></line></svg>;
const ChevronIcon = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><polyline points="6 9 12 15 18 9"></polyline></svg>;

interface GeneratedReport {
    startDate: string;
    endDate: string;
    projects: {
        [projectId: string]: {
            project: Project;
            completedTasks: Task[];
        };
    };
    totals: {
        totalValue: number;
        totalHours: number;
        totalMinutes: number;
    };
    companyBreakdown: {
        companyName: string;
        totalValue: number;
    }[];
}

type ModalType = 'addProject' | 'editProject' | 'deleteProject' | 'addTask' | 'editTask' | 'completeSubtask' | 'completeTask' | 'generateReport';

const PieChart = ({ data, currencyFormatter }: { data: { companyName: string, totalValue: number }[], currencyFormatter: Intl.NumberFormat }) => {
    const total = data.reduce((sum, item) => sum + item.totalValue, 0);
    if (total === 0) return <p className="text-sm text-gray-500 dark:text-white/60">No data to display in chart.</p>;

    const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];
    const radius = 80;
    const cx = 100;
    const cy = 100;
    let startAngle = -90; // Start from the top

    const slices = data.map((item, index) => {
        const percentage = item.totalValue / total;
        const angle = percentage * 360;
        const endAngle = startAngle + angle;

        const startX = cx + radius * Math.cos(startAngle * Math.PI / 180);
        const startY = cy + radius * Math.sin(startAngle * Math.PI / 180);
        const endX = cx + radius * Math.cos(endAngle * Math.PI / 180);
        const endY = cy + radius * Math.sin(endAngle * Math.PI / 180);
        const largeArcFlag = angle > 180 ? 1 : 0;
        const pathData = `M ${cx},${cy} L ${startX},${startY} A ${radius},${radius} 0 ${largeArcFlag} 1 ${endX},${endY} Z`;
        
        startAngle = endAngle;
        return { path: pathData, color: colors[index % colors.length] };
    });

    return (
        <div className="flex flex-col sm:flex-row items-center gap-8">
            <svg viewBox="0 0 200 200" width="200" height="200" className="flex-shrink-0">
                {slices.map((slice, i) => <path key={i} d={slice.path} fill={slice.color} />)}
            </svg>
            <div className="space-y-3">
                {data.map((item, index) => (
                    <div key={item.companyName} className="flex items-center gap-3">
                        <div className="w-4 h-4 rounded-full" style={{ backgroundColor: colors[index % colors.length] }}></div>
                        <div>
                            <p className="text-sm font-medium">{item.companyName}</p>
                            <p className="text-xs text-gray-500 dark:text-white/60">
                                {currencyFormatter.format(item.totalValue)} ({(item.totalValue / total * 100).toFixed(1)}%)
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const CRMModule: React.FC = () => {
    const {
        projects, tasks, addProject, updateProject, deleteProject, toggleProjectArchiveStatus,
        addTask, updateTask, deleteTask, addSubtask, updateSubtask, deleteSubtask
    } = useCRMData();
    const { currency } = useSettings();

    const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
    const [modal, setModal] = useState<{ type: ModalType; data?: any } | null>(null);
    const [formState, setFormState] = useState<any>({});
    const [showArchived, setShowArchived] = useState(false);
    const [showCompletedTasks, setShowCompletedTasks] = useState(false);
    const [generatedReport, setGeneratedReport] = useState<GeneratedReport | null>(null);
    
    useEffect(() => {
        const activeProjectExists = projects.some(p => p.id === activeProjectId);
        
        if (!activeProjectExists || (projects.find(p => p.id === activeProjectId)?.isArchived && !showArchived)) {
            const firstAvailableProject = projects.find(p => (showArchived ? true : !p.isArchived));
            setActiveProjectId(firstAvailableProject ? firstAvailableProject.id : null);
        }
    }, [projects, activeProjectId, showArchived]);

    const activeProject = useMemo(() => projects.find(p => p.id === activeProjectId), [projects, activeProjectId]);
    
    const activeTasks = useMemo(() =>
        tasks
            .filter(t => t.projectId === activeProjectId && t.status !== 'Done')
            .sort((a, b) => {
                const statusOrder = { 'To Do': 1, 'In Progress': 2 };
                return statusOrder[a.status as 'To Do' | 'In Progress'] - statusOrder[b.status as 'To Do' | 'In Progress'];
            }),
        [tasks, activeProjectId]
    );

    const completedTasks = useMemo(() =>
        tasks.filter(t => t.projectId === activeProjectId && t.status === 'Done'),
        [tasks, activeProjectId]
    );

    const currencyFormatter = useMemo(() => new Intl.NumberFormat('en-US', { style: 'currency', currency }), [currency]);
    
    const summaryStats = useMemo(() => {
        const activeProjects = projects.filter(p => !p.isArchived);
        const tasksOfActiveProjects = tasks.filter(t => activeProjects.some(p => p.id === t.projectId));
        const totalProjects = activeProjects.length;
        const totalTasks = tasksOfActiveProjects.length;
        const totalAmount = tasksOfActiveProjects.reduce((sum, task) => sum + (task.price || 0), 0);
        const completedTasksCount = tasksOfActiveProjects.filter(task => task.status === 'Done').length;
        return { totalProjects, totalTasks, totalAmount, completedTasks: completedTasksCount };
    }, [projects, tasks]);
    
    // Modal & Form Logic
    const openModal = (type: ModalType, data?: any) => {
        let initialFormState = data ? { ...data } : {};
        if (type === 'completeSubtask' || type === 'completeTask') {
             initialFormState.hours = 0;
             initialFormState.minutes = 30;
        }
        if (type === 'generateReport') {
            const endDate = new Date();
            const startDate = new Date();
            startDate.setDate(endDate.getDate() - 30);
            initialFormState.startDate = startDate.toISOString().split('T')[0];
            initialFormState.endDate = endDate.toISOString().split('T')[0];
        }
        setFormState(initialFormState);
        setModal({ type, data });
    };

    const closeModal = () => {
        setModal(null);
        setFormState({});
    };

    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setFormState({ ...formState, [e.target.name]: e.target.value });
    };
    
    const handleGenerateReport = () => {
        const { startDate, endDate } = formState;
        const start = new Date(startDate + 'T00:00:00Z').getTime();
        const end = new Date(endDate + 'T23:59:59Z').getTime();

        const completedTasksInRange = tasks.filter(task => {
            if (task.status === 'Done' && task.completedAt) {
                const completionTime = new Date(task.completedAt).getTime();
                return completionTime >= start && completionTime <= end;
            }
            return false;
        });
        
        const reportProjects: GeneratedReport['projects'] = {};
        let totalValue = 0;
        let totalMinutes = 0;

        completedTasksInRange.forEach(task => {
            if (!reportProjects[task.projectId]) {
                const projectInfo = projects.find(p => p.id === task.projectId);
                if (projectInfo) {
                    reportProjects[task.projectId] = {
                        project: projectInfo,
                        completedTasks: [],
                    };
                }
            }
            if (reportProjects[task.projectId]) {
                reportProjects[task.projectId].completedTasks.push(task);
                totalValue += task.price || 0;
                if(task.completionTime) {
                    totalMinutes += (task.completionTime.hours * 60) + task.completionTime.minutes;
                }
            }
        });
        
        const companyValueMap: { [companyName: string]: number } = {};
        completedTasksInRange.forEach(task => {
            const project = projects.find(p => p.id === task.projectId);
            const companyName = project?.companyName || 'No Company';
            if (!companyValueMap[companyName]) {
                companyValueMap[companyName] = 0;
            }
            companyValueMap[companyName] += task.price || 0;
        });

        const companyBreakdown = Object.entries(companyValueMap)
            .map(([companyName, companyTotalValue]) => ({ companyName, totalValue: companyTotalValue }))
            .sort((a, b) => b.totalValue - a.totalValue);

        setGeneratedReport({
            startDate,
            endDate,
            projects: reportProjects,
            totals: {
                totalValue,
                totalHours: Math.floor(totalMinutes / 60),
                totalMinutes: totalMinutes % 60,
            },
            companyBreakdown,
        });
        closeModal();
    };


    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        if (!modal) return;
        
        switch(modal.type) {
            case 'addProject':
                addProject({ name: formState.name, companyName: formState.companyName, description: formState.description, status: 'Not Started' });
                break;
            case 'editProject':
                updateProject(modal.data.id, { name: formState.name, companyName: formState.companyName, description: formState.description, status: formState.status });
                break;
            case 'deleteProject':
                if (window.confirm(`Are you sure you want to delete project "${modal.data.name}" and all its tasks? This action is irreversible.`)) {
                   deleteProject(modal.data.id);
                }
                break;
            case 'addTask':
                addTask({ projectId: activeProjectId!, title: formState.title, price: parseFloat(formState.price || 0), status: 'To Do', description: formState.description });
                break;
            case 'editTask':
                updateTask(modal.data.id, { title: formState.title, description: formState.description, price: parseFloat(formState.price || 0), status: formState.status });
                break;
            case 'completeSubtask': {
                const hours = parseInt(formState.hours || '0', 10);
                const minutes = parseInt(formState.minutes || '0', 10);
                if (isNaN(hours) || isNaN(minutes)) return;
                updateSubtask(modal.data.taskId, modal.data.subtaskId, { completionTime: { hours, minutes } });
                break;
            }
            case 'completeTask': {
                const hours = parseInt(formState.hours || '0', 10);
                const minutes = parseInt(formState.minutes || '0', 10);
                if (isNaN(hours) || isNaN(minutes)) return;
                updateTask(modal.data.id, { status: 'Done', completionTime: { hours, minutes } });
                break;
            }
        }
        closeModal();
    };
    
    const Input = (props: React.InputHTMLAttributes<HTMLInputElement>) => <input {...props} className="w-full bg-white dark:bg-black border border-gray-300 dark:border-white/20 rounded-md px-3 py-2 text-sm text-black dark:text-white placeholder:text-gray-500 dark:placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-black/50 dark:focus:ring-white/50" />;
    const Select = (props: React.SelectHTMLAttributes<HTMLSelectElement>) => <select {...props} className="w-full bg-white dark:bg-black border border-gray-300 dark:border-white/20 rounded-md px-3 py-2 text-sm text-black dark:text-white" />;
    const Textarea = (props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) => <textarea {...props} className="w-full bg-white dark:bg-black border border-gray-300 dark:border-white/20 rounded-md px-3 py-2 text-sm text-black dark:text-white placeholder:text-gray-500 dark:placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-black/50 dark:focus:ring-white/50 resize-y" />;
        
    const StatCard = ({ title, value, icon }: { title: string; value: string | number, icon: React.ReactNode }) => (
        <div className="bg-white dark:bg-black border border-gray-200 dark:border-white/10 rounded-lg p-4 flex items-center gap-4">
            <div className="w-12 h-12 bg-gray-100 dark:bg-white/10 rounded-lg flex items-center justify-center text-black dark:text-white">{icon}</div>
            <div>
                <p className="text-sm text-gray-500 dark:text-white/50">{title}</p>
                <p className="text-2xl font-bold tracking-tighter text-black dark:text-white">{value}</p>
            </div>
        </div>
    );

    const TaskCard = ({ task }: { task: Task }) => {
        const [subtaskTitle, setSubtaskTitle] = useState('');
        const [isMenuOpen, setIsMenuOpen] = useState(false);

        const handleAddSubtask = (e: React.FormEvent) => {
            e.preventDefault();
            if (!subtaskTitle.trim()) return;
            addSubtask(task.id, subtaskTitle);
            setSubtaskTitle('');
        };
        
        const handleSubtaskToggle = (subtask: Subtask) => {
             if (subtask.completionTime) {
                if (window.confirm('Mark this subtask as incomplete?')) {
                    updateSubtask(task.id, subtask.id, { completionTime: null });
                }
            } else {
                openModal('completeSubtask', { taskId: task.id, subtaskId: subtask.id });
            }
        };

        const handleTaskCompletionToggle = () => {
            setIsMenuOpen(false); // Close menu first
            if (task.status === 'Done') {
                if (window.confirm('Mark this task as "To Do"? The logged time and completion date will be removed.')) {
                    updateTask(task.id, { status: 'To Do' });
                }
            } else {
                openModal('completeTask', task);
            }
        };

        const StatusPill = ({ status }: { status: Task['status'] }) => {
            const baseClasses = "text-xs font-medium px-2.5 py-0.5 rounded-full";
            const styles = {
                'To Do': "bg-gray-100 dark:bg-white/10 text-gray-800 dark:text-white/80",
                'In Progress': "bg-black/10 dark:bg-white/20 text-black dark:text-white animate-pulse",
                'Done': "bg-black dark:bg-white text-white dark:text-black"
            };
            return <span className={`${baseClasses} ${styles[status]}`}>{status}</span>;
        };

        return (
            <div className="bg-white dark:bg-black border border-gray-200 dark:border-white/10 p-4 rounded-lg space-y-4">
                {/* Header */}
                <div className="flex justify-between items-start">
                    <div>
                        <h4 className="font-semibold text-black dark:text-white">{task.title}</h4>
                        <div className="mt-1"><StatusPill status={task.status}/></div>
                    </div>
                    <div className="relative">
                        <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-gray-500 dark:text-white/50 hover:bg-gray-100 dark:hover:bg-white/10 rounded-full p-1"><DotsIcon /></button>
                        {isMenuOpen && (
                            <div className="absolute right-0 mt-2 w-40 bg-white dark:bg-black border border-gray-200 dark:border-white/10 rounded-md shadow-lg z-10">
                                <button onClick={handleTaskCompletionToggle} className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-white/80 hover:bg-gray-100 dark:hover:bg-white/10">{task.status === 'Done' ? 'Mark as To Do' : 'Complete Task'}</button>
                                <button onClick={() => { openModal('editTask', task); setIsMenuOpen(false); }} className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-white/80 hover:bg-gray-100 dark:hover:bg-white/10">Edit Task</button>
                                <button onClick={() => { deleteTask(task.id); setIsMenuOpen(false); }} className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-gray-100 dark:hover:bg-white/10">Delete Task</button>
                            </div>
                        )}
                    </div>
                </div>
                {/* Meta */}
                <div className="flex items-center gap-6 text-sm text-gray-600 dark:text-white/60">
                    <div className="flex items-center gap-2"><PriceIcon /> <span>{currencyFormatter.format(task.price)}</span></div>
                    {task.completedAt && <div className="flex items-center gap-2"><CompletedIcon /> <span>{new Date(task.completedAt).toLocaleDateString()}</span></div>}
                    {task.completionTime && (
                        <div className="flex items-center gap-2 text-black dark:text-white font-medium">
                            <TimeLogIcon />
                            <span>{task.completionTime.hours}h {task.completionTime.minutes}m</span>
                        </div>
                    )}
                </div>
                {/* Description */}
                {task.description && <p className="text-sm text-gray-600 dark:text-white/70 bg-gray-50 dark:bg-white/5 p-3 rounded-md whitespace-pre-wrap">{task.description}</p>}
                {/* Subtasks */}
                <div>
                    <div className="space-y-2">
                        {task.subtasks.map(sub => (
                            <div key={sub.id} className="flex items-center justify-between group p-1 rounded hover:bg-gray-50 dark:hover:bg-white/5">
                                <div className="flex items-center gap-3 flex-1">
                                    <input type="checkbox" checked={!!sub.completionTime} onChange={() => handleSubtaskToggle(sub)} className="w-4 h-4 rounded-sm bg-transparent dark:bg-black border-gray-400 dark:border-white/30 text-black dark:text-white focus:ring-black/50 dark:focus:ring-white/50 cursor-pointer" />
                                    <div className="flex-1">
                                      <label className={`text-sm ${sub.completionTime ? 'line-through text-gray-500 dark:text-white/50' : 'text-black dark:text-white'}`}>{sub.title}</label>
                                      {sub.completionTime && <span className="text-xs text-gray-400 dark:text-white/40 ml-2">{sub.completionTime.hours}h {sub.completionTime.minutes}m</span>}
                                    </div>
                                </div>
                                <button onClick={() => deleteSubtask(task.id, sub.id)} className="opacity-0 group-hover:opacity-100 text-red-500 text-xs transition-opacity">Remove</button>
                            </div>
                        ))}
                    </div>
                    <form onSubmit={handleAddSubtask} className="flex gap-2 mt-2">
                        <Input type="text" value={subtaskTitle} onChange={e => setSubtaskTitle(e.target.value)} placeholder="+ Add a subtask..." className="text-sm h-8 flex-1 bg-transparent border-0 focus:ring-0 focus:outline-none px-1" />
                        <button type="submit" className="bg-gray-100 dark:bg-white/10 text-black dark:text-white px-3 rounded-md text-xs font-semibold hover:bg-gray-200 dark:hover:bg-white/20 transition-colors">Add</button>
                    </form>
                </div>
            </div>
        );
    };
    
    const activeProjects = useMemo(() => projects.filter(p => !(p.isArchived ?? false)), [projects]);
    const archivedProjects = useMemo(() => projects.filter(p => p.isArchived === true), [projects]);

    return (
        <>
        <style>{`
          @media print {
            body * {
              visibility: hidden;
            }
            #print-area, #print-area * {
              visibility: visible;
            }
            #print-area {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
            }
            .dark #print-area {
                background-color: white !important;
                color: black !important;
            }
            #print-area h1, #print-area h2, #print-area h3, #print-area h4, #print-area p, #print-area span, #print-area div {
                 color: black !important;
            }
            #print-area .project-section {
                border: 1px solid #ccc;
                padding: 16px;
                margin-bottom: 16px;
                border-radius: 8px;
                page-break-inside: avoid;
            }
            #print-area .task-item {
                border-top: 1px solid #eee;
                padding: 8px 0;
            }
          }
        `}</style>

        <div className="h-full flex flex-col gap-6">
            {/* Summary */}
            <div className="flex flex-col md:flex-row items-center gap-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 flex-1 w-full">
                    <StatCard title="Active Projects" value={summaryStats.totalProjects} icon={<ProjectIcon />}/>
                    <StatCard title="Total Tasks" value={summaryStats.totalTasks} icon={<TaskIcon />}/>
                    <StatCard title="Completed" value={`${summaryStats.completedTasks} / ${summaryStats.totalTasks}`} icon={<CheckIcon />}/>
                    <StatCard title="Total Value" value={currencyFormatter.format(summaryStats.totalAmount)} icon={<ValueIcon />}/>
                </div>
                <button onClick={() => openModal('generateReport')} className="w-full md:w-auto bg-gray-100 dark:bg-white/10 text-black dark:text-white px-4 py-2 h-full rounded-md text-sm font-semibold hover:bg-gray-200 dark:hover:bg-white/20 transition-colors">Generate Report</button>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col lg:flex-row gap-6 min-h-0">
                {/* Project List Column */}
                <div className="w-full lg:w-1/3 bg-white dark:bg-black border border-gray-200 dark:border-white/10 rounded-lg flex flex-col h-80 lg:h-auto">
                    <div className="p-4 border-b border-gray-200 dark:border-white/10 flex-shrink-0 flex justify-between items-center">
                        <h3 className="text-lg font-semibold tracking-tight">Projects</h3>
                        <div className="flex items-center gap-2">
                          <button onClick={() => setShowArchived(!showArchived)} className="text-gray-500 dark:text-white/60 hover:text-black dark:hover:text-white text-xs px-2 py-1 rounded-md bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20">{showArchived ? 'Hide' : 'Show'} Archived</button>
                          <button onClick={() => openModal('addProject')} className="bg-black text-white dark:bg-white dark:text-black px-3 py-1 rounded-md text-sm font-semibold hover:bg-gray-800 dark:hover:bg-white/90 transition-colors">+ New</button>
                        </div>
                    </div>
                    <div className="overflow-y-auto p-2">
                        {activeProjects.length > 0 ? (
                            <ul>{activeProjects.map(proj => {
                                const projectTasks = tasks.filter(t => t.projectId === proj.id);
                                const completedTasksCount = projectTasks.filter(t => t.status === 'Done').length;
                                const progress = projectTasks.length > 0 ? (completedTasksCount / projectTasks.length) * 100 : 0;
                                return (
                                <li key={proj.id}><button onClick={() => setActiveProjectId(proj.id)} className={`w-full text-left p-3 rounded-md transition-colors space-y-2 ${activeProjectId === proj.id ? 'bg-gray-100 dark:bg-white/10' : 'hover:bg-gray-50 dark:hover:bg-white/5'}`}>
                                    <h4 className="font-semibold text-black dark:text-white truncate">{proj.name}</h4>
                                    <p className="text-sm text-gray-500 dark:text-white/50 truncate">{proj.companyName || 'No company'}</p>
                                    <div className="w-full bg-gray-200 dark:bg-white/5 rounded-full h-1"><div className="bg-black dark:bg-white h-1 rounded-full" style={{ width: `${progress}%` }}></div></div>
                                    </button></li>
                                )
                            })}</ul>
                        ) : (<div className="text-center p-8 text-gray-400 dark:text-white/40"><p>No active projects.</p></div>)}
                        
                        {showArchived && archivedProjects.length > 0 && (
                          <>
                            <h5 className="px-3 pt-4 pb-2 text-xs font-semibold text-gray-400 dark:text-white/40 uppercase tracking-wider">Archived</h5>
                            <ul>{archivedProjects.map(proj => (
                                <li key={proj.id}><button onClick={() => setActiveProjectId(proj.id)} className={`w-full text-left p-3 rounded-md transition-colors space-y-2 opacity-60 ${activeProjectId === proj.id ? 'bg-gray-100 dark:bg-white/10' : 'hover:bg-gray-50 dark:hover:bg-white/5'}`}>
                                    <h4 className="font-semibold text-black dark:text-white truncate">{proj.name}</h4>
                                    <p className="text-sm text-gray-500 dark:text-white/50 truncate">{proj.companyName || 'No company'}</p>
                                </button></li>
                            ))}</ul>
                          </>
                        )}

                        {projects.length === 0 && (
                            <div className="text-center p-8 text-gray-400 dark:text-white/40"><p>No projects yet.</p><p>Click "+ New" to start.</p></div>
                        )}
                    </div>
                </div>

                {/* Project Details Column */}
                <div className="w-full lg:w-2/3 flex flex-col">
                    {activeProject ? (
                         <div className="flex-1 flex flex-col gap-4 overflow-y-auto">
                             {activeProject.isArchived && (
                                <div className="bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-700 dark:text-white/80 p-3 rounded-lg text-sm text-center flex-shrink-0 flex items-center justify-center gap-2">
                                  <ArchiveIcon /> This project is archived.
                                </div>
                             )}
                            {/* Project Header */}
                             <div className="bg-white dark:bg-black border border-gray-200 dark:border-white/10 rounded-lg p-4 flex-shrink-0">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h2 className="text-2xl font-bold tracking-tighter text-black dark:text-white">{activeProject.name}</h2>
                                        <p className="text-gray-500 dark:text-white/50">{activeProject.companyName}</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button onClick={() => toggleProjectArchiveStatus(activeProject.id)} className="text-gray-400 hover:text-black dark:text-white/50 dark:hover:text-white" title={activeProject.isArchived ? "Unarchive Project" : "Archive Project"}>
                                            {activeProject.isArchived ? <UnarchiveIcon /> : <ArchiveIcon />}
                                        </button>
                                        <button onClick={() => openModal('editProject', activeProject)} className="text-gray-400 hover:text-black dark:text-white/50 dark:hover:text-white" title="Edit Project"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg></button>
                                        <button onClick={() => openModal('deleteProject', activeProject)} className="text-gray-400 hover:text-red-500 dark:text-white/50" title="Delete Project"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg></button>
                                    </div>
                                </div>
                                {activeProject.description && <p className="text-sm mt-2 text-gray-600 dark:text-white/60">{activeProject.description}</p>}
                            </div>
                            
                            {/* Task List */}
                            <div className="flex justify-between items-center">
                                <h3 className="text-lg font-semibold tracking-tight text-black dark:text-white">Tasks</h3>
                                <button onClick={() => openModal('addTask')} className="bg-black text-white dark:bg-white dark:text-black px-3 py-1 rounded-md text-sm font-semibold hover:bg-gray-800 dark:hover:bg-white/90 transition-colors">+ Add Task</button>
                            </div>
                            <div className="space-y-3">
                                {activeTasks.map(task => <TaskCard key={task.id} task={task} />)}
                            </div>

                            {activeTasks.length === 0 && (
                                <div className="text-center py-12 text-gray-400 dark:text-white/40 border-2 border-dashed border-gray-200 dark:border-white/10 rounded-lg">
                                    {completedTasks.length > 0 ? (
                                        <p>All tasks completed! 🎉</p>
                                    ) : (
                                        <p>No tasks for this project yet.</p>
                                    )}
                                </div>
                            )}

                            {completedTasks.length > 0 && (
                                <div className="mt-6 border-t border-gray-200 dark:border-white/10 pt-4">
                                    <button onClick={() => setShowCompletedTasks(!showCompletedTasks)} className="flex items-center justify-between w-full p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                                        <h4 className="text-base font-semibold text-black dark:text-white">Completed ({completedTasks.length})</h4>
                                        <ChevronIcon className={`transform transition-transform ${showCompletedTasks ? 'rotate-180' : ''}`} />
                                    </button>
                                    {showCompletedTasks && (
                                        <div className="mt-3 space-y-3">
                                            {completedTasks.map(task => <TaskCard key={task.id} task={task} />)}
                                        </div>
                                    )}
                                </div>
                            )}
                         </div>
                    ) : (
                        <div className="flex h-full items-center justify-center text-center text-gray-400 dark:text-white/40 border-2 border-dashed border-gray-200 dark:border-white/10 rounded-lg"><div><p>Select a project to view details</p><p>or create a new one.</p></div></div>
                    )}
                </div>
            </div>
        </div>

        {/* Report View */}
        {generatedReport && (
             <div className="fixed inset-0 bg-white dark:bg-black z-50 overflow-y-auto">
                <div className="max-w-4xl mx-auto p-8">
                   <div className="flex justify-between items-center mb-8 noprint">
                      <h2 className="text-2xl font-bold tracking-tight text-black dark:text-white">Work Report</h2>
                      <div className="flex gap-4">
                          <button onClick={() => window.print()} className="bg-gray-100 dark:bg-white/10 text-black dark:text-white px-4 py-2 rounded-md text-sm font-semibold hover:bg-gray-200 dark:hover:bg-white/20">Print Report</button>
                          <button onClick={() => setGeneratedReport(null)} className="bg-black text-white dark:bg-white dark:text-black px-4 py-2 rounded-md text-sm font-semibold hover:bg-gray-800 dark:hover:bg-white/90">Close</button>
                      </div>
                   </div>
                   <div id="print-area" className="bg-white dark:bg-black text-black dark:text-white p-8 rounded-lg border border-gray-200 dark:border-white/10">
                        <h1 className="text-3xl font-bold">Work Report</h1>
                        <p className="text-gray-500 dark:text-white/60 mb-6">
                            {new Date(generatedReport.startDate + 'T12:00:00Z').toLocaleDateString()} - {new Date(generatedReport.endDate + 'T12:00:00Z').toLocaleDateString()}
                        </p>
                        
                        <div className="grid grid-cols-2 gap-6 mb-8 border-t border-b border-gray-200 dark:border-white/10 py-6">
                            <div>
                                <p className="text-sm text-gray-500 dark:text-white/60">Total Value</p>
                                <p className="text-3xl font-bold">{currencyFormatter.format(generatedReport.totals.totalValue)}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 dark:text-white/60">Deep Work Hours</p>
                                <p className="text-3xl font-bold">{generatedReport.totals.totalHours}h {generatedReport.totals.totalMinutes}m</p>
                            </div>
                        </div>

                        {generatedReport.companyBreakdown.length > 0 && (
                            <div className="mb-8">
                                <h2 className="text-xl font-semibold mb-4">Company Expense Breakdown</h2>
                                <PieChart data={generatedReport.companyBreakdown} currencyFormatter={currencyFormatter} />
                            </div>
                        )}

                        <div className="space-y-8">
                            {Object.values(generatedReport.projects).map(({ project, completedTasks }) => (
                                <div key={project.id} className="project-section">
                                    <h3 className="text-xl font-semibold">{project.name}</h3>
                                    <p className="text-sm text-gray-500 dark:text-white/60 mb-4">{project.companyName}</p>
                                    <div>
                                        {completedTasks.map(task => (
                                            <div key={task.id} className="task-item flex justify-between items-center">
                                                <div>
                                                    <p className="font-medium">{task.title}</p>
                                                    <p className="text-xs text-gray-400 dark:text-white/50">Completed on: {new Date(task.completedAt!).toLocaleDateString()}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-mono font-semibold">{currencyFormatter.format(task.price)}</p>
                                                    {task.completionTime && <p className="text-sm text-gray-500 dark:text-white/60">{task.completionTime.hours}h {task.completionTime.minutes}m</p>}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                   </div>
                </div>
            </div>
        )}

        {/* Modal */}
        {modal && (
            <div className="fixed inset-0 bg-black/60 dark:bg-black/80 flex items-center justify-center z-50" onClick={closeModal}>
                <div className="bg-white dark:bg-black border border-gray-300 dark:border-white/20 rounded-lg p-6 w-full max-w-md text-black dark:text-white" onClick={e => e.stopPropagation()}>
                    <form onSubmit={handleSave} className="space-y-4">
                        {(modal.type === 'addProject' || modal.type === 'editProject') && <>
                            <h3 className="text-lg font-semibold tracking-tight mb-4">{modal.type === 'addProject' ? 'Add New Project' : 'Edit Project'}</h3>
                            <div><label className="text-sm font-medium">Project Name</label><Input name="name" value={formState.name || ''} onChange={handleFormChange} required /></div>
                            <div><label className="text-sm font-medium">Company Name (Optional)</label><Input name="companyName" value={formState.companyName || ''} onChange={handleFormChange} /></div>
                            <div><label className="text-sm font-medium">Description (Optional)</label><Textarea name="description" value={formState.description || ''} onChange={handleFormChange} rows={3} /></div>
                            {modal.type === 'editProject' && <div><label className="text-sm font-medium">Status</label><Select name="status" value={formState.status} onChange={handleFormChange}><option>Not Started</option><option>In Progress</option><option>Completed</option></Select></div>}
                             <div className="flex justify-end gap-3 pt-4"><button type="button" onClick={closeModal} className="bg-gray-100 dark:bg-white/10 text-black dark:text-white px-4 py-2 rounded-md text-sm font-semibold hover:bg-gray-200 dark:hover:bg-white/20">Cancel</button><button type="submit" className="bg-black dark:bg-white text-white dark:text-black px-4 py-2 rounded-md text-sm font-semibold hover:bg-gray-800 dark:hover:bg-white/90">Save</button></div>
                        </>}

                        {(modal.type === 'addTask' || modal.type === 'editTask') && <>
                             <h3 className="text-lg font-semibold tracking-tight mb-4">{modal.type === 'addTask' ? 'Add New Task' : 'Edit Task'}</h3>
                             <div><label className="text-sm font-medium">Task Title</label><Input name="title" value={formState.title || ''} onChange={handleFormChange} required /></div>
                             <div><label className="text-sm font-medium">Price (Optional)</label><Input name="price" type="number" step="0.01" value={formState.price || ''} onChange={handleFormChange} /></div>
                             <div><label className="text-sm font-medium">Description (Optional)</label><Textarea name="description" value={formState.description || ''} onChange={handleFormChange} rows={3} /></div>
                            {modal.type === 'editTask' && <div><label className="text-sm font-medium">Status</label><Select name="status" value={formState.status} onChange={handleFormChange}><option>To Do</option><option>In Progress</option><option>Done</option></Select></div>}
                             <div className="flex justify-end gap-3 pt-4"><button type="button" onClick={closeModal} className="bg-gray-100 dark:bg-white/10 text-black dark:text-white px-4 py-2 rounded-md text-sm font-semibold hover:bg-gray-200 dark:hover:bg-white/20">Cancel</button><button type="submit" className="bg-black dark:bg-white text-white dark:text-black px-4 py-2 rounded-md text-sm font-semibold hover:bg-gray-800 dark:hover:bg-white/90">Save</button></div>
                        </>}
                        
                        {(modal.type === 'completeSubtask' || modal.type === 'completeTask') && <>
                            <h3 className="text-lg font-semibold tracking-tight mb-4">{modal.type === 'completeSubtask' ? 'Log Time Spent' : `Log Time for "${modal.data.title}"`}</h3>
                            <div className="flex gap-4">
                                <div className="w-1/2">
                                    <label className="text-sm font-medium">Hours</label>
                                    <Input type="number" name="hours" value={formState.hours || '0'} onChange={handleFormChange} min="0" required/>
                                </div>
                                <div className="w-1/2">
                                    <label className="text-sm font-medium">Minutes</label>
                                    <Input type="number" name="minutes" value={formState.minutes || '0'} onChange={handleFormChange} min="0" max="59" step="1" required/>
                                </div>
                            </div>
                             <div className="flex justify-end gap-3 pt-4"><button type="button" onClick={closeModal} className="bg-gray-100 dark:bg-white/10 text-black dark:text-white px-4 py-2 rounded-md text-sm font-semibold hover:bg-gray-200 dark:hover:bg-white/20">Cancel</button><button type="submit" className="bg-black dark:bg-white text-white dark:text-black px-4 py-2 rounded-md text-sm font-semibold hover:bg-gray-800 dark:hover:bg-white/90">Save</button></div>
                        </>}

                        {modal.type === 'generateReport' && <>
                            <h3 className="text-lg font-semibold tracking-tight mb-4">Generate Work Report</h3>
                            <p className="text-sm text-gray-500 dark:text-white/60 mb-4">Select a date range to include all tasks completed within that period.</p>
                             <div className="flex gap-4">
                                <div className="w-1/2"><label className="text-sm font-medium">Start Date</label><Input name="startDate" type="date" value={formState.startDate || ''} onChange={handleFormChange} required /></div>
                                <div className="w-1/2"><label className="text-sm font-medium">End Date</label><Input name="endDate" type="date" value={formState.endDate || ''} onChange={handleFormChange} required /></div>
                             </div>
                             <div className="flex justify-end gap-3 pt-4">
                                <button type="button" onClick={closeModal} className="bg-gray-100 dark:bg-white/10 text-black dark:text-white px-4 py-2 rounded-md text-sm font-semibold hover:bg-gray-200 dark:hover:bg-white/20">Cancel</button>
                                <button type="button" onClick={handleGenerateReport} className="bg-black dark:bg-white text-white dark:text-black px-4 py-2 rounded-md text-sm font-semibold hover:bg-gray-800 dark:hover:bg-white/90">Generate</button>
                            </div>
                        </>}
                    </form>
                </div>
            </div>
        )}
        </>
    );
};

export default CRMModule;