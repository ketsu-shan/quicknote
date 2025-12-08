import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { Task, TaskZone, ArchivedDay } from '../types';
import { PlusIcon, PinIcon, ChevronUpIcon, ChevronDownIcon, ArchiveIcon, XIcon, TrashIcon, FireIcon, StarIcon, CalendarIcon, CheckIcon } from './Icons';
import { TaskItem } from './TaskItem';

// Electron API type declaration
declare global {
  interface Window {
    electronAPI?: {
      setAlwaysOnTop: (flag: boolean) => void;
      saveWidgetData: (data: WidgetData) => void;
      loadWidgetData: () => Promise<WidgetData | null>;
    };
  }
}

// Widget data structure
interface WidgetData {
  tasks: Task[];
  archives: ArchivedDay[];
  theme: Theme;
  lastUpdated: number;
}

// Theme type
type Theme = 'dark' | 'light';

// Helper to get progress bar color based on percentage
const getProgressColor = (progress: number): string => {
  if (progress >= 100) return 'bg-emerald-400';
  if (progress >= 70) return 'bg-green-400';
  if (progress >= 50) return 'bg-yellow-400';
  if (progress >= 30) return 'bg-orange-400';
  return 'bg-red-400';
};

// Helper to get today's date string
const getTodayString = () => {
  const today = new Date();
  return today.toISOString().split('T')[0];
};

// Format date for display
const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (dateStr === getTodayString()) return '今天';
  if (dateStr === yesterday.toISOString().split('T')[0]) return '昨天';

  return `${date.getMonth() + 1}月${date.getDate()}日`;
};

// Theme styles with transparency
const themeStyles = {
  dark: {
    bg: 'bg-gradient-to-br from-slate-800/90 via-slate-900/85 to-slate-950/90 backdrop-blur-xl',
    text: 'text-white',
    textMuted: 'text-white/80',
    textDim: 'text-white/50',
    border: 'border-white/15',
    inputBg: 'bg-white/10',
    inputBorder: 'border-white/20',
    inputFocus: 'focus:bg-white/15 focus:border-white/40',
    hoverBg: 'hover:bg-white/15',
    footerBg: 'bg-black/40',
  },
  light: {
    bg: 'bg-gradient-to-br from-white/90 via-gray-50/85 to-gray-100/90 backdrop-blur-xl',
    text: 'text-gray-900',
    textMuted: 'text-gray-700',
    textDim: 'text-gray-500',
    border: 'border-gray-300/50',
    inputBg: 'bg-white/60',
    inputBorder: 'border-gray-300/60',
    inputFocus: 'focus:bg-white/80 focus:border-gray-400',
    hoverBg: 'hover:bg-gray-200/50',
    footerBg: 'bg-gray-200/60',
  },
};

// Sun icon for light mode
const SunIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="4"></circle>
    <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"></path>
  </svg>
);

// Moon icon for dark mode
const MoonIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"></path>
  </svg>
);

