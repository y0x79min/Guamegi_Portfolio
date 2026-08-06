<template> 
  <div  id='app'>
    
    <h1 style="font-size:2rem;font-family:memenu;position:relative;margin:0">{{univ_name}} 메신저</h1>
    <hr>
    
      <ul style='text-align: left;' class='room_list'>
        <li class='room_item' @click='openModal("학교")'><table>
        <td class='프로필'>학교</td>  
        <td class='중간'><tr><span><b>학교 단체 메신저방</b> {{people_num['학교']}}명</span></tr> <tr>{{lastChat['학교']}}</tr> </td>
        <td width='10%'><div class='온톡'>999+</div></td>
        </table> </li>
        
        <li class='room_item' @click='openModal("학과")'><table>
        <td class='프로필'>학과</td>  
        <td class='중간'><tr><td><b>학과 단체 메신저방</b> {{people_num['학과']}}명</td></tr> <tr>{{lastChat['학과']}}</tr> </td> 
        <td width='10%'><div class='온톡'>999+</div></td>
        </table> </li>
        
      </ul>
      <hr>
    <MyModal @ok= "join" @close="closeModal" v-if="modal" class='modal'>
      <div class="mb-3">
        <label for="userNick" class="form-label"><b>{{t}}</b>단체 메신저방에서<br> 사용할 닉네임을 선택해주세요</label>
        <br>
          
        <div class="form_toggle" style="display: flex;">
        	<div class="form_radio_btn" >
        		<input id ="radio-1" v-model="nick_sel" type="radio" name="userNick" value="익명" checked>
        		<label for="radio-1"><b>익명</b> <br><br><span>익명{{nick["익명_"+t]}}</span><button class='new_anon' @click='new_anon()'>🔃새 익명</button></label>
        		
        	</div>
        								 
        	<div class="form_radio_btn">
        		<input  id ="radio-2" v-model="nick_sel" type="radio" name="userNick" value="닉네임" :disabled='nick["닉네임_"+t]===null'>
        		<label for="radio-2"><b>내 닉네임</b>
        		  <div v-if='nick["닉네임_"+t]===null' class='setNick'>
        		    <input type=text placeholder='최대 10자리 수' style='font-size:10px' v-model='inputNick'><button @click='checknick()' style='font-size:10px'>닉네임 결정</button>
        		  </div>
        		  <span v-else><br><br>{{nick["닉네임_"+t]}}</span>
        		</label>
        	</div>
        	
        	
        </div>
      </div>
    </MyModal>
        
  </div>
</template>

