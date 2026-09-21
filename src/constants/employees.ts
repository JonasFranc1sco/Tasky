export type Employee = {
    id: string;
    name: string;
    role: string;
    initials: string;
}

export const EMPLOYEES: Employee[] = [
  { id: 'emp-1', name: 'Jonas Francisco', role: 'Desenvolvedor Frontend', initials: 'JF' },
  { id: 'emp-2', name: 'Rafael Horeay', role: 'Desenvolvedor Backend', initials: 'RH' },
  { id: 'emp-3', name: 'Kemily Freitas', role: 'QA Engineer', initials: 'KF' },
  { id: 'emp-4', name: 'Eduarda Najara', role: 'DevOps Engineer', initials: 'EN' },
];