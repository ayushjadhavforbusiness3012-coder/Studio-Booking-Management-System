"use client";

import React, { FormEvent, useEffect, useState } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus,
  MoreHorizontal
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Modal } from '@/components/ui/Modal';
import { dataService } from '@/services/dataService';
import { CalendarEvent } from '@/types';

const TIME_SLOTS = [
  { label: '00:00 - 01:00', start: '00:00', end: '01:00', hourStart: 0, hourEnd: 1 },
  { label: '01:00 - 02:00', start: '01:00', end: '02:00', hourStart: 1, hourEnd: 2 },
  { label: '02:00 - 03:00', start: '02:00', end: '03:00', hourStart: 2, hourEnd: 3 },
  { label: '03:00 - 04:00', start: '03:00', end: '04:00', hourStart: 3, hourEnd: 4 },
  { label: '04:00 - 05:00', start: '04:00', end: '05:00', hourStart: 4, hourEnd: 5 },
  { label: '05:00 - 06:00', start: '05:00', end: '06:00', hourStart: 5, hourEnd: 6 },
  { label: '06:00 - 07:00', start: '06:00', end: '07:00', hourStart: 6, hourEnd: 7 },
  { label: '07:00 - 08:00', start: '07:00', end: '08:00', hourStart: 7, hourEnd: 8 },
  { label: '08:00 - 09:00', start: '08:00', end: '09:00', hourStart: 8, hourEnd: 9 },
  { label: '09:00 - 10:00', start: '09:00', end: '10:00', hourStart: 9, hourEnd: 10 },
  { label: '10:00 - 11:00', start: '10:00', end: '11:00', hourStart: 10, hourEnd: 11 },
  { label: '11:00 - 12:00', start: '11:00', end: '12:00', hourStart: 11, hourEnd: 12 },
  { label: '12:00 - 13:00', start: '12:00', end: '13:00', hourStart: 12, hourEnd: 13 },
  { label: '13:00 - 14:00', start: '13:00', end: '14:00', hourStart: 13, hourEnd: 14 },
  { label: '14:00 - 15:00', start: '14:00', end: '15:00', hourStart: 14, hourEnd: 15 },
  { label: '15:00 - 16:00', start: '15:00', end: '16:00', hourStart: 15, hourEnd: 16 },
  { label: '16:00 - 17:00', start: '16:00', end: '17:00', hourStart: 16, hourEnd: 17 },
  { label: '17:00 - 18:00', start: '17:00', end: '18:00', hourStart: 17, hourEnd: 18 },
  { label: '18:00 - 19:00', start: '18:00', end: '19:00', hourStart: 18, hourEnd: 19 },
  { label: '19:00 - 20:00', start: '19:00', end: '20:00', hourStart: 19, hourEnd: 20 },
  { label: '20:00 - 21:00', start: '20:00', end: '21:00', hourStart: 20, hourEnd: 21 },
  { label: '21:00 - 22:00', start: '21:00', end: '22:00', hourStart: 21, hourEnd: 22 },
  { label: '22:00 - 23:00', start: '22:00', end: '23:00', hourStart: 22, hourEnd: 23 },
  { label: '23:00 - 00:00', start: '23:00', end: '00:00', hourStart: 23, hourEnd: 24 },
];

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeEventMenuId, setActiveEventMenuId] = useState<string | null>(null);
  const [viewDetailsEvent, setViewDetailsEvent] = useState<CalendarEvent | null>(null);
  const [deleteDayEventsDate, setDeleteDayEventsDate] = useState<string | null>(null);

  const [newEvent, setNewEvent] = useState({
    title: '',
    date: new Date().toISOString().split('T')[0],
    startSlotIndex: 9,
    endSlotIndex: 9,
    studioRoom: 'Studio A',
    notes: '',
  });

  const monthYearLabel = currentDate.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startDay = (new Date(year, month, 1).getDay() + 6) % 7;
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const padding = Array.from({ length: startDay }, (_, i) => i);
  const trailingPadding = Array.from(
    { length: 42 - (daysInMonth + startDay) },
    (_, i) => i
  );

  const goToPreviousMonth = () => {
    setCurrentDate((date) => new Date(date.getFullYear(), date.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate((date) => new Date(date.getFullYear(), date.getMonth() + 1, 1));
  };

  useEffect(() => {
    const loadEvents = async () => {
      const savedEvents = await dataService.getCalendarEvents();
      setEvents(savedEvents);
    };

    loadEvents();
  }, []);

  const handleCreateEvent = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const startSlot = TIME_SLOTS[newEvent.startSlotIndex];
    const endSlot = TIME_SLOTS[newEvent.endSlotIndex];

    const createdEvent = await dataService.createCalendarEvent({
      title: newEvent.title,
      date: newEvent.date,
      startTime: startSlot.start,
      endTime: endSlot.end,
      studioRoom: newEvent.studioRoom,
      notes: newEvent.notes,
    });

    setEvents((currentEvents) => [createdEvent, ...currentEvents]);
    setCurrentDate(new Date(`${createdEvent.date}T00:00:00`));
    setNewEvent({
      title: '',
      date: createdEvent.date,
      startSlotIndex: 9,
      endSlotIndex: 9,
      studioRoom: 'Studio A',
      notes: '',
    });
    setIsModalOpen(false);
  };

  const eventsForDay = (day: number) =>
    events.filter((event) => {
      const eventDate = new Date(`${event.date}T00:00:00`);
      return (
        eventDate.getFullYear() === year &&
        eventDate.getMonth() === month &&
        eventDate.getDate() === day
      );
    });

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-white mb-2">Calendar</h1>
          <p className="text-slate-400">View studio availability and upcoming sessions.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-6 py-3 rounded-xl border border-slate-800 transition-all font-semibold active:scale-95"
        >
          <Plus className="w-5 h-5 text-violet-500" />
          Add Event
        </button>
      </div>

      <div className="bg-slate-900/50 border border-slate-800 rounded-3xl overflow-hidden glass-dark premium-shadow">
        <div className="p-8 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-bold text-white tracking-tight">{monthYearLabel}</h2>
            <div className="flex items-center bg-slate-950 rounded-xl p-1 border border-slate-800">
              <button
                onClick={goToPreviousMonth}
                className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={goToNextMonth}
                className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-7 border-b border-slate-800">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
            <div key={day} className="py-4 text-center text-xs font-bold text-slate-500 uppercase tracking-widest bg-slate-950/30">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7">
          {padding.map(p => (
            <div key={`p-${p}`} className="h-32 border-b border-r border-slate-800 bg-slate-950/10" />
          ))}
          {days.map(day => {
            const isCurrentDay =
              day === new Date().getDate() &&
              month === new Date().getMonth() &&
              year === new Date().getFullYear();

            return (
              <div key={day} className={cn(
                "h-32 border-b border-r border-slate-800 p-3 hover:bg-slate-800/30 transition-colors relative group",
                isCurrentDay ? "bg-violet-500/5 ring-1 ring-inset ring-violet-500/20" : ""
              )}>
                <span className={cn(
                  "text-sm font-bold",
                  isCurrentDay ? "text-violet-400" : "text-slate-500 group-hover:text-slate-300"
                )}>{day}</span>
                
                {eventsForDay(day).length > 0 && (
                  <div className="mt-2 space-y-1 max-h-20 overflow-y-auto">
                    {eventsForDay(day).map((event) => (
                      <div
                        key={event.id}
                        className="relative group/event px-2 py-1 bg-emerald-600/20 border border-emerald-500/30 rounded-lg flex items-center justify-between gap-1.5 overflow-visible"
                      >
                        <div className="flex items-center gap-1.5 overflow-hidden">
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                          <span className="text-[10px] font-bold text-emerald-300 truncate">
                            {event.title} ({event.startTime} - {event.endTime})
                          </span>
                        </div>
                        
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveEventMenuId(activeEventMenuId === event.id ? null : event.id);
                          }}
                          className="p-0.5 hover:bg-slate-800 rounded text-slate-400 transition-colors"
                        >
                          <MoreHorizontal className="w-3.5 h-3.5" />
                        </button>

                        {activeEventMenuId === event.id && (
                          <div className="absolute right-0 top-6 z-30 w-32 rounded-lg border border-slate-800 bg-slate-950 shadow-xl overflow-hidden">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setViewDetailsEvent(event);
                                setActiveEventMenuId(null);
                              }}
                              className="w-full px-3 py-2 text-left text-[11px] font-semibold text-slate-300 hover:bg-slate-800 transition-colors"
                            >
                              View Details
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setDeleteDayEventsDate(event.date);
                                setActiveEventMenuId(null);
                              }}
                              className="w-full px-3 py-2 text-left text-[11px] font-semibold text-rose-300 hover:bg-slate-800 transition-colors"
                            >
                              Delete Option
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
          {/* Fill the rest of the grid */}
          {trailingPadding.map((_, i) => (
            <div key={`empty-${i}`} className="h-32 border-b border-r border-slate-800 bg-slate-950/10" />
          ))}
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add Event">
        <form onSubmit={handleCreateEvent} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-400">Event Title</label>
            <input
              type="text"
              required
              value={newEvent.title}
              onChange={(event) => setNewEvent((current) => ({ ...current, title: event.target.value }))}
              className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl focus:ring-2 focus:ring-violet-500 text-white"
              placeholder="Studio A Session"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-400">Date</label>
              <input
                type="date"
                required
                value={newEvent.date}
                onChange={(event) => setNewEvent((current) => ({ ...current, date: event.target.value }))}
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl focus:ring-2 focus:ring-violet-500 text-white"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-400">Studio Room</label>
              <select
                value={newEvent.studioRoom}
                onChange={(event) => setNewEvent((current) => ({ ...current, studioRoom: event.target.value }))}
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl focus:ring-2 focus:ring-violet-500 text-white font-semibold"
              >
                <option value="Studio A">Studio A</option>
                <option value="Studio B">Studio B</option>
                <option value="Studio C">Studio C</option>
                <option value="Studio D">Studio D</option>
                <option value="Studio E">Studio E</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-400">Start Time Slot</label>
              <select
                required
                value={newEvent.startSlotIndex}
                onChange={(event) => {
                  const val = parseInt(event.target.value, 10);
                  setNewEvent((current) => ({
                    ...current,
                    startSlotIndex: val,
                    endSlotIndex: Math.max(current.endSlotIndex, val)
                  }));
                }}
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl focus:ring-2 focus:ring-violet-500 text-white"
              >
                {TIME_SLOTS.map((slot, idx) => (
                  <option key={idx} value={idx}>{slot.label}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-400">End Time Slot</label>
              <select
                required
                value={newEvent.endSlotIndex}
                onChange={(event) => {
                  const val = parseInt(event.target.value, 10);
                  setNewEvent((current) => ({
                    ...current,
                    endSlotIndex: val
                  }));
                }}
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl focus:ring-2 focus:ring-violet-500 text-white"
              >
                {TIME_SLOTS.slice(newEvent.startSlotIndex).map((slot, idx) => {
                  const actualIdx = idx + newEvent.startSlotIndex;
                  return (
                    <option key={actualIdx} value={actualIdx}>{slot.label}</option>
                  );
                })}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-400">Notes</label>
            <textarea
              rows={3}
              value={newEvent.notes}
              onChange={(event) => setNewEvent((current) => ({ ...current, notes: event.target.value }))}
              className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl focus:ring-2 focus:ring-violet-500 text-white"
              placeholder="Any details for this event..."
            />
          </div>

          <button className="w-full py-4 bg-gradient-to-r from-violet-600 to-pink-600 rounded-xl font-bold text-white shadow-xl hover:shadow-violet-600/20 transition-all active:scale-95">
            Add Event
          </button>
        </form>
      </Modal>

      <Modal
        isOpen={Boolean(viewDetailsEvent)}
        onClose={() => setViewDetailsEvent(null)}
        title="Event Details"
      >
        {viewDetailsEvent && (
          <div className="space-y-4 text-slate-300">
            <div>
              <p className="text-xs uppercase tracking-wider text-slate-500 font-semibold mb-1">Event Name</p>
              <p className="text-lg font-bold text-white">{viewDetailsEvent.title}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs uppercase tracking-wider text-slate-500 font-semibold mb-1">Date</p>
                <p className="text-sm font-medium text-slate-200">{viewDetailsEvent.date}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider text-slate-500 font-semibold mb-1">Time Range</p>
                <p className="text-sm font-medium text-slate-200">{viewDetailsEvent.startTime} - {viewDetailsEvent.endTime}</p>
              </div>
            </div>
            {viewDetailsEvent.studioRoom && (
              <div>
                <p className="text-xs uppercase tracking-wider text-slate-500 font-semibold mb-1">Studio Room</p>
                <p className="text-sm font-medium text-slate-200">{viewDetailsEvent.studioRoom}</p>
              </div>
            )}
            {viewDetailsEvent.notes && (
              <div>
                <p className="text-xs uppercase tracking-wider text-slate-500 font-semibold mb-1">Notes</p>
                <p className="text-sm text-slate-400 bg-slate-800 p-3 rounded-lg border border-slate-700">{viewDetailsEvent.notes}</p>
              </div>
            )}
          </div>
        )}
      </Modal>

      <Modal
        isOpen={Boolean(deleteDayEventsDate)}
        onClose={() => setDeleteDayEventsDate(null)}
        title={`Delete Events for ${deleteDayEventsDate || ''}`}
      >
        {deleteDayEventsDate && (
          <div className="space-y-4">
            <p className="text-sm text-slate-400">All events scheduled for this day are listed below. Click Delete to purge.</p>
            <div className="space-y-3">
              {events.filter(e => e.date === deleteDayEventsDate).length === 0 ? (
                <p className="text-center text-slate-500 text-sm py-4">No events scheduled for this day.</p>
              ) : (
                events.filter(e => e.date === deleteDayEventsDate).map((ev) => (
                  <div key={ev.id} className="flex justify-between items-center p-4 bg-slate-800/50 border border-slate-700 rounded-xl">
                    <div>
                      <p className="font-bold text-white text-sm">{ev.title}</p>
                      <p className="text-xs text-slate-500">{ev.startTime} - {ev.endTime} {ev.studioRoom ? `| ${ev.studioRoom}` : ''}</p>
                    </div>
                    <button
                      onClick={async () => {
                        await dataService.deleteCalendarEvent(ev.id);
                        setEvents(prev => prev.filter(e => e.id !== ev.id));
                      }}
                      className="px-3 py-1.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 rounded-lg active:scale-95 transition-all"
                    >
                      Delete
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
