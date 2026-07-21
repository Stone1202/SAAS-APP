import {
  customerRepository,
  tagRepository,
  communicationRepository,
  scriptRepository,
  todoRepository,
  segmentRepository,
  getTenantDashboardStats,
  aiScriptSuggestionRepository,
} from '../adapters/factory';

// ============================================
// Customer Service
// ============================================
export const customerService = {
  getAll: customerRepository.getAll,
  getById: customerRepository.getById,
  create: customerRepository.create,
  update: customerRepository.update,
  delete: customerRepository.delete,
};

// ============================================
// Tag Service
// ============================================
export const tagService = {
  getAllGroups: tagRepository.getAllGroups,
  getAllTags: tagRepository.getAllTags,
  createGroup: tagRepository.createGroup,
  createTag: tagRepository.createTag,
  deleteTag: tagRepository.deleteTag,
};

// ============================================
// Communication Service
// ============================================
export const communicationService = {
  getAll: communicationRepository.getAll,
  getByCustomerId: communicationRepository.getByCustomerId,
  getById: communicationRepository.getById,
  create: communicationRepository.create,
};

// ============================================
// Script Service
// ============================================
export const scriptService = {
  getAll: scriptRepository.getAll,
  create: scriptRepository.create,
  update: scriptRepository.update,
  incrementUsage: scriptRepository.incrementUsage,
};

// ============================================
// Todo Service
// ============================================
export const todoService = {
  getAll: todoRepository.getAll,
  complete: todoRepository.complete,
  create: todoRepository.create,
};

// ============================================
// Segment Service
// ============================================
export const segmentService = {
  getAll: segmentRepository.getAll,
  create: segmentRepository.create,
};

// ============================================
// AI Script Suggestion Service
// ============================================
export const aiSuggestionService = {
  getAll: aiScriptSuggestionRepository.getAll,
  adopt: aiScriptSuggestionRepository.adopt,
};

// ============================================
// Dashboard Service
// ============================================
export const dashboardService = {
  getTenantStats: getTenantDashboardStats,
};
