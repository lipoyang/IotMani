// 画面サイズの取得
var winW = window.innerWidth;   // 横幅
var winH = window.innerHeight;  // 高さ
var sqrL = (winW > winH) ? winH : winW; // 最大正方形枠の一辺
var sqrX0 = (winW > winH) ? (winW - sqrL)/2 : 0;  // 最大正方形枠のオフセット(X) 
var sqrY0 = (winW > winH) ? 0 : (winH - sqrL)/2;  // 最大正方形枠のオフセット(Y)
// console.log(winW + ", " +winH + ", " +sqrL + ", " +sqrX0 + ", " +sqrY0 );

// キャンバスとコンテキストの取得
// (1) 空也上人のレイヤー
var canvas_kuuya = document.getElementById("canvas_kuuya");
var context_kuuya = canvas_kuuya.getContext("2d");
canvas_kuuya.width = winW;
canvas_kuuya.height = winH;
// (2) 阿弥陀仏のレイヤー
var canvas_amida= document.getElementById("canvas_amida");
var context_amida = canvas_amida.getContext("2d");
canvas_amida.width = winW;
canvas_amida.height = winH;

// フォントサイズと行の高さ
var fontSize = sqrL / 16;
var lineHeight = fontSize * 1.2;

// 阿弥陀仏の画像サイズ
var amidaImgW = 210;
var amidaImgH = 480;
// 阿弥陀仏の出現位置とサイズ (正方形枠に対する相対値)
var amidaX = 0.6;
var amidaY = 0.3;
var amidaH = 0.15;
var amidaW = amidaH * amidaImgW / amidaImgH;
var amidaV = 0.005; // 移動速度
var amidaL = 0.08;  // 出現間隔
var finL   = 0.04;  // 出現時のフェードイン距離
var foutL  = 0.08;  // 消滅時のフェードアウト距離
// 空也上人の画像サイズ
var kuuyaImgW = 660;
var kuuyaImgH = 1024;
// 空也上人の表示位置とサイズ (正方形枠に対する相対値)
var kuuyaX = 0.5;
var kuuyaY = 0.25;
var kuuyaH = 0.75;
var kuuyaW = kuuyaH * kuuyaImgW / kuuyaImgH;
// 空也上人の顔の画像サイズ
var kaoImgH = 410;
// 空也上人の顔の表示位置とサイズ (正方形枠に対する相対値)
var kaoX = kuuyaX;
var kaoY = kuuyaY;
var kaoW = kuuyaW;
var kaoH = kuuyaH * kaoImgH / kuuyaImgH;

// 最大正方形枠の表示(確認用)
//context_kuuya.strokeStyle="#f00";
//context_kuuya.strokeRect(sqrX0,sqrY0,sqrL,sqrL);

// 空也上人の顔の種類
var FACE = {
  SILENT   : 0, // 沈黙 
  GLANCING : 1, // チラ見
  PRAYING  : 2, // 念仏
  SHOCKED  : 3, // ショック
  MAX      : 4  // 顔の総数
}; 
// 空也上人の顔の状態
var kuuyaFace = FACE.SILENT;

var maniReversed = false; // マニ車逆転フラグ
var shockedCntMax = 50; // マニ車逆転によるショック5秒
var shockedCnt = 0;     // ショック時間カウンタ
var glanceCntOff = 100; // 沈黙10秒
var glanceCntOn = 20;   // チラ見2秒
var glanceCnt = 0;      // チラ見時間カウンタ

// 画像読み込み
// 空也上人
var kuuya = new Image();
kuuya.src = 'image/kuuya.png';
// 空也上人の顔
var faces = new Array(FACE.MAX);
var faceFiles = [
  'image/kao_silent.png',   // 沈黙
  'image/kao_glancing.png', // チラ見
  'image/kao_praying.png',  // 念仏
  'image/kao_shocked.png'   // ショック
];
for(var i=0;i<FACE.MAX;i++){
  faces[i] = new Image();
  faces[i].src = faceFiles[i];
}
// 阿弥陀仏
var amida = new Image();
amida.src = 'image/amida.png';

// アニメ表示用周期タイマー
var amimeTimer;

