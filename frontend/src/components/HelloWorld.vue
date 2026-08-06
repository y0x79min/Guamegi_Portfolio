<template>
  <body>
    
    <div class='로딩'> 사용자 정보를 읽는 중입니다.</div>
  </body>
  <div class='.body'>
    
    <div class='book' @click='open_book()'> 
        <div class="front" >
        <div class="front_img">
          
          <div class="front_title">
            <p class='tt'>과<br>제</p> 
            <p class='tt2'>톡</p> 
            <p class='tt3'>기<br>록<br>장</p>
          </div>
          <h3 class="front_h3">click to continue</h3>
        </div>
      </div>
      <div class="front_back"><div class="front_back_center"></div></div>
      <div id="page_9" class="paper"></div>
      <div id="page_8" class="paper"><div class="reverse"> </div></div>
      
      <div id="page_7" class="paper"></div>
      <div id="page_6" class="paper"><div class="reverse"> </div></div>
      
      <div id="page_5" class="paper" style="text-align: left; padding: 10px;box-sizing: border-box;"> 
      
         <a class="bookmark" @click='close_book'><span>close Book</span> </a>
          <label for="ch2" style="cursor:pointer;zoom:1.2"> <input type="checkbox" v-model="login_agree" id='ch2'> <b>이용약관 동의</b> </label> <br><br>
        1. 아이디 비밀번호를 입력하면 선택한 대학 가상강의 사이트에 로그인 합니다.<br>
        &nbsp;1-1. 아이디는 사용자 구분을 위해 저장하고 비밀번호는 저장되지않습니다.<br>
        &nbsp;1-2. 로그인 후 아래와 같은 정보를 서버에 저장합니다. <br>
        &nbsp;&nbsp;- 학교 로그인 인증 쿠키: 이 사이트에서 사용자를 인증합니다.<br>
        &nbsp;&nbsp;- 수강신청 링크: 기록장에 접근할 수 있는지 인증합니다.<br>
        &nbsp;&nbsp;- 학과: 학과채팅방에 접근할 수 있는지 확인합니다.<br>
        <br>
        2. 사용자 클라이언트에 저장하는 정보<br>
        &nbsp;- 학교<br>
        &nbsp;- 아이디<br>
        &nbsp;- 비밀번호 (자동로그인 체크시)<br>
        &nbsp;- 학교 로그인 인증 쿠키<br>
        &nbsp;- 크롤링한 수업정보와 과제정보<br><br>
        &nbsp; &nbsp;-정보는 로컬 스토리지에 저장됩니다.-
        
  
      </div>
      <div id="page_4" class="paper"><div class="reverse">
        
        <div class='page2_up' v-on:keyup.enter="login"><br> 
            <div class='arrow' @click='page_swap(2)'></div><br>
            <h1><span>LMS</span><span>로그인</span>을 해주세요</h1><br><br>
            <div class="input-box"> <input id="username" type="text" name="username" placeholder="아이디" autocomplete= "off"> <label for="username">아이디</label> </div><br><br>
            <div class="input-box"> <input id="password" type="password" name="password" placeholder="비밀번호" > <label for="password">비밀번호</label> </div>
            <button class="login_btn" @click="login" >로그인</button><br><br><br>
           <label for="auto_login_1" style='zoom:1.2;cursor:pointer;'><input type="checkbox" v-model="auto_login" id="auto_login_1"> 자동로그인 </label>
           
          </div>
        
      </div></div>
         
         
      <div id="page_3" class="paper"> 
         <a class="bookmark" @click='close_book'><span>close Book</span> </a>
         <br><br><br><br><br>
         <b style='font-size:20px;'>“<b style='background: linear-gradient(to top, #D9FCDB 50%, transparent 50%);'>{{auddjs.글}}</b>”</b>
         <br>
         <b style='float:right;margin-right:50px;font-size:15px'>-{{auddjs.쓴이}}</b>
         <br><br><br>
         
         <button class='postit' @click='click_postit1'> 학교 추가 신청하기</button><br>
         <button class='postit' id='postit2' @click='click_postit2'> 오류 신고하기 </button><br><br><br>
         
         가입(로그인)한 학생: 4132100명<br>
         오늘 총 접속자: 121390명<br>
         현재 접속자: 59703명
      </div>
      <div id="page_2" class="paper"><div class="reverse"> 
      <br>
        <h1><span>대학교</span>를 <span>선택</span>해주세요</h1>
          <input class="chosen-value" type="text" value="" placeholder="대학교 찾기!" @focus='in_focus' @blur='out_focus' @input='input_fild'>
              <ul class="value-list">
                  <li v-for="item in univ_list" @click='click_item(item.학교이름)'> {{ item.학교이름 }}</li>
              </ul>
              
              <br><br><br><br><br><br><br>
        <button class='btn_next' @click='page_swap(4)' disabled>대학교 선택이 필요합니다!</button>
      </div></div>
      <div id="page_1" class="paper"> 1 </div>
      <div class="paper_dumy"></div>
    </div>
  </div>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0" />
