export interface SessionFormData {
  knowledgeId?: string;
  avatarId?: string;
  language: string;
}

export interface ApiResponse {
  data: {
    token: string;
  };
}

export interface AvatarOption {
  id: string;
  label: string;
}