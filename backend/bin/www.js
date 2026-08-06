const app = require('../app');
const app2 = require('../app');
const debug = require('debug')('backend:server');
const http = require('http');
const https = require('https');
const fs = require('fs');
const dayjs = require("dayjs");
const rateLimit = require("express-rate-limit"); 
const LOCAL_DEV = process.env.GUAMEGI_LOCAL_DEV === '1';
const HTTP_PORT = normalizePort(process.env.GUAMEGI_BACKEND_PORT || (LOCAL_DEV ? 3000 : 80));
const FRONTEND_ORIGIN = process.env.GUAMEGI_FRONTEND_ORIGIN || (LOCAL_DEV ? 'http://localhost:8080' : 'https://localhost:443');
app.use(
    rateLimit({ 
        windowMs: 1*10*1000, 
        max: 20
    })
);


const options = LOCAL_DEV ? null : {
  key: fs.readFileSync('../https/rootca.key'),
  cert: fs.readFileSync('../https/rootca.crt'),
};

const HTTPS_PORT = normalizePort(443);  //인증서 80
app.set('securePort', HTTPS_PORT);
app2.set('Port', HTTP_PORT);

var db= global.db;
var server2 = http.createServer(app2)
var server = LOCAL_DEV ? null : https.createServer(options, app)

var indexRouter = require('../routes/index');
app.use('/', indexRouter);
app2.use('/', indexRouter);


var io = require('socket.io')(LOCAL_DEV ? server2 : server, { allowEIO3: true, cors: {origin: [FRONTEND_ORIGIN]} }); // https://hyeon-jinhyeok.tistory.com/m/39