</template>
<script>

import axios from 'axios'


let book_stat = 'close';
var inputField;
var click_univ;
var dropdownArray;
var dropdown;
var valueArray=[];
export default {
  data(){
    return{  univ_list: null,auto_login:null,page:0, savePage:2, loging:0 ,login_agree:null,refresh:0,auddjs:null,post_login:0 ,auddjs:{글:'',쓴이:""}
            ,계정사용동의:'아래의 정보 수집을 위해 계정정보를 수집합니다.'+
              ' <br> 1.크롤링정보 1 <br> 2.크롤링정보 2 <br> 3.크롤링정보 3 <br> 4.크롤링정보 4 <br> '+
              '위 수집만을 목적으로 이용하며 다른 정보는 일체 접근하지 않습니다. <br> 위 정보 수집이 끝나면 수집한 계정정보도 삭제합니다.',
            오류문의:'일시: \n로그인 유무: \n오류난 url:\n답장받을 메일/전화번호: \n증상:',
    }
  },
  created(){
    axios({	url: "/api/univlist",method: "POST" }) .then(res => { 
      this.univ_list = res.data.univ_list;
      /**
      this.univ_list.push({학교이름:'테스트학교1'})
      this.univ_list.push({학교이름:'테스트2학교1'})
      this.univ_list.push({학교이름:'테3스트학교1'})
      this.univ_list.push({학교이름:'테스트5학교1'})
      this.univ_list.push({학교이름:'테4스트학교1'})
      this.univ_list.push({학교이름:'테스트6학교1'})
      this.univ_list.push({학교이름:'테123스트학교1'})
      this.univ_list.push({학교이름:'테스345트학교1'})
      this.univ_list.push({학교이름:'테스트1학교`121'})
      **/
      this.auddjs = res.data.auddjs;
    });
  },
  mounted() {
    document.querySelector('#menu').style.display='none'
    document.querySelector('.routeCon').style.background='none'
    if( this.$route.params.logout==='1'){
      this.$router.go();
    }
    document.querySelector('.book').style.transform= 'rotate(-90deg) translate(36%) scale(1.3) scaleX(1.15)'
    
      if( localStorage.getItem('univ_id') !==null && localStorage.getItem('univ_pw') !==null && localStorage.getItem('auto_login')==='1'){  //자동로그인
      
        if(localStorage.getItem('crow_data')!==null){                   //크롤링 데이터 있을 때 바로 이어서 리스트로
          this.$router.push({ name: 'glist', params: {auto_login:1}});
        }
        else{                                                           //크롤링 데이터 없을 때 아이디 비번 자동입력후 로그인
          document.getElementById('username').value =localStorage.getItem('univ_id');
          document.getElementById('password').value=localStorage.getItem('univ_pw');
          click_univ=localStorage.getItem('univ_name');
          this.login_agree=1;
          this.login();
        }
          return;
      }
      
    axios({	url: "/api/univlist",method: "POST" }) .then(res => { 
      document.getElementById('username').value ='';
      document.getElementById('password').value='';
      
      
      dropdown = document.querySelector('.value-list');
      inputField = document.querySelector('.chosen-value');
      dropdownArray= [...document.querySelectorAll('li')];
      dropdown.classList.add('close');
        //inputField.focus(); // Demo purposes only
        dropdownArray.forEach(item => {
          valueArray.push(item.textContent);
        });
        

     })
  },
  name: 'HelloWorld',
  props: {
    msg: String
  },
  methods : { 
    click_item(item_content){
      inputField.value = item_content
      click_univ=item_content
      var nextbtn = document.querySelector('.btn_next')
      nextbtn.innerText = '대학교 로그인 하러가기~';
      nextbtn.disabled = false;
      dropdownArray.forEach(dropdown => {
        dropdown.classList.add('closed');
      });
    },
    input_fild(){
      dropdown.classList.add('open');
      let inputValue = inputField.value.toLowerCase();
      let valueSubstring;
      if (inputValue.length > 0) {
          console.log('zz'+valueArray)
        for (let j = 0; j < valueArray.length; j++) {
          if (!(inputValue.substring(0, inputValue.length) === valueArray[j].substring(0, inputValue.length).toLowerCase())) {
            dropdownArray[j].classList.add('closed');
          } else {
            dropdownArray[j].classList.remove('closed');
          }
        }
      } else {
        for (let i = 0; i < dropdownArray.length; i++) {
          dropdownArray[i].classList.remove('closed');
        }
      }
    },
    out_focus(){
      inputField.placeholder = '대학교 찾기!';
      dropdown.classList.remove('open');
    },
    in_focus(evt){
     dropdown.classList.add('open');
     dropdownArray.forEach(dropdown => {
       
        inputField.placeholder = 'Search';
       dropdown.classList.remove('closed');
     });
  
    },
    login(){
      if(this.post_login===1) {this.post_login=0; return;}  //중첩 로그인버튼 방지
      else this.post_login=1;
      
      var univ_name=click_univ;
      var univ_id = document.getElementById('username').value;
      var univ_pw = document.getElementById('password').value;
      if(univ_id==='') this.$swal('아이디를 입력해주세요!')
      else if (univ_pw ==='') this.$swal('비밀번호를 입력해주세요!')
      else if (this.login_agree!=true){ 
        this.$swal({
                  title: '이용약관에 동의하십니까?',
                  text: "이 페이지 아래쪽에 이용약관이 있습니다.",
                  icon: 'question',
                  showCancelButton: true,
                  confirmButtonColor: '#3085d6',
                  cancelButtonColor: '#d33',
                  confirmButtonText: '동의',
                  cancelButtonText: '아니요'
                }).then((result) => {
                  if (result.isConfirmed) {  
                    
          localStorage.setItem('reload', 1)
          
          this.close_book();
          this.loding=1;
          
          document.querySelector('.book').style.transform= 'rotate(-90deg) translate(40% ,10%) scale(0.4) scaleX(1.15) rotateY(10deg)'
          document.querySelector('.로딩').style.display='block'
          setTimeout(() => {
            document.querySelector('.front').style.transform = 'rotateX(180deg)';
            document.querySelector('.front_back').style.transform = 'rotateX(179.9deg)';
            this.page_swap(6);
            setTimeout(() => {document.querySelector('#page_7').style.display='block'}, 100);
          }, 700);
      		axios({	url: "/api/login",method: "POST",		data: {	 univ_name: univ_name,	univ_id: univ_id,	univ_pw: univ_pw } })
          .then(res => {				// back 서버로부터 응답받으면
          document.querySelector('#page_7').style.display='none'
          document.querySelector('.book').style.transform='rotate(-90deg) translate(36%) scale(1.3) scaleX(1.15)'
          document.querySelector('.로딩').style.display='none'
          
              this.loding = 0;
               this.open_book();
                if(res.data.state==='로그인성공'){
                   
                   if(this.auto_login){  //자동로그인 체크되면
                     localStorage.setItem('auto_login', '1');
                     localStorage.setItem('univ_pw', univ_pw);
                   }else{localStorage.setItem('auto_login', '0');}
                   localStorage.setItem('univ_id', univ_id);
                   localStorage.setItem('univ_cookie', res.data.r_cookie)
                   localStorage.setItem('univ_name', res.data.r_univ)
                   localStorage.setItem('r_time', res.data.r_time)
                   localStorage.setItem('loginLink', res.data.r_loginLink)
                    this.post_login=0;
                    
                   document.querySelector('#menu').style.display=''
                   document.querySelector('.routeCon').style.background=''
                   setTimeout(() => {
                    this.$router.push({ name: 'glist' });
                   }, 500);
                }
                else{
                  
                    this.$swal('실패',res.data.message,'error',);
                    this.post_login=0;
                }
              
              
          })
                  }
                });
        
      }
      else{
          localStorage.setItem('reload', 1)
          
          this.close_book();
          this.loding=1;
          
          document.querySelector('.book').style.transform= 'rotate(-90deg) translate(40% ,10%) scale(0.4) scaleX(1.15) rotateY(10deg)'
          document.querySelector('.로딩').style.display='block'
          setTimeout(() => {
            document.querySelector('.front').style.transform = 'rotateX(180deg)';
            document.querySelector('.front_back').style.transform = 'rotateX(179.9deg)';
            this.page_swap(6);
            setTimeout(() => {document.querySelector('#page_7').style.display='block'}, 100);
          }, 700);
      		axios({	url: "/api/login",method: "POST",		data: {	 univ_name: univ_name,	univ_id: univ_id,	univ_pw: univ_pw } })
          .then(res => {				// back 서버로부터 응답받으면
          document.querySelector('#page_7').style.display='none'
          document.querySelector('.book').style.transform='rotate(-90deg) translate(36%) scale(1.3) scaleX(1.15)'
          document.querySelector('.로딩').style.display='none'
          
              this.loding = 0;
               this.open_book();
                if(res.data.state==='로그인성공'){
                   
                   if(this.auto_login){  //자동로그인 체크되면
                     localStorage.setItem('auto_login', '1');
                     localStorage.setItem('univ_pw', univ_pw);
                   }else{localStorage.setItem('auto_login', '0');}
                   localStorage.setItem('univ_id', univ_id);
                   localStorage.setItem('univ_cookie', res.data.r_cookie)
                   localStorage.setItem('univ_name', res.data.r_univ)
                   localStorage.setItem('r_time', res.data.r_time)
                   localStorage.setItem('loginLink', res.data.r_loginLink)
                    this.post_login=0;
                    
                   document.querySelector('#menu').style.display=''
                   document.querySelector('.routeCon').style.background=''
                   setTimeout(() => {
                    this.$router.push({ name: 'glist' });
                   }, 500);
                }
                else{
                  
                    this.$swal('실패',res.data.message,'error',);
                    this.post_login=0;
                }
              
              
          })
    		  
    		  
      }
      this.post_login=0;
    },
    open_book() {
      if(this.loding==1) return;
      document.querySelector('.book').style.transform= ''
      if(book_stat==='close'){
        book_stat = 'open';
        var front = document.querySelector('.front');
        var front_back = document.querySelector('.front_back');
        front.style.transform = 'rotateX(180deg)';
        front_back.style.transform = 'rotateX(179.9deg)';
        setTimeout(this.page_swap(this.savePage),100)
      }
    },
    close_book() {
      if(this.loding==1) return;
      if(book_stat==='open'){
        this.savePage=this.page
        this.page_swap(0)
      }
    },
    
    page_swap(p){//페이지는 짝수 위 기준 
      var page = this.page
      this.page=p;
      if(page<p){
        for(var i=page;i<p;i+=2){
          setTimeout(() =>{
            if(document.querySelector('#page_'+(page-3)) !==null ){
              document.querySelector('#page_'+(page-3)).style.transform = 'rotateX(179deg)';
              document.querySelector('#page_'+(page-2)).style.transform = 'rotateX(178deg)';
            }
            
            if(document.querySelector('#page_'+(page-1)) !==null ){
              document.querySelector('#page_'+(page-1)).style.transform = 'rotateX(174deg)';
              document.querySelector('#page_'+(page)).style.transform = 'rotateX(173deg)';
            }
            document.querySelector('#page_'+(page+1)).style.transform = 'rotateX(171deg)';
            document.querySelector('#page_'+(page+2)).style.transform = 'rotateX(170deg)';
            page+=2
          }, ((i-page)+1)*100); 
        }
      }
      else if(page>p){
        for( i=page;i>p;i-=2){
          setTimeout(() =>{
            document.querySelector('#page_'+(page)).style.transform = '';
            document.querySelector('#page_'+(page-1)).style.transform = '';
            page-=2
            if(p===0&&page===0){
              var front = document.querySelector('.front');
              var front_back = document.querySelector('.front_back');
              setTimeout(() => {
                front.style.transform = '';
                front_back.style.transform = '';},100)
                if(this.loding!==1)
                   document.querySelector('.book').style.transform= 'rotate(-90deg) translate(36%) scale(1.3) scaleX(1.15)'
                book_stat = 'close';
            }
          }, ((i-page)-1)*-100); 
        }
       
      }
    },
    
    click_postit1(){
      this.$swal({
          title: '감사합니다',
          html: '운영자가 추가할 학교 홈페이지의 접속을 해야합니다.<br> 신청자의 학교 계정 정보를 필요로 합니다.<br> 가능하시면 카카오톡 @ooo으로 문의 바랍니다.'
          })
    },
    click_postit2(){
        const { value: 오류문의 } = this.$swal({
          title: '오류 문의',
          inputValue:this.오류문의,
          showCancelButton: true,
          input: 'textarea',
          confirmButtonText: '문의',
          cancelButtonText: `취소`,
          }).then((result) => {
          if (result.isConfirmed) {
            this.$swal('감사합니다!!', '오류 검토와 해결 진행 상황을 메일로 안내드리겠습니다.', 'success')
            axios({	url: "/api/ErrorReport",method: "POST",	data: {	context:  result.value} })
          } 
        })
    },
    
  }//meth
}//ex
</script>


