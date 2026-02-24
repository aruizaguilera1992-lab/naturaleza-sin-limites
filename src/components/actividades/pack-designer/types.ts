import { UnifiedActivity } from '@/hooks/useActivitiesData';

export interface Pack {
  id: string;
  name: string;
  subtitle: string;
  description: string;
  activities: number;
  types: string[];
  price: string;
  originalPrice: string;
  savings: string;
  icon: React.ElementType;
  color: string;
  features: string[];
  validityMonths: number;
  requiredActivityTypes: ('barranquismo' | 'escalada' | 'ferratas')[];
  levelRestriction?: 'high' | 'any';
  minGroupSize?: number;
}

export interface SelectedActivity {
  activity: UnifiedActivity;
  date?: Date;
  time?: string;
}

export interface PackDesignerState {
  step: number;
  pack: Pack | null;
  selectedActivities: {
    barranquismo?: SelectedActivity;
    escalada?: SelectedActivity;
    ferratas?: SelectedActivity;
  };
  participants: number;
  coordinator: {
    name: string;
    email: string;
    phone: string;
  };
  termsAccepted: boolean;
}

export const initialState: PackDesignerState = {
  step: 1,
  pack: null,
  selectedActivities: {},
  participants: 4,
  coordinator: {
    name: '',
    email: '',
    phone: '',
  },
  termsAccepted: false,
};
