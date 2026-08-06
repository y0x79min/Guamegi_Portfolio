<template> 
  <div id='app' class="chatR">
  
    <div class="paper">
      
    <span style="font-size:2rem;font-family:memenu;position:relative;"> {{univ_name}} <span v-if='add_ex!==""' style='font-size:1.3rem;'>{{add_ex}}</span> 채팅방 </span> <br>
    <div> <span style='border:1px solid #000;padding: 3px'><b>{{nickmod}}</b> 으로 접속중</span>
    <span class='people_chck' @click='인원확인'>인원: {{room_in}}</span></div>
      <div class="lines">
        <div class="text">
          
          <br>
          <div style="width:100%;margin-bottom:3px" v-for='item in chat_list' >
            
            <div style="white-space : nowrap; " v-if='!item.mine'><span v-if='item.닉네임타입==="익명"'>익명{{item.닉네임}}</span><span v-else><b>{{item.닉네임}}</b></span></div>
            
            <div style="width:100%;">
              
              <div v-if='!item.mine' style='margin-left:20px;'  class='남챗'>
                <div class='남내용'>{{item.내용}}</div>
                <span style="color:#999;vertical-align:bottom;">{{item.날짜}}</span>
              </div>
              
              
              <div v-else style='text-align:right;margin-right:20px;' class='내챗'>
                <span style="color:#999;vertical-align:bottom;">{{item.날짜}}</span>
                <div class='내내용'>{{item.내용}}</div>
              </div>
              
            </div>
          </div>
          
          
        </div>
        
      <div class='chat_input'>
        <textarea v-model="send_data" placeholder="최대100자" v-on:keyup.enter="send" style="width:85%;height:40px;resize: none; "></textarea>
        <table style='display:inline;vertical-align: top;margin-left:5px'>
          <tr><button @click="send"  class='전송버튼' >전송</button></tr>
          <tr style='font-size:13px'>[{{send_data.length}}/300]</tr>
        </table>
        
      </div>
      </div>
      
      
    </div>
    
  </div>
    
</template>
<script>
    import axios from 'axios';
    import dayjs from 'dayjs';
    import io from 'socket.io-client';
    var bottom_flag = true;

    export default {
        name: 'Params',
        data(){ 
           return{ univ_cookie:null,univ_name:null,univ_id:null,send_data:'',socket:null,chat_list:[],room_in:null,nickmod:null,type:null,mynick:null,add_ex:'',사람목록:null,익명목록:[],닉넴목록:[],
           }
        },
        watch: {
          $route(to, from) {
              this.socket.close()
           }
        },
        created() {
            this.socket = io({ transports: ['websocket'] });
            
            
            this.socket.on('chat', (data)=> {
              
                var sendData={}
                sendData['닉네임타입']=data.닉네임타입;
                sendData['닉네임']=data.닉네임;
                sendData['내용']=data.내용;
                sendData['날짜']=dayjs(data.날짜, "YYYY-MM-DD HH:mm").format("HH:mm:ss");
                sendData['mine'] = (this.nickmod==="익명"&&data.닉네임타입==="익명" )&&( data.닉네임.toString()===this.mynick)||(this.nickmod==="닉네임"&&this.mynick===data.닉네임.toString());
                this.chat_list.push(sendData);
                
                let text_pre = document.querySelector('.text');
                if((text_pre.scrollTop + text_pre.clientHeight) == text_pre.scrollHeight)
                  setTimeout(() => {
                      let text_dis = document.querySelector('.text');
                        text_dis.scrollTop = text_dis.scrollHeight;
                  }, 100);
            });
            this.socket.on('인원', (data)=> {
                this.room_in=data.인원;
                this.사람목록=data.사람목록
            })
            this.socket.on('error', (data)=> {
                { this.$swal( 'Oops..😟',data,  'error').then((result) => {this.$router.go(-1);}); return;};
            })
        },
        mounted(){
          
          this.nickmod= this.$route.query.nick;
          this.type= this.$route.query.type;
          this.mynick= this.$route.query.mynick;
          this.univ_cookie = localStorage.getItem('univ_cookie');
          this.univ_name = localStorage.getItem('univ_name');
          this.univ_id = localStorage.getItem('univ_id');
          this.depart = localStorage.getItem('r_depart');
          
          if(this.type==='학과') this.add_ex=localStorage.getItem('r_depart');
          
          axios({	url: "/api/getchat",method: "POST",		data: {	cookie:  this.univ_cookie, univ: this.univ_name, r_id: this.univ_id, r_type:this.type,depart:this.depart  } })
            .then(res => {
              if(res.data.r_data==='relogin'){this.$relogin(); return;};
              console.log(res.data.r_data)
              this.chat_list = JSON.parse(res.data.r_data)
              
              this.chat_list.forEach((item)=>{
              item['mine']=(this.nickmod==="익명"&&item.닉네임타입==="익명" )&&( item.닉네임.toString()===this.mynick)||(this.nickmod==="닉네임"&&this.mynick===item.닉네임.toString());
              
                item['날짜']=dayjs(item.날짜, "YYYY-MM-DD HH:mm").format("HH:mm:ss");
              });
          });
          
           this.socket.emit('join',{
                    univ_name: this.univ_name,
                    univ_id: this.univ_id,
                    univ_cookie: this.univ_cookie,
                    nickmod: this.nickmod,
                    type: this.type,
                });
            
                  setTimeout(() => {
                      let text_dis = document.querySelector('.text');
                        text_dis.scrollTop = text_dis.scrollHeight;
                  }, 100);
        },
        methods:{
          인원확인(){
            
            this.익명목록 = this.사람목록[0];
            this.닉넴목록 = this.사람목록[1];
            this.$swal( '접속자','<b>익명접속: </b>'+this.익명목록+'<br><br><b>닉네임접속: </b>'+this.닉넴목록)
          },
          send(){
            if(this.send_data.length===0||this.send_data==='\n') return;
            this.socket.emit('chat',{
              message: this.send_data,
                univ_name: this.univ_name,
                univ_id: this.univ_id,
                univ_cookie: this.univ_cookie,
                nickmod: this.nickmod,
                type: this.type,
            });
            this.send_data = ''
            setTimeout(() => {
                let text_dis = document.querySelector('.text');
                  text_dis.scrollTop = text_dis.scrollHeight;
            }, 100);
          },
        },
        
    }
    
