import { TaskEvent } from './task.model';

export interface WeeklyTemplate {
  id: string;
  name: string;
  description: string;
  structureJson: TaskEvent[];
}

const baseTask = (id: string, title: string, category: string, color: string, dayOfWeek: number, start: string, end: string): TaskEvent => ({
  id,
  scheduleId: 'template',
  title,
  category,
  color,
  start,
  end,
  dayOfWeek,
  isRecurring: true,
  recurrencePattern: 'weekly'
});

export const builtInTemplates: WeeklyTemplate[] = [
  {
    id: 'concurseiro',
    name: 'Concurseiro Essencial',
    description: 'Blocos de estudo, revisão e descanso para manter consistência semanal.',
    structureJson: [
      baseTask('c1', 'Estudo foco', 'Concurso', '#4f46e5', 1, '2026-01-05T08:00:00.000Z', '2026-01-05T10:00:00.000Z'),
      baseTask('c2', 'Revisão ativa', 'Concurso', '#7c3aed', 2, '2026-01-06T19:00:00.000Z', '2026-01-06T20:00:00.000Z'),
      baseTask('c3', 'Questões', 'Concurso', '#4338ca', 4, '2026-01-08T08:00:00.000Z', '2026-01-08T09:30:00.000Z')
    ]
  },
  {
    id: 'trabalho',
    name: 'Trabalho Produtivo',
    description: 'Rotina de trabalho profundo com pausas curtas e bloco administrativo.',
    structureJson: [
      baseTask('t1', 'Trabalho focado', 'Trabalho', '#2563eb', 1, '2026-01-05T09:00:00.000Z', '2026-01-05T11:30:00.000Z'),
      baseTask('t2', 'Reuniões', 'Trabalho', '#0ea5e9', 3, '2026-01-07T14:00:00.000Z', '2026-01-07T15:00:00.000Z'),
      baseTask('t3', 'Planejamento semanal', 'Trabalho', '#0284c7', 5, '2026-01-09T16:00:00.000Z', '2026-01-09T17:00:00.000Z')
    ]
  },
  {
    id: 'saude',
    name: 'Saúde e Bem-estar',
    description: 'Treino, alimentação e recuperação para uma semana equilibrada.',
    structureJson: [
      baseTask('s1', 'Treino', 'Saúde', '#059669', 1, '2026-01-05T18:00:00.000Z', '2026-01-05T19:00:00.000Z'),
      baseTask('s2', 'Cardio leve', 'Saúde', '#10b981', 3, '2026-01-07T07:00:00.000Z', '2026-01-07T07:45:00.000Z'),
      baseTask('s3', 'Alongamento', 'Saúde', '#34d399', 6, '2026-01-10T09:00:00.000Z', '2026-01-10T09:30:00.000Z')
    ]
  }
];