'use client';

import { TutorialTooltip } from './TutorialTooltip';

const steps = [
  {
    target: '[data-tour="metrics"]',
    title: 'Métricas Principales',
    content: 'Aquí puedes ver tus métricas principales: reservas, ingresos, calificación y tasa de conversión.',
    placement: 'bottom' as const,
  },
  {
    target: '[data-tour="revenue-chart"]',
    title: 'Gráfico de Ingresos',
    content: 'Este gráfico muestra la evolución de tus ingresos en el tiempo.',
    placement: 'top' as const,
  },
  {
    target: '[data-tour="bookings-chart"]',
    title: 'Reservas por Período',
    content: 'Aquí puedes ver el número de reservas por período.',
    placement: 'top' as const,
  },
  {
    target: '[data-tour="top-tours"]',
    title: 'Tours Populares',
    content: 'Esta tabla muestra tus tours más populares y rentables.',
    placement: 'top' as const,
  },
  {
    target: '[data-tour="nav-tours"]',
    title: 'Gestión de Tours',
    content: 'Desde aquí puedes gestionar todos tus tours.',
    placement: 'bottom' as const,
  },
];

export function DashboardTour() {
  return <TutorialTooltip steps={steps} tutorialKey="dashboard" />;
}