// 文字列表示 (textをline行目に中央揃えで表示)
function drawText(text, line)
{
  // フォントと色
  context_amida.font = 'bold ' + fontSize + 'px sans-serif';
  context_amida.fillStyle = 'black';
  // 中央揃え
  var metrics = context_amida.measureText(text);
  var textWidth = metrics.width;
  var x = (winW / 2) - (textWidth / 2);
  var y = lineHeight * line; // yはベースラインであることに注意
  // 行をクリアしてから文字描画
  context_amida.clearRect(
    0,
    lineHeight * (line - 1) + fontSize * 0.1, //文字はベースラインの下に少しはみ出る
    winW,
    lineHeight);
  context_amida.globalAlpha = 1;
  context_amida.fillText(text, x, y); // yはベースラインであることに注意
}

// 阿弥陀仏の配列
var amidas = [];

// 阿弥陀仏の待ち人数
var amidaQueue = 0;
// 次の阿弥陀仏を出すかフラグ (テスト用)
var amidaTest = false;

// テスト用 (キー入力による動作チェック)
document.onkeydown = function (event){
  console.log("keydown: " + event.key);
  
  if(event.key == 'a'){
    amidaTest = true;
  }else if(event.key == 'b'){
    amidaTest = false;
  }else if(event.key == 's'){
    amidaTest = false;
    shockedCnt = shockedCntMax;
    maniReversed = true;
  }
};

// 阿弥陀仏のアニメ表示
function anime()
{
  // マニ車逆転で阿弥陀仏が全て消滅
  if(maniReversed){
    maniReversed = false;
    for(var i=0; i<amidas.length; i++){
      // 元の位置消去
      context_amida.clearRect(
          sqrX0 + sqrL*(amidaX - amidas[i].x),
          sqrY0 + sqrL* amidaY, 
                  sqrL* amidaW,
                  sqrL* amidaH);
    }
    amidas = [];
  }

  var newAmida = false; // 阿弥陀仏が出現したフラグ
  var noAmida = false;  // 阿弥陀仏が全て消滅したフラグ

  // 阿弥陀仏が一体もいないなら出現させる
  if(amidas.length == 0){
    if(amidaTest){
      amidas.push({x:0});
      newAmida = true;
    }
    if(amidaQueue > 0){
      amidaQueue--;
      amidas.push({x:0});
      newAmida = true;
    }
  }
  //var str = '';
    
  // 各々の阿弥陀仏について
  for(var i=0; i<amidas.length; i++){
    // 元の位置消去
    context_amida.clearRect(
        sqrX0 + sqrL*(amidaX - amidas[i].x),
        sqrY0 + sqrL* amidaY, 
                sqrL* amidaW,
                sqrL* amidaH);
    
    // 位置を移動
    amidas[i].x += amidaV;
    
    var disappeared = false;
    if(amidas[i].x > amidaL*6){ // 6体ぶん(六字名号)の間隔
      // 阿弥陀仏の消滅
      amidas.shift();
      disappeared = true;
      if(amidas.length == 0) noAmida = true;
    }else if(amidas[i].x > amidaL*6-foutL){
      // 消滅時、透過度を下げてフェードアウト
      context_amida.globalAlpha = 1-(amidas[i].x-(amidaL*6-foutL))/foutL;
    }else if(amidas[i].x < finL){
      // 出現時、透過度を上げてフェードイン
      context_amida.globalAlpha = 1-(finL-amidas[i].x)/finL;
    }else{
      // 通常時
      context_amida.globalAlpha = 1;
      // 次の阿弥陀仏の出現 (最後の阿弥陀仏が一定間隔進んだ時)
      if((i == (amidas.length - 1)) && (amidas[i].x >= amidaL)){
        if(amidaTest){
          amidas.push({x:0});
          newAmida = true;
        }
        if(amidaQueue > 0){
          amidaQueue--;
          amidas.push({x:0});
          newAmida = true;
        }
      }
    }
    // 描画
    if(!disappeared){
      //context_amida.strokeRect(
      context_amida.drawImage(
        amida,
        sqrX0 + sqrL*(amidaX - amidas[i].x),
        sqrY0 + sqrL* amidaY,
                sqrL* amidaW,
                sqrL* amidaH);
    }else{
      i--; // 阿弥陀仏が消滅した場合の調整
    }
    //str = str+ amidas[i].x + " ";
  }
  //console.log(str);

  // 空也上人の顔
  var face = kuuyaFace;
  // 阿弥陀出現: → 念仏
  if((kuuyaFace != FACE.PRAYING) && newAmida){
    face = FACE.PRAYING;
    shockedCnt = 0;
  }
  // マニ車逆転: →ショック
  else if((kuuyaFace != FACE.SHOCKED) && (shockedCnt > 0)){
    face = FACE.SHOCKED;
  }
  // 時間経過: 沈黙 → チラ見
  else if(kuuyaFace == FACE.SILENT){
    glanceCnt++;
    if(glanceCnt > glanceCntOff){
      face = FACE.GLANCING;
    }
  }
  // 時間経過: チラ見 → 沈黙
  else if(kuuyaFace == FACE.GLANCING){
    glanceCnt++;
    if(glanceCnt > glanceCntOn){
      face = FACE.SILENT;
    }
  }
  // 阿弥陀消滅: 念仏 → 沈黙
  else if((kuuyaFace == FACE.PRAYING) && noAmida){
    face = FACE.SILENT;
  }
  // 時間経過: ショック → 沈黙
  else if(kuuyaFace == FACE.SHOCKED){
    shockedCnt--;
    if(shockedCnt <= 0){
      face = FACE.SILENT;
    }
  }
  if(face != kuuyaFace){
    kuuyaFace = face;
    drawKuuyaFace();
    glanceCnt = 0;
  }
}

