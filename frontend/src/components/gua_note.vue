<template> 
  <div id='app' class="gnote">
    <span class='note_title'><b>{{cls}}</b></span>
        <table width="100%">
        <th style='text-align:left'>번호</th>  <th >내용</th>   <th style='text-align:right;right:20px;'>작성시간</th></table>
        <hr style='width: 100%'>
        
        <table>
          <tr>
            <td><select v-model="sel_tag"  style="width:410px;height:25px;float:left"><option value=''>태그 전체</option><option v-for="option in options">{{ option }}</option></select></td>
            <td><select @change='viewCnt()' v-model="sel_cnt"  style="width:80px;height:25px;float:left"><option v-for="option in options2">{{ option }}</option></select></td>
          </tr>
        </table>
    <table id='note_back' style=" border-collapse: collapse;">
        <colgroup>

            <col width="10%" />
            <col width="76%" />
            <col width="18%" />
          </colgroup>
          <tr v-for="item in 게시글들"  @click='post_view(item.번호)' class='itmes' style='position:relative;height:50px;border: 1px;' v-if="sel_tag===''||sel_tag===item.태그">
              <td><span style='position: relative; top:2px;'>{{item.번호}}</span></td>
              <td style="text-align: left;">
                <span class="제목" style='font-size:6px'>[{{item.태그}}]</span><br><span style='font-size:15px'>{{item.제목}}</span>
                <b> <span style='color:#FFC5D0;'> [</span><span style='color:#FF7E9D;'>{{item.댓글}}</span><span style='color:#FFC5D0;'>]</span></b>
              </td> 
              <td>{{날짜[item.번호]}}</td>
          </tr>
          
        </table><br>
    <div v-if="Math.ceil(cnt/page_content_cnt) <= 10">
          <a v-for="i in Math.ceil(cnt/page_content_cnt)" @click='go_page(i)' style='margin:4px'><b v-if='i+""===page+""' class='nowPage'>{{i}}</b><span v-else>{{i}}</span></a>
    </div>
    <div v-else>
          <a @click='pre()'>◁ </a>
          <a v-if="Math.ceil(cnt/page_content_cnt) >= (big_page+1)*10">
            <a v-for="i in 10" @click='go_page(i)' style='margin:4px'> <b v-if='i+""===page+""' class='nowPage'>{{i}}</b><span v-else>{{i}}</span></a>
          </a>
          <a v-else>
            <a v-for="i in Math.ceil(cnt/page_content_cnt)-big_page*10" @click='go_page(i+big_page*10)' style='margin:4px'>
              <b v-if='i+big_page*10+""===page+""' class='nowPage'>{{i+big_page*10}}</b><span v-else>{{i+big_page*10}}</span>
            </a>
          </a>
          <a @click="next()">▷</a>
    </div>
    <hr style='width: 100%'>
     <table width="100%" >
      <td style="position:relative;float:left;text-align:left;">
        <select v-model="search_type"  style="width:80px;height:25px"><option>제목</option><option>내용</option><option>제목+내용</option></select>
        <input style="width:280px;height:19px" type="text" />
        <button style="position:relative;top:1px" @click="search">검색</button><br>
      </td>
      
      <td  style="position:relative;float:right">
        <button @click='post' class='기록하기'>글쓰기</button> <br> <br>
      </td>
    </table>
    
  </div>
