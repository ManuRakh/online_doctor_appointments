const TelegramBot = require('node-telegram-bot-api');
const sqlite3 = require('sqlite3').verbose();
const { Database  } = require('./src/modules/database');
const token = '6608693910:AAHf1Wam86Zr4m2kqjIrkuVweB7PabnG8M0';
const db = new Database('hospital.db');
const bot = new TelegramBot(token, { polling: true });

const steps = {
    1: { name: 'Выбор специальности', action: selectSpecialty },
    2: { name: 'Выбор поликлиники', action: selectHospital },
    3: { name: 'Выбор доктора', action: selectDoctor },
    4: { name: 'Выбор времени', action: selectAppointmentTime },
    5: { name: 'Завершение', action: createAppointment },
    0: { name: 'Начало', action: "start" },
}

bot.onText(/\/start/, async (msg) => {
    const chatId = msg.chat.id;
    let step = 0;
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
    await selectSpecialty(chatId, step);
  });
    }
    
    if (user) {
  bot.sendMessage(chatId, `Привет, ${firstName}! Пожалуйста, выберите специальность врача из списка:`, options);
  await selectSpecialty(chatId, step);
}        
});

async function selectSpecialty(chatId, step = 0) {
    const newStep = 2;
    bot.once('message', (msg) => {
        if (step < newStep) step = newStep;
        else {
            console.log("Not by the step, step selectSpeciality", { step, newStep });
            return;
        }        const specialty = msg.text;
        selectHospital(chatId, specialty, step);
    });
}

async function selectHospital(chatId, specialty, step = 0) {
    const newStep = 3;
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
        if (step < newStep) step = newStep;
        else {
            console.log("Not by the step, step selectHospital", { step, newStep });
            return;
        }
        const hospital = msg.text;
        let hospitalId = supportedHospitals.find((h) => h.name === hospital)?.id;
        selectDoctor(chatId, hospitalId, specialty, step);
    });
}

async function selectDoctor(chatId, hospital, specialty, step = 0) {
    const newStep = 4;
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
        if (step < newStep) step = newStep;
        else {
            console.log("Not by the step, step selectDoctor", { step, newStep });
            return;
        }

        const selectedDoctor = msg.text;
        const foundDoctor = getDoctorsBySpecialityAndHospital.find((d) => d.name === selectedDoctor);
        selectAppointmentTime(chatId, hospital, specialty, foundDoctor, step);
    });
}

function selectAppointmentTime(chatId, hospitalId, specialty, foundDoctor, step = 0) {
    const newStep = 5;
    const availableTimes = foundDoctor.working_times.length ? JSON.parse(foundDoctor.working_times) : [];

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
        if (step < newStep) step = newStep;
        else {
            console.log("Not by the step, step selectAppointmentTime", { step, newStep });
            return;
        }
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
