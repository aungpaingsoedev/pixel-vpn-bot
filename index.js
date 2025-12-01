require("dotenv").config();
const TelegramBot = require("node-telegram-bot-api");

const token = "8597902704:AAESMCYUvwa6WvatlcmeJFTsUupMVuGEHM0";

const bot = new TelegramBot(token, {
  polling: {
    interval: 300,
    autoStart: true,
    params: { timeout: 10 },
  },
});

// -------- USER STATE TO TRACK KEY INPUT --------
const userState = {}; // waiting_for_key

// Helper to get username
function getUserName(user) {
  return (
    user.username ||
    `${user.first_name || ""} ${user.last_name || ""}`.trim() ||
    "Unknown User"
  );
}

// Main menu message
function getWelcomeMessage(user) {
  const userName = getUserName(user);

  return {
    text:
      `👋 *${userName}* မင်္ဂလာပါ!\n\n` +
      `*Pixel VPN Service* မှကြိုဆိုပါတယ်။\n\n` +
      `အောက်က Menu မှရွေးချယ်ပါ👇\n\n` +
      `အကူအညီလိုပါက - [@AungPaingSoeDev](https://t.me/AungPaingSoeDev)`,
    options: {
      parse_mode: "Markdown",
      disable_web_page_preview: true,
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: "💰 Premium Key စျေးနှုန်းများ",
              callback_data: "show_prices",
            },
          ],
          [{ text: "📊 Key ရဲ့ GB ပမာဏစစ်ရန်", callback_data: "key_status" }],
          [{ text: "🎁 Promotion များ", callback_data: "promotion" }],
        ],
      },
    },
  };
}

// Handle /start
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;

  const { text, options } = getWelcomeMessage(msg.from);
  bot.sendMessage(chatId, text, options).catch(console.error);
});

// ------------- CALLBACK HANDLER -------------
bot.on("callback_query", async (callbackQuery) => {
  const chatId = callbackQuery.message.chat.id;
  const messageId = callbackQuery.message.message_id;
  const data = callbackQuery.data;

  try {
    // --------- PRICE LIST ----------
    if (data === "show_prices") {
      const priceMsg =
        `*Premium Key Prices*\n\n` +
        `- 50GB (30 Days) — 3,000 MMK\n` +
        `- 100GB (30 Days) — 5,000 MMK\n` +
        `- 200GB (30 Days) — 7,000 MMK\n\n` +
        `📍 Region: 🇸🇬 Singapore\n\n` +
        `ဝယ်ယူရန် — @AungPaingSoeDev`;

      await bot.editMessageText(priceMsg, {
        chat_id: chatId,
        message_id: messageId,
        parse_mode: "Markdown",
        disable_web_page_preview: true,
        reply_markup: {
          inline_keyboard: [
            [{ text: "🔙 နောက်သို့", callback_data: "back_to_menu" }],
          ],
        },
      });
    }

    // --------- KEY STATUS REQUEST ----------
    if (data === "key_status") {
      const statusMsg =
        `📊 *Outline Key GB စစ်ရန်*\n\n` +
        `ချိတ်ထားတဲ့ Outline Key ရဲ့ GB အသုံးပြုမှုကိုစစ်နိုင်ပါတယ်။\n\n` +
        `*Message Box* ထဲမှာ (eg: ss://xxxxx) ကိုထည့်ပေးပါ။`;

      // Set state
      userState[chatId] = "waiting_for_key";

      await bot.editMessageText(statusMsg, {
        chat_id: chatId,
        message_id: messageId,
        parse_mode: "Markdown",
        disable_web_page_preview: true,
        reply_markup: {
          inline_keyboard: [
            [{ text: "🔙 နောက်သို့", callback_data: "back_to_menu" }],
          ],
        },
      });
    }

    // --------- PROMOTION MENU ----------
    if (data === "promotion") {
      const promoMsg =
        `🎁 *Pixel VPN Promotion*\n\n` +
        `🔥 100GB Key ဝယ်ပါ → 10GB Free\n` +
        `🔥 200GB Key ဝယ်ပါ → 20GB Free\n\n` +
        `📌 Promotion သက်တမ်း: Dec 2025`;

      await bot.editMessageText(promoMsg, {
        chat_id: chatId,
        message_id: messageId,
        parse_mode: "Markdown",
        reply_markup: {
          inline_keyboard: [
            [{ text: "🔙 နောက်သို့", callback_data: "back_to_menu" }],
          ],
        },
      });
    }

    // --------- BACK TO MENU ----------
    if (data === "back_to_menu") {
      const { text, options } = getWelcomeMessage(callbackQuery.from);

      await bot.editMessageText(text, {
        chat_id: chatId,
        message_id: messageId,
        ...options,
      });
    }

    await bot.answerCallbackQuery(callbackQuery.id);
  } catch (err) {
    console.error(err);
    await bot.answerCallbackQuery(callbackQuery.id, "❌ Error! Try again.");
  }
});

// ------------- USER MESSAGE LISTENER -------------
bot.on("message", async (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text?.trim();

  // Only catch key input
  if (userState[chatId] !== "waiting_for_key") return;

  // Validate key format
  if (!text.startsWith("ss://") && !text.startsWith("ssr://")) {
    return bot.sendMessage(
      chatId,
      "❌ Key format မမှန်ပါ!\n`ss://xxxx` ပြန်ထည့်ပါ။",
      {
        parse_mode: "Markdown",
      }
    );
  }

  // Reset state
  userState[chatId] = null;

  // Fake Usage Data (replace later with real API)
  const used = "1.5 GB";
  const total = "10 GB";

  const resultMsg =
    `✅ *Outline Key Info*\n\n` +
    `🔑 *Key:* \`${text.slice(0, 35)}...\`\n` +
    `📊 *Used:* ${used}\n` +
    `💾 *Total:* ${total}`;

  return bot.sendMessage(chatId, resultMsg, {
    parse_mode: "Markdown",
    reply_markup: {
      inline_keyboard: [
        [{ text: "🔙 နောက်သို့", callback_data: "key_status" }],
      ],
    },
  });
});
