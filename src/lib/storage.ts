
import { Customer, Project, Task, Response, Review, Final, User, users } from './data';

const STORAGE_KEYS = {
  CUSTOMERS: 'premier_energies_customers',
  PROJECTS: 'premier_energies_projects',
  TASKS: 'premier_energies_tasks',
  RESPONSES: 'premier_energies_responses',
  REVIEWS: 'premier_energies_reviews',
  FINALS: 'premier_energies_finals',
  CURRENT_USER: 'premier_energies_current_user',
};

// Export users for access in other files
export { users };

// Customers
export const saveCustomers = (customers: Customer[]): void => {
  localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(customers));
};

export const getCustomers = (): Customer[] => {
  const data = localStorage.getItem(STORAGE_KEYS.CUSTOMERS);
  return data ? JSON.parse(data) : [];
};

export const addCustomer = (customer: Customer): void => {
  const customers = getCustomers();
  customers.push(customer);
  saveCustomers(customers);
};

// Projects
export const saveProjects = (projects: Project[]): void => {
  localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(projects));
};

export const getProjects = (): Project[] => {
  const data = localStorage.getItem(STORAGE_KEYS.PROJECTS);
  return data ? JSON.parse(data) : [];
};

export const addProject = (project: Project): void => {
  const projects = getProjects();
  projects.push(project);
  saveProjects(projects);
};

export const updateProject = (updatedProject: Project): void => {
  const projects = getProjects();
  const index = projects.findIndex(p => p.id === updatedProject.id);
  
  if (index !== -1) {
    projects[index] = updatedProject;
    saveProjects(projects);
  }
};

// Added getProjectById function that was missing
export const getProjectById = (projectId: string): Project | undefined => {
  const projects = getProjects();
  return projects.find(project => project.id === projectId);
};

// Tasks
export const saveTasks = (tasks: Task[]): void => {
  localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
};

export const getTasks = (): Task[] => {
  const data = localStorage.getItem(STORAGE_KEYS.TASKS);
  return data ? JSON.parse(data) : [];
};

export const addTask = (task: Task): void => {
  const tasks = getTasks();
  tasks.push(task);
  saveTasks(tasks);
};

export const updateTask = (updatedTask: Task): void => {
  const tasks = getTasks();
  const index = tasks.findIndex(t => t.id === updatedTask.id);
  
  if (index !== -1) {
    tasks[index] = updatedTask;
    saveTasks(tasks);
  }
};

// Responses
export const saveResponses = (responses: Response[]): void => {
  localStorage.setItem(STORAGE_KEYS.RESPONSES, JSON.stringify(responses));
};

export const getResponses = (): Response[] => {
  const data = localStorage.getItem(STORAGE_KEYS.RESPONSES);
  return data ? JSON.parse(data) : [];
};

export const addResponse = (response: Response): void => {
  const responses = getResponses();
  responses.push(response);
  saveResponses(responses);
};

export const updateResponse = (updatedResponse: Response): void => {
  const responses = getResponses();
  const index = responses.findIndex(r => r.id === updatedResponse.id);
  
  if (index !== -1) {
    responses[index] = updatedResponse;
    saveResponses(responses);
  }
};

// Reviews
export const saveReviews = (reviews: Review[]): void => {
  localStorage.setItem(STORAGE_KEYS.REVIEWS, JSON.stringify(reviews));
};

export const getReviews = (): Review[] => {
  const data = localStorage.getItem(STORAGE_KEYS.REVIEWS);
  return data ? JSON.parse(data) : [];
};

export const addReview = (review: Review): void => {
  const reviews = getReviews();
  reviews.push(review);
  saveReviews(reviews);
};

export const updateReview = (updatedReview: Review): void => {
  const reviews = getReviews();
  const index = reviews.findIndex(r => r.id === updatedReview.id);
  
  if (index !== -1) {
    reviews[index] = updatedReview;
    saveReviews(reviews);
  }
};

// Final approvals
export const saveFinals = (finals: Final[]): void => {
  localStorage.setItem(STORAGE_KEYS.FINALS, JSON.stringify(finals));
};

export const getFinals = (): Final[] => {
  const data = localStorage.getItem(STORAGE_KEYS.FINALS);
  return data ? JSON.parse(data) : [];
};

export const addFinal = (final: Final): void => {
  const finals = getFinals();
  finals.push(final);
  saveFinals(finals);
};

export const updateFinal = (updatedFinal: Final): void => {
  const finals = getFinals();
  const index = finals.findIndex(f => f.id === updatedFinal.id);
  
  if (index !== -1) {
    finals[index] = updatedFinal;
    saveFinals(finals);
  }
};

// Current User
export const saveCurrentUser = (user: User | null): void => {
  if (user) {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
  } else {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
  }
};

export const getCurrentUser = (): User | null => {
  const data = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
  return data ? JSON.parse(data) : null;
};
