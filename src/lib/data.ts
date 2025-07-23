
export type Role = 'sales' | 'technical' | 'assignee' | 'reviewer' | 'final';

export type User = {
  id: string;
  name: string;
  email: string;
  username: string;
  password: string;
  role: Role;
};

export type Project = {
  id: string;
  customerId: string;
  title: string;
  details: string;
  startDate: string;
  endDate: string;
  inlineInspection: boolean;
  qapCriteria: boolean;
  qapAttachment?: string;
  plant: 'PEIPL' | 'PEPPL' | 'PEGEPL 1' | 'PEGEPL 2';
  product: 'DUAL GLASS M10 PERC' | 'DUAL GLASS M10 TOPCON' | 'DUAL GLASS G12R TOPCON' | 'DUAL GLASS G12 TOPCON' | 'M10 TRANSPARENT PERC';
  technicalSpecs?: string;
  tenderDocument?: string;
  otherAttachments?: string[];
  createdBy: string;
  createdAt: string;
  status: 'active' | 'closed';
};

export type Customer = {
  id: string;
  name: string;
  createdBy: string;
  createdAt: string;
};

export type Task = {
  id: string;
  projectId: string;
  title: string;
  description: string;
  dueDate: string;
  attachments?: string[];
  assignees: string[];
  createdBy: string;
  createdAt: string;
  status: 'pending' | 'in-progress' | 'review' | 'final-review' | 'closed' | 'rejected';
};

export type Response = {
  id: string;
  taskId: string;
  projectId: string;
  comments: string;
  attachments?: string[];
  respondedBy: string;
  respondedAt: string;
  status: 'review' | 'final-review' | 'rejected' | 'closed';
};

export type Review = {
  id: string;
  responseId: string;
  taskId: string;
  projectId: string;
  comments: string;
  attachments?: string[];
  reviewedBy: string;
  reviewedAt: string;
  status: 'final-review' | 'rejected' | 'closed';
};

export type Final = {
  id: string;
  reviewId: string;
  responseId: string;
  taskId: string;
  projectId: string;
  comments: string;
  attachments?: string[];
  approvedBy: string;
  approvedAt: string;
  status: 'closed' | 'rejected';
};

// Users data
export const users: User[] = [
  {
    id: '1',
    name: 'Saumya Ranjan',
    email: 'saumya.ranjan@premierenergies.com',
    username: 'sales',
    password: 'sales',
    role: 'sales'
  },
  {
    id: '2',
    name: 'Praful Bharadwaj',
    email: 'praful.bharadwaj@premierenergies.com',
    username: 'praful',
    password: 'praful',
    role: 'technical'
  },
  {
    id: '3',
    name: 'Mallikarjun Jula',
    email: 'jmr@premierenergies.com',
    username: 'jmr',
    password: 'jmr',
    role: 'assignee'
  },
  {
    id: '4',
    name: 'Sriram Gudimella',
    email: 'sriram.gudimella@premierenergies.com',
    username: 'sriram',
    password: 'sriram',
    role: 'assignee'
  },
  {
    id: '5',
    name: 'Ramu B',
    email: 'bramu@premierenergies.com',
    username: 'ramu',
    password: 'ramu',
    role: 'assignee'
  },
  {
    id: '6',
    name: 'Manoj Kumar',
    email: 'manoj.kumar@premierenergies.com',
    username: 'manoj',
    password: 'manoj',
    role: 'assignee'
  },
  {
    id: '7',
    name: 'Shaik Abbas',
    email: 'shaik.abbas@premierenergies.com',
    username: 'shaik',
    password: 'shaik',
    role: 'assignee'
  },
  {
    id: '8',
    name: 'Rahul Mishra',
    email: 'rahul.mishra@premierenergies.com',
    username: 'rahul',
    password: 'rahul',
    role: 'assignee'
  },
  {
    id: '9',
    name: 'Baskara Pandian T',
    email: 'baskara.pandian@premierenergies.com',
    username: 'baskara',
    password: 'baskara',
    role: 'reviewer'
  },
  {
    id: '10',
    name: 'J Sreenivasa',
    email: 'j.sreenivasa@premierenergies.com',
    username: 'sreenivasa',
    password: 'sreenivasa',
    role: 'reviewer'
  },
  {
    id: '11',
    name: 'D N RAOL',
    email: 'nrao@premierenergies.com',
    username: 'nrao',
    password: 'nrao',
    role: 'reviewer'
  },
  {
    id: '12',
    name: 'Chandra Mauli Kumar',
    email: 'chandra.kumar@premierenergies.com',
    username: 'cmk',
    password: 'cmk',
    role: 'final'
  }
];

// Filter users by role
export const getPEPPLAssignees = () => {
  return users.filter(user => 
    user.role === 'assignee' && 
    ['jmr', 'sriram', 'ramu'].includes(user.username)
  );
};

export const getOtherAssignees = () => {
  return users.filter(user => 
    user.role === 'assignee' && 
    ['manoj', 'shaik', 'rahul'].includes(user.username)
  );
};

export const getReviewers = () => {
  return users.filter(user => user.role === 'reviewer');
};

export const getFinalReviewer = () => {
  return users.find(user => user.role === 'final');
};