</template>
<script>
    import axios from 'axios';
    import dayjs from "dayjs";
    
    export default {
        name: 'Params',
        data(){ 
           return{ cls: null, prof:null, link_id:null,univ_cookie:null,univ_name:null,univ_id:null,sel_tag:'',search_type:'제목',page_content_cnt:2,sel_cnt:'10개',ccnt:10,
                  게시글들:null,날짜:[],page:1,cnt:null,big_page:0,options:['수다','혼잣말'],options2:['10개','20개','30개'],
             
           }
        },
        watch: {
          '$route' (to, from) {
          if(to.name==='gnote')
            this.mont();
          }
        },
        mounted(){
          this.mont();
        },
        methods:{
          pre(){
            if(this.big_page!==0) this.big_page--;
          },
          next(){
            if(Math.ceil(this.cnt/this.page_content_cnt) > (this.big_page+1)*10) this.big_page++;
          },
          go_page(p){
              this.$router.push({ name: 'gnote' ,  query: {cls: this.cls, prof: this.prof,link_id:this.link_id,page:p} });
          },
          post(){
              this.$router.push({ name: 'gnote_post' ,  query: {cls: this.cls, prof:this.prof, link_id:this.link_id,} });
          },
          post_view(num){
             this.$router.push({ name: 'gnote_view' ,  query: {cls: this.cls, prof:this.prof, link_id:this.link_id, post_num:num} });
          },
          viewCnt(){
            this.ccnt=this.sel_cnt.replace('개','')*1;
            this.mont()
          },
          mont(){
            this.cls= this.$route.query.cls;
            this.prof= this.$route.query.prof;
            this.link_id= this.$route.query.link_id;
            this.page = this.$route.query.page;
            this.univ_cookie = localStorage.getItem('univ_cookie');
            this.univ_name = localStorage.getItem('univ_name');
            this.univ_id = localStorage.getItem('univ_id');
            this.page_content_cnt = this.ccnt;
            axios({	url: "/api/getposts",method: "POST",		data: {	cookie:  this.univ_cookie, univ: this.univ_name, r_id: this.univ_id,  link_id:this.link_id, page:this.page, cnt:this.ccnt} })
            .then(res => {
              if(res.data.r_data==='relogin'){this.$relogin(); return;};
              if(res.data.r_data==='fail_notper'){ this.$swal( '데이터조작?','이 기록장은 볼 수 없어요!',  'error').then((result) => {this.$router.push({ name: 'glist'}); return;}); }
              if(res.data.r_data==='relogin'){ this.$relogin(); return};
              this.게시글들 = JSON.parse(res.data.r_data)
              this.cnt = res.data.r_cnt;
             let 오늘= dayjs().format("YYYY-MM-DD HH:mm:ss");
              this.게시글들.forEach(item => {
                let 템날짜 =  dayjs(item.작성일, "YYYY-MM-DD HH:mm:ss");
                let 오늘2= dayjs()
                템날짜.format("YYYY-MM-DD HH:mm:ss")
                if(템날짜.diff(오늘, "d")===0 && 오늘2.get("D") === 템날짜.get("D")) this.날짜[item.번호] = 템날짜.format("HH:mm");
                else this.날짜[item.번호] = 템날짜.format("YYYY-MM-DD").substr(1).substr(1);
              })
          });
          
          let lists = JSON.parse(localStorage.getItem('crow_data'));
          for(var i = 0; i< lists.length;i++){
            if(lists[i].링크===this.link_id){
              let 과제 = lists[i].과제;
                과제.forEach((item)=>{
                  this.options.push('과제: '+item.과제이름);
                })
              
            }
          }
          }
        },
    }
    
</script>
        

<style scoped>
.itmes:hover{
  background:#D2D2FF;
}
#note_back{
  height:600px; 
  width: 500px;
  border-collapse: collapse;
  overflow-y:scroll;
  overflow-x:hidden;
  display: block;
}
#note_back::-webkit-scrollbar {
    width: 8px; /*스크롤바의 너비*/
    border-radius: 15px;    
  }
#note_back::-webkit-scrollbar-thumb {
    background-color: #2f3542;
    border-radius: 15px;
  }
#note_back::-webkit-scrollbar-thumb {
    background-color: black; /*스크롤바의 색상*/
}
#note_back::-webkit-scrollbar-track {
    background-color: #eee; /*스크롤바 트랙 색상*/
    border-radius: 15px;
}
a{
  cursor:pointer;
  -webkit-user-select:none;
  -moz-user-select:none;
  -ms-user-select:none;
  user-select:none;
}
.nowPage{
  color:#C964E2;
  padding:4px 4px 2px 3px;
  margin:0px;
  border: 1px solid rgb(163, 151, 198);
  border-radius: 25%;
}
.제목{
 
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  width:40%;
  display:  inline-block;
}
.기록하기{
  float: left;
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
}.기록하기:hover:not([disabled]){background:#64AAFF;transform: scale(1.2)}

</style>