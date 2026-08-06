<template>
  <div id="app" class="gback" style="text-align:left;">
    
   <tbody>
    <tr>
      <td  width='100%' style='position:relative;top:-7px'><b style='font-size:28px'>{{univ_name}}</b>&ensp;{{depart}} </td>
      <td>
          <button id='과제갱신' class='과제갱신' @click ='crowing'>과제 새로고침: <b>{{크롤링가능시간()}}</b></button>
           <button id='과제갱신중' class='과제갱신' disabled style='display:none'>과제 불러오는중..</button></td>
      <td><div class="line-btn" @click ='myPage'>
          <div class="line"></div>
          <div class="line"></div>
          <div class="line"></div>
        </div></td>
    </tr>
      </tbody>
    <div v-if="crowdata !== null" class='main_paper'>
          <span style='font-size:15px;position:relative;'>&nbsp;<b>과제 해결:</b> {{총한과제}} / {{총과제}}</span>
        <div class="graph" v-if='총과제===0'><span class="graph_in" :style="customStyle" style>과제가 없습니다!</span></div>
        <div class="graph" v-else><span class="graph_in" :style="customStyle" style>{{과제퍼센트}}</span></div>
      <br>
      <label for="checked_1" style="cursor:pointer; zoom: 1.2;font-weight:bold;font-size:14px"><input type="checkbox" v-model="checked_one" id="checked_1"> 제출한 과제 숨기기</label> &nbsp;
      <label for="checked_2" style="cursor:pointer; zoom: 1.2;font-weight:bold;font-size:14px"><input type="checkbox" v-model="checked_two" id="checked_2"> 제출일 지난 과제 숨기기</label> &nbsp;
      <button class='allBtn' @click='allBtn'>{{selectAll}}</button>
      
      <div style='height:10px'></div>
      
      <div id='gua_back'>
        <div class='big_style' v-for="(group, 수업) in crowdata"  >
          <a class='big_i' @click="click_i(group.수업)" v-bind:id="'큰칸'+group.수업" v-bind:name="group.링크">
            <table><tr><td width="90%" >
            <h4 style='display: inline;' v-bind:id="'수업'+group.수업" class='cr'>{{group.수업}}</h4>&nbsp;
            <h4 style='display: inline; font-size:13px'>{{group.교수}}</h4> 
            <h3 style='display: inline;color: #5EC75E; font-size:16px' v-if="과제개수[group.수업]===0"> Nothing</h3>
            <h3 style='display: inline;color: #3CB4FF; font-size:16px' v-else-if="제출한과제개수[group.수업]===과제개수[group.수업]"> Clear!![{{과제개수[group.수업]}}]</h3>
            <h3 style='display: inline;color: #E56D29; font-size:16px' v-else> [{{제출한과제개수[group.수업]}}/{{과제개수[group.수업]}}] </h3>{{필터링개수[group.수업]}}
            </td><td width="10%">
            <button style='float:right;' @click ='comunity(group.수업,group.교수,group.링크)' class='기록장'><span class='기록장글씨'>기록장</span></button></td></tr></table>
          </a>
          
            <ul v-show="i_open[group.수업]">
              <li class='small_i' v-for="item in group.과제" v-show='(!checked_one||(!item.제출여부 && checked_one))&&(!checked_two||!지남[group.수업+item.과제이름])'>
                <h3 style='display: inline;font-size:15px'>{{item.과제이름}} > </h3>    
                <h4 style='display: inline;color: #3CB4FF' v-if=item.제출여부>제출 완료</h4>   
                <h4 style='display: inline;color: #FF8200' v-else>미제출</h4> 
                <span class='사이트이동' @click='사이트이동(item.과제링크)' >과제 사이트</span>
                <br><span style='font-size:13px'>제출 마감일: {{item.제출일}}</span><br>
                <div v-if=!item.제출여부 v-html="difTime(group.수업+item.과제이름)"></div>
              </li>
            </ul>
            
            
        </div>
      </div>
        
    </div>
    <div v-if='nodata' style='position:relative;text-align:center;top:20%;font-family: memenu; font-size:35px'> 수강하는 수업이 없나봐요! <br><br> 만약 수강하는 수업이 있으면<br> 재 로그인 후에도 안되면<br> 로그아웃 후 로그인화면에서 오류문의 부탁드립니다!</div>
  </div>
  <label for="checked_3" style="cursor:pointer;font-weight:bold;float:left" checked><input type="checkbox" v-model="checked_th" id="checked_3"> 1시간마다 과제 새로고침</label>
  <br>
  <span id ='version'>V0.10.22-beta</span>
  <button class='로그아웃' @click ='logout_btn'>로그아웃</button> 
