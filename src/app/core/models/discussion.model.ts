export interface Reply {
  id: string;
  authorName: string;
  authorAvatar: string;
  authorRole: 'Estudiante' | 'Profesor' | 'Tutor';
  timeAgo: string;
  content: string;
  likesCount: number;
  isUserLiked?: boolean;
}

export interface CommentThread {
  id: string;
  lessonId: string;
  authorName: string;
  authorAvatar: string;
  authorRole: 'Estudiante' | 'Profesor' | 'Tutor';
  timeAgo: string;
  content: string;
  likesCount: number;
  isUserLiked?: boolean;
  replies: Reply[];
}
