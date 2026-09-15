/**
 * File source thuộc hệ thống FE ResearchPulse.
 *
 * File: shared/services/chatbotApi.js
 */

import axios from 'axios';
import apiClient from '../api/axios';

const CHATBOT_API_URL = import.meta.env.VITE_RAG_CHAT_URL || '/api/v1/chat';

// Kiểm tra xem URL có trỏ trực tiếp tới FastAPI Rag_System_AI (ví dụ cổng 8001) hay không
const isDirectRagServiceUrl = (url) => {
  return typeof url === 'string' && (url.includes(':8001') || url.includes('/rag/'));
};

const chatbotApi = {
  url: CHATBOT_API_URL,

  /**
   * Gửi câu hỏi tới API Chatbot RAG (hỗ trợ cả kết nối qua Trending BE hoặc trực tiếp tới Rag_System_AI).
   *
   * @param {{ projectId?: number|string, project_id?: number|string, message?: string, query?: string, top_k?: number, model?: string }} payload
   * @returns {Promise<{ success: boolean, answer: string, table: { columns: Array, data: Array } | null, citations?: Array, contexts?: Array, model?: string }>}
   */
  sendMessage: async ({ projectId, project_id, message, query, ...options }) => {
    const resolvedProjectId = project_id ?? projectId;
    const resolvedQuery = (message ?? query ?? '').trim();

    // Chuẩn hóa payload: gửi đồng thời cả `message` và `query` để tương thích hoàn hảo cả 2 dịch vụ
    const requestPayload = {
      project_id: resolvedProjectId ? Number(resolvedProjectId) : undefined,
      projectId: resolvedProjectId ? Number(resolvedProjectId) : undefined,
      message: resolvedQuery,
      query: resolvedQuery,
      top_k: options.top_k || options.topK || 5,
      ...options,
    };

    let result;

    if (isDirectRagServiceUrl(CHATBOT_API_URL)) {
      // Gọi trực tiếp FastAPI Rag_System_AI (dùng axios riêng không đính kèm withCredentials để tránh lỗi CORS wildcard)
      const res = await axios.post(CHATBOT_API_URL, requestPayload, {
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        timeout: 120000,
      });
      result = res.data;
    } else {
      // Gọi qua Trending BE (/api/v1/chat) với xác thực cookie và lưu trữ lịch sử tự động
      result = await apiClient.post(CHATBOT_API_URL, requestPayload);
    }

    return {
      success: result?.success ?? true,
      answer: result?.answer || '',
      table: result?.table || null,
      citations: result?.citations || [],
      contexts: result?.contexts || [],
      model: result?.model || null,
      messages: result?.messages || null,
    };
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

  /**
   * Xóa toàn bộ lịch sử cuộc trò chuyện của project hiện tại
   *
   * @param {number|string} projectId
   * @returns {Promise<{ success: boolean, deleted_count: number }>}
   */
  clearChatHistory: async (projectId) => {
    return await apiClient.delete(`/api/v1/projects/${projectId}/chat/messages`);
  },

  /**
   * Tạo mới phiên trò chuyện (reset working memory bên RAG AI)
   *
   * @param {number|string} projectId
   * @returns {Promise<{ success: boolean, message: string }>}
   */
  resetConversation: async (projectId) => {
    return await apiClient.post(`/api/v1/projects/${projectId}/chat/reset`);
  },
};

export default chatbotApi;

