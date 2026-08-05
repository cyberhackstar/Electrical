export interface QuestionResponse {
  id: number;
  productId: number;
  askerName: string;
  questionText: string;
  answerText: string | null;
  answeredByName: string | null;
  createdAt: string;
  answeredAt: string | null;
}

export interface QuestionRequest {
  productId: number;
  questionText: string;
}

export interface AnswerRequest {
  answerText: string;
}
