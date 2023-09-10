const TelegramBot = require('node-telegram-bot-api');
const sqlite3 = require('sqlite3').verbose();
const { Database  } = require('./src/modules/database');
const token = '6608693910:AAHf1Wam86Zr4m2kqjIrkuVweB7PabnG8M0';
const db = new Database('hospital.db');
const bot = new TelegramBot(token, { polling: true });

bot.onText(/\/start/, async (msg) => {
    const chatId = msg.chat.id;
    const firstName = msg.from.first_name;
    const specialties = await db.getDoctorSpecialties();

    const keyboard = specialties.map((specialty) => [{ text: specialty }]);
    const options = {
        reply_markup: {
            keyboard,
            one_time_keyboard: true,
        },
    };

    const user = await db.getUserByName(chatId);

    if (!user) {
  bot.sendMessage(chatId, `Привет, ${firstName}! Пожалуйста, напишите как в вам обращаться, Фамилию и Имя пожалуйста.`);
            
  bot.once('message', async (msg) => {
      const name = msg.text;
      
    await db.createUser(name, chatId)
    bot.sendMessage(chatId, `Привет, ${firstName}! Пожалуйста, выберите специальность врача из списка:`, options);
    await selectSpecialty(chatId);
  });
    }
    
    if (user) {
  bot.sendMessage(chatId, `Привет, ${firstName}! Пожалуйста, выберите специальность врача из списка:`, options);
  await selectSpecialty(chatId);
}        
});

async function selectSpecialty(chatId) {
    bot.once('message', (msg) => {
        const specialty = msg.text;
        selectHospital(chatId, specialty);
    });
}

async function selectHospital(chatId, specialty) {
    const supportedHospitals = await db.getHospitalsBySpecialty(specialty);
    const keyboard = supportedHospitals.map((hospital) => [{ text: hospital?.name }]);
    const options = {
        reply_markup: {
            keyboard,
            one_time_keyboard: true,
        },
    };
    bot.sendMessage(chatId, `Отлично, вы выбрали специальность ${specialty}. Вот список поликлинник, где у нас есть доктора по выбранной вами специальности!:`, options);

    bot.once('message', async (msg) => {
        const hospital = msg.text;
        let hospitalId = supportedHospitals.find((h) => h.name === hospital)?.id;
        selectDoctor(chatId, hospitalId, specialty);
    });
}

async function selectDoctor(chatId, hospital, specialty) {
    const getDoctorsBySpecialityAndHospital = await db.getDoctorsBySpecialityAndHospital(specialty, hospital);
    const keyboard = getDoctorsBySpecialityAndHospital.map((doctor) => [{ text: doctor?.name }]);
    const options = {
        reply_markup: {
            keyboard,
            one_time_keyboard: true,
        },
    };
    bot.sendMessage(chatId, `Отлично, теперь давайте выберем к какому доктору записаться на приём :`, options);
    bot.once('message', async (msg) => {
        const selectedDoctor = msg.text;
        const selctedDoctorId = getDoctorsBySpecialityAndHospital.find((d) => d.name === selectedDoctor)?.id;
        selectAppointmentTime(chatId, hospital, specialty, selctedDoctorId);
    });
}

function selectAppointmentTime(chatId, hospitalId, specialty, selctedDoctorId) {
    const availableTimes = [
        '8:00', '9:00', '10:00', '11:00', '12:00',
        '13:00', '14:00', '15:00', '16:00', '17:00'
    ];

    const keyboard = {
        reply_markup: {
            keyboard: [],
            one_time_keyboard: true,
        }
    };

    for (const time of availableTimes) {
        keyboard.reply_markup.keyboard.push([{ text: time }]);
    }

    bot.sendMessage(chatId, 'Выберите время приема:', keyboard);
    bot.once('message', async (msg) => {
        const selectedTime = msg.text;
        createAppointment(chatId, selectedTime);
    });
}

function createAppointment(chatId, selectedTime) {
    bot.sendMessage(chatId, `Ваша запись на приём создана на ${selectedTime}. Желаем хорошего дня, постарайтесь прийти вовремя!`);
}

// Запуск бота
bot.on('polling_error', (error) => {
    console.log(error);
});

console.log('Бот запущен.');
