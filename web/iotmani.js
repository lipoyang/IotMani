var socket = null;
var taskTimer = null;

function keep_on() {
  socket.send("keep on");
}

  socket = new WebSocket('wss://アプリ名.herokuapp.com/ws/sensor');
  //socket.send("connecting");

  // 接続
  socket.addEventListener('open',function(e){
    var date = new Date();
    var timestr = date.getHours()   + ':' + 
                  date.getMinutes() + ':' + 
                  date.getSeconds();
    console.log('Socket 接続成功: ' + timestr);
    
    socket.send("connected");
    taskTimer = setInterval("keep_on()", 30*1000);
  });
  
  // 切断
  socket.addEventListener('close',function(e){
    var date = new Date();
    var timestr = date.getHours()   + ':' + 
                  date.getMinutes() + ':' + 
                  date.getSeconds();
    console.log('Socket 切断: ' + timestr);
    
    clearInterval(taskTimer);
  });

window.onload = function() {


  


  // サーバーからデータを受け取る
  socket.addEventListener('message',function(e){
      console.log(e.data);
      output.innerHTML = e.data + "回";
  });

};
