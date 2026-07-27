/**
 * File source thuộc hệ thống FE ResearchPulse.
 *
 * File: shared/services/chatbotApi.js
 */

import apiClient from '../api/axios';

const CHATBOT_API_URL = import.meta.env.VITE_RAG_CHAT_URL || '/api/v1/chat';

const chatbotApi = {
  url: CHATBOT_API_URL,
  /**
   * Gửi câu hỏi tới API Chatbot RAG.
   *
   * @param {{ projectId?: number|string, project_id?: number|string, message: string }} payload
   * @returns {Promise<{ success: boolean, answer: string, table: { columns: Array, data: Array } | null }>}
   */
  sendMessage: async ({ projectId, project_id, message }) => {
    const resolvedProjectId = project_id ?? projectId;

    return await apiClient.post(CHATBOT_API_URL, {
      project_id: Number(resolvedProjectId),
      message,
    });
  },

  /**
   * Fetch chat history for a given project
   *
   * @param {number|string} projectId
   * @param {object} params
   * @returns {Promise<{ success: boolean, data: Array }>}
   */
  getChatHistory: async (projectId, params = { limit: 50, offset: 0, order: 'asc' }) => {
    return await apiClient.get(`/api/v1/projects/${projectId}/chat/messages`, {
      params,
    });
  },
};

export default chatbotApi;