</template>

<script>
     
    import axios from 'axios';
    import dayjs from 'dayjs';
    export default {
        name: 'Params',
        data(){
            return{ univ_id: null,crowdata: null ,univ_cookie: null,univ_name:null,i_open: [],과제개수:[],제출한과제개수:[],남은기간:[],지남:[], 총과제:null,총한과제:null,과제퍼센트:null,첫접속:0,마지막크롤링:null
              ,checked_one:0,checked_two:0, today: dayjs().format("YYYY-MM-DD HH:mm:ss"),timer: '',필터링개수:[],checked_th:true,크롤링방지:0,과제이동:0,re_id:'',re_pw:'',selectAll:'모두 펼치기'
              ,nodata:0,depart:null
            }
            
          },
        async mounted() {
            this.크롤링방지=0;
              var btn = document.querySelector('#과제갱신');
              var btn2 = document.querySelector('#과제갱신중');
              btn.style.display = 'block';
              btn2.style.display = 'none';
            document.querySelector('#menu').style.display=''
            document.querySelector('.routeCon').style.background=''
            if(localStorage.getItem('univ_cookie') !== null && localStorage.getItem('univ_name') !== null && localStorage.getItem('univ_id') !== null ){
              this.univ_cookie = localStorage.getItem('univ_cookie');
              this.univ_name = localStorage.getItem('univ_name');
              this.univ_id = localStorage.getItem('univ_id');
              this.depart = localStorage.getItem('r_depart');
            }
            if(localStorage.getItem('crow_data')===null && localStorage.getItem('univ_cookie')===null){
              try {
                const mockResponse = await axios.get('/mock/course-assignments.json');
                localStorage.setItem('crow_data', JSON.stringify(mockResponse.data));
                localStorage.setItem('univ_name', 'Guamegi 데모 대학교');
                localStorage.setItem('r_depart', '소프트웨어학과');
                localStorage.setItem('r_time', dayjs().format('YYYY-MM-DD HH:mm:ss'));
                this.univ_name = localStorage.getItem('univ_name');
                this.depart = localStorage.getItem('r_depart');
              } catch (error) {
                console.error('목업 과제 데이터를 불러오지 못했습니다.', error);
              }
            }
            if(localStorage.getItem('crow_data')!==null){
              this.crowdata = JSON.parse(localStorage.getItem('crow_data'));
              this.crowdataPre();
            }
            
          if( this.$route.params.auto_login === '1'){  //오토 로그인으로 크롤링데이터 이어 쓸때
            this.get_cookie(1);
          }
          else if(localStorage.getItem('reload')==1){this.crowing();localStorage.setItem('reload',0);} //로그인 했을때 리롤시키기
          
          
          this.마지막크롤링=localStorage.getItem('r_time');
          this.timer = setInterval(() => {
            this.today = dayjs().format("YYYY-MM-DD HH:mm:ss");
            
          }, 1000)
        },
        computed: {
          customStyle () {
            return {
              '--withh': this.과제퍼센트// testColor 는 예시 변수명
            }
          },
        },
        methods:{
          myPage(){
              this.$router.push({ name: 'gmy'  });
          },
          사이트이동(링크){
              if(!링크)this.$swal('앗🙏','사이트 이동을 지원하지 않는 학교에요 ㅠ_ㅠ');
            		axios({	url: "/api/getSession",method: "POST",		data: {	cookie:  this.univ_cookie , r_univ: this.univ_name} })
                  .then(res => {				// back 서버로부터 응답받으면
                    if(res.data.r_data==='fail'){this.$swal( '세션만료!','학교 사이트와 연결이 끊어졌어요.<br> 다시 로그인 할게요!',  'warning');this.get_cookie(1); return};
                    if(res.data.r_data==='fail_list'){this.$swal('수강하는 수업이 없나요?<br> 있으면 오류문의를 해주세요!');};
                    if(res.data.r_data==='fail_univ'){this.$relogin(); return};
                    if(res.data.r_data==='sucsess'){
                      if(this.과제이동 === 0){
                        var link =window.localStorage.getItem('loginLink');
                        var tab = window.open(link)
                        setTimeout(() => {tab.location.replace(링크);},300);
                      }
                      else{
                        window.open(링크);
                      }
                    }
                  })
          },
          comunity(cls,prof,link_id){
              this.$router.push({ name: 'gnote' ,  query: {cls: cls, prof: prof,link_id:link_id,page:'1'} });
          },
          크롤링가능시간(){
            const date2 = dayjs(this.today,"YYYY-MM-DD HH:mm:ss");
            const date3 = dayjs(this.마지막크롤링,"YYYY-MM-DD HH:mm:ss");  //마지막크롤링
            date2.format("YYYY-MM-DD HH:mm:ss"); 
            date3.format("YYYY-MM-DD HH:mm:ss"); 
            
            if(date2.diff(date3, "d")>0 ) {if(this.checked_th===true) this.crowing(); return date2.diff(date3, "d")+'일 전'}
            if(date2.diff(date3, "h")>0 ){if(this.checked_th===true) this.crowing(); return date2.diff(date3, "h")+'시간 전' ;}
            if(date2.diff(date3, "m")>0 ) return date2.diff(date3, "m")+'분 전'
            if(date2.diff(date3, "s")>0 ) return date2.diff(date3, "s")+'초 전'
          },
          difTime(data){
            const date1 = dayjs(this.남은기간[data], "YYYY-MM-DD HH:mm:ss");
            const date2 = dayjs(this.today,"YYYY-MM-DD HH:mm:ss");
            
            date1.format("YYYY-MM-DD HH:mm:ss");
            date2.format("YYYY-MM-DD HH:mm:ss"); 
            let 일=date1.diff(date2,'d'),시=date1.diff(date2,'h')%24,분=date1.diff(date2,'m')%60,초=date1.diff(date2,'s')%60;
            if(일<0||시<0||분<0||초<0){
              this.지남[data] = 1;
              return ' <span style="color: red; font-size:13px"><b style="font-size:17px; color:#CD0000">'+Math.abs(일) +'</b>일 <b style="font-size:15px">'+Math.abs(시)+'</b>시<b style="font-size:15px">' +Math.abs(분)+'</b>분<b style="font-size:15px">' +Math.abs(초)+'</b>초 </span><b style="color:#CD0000">지났습니다</b> '; 
            }
            else{
              this.지남[data] = 0;
              return ' <span style="color: green; font-size:13px"><b style="font-size:17px;color:#006400">'+일+'</b>일 <b style="font-size:15px">'+시+'</b>시<b style="font-size:15px">' +분+'</b>분<b style="font-size:15px">' +초+'</b>초 </span><b style="color:#006400">남았습니다</b> '; 
            }
          },
          crowdataPre(){
            this.총과제=0; this.총한과제=0;
            this.crowdata.forEach(item1 => {
                this.과제개수[item1.수업] = item1.과제.length; this.총과제+= item1.과제.length;
                this.제출한과제개수[item1.수업] = 0;
                item1.과제.forEach(item2=>{
                  if(item2.제출여부===1){ this.제출한과제개수[item1.수업]++;this.총한과제++}
                  this.남은기간[item1.수업+item2.과제이름] = dayjs(item2.제출일, "YYYY-MM-DD HH:mm").format("YYYY-MM-DD HH:mm:ss");
                  
                });
            });   //수업명 옆 [ 5/10] 과제 한개수
            if(this.총과제===0){this.과제퍼센트='100%';return;}
            this.과제퍼센트 = (this.총한과제/this.총과제*100).toFixed(1)+'%';
            
          },
          click_i(name){
              this.i_open[name] = !this.i_open[name];
              let bigtar = document.getElementById('큰칸'+name);
              let btn = bigtar.getElementsByClassName('기록장')[0]
              let bigst =  bigtar.parentNode;
              let cr = bigtar.querySelector('.cr')
              if(this.i_open[name]){
                cr.style.fontSize='13px';
                bigtar.style.color = '#006633';
                bigtar.style.fontWeight= 'bold';
                bigst.style.boxShadow='0px 0px 1px 0px #000 inset'
                btn.style.display='none'
              }
              else{
                cr.style.fontSize='';
                bigtar.style.color = '';
                bigtar.style.fontWeight= '';
                bigtar.parentNode.style.boxShadow=''
                btn.style.display=''
              }
            },
          get_cookie(crow){
            
            if(localStorage.getItem('univ_id') !==null && localStorage.getItem('univ_pw') !==null && localStorage.getItem('univ_name')!==null && localStorage.getItem('auto_login')==='1'){
              
                var btn = document.querySelector('.과제갱신');
                btn.disabled = true;
              
              	axios({	url: "/api/login",method: "POST",		data: {	 univ_name: localStorage.getItem('univ_name'),	univ_id: localStorage.getItem('univ_id'),	univ_pw: localStorage.getItem('univ_pw') } })
                .then(res => {
                  
                    btn.disabled = false;
                  if(res.data.state==='로그인성공'){
                   //자동로그인
                   localStorage.setItem('univ_cookie', res.data.r_cookie)
                   this.univ_cookie = res.data.r_cookie;
                   localStorage.setItem('univ_name', res.data.r_univ)
                   localStorage.setItem('r_time', res.data.r_time)
                   localStorage.setItem('loginLink', res.data.r_loginLink)
                   this.$swal({
                      icon: 'success',
                      title: '자동 로그인 성공!',
                      toast: true,
                      position: 'top-right',
                      width:'300px',
                      customClass: {
                        popup: 'colored-toast'
                      },
                      showConfirmButton: false,
                      timer: 1500,
                      timerProgressBar: true
                    })
                   if(crow===1){
                     this.크롤링방지=0;
                     this.crowing();
                   }
                  }
                  else{
                     this.$swal( '알림',res.data.message,  'warning').then((result) => {this.logout();})
                     
                  }
                });
            }else this.$swal( '자동로그인 실패','자동 로그인 체크를 해주지 않아서 수동로그인을 해주세요',  'warning').then((result) => {this.logout();})
            
          },
          crowing(){
              if(this.크롤링방지===1) return;
              this.크롤링방지=1;
              const date2 = dayjs(this.today,"YYYY-MM-DD HH:mm:ss");
              const date3 = dayjs(this.마지막크롤링,"YYYY-MM-DD HH:mm:ss");  //마지막크롤링
              date2.format("YYYY-MM-DD HH:mm:ss"); 
              date3.format("YYYY-MM-DD HH:mm:ss"); 
              if(date2.diff(date3, "m")<3 ){this.$swal( '갱신 실패','3분마다 한번씩만 가능합니다!',  'warning');this.크롤링방지=0;return;}
              var btn = document.querySelector('#과제갱신');
              var btn2 = document.querySelector('#과제갱신중');
              btn.style.display = 'none';
              btn2.style.display = 'block';
              return new Promise(() => {
            		axios({	url: "/api/crowing",method: "POST",		data: {univ_id: this.univ_id,	cookie:  this.univ_cookie , r_univ: this.univ_name, r_id: localStorage.getItem('univ_id'), r_reload: dayjs().format("YYYY-MM-DD HH:mm:ss") } })
                  .then(res => {				// back 서버로부터 응답받으면
                    if(res.data.r_data==='fail'){ this.$swal( '세션만료!','학교 사이트와 연결이 끊어졌어요.<br> 다시 로그인 할게요!',  'warning');this.get_cookie(1);  return};
                    if(res.data.r_data==='relogin'){  this.$relogin(); return;};
                    if(res.data.r_data==='fail_univ'){ this.$swal( '데이터 오류','지원하지 않는 대학교에요.<br>목록 다시 선택해주세요',  'error').then((result) => { this.$relogin(); return}); return;};
                    if(res.data.r_data==='fail_list'){ this.$swal('수강하는 수업이 없어요','혹시 수업이 있는데 안 불러와지면 오류문의를 해주세요!','info'); localStorage.setItem('r_depart', res.data.r_depart);this.crowdata=null;this.nodata=1;localStorage.removeItem('crow_data');return;};
                    this.depart = res.data.r_depart;
                    localStorage.setItem('r_depart', res.data.r_depart);
                    localStorage.setItem('r_time', res.data.r_reload);
                    this.마지막크롤링=res.data.r_reload;
                    this.crowdata = JSON.parse(res.data.r_data).sort((a, b) => { if (a.수업 < b.수업) return -1; if (a.수업 > b.수업) return 1; return 0; }); //과제 이름순 정렬
                    localStorage.setItem('crow_data', JSON.stringify(this.crowdata));
                    this.crowdataPre();
                    btn.style.display = 'block';
                    btn2.style.display = 'none';
                    this.크롤링방지=0
                    
                    this.$swal({
                      icon: 'success',
                      title: '과제를 불러왔습니다!',
                      toast: true,
                      position: 'top-right',
                      width:'300px',
                      customClass: {
                        popup: 'colored-toast'
                      },
                      showConfirmButton: false,
                      timer: 1500,
                      timerProgressBar: true
                    })
                  })
              });
            },
          logout_btn(){
            this.$swal({
              title: '로그아웃 하시겠습니까?',
              icon: 'question',
              showCancelButton: true,
              confirmButtonColor: '#d33',
              cancelButtonColor: '#303936',
              confirmButtonText: '로그아웃!',
              cancelButtonText: '취소',
            }).then((result) => {
              if (result.isConfirmed) {
                this.logout();
              }
            })
          },
          logout(){
              localStorage.clear();
              this.$router.push({ name: 'home', params:{logout:'1'}});
            },
          allBtn(){
            if(this.selectAll==='모두 펼치기'){
              this.selectAll='모두 접기'
              this.crowdata.forEach((item)=>{
                if(!this.i_open[item.수업])
                  this.click_i(item.수업)
              })
            }
            else{
              this.selectAll='모두 펼치기'
              this.crowdata.forEach((item)=>{
                if(this.i_open[item.수업])
                  this.click_i(item.수업)
              })
            }
            
          }
      }
    }
