const PORT = 80;

const express = require("express"),
  app = express(),
  bodyParser = require("body-parser");
const { Botact } = require("botact"), 
  bot = new Botact({
    token: "350abe26b5e8c589d9aa1f37cb6becab6da8e8bd244a5c72fee7afb55701a7840761afc426a8cca8e81a8",
    confirmation: "61eab03f"
  });
let users_info = new Map(); // users info
let intToGame = {
  "1": "movies", 
  "2": "music", 
  "3": "art"
};

// quiz start
bot.command('!start', (ctx) => {
  let user_id = ctx.user_id;
  //first start
  if(users_info.get(user_id) === undefined) {
    console.log("NEW ONE");
    users_info.set(user_id, {
      is_playing: 1,
      cur_game: undefined,
      quiz_data: {
        "arch": new Array(), 
        "movies": new Array(), 
        "art": new Array(),
        "music": new Array()
      }
    }); 

    bot.reply(user_id, "Выберите одну из тем: \n1)кино\n2)музыка\n3)искусство\nВведите число от 1 до 3");
  } else if(users_info.get(user_id).is_playing) {
    console.log("ALREADY EXISTS")
    bot.reply(user_id, "Игра уже началась!");
    return;
  }
})
.command("!stop", (ctx) => {
  //quiz stop
  let user_id = ctx.user_id;
  let user = users_info.get(user_id);
  if(user != undefined && user.is_playing) {
    user.is_playing = 0;
    user.cur_game = undefined;
    bot.reply(user_id, "quiz stopped!");
  }
});

bot.on((ctx) => {
  let msg = ctx.body, user_id = ctx.user_id, user = users_info.get(user_id);
  console.log("Some message " + msg);
  // gamemode 1

  console.log(user);
  console.log(user_id);
  if(user != undefined && user.is_playing) {
    //game commands
    //Не выбрал
    if(user.cur_game == undefined) {
      let msg_int = parseInt(msg);
      //msg число?
      if(isNaN(msg_int)){
        bot.reply(user_id, `Попробуй еще раз!
        введите число от 1 до 3!`);
        return;
      }
      //msg в отрезке?
      if(msg_int >= 1 && msg_int <= 3) {
        user.cur_game = intToGame[msg];

        //translate to ru//
        bot.reply(user_id, "Вы выбрали тему: " + intToGame[msg]);

        return;
      } else {
        bot.reply(user_id, "введите число от 1 до 3!");
        return;
      }
      
      //get question -> answer
      if(user.answering) {
        //user is answering
      } else {
        //ask question
      }
    }

    //иначе ответ на вопрос
  }
  //else gamemode 0
  bot.reply(user_id, "<3Чтобы начать игру напиши '!start'\n '!stop' чтобы остановить")
});
bot.event('group_join', (ctx) => {
  bot.reply(ctx.user_id, "Привет бубалеха!");
});
app.use(bodyParser.json());
app.post("/", bot.listen);

app.listen(PORT);
console.log("Listening on port " + PORT);