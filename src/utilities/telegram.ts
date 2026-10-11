/**
 * Telegram Bot API utility for sending messages to a group topic
 */

interface TelegramConfig {
  botToken: string
  chatId: string
}

export interface InlineKeyboardButton {
  text: string
  callback_data: string
}

export interface InlineKeyboardMarkup {
  inline_keyboard: InlineKeyboardButton[][]
}

export interface SendMessageOptions {
  text: string
  replyMarkup?: InlineKeyboardMarkup
  topicId?: string
  parseMode?: 'HTML' | 'Markdown' | 'MarkdownV2'
  disableNotification?: boolean
  disableLinkPreview?: boolean
  protectContent?: boolean
  replyToMessageId?: number
}

interface TelegramResponse {
  ok: boolean
  result?: {
    message_id: number
    chat: {
      id: number
      title: string
    }
  }
  description?: string
  error_code?: number
}

const getConfig = (): TelegramConfig | null => {
  const botToken = process.env.TELEGRAM_BOT_TOKEN
  const chatId = process.env.TELEGRAM_CHAT_ID

  if (!botToken || !chatId) {
    return null
  }

  return { botToken, chatId }
}

export interface SendMessageResult {
  success: boolean
  messageId?: number
  error?: string
}

const buildRequestBody = (
  chatId: string,
  options: SendMessageOptions,
): Record<string, string | number | boolean> => {
  const {
    text,
    topicId,
    parseMode = 'HTML',
    disableNotification,
    disableLinkPreview,
    protectContent,
    replyToMessageId,
    replyMarkup,
  } = options

  const body: Record<string, string | number | boolean> = {
    chat_id: chatId,
    text,
    parse_mode: parseMode,
  }

  // Add topic/thread ID if provided (for forum/topic groups)
  if (topicId) {
    body.message_thread_id = parseInt(topicId, 10)
  }

  // Send message silently (no notification sound)
  if (disableNotification) {
    body.disable_notification = true
  }

  // Disable link preview in message
  if (disableLinkPreview) {
    body.disable_web_page_preview = true
  }

  // Protect message from forwarding and saving
  if (protectContent) {
    body.protect_content = true
  }

  // Reply to a specific message
  if (replyToMessageId) {
    body.reply_to_message_id = replyToMessageId
  }

  // Inline buttons must be sent as a JSON string
  if (replyMarkup) {
    body.reply_markup = JSON.stringify(replyMarkup)
  }

  return body
}

/**
 * Send a message to Telegram and return the message ID
 * Useful when you need to reply to the sent message later
 */
export const sendTelegramMessageWithResult = async (
  options: SendMessageOptions,
): Promise<SendMessageResult> => {
  const config = getConfig()

  if (!config) {
    return {
      success: false,
      error: 'Telegram not configured: missing TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID',
    }
  }

  const { botToken, chatId } = config
  const url = `https://api.telegram.org/bot${botToken}/sendMessage`
  const body = buildRequestBody(chatId, options)

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })

    const data = (await response.json()) as TelegramResponse

    if (!data.ok) {
      return { success: false, error: data.description }
    }

    return { success: true, messageId: data.result?.message_id }
  } catch (error) {
    return { success: false, error: String(error) }
  }
}

/**
 * Send a message to Telegram (simple boolean return)
 */
export const sendTelegramMessage = async (options: SendMessageOptions): Promise<boolean> => {
  const result = await sendTelegramMessageWithResult(options)

  if (!result.success) {
    console.error('Telegram API error:', result.error)
  }

  return result.success
}

export const isTelegramConfigured = (): boolean => {
  return getConfig() !== null
}

const callTelegram = async (
  method: string,
  body: Record<string, string | number | boolean>,
): Promise<{ success: boolean; error?: string }> => {
  const config = getConfig()

  if (!config) {
    return { success: false, error: 'Telegram not configured' }
  }

  try {
    const response = await fetch(`https://api.telegram.org/bot${config.botToken}/${method}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })

    const data = (await response.json()) as TelegramResponse

    if (!data.ok) {
      return { success: false, error: data.description }
    }

    return { success: true }
  } catch (error) {
    return { success: false, error: String(error) }
  }
}

/**
 * Replace the text (and buttons) of a message the bot already sent.
 * Pass replyMarkup: null to strip the buttons entirely.
 */
export const editTelegramMessage = async (options: {
  messageId: number | string
  text: string
  replyMarkup?: InlineKeyboardMarkup | null
  parseMode?: 'HTML' | 'Markdown' | 'MarkdownV2'
}): Promise<{ success: boolean; error?: string }> => {
  const config = getConfig()

  if (!config) {
    return { success: false, error: 'Telegram not configured' }
  }

  const body: Record<string, string | number | boolean> = {
    chat_id: config.chatId,
    message_id: Number(options.messageId),
    text: options.text,
    parse_mode: options.parseMode ?? 'HTML',
  }

  if (options.replyMarkup) {
    body.reply_markup = JSON.stringify(options.replyMarkup)
  }

  return callTelegram('editMessageText', body)
}

/**
 * Acknowledge a button press. Telegram shows a spinner on the button until
 * this is called, so it should happen on every callback, including denials.
 */
export const answerCallbackQuery = async (options: {
  callbackQueryId: string
  text?: string
  showAlert?: boolean
}): Promise<{ success: boolean; error?: string }> => {
  const body: Record<string, string | number | boolean> = {
    callback_query_id: options.callbackQueryId,
  }

  if (options.text) {
    body.text = options.text
  }

  if (options.showAlert) {
    body.show_alert = true
  }

  return callTelegram('answerCallbackQuery', body)
}
