import { ConversationFlow } from '@/components/ChatBot';

// English flows
export const chatFlowsEN: Record<string, ConversationFlow> = {
  welcome: {
    id: 'welcome',
    triggers: ['hi', 'hello', 'hey', 'start', 'menu', 'help', 'eish', 'sharp'],
    response: `Eish... look who just walked in! 👀🎉

*Sawubona! • Molo! • Hallo! • Hello!* 🇿🇦

You've just reached *MannaBot* — the AI that's been waiting to change your business life. No pressure. Just facts. 😄

We're proudly South African 🌍 and we speak YOUR language — because business should never get lost in translation.

━━━━━━━━━━━━━━━━━━━━━
Select your language:
🇬🇧 Reply *English*
🇿🇦 Reply *Afrikaans*
🌿 Reply *Xhosa*
⚡ Reply *Zulu*
🇧🇼 Reply *Sotho*
🇧🇼 Reply *Tswana*
🇿🇦 Reply *Ndebele*
🇿🇦 Reply *Swati*
🇿🇦 Reply *Tsonga*
🇿🇦 Reply *Venda*
━━━━━━━━━━━━━━━━━━━━━`,
    nextFlows: ['english', 'afrikaans', 'xhosa', 'zulu', 'sotho', 'tswana', 'ndebele', 'swati', 'tsonga', 'venda'],
  },
  
  english: {
    id: 'english',
    triggers: ['en', 'english'],
    response: `Eish, you chose English! A person of culture. 😄

Welcome — I'm *MannaBot*, the AI brains behind *Manna Digital Hub*. Think of me as that clever friend who actually knows what they're talking about AND shows up when you need them. Unlike some people we know. 😅

Here's the thing — you didn't message this number by accident. Something brought you here. Maybe it's the enquiries going unanswered at 11pm. Maybe it's the website that last saw an update during a different presidency. Maybe it's just that nagging feeling that your competitors are quietly winning while you're busy surviving.

Sound familiar? 😏

You're in exactly the right place. And unlike the queue at Home Affairs — this won't take long. 😄

━━━━━━━━━━━━━━━━━━━━━
🎯 Reply *Consultation*
💼 Reply *Services*
🏆 Reply *Results*
❓ Reply *AI*
🤝 Reply *About*
💬 Reply *Contact*
🏠 Reply *Menu*
━━━━━━━━━━━━━━━━━━━━━`,
    nextFlows: ['consultation', 'services', 'results', 'ai', 'about', 'contact', 'menu'],
  },

  consultation: {
    id: 'consultation',
    triggers: ['consultation', 'consult', 'free', 'book'],
    response: `Now THAT is a smart decision! 🎉

I'm going to ask you 3 quick questions — more fun than a government form, I promise. 😄

Your answers help our team prepare properly for a REAL conversation about YOUR business — not some generic pitch that makes you want to fake a bad signal. 📵😂

Just type your answer and send. Simple as that! 👇

*Question 1 of 3:*
👤 What's your name?`,
    isLeadCapture: true,
    leadFields: ['name'],
  },

  services: {
    id: 'services',
    triggers: ['services', 'what', 'do', 'offers'],
    response: `💼 *Here's What We Do*

At Manna Digital Hub, we're not your typical agency. We're your **AI Automation Partner** — we run your business operations so you can focus on what you do best.

🤖 **WhatsApp Bots** — Handle enquiries 24/7. Your customers get instant answers. You get qualified leads.

💻 **Custom Websites** — Not templates. Real websites that convert browsers into buyers.

📊 **Lead Generation** — We find your ideal customers and put them in front of you.

🔄 **Workflow Automation** — Repetitive tasks? Gone. More time for strategy.

🎯 **AI Integration** — We make AI work for YOUR business, not against it.

The result? **More leads. Better conversions. Less stress.**

━━━━━━━━━━━━━━━━━━━━━
🎯 Reply *Consultation*
🏆 Reply *Results*
💬 Reply *Contact*
🏠 Reply *Menu*
━━━━━━━━━━━━━━━━━━━━━`,
    nextFlows: ['consultation', 'results', 'contact', 'menu'],
  },

  results: {
    id: 'results',
    triggers: ['results', 'proof', 'case', 'studies'],
    response: `🏆 *Real Results. Real Businesses. Real Money.*

Here's what our clients are experiencing:

✅ **Guest House (Garden Route)**
- Before: 3 bookings/month
- After: 15+ bookings/month
- Result: 400% increase in revenue

✅ **Estate Agent (Knysna)**
- Before: Manual lead tracking (chaos)
- After: Automated lead pipeline
- Result: 60% faster sales cycle

✅ **Restaurant (Mossel Bay)**
- Before: Phone ringing all day (no system)
- After: WhatsApp bot handling reservations
- Result: Staff freed up for customer service

✅ **Salon (Sedgefield)**
- Before: Missed appointments (lost money)
- After: Automated reminders + booking bot
- Result: 85% reduction in no-shows

These aren't case studies. They're your neighbors. They're real South African businesses just like yours.

**And they started exactly where you are right now.**

━━━━━━━━━━━━━━━━━━━━━
🎯 Reply *Consultation*
❓ Reply *AI*
💬 Reply *Contact*
🏠 Reply *Menu*
━━━━━━━━━━━━━━━━━━━━━`,
    nextFlows: ['consultation', 'ai', 'contact', 'menu'],
  },

  ai: {
    id: 'ai',
    triggers: ['ai', 'artificial', 'intelligence', 'learn'],
    response: `❓ *What Even Is AI? (In Plain English)*

AI isn't magic. It's not Skynet. It's not going to steal your job.

AI is a **smart assistant** that learns from patterns and makes decisions.

**In your business, AI does:**

🤖 **Answers questions** — Your bot learns what customers ask and responds instantly
📊 **Finds patterns** — Which customers are most likely to buy? AI spots it
🎯 **Predicts outcomes** — What will your customer do next? AI makes educated guesses
⚙️ **Automates repetition** — Same task 100 times? AI does it once, perfectly

**Real example:**
Your WhatsApp bot gets 50 messages asking "What are your hours?"
- Without AI: You answer manually (50 times 😫)
- With AI: Bot answers instantly (you sleep 😴)

**That's it.** AI = smart automation.

And at Manna, we make sure YOUR AI works for YOU — not the other way around.

━━━━━━━━━━━━━━━━━━━━━
🎯 Reply *Consultation*
💼 Reply *Services*
🏠 Reply *Menu*
━━━━━━━━━━━━━━━━━━━━━`,
    nextFlows: ['consultation', 'services', 'menu'],
  },

  about: {
    id: 'about',
    triggers: ['about', 'manna', 'company', 'team'],
    response: `🤝 *About Manna Digital Hub*

We're a team of **AI automation specialists** based in the **Garden Route, South Africa**.

We started because we saw a problem:
- Small businesses were drowning in manual work
- Big agencies charged big prices for cookie-cutter solutions
- Nobody was actually RUNNING their business for them

So we built Manna.

**Our Promise:**
✅ We treat your business like our own
✅ We don't do one-size-fits-all (your business is unique)
✅ We're always available (no "we'll get back to you in 3 weeks")
✅ We speak your language (literally — 11 languages!)
✅ We measure success by YOUR success

**We're not just building bots. We're building partnerships.**

Ready to see what we can do for you?

━━━━━━━━━━━━━━━━━━━━━
🎯 Reply *Consultation*
💬 Reply *Contact*
🏠 Reply *Menu*
━━━━━━━━━━━━━━━━━━━━━`,
    nextFlows: ['consultation', 'contact', 'menu'],
  },

  contact: {
    id: 'contact',
    triggers: ['contact', 'speak', 'call', 'chat'],
    response: `💬 *Let's Chat Personally!*

Our team is ready to talk about YOUR business — not some generic pitch.

**Manna Digital Hub**
📍 Garden Route, South Africa
📱 WhatsApp: +27 73 406 1526
📞 Call: +27 73 406 1526
📧 Email: info@mannadigitalhub.co.za

**Response Times:**
🌅 Morning (7am–12pm): 30 minutes
☀️ Afternoon (12pm–6pm): 1 hour
🌙 Evening (6pm–10pm): 2 hours
🌙 After Hours: Next morning (we sleep too 😴)

We look forward to welcoming you! 🚀🇿🇦

━━━━━━━━━━━━━━━━━━━━━
🎯 Reply *Consultation*
💼 Reply *Services*
🏠 Reply *Menu*
━━━━━━━━━━━━━━━━━━━━━`,
    nextFlows: ['consultation', 'services', 'menu'],
  },

  menu: {
    id: 'menu',
    triggers: ['menu', 'back', 'home', 'main'],
    response: `🏠 *Back to Main Menu*

What can I help you with today? 🇿🇦

━━━━━━━━━━━━━━━━━━━━━
🎯 Reply *Consultation*
💼 Reply *Services*
🏆 Reply *Results*
❓ Reply *AI*
🤝 Reply *About*
💬 Reply *Contact*
🏠 Reply *Menu*
━━━━━━━━━━━━━━━━━━━━━`,
    nextFlows: ['consultation', 'services', 'results', 'ai', 'about', 'contact', 'menu'],
  },

  afrikaans: {
    id: 'afrikaans',
    triggers: ['af', 'afrikaans'],
    response: `Eish, jy het Afrikaans gekies! 'n Persoon van kultuur. 😄

Welkom — ek is *MannaBot*, die AI-brein agter *Manna Digital Hub*. Dink van my as daardie slim vriend wat werklik weet waarvan hy praat EN wanneer jy hom nodig het, daar is. Anders as sommige mense wat ons ken. 😅

Hier's die ding — jy het hierdie nommer nie toevallig bel nie. Iets het jou hierher gebring. Miskien is dit die navrae wat om 23:00 nie beantwoord word nie. Miskien is dit die webwerf wat laas opgedateer is tydens 'n ander presidensie. Miskien is dit net daardie naggende gevoel dat jou mededingers stilletjies wen terwyl jy besig is om te oorleef.

Klink bekend? 😏

Jy is presies op die regte plek. En anders as die tou by Home Affairs — dit sal nie lank duur nie. 😄

━━━━━━━━━━━━━━━━━━━━━
🎯 Antwoord *Konsultasie*
💼 Antwoord *Dienste*
🏆 Antwoord *Resultate*
❓ Antwoord *AI*
🤝 Antwoord *Oor*
💬 Antwoord *Kontak*
🏠 Antwoord *Kieskaart*
━━━━━━━━━━━━━━━━━━━━━`,
    nextFlows: ['consultation', 'services', 'results', 'ai', 'about', 'contact', 'menu'],
  },

  xhosa: {
    id: 'xhosa',
    triggers: ['xh', 'xhosa'],
    response: `Eish, ukhethe isiXhosa! Umntu womkhulu. 😄

Welkam — ndim *MannaBot*, ingqondo ye-AI enikezelwe *Manna Digital Hub*. Ndiqonda ndim njengomntu onobulumko onoqikelelo kunye nobulumko. Ngaphandle komntu abanye esazi. 😅

Nantsi into — awuzange ufone inombolo ino ngaphandle kwesizathu. Kwakukho into eyakukuza apha. Miskien iyimibuzo eyaphendulwanga ngo-11pm. Miskien iyiwebhusayithi eyaziswa ixesha elidlulileyo. Miskien iyimvakalelo yokuba abatshini bakho baqhubekeka benqabela ngexesha lokuba wena uyazama ukuphila.

Ingathi uyayazi? 😏

Ukulungile apho ekufunekayo. Kwaye ngaphandle kwelayini kwa-Home Affairs — ayikuqhubekeka ixesha elide. 😄

━━━━━━━━━━━━━━━━━━━━━
🎯 Phendula *Ukubonisana*
💼 Phendula *Imisebenzi*
🏆 Phendula *Iziphumo*
❓ Phendula *AI*
🤝 Phendula *Ngomthi*
💬 Phendula *Unxibelelwano*
🏠 Phendula *Imenyu*
━━━━━━━━━━━━━━━━━━━━━`,
    nextFlows: ['consultation', 'services', 'results', 'ai', 'about', 'contact', 'menu'],
  },

  zulu: {
    id: 'zulu',
    triggers: ['zu', 'zulu'],
    response: `Eish, ukhethe isiZulu! Umuntu wezinhlonipho. 😄

Welkam — ngiyi *MannaBot*, ingqondo ye-AI ye *Manna Digital Hub*. Ngicabanga ngami njengomntu onobulumko onoqikelelo futhi uyakho. Ngaphandle komntu abanye esazi. 😅

Nantsi into — awuzange ufone inombolo ino ngaphandle kwesizathu. Kwakukho into eyakukuza apha. Miskien iyimibuzo eyaphendulwanga ngo-11pm. Miskien iyiwebhusayithi eyaziswa ixesha elidlulileyo. Miskien iyimvakalelo yokuba abatshini bakho baqhubekeka benqabela ngexesha lokuba wena uyazama ukuphila.

Ingathi uyayazi? 😏

Ukulungile apho ekufunekayo. Kwaye ngaphandle kwelayini kwa-Home Affairs — ayikuqhubekeka ixesha elide. 😄

━━━━━━━━━━━━━━━━━━━━━
🎯 Phendula *Ukubonisana*
💼 Phendula *Imisebenzi*
🏆 Phendula *Iziphumo*
❓ Phendula *AI*
🤝 Phendula *Ngomthi*
💬 Phendula *Unxibelelwano*
🏠 Phendula *Imenyu*
━━━━━━━━━━━━━━━━━━━━━`,
    nextFlows: ['consultation', 'services', 'results', 'ai', 'about', 'contact', 'menu'],
  },

  sotho: {
    id: 'sotho',
    triggers: ['st', 'sotho'],
    response: `Eish, o khethe Sotho! Motho wa thuto. 😄

Welkam — ke nna *MannaBot*, maikutlo a AI a *Manna Digital Hub*. Nkutloe ke e le motho yo o leng le puo e ntle le e leng teng ha o e hloka. Ho fapana le batho ba bang ba re a ba ithuta. 😅

Nantsi ntho — ha o a bue nomoro ena ka kotsi. Ho ne ho na le ntho e o letileng mona. Mohlomong ke dipotso tse e seng di arabiloe ka 11pm. Mohlomong ke websaete e e leng e sa ntshwantswe ka nako e e fetileng. Mohlomong ke maikutlo a gore batho ba ba go tswanetseng ba a wina ka nako ya gago e e le go phela.

A o a ithuta? 😏

O mo lefapong le le nepile. Le ho fapana le palo ya Home Affairs — ga e tla nka nako e e telele. 😄

━━━━━━━━━━━━━━━━━━━━━
🎯 Araba *Puisano*
💼 Araba *Ditirelo*
🏆 Araba *Diphello*
❓ Araba *AI*
🤝 Araba *Ka ga*
💬 Araba *Kopano*
🏠 Araba *Menyu*
━━━━━━━━━━━━━━━━━━━━━`,
    nextFlows: ['consultation', 'services', 'results', 'ai', 'about', 'contact', 'menu'],
  },

  tswana: {
    id: 'tswana',
    triggers: ['tn', 'tswana'],
    response: `Eish, o khethe Setswana! Motho wa thuto. 😄

Welkam — ke nna *MannaBot*, maikutlo a AI a *Manna Digital Hub*. Nkutloe ke e le motho yo o leng le puo e ntle le e leng teng ha o e hloka. Ho fapana le batho ba bang ba re a ba ithuta. 😅

Nantsi ntho — ha o a bue nomoro ena ka kotsi. Ho ne ho na le ntho e o letileng mona. Mohlomong ke dipotso tse e seng di arabiloe ka 11pm. Mohlomong ke websaete e e leng e sa ntshwantswe ka nako e e fetileng. Mohlomong ke maikutlo a gore batho ba ba go tswanetseng ba a wina ka nako ya gago e e le go phela.

A o a ithuta? 😏

O mo lefapong le le nepile. Le ho fapana le palo ya Home Affairs — ga e tla nka nako e e telele. 😄

━━━━━━━━━━━━━━━━━━━━━
🎯 Araba *Puisano*
💼 Araba *Ditirelo*
🏆 Araba *Diphello*
❓ Araba *AI*
🤝 Araba *Ka ga*
💬 Araba *Kopano*
🏠 Araba *Menyu*
━━━━━━━━━━━━━━━━━━━━━`,
    nextFlows: ['consultation', 'services', 'results', 'ai', 'about', 'contact', 'menu'],
  },

  ndebele: {
    id: 'ndebele',
    triggers: ['nd', 'ndebele'],
    response: `Eish, ukhethe isiNdebele! Umuntu wezinhlonipho. 😄

Welkam — ngiyi *MannaBot*, ingqondo ye-AI ye *Manna Digital Hub*. Ngicabanga ngami njengomntu onobulumko onoqikelelo futhi uyakho. Ngaphandle komntu abanye esazi. 😅

Nantsi into — awuzange ufone inombolo ino ngaphandle kwesizathu. Kwakukho into eyakukuza apha. Miskien iyimibuzo eyaphendulwanga ngo-11pm. Miskien iyiwebhusayithi eyaziswa ixesha elidlulileyo. Miskien iyimvakalelo yokuba abatshini bakho baqhubekeka benqabela ngexesha lokuba wena uyazama ukuphila.

Ingathi uyayazi? 😏

Ukulungile apho ekufunekayo. Kwaye ngaphandle kwelayini kwa-Home Affairs — ayikuqhubekeka ixesha elide. 😄

━━━━━━━━━━━━━━━━━━━━━
🎯 Phendula *Ukubonisana*
💼 Phendula *Imisebenzi*
🏆 Phendula *Iziphumo*
❓ Phendula *AI*
🤝 Phendula *Ngomthi*
💬 Phendula *Unxibelelwano*
🏠 Phendula *Imenyu*
━━━━━━━━━━━━━━━━━━━━━`,
    nextFlows: ['consultation', 'services', 'results', 'ai', 'about', 'contact', 'menu'],
  },

  swati: {
    id: 'swati',
    triggers: ['ss', 'swati'],
    response: `Eish, ukhethe siSwati! Umuntu wezinhlonipho. 😄

Welkam — ngiyi *MannaBot*, ingqondo ye-AI ye *Manna Digital Hub*. Ngicabanga ngami njengomntu onobulumko onoqikelelo futhi uyakho. Ngaphandle komntu abanye esazi. 😅

Nantsi into — awuzange ufone inombolo ino ngaphandle kwesizathu. Kwakukho into eyakukuza apha. Miskien iyimibuzo eyaphendulwanga ngo-11pm. Miskien iyiwebhusayithi eyaziswa ixesha elidlulileyo. Miskien iyimvakalelo yokuba abatshini bakho baqhubekeka benqabela ngexesha lokuba wena uyazama ukuphila.

Ingathi uyayazi? 😏

Ukulungile apho ekufunekayo. Kwaye ngaphandle kwelayini kwa-Home Affairs — ayikuqhubekeka ixesha elide. 😄

━━━━━━━━━━━━━━━━━━━━━
🎯 Phendula *Ukubonisana*
💼 Phendula *Imisebenzi*
🏆 Phendula *Iziphumo*
❓ Phendula *AI*
🤝 Phendula *Ngomthi*
💬 Phendula *Unxibelelwano*
🏠 Phendula *Imenyu*
━━━━━━━━━━━━━━━━━━━━━`,
    nextFlows: ['consultation', 'services', 'results', 'ai', 'about', 'contact', 'menu'],
  },

  tsonga: {
    id: 'tsonga',
    triggers: ['ts', 'tsonga'],
    response: `Eish, o khethe Xitsonga! Munhu wa thuto. 😄

Welkam — ndi *MannaBot*, miehleketo ya AI ya *Manna Digital Hub*. Ndikumeka ndzi ri munhu yo o na le vutomi byo byo na le xivulamulelo. Ku fapana na vanhu va vangani va ri a va ithuta. 😅

Nantsi xivulavulelo — ha o a bue nomboro ino ka kotsi. Ho ne ho na le xivulavulelo xo xo ku letile mona. Mohlomong ku ri mibuzo yo e seng yi arabilwe ka 11pm. Mohlomong ku ri websayiti yo yi leng yi sa ntshwantswe ka nako yo yi fetile. Mohlomong ku ri miehleketo yo gore vanhu va va ku tswanetseng va a wina ka nako ya gago yo yi ri ku phela.

A o a ithuta? 😏

O mu lefapong le le nepile. Le ku fapana na palo ya Home Affairs — ga yi tla nka nako yo yo telele. 😄

━━━━━━━━━━━━━━━━━━━━━
🎯 Araba *Puisano*
💼 Araba *Ditirelo*
🏆 Araba *Diphello*
❓ Araba *AI*
🤝 Araba *Ka ga*
💬 Araba *Kopano*
🏠 Araba *Menyu*
━━━━━━━━━━━━━━━━━━━━━`,
    nextFlows: ['consultation', 'services', 'results', 'ai', 'about', 'contact', 'menu'],
  },

  venda: {
    id: 'venda',
    triggers: ['ve', 'venda'],
    response: `Eish, ni khethe Tshivenda! Munhu wa thuto. 😄

Welkam — ndi *MannaBot*, miehleketo ya AI ya *Manna Digital Hub*. Ndikumeka ndzi ri munhu yo o na le vutomi byo byo na le xivulamulelo. Ku fapana na vanhu va vangani va ri a va ithuta. 😅

Nantsi xivulavulelo — ha o a bue nomboro ino ka kotsi. Ho ne ho na le xivulavulelo xo xo ku letile mona. Mohlomong ku ri mibuzo yo e seng yi arabilwe ka 11pm. Mohlomong ku ri websayiti yo yi leng yi sa ntshwantswe ka nako yo yi fetile. Mohlomong ku ri miehleketo yo gore vanhu va va ku tswanetseng va a wina ka nako ya gago yo yi ri ku phela.

A o a ithuta? 😏

O mu lefapong le le nepile. Le ku fapana na palo ya Home Affairs — ga yi tla nka nako yo yo telele. 😄

━━━━━━━━━━━━━━━━━━━━━
🎯 Araba *Puisano*
💼 Araba *Ditirelo*
🏆 Araba *Diphello*
❓ Araba *AI*
🤝 Araba *Ka ga*
💬 Araba *Kopano*
🏠 Araba *Menyu*
━━━━━━━━━━━━━━━━━━━━━`,
    nextFlows: ['consultation', 'services', 'results', 'ai', 'about', 'contact', 'menu'],
  },

};

export default chatFlowsEN;
