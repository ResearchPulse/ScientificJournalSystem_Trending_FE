/**
 * File source thuộc hệ thống FE ResearchPulse (Trending Dashboard).
 *
 * File: shared/components/chatbot/ChatbotWidget.jsx
 */
import React, { useRef, useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useTranslation } from 'react-i18next';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useLocation } from 'react-router-dom';
import { FaPaperPlane, FaExpand } from 'react-icons/fa';
import { IoMdClose } from 'react-icons/io';
import chatbotApi from '../../services/chatbotApi';
import './ChatbotWidget.css';

function GeminiMark({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" style={{ flexShrink: 0 }}>
      <path d="M12 0C12 6.62742 17.3726 12 24 12C17.3726 12 12 17.3726 12 24C12 17.3726 6.62742 12 0 12C6.62742 12 12 6.62742 12 0Z" fill="currentColor"/>
    </svg>
  );
}

const numberLikeColumns = new Set([
  'publication_year',
  'citation_count',
  'value_float',
  'year',
]);

const MAX_CHAT_MESSAGE_LENGTH = 8000;
const CHAT_HISTORY_LIMIT = 10;

const initialAssistantMessage = {
  id: 'chatbot-welcome-message',
  role: 'assistant',
  answer: '',
  table: null,
};

function getProjectIdFromUrl() {
  const match = window.location.pathname.match(/\/projects?\/(\d+)/);
  return match?.[1] ? Number(match[1]) : null;
}

function normalizeChatRole(role) {
  return String(role || '').toLowerCase() === 'user' ? 'user' : 'assistant';
}

function mapHistoryMessage(item) {
  return {
    id: `history-${item.message_id}`,
    role: normalizeChatRole(item.role),
    answer: item.content || '',
    table: null,
    createdAt: item.created_at,
  };
}

