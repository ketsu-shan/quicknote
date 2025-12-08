import React, { useState, useEffect } from 'react';
import { Task } from '../types';
import { CheckIcon, TrashIcon } from './Icons';

interface TaskItemProps {
  task: Task;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  // Props for Drag and Drop
  innerRef?: React.Ref<HTMLDivElement>;
  draggableProps?: any;
  dragHandleProps?: any;
  isDragging?: boolean;
  theme?: 'dark' | 'light';
}

// Generate static positions for particles to avoid recalculating on every render
const PARTICLES = Array.from({ length: 8 }).map((_, i) => {
  const angle = (i / 8) * 360;
  const distance = 24; // Distance to fly out
  const x = Math.cos((angle * Math.PI) / 180) * distance;
  const y = Math.sin((angle * Math.PI) / 180) * distance;
  // Randomize colors slightly between emerald and teal
  const colorClass = i % 2 === 0 ? 'bg-emerald-300' : 'bg-teal-200';
  return { x, y, colorClass };
});

export const TaskItem: React.FC<TaskItemProps> = ({
  task,
  onToggle,
  onDelete,
  innerRef,
  draggableProps,
  dragHandleProps,
  isDragging,
  theme = 'dark'
}) => {
  const isDark = theme === 'dark';
  // Animation triggers
  const [isBursting, setIsBursting] = useState(false);
  
  // Optimistic UI state: "Visually completed" before data update
  const [isOptimisticCompleted, setIsOptimisticCompleted] = useState(false);

  // Sync optimistic state with real state when it changes (e.g. unchecking or initial load)
  useEffect(() => {
    setIsOptimisticCompleted(task.completed);
  }, [task.completed]);

  const handleToggle = () => {
    if (task.completed) {
      // Unchecking: Immediate action (no complex animation delay needed)
      onToggle(task.id);
    } else {
      // Completing: Play animation FIRST, then update data
      if (isOptimisticCompleted) return; // Prevent double-clicks during animation

      setIsOptimisticCompleted(true);
      setIsBursting(true);

      // Wait for animation (roughly 700ms) before moving the task via onToggle
      setTimeout(() => {
        onToggle(task.id);
        // Clean up animation state (in case component is reused)
        setIsBursting(false); 
      }, 700);
    }
  };
  
  // Use either the real state or our optimistic state for rendering visuals
  const isChecked = task.completed || isOptimisticCompleted;

  // Combine the transform from react-beautiful-dnd with our custom scale
  const getStyle = (style: any) => {
    if (isDragging && style?.transform) {
      return {
        ...style,
        transform: `${style.transform} scale(1.02)`,
      };
    }
    return style;
  };

  return (
    <div 
      ref={innerRef}
      {...draggableProps}
      {...dragHandleProps}
      className={`
        group relative flex items-center gap-2 px-1.5 py-1 rounded-lg
        transition-[background-color,box-shadow,opacity,border-color] duration-300
        ${isChecked ? 'completed' : ''}
        ${isDragging
          ? `${isDark ? 'bg-slate-700' : 'bg-gray-200'} shadow-[0_10px_30px_rgba(0,0,0,0.3)] ring-2 ring-blue-400/50 z-[9999]`
          : `${isDark ? 'hover:bg-white/10' : 'hover:bg-gray-100'} cursor-grab active:cursor-grabbing`}
        ${isChecked && !task.completed ? 'bg-emerald-500/10 shadow-[0_0_15px_rgba(52,211,153,0.15)]' : ''}
      `}
      style={getStyle(draggableProps?.style)}
    >
      <button
        onClick={handleToggle}
        // Prevent drag when clicking the checkbox
        onMouseDown={(e) => e.stopPropagation()}
        disabled={isOptimisticCompleted && !task.completed} // Disable button while animating
        className={`
          relative flex-shrink-0 w-4 h-4 rounded-full border-[1.5px] flex items-center justify-center
          transition-colors duration-300 cursor-pointer
          ${isChecked
            ? 'bg-emerald-400 border-emerald-400 text-white animate-jelly'
            : isDark ? 'border-white/50 hover:border-white text-transparent' : 'border-gray-400 hover:border-gray-600 text-transparent'}
        `}
      >
        <CheckIcon className="w-2.5 h-2.5 relative z-10" />
        
        {/* Particle Burst System */}
        {isBursting && (
          <div className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none">
            {PARTICLES.map((p, i) => (
              <div
                key={i}
                className={`absolute w-1 h-1 rounded-full opacity-0 animate-particle ${p.colorClass}`}
                style={{
                  '--tw-translate-x': `${p.x}px`,
                  '--tw-translate-y': `${p.y}px`,
                } as React.CSSProperties}
              />
            ))}
          </div>
        )}
      </button>
      
      {/* Text Container with Custom Strike Line */}
      <div className="flex-grow min-w-0 py-0.5">
         <div className="relative inline-block max-w-full align-middle">
            <span
              className={`
                block text-sm font-medium transition-all duration-300 select-none truncate
                ${isChecked
                  ? isDark ? 'text-white/40 blur-[0.5px]' : 'text-gray-400 blur-[0.5px]'
                  : isDark ? 'text-white/90' : 'text-gray-800'}
              `}
            >
              {task.text}
            </span>
            {/* The animated line, now contained within the inline-block wrapper */}
            <div className="strike-line" />
         </div>
      </div>

      <button
        onClick={() => onDelete(task.id)}
        onMouseDown={(e) => e.stopPropagation()}
        className={`opacity-0 group-hover:opacity-100 p-1 ${isDark ? 'text-white/50 hover:text-red-200' : 'text-gray-400 hover:text-red-500'} hover:bg-red-500/20 rounded transition-all duration-200 cursor-pointer scale-90 hover:scale-100`}
        title="删除任务"
      >
        <TrashIcon className="w-3 h-3" />
      </button>
    </div>
  );
};
