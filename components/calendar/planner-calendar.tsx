'use client';

import { useEffect, useRef } from 'react';
import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import type { EventChangeArg } from '@fullcalendar/core';
import { TaskEvent, CalendarView } from '@/mvc/models/task.model';

interface PlannerCalendarProps {
  events: TaskEvent[];
  view: CalendarView;
  compact: boolean;
  slotMinTime: string;
  slotMaxTime: string;
  onEventChange: (event: { id: string; start: string; end: string }) => void;
}

export function PlannerCalendar({ events, view, compact, slotMinTime, slotMaxTime, onEventChange }: PlannerCalendarProps) {
  const calendarRef = useRef<FullCalendar | null>(null);

  useEffect(() => {
    const api = calendarRef.current?.getApi();
    if (api) {
      api.changeView(view);
    }
  }, [view]);

  const handleEventChange = (changeInfo: EventChangeArg) => {
    if (!changeInfo.event.start || !changeInfo.event.end) return;

    onEventChange({
      id: changeInfo.event.id,
      start: changeInfo.event.start.toISOString(),
      end: changeInfo.event.end.toISOString()
    });
  };

  return (
    <div id="planner-grid" className="card overflow-hidden">
      <FullCalendar
        ref={calendarRef}
        plugins={[timeGridPlugin, dayGridPlugin, interactionPlugin]}
        initialView={view}
        headerToolbar={false}
        editable
        selectable
        eventChange={handleEventChange}
        eventDrop={handleEventChange}
        eventResize={handleEventChange}
        weekends
        eventResizableFromStart
        dayMaxEventRows={compact ? 2 : 8}
        slotMinTime={slotMinTime}
        slotMaxTime={slotMaxTime}
        events={events.map((event) => ({
          id: event.id,
          title: event.title,
          start: event.start,
          end: event.end,
          backgroundColor: event.color
        }))}
      />
    </div>
  );
}