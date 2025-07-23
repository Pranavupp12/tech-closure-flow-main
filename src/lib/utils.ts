
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { 
  User, 
  users, 
  Role, 
  Customer, 
  Project, 
  Task, 
  Response,
  Review,
  Final 
} from "./data";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-IN', { 
    day: '2-digit', 
    month: 'short', 
    year: 'numeric' 
  }).format(date);
}

export function authenticateUser(username: string, password: string): User | null {
  const user = users.find(
    (user) => user.username.toLowerCase() === username.toLowerCase() && user.password === password
  );
  return user || null;
}

export function getColorForRole(role: Role): string {
  switch (role) {
    case 'sales':
      return 'bg-sales text-white';
    case 'technical':
      return 'bg-technical text-white';
    case 'assignee':
      return 'bg-assignee text-white';
    case 'reviewer':
      return 'bg-reviewer text-white';
    case 'final':
      return 'bg-final text-white';
    default:
      return 'bg-gray-500 text-white';
  }
}

export function getProjectById(projectId: string, projects: Project[]): Project | undefined {
  return projects.find(project => project.id === projectId);
}

export function getTaskById(taskId: string, tasks: Task[]): Task | undefined {
  return tasks.find(task => task.id === taskId);
}

export function getResponseByTaskId(taskId: string, responses: Response[]): Response | undefined {
  return responses.find(response => response.taskId === taskId);
}

export function getReviewByResponseId(responseId: string, reviews: Review[]): Review | undefined {
  return reviews.find(review => review.responseId === responseId);
}

export function getFinalByReviewId(reviewId: string, finals: Final[]): Final | undefined {
  return finals.find(final => final.reviewId === reviewId);
}

export function getUserById(userId: string): User | undefined {
  return users.find(user => user.id === userId);
}

export function getCustomerById(customerId: string, customers: Customer[]): Customer | undefined {
  return customers.find(customer => customer.id === customerId);
}

export function base64ToFile(base64String: string, filename: string): File {
  const arr = base64String.split(',');
  const mime = arr[0].match(/:(.*?);/)![1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  
  return new File([u8arr], filename, { type: mime });
}

export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
}

// Add missing exports for getPEPPLAssignees and getOtherAssignees
export { getPEPPLAssignees, getOtherAssignees } from './data';