<style scoped>
.로딩{
  position: relative;
  top: 30%;
  display:none;
  font-family: 'memenu';
  font-size: 25px;
  
}
.body{
  height:100%;
  overflow: hidden;
  position: absolute;
}
.bookmark {
  display: inline-block;
  padding: 20px;
  padding-left: 75px;
  background-color: green;
  position: absolute;
  top: 10px;
  right:0;
  box-shadow: 0 4px 2px -2px gray;
  cursor: pointer;
}  
.bookmark span{
  position:absolute;
  left:20%;
  top:30%
}
.bookmark:before{
  content: "";
  height: 0;
  width: 0;
  border-width: 20px 0 20px  10px;
  border-style: solid;
  position: absolute;
  left: 0;
  top: 0;
  border-color: transparent transparent transparent #FCFFE7;
}
.book{
  top: 460px;
  position: relative;
  height: 460px;
  width: 600px;
  left:-20px;
  margin:0 auto;
  transform-style: preserve-3d;
  transform: perspective(1500px);
  transition: 0.8s;
  display: flex;
  transform: rotateY(-3deg);
	box-shadow: inset 300px 0 50px rgba(0,0,0,.5), 20px 0 60px rgba(0,0,0,.5);
}
.front{
  position: absolute;
  height: 100%;
  width: 100%;
  z-index:100;
  transition: .6s;
  transform-origin: top;
  border-left:1px #000 solid;
  border-bottom:1px #2A5948 solid;
}
.front_title{
  font-family:memenu;
  font-size: 50px;
  color: #FFF;
  text-shadow: -1px 0 #000, 0 1px #000, 1px 0 #000, 0 -1px #000;
   line-height:90%; 
}
.tt{
  position:absolute;
  top: 10%;
  left: 23%;
}
.tt2{
  
  position:absolute;
  top: 13%;
  left: 45%;
}
.tt3{
  
  position:absolute;
  top: 9%;
  left: 65%;
}
.front_h3{
  position:relative;
  top: 86%;
  background: rgba(162,155,254,0.5);
  line-height: 30px;
  color: #2d3436;
  
}
.front_img{
  position: absolute;
  height: 600px;
  width: 460px;
  top: -70px;
  left:69px;
  line-height:300%; 
  background: url(../assets/backg.jpg) 10%;
  background-size: 500px;
  transform: rotate(90deg);
  border-left:1px #000 solid;
  border-bottom:1px #2A5948 solid;
}
.신저{
  position: absolute;
   line-height:10%; 
   left:3px;
}
p:first-letter {  
        font-size: 60px;  
        color:#2d3436;
        text-shadow: -1px 0 #FFF, 0 1px #FFF, 1px 0 #FFF, 0 -1px #FFF;
    }  
