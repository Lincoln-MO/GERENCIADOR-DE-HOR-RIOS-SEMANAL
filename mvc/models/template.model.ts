import { TaskEvent } from './task.model';

export interface WeeklyTemplate {
  id: string;
  name: string;
  description: string;
  structureJson: TaskEvent[];
}

export const builtInTemplates: WeeklyTemplate[] = [
  { id: 'school', name: 'Horário Escolar', description: 'Modelo base para estudantes.', structureJson: [] },
  { id: 'concurseiro', name: 'Rotina de Concurseiro', description: 'Foco em blocos de estudo e revisão.', structureJson: [] },
  { id: 'fitness', name: 'Rotina Fitness', description: 'Treinos, alimentação e recuperação.', structureJson: [] },
  { id: 'universitaria', name: 'Rotina Universitária', description: 'Aulas, estágio e estudos.', structureJson: [] },
  { id: 'produtiva', name: 'Semana Produtiva', description: 'Planejamento para trabalho profundo.', structureJson: [] }
];