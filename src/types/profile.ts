// Career Profile Types
export interface CareerProfile {
  id: string;
  userId?: string;
  careerSelfConcept: CareerSelfConcept;
  competenceStructure: CompetenceStructure;
  createdAt: Date;
  updatedAt: Date;
}

export interface CareerSelfConcept {
  wordcloud: WordCloudData;
  textSummary: TextSummary;
}

export interface WordCloudData {
  source: string[];
  visualType: 'frequency_cloud';
  clickBehavior: 'highlight_source_description';
  words: WordCloudWord[];
}

export interface WordCloudWord {
  text: string;
  value: number;
  source: string[];
}

export interface TextSummary {
  format: 'sentence + explanation';
  sentenceSummary: string;
  detailedDescription: string;
  evidenceMapping: string[];
}

export interface CompetenceStructure {
  objectiveAbilities: ObjectiveAbilities;
  subjectiveAbilities: SubjectiveAbilities;
  developmentPotential: DevelopmentPotential;
  structureSummary: StructureSummary;
}

export interface ObjectiveAbilities {
  displayType: 'table';
  abilities: ObjectiveAbility[];
}

export interface ObjectiveAbility {
  name: string;
  evidence: string;
  level?: 'beginner' | 'intermediate' | 'advanced';
}

export interface SubjectiveAbilities {
  displayType: 'text_blocks';
  selfStatements: SubjectiveAbility[];
}

export interface SubjectiveAbility {
  label: string;
  userInput: string;
  source?: string;
}

export interface DevelopmentPotential {
  skills: DevelopmentSkill[];
}

export interface DevelopmentSkill {
  name: string;
  currentStatus: 'beginner' | 'intermediate' | 'advanced';
  suggestion: string;
  priority?: 'high' | 'medium' | 'low';
}

export interface StructureSummary {
  evaluationText: string;
  overallRating?: number;
  keyStrengths: string[];
  improvementAreas: string[];
}