.front_back{
  position: absolute;
  height: 100%;
  width: 100%;
  background: url(../assets/backg.jpg) 40%;
  z-index:90;
  display: flex;
  transition: .6s;
  transform-origin: top;
}
.front_back_center{
  margin: auto;
  height: 97%;
  width: 95%;
  background: #A98B59;
}
.paper_dumy{
  height: 100%;
  width: 100%;
  background: #FCFFE7;
}
.paper_dumy:before{
	content:'';
	position: absolute;
	top: 100%;
	left: 10px;
	width: 100%;
	height: 10px;
	background: #92A29C;
	transform-origin: bottom;
	transform: skewX(45deg);
}
.paper_dumy:after {
	content: '';
	position: absolute;
	top: 0;
	right: -10px;
	width: 10px;
	height: 100%;
	background: #BAC1BA;
	transform-origin: left;
	transform: skewY(45deg);
}
.paper{
  position: absolute;
  height: 100%;
  width: 100%;
  background: #FCFFE7;
  z-index:85;
  transition: .6s;
  transform-origin: top;
  border:1px gray solid;
}
.reverse{
  position: absolute;
  height: 100%;
  width: 100%;
  border:1px gray solid;
	transform: rotateX(180deg);
  
}
.chosen-value,
.value-list {
  position: relative;
  width: 300px;
  text-align: center;
  margin: 0 auto;
}
.chosen-value:focus,
.value-list :focus{
  transform: translate(0px, 0px) scale(100%);
}
.chosen-value {
  font-family: "Ek Mukta";
  text-transform: uppercase;
  font-weight: 600;
  letter-spacing: 4px;
  height: 2rem;
  font-size: 1.1rem;
  padding: 1rem;
  background-color: #FAFCFD;
  border: 3px solid transparent;
  transition: 0.3s ease-in-out;
  box-shadow: 0px 5px 8px 0px rgba(0, 0, 0, 0.2);
  transform: translate(0px, 100px) scale(140%);
}
.chosen-value::-webkit-input-placeholder {
  color: #333;
}
.chosen-value:hover {
  background-color: #4E944F;
  cursor: pointer;
}
.chosen-value:hover::-webkit-input-placeholder {
  color: #333;
}
.chosen-value:focus, .chosen-value.open {
  box-shadow: 0px 5px 8px 0px rgba(0, 0, 0, 0.2);
  outline: 0;
  background-color: #4E944F;
  color: #000;
}
.chosen-value:focus::-webkit-input-placeholder, .chosen-value.open::-webkit-input-placeholder {
  color: #000;
}

