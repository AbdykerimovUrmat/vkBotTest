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

const quiz = require("quiz.json");

let intToGame = {
  "1": "movies", 
  "2": "music", 
  "3": "art"
};

function getRandInd(user) {
  let cur_done = user.quiz_data[user.cur_game];
  let rand_ind = (Math.random() * 100 | 0) % cur_done.length;
  let allOnes = 1;
  cur_done.forEach(element => {
    allOnes &= element;
  });
  if(allOnes) {
    cur_done.fill(0);
    return -1;
  }
  while(cur_done[rand_ind]) {
    rand_ind = (Math.random() * 1000000 | 0) % cur_done.length;
  }
  return rand_ind;
}

function wait() {
  setTimeout(() => {}, 10000);
}
function checkAnswer(msg, ans) {
  return ans.toLowerCase() == msg.toLowerCase();;
}
// quiz start
bot.command('!start', (ctx) => {
  let user_id = ctx.user_id;
  //first start
  if(users_info.get(user_id) === undefined || !users_info.get(user_id).is_playing) {
    
    if(users_info.get(user_id) === undefined) {
      console.log("NEW ONE");
      users_info.set(user_id, {
        id: user_id, 
        cur_ind: undefined,
        is_playing: 1,
        is_answering: 0,
        cur_game: undefined,
        quiz_data: {
          //gotta set some size
          "movies": new Array(quiz.movies.length), 
          "art": new Array(quiz.art.length),
          "music": new Array(quiz.music.length)
        }
      }); 
    }
    
    users_info.get(user_id).quiz_data["movies"].fill(0);
    users_info.get(user_id).is_playing = 1;
    users_info.get(user_id).quiz_data["art"].fill(0);
    users_info.get(user_id).quiz_data["music"].fill(0);

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
    user.is_answering = 0;
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
        user.cur_ind = getRandInd(user);
        //translate to ru//
        bot.reply(user_id, "Вы выбрали тему: " + intToGame[msg]);

        wait();
        bot.reply(user_id, "Если трудно ответить на вопрос, напиши 'сдаюсь'");        
        wait();
        bot.reply(user_id, "Вот первый вопрос:");

      } else {
        bot.reply(user_id, "введите число от 1 до 3!");
        return;
      }
    }
    //user has topic
    //maybe answering
    let quesion = quiz[user.cur_game][user.cur_ind];
    let question_data = quesion["question"], question_answer = quesion["answer"];
    wait();
    console.log(msg.toLowerCase());
    if(user.is_answering) {
      if(msg.toLowerCase() == "сдаюсь") {
        bot.reply(user_id, "Эх ты, бубалеха, верный ответ: " + question_answer);
        wait();
        user.quiz_data[user.cur_game][user.cur_ind] = 1;
        let rand_ind = getRandInd(user);
        user.cur_ind = rand_ind;
        if(user.cur_ind == -1) {
          
          bot.reply(user_id, "ну всё... Вопросы закончились! Игра закончилась");
          user.is_playing = 0;
          user.quiz_data[user.cur_game].fill(0);
          user.cur_game = undefined;
          user.cur_ind = undefined;
          user.is_answering = 0;
          return;
          
        }
        bot.reply(user_id, "Вот следующий вопрос:");
        quesion = quiz[user.cur_game][user.cur_ind];
        question_data = quesion["question"], question_answer = quesion["answer"];
        wait();
      } else if(checkAnswer(user, msg, question_data, question_answer)) {
        //mark question as used
        user.quiz_data[user.cur_game][user.cur_ind] = 1;
        bot.reply(user_id, "Умничка, верно!")
        wait();
        let rand_ind = getRandInd(user);
        user.cur_ind = rand_ind;
        if(rand_ind == -1) {
          
          bot.reply(user_id, "ну всё... Вопросы закончились! Игра закончилась");
          user.is_playing = 0;
          user.quiz_data[user.cur_game].fill(0);
          user.cur_game = undefined;
          user.cur_ind = undefined;
          user.is_answering = 0;
          return;
          
        }
        quesion = quiz[user.cur_game][user.cur_ind];
        question_data = quesion["question"], question_answer = quesion["answer"];
        bot.reply(user_id, "Вот следующий вопрос:");
        wait();
      } else {
        bot.reply(user_id, "бубалеха, ответ неверный, подуймай получше!");
        return;
      }
    }
    //ask question
    bot.reply(user_id, question_data);
    user.is_answering = 1;
    return;
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