</script>
        

<style scoped>
.chat_input{
  position: absolute;
  top:100%;
  width: 100%;
  background: rgba(255,255,255,0.9);
  margin:0 auto;
  padding:10px;
  left:-10px;
  border-top:1px dashed #000;
}
.paper {
  text-align:left;
  position: relative;
  height: 750px;
  width: 500px;
  background: rgba(255,255,255,0.9);
  margin:0 auto;
}
.lines {
  margin-top: 10px;
  height: calc(100% - 100px);
  width: 100%;
  background-image: repeating-linear-gradient(white 0px, white 24px, steelblue 25px);
}
.text {
  position: absolute;
  top: 80px;
  bottom: 10px;
  font-family: 'Indie Flower';
  overflow: hidden;
  outline: none;
  overflow-y:scroll;
  overflow-x:hidden;
  width:102%;
  user-select:text;
}
 .text::-webkit-scrollbar {
    width: 8px; /*스크롤바의 너비*/
    border-radius: 15px;           
  }
  .text::-webkit-scrollbar-thumb {
    background-color: #2f3542;
    border-radius: 15px;
  }
.text::-webkit-scrollbar-thumb {
    background-color: black; /*스크롤바의 색상*/
}

.text::-webkit-scrollbar-track {
    background-color: #eee; /*스크롤바 트랙 색상*/
}
@font-face {
    font-family: 'NelnaLizzyChae';
    src: url('https://cdn.jsdelivr.net/gh/projectnoonnu/noonfonts_2205@1.0/NelnaLizzyChae.woff2') format('woff2');
    font-weight: normal;
    font-style: normal;
}
.내내용{
  display:inline-block;
  max-width:300px;
  padding-top: 3px;
  padding-bottom: 3px;
  padding-left: 10px;
  padding-right: 10px;
  border-radius:10px;
  word-break:break-all;
  background: rgba(0, 100, 0,0.1);
  border: 8px solid rgba(0, 100, 0, 0.5);
}
.내챗::after {
    content: '';
    width: 10px; /* 사이즈 */
    height: 15px; /* 사이즈 */
    border-top: 5px solid rgba(0, 100, 0, 0.5); /* 선 두께 */
    border-right: 5px solid rgba(0, 100, 0, 0.5); /* 선 두께 */
    display: inline-block;
    transform: rotate(25deg); /* 각도 */
    position: relative;
    vertical-align:top;
    left:-7px;
    top:3px;
}
.남내용{
  display:inline-block;
  max-width:300px;
  padding-top: 3px;
  padding-bottom: 3px;
  padding-left: 10px;
  padding-right: 10px;
  border-radius:10px;
  word-break:break-all;
  background: rgba(0, 0, 100,0.1);
  border: 8px solid rgba(0, 0, 100, 0.5);
}
.남챗::before {
    content: '';
    width: 10px; /* 사이즈 */
    height: 15px; /* 사이즈 */
    border-top: 5px solid rgba(0, 0, 100, 0.5); /* 선 두께 */
    border-left: 5px solid rgba(0, 0, 100, 0.5); /* 선 두께 */
    display: inline-block;
    transform: rotate(-25deg); /* 각도 */
    position: relative;
    vertical-align:top;
    left:7px;
    top:3px;
}

.전송버튼{
    position: relative;
    padding: 3px 10px;
    border-radius: 5px;
    font-family: "paybooc-Light", sans-serif;
    text-decoration: none;
    font-weight: 600;
    transition: 0.25s;
    background-color: #BEEFFF;
    color: #0064FF;
    border: 3px solid #1E82FF;
}.전송버튼:hover:not([disabled]){background:#64AAFF;transform: scale(1.2)}

.목록으로{
    position: relative;
    padding: 4px 10px;
    margin: 0px 3px;
    border-radius: 5px;
    font-family: "paybooc-Light", sans-serif;
    text-decoration: none;
    font-weight: 600;
    transition: 0.25s;
    background-color: #FAFAD2;
    color: #FFC314;
    border: 3px solid #FFC81E;
}.목록으로:hover:not([disabled]){background:#FFF064;transform: scale(1.2)}

.people_chck{
  float:right;
  margin-right:20px;
  box-shadow: 1px 1px 3px 1px #dadce0;
  border:2px #98FB98 dashed;
  border-radius:3px;
  margin:1px;
  margin-right:5px;
  background: #D2FFD2;
  padding: 1px 3px 1px 3px; 
  cursor:pointer;
  font-family: memenu;
  font-size:17px;
}
</style>