function MarkdownRenderer({ content, onExpandTable }) {
  if (!content) return null;
  return (
    <div className="rp-markdown">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          table: ({ children, ...props }) => (
            <div className="rp-chatbot__table-card">
              <div className="rp-chatbot__table-head">
                <div className="rp-chatbot__table-head-main">
                  <span>Bảng số liệu</span>
                  <button
                    type="button"
                    className="rp-chatbot__table-expand-btn"
                    onClick={() => onExpandTable(children)}
                    title="Xem bảng đầy đủ"
                  >
                    <FaExpand size={11} />
                  </button>
                </div>
              </div>
              <div className="rp-chatbot__table-wrap">
                <table {...props}>{children}</table>
              </div>
            </div>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}

export default function ChatbotWidget() {
  const { t } = useTranslation();
  const location = useLocation();
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [projectId, setProjectId] = useState(() => getProjectIdFromUrl());
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState([initialAssistantMessage]);
  const [loadedProjectId, setLoadedProjectId] = useState(null);
  const [activeModalTable, setActiveModalTable] = useState(null);
  const [activeModalMarkdownTable, setActiveModalMarkdownTable] = useState(null);
  const scrollAnchorRef = useRef(null);

  const suggestedPrompts = [
    t('chatbot.suggestedPrompt1', 'Tìm giúp tôi top các bài báo trong dự án này'),
    t('chatbot.suggestedPrompt2', 'Danh sách tạp chí Q1 năm 2024'),
    t('chatbot.suggestedPrompt3', 'Bài báo nào có lượt trích dẫn cao nhất?'),
  ];

  const scrollToBottom = () => {
    requestAnimationFrame(() => {
      scrollAnchorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
    });
  };

  useEffect(() => {
    setProjectId(getProjectIdFromUrl());
  }, [location]);

  const {
    data: historyResponse,
    isLoading: isHistoryLoading,
    error: historyQueryError,
  } = useQuery({
    queryKey: ['chat-history', projectId, CHAT_HISTORY_LIMIT],
    queryFn: () =>
      chatbotApi.getChatHistory(projectId, {
        limit: CHAT_HISTORY_LIMIT,
        offset: 0,
        order: 'desc',
      }),
    enabled: isOpen && Boolean(projectId),
    staleTime: 2 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 1,
  });

  let historyError = '';
  if (!projectId && isOpen) {
    historyError = t('chatbot.selectProjectHistory', 'Please select a project before viewing chat history.');
  } else if (historyQueryError) {
    const errMsg = historyQueryError.message || '';
    if (errMsg.includes('đăng nhập') || errMsg.includes('login') || errMsg.includes('401') || errMsg.includes('Unauthorized') || errMsg.includes('unauthorized')) {
      historyError = t('chatbot.pleaseLogin', 'Please login to continue.');
    } else {
      historyError = errMsg;
    }
  }

  useEffect(() => {
    if (!isOpen) {
      setLoadedProjectId(null);
      setActiveModalTable(null);
      setActiveModalMarkdownTable(null);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    if (!projectId) {
      setMessages([initialAssistantMessage]);
      setLoadedProjectId(null);
      return;
    }

    if (historyResponse?.data && loadedProjectId !== projectId) {
      const historyMessages = [...historyResponse.data].reverse().map(mapHistoryMessage);
      setMessages(historyMessages.length > 0 ? historyMessages : [initialAssistantMessage]);
      setLoadedProjectId(projectId);
      scrollToBottom();
    }
  }, [historyResponse, isOpen, projectId, loadedProjectId]);

  const sendMessage = async (text = message) => {
    const cleanText = text.trim();
    if (!cleanText || isLoading) return;

    if (cleanText.length > MAX_CHAT_MESSAGE_LENGTH) {
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: 'assistant',
          answer: t('chatbot.messageTooLong', 'Your message is {{length}} characters. Please shorten to a maximum of {{maxLength}} characters.', {
            length: cleanText.length.toLocaleString(),
            maxLength: MAX_CHAT_MESSAGE_LENGTH.toLocaleString()
          }),
          table: null,
          isError: true,
        },
      ]);
      scrollToBottom();
      return;
    }

    const userMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      answer: cleanText,
      table: null,
    };

    setMessages((prev) => [...prev, userMessage]);
    setMessage('');
    setIsLoading(true);
    scrollToBottom();

    if (!projectId) {
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            id: crypto.randomUUID(),
            role: 'assistant',
            answer: t('chatbot.selectProjectAsk', 'Please select a project before asking AI.'),
            table: null,
          },
        ]);
        setIsLoading(false);
        scrollToBottom();
      }, 500);
      return;
    }

    try {
      const data = await chatbotApi.sendMessage({
        project_id: Number(projectId),
        message: cleanText,
      });

      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: 'assistant',
          answer: data?.answer || t('chatbot.emptyAnswer', 'I received a response, but it contains no answer text.'),
          table: data?.table || null,
        },
      ]);

      queryClient.invalidateQueries({
        queryKey: ['chat-history', projectId, CHAT_HISTORY_LIMIT],
      });
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: 'assistant',
          answer: error.message?.includes('đăng nhập') || error.message?.includes('login')
            ? `🔐 ${t('chatbot.pleaseLogin', 'Please login to continue.')}`
            : t('chatbot.connectionError', 'Sorry, I could not connect to the chatbot API.\n\n**Error Details**: {{error}}\n**Calling**: {{url}}', {
                error: error.message,
                url: chatbotApi.url
              }),
          table: null,
          isError: true,
        },
      ]);
      console.error('ChatbotWidget error:', error);
    } finally {
      setIsLoading(false);
      scrollToBottom();
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  };

  return (
    <section className={`rp-chatbot ${isOpen ? 'is-open' : ''}`} aria-live="polite">
      {isOpen && (
        <div className="rp-chatbot__panel" role="dialog" aria-label={t('chatbot.title', 'AI Research Assistant')}>
          <header className="rp-chatbot__header">
            <div className="rp-chatbot__identity">
              <div className="rp-chatbot__avatar">
                <GeminiMark size={20} />
              </div>
              <div>
                <p className="rp-chatbot__eyebrow">ResearchPulse RAG</p>
                <h2>{t('chatbot.title', 'AI Research Assistant')}</h2>
              </div>
            </div>
            <button
              id="chatbot-close-button"
              className="rp-chatbot__icon-btn"
              type="button"
              onClick={() => setIsOpen(false)}
              aria-label={t('chatbot.close', 'Close chatbot')}
            >
              <IoMdClose size={20} />
            </button>
          </header>

          <div className="rp-chatbot__messages">
            {isHistoryLoading ? (
              <div className="rp-chatbot__history-loading" aria-label={t('chatbot.loadingHistory', 'Loading chat history...')}>
                <span className="rp-chatbot__history-spinner" />
                <p>{t('chatbot.loadingHistory', 'Loading chat history...')}</p>
              </div>
            ) : (
              <>
                {historyError && (
                  <article className="rp-chatbot__message rp-chatbot__message--assistant is-error">
                    <div className="rp-chatbot__bubble">🔐 {historyError}</div>
                  </article>
                )}

                {messages.map((item) => {
                  const answerText = item.id === 'chatbot-welcome-message'
                    ? t('chatbot.welcome', 'Xin chào! Tôi là AI Research Assistant. Hãy hỏi tôi về bài báo, tạp chí, xếp hạng Q1-Q4 hoặc dữ liệu trong dự án của bạn.')
                    : item.answer;

                  return (
                    <article
                      key={item.id}
                      className={`rp-chatbot__message rp-chatbot__message--${item.role} ${
                        item.isError ? 'is-error' : ''
                      }`}
                    >
                      <div className="rp-chatbot__bubble">
                        <MarkdownRenderer
                          content={answerText}
                          onExpandTable={setActiveModalMarkdownTable}
                        />
                      </div>

                      {item.table && (
                        <div className="rp-chatbot__table-card">
                          <div className="rp-chatbot__table-head">
                            <div className="rp-chatbot__table-head-main">
                              <span>{t('chatbot.dataTable', 'Data Table')}</span>
                              <button
                                type="button"
                                className="rp-chatbot__table-expand-btn"
                                onClick={() => setActiveModalTable(item.table)}
                                title={t('chatbot.viewFullTable', 'View full table')}
                              >
                                <FaExpand size={11} />
                              </button>
                            </div>
                            <small>
                              {t('chatbot.rows', '{{count}} rows', { count: item.table.data?.length || 0 })}
                            </small>
                          </div>
                          <div className="rp-chatbot__table-wrap">
                            <table>
                              <thead>
                                <tr>
                                  {item.table.columns?.map((column) => (
                                    <th key={column.key}>{column.label}</th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody>
                                {item.table.data?.map((row, rowIndex) => (
                                  <tr key={row.article_id || row.journal_id || `row-${rowIndex}`}>
                                    {item.table.columns?.map((column) => (
                                      <td
                                        key={`${rowIndex}-${column.key}`}
                                        className={numberLikeColumns.has(column.key) ? 'is-number' : ''}
                                      >
                                        {row[column.key] ?? '—'}
                                      </td>
                                    ))}
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}
                    </article>
                  );
                })}

                {isLoading && (
                  <div className="rp-chatbot__typing" aria-label={t('chatbot.typing', 'AI is typing...')}>
                    <span />
                    <span />
                    <span />
                  </div>
                )}
              </>
            )}
            <div ref={scrollAnchorRef} />
          </div>

          {messages.length <= 1 && (
            <div className="rp-chatbot__suggestions" aria-label={t('chatbot.suggestions', 'Suggested questions')}>
              {suggestedPrompts.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => sendMessage(prompt)}
                  disabled={isLoading}
                >
                  {prompt}
                </button>
              ))}
            </div>
          )}

          <form
            className="rp-chatbot__composer"
            onSubmit={(event) => {
              event.preventDefault();
              sendMessage();
            }}
          >
            <div className="rp-chatbot__input-wrap">
              <textarea
                id="chatbot-message-input"
                value={message}
                maxLength={MAX_CHAT_MESSAGE_LENGTH}
                onChange={(event) => setMessage(event.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={t('chatbot.placeholder', 'Ask a question about articles, journals, Q1-Q4 rankings...')}
                rows="2"
              />
              <span className={`rp-chatbot__char-count ${message.length >= MAX_CHAT_MESSAGE_LENGTH ? 'is-limit' : ''}`}>
                {message.length.toLocaleString()}/{MAX_CHAT_MESSAGE_LENGTH.toLocaleString()}
              </span>
            </div>
            <button id="chatbot-send-button" type="submit" disabled={isLoading || !message.trim()}>
              <FaPaperPlane />
            </button>
          </form>
        </div>
      )}

      <button
        id="chatbot-toggle-button"
        className="rp-chatbot__launcher"
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        aria-label={isOpen ? t('chatbot.minimize', 'Minimize chatbot') : t('chatbot.launcher', 'Open AI chatbot')}
      >
        <span className="rp-chatbot__pulse" />
        <span className="rp-chatbot__launcher-icon">
          <GeminiMark size={18} />
        </span>
        <span className="rp-chatbot__launcher-text">AI Chat</span>
      </button>

      {(activeModalTable || activeModalMarkdownTable) && (
        <div
          className="rp-chatbot__modal-overlay"
          onClick={() => {
            setActiveModalTable(null);
            setActiveModalMarkdownTable(null);
          }}
        >
          <div className="rp-chatbot__modal-card" onClick={(e) => e.stopPropagation()}>
            <header className="rp-chatbot__modal-header">
              <div className="rp-chatbot__modal-title-group">
                <h3>{t('chatbot.dataTable', 'Data Table')}</h3>
                {activeModalTable && (
                  <span className="rp-chatbot__modal-badge">
                    {t('chatbot.rows', '{{count}} rows', { count: activeModalTable.data?.length || 0 })}
                  </span>
                )}
              </div>
              <button
                type="button"
                className="rp-chatbot__modal-close"
                onClick={() => {
                  setActiveModalTable(null);
                  setActiveModalMarkdownTable(null);
                }}
                aria-label={t('chatbot.close', 'Close')}
              >
                <IoMdClose size={20} />
              </button>
            </header>
            <div className="rp-chatbot__modal-body">
              <div className="rp-chatbot__modal-table-wrap">
                {activeModalTable ? (
                  <table>
                    <thead>
                      <tr>
                        {activeModalTable.columns?.map((column) => (
                          <th key={column.key}>{column.label}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {activeModalTable.data?.map((row, rowIndex) => (
                        <tr key={row.article_id || row.journal_id || `row-${rowIndex}`}>
                          {activeModalTable.columns?.map((column) => (
                            <td
                              key={`${rowIndex}-${column.key}`}
                              className={numberLikeColumns.has(column.key) ? 'is-number' : ''}
                            >
                              {row[column.key] ?? '—'}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <table>
                    {activeModalMarkdownTable}
                  </table>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