export const StickyNote: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTaskText, setNewTaskText] = useState('');
  const [activeZone, setActiveZone] = useState<TaskZone>('urgent');
  const [isPinned, setIsPinned] = useState(true);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showArchive, setShowArchive] = useState(false);
  const [archives, setArchives] = useState<ArchivedDay[]>([]);
  const [showOnlyIncomplete, setShowOnlyIncomplete] = useState(false);
  const [theme, setTheme] = useState<Theme>('dark');
  const [expandedArchives, setExpandedArchives] = useState<Set<string>>(new Set());
  const [urgentExpanded, setUrgentExpanded] = useState(true);
  const [importantExpanded, setImportantExpanded] = useState(true);

  const styles = themeStyles[theme];

  // Load data from local storage on mount
  useEffect(() => {
    const saved = localStorage.getItem('quicknote-tasks');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const migrated = parsed.map((t: any) => ({
          ...t,
          zone: t.zone || 'urgent'
        }));
        setTasks(migrated);
      } catch (e) {
        console.error("Failed to parse tasks", e);
      }
    }

    const savedArchives = localStorage.getItem('quicknote-archives');
    if (savedArchives) {
      try {
        const parsed = JSON.parse(savedArchives);
        setArchives(parsed);
        // Default expand all archives
        setExpandedArchives(new Set(parsed.map((a: ArchivedDay) => a.date)));
      } catch (e) {
        console.error("Failed to parse archives", e);
      }
    }

    const savedTheme = localStorage.getItem('quicknote-theme') as Theme;
    if (savedTheme) {
      setTheme(savedTheme);
    }
  }, []);

  // Save tasks whenever they change
  useEffect(() => {
    localStorage.setItem('quicknote-tasks', JSON.stringify(tasks));
  }, [tasks]);

  // Save archives whenever they change
  useEffect(() => {
    localStorage.setItem('quicknote-archives', JSON.stringify(archives));
  }, [archives]);

  // Save theme whenever it changes
  useEffect(() => {
    localStorage.setItem('quicknote-theme', theme);
  }, [theme]);

  // Sync data to shared file for widget integration
  useEffect(() => {
    if (window.electronAPI?.saveWidgetData) {
      const widgetData: WidgetData = {
        tasks,
        archives,
        theme,
        lastUpdated: Date.now(),
      };
      window.electronAPI.saveWidgetData(widgetData);
    }
  }, [tasks, archives, theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const toggleArchiveExpand = (date: string) => {
    setExpandedArchives(prev => {
      const newSet = new Set(prev);
      if (newSet.has(date)) {
        newSet.delete(date);
      } else {
        newSet.add(date);
      }
      return newSet;
    });
  };

  // Auto-archive completed tasks
  const archiveCompletedTask = (task: Task) => {
    const today = getTodayString();

    setArchives(prev => {
      const existingIdx = prev.findIndex(a => a.date === today);
      if (existingIdx >= 0) {
        const updated = [...prev];
        const existing = { ...updated[existingIdx] };
        if (!existing.tasks.find(t => t.id === task.id)) {
          existing.tasks = [...existing.tasks, task];
          existing.completedCount = existing.tasks.filter(t => t.completed).length;
          existing.totalCount = existing.tasks.length;
          updated[existingIdx] = existing;
        }
        return updated;
      } else {
        // Add new archive and expand it by default
        setExpandedArchives(prev => new Set([...prev, today]));
        return [{
          date: today,
          tasks: [task],
          completedCount: 1,
          totalCount: 1,
        }, ...prev];
      }
    });
  };

  const addTask = (zone: TaskZone) => {
    const trimmed = newTaskText.trim();
    if (!trimmed) return;

    const newTask: Task = {
      id: crypto.randomUUID(),
      text: trimmed,
      completed: false,
      createdAt: Date.now(),
      zone,
    };

    setTasks(prev => [newTask, ...prev]);
    setNewTaskText('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      addTask(activeZone);
    }
  };

  const toggleTask = (id: string) => {
    setTasks(prev => {
      const updated = prev.map(t => {
        if (t.id === id) {
          const newTask = { ...t, completed: !t.completed };
          if (newTask.completed) {
            archiveCompletedTask(newTask);
          }
          return newTask;
        }
        return t;
      });
      return updated;
    });
  };

  const deleteTask = (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  const clearAllTasks = () => {
    setTasks([]);
    setShowClearConfirm(false);
  };

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const sourceZone = result.source.droppableId as TaskZone;
    const destZone = result.destination.droppableId as TaskZone;

    const urgentTasks = tasks.filter(t => t.zone === 'urgent' && !t.completed);
    const importantTasks = tasks.filter(t => t.zone === 'important' && !t.completed);
    const completedTasks = tasks.filter(t => t.completed);

    if (sourceZone === destZone) {
      const zoneTasks = sourceZone === 'urgent' ? [...urgentTasks] : [...importantTasks];
      const [moved] = zoneTasks.splice(result.source.index, 1);
      zoneTasks.splice(result.destination.index, 0, moved);

      if (sourceZone === 'urgent') {
        setTasks([...zoneTasks, ...importantTasks, ...completedTasks]);
      } else {
        setTasks([...urgentTasks, ...zoneTasks, ...completedTasks]);
      }
    } else {
      const sourceTasks = sourceZone === 'urgent' ? [...urgentTasks] : [...importantTasks];
      const destTasks = destZone === 'urgent' ? [...urgentTasks] : [...importantTasks];

      const [moved] = sourceTasks.splice(result.source.index, 1);
      moved.zone = destZone;
      destTasks.splice(result.destination.index, 0, moved);

      if (sourceZone === 'urgent') {
        setTasks([...sourceTasks, ...destTasks, ...completedTasks]);
      } else {
        setTasks([...destTasks, ...sourceTasks, ...completedTasks]);
      }
    }
  };

  // Task counts
  const urgentAll = tasks.filter(t => t.zone === 'urgent');
  const urgentCompleted = urgentAll.filter(t => t.completed);
  const urgentActive = urgentAll.filter(t => !t.completed);

  const importantAll = tasks.filter(t => t.zone === 'important');
  const importantCompleted = importantAll.filter(t => t.completed);
  const importantActive = importantAll.filter(t => !t.completed);

  const completedCount = tasks.filter(t => t.completed).length;
  const totalCount = tasks.length;
  const activeCount = totalCount - completedCount;
  const progress = totalCount === 0 ? 0 : (completedCount / totalCount) * 100;

  // Sort tasks: incomplete first, completed at bottom
  const sortedUrgent = [...urgentAll].sort((a, b) => Number(a.completed) - Number(b.completed));
  const sortedImportant = [...importantAll].sort((a, b) => Number(a.completed) - Number(b.completed));

  const displayUrgent = showOnlyIncomplete ? urgentActive : sortedUrgent;
  const displayImportant = showOnlyIncomplete ? importantActive : sortedImportant;

  // --- RENDER COLLAPSED (MINI) MODE ---
  if (isCollapsed) {
    return (
      <div className="relative font-sans group inline-block">
        <div className={`
          absolute inset-0 ${styles.bg} rounded-xl -z-10 pointer-events-none
          shadow-lg
        `} />

        <div className={`flex items-center gap-2 px-2 py-1.5 rounded-xl ${styles.text} select-none draggable-region cursor-move`}>
          <button
            onClick={() => setIsCollapsed(false)}
            className={`w-6 h-6 rounded-lg ${theme === 'dark' ? 'bg-white/10 hover:bg-white/20' : 'bg-gray-200 hover:bg-gray-300'} flex items-center justify-center transition-all cursor-pointer hover:scale-110 duration-200`}
            title="展开"
          >
            <ChevronDownIcon className={`w-4 h-4 ${styles.textMuted}`} />
          </button>

          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setIsCollapsed(false)}>
            <div className={`w-20 h-1.5 ${theme === 'dark' ? 'bg-white/10' : 'bg-gray-200'} rounded-full overflow-hidden`}>
              <div
                className={`h-full rounded-full transition-all duration-500 ${getProgressColor(progress)}`}
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className={`text-[10px] font-medium ${styles.textMuted} whitespace-nowrap`}>
              {activeCount > 0 ? `${activeCount}待办` : '完成'}
            </span>
          </div>
        </div>
      </div>
    );
  }

  // --- RENDER ARCHIVE VIEW ---
  if (showArchive) {
    return (
      <div className="relative w-80 flex flex-col max-h-[85vh] font-sans">
        <div className={`absolute inset-0 ${styles.bg} rounded-3xl -z-10 pointer-events-none shadow-lg`} />

        <div className={`flex flex-col rounded-3xl overflow-hidden ${styles.text}`}>
          {/* Header */}
          <div className={`px-4 py-3 ${styles.border} border-b flex items-center justify-between ${theme === 'dark' ? 'bg-white/5' : 'bg-gray-50'} draggable-region cursor-move`}>
            <div className="flex items-center gap-2">
              <CalendarIcon className={`w-4 h-4 ${styles.textDim}`} />
              <span className="font-semibold text-sm">归档记录</span>
            </div>
            <button
              onClick={() => setShowArchive(false)}
              className={`p-1.5 rounded-lg ${styles.hoverBg} ${styles.textDim} hover:${styles.text} transition-colors`}
            >
              <XIcon className="w-4 h-4" />
            </button>
          </div>

          {/* Archive List with Collapsible Sections */}
          <div className="glass-scroll overflow-y-auto max-h-[450px] p-3">
            {archives.length === 0 ? (
              <div className={`flex flex-col items-center justify-center h-32 ${styles.textDim}`}>
                <ArchiveIcon className="w-8 h-8 mb-2 opacity-50" />
                <p className="text-xs">暂无归档记录</p>
              </div>
            ) : (
              <div className="space-y-2">
                {archives.map((archive, idx) => {
                  const isExpanded = expandedArchives.has(archive.date);
                  const archiveProgress = (archive.completedCount / archive.totalCount) * 100;

                  return (
                    <div key={idx} className={`rounded-xl ${theme === 'dark' ? 'bg-white/10' : 'bg-gray-200/60'} overflow-hidden`}>
                      {/* Clickable Header */}
                      <button
                        onClick={() => toggleArchiveExpand(archive.date)}
                        className={`w-full px-3 py-2 flex items-center justify-between ${styles.hoverBg} transition-colors`}
                      >
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${
                            archive.completedCount === archive.totalCount ? 'bg-emerald-400' : 'bg-gray-400'
                          }`} />
                          <span className="text-sm font-medium">{formatDate(archive.date)}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          {/* Always show mini progress bar */}
                          <div className={`w-12 h-1.5 ${theme === 'dark' ? 'bg-white/10' : 'bg-gray-300'} rounded-full overflow-hidden`}>
                            <div
                              className={`h-full rounded-full ${getProgressColor(archiveProgress)}`}
                              style={{ width: `${archiveProgress}%` }}
                            />
                          </div>
                          <span className={`text-xs ${styles.textDim}`}>
                            {archive.completedCount}/{archive.totalCount}
                          </span>
                          <ChevronDownIcon className={`w-4 h-4 ${styles.textDim} transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                        </div>
                      </button>

                      {/* Expandable Content */}
                      {isExpanded && (
                        <div className={`px-3 pb-3 ${styles.border} border-t`}>
                          {/* Progress bar */}
                          <div className={`w-full h-1 ${theme === 'dark' ? 'bg-white/10' : 'bg-gray-200'} rounded-full overflow-hidden my-2`}>
                            <div
                              className={`h-full rounded-full ${getProgressColor(archiveProgress)}`}
                              style={{ width: `${archiveProgress}%` }}
                            />
                          </div>

                          {/* Task list */}
                          <div className="space-y-1">
                            {archive.tasks.map((task, taskIdx) => (
                              <div key={taskIdx} className="flex items-center gap-2 text-xs">
                                <div className={`w-3 h-3 rounded-full flex items-center justify-center ${
                                  task.completed
                                    ? 'bg-emerald-400/20 text-emerald-400'
                                    : theme === 'dark' ? 'bg-white/10 text-white/30' : 'bg-gray-200 text-gray-400'
                                }`}>
                                  {task.completed && <CheckIcon className="w-2 h-2" />}
                                </div>
                                <span className={`flex-1 ${task.completed ? `${styles.textDim} line-through` : styles.textMuted}`}>
                                  {task.text}
                                </span>
                                <span className={`text-[10px] ${task.zone === 'urgent' ? 'text-red-400/60' : 'text-amber-400/60'}`}>
                                  {task.zone === 'urgent' ? '紧急' : '重要'}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // --- RENDER EXPANDED MODE ---
  return (
    <div className="relative w-80 flex flex-col max-h-[85vh] transition-all duration-300 ease-out font-sans">

      {/* Background Layer - No border */}
      <div className={`absolute inset-0 ${styles.bg} rounded-3xl -z-10 pointer-events-none shadow-lg`} />

      {/* Content Container */}
      <div className={`flex flex-col rounded-3xl overflow-hidden ${styles.text} z-0`}>

        {/* Header / Drag Handle */}
        <div className={`px-4 py-2.5 ${styles.border} border-b flex items-center justify-between ${theme === 'dark' ? 'bg-white/5' : 'bg-gray-50'} select-none cursor-move draggable-region`}>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm tracking-wide">QuickNote</span>
          </div>
          <div className={`flex gap-0.5 ${styles.textDim} items-center`}>
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className={`p-1.5 rounded-lg ${styles.hoverBg} transition-all`}
              title={theme === 'dark' ? '切换浅色模式' : '切换深色模式'}
            >
              {theme === 'dark' ? <SunIcon className="w-3.5 h-3.5" /> : <MoonIcon className="w-3.5 h-3.5" />}
            </button>

            <button
              onClick={() => setShowArchive(true)}
              className={`p-1.5 rounded-lg ${styles.hoverBg} transition-all`}
              title="归档记录"
            >
              <ArchiveIcon className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => {
                const newPinned = !isPinned;
                setIsPinned(newPinned);
                window.electronAPI?.setAlwaysOnTop(newPinned);
              }}
              className={`
                transition-all duration-300 ease-in-out p-1.5 rounded-lg ${styles.hoverBg}
                ${isPinned ? 'text-blue-400 rotate-[-45deg]' : ''}
              `}
              title="切换置顶"
            >
              <PinIcon className="w-3.5 h-3.5" filled={isPinned} />
            </button>
            <button
              onClick={() => setIsCollapsed(true)}
              className={`p-1.5 rounded-lg ${styles.hoverBg} transition-colors`}
              title="收起"
            >
              <ChevronUpIcon className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Input Area */}
        <div className="px-4 py-2">
          <div className="relative">
            <input
              type="text"
              value={newTaskText}
              onChange={(e) => setNewTaskText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="添加新任务..."
              className={`
                w-full ${styles.inputBg} border ${styles.inputBorder} rounded-xl px-3 py-1.5 pr-8
                text-sm ${styles.text} placeholder-${theme === 'dark' ? 'white/30' : 'gray-400'}
                focus:outline-none ${styles.inputFocus}
                transition-all duration-200
              `}
            />
            <button
              onClick={() => addTask(activeZone)}
              className={`absolute right-1.5 top-1/2 -translate-y-1/2 p-1 ${styles.textDim} hover:${styles.text} ${styles.hoverBg} rounded-lg transition-all`}
            >
              <PlusIcon className="w-4 h-4" />
            </button>
          </div>

          {/* Zone Toggle */}
          <div className="flex gap-2 mt-1.5">
            <button
              onClick={() => setActiveZone('urgent')}
              className={`flex-1 flex items-center justify-center gap-1 py-1 rounded-lg text-xs font-medium transition-all ${
                activeZone === 'urgent'
                  ? 'bg-red-500/20 text-red-400 border border-red-400/30'
                  : `${styles.inputBg} ${styles.textDim} ${styles.hoverBg} border border-transparent`
              }`}
            >
              <FireIcon className="w-3 h-3" />
              紧急
            </button>
            <button
              onClick={() => setActiveZone('important')}
              className={`flex-1 flex items-center justify-center gap-1 py-1 rounded-lg text-xs font-medium transition-all ${
                activeZone === 'important'
                  ? 'bg-amber-500/20 text-amber-400 border border-amber-400/30'
                  : `${styles.inputBg} ${styles.textDim} ${styles.hoverBg} border border-transparent`
              }`}
            >
              <StarIcon className="w-3 h-3" />
              重要
            </button>
          </div>
        </div>

        {/* Task Zones */}
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="glass-scroll overflow-y-auto max-h-[350px] px-3 pb-1">

            {/* Urgent Zone */}
            <div className="mb-2">
              <button
                onClick={() => setUrgentExpanded(!urgentExpanded)}
                className={`w-full flex items-center gap-2 px-1.5 py-1 text-xs font-medium ${theme === 'dark' ? 'text-red-300/80' : 'text-red-500'} ${styles.hoverBg} rounded-lg transition-colors`}
              >
                <FireIcon className="w-3 h-3" />
                <span>紧急重要</span>
                <span className={styles.textDim}>({urgentCompleted.length}/{urgentAll.length})</span>
                <ChevronDownIcon className={`w-3 h-3 ml-auto ${styles.textDim} transition-transform ${urgentExpanded ? '' : '-rotate-90'}`} />
              </button>
              {urgentExpanded && (
                <Droppable droppableId="urgent">
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`min-h-[32px] rounded-lg transition-colors ${
                        snapshot.isDraggingOver ? 'bg-red-500/10' : ''
                      }`}
                    >
                      {displayUrgent.length === 0 ? (
                        <div className={`flex items-center justify-center h-8 ${styles.textDim} text-xs`}>
                          暂无紧急任务
                        </div>
                      ) : (
                        displayUrgent.map((task, index) => (
                          <Draggable key={task.id} draggableId={task.id} index={index} isDragDisabled={task.completed}>
                            {(provided, snapshot) => (
                              <TaskItem
                                task={task}
                                onToggle={toggleTask}
                                onDelete={deleteTask}
                                innerRef={provided.innerRef}
                                draggableProps={provided.draggableProps}
                                dragHandleProps={provided.dragHandleProps}
                                isDragging={snapshot.isDragging}
                                theme={theme}
                              />
                            )}
                          </Draggable>
                        ))
                      )}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              )}
            </div>

            {/* Important Zone */}
            <div>
              <button
                onClick={() => setImportantExpanded(!importantExpanded)}
                className={`w-full flex items-center gap-2 px-1.5 py-1 text-xs font-medium ${theme === 'dark' ? 'text-amber-300/80' : 'text-amber-600'} ${styles.hoverBg} rounded-lg transition-colors`}
              >
                <StarIcon className="w-3 h-3" />
                <span>重要不紧急</span>
                <span className={styles.textDim}>({importantCompleted.length}/{importantAll.length})</span>
                <ChevronDownIcon className={`w-3 h-3 ml-auto ${styles.textDim} transition-transform ${importantExpanded ? '' : '-rotate-90'}`} />
              </button>
              {importantExpanded && (
                <Droppable droppableId="important">
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`min-h-[32px] rounded-lg transition-colors ${
                        snapshot.isDraggingOver ? 'bg-amber-500/10' : ''
                      }`}
                    >
                      {displayImportant.length === 0 ? (
                        <div className={`flex items-center justify-center h-8 ${styles.textDim} text-xs`}>
                          暂无重要任务
                        </div>
                      ) : (
                        displayImportant.map((task, index) => (
                          <Draggable key={task.id} draggableId={task.id} index={index} isDragDisabled={task.completed}>
                            {(provided, snapshot) => (
                              <TaskItem
                                task={task}
                                onToggle={toggleTask}
                                onDelete={deleteTask}
                                innerRef={provided.innerRef}
                                draggableProps={provided.draggableProps}
                                dragHandleProps={provided.dragHandleProps}
                                isDragging={snapshot.isDragging}
                                theme={theme}
                              />
                            )}
                          </Draggable>
                        ))
                      )}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              )}
            </div>
          </div>
        </DragDropContext>

        {/* Footer with Progress */}
        <div className={`px-4 py-2 ${styles.footerBg} ${styles.border} border-t`}>
          <div className="flex items-center justify-between mb-1">
            {tasks.length > 0 ? (
              <button
                onClick={() => setShowClearConfirm(true)}
                className={`flex items-center gap-1 text-[10px] ${styles.textDim} hover:text-red-400 transition-colors`}
                title="清空所有"
              >
                <TrashIcon className="w-2.5 h-2.5" />
                <span>清空</span>
              </button>
            ) : (
              <span />
            )}

            <button
              onClick={() => setShowOnlyIncomplete(!showOnlyIncomplete)}
              className={`flex items-center gap-1 text-[10px] transition-colors ${
                showOnlyIncomplete ? 'text-blue-400' : `${styles.textDim}`
              }`}
              title="仅显示未完成"
            >
              <div className={`w-2.5 h-2.5 rounded-sm border flex items-center justify-center ${
                showOnlyIncomplete ? 'bg-blue-400 border-blue-400' : theme === 'dark' ? 'border-white/30' : 'border-gray-400'
              }`}>
                {showOnlyIncomplete && <CheckIcon className="w-1.5 h-1.5 text-white" />}
              </div>
              <span>仅显示未完成</span>
            </button>
          </div>

          {/* Progress Bar */}
          <div className="flex items-center gap-2">
            <div className={`flex-1 h-1.5 ${theme === 'dark' ? 'bg-white/10' : 'bg-gray-200'} rounded-full overflow-hidden`}>
              <div
                className={`h-full rounded-full transition-all duration-500 ${getProgressColor(progress)}`}
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className={`text-[10px] ${styles.textDim} w-10 text-right`}>
              {Math.round(progress)}%
            </span>
          </div>
        </div>

      </div>

      {/* Clear All Confirmation Modal */}
      {showClearConfirm && (
        <div className="absolute inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm rounded-3xl"
            onClick={() => setShowClearConfirm(false)}
          />

          <div className={`relative ${theme === 'dark' ? 'bg-slate-800' : 'bg-white'} rounded-2xl p-4 shadow-2xl w-full max-w-[220px] text-center`}>
            <div className="w-9 h-9 bg-red-500/20 text-red-400 rounded-full flex items-center justify-center mx-auto mb-2">
              <TrashIcon className="w-4 h-4" />
            </div>
            <h3 className={`${styles.text} font-medium text-sm mb-1`}>确定要清空吗？</h3>
            <p className={`${styles.textDim} text-xs mb-3`}>
              此操作将删除所有任务。
            </p>
            <div className="flex gap-2 justify-center">
              <button
                onClick={() => setShowClearConfirm(false)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium ${styles.textMuted} ${styles.hoverBg} transition-colors`}
              >
                取消
              </button>
              <button
                onClick={clearAllTasks}
                className="px-3 py-1.5 rounded-lg text-xs font-medium bg-red-500 hover:bg-red-600 text-white transition-colors"
              >
                确认清空
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