</script>

<style scoped>
table{
  transform-origin:left;
}
ul{
   position: relative;
   list-style:none;
   padding-left:0px;
   margin-top: 0px;
   margin-bottom: 0px;
   top:-14px;
   }
.과제갱신{
  float: right;
    position: relative;
    white-space: nowrap;
    top:-1px;
    left:-10px;
    padding: 3px 1px;
    border-radius: 5px;
    text-decoration: none;
    font-weight: 600;
    transition: 0.25s;
    background-color: #D2FFD2;
    color: #006400;
    border: 3px solid #4BAF4B;
}.과제갱신:hover:not([disabled]){background:#82F9B7;transform: scale(1.1)}
.과제갱신:disabled{ border: 3px solid #646464;background-color: #dcdcdc;color: #646464;}
.로그아웃{
    position: absolute;
    padding: 3px 4px;
    bottom:5px;
    right:5px;
    border-radius: 5px;
    text-decoration: none;
    font-weight: 600;
    transition: 0.25s;
    background-color: #F5A0A0;
    color: #EB0000;
    border: 3px solid #EB0000;
}
.로그아웃:hover:not([disabled]){background:#EB5A5A;transform: scale(1.11)}

.allBtn{
    position: relative;
    float:right;
    padding: 1px 2px;
    border-radius: 5px;
    text-decoration: none;
    font-weight: 600;
    transition: 0.25s;
    background-color: #FAFAD2;
    color: #FFC314;
    border: 3px solid #FFC81E;
}
.allBtn:hover:not([disabled]){background:#FFF064;transform: scale(1.13)}
.big_style{
  box-shadow: 1px 1px 3px 1px #dadce0 inset; 
  padding: 0px 5px 0px 5px; 
  background: #FEFEFE;
  margin:3px;
  border-radius:10px;
  -webkit-user-select:none;
  -moz-user-select:none;
  -ms-user-select:none;
  user-select:none;
}
.big_i{
  position: relative;
  padding: 3px 0;
  cursor: pointer;
  font-size: 18px;
  margin:0px;
}
.cr:before{
  display: inline-block;
  content: 'O';
  font-size: 23px;
  color: #006633;
  margin-right: 5px;
}

.small_i {
  font-size: 16px;
  position: relative;
  background-color: #FDFDFD;
  box-shadow: 1px 1px 3px 1px #dadce0 inset; 
  padding:5px;
  padding-left:10px;
  border-radius:10px;
  margin:5px;
  top:5px;
}
.graph{height:30px; background: #ccc; border-radius:40px;position: relative;}
.graph_in{
   display:block;
   padding: 0 10px; height:30px;
   line-height: 35px; 
   text-align: right;
   background: #B750EA;
   border-radius:40px; 
   width: var(--withh, 50%);
   transform-origin:left;
   animation: graph_ani 4s 1;
   font-size:18px;
   box-sizing:border-box
   ;color:#fff;
  
}
@keyframes graph_ani{
  0%{width: 0%;opacity: 0;}
  100%{transform: scaleX( 1);opacity: 1;}
}
.기록장{
  
    cursor: pointer;
    position:relative;
    background-image : url(../assets/note.png); 
    background-size: 70px 50px;
    background-color: transparent;
    border: 0;
    outline: 0;
    width: 65px;
    height: 50px;
    top:1px;
    font-size:18px;
}
.기록장:hover{
  font-weight: bold;
  transform: scale(1.1);
}
.기록장글씨{

    position:absolute;
    left:10px;
    top:17px;
    font-family: 'rlfhrwkd';
  
}
.사이트이동{
  box-shadow: 1px 1px 3px 1px #dadce0;
  border:2px #98FB98 dashed;
  border-radius:3px;
  float:right;
  margin:3px;
  background: #D2FFD2;
  padding: 1px 3px 1px 3px; 
  cursor:pointer;
  font-family: memenu;
  font-size:15px;
}

.line-btn:hover:not([disabled]){transform: scale(1.13)}
.line-btn {
  cursor:pointer;
  width:40px;
  height:40px;
  position:relative;
  float: right;
  
}
.line {
  background:#333;
  margin-top:6px;
  margin-bottom:6px;
  width:40px;
  height:4px; 
  border-radius:2px;
  box-shadow:0 1px 3px rgba(0,0,0,.5);
  position:relative;
}

#version{
  position: absolute;
  bottom:1px;
  left:45%;
}
#gua_back{
  overflow-y:scroll;
  overflow-x:hidden;
  max-height:600px;
  width: 100%;
  
} 
#gua_back::-webkit-scrollbar {
    width: 8px; /*스크롤바의 너비*/
    border-radius: 15px;    
  }
#gua_back::-webkit-scrollbar-thumb {
    background-color: #2f3542;
    border-radius: 15px;
  }
#gua_back::-webkit-scrollbar-thumb {
    background-color: black; /*스크롤바의 색상*/
}
#gua_back::-webkit-scrollbar-track {
    background-color: #eee; /*스크롤바 트랙 색상*/
    border-radius: 15px;
}


</style>