// 空也上人の顔の描画
function drawKuuyaFace()
{
    context_kuuya.drawImage(
      faces[kuuyaFace],
      sqrX0 + sqrL*kaoX,
      sqrY0 + sqrL*kaoY,
      sqrL*kaoW,
      sqrL*kaoH);
}

// マニ車カウント数
var mani_cnt = 0;

// 読み込み時の処理
window.onload = function() {
  // テキスト表示
  drawText("マニ車カウント", 1);
  drawText("サーバー接続中…", 2);
  // 空也上人の表示
  context_kuuya.drawImage(
    kuuya,
    sqrX0 + sqrL*kuuyaX,
    sqrY0 + sqrL*kuuyaY,
    sqrL*kuuyaW,
    sqrL*kuuyaH);
  drawKuuyaFace();
  // 阿弥陀仏のアニメ表示開始
  animeTimer = setInterval(anime, 100);

  // WebScoket
  var socket = new WebSocket('wss://アプリ名.herokuapp.com/ws/sensor');
  // WebScoket接続維持用周期タイマー
  var aliveTimer = null;

  // WebScoket接続維持のための送信処理 (誰かが1分で切断するため)
  function keep_alive() {
    socket.send("keep alive");
  }

  // WebScoket接続時の処理
  socket.addEventListener('open',function(e){
    // テスト用 (時刻のコンソール出力)
    var date = new Date();
    var timestr = date.getHours()   + ':' + 
                  date.getMinutes() + ':' + 
                  date.getSeconds();
    console.log('Socket 接続成功: ' + timestr);
    // メッセージ送信(テスト用)
    socket.send("connected");
    // 接続維持のための周期処理を開始
    aliveTimer = setInterval(keep_alive, 30*1000);
  });

  // WebScoket切断時の処理
  socket.addEventListener('close',function(e){
    // テスト用 (時刻のコンソール出力)
    var date = new Date();
    var timestr = date.getHours()   + ':' + 
                  date.getMinutes() + ':' + 
                  date.getSeconds();
    console.log('Socket 切断: ' + timestr);
    // 接続維持のための周期処理を停止
    clearInterval(aliveTimer);
  });

  // WebScoketでデータを受信したときの処理
  socket.addEventListener('message',function(e){
    // マニ車カウントのテキスト表示
    var cnt = e.data;
    var message =  cnt + "回";
    console.log(message);
    drawText(message, 2);
    // マニ車カウンタに変化があったとき
    if(mani_cnt != 0){
      // 功徳を積んだとき阿弥陀仏が出現
      if(cnt > mani_cnt){
        maniReversed = false;
        amidaQueue += 6;
        if(amidaQueue > 12) amidaQueue = 12;
      }
      // マニ車が逆転されると阿弥陀仏が消滅
      else if(cnt < mani_cnt){
        shockedCnt = shockedCntMax;
        maniReversed = true;
      }
    }
    mani_cnt = cnt;
  });
};
