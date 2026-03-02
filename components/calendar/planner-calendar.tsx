'use client';

import { useEffect, useRef, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import type { DatesSetArg, EventChangeArg, EventClickArg } from '@fullcalendar/core';
import ptBrLocale from '@fullcalendar/core/locales/pt-br';
import { TaskEvent, CalendarView } from '@/mvc/models/task.model';

interface PlannerCalendarProps {
  events: TaskEvent[];
  view: CalendarView;
  compact: boolean;
  slotMinTime: string;
  slotMaxTime: string;
  jumpToDate?: string;
  onEventChange: (event: { id: string; start: string; end: string }) => void;
  onEventDelete: (id: string) => void;
  onWeekReferenceChange?: (dateIso: string) => void;
}

export function PlannerCalendar({ events, view, compact, slotMinTime, slotMaxTime, jumpToDate, onEventChange, onEventDelete, onWeekReferenceChange }: PlannerCalendarProps) {
  const calendarRef = useRef<FullCalendar | null>(null);
  const [periodLabel, setPeriodLabel] = useState('');

  useEffect(() => {
    const api = calendarRef.current?.getApi();
    if (api) {
      api.changeView(view);
      setPeriodLabel(api.view.title);
    }
  }, [view]);

  useEffect(() => {
    if (!jumpToDate) return;
    const api = calendarRef.current?.getApi();
    if (api) {
      api.gotoDate(jumpToDate);
      setPeriodLabel(api.view.title);
    }
  }, [jumpToDate]);

  const handleEventChange = (changeInfo: EventChangeArg) => {
    if (!changeInfo.event.start || !changeInfo.event.end) return;

    onEventChange({
      id: changeInfo.event.id,
      start: changeInfo.event.start.toISOString(),
      end: changeInfo.event.end.toISOString()
    });
  };

  const handleEventClick = (clickInfo: EventClickArg) => {
    const shouldDelete = window.confirm(`Excluir a tarefa "${clickInfo.event.title}"?`);
    if (shouldDelete) {
      onEventDelete(clickInfo.event.id);
    }
  };

  const handleDatesSet = (datesInfo: DatesSetArg) => {
    setPeriodLabel(datesInfo.view.title);
    onWeekReferenceChange?.(datesInfo.start.toISOString());
  };

  return (
    <div id="planner-grid" className="card overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 px-3 py-2 dark:border-slate-700">
        <div className="flex gap-2">
          <button className="rounded border px-3 py-1 text-sm" onClick={() => calendarRef.current?.getApi().prev()}>Anterior</button>
          <button className="rounded border px-3 py-1 text-sm" onClick={() => calendarRef.current?.getApi().today()}>Hoje</button>
          <button className="rounded border px-3 py-1 text-sm" onClick={() => calendarRef.current?.getApi().next()}>Próximo</button>
        </div>
        <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{periodLabel}</p>
      </div>
      <FullCalendar
        ref={calendarRef}
        plugins={[timeGridPlugin, dayGridPlugin, interactionPlugin]}
        initialView={view}
        locale={ptBrLocale}
        headerToolbar={false}
        buttonText={{
          today: 'Hoje',
          month: 'Mês',
          week: 'Semana',
          day: 'Dia'
        }}
        editable
        selectable
        datesSet={handleDatesSet}
        eventChange={handleEventChange}
        eventDrop={handleEventChange}
        eventResize={handleEventChange}
        eventClick={handleEventClick}
        weekends
        eventResizableFromStart
        dayMaxEventRows={compact ? 2 : 8}
        slotDuration="00:15:00"
        snapDuration="00:15:00"
        slotLabelInterval="00:30:00"
        slotLabelFormat={{ hour: '2-digit', minute: '2-digit', hour12: false }}
        eventTimeFormat={{ hour: '2-digit', minute: '2-digit', hour12: false }}
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