export interface RecommendationCardItem {
  title: string;
  description: string;
}

export interface RecommendationCard {
  id: string;
  num: number;
  title: string;
  icon: string; // FontAwesome icon class or identifier
  highlight?: boolean;
  items: RecommendationCardItem[];
}

export interface RecommendationObjective {
  id: string;
  name: string;
  badgeLabel: string;
  bannerSubtitle: string;
  summaryText: string;
  summaryTag: string;
  cards: RecommendationCard[];
}

export interface PatientOption {
  id: string;
  name: string;
  goal: string;
  objectiveId: string;
  notes?: string;
  plan?: string;
}

export interface RecommendationSheetData {
  patientName: string;
  objectiveId: string;
  dateStr: string;
  specificIndications: string;
  cards?: RecommendationCard[];
}
