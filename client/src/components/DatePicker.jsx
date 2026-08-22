import React, { useState, useRef, useEffect } from 'react';

const DatePicker = ({
  value,
  onChange,
  placeholder = 'Select date',
  minDate,
  maxDate,
  disabled = false,
  required = false,
  id,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  const selectedDate = value ? new Date(value + 'T00:00:00') : null;
  const initialViewDate = selectedDate || new Date();
  
  const [viewYear, setViewYear] = useState(initialViewDate.getFullYear());
  const [viewMonth, setViewMonth] = useState(initialViewDate.getMonth());

  useEffect(() => {
    if (value) {
      const d = new Date(value + 'T00:00:00');
      if (!isNaN(d.getTime())) {
        setViewYear(d.getFullYear());
        setViewMonth(d.getMonth());
      }
    }
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const daysOfWeek = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  const prevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(viewYear - 1);
    } else {
      setViewMonth(viewMonth - 1);
    }
  };

  const nextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(viewYear + 1);
    } else {
      setViewMonth(viewMonth + 1);
    }
  };

  const formatISO = (date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  const formatDisplay = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr + 'T00:00:00');
    if (isNaN(date.getTime())) return dateStr;
    return date.toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

  const totalDays = getDaysInMonth(viewYear, viewMonth);
  const firstDayIndex = getFirstDayOfMonth(viewYear, viewMonth);
  const prevMonthDays = getDaysInMonth(viewYear, viewMonth === 0 ? 11 : viewMonth - 1);

  const days = [];

  for (let i = firstDayIndex - 1; i >= 0; i--) {
    const dayNum = prevMonthDays - i;
    const dateObj = new Date(viewMonth === 0 ? viewYear - 1 : viewYear, viewMonth === 0 ? 11 : viewMonth - 1, dayNum);
    days.push({
      dateObj,
      iso: formatISO(dateObj),
      dayNum,
      isCurrentMonth: false,
    });
  }

  for (let i = 1; i <= totalDays; i++) {
    const dateObj = new Date(viewYear, viewMonth, i);
    days.push({
      dateObj,
      iso: formatISO(dateObj),
      dayNum: i,
      isCurrentMonth: true,
    });
  }

  const remainingCells = 42 - days.length;
  for (let i = 1; i <= remainingCells; i++) {
    const dateObj = new Date(viewMonth === 11 ? viewYear + 1 : viewYear, viewMonth === 11 ? 0 : viewMonth + 1, i);
    days.push({
      dateObj,
      iso: formatISO(dateObj),
      dayNum: i,
      isCurrentMonth: false,
    });
  }

  const todayISO = formatISO(new Date());

  const handleSelect = (iso) => {
    onChange(iso);
    setIsOpen(false);
  };

  const handlePreset = (daysOffset) => {
    const target = new Date();
    target.setDate(target.getDate() + daysOffset);
    const iso = formatISO(target);
    handleSelect(iso);
  };

  const isDateDisabled = (iso) => {
    if (minDate && iso < minDate) return true;
    if (maxDate && iso > maxDate) return true;
    return false;
  };

  return (
    <div className="relative w-full" ref={containerRef}>
      <input
        type="hidden"
        id={id}
        value={value || ''}
        required={required}
      />

      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between df-input text-left cursor-pointer transition-all ${
          isOpen ? 'border-amber-500 ring-2 ring-amber-500/20' : ''
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <div className="flex items-center gap-2.5 truncate">
          <span className="text-amber-400 text-sm">📅</span>
          <span className={value ? 'text-zinc-100 font-medium text-xs' : 'text-zinc-500 text-xs'}>
            {value ? formatDisplay(value) : placeholder}
          </span>
        </div>

        {value ? (
          <span
            onClick={(e) => {
              e.stopPropagation();
              onChange('');
            }}
            className="text-zinc-500 hover:text-zinc-300 text-xs px-1 hover:bg-zinc-800 rounded transition-colors"
            title="Clear date"
          >
            ✕
          </span>
        ) : (
          <span className="text-zinc-600 text-[10px]">▼</span>
        )}
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 z-50 w-72 bg-zinc-900 border border-zinc-800/90 rounded-2xl shadow-2xl backdrop-blur-xl p-4 space-y-3 animate-in fade-in zoom-in-95 duration-150">
          <div className="flex justify-between items-center px-1">
            <button
              type="button"
              onClick={prevMonth}
              className="w-7 h-7 flex items-center justify-center rounded-lg bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 text-xs font-bold transition-colors cursor-pointer"
              title="Previous Month"
            >
              ‹
            </button>

            <span className="font-heading font-bold text-sm text-white">
              {monthNames[viewMonth]} {viewYear}
            </span>

            <button
              type="button"
              onClick={nextMonth}
              className="w-7 h-7 flex items-center justify-center rounded-lg bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 text-xs font-bold transition-colors cursor-pointer"
              title="Next Month"
            >
              ›
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center">
            {daysOfWeek.map((day, idx) => (
              <span key={idx} className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider py-1">
                {day}
              </span>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {days.map((item, idx) => {
              const isSelected = value === item.iso;
              const isToday = todayISO === item.iso;
              const disabledDay = isDateDisabled(item.iso);

              return (
                <button
                  key={idx}
                  type="button"
                  disabled={disabledDay}
                  onClick={() => handleSelect(item.iso)}
                  className={`h-8 w-8 text-xs font-medium rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-amber-500 text-zinc-950 font-bold shadow-md shadow-amber-500/20 scale-105'
                      : isToday
                      ? 'border border-amber-500/60 text-amber-400 font-bold hover:bg-zinc-800'
                      : item.isCurrentMonth
                      ? 'text-zinc-200 hover:bg-zinc-800 hover:text-white'
                      : 'text-zinc-600 hover:bg-zinc-850/50'
                  } ${disabledDay ? 'opacity-25 cursor-not-allowed hover:bg-transparent' : ''}`}
                >
                  {item.dayNum}
                </button>
              );
            })}
          </div>

          <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between text-[11px]">
            <button
              type="button"
              onClick={() => handlePreset(0)}
              className="px-2 py-1 rounded bg-zinc-800/60 hover:bg-zinc-800 text-zinc-300 hover:text-amber-400 font-medium transition-colors cursor-pointer"
            >
              Today
            </button>
            <button
              type="button"
              onClick={() => handlePreset(1)}
              className="px-2 py-1 rounded bg-zinc-800/60 hover:bg-zinc-800 text-zinc-300 hover:text-amber-400 font-medium transition-colors cursor-pointer"
            >
              Tomorrow
            </button>
            <button
              type="button"
              onClick={() => handlePreset(7)}
              className="px-2 py-1 rounded bg-zinc-800/60 hover:bg-zinc-800 text-zinc-300 hover:text-amber-400 font-medium transition-colors cursor-pointer"
            >
              +1 Week
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DatePicker;