<script>
    import axios from 'axios';
    import dayjs from "dayjs";
    import MyModal from './modal_chat.vue'
    import io from 'socket.io-client';
    export default {
        name: 'Params',
        components: { MyModal },
        data(){ 
           return{ univ_cookie:null,univ_name:null,univ_id:null,depart:null,t:null,nick_sel:'익명',  nick:[],ann_sch_t:null,ann_dep_t:null,  inputNick:null,socket:null,lastChat:[],
               modal: false,people_num:[]
             
           }
        },
        created(){
          
            this.socket = io({ transports: ['websocket'] });
            this.socket.on('사람수', (data)=> {
              this.people_num[data.타입] = data.사람수;
            })
            this.socket.on('lastChat', (data)=> {
              this.lastChat[data.타입] = data.내용;
            })
            this.socket.on('막챗', (data)=> {
              this.lastChat[data.타입] = data.내용;
            })
        },
        mounted(){
            this.univ_cookie = localStorage.getItem('univ_cookie');
            this.univ_name = localStorage.getItem('univ_name');
            this.univ_id = localStorage.getItem('univ_id');
            
             this.socket.emit('getLastChat',{
                univ_name: this.univ_name,
                univ_id: this.univ_id,
                univ_cookie: this.univ_cookie,
                univ_deapert: this.depart,
                type: '학교',
            });this.socket.emit('getLastChat',{
                univ_name: this.univ_name,
                univ_id: this.univ_id,
                univ_cookie: this.univ_cookie,
                univ_deapert: this.depart,
                type: '학과',
            });
            
            this.getnick()
        },
        methods:{
          new_anon(){
            
                this.$swal({
                  title: '익명 번호를 새로 받으시겠어요?',
                  text: "하루에 한번 바꿀 수 있고 원래 번호로 돌릴수는 없어요",
                  icon: 'question',
                  showCancelButton: true,
                  confirmButtonColor: '#3085d6',
                  cancelButtonColor: '#d33',
                  confirmButtonText: '받는다',
                  cancelButtonText: '안받을랭' 
                }).then((result) => {
                  if (result.isConfirmed) {                                                   // 닉네임 결정 했을 때
                    axios({	url: "/api/newAnon",method: "POST",		data: {	cookie:  this.univ_cookie, univ: this.univ_name, r_id: this.univ_id ,type: this.t}})
                    .then(res => {
                      if(res.data.r_data==='relogin'){ this.$relogin(); return;};
                      if(res.data.r_data==='fail_nick'){ this.$swal( '실패',res.data.msg,  'error'); return;};
                      if(res.data.r_data==='ok_nick'){
                        this.nick['익명_'+this.t] = res.data.newNum;
                        this.$swal(
                          '성공!',
                          '앞으로 '+this.t+' 단톡에서 <b>"'+res.data.newNum+'"</b>익명 번호를 사용합니다!',
                          'success'
                        )  
                        
                      }
                    })
                  }
                });
            
          },
          checknick(){
            if(this.inputNick===null){
              this.$swal( '!','닉네임을 입력해주세요')
              return;
            }
            axios({	url: "/api/checknick",method: "POST",		data: {univ: this.univ_name, r_id: this.univ_id ,type: this.t, nick: this.inputNick}})
            .then(res => {
              if(res.data.r_data==='exis_nick'){  this.$swal( '실패','이미 존재하는 닉네임이네요..',  'error'); return;};
              if(res.data.r_data==='fail_nick'){ this.$swal( '실패',res.data.msg,  'error'); return;};
              if(res.data.r_data==='ok_nick'){  
                this.$swal({
                  title: this.inputNick+'<br>이 닉네임으로 결정 할래요?',
                  text: "한번 닉네임을 결정하시면 바꾸기 어려워요.",
                  icon: 'question',
                  showCancelButton: true,
                  confirmButtonColor: '#3085d6',
                  cancelButtonColor: '#d33',
                  confirmButtonText: '결정!',
                  cancelButtonText: '아직 안해'
                }).then((result) => {
                  if (result.isConfirmed) {                                                   // 닉네임 결정 했을 때
                    axios({	url: "/api/setnick",method: "POST",		data: {	cookie:  this.univ_cookie, univ: this.univ_name, r_id: this.univ_id ,type: this.t, nick: this.inputNick}})
                    .then(res => {
                      if(res.data.r_data==='relogin'){ this.$relogin(); return;};
                      if(res.data.r_data==='exis_nick'){  this.$swal( '헉!','그사이에 누군가가 이 닉네임으로 생성했어요..',  'error'); return;};
                      if(res.data.r_data==='fail_nick'){ this.$swal( '패킷조작?',res.data.msg,  'error'); return;};
                      if(res.data.r_data==='ok_nick'){
                        this.nick['닉네임_'+this.t] = this.inputNick;
                        this.$swal(
                          '성공!',
                          '앞으로 '+this.t+'단톡방에서 <b>"'+this.inputNick+'"</b>닉네임을 사용합니다!',
                          'success'
                        )  
                        
                      }
                    })
                  }
                });
              return;};
              
            })
          },
          join(){
            var mynick='';
            if(this.nick_sel==='닉네임') mynick=this.nick['닉네임_'+this.t]
            else mynick=this.nick['익명_'+this.t]
            this.$router.push({ name: 'chatRoom' ,  query: {type:this.t, nick:this.nick_sel,mynick:mynick} });
          },
          openModal(type1) {
            this.getnick()
            this.modal = true
            this.t = type1
          },
          closeModal() {
            this.modal = false
          },
          getnick(){
            
            axios({	url: "/api/getnick",method: "POST",		data: {	cookie:  this.univ_cookie, univ: this.univ_name, r_id: this.univ_id, depart:this.depart }})
            .then(res => {
              if(res.data.r_data==='relogin'){ this.$relogin(); return};
              var nicks = JSON.parse(res.data.r_data)[0]
              
              this.nick['닉네임_학교'] = nicks.닉네임_학교
              this.nick['닉네임_학과']  = nicks.닉네임_학과
              this.nick['익명_학교']  = nicks.익명_학교
              this.nick['익명_학과']  = nicks.익명_학과
              this.ann_sch_t = nicks.익명_학교_시간
              this.ann_dep_t = nicks.익명_학과_시간
              
              this.pn1 = res.data.인원1;
              this.pn2 = res.data.인원2;
              
              if(this.pn1 ===undefined) this.pn1=0
              if(this.pn2 ===undefined) this.pn2=0
              })
              
          }
        },
    }
    
</script>


<style scoped>
table{
  width: 100%;
  height:50px;
  table-layout: fixed;
}
.setNick{
  line-height: 60px;
}
.setNick input{
  position: relative;
  width: 85%;
  top:-15px;
  height:15px;
}
.setNick button{
  position: relative;
  width: 85%;
  height:25px;
  top:-30px;
}
.modal{
  transform: scale(1.5)
}
  .nick_radio{
    position: relative;
    width: 100px;
    height: 100px;
    border:1px solid #000;
    border-radius: 10px;
    
  }
 .form_radio_btn {
			width: 100px;
			height : 100px;
    		border: 1px solid #EAE7E7;
    		border-radius: 10px;
    		display:inline-block;
    		margin:10px;
		}
		.form_radio_btn input[type=radio] {
			display: none;
		}
		.form_radio_btn label {
			display: block;
    		border-radius: 10px;
   			margin: 0 auto;
    		text-align: center;
    		height: -webkit-fill-available;
		}
		.form_radio_btn input[type=radio]:checked + label {
			background: #184DA0;
			color: #fff;
		}
		.form_radio_btn label:hover {
			color: #666;
		}
		.form_radio_btn input[type=radio] + label {
			background: #F9FAFC;
			color: #666;
		}
.room_list{
   list-style:none;
   padding-left:0px;
}
.room_item{
  margin:5px;
   
}
.room_item:hover{
  background:#D2D2FF;
}
.프로필{
  vertical-align:middle;
  text-align:center;
  border:1px solid #000;
  border-radius: 10px;
  height:50px;
  width:50px;
}
.온톡{
  border-radius:10px;
  background:red;
  height:25px;
  width:50px;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top:8px;
}
.중간{
  position: absolute;
  width:75%;
  overflow:hidden;
  text-overflow:ellipsis;
  white-space:nowrap;    
}
.new_anon{
  position: relative;
  top:10px;
  background:rgba(255,255,255,0.3);
  border:1px solid #333;
  border-radius:3px;

}
</style>