.value-list {
  list-style: none;
  margin-top: 1rem;
  box-shadow: 0px 5px 8px 0px rgba(0, 0, 0, 0.2);
  overflow: hidden;
  max-height: 0;
  transition: 0.3s ease-in-out;
  margin: 0 auto;
}
.value-list.open {
  max-height: 300px;
  overflow-y: auto;
  margin-top: 0rem;
}
.value-list li {
  position: relative;
  top: 30%;
  height: 2rem;
  width: 320px;
  left: -40px;
  background-color: #FAFCFD;
  padding: 0.7rem;
  font-size: 1.3rem;
  display: flex;
  align-items: center;
  cursor: pointer;
  transition: background-color 0.3s;
  opacity: 1;
}
.value-list li:hover {
  background-color: #83BD75;
}
.value-list li.closed {
  max-height: 0;
  overflow: hidden;
  padding: 0;
  opacity: 0;
}
h1 {
  position: relative;
  left: -25px;
  white-space:nowrap; 
  margin-top: 10vh;
  font-size: 3.8rem;
  max-width: 500px;
  letter-spacing: 3px;
  line-height: 1.5;
  font-family: 'HS-Regular';
  text-transform: capitalize;
  font-weight: 400;
  color: #111;
  margin: 0 auto;
}
span {
    text-align: center;
    color: #83BD75;
    font-family: 'HS-Regular';
    }
    
