export type Role = 'admin' | 'tesouraria';

export interface Member {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  birthdate: string;
  ministry: string;
  joinedDate: string;
  notes: string;
}

export type FinanceType = 'entrada' | 'saida';

export interface FinanceEntry {
  id: string;
  type: FinanceType;
  category: string;
  amount: number;
  date: string; // formato YYYY-MM-DD
  description: string;
}
