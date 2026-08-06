<template> 
  <div id='app' class="gcal">
    <h2 style='text-align:left;margin:0'>제출 마감일 달력</h2><hr>
    <table id="calendar" align="center">
      <tr><!-- label은 마우스로 클릭을 편하게 해줌 -->
          <td @click="prevCalendar"><b>&lt</b></td>
          <td align="center" id="tbCalendarYM" colspan="5">
          </td>
          <td @click="nextCalendar"><b>&gt</b></td>
      </tr>
      <tr>
          <td align="center" style="color: #FF6A89; "><b>일</b></td>
          <td align="center" ><b>월</b></td>
          <td align="center" ><b>화</b></td>
          <td align="center" ><b>수</b></td>
          <td align="center" ><b>목</b></td>
          <td align="center" ><b>금</b></td>
          <td align="center" style="color: #00CDFF; "><b>토</b></td>
      </tr>
    </table>
    <hr>
    
   <span class='세부정보' style='float: left;font-size:30px;fontWeight:bold;'>{{sel_day}}</span> <br>
      <br>
       
  <div v-for="item in 선택한거" style="text-align:left;">
       <span  v-show='count()'> <hr style="border: dotted 1px #CCC;'">
         &nbsp;<h3 style='display: inline;position: relative; left:-10px' class='big_i'>&nbsp;{{item.수업}}</h3>  <h5 style='display: inline;position: relative; left:-10px'>{{item.교수}}</h5> <br>
       </span>
     <div style='position: relative; left:10px'>
       <h4  style='display: inline;'>{{item.과제이름}}</h4><br> <b style='color: #FF8200'>&nbsp;┖제출시간: </b>{{item.제출일}}
     </div>
  </div>
    
    <ul v-if="선택한거[0] === undefined">이 날은 과제가 없습니다!</ul>
        
  </div>
</template>