.input-box{
  position:relative; margin:10px 0;width: 60%; margin:0 auto; top:-30px;
  
}
.input-box > input{
  background:transparent; border:none; border-bottom: solid 1px #ccc; padding:20px 0px 5px 0px; font-size:14pt; width:100%;
  
}
.input-box > input::placeholder{
  color:transparent; 
  
}
.input-box > input:placeholder-shown +  label{
  color:#aaa; font-size:20pt; top:10px; 
  
}
.input-box > input:focus + label, .input-box > label{
  color:#8aa1a1; 
  font-size:15pt; pointer-events: none;
  position: absolute; left:0px; top:-10px; 
  transition: all 0.2s ease ;
  -webkit-transition: all 0.2s ease; 
  -moz-transition: all 0.2s ease; -o-transition:
  all 0.2s ease; 
  
}
.input-box > input:focus, .input-box > input:not(
:placeholder-shown){ 
  border-bottom: solid 1px #8aa1a1; 
outline:none; 
  
}
.arrow { position: absolute; cursor:pointer;  height:100px; width:100px; }
.arrow::after { position: absolute; left: 20px; top: 5; content: ''; width: 20px;  height: 20px; border-top: 6px solid #000; border-right: 6px solid #000;  transform: rotate(225deg); }

.btn_next, .login_btn{
  position: absolute;
  bottom:5%;
  left:25%;
    min-width: 300px;
    min-height: 70px;
    font-size: 20px;
    padding: 15px 30px;
    border-radius: 15px;
    font-family: "paybooc-Light", sans-serif;
    box-shadow: 0 15px 35px rgba(0, 0, 0, 0.2);
    text-decoration: none;
    font-weight: 600;
    transition: 0.25s;
  border: 3px solid #77af9c;
    color: #222;
    background: #FFF;
}
.login_btn{
  position: relative;
  top: 53%;
  left:0;
}
.btn_next[disabled],.login_btn[disabled]{
  opacity: 0.4;
  cursor: default;
  pointer-events: none;
}
.btn_next:hover ,.login_btn:hover {
    background-color: #77af9c;
    color: #d7fff1;
}
.login_btn:hover::after {
    content: "";
    width: 30px;
    height: 30px;
    border-radius: 100%;
    border: 6px solid #00ffcb;
    position: absolute;
    z-index: -1;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    animation: ring 1.5s infinite;
}

@keyframes ring {
    0% {
        width: 30px;
        height: 30px;
        opacity: 1;
    }
    100% {
        width: 300px;
        height: 300px;
        opacity: 0;
    }
}
#page_7{
    display:none;
   animation: swap_ani 0.3s 100;
}
@keyframes swap_ani{
  0%{opacity: 1;transform:rotateX(0deg);}
  99%{transform:rotateX(170deg);opacity: 1;}
  100%{opacity: 0;transform:rotateX(0deg);}
}

