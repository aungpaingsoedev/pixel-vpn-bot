require("dotenv").config();
const TelegramBot = require("node-telegram-bot-api");

const token = process.env.TELEGRAM_BOT_TOKEN || "YOUR_TELEGRAM_BOT_TOKEN";

const bot = new TelegramBot(token, {
  polling: {
    interval: 300,
    autoStart: true,
    params: {
      timeout: 10,
    },
  },
});

const commands = [
  { command: "start", description: "စတင်" },
  {
    command: "status",
    description: "သင့် Private Outline Key အခြေအနေစစ်ဆေးရန်",
  },
  { command: "prices", description: "စျေးနှုန်းများကြည့်ရန်" },
];

bot.setMyCommands(commands).catch(console.error);

// Get User Name
const getUserName = (from) => {
  if (!from) return "အသုံးပြုသူ";
  const firstName = from.first_name || "";
  const lastName = from.last_name || "";
  // const username = from.username ? `@${from.username}` : "";
  return `${firstName} ${lastName}`.trim() || "အသုံးပြုသူ";
};

//main choose buttons
const showMainMenu = (chatId, userName = "") => {
  return bot
    .sendMessage(chatId, `Hello ${userName} ဘာကူညီပေးရမလဲ?`, {
      parse_mode: "Markdown",
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: "ဝယ်ယူထားတဲ့ Private Key အခြေအနေကိုစစ်ရန် နိုပ်ပါ",
              callback_data: "status",
            },
          ],
          [
            {
              text: "Private Key စျေးနှုန်းများကြည့်ရန် နိုပ်ပါ",
              callback_data: "prices",
            },
          ],
          [{ text: "Private Key ဝယ်ယူရန် နိုပ်ပါ", callback_data: "buy" }],
        ],
      },
    })
    .catch(console.error);
};

//start
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  console.log(`New user started: ${getUserName(msg.from)} (${chatId})`);

  const welcomeMessage =
    `👋 *Pixel Hub Bot မှကြိုဆိုပါတယ်!*\n\n` +
    `အောက်ပါခလုတ်များကို နှိပ်၍ စတင်နိုင်ပါသည်။`;

  bot
    .sendMessage(chatId, welcomeMessage, { parse_mode: "Markdown" })
    .then(() => showMainMenu(chatId, getUserName(msg.from)))
    .catch(console.error);
});

bot.on("callback_query", async (callbackQuery) => {
  const message = callbackQuery.message;
  const chatId = message.chat.id;
  const data = callbackQuery.data;

  try {
    await bot.answerCallbackQuery(callbackQuery.id);

    switch (data) {
      case "status":
        await bot.sendMessage(
          chatId,
          `🔍 *${getUserName(callbackQuery.from)} ၏ Private Key အခြေအနေ*\n\n` +
            `🟢 *အခြေအနေ*: အသုံးပြုနိုင်ပါသည်\n` +
            `📊 *သုံးစွဲပြီး*: 45.2GB / 100GB\n` +
            `📅 *သက်တမ်းကုန်ဆုံးမည့်ရက်*: ၁၅ ဒီဇင်ဘာ ၂၀၂၅\n\n` +
            `🔑 *Key ID*: OUT-${Math.random()
              .toString(36)
              .substr(2, 8)
              .toUpperCase()}`,
          { parse_mode: "Markdown" }
        );
        break;

      case "prices":
        await bot.sendMessage(
          chatId,
          `*Private Key စျေးနှုန်းများ* \n\n` +
            `100GB: 3000 ကျပ် (၃၀ ရက်)\n\n` +
            `200GB: 5000 ကျပ် (၃၀ ရက်)\n\n` +
            `500GB: 7000 ကျပ် (၃၀ ရက်)\n\n`,
          { parse_mode: "Markdown" }
        );
        break;

      case "buy":
        await bot.sendMessage(
          chatId,
          `*Private Key ဝယ်ယူရန်* \n\n` +
            `Admin နှင့်ဆက်သွယ်ပါ [Aung Paing Soe](https://t.me/AungPaingSoeDev)`,
          { parse_mode: "Markdown", disable_web_page_preview: true }
        );
        break;
    }

    await showMainMenu(chatId);
  } catch (error) {
    console.error("Error handling callback:", error);
    bot.sendMessage(chatId, "❌ An error occurred. Please try again later.");
  }
});

bot.on("message", (msg) => {
  if (!msg.text || msg.text.startsWith("/")) return;

  const chatId = msg.chat.id;
  const messageText = msg.text.trim().toLowerCase();

  if (["1", "2", "3"].includes(messageText)) {
    const plans = [
      { gb: "100GB", price: "၅ ဒေါ်လာ" },
      { gb: "200GB", price: "၁၀ ဒေါ်လာ" },
      { gb: "500GB", price: "၂၀ ဒေါ်လာ" },
    ];

    const selectedPlan = plans[parseInt(messageText) - 1];

    bot.sendMessage(
      chatId,
      `📝 *အော်ဒါအချက်အလက်*\n\n` +
        `📦 Package: ${selectedPlan.gb}\n` +
        `💰 စျေးနှုန်း: ${selectedPlan.price}\n\n` +
        `ကျေးဇူးပြု၍ အောက်ပါငွေလွှဲအကောင့်များသို့ ငွေလွှဲပါ -\n` +
        `\`USDT (TRC20): Txxxxxxxxxxxxxxxxxxxxxxxxxxxxx\`\n` +
        `\`KBZ Pay: 09xxxxxxxx\`\n\n` +
        `ငွေလွှဲပြီးပါက ငွေလွှဲအတည်ပြုလက်မှတ်ကို @payment_bot သို့ပို့ပါ`,
      { parse_mode: "Markdown" }
    );
  } else {
    showMainMenu(chatId, msg.from.first_name);
  }
});

bot.on("polling_error", (error) => {
  console.error("Polling error:", error.message);
});

process.on("unhandledRejection", (error) => {
  console.error("Unhandled promise rejection:", error);
});

console.log("🤖 ဘော့အလုပ်လုပ်ဆောင်နေပါပြီ...");