<script>
  import dayjs from 'dayjs';
  export default {
      name: 'Params',
      data(){
          return {
            today:null, date:null,과제개수:[],sel_day:null,선택한거:[],카운트:[],c:0,마지막선택:null,
          }
        },
      mounted() {
        this.sel_day = dayjs().format("YYYY-MM-DD")
        this.today = new Date();
        this.date = new Date();
        
        if(localStorage.getItem('crow_data') ===null ){
          this.$router.push({ name: 'glist'});
          this.$swal( '우선 과제를 불러와주세요!','',  'warning');
          return;
        }
        var 데이터= JSON.parse(localStorage.getItem('crow_data'));
        
        데이터.forEach(item1 => {
                
                item1.과제.forEach(item2=>{
                  if(item2.제출여부===0){
                    var 날짜 = dayjs(item2.제출일, "YYYY-MM-DD HH:mm").format("YYYY-MM-DD")
                    if(this.과제개수[날짜] === undefined) this.과제개수[날짜]=''
                    this.과제개수[날짜]+= JSON.stringify( {"수업":item1.수업,"교수":item1.교수,"과제이름":item2.과제이름,"제출일":item2.제출일} )+'/##/';
                  }
                });
            });
            
        this.buildCalendar();
        
        //클릭 오늘
          this.c=0;
          this.선택한거=[];
          this.카운트=[];
          var 날 = dayjs().format("YYYY-MM-DD")
          this.sel_day = 날;
          
          if(this.과제개수[날]===undefined) return;
          
          var 데이터= this.과제개수[날].substr(0, this.과제개수[날].length-4);
          
          데이터.split('/##/').forEach(item1 => {
            this.선택한거.push( JSON.parse( item1))
          });
      
          
      },
      methods:{
        
        count() {
          var key = this.선택한거[this.c].수업+this.선택한거[this.c].교수
          this.c++;
          if(this.카운트[key]===undefined){
            this.카운트[key] = 0;
        	  return 1;
          }else{
            return 0;
          }
        },
        ck(e){
          this.c=0;
          this.선택한거=[];
          this.카운트=[];
          var 날 = e.target.className;
          this.sel_day = 날;
          var a=document.querySelectorAll('td');
          a.forEach(item=>{
            if(item.className===this.마지막선택)
              item.style.background=''
            if(item.className===날)
              item.style.background='#D2D2FF'
          })
          this.마지막선택 = 날;
          if(this.과제개수[날]===undefined) return;
          
          var 데이터= this.과제개수[날].substr(0, this.과제개수[날].length-4);
          데이터.split('/##/').forEach(item1 => {
            this.선택한거.push( JSON.parse( item1))
          });
          
        },
        prevCalendar() {//이전 달
          this.today = new Date(this.today.getFullYear(), this.today.getMonth() - 1, this.today.getDate());
          this.buildCalendar();
        },
        nextCalendar() {//다음 달
           this.today = new Date(this.today.getFullYear(), this.today.getMonth() + 1, this.today.getDate());
           this.buildCalendar();
        },
        buildCalendar(){//현재 달 달력 만들기
            var doMonth = new Date(this.today.getFullYear(),this.today.getMonth(),1);
            var lastDate = new Date(this.today.getFullYear(),this.today.getMonth()+1,0);
            var tbCalendar = document.getElementById("calendar");
            var tbCalendarYM = document.getElementById("tbCalendarYM");
            tbCalendarYM.innerHTML = '<b>'+this.today.getFullYear() + "년 " + (this.today.getMonth() + 1) + "월 </b>"; 
 
             /*while은 이번달이 끝나면 다음달로 넘겨주는 역할*/
            while (tbCalendar.rows.length > 2) {
                  tbCalendar.deleteRow(tbCalendar.rows.length-1);
             }
             var row = null;
             row = tbCalendar.insertRow();
             var cnt = 0;// count, 셀의 갯수를 세어주는 역할
             
            // 1일이 시작되는 칸을 맞추어 줌
             for (i=0; i<doMonth.getDay(); i++) {
                  var cell = row.insertCell();
                  cnt = cnt + 1;
             }
            /*달력 출력*/
             for (var i=1; i<=lastDate.getDate(); i++) { 
             
              cell = row.insertCell();
              cell.style.height = '60px'
              var 년월일 = doMonth.toISOString().split('-')[0]+'-'+('00' + (this.today.getMonth()+1)).slice(-2)+'-'+('00' + i).slice(-2);
              cell.className = 년월일;
             
              cell.addEventListener('click', this.ck);
              
              cell.innerHTML = '<b style="position: relative;top:-15px" class="'+년월일+'">'+i+'</b>';
              
              if(this.과제개수[년월일]!=null&&this.과제개수[년월일].split('/##/').length!==0) {
                cell.innerHTML='<b class="'+년월일+'">'+i+'</b>'+'<br><span style="position: relative;font-size:5px;" class="'+년월일+'">남은과제: </span> <b style="font-size: 15px; color:#FF3232" class="'+년월일+'">' +(this.과제개수[년월일].split('/##/').length-1).toString()+'</b>';
                cell.style.boxShadow='1px 1px 2px 1px #FF8200'
              }
              cnt = cnt + 1;
              
              if (cnt % 7 == 1) {/*일요일 계산*/
                cell.style.color='#F79DC2';
              }    
              if (cnt%7 == 0){/* 1주일이 7일 이므로 토요일 구하기*/
                  cell.style.color='skyblue';
                   row = tbCalendar.insertRow();
              }
              /*오늘의 날짜에 노란색 칠하기*/
              if (this.today.getFullYear() == this.date.getFullYear()
                 && this.today.getMonth() == this.date.getMonth()
                 && i == this.date.getDate()) {
                  //달력에 있는 년,달과 내 컴퓨터의 로컬 년,달이 같고, 일이 오늘의 일과 같으면
                cell.bgColor = "#FAF58C";//셀의 배경색을 노랑으로 
                cell.style.borderWidth='2px'
                cell.style.boxShadow='1px 1px 3px 1px #666'
               }
             }
        }
      },
  }
  
  


</script>

<style>
table{
  -webkit-user-select:none;
  -moz-user-select:none;
  -ms-user-select:none;
  user-select:none;
}
#calendar td{
    cursor:pointer;
    width: 80px;
    height: 50;
    text-align: center;
    font-size: 20px;
    border-radius: 8px;/*모서리 둥글게*/
}
</style>