.postit {
    position: relative;
    display: inline-block;
    padding: 20px 45px 20px 15px;
    margin: 5px 0;
    width: 250px;
    border: 1px solid #f8f861;
    border-left: 30px solid #f8f861;
    border-bottom-right-radius: 60px 10px;
    font-family: 'rlfhrwkd';
    font-size: 23px;
    line-height:0.8;
    color: #222;
    word-break: break-all;
    background: #ffff88;
    transition: all 0.2s;
    -webkit-transition: all 0.2s;
    height: 70px;
}
#postit2{
  background:#ff84c9;
    border: 1px solid #f690c4;
    border-left: 30px solid #f569c4;
}
.postit::after {
    content: " ";
    position: absolute;
    z-index: -1;
    right: 0;
    bottom: 35px;
    width: 150px;
    height: 30px;
    background-color: rgba(0, 0, 0, 0);
    box-shadow: 2px 35px 5px rgba(0, 0, 0, 0.4);
    -webkit-box-shadow: 2px 35px 5px rgba(0, 0, 0, 0.4);
    transform: matrix(-1, -0.1, 0, 1, 0, 0);
    -webkit-transform: matrix(-1, -0.1, 0, 1, 0, 0);
    -moz-transform: matrix(-1, -0.1, 0, 1, 0, 0);
    -ms-transform: matrix(-1, -0.1, 0, 1, 0, 0);
    -o-transform: matrix(-1, -0.1, 0, 1, 0, 0);
    transition: all 0.2s;
    -webkit-transition: all 0.2s;
}
.postit:hover {
    border-bottom-right-radius: 75px 30px;
}
.postit:hover::after {
    box-shadow: 2px 37px 7px rgba(0, 0, 0, 0.37);
    -webkit-box-shadow: 2px 37px 7px rgba(0, 0, 0, 0.37);
}

</style>