io.on('connection' , function(socket) {
    console.log('wqdqwdqwdqwdd')
    socket.on('join', function(data){
        
      var univ = data.univ_name;
      if(!db[univ]) return;
      var univ_id = data.univ_id;
      var univ_cookie = data.univ_cookie;
        var nickmod = data.nickmod;
      var type = data.type;
        if( !(nickmod==='익명' || nickmod==='닉네임')){ console.log('비정상 닉타입 '+type+': '+univ+' '+univ_id+' '+univ_cookie);return}
        if( !(type==='학교' || type==='학과')){ console.log('비정상 타입 '+type+': '+univ+' '+univ_id+' '+univ_cookie);return}
         db[univ].query("SELECT 아이디,학과, "+nickmod+"_"+type+" as 닉네임 FROM 유저 WHERE 아이디='"+univ_id+"' AND 쿠키='"+univ_cookie+"';", function(error, 유저배열){
            if(유저배열[0]){
             if(!유저배열[0].닉네임){console.log('닉오류'); return;}
                var addinfo ='';
                var userID = 유저배열[0].아이디;
                if(type=='학과')
                addinfo=유저배열[0].학과;
            
                var room_id= type+"_"+univ+"_"+addinfo;
                
                if(socket.adapter.rooms.has(room_id)){                      //이미 접속된 아이디가 있는지 확인
                    socket.adapter.rooms.get(room_id).forEach(item=>{
                        let clientSocket = io.sockets.sockets.get(item);
                        if(clientSocket.univID===userID && clientSocket.nickType === nickmod){                   //아이디 말고 익명인지 닉인지도 가능
                            clientSocket.leave(room_id);
                            clientSocket.emit('error', '다른 곳에서 같은 아이디로 이 방에 접속해서 연결이 끊겼어요!');
                        }
                    })
                }
             
             
                console.log('join: '+room_id+' '+univ_id)
                let room_create = `create table if not exists `+"메신저_"+room_id+`(
                     번호        INT NOT NULL AUTO_INCREMENT,
                     아이디     VARCHAR(50),
                     날짜    VARCHAR(30),  
                     내용    VARCHAR(500),  
                     닉네임타입 VARCHAR(10),
                     닉네임 VARCHAR(20),
                     삭제여부 CHAR(1) DEFAULT 'N' NOT NULL,
                     확인여부 CHAR(1) DEFAULT 'N' NOT NULL,
                      PRIMARY KEY(번호)) ENGINE=MYISAM CHARSET=utf8;`;
                db[univ].query(room_create, function(err, results, fields) {
                    if (err) {  console.log(err.message);  } 
                
                socket.join(room_id);
                socket.roomID  = room_id;
                socket.univID  = userID;
                socket.nickType  = nickmod;
                socket.nickName  = 유저배열[0].닉네임;
                
                var 사람수 = 0;
                if(socket.adapter.rooms.has(room_id)) 사람수 = socket.adapter.rooms.get(room_id).size;
                io.to(room_id).emit('인원', {인원: 사람수, 사람목록:roomPeopleList(socket.adapter.rooms.get(room_id))  } ) 
	            io.to('대기방_'+room_id).emit('사람수', {타입:type, 사람수:사람수});
            });
           }else(console.log('비정상 조인 '+type+': '+univ+' '+univ_id+' '+univ_cookie))
         });
        
    });
    
	  socket.on('disconnect', function () {
	      
	    var room_id = socket.roomID;
	    if(!room_id) return;
	    if(room_id.indexOf('대기방')===0) return;
        var 사람수 = 0;
        if(socket.adapter.rooms.has(room_id)) 사람수 = socket.adapter.rooms.get(room_id).size;
        io.to(room_id).emit('인원', {인원: 사람수, 사람목록:roomPeopleList(socket.adapter.rooms.get(room_id))} ) 
	    io.to('대기방_'+room_id).emit('사람수', {타입:room_id.split('_')[0], 사람수:사람수});
	  });
	  
	  socket.on('getLastChat', function(data){
      var univ = data.univ_name;
      if(!db[univ]) return;
      var univ_id = data.univ_id;
      var univ_cookie = data.univ_cookie;
      var type = data.type;
         db[univ].query("SELECT 학과 FROM 유저 WHERE 아이디='"+univ_id+"' AND 쿠키='"+univ_cookie+"';", function(error, 유저배열){
           if(유저배열[0]){
            var addinfo = '';
            if(type==='학과')
                addinfo = 유저배열[0].학과;
             var room_id= type+"_"+univ+"_"+addinfo;
            
            db[univ].query('select 내용 from 메신저_'+room_id+' ORDER BY 번호 DESC LIMIT 1', function(err, results, fields) {
                if (err) {  console.log(err.message);  } 
                var 마지막내용 ='';
                if(results)  if(results.length>0)마지막내용 =results[0].내용
                socket.join('대기방_'+room_id);
                var 사람수 = 0;
                if(socket.adapter.rooms.has(room_id)) 사람수 = socket.adapter.rooms.get(room_id).size;
                io.emit('lastChat', {내용: 마지막내용, 타입:type } ) 
                io.emit('사람수', {타입:type,사람수:사람수} ) 
                
            });
           }else(console.log('비정상 조인 '+type+': '+univ+' '+univ_id+' '+univ_cookie))
         });
        
    });
	  
    socket.on('chat', function(data){
        console.log('chat_'+data.type+': '+data.univ_name+' '+data.univ_id+': '+data.message)
        
        var univ = data.univ_name;
        if(!db[univ]) return;
        var univ_id = data.univ_id;
        var univ_cookie = data.univ_cookie;
        var type = data.type;
        var nickmod = data.nickmod;
        var msg = data.message;
        if( !(nickmod==='익명' || nickmod==='닉네임')){ console.log('비정상 닉타입 '+type+': '+univ+' '+univ_id+' '+univ_cookie);return}
        if( !(type==='학교' || type==='학과')){ console.log('비정상 타입 '+type+': '+univ+' '+univ_id+' '+univ_cookie);return}
         db[univ].query("SELECT 학과, "+nickmod+"_"+type+" as 닉네임 FROM 유저 WHERE 아이디='"+univ_id+"' AND 쿠키='"+univ_cookie+"';", function(error, 유저배열){
           if(유저배열[0]){
             if(!유저배열[0].닉네임){console.log('닉오류'); return;}
             var addinfo ='';
             
            if(type=='학과')
                addinfo=유저배열[0].학과;
            
             var room_id = type+"_"+univ+"_"+addinfo;
             if(!io.sockets.adapter.rooms.get(room_id)){socket.emit('error', '방이 존재하지 않아요 재접속 해주세요!');return}
             if(!io.sockets.adapter.rooms.get(room_id).has(socket.id)){ socket.emit('error', '방에 속해있지 않아요 재접속 해주세요!');return;}
            var rtnMessage = {
                닉네임타입: nickmod,
                닉네임: 유저배열[0].닉네임,
                내용: msg,
                날짜: dayjs().format("YYYY-MM-DD HH:mm:ss"),
            };
            db[univ].query("INSERT INTO 메신저_"+room_id+" (아이디,날짜,내용,닉네임타입,닉네임) VALUES (?,?,?,?,?);",[univ_id,rtnMessage.날짜,rtnMessage.내용,rtnMessage.닉네임타입,rtnMessage.닉네임], function(error, 됐나){
                    
                    });
            io.to(room_id).emit('chat', rtnMessage);
            io.to('대기방_'+room_id).emit('막챗', {타입:type, 내용:msg});
            
           }else(console.log('비정상 통신 '+type+': '+univ+' '+univ_id+' '+univ_cookie))
         });
    });
   
})
function roomPeopleList(socketRoom){
    if(!socketRoom) return [[],[]]
    var 사람목록=[];
    var 익명목록=[];
    var 닉넴목록=[];
    socketRoom.forEach(item=>{
        let clientSocket = io.sockets.sockets.get(item);
       if(clientSocket.nickType==='익명') 익명목록.push(clientSocket.nickName)
       else if(clientSocket.nickType==='닉네임') 닉넴목록.push(clientSocket.nickName)
    })
    사람목록.push(익명목록);
    사람목록.push(닉넴목록);
    return 사람목록;
}

server2.listen(HTTP_PORT);
server2.on('error', onError);
server2.on('listening', onListening);

if (!LOCAL_DEV) {
  server.listen(HTTPS_PORT);
  server.on('error', onError);
  server.on('listening', onListening);
}


function normalizePort(val) {
  var port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}

function onError(error) {
  if (error.syscall !== 'listen') {
    throw error;
  }

  var bind = typeof HTTPS_PORT === 'string'
    ? 'Pipe ' + HTTPS_PORT
    : 'Port ' + HTTPS_PORT;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(bind + ' is already in use');
      process.exit(1);
      break;
    default:
      throw error;
  }
}

function onListening() {
  var addr = this.address();
  var bind = typeof addr === 'string'
    ? 'pipe ' + addr
    : 'port ' + addr.port;
  debug('Listening on ' + bind);
}
