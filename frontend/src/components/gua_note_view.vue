<template> 
  <div  id='app' class="gnote_post">
    <span class='note_title'><b>{{cls}}</b></span>
    <div style='text-align: left'>
      
      <hr style="border:double 1px ">
      <div class='post_title' style='font-size:20px;white-space: nowrap;'><b>{{title}} </b> </div>
      <b>태그:</b> {{tag}}<br>
      <b>작성일:</b> <span>{{time}}</span> <span v-if="수정일 !==null"><h6 style="display:inline;">({{수정일}} 수정)</h6></span>
      
       <button @click='back'   class='목록으로'>목록으로</button>
      
      <hr style="color:#EEE;border-style:dotted" width="100%">
      
      <pre style="min-height:200px;white-space: pre-wrap; font-family: Avenir, Helvetica, Arial, sans-serif;">{{context}}</pre>
      
      <div><b @click="agree_btn"><span v-if='추천여부==1' style='color:#2C952C'>[</span>추천<span  v-if='추천여부==1' style='color:#2C952C'>]</span> {{추천}}</b>&emsp;
      <b @click="disagree_btn"><span v-if='추천여부==-1' style='color:#B91A4D'>[</span>비추천<span v-if='추천여부==-1' style='color:#B91A4D'>]</span> {{비추천}}</b>&emsp;<b>신고: {{신고}}</b>
      <div  v-if='writer'> <button @click='delete_post' class='삭제버튼'>삭제</button> <button  @click='edit' class='수정버튼'>수정</button> </div>
      </div>
      <hr style="border:double 1px ">
      
       <table width="100%">
        <tr> <th width="85%">댓글 {{reply_cnt}}</th>   <th width="15%">작성시간</th> </tr>
        
          <tr v-for="item in 댓글들">
            <td style="line-height:10%;"><hr style="color:#EEE;border-style:dotted;width:120%">
              <td><b>{{own_dic[item.번호]}}</b></td>
              <td style="color:#aaa">
                 <b @click='co_agree_btn(item.번호)'><span v-if='item.추천여부==1' style='color:#2C952C'>[</span>추천<span v-if='item.추천여부==1' style='color:#2C952C'>]</span> {{item.추천}} </b> &nbsp;
                 <b @click='co_disagree_btn(item.번호)'><span v-if='item.추천여부==-1' style='color:#B91A4D'> [</span>비추천<span v-if='item.추천여부==-1' style='color:#B91A4D'>]</span> {{item.비추천}} &nbsp;신고:{{item.신고}} </b>
              </td><br>
              <td> <pre style="white-space: pre-wrap;line-height:100%;font-family: Avenir, Helvetica, Arial, sans-serif;position:relative; left:5px;top:-10px;">{{item.내용}}</pre> </td><br>
            
            </td>
            <td><span style="position:relative;text-align:top">{{날짜[item.번호]}} </span></td>
            
            <div  v-if='reple_writer.includes(item.번호)' style="position:relative; float:right; top:13px"><div @click='delete_reply(item.번호)' style="color:red;">ⓧ</div></div>
            <hr style="color:#EEE;border-style:dotted;width:120%">
        </tr>
        
    </table>
      <br>
      <hr style="color:#EEE;border-style:dotted;width:120%">
      <textarea v-model="comment" placeholder="댓글 최대100자" style="width:500px;height:50px;float:left;resize: none; "></textarea><br><br>
      <button @click="write"  class='댓글버튼'>쓰기</button>
      
    </div>    
  </div>
</template>
<script>
    import axios from 'axios';
    import dayjs from 'dayjs';
    export default {
        name: 'Params',
        data(){ 
           return{ cls: null, prof:null, link_id:null,univ_cookie:null,univ_name:null,univ_id:null,reply_cnt:0,
                  title:null,tag:null,context:null,time:null,게시글:null,수정일:null,comment:null,댓글들:null,날짜:[],writer:0,reple_writer:[],추천여부:0,추천:null,비추천:null,신고:null ,post_num:null,own_dic:null
           }
        },
        mounted(){
          
          this.cls= this.$route.query.cls;
          this.prof= this.$route.query.prof;
          this.link_id= this.$route.query.link_id;
          this.post_num= this.$route.query.post_num;
          this.univ_cookie = localStorage.getItem('univ_cookie');
          this.univ_name = localStorage.getItem('univ_name');
          this.univ_id = localStorage.getItem('univ_id');
              
          axios({	url: "/api/viewpost",method: "POST",		data: {	cookie:  this.univ_cookie, univ: this.univ_name, r_id: this.univ_id,  link_id:this.link_id, post_num:this.post_num }})
          .then(res => {
              if(res.data.r_data==='relogin'){ this.$relogin(); return;};
              if(res.data.r_data==='fail_delete'){ this.$swal( '삭제된 글이에요!','',  'warning').then((result) => {this.$router.push({ name: 'glist'}); return;});};
              if(res.data.r_data==='fail_notper'){ this.$swal( '이 글은 볼 수 없어요!','요청 데이터값이 조작됐나봐요<br>[게시판 번호 조작]',  'error').then((result) => {this.$router.go(-1); return;});};
              if(res.data.r_data==='fail_note'){ this.$swal( '이 글은 볼 수 없어요!','요청 데이터값이 조작됐나봐요<br>[글 번호 조작]',  'error').then((result) => {this.$router.go(-1); return;});};
              this.게시글 = JSON.parse(res.data.r_data)
              
              this.title = this.게시글.제목
              this.tag = this.게시글.태그
              this.context = this.게시글.내용
              this.time = this.게시글.작성일
              this.수정일 = this.게시글.수정일
              this.writer =res.data.writer;
              this.추천 = this.게시글.추천
              this.비추천 = this.게시글.비추천
              this.신고 = this.게시글.신고
              this.reply_cnt = this.게시글.댓글
              this.추천여부=this.게시글.추천여부
              
              //댓글
              if(res.data.r_reple_data==='relogin'){ this.$relogin(); return;};
              if(res.data.r_reple_data==='fail_notper'){this.$swal( '데이터조작?','이 기록장은 볼 수 없어요!',  'error').then((result) => {this.$router.push({ name: 'glist'}); return;}); };
              this.댓글들 = JSON.parse(res.data.r_reple_data)
              console.log(this.댓글들);
              
               let 오늘= dayjs().format("YYYY-MM-DD HH:mm:ss");
                let 오늘2= dayjs()
              
              this.댓글들.forEach(item => {
                let 템날짜 =  dayjs(item.작성일, "YYYY-MM-DD HH:mm:ss");
                템날짜.format("YYYY-MM-DD HH:mm:ss")
                
                if(템날짜.diff(오늘, "d")===0 && 오늘2.get("D") === 템날짜.get("D") ) this.날짜[item.번호] = 템날짜.format("HH:mm");
                else this.날짜[item.번호] = 템날짜.format("YYYY-MM-DD").substr(1).substr(1);
                this.reple_writer = res.data.r_reple_my;
                this.own_dic =  JSON.parse( res.data.r_own)
              })
          });
          
        },
        methods:{
          write(){
            axios({	url: "/api/commentPost",method: "POST",		data: {	cookie:  this.univ_cookie, univ: this.univ_name, r_id: this.univ_id,  link_id:this.link_id, post_num:this.post_num,comment:this.comment} })
            .then(res => {
                if(res.data.r_data==='relogin'){ this.$relogin(); return;};
                if(res.data.r_data==='fail_notper'){ this.$swal( '데이터조작?','이 기록장에 댓글을 쓸 수 없어요!',  'error').then((result) => {this.$router.push({ name: 'glist'}); return;}); };
                if(res.data.r_data==='fail_postnum'){  this.$swal( '없는 글이거나 삭제됐어요!','',  'warning').then((result) => {this.$router.push({ name: 'glist'}); return;});};
                if(res.data.r_data==='fail_comment'){ this.$swal('다시 확인해주세요','내용이 100자가 넘어요!'); return};
                if(res.data.r_data==='fail_comment_min'){ this.$swal('다시 확인해주세요','댓글 내용이 없어요!'); return};
                if(res.data.r_data==='sucsess'){this.$router.go(0); return};
                
            });
          },
          edit(){
            axios({	url: "/api/edit_auth",method: "POST",		data: {	cookie:  this.univ_cookie, univ: this.univ_name, r_id: this.univ_id,  link_id:this.link_id, post_num:this.post_num} })
            .then(res => {
                if(res.data.r_data==='relogin'){ this.$relogin(); return;};
                if(res.data.r_data===0){ this.$swal( '데이터조작?','남의 글을 수정 할 수는 없어요!',  'error').then((result) => {this.$router.push({ name: 'glist'}); return;}); };
                if(res.data.r_data==='fail_postnum'){  this.$swal( '글 수정도중 글이 삭제됐어요!','',  'warning').then((result) => {this.$router.push({ name: 'glist'}); return;});};
                if(res.data.r_data===1) {this.$router.push({ name: 'gnote_edit' ,  query: {cls: this.cls, prof:this.prof, link_id:this.link_id, post_num:this.post_num} });}
                
            });
          },
          back(){
            this.$router.go(-1);
          },
          delete_post(){
            this.$swal({
              title: '이 글을 지우겠어요??',
              icon: 'question',
              showCancelButton: true,
              confirmButtonColor: '#d33',
              cancelButtonColor: '#303936',
              confirmButtonText: '지운다!',
              cancelButtonText: '아니',
            }).then((result) => {
              if (result.isConfirmed) {
                axios({	url: "/api/deletePost",method: "POST",		data: {	cookie:  this.univ_cookie, univ: this.univ_name, r_id: this.univ_id,  link_id:this.link_id, post_num:this.post_num} })
                .then(res => {
                    if(res.data.r_data==='relogin'){ this.$relogin(); return;};
                    if(res.data.r_data==='fail_post'){ this.$swal( '데이터조작?','남의 글을 지울 수는 없어요!',  'error').then((result) => {this.$router.push({ name: 'glist'}); return;}); };
                    if(res.data.r_data==='sucsess'){ this.$swal({
                      icon: 'success',
                      title: '글이 지워졌어요!',
                      toast: true,
                      position: 'top-right',
                      width:'300px',
                      customClass: {
                        popup: 'colored-toast'
                      },
                      showConfirmButton: false,
                      timer: 2000,
                      timerProgressBar: true
                    }); this.$router.go(-1); return};
                    
                });
              }
            })
          },
          delete_reply(item_num){
            this.$swal({
              title: '이 댓글을 지우겠어요??',
              icon: 'question',
              showCancelButton: true,
              confirmButtonColor: '#d33',
              cancelButtonColor: '#303936',
              confirmButtonText: '지운다!',
              cancelButtonText: '아니',
            }).then((result) => {
            if (result.isConfirmed) {
              axios({	url: "/api/deleteReply",method: "POST",		data: {	cookie:  this.univ_cookie, univ: this.univ_name, r_id: this.univ_id,  link_id:this.link_id, reply_num:item_num} })
              .then(res => {
                  if(res.data.r_data==='relogin'){ this.$relogin(); return;};
                  if(res.data.r_data==='fail_post'){this.$swal( '데이터조작?','남의 글을 댓글을 지울 수는 없어요!',  'error').then((result) => {this.$router.push({ name: 'glist'}); return;}); };
                  if(res.data.r_data==='no_reply'){ this.$swal( '이미 없어진 댓글이에요','',  'error').then((result) => {this.$router.push({ name: 'glist'}); return;}); };
                  if(res.data.r_data==='sucsess'){  this.$router.go(0); return};
                  
              });
            
            }
            })
          },
          agree_btn(){
            axios({	url: "/api/agree",method: "POST",		data: {	cookie:  this.univ_cookie, univ: this.univ_name, r_id: this.univ_id,  link_id:this.link_id, post_num:this.post_num} })
            .then(res => {
                if(res.data.r_data==='relogin'){ this.$relogin(); return;};
                if(res.data.r_data==='fail_notper'){ this.$swal( '데이터조작?','이 글에는 추천을 못 해요!',  'error').then((result) => {this.$router.push({ name: 'glist'}); return;}); };
                if(res.data.r_data==='fail_postnum'){ this.$swal( '글이 없어요','지워졌거나 값이 변형됐나봐요',  'error').then((result) => {this.$router.push({ name: 'glist'}); return;}); };
                if(res.data.r_data==='exit'){  this.$swal('이미 추천 한 글이에요'); return};
                if(res.data.r_data==='exit_0'){ this.$swal('이미 비추천 한 글이에요'); return};
                if(res.data.r_data==='sucsess'){this.$router.go(0); return};
                
            });
          },
          disagree_btn(){
            axios({	url: "/api/disagree",method: "POST",		data: {	cookie:  this.univ_cookie, univ: this.univ_name, r_id: this.univ_id,  link_id:this.link_id, post_num:this.post_num} })
            .then(res => {
                if(res.data.r_data==='relogin'){ this.$relogin(); return;};
                if(res.data.r_data==='fail_notper'){this.$swal( '데이터조작?','이 글에는 비추천을 못 해요!',  'error').then((result) => {this.$router.push({ name: 'glist'}); return;}); };
                if(res.data.r_data==='fail_postnum'){ this.$swal( '글이 없어요','지워졌거나 값이 변형됐나봐요',  'error').then((result) => {this.$router.push({ name: 'glist'}); return;}); };
                if(res.data.r_data==='exit'){ this.$swal('이미 비추천 한 글이에요'); return};
                if(res.data.r_data==='exit_0'){ this.$swal('이미 추천 한 글이에요'); return};
                if(res.data.r_data==='sucsess'){this.$router.go(0); return};
                
            });
          },
          
          co_agree_btn(comment_num){
            axios({	url: "/api/co_agree",method: "POST",		data: {	cookie:  this.univ_cookie, univ: this.univ_name, r_id: this.univ_id,  link_id:this.link_id, post_num:this.post_num,comment_num:comment_num} })
            .then(res => {
                if(res.data.r_data==='relogin'){ this.$relogin(); return;};
                if(res.data.r_data==='fail_notper'){this.$swal( '데이터조작?','이 댓글에는 추천을 못해요!',  'error').then((result) => {this.$router.push({ name: 'glist'}); return;}); };
                if(res.data.r_data==='fail_postnum'){ this.$swal( '댓글이 없어요','지워졌거나 값이 변형됐나봐요',  'error').then((result) => {this.$router.push({ name: 'glist'}); return;}); };
                if(res.data.r_data==='exit'){ this.$swal('이미 추천 한 댓글이에요'); return};
                if(res.data.r_data==='exit_0'){ this.$swal('이미 비추천 한 댓글이에요'); return};
                if(res.data.r_data==='sucsess'){this.$router.go(0); return};
                
            });
          },
          co_disagree_btn(comment_num){
            axios({	url: "/api/co_disagree",method: "POST",		data: {	cookie:  this.univ_cookie, univ: this.univ_name, r_id: this.univ_id,  link_id:this.link_id, post_num:this.post_num,comment_num:comment_num} })
            .then(res => {
                if(res.data.r_data==='relogin'){ this.$relogin(); return;}
                if(res.data.r_data==='fail_notper'){ this.$swal( '데이터조작?','이 댓글에는 비추천을 못해요!',  'error').then((result) => {this.$router.push({ name: 'glist'}); return;}); };
                if(res.data.r_data==='fail_postnum'){ this.$swal( '댓글이 없어요','지워졌거나 값이 변형됐나봐요',  'error').then((result) => {this.$router.push({ name: 'glist'}); return;}); };
                if(res.data.r_data==='exit'){ this.$swal('이미 비추천 한 댓글이에요'); return};
                if(res.data.r_data==='exit_0'){ this.$swal('이미 추천 한 댓글이에요'); return};
                if(res.data.r_data==='sucsess'){this.$router.go(0); return};
                
            });
          }
        },
    }
    
</script>
        

<style scoped>

.목록으로{
  float: right;
    position: relative;
    padding: 5px 5px;
    border-radius: 5px;
    font-family: "paybooc-Light", sans-serif;
    text-decoration: none;
    font-weight: 600;
    transition: 0.25s;
    background-color: #D2FFD2;
    color: #006400;
    border: 3px solid #4BAF4B;
    top:-20px;
}.목록으로:hover:not([disabled]){background:#82F9B7;transform: scale(1.2)}



.삭제버튼{
  float: right;
    position: relative;
    left:5px;
    top:-20px;
    padding: 3px 10px;
    border-radius: 5px;
    font-family: "paybooc-Light", sans-serif;
    text-decoration: none;
    font-weight: 600;
    transition: 0.25s;
    background-color: #FFD294;
    color: #FF191E;
    border: 3px solid #DD1733;
}
.삭제버튼:hover:not([disabled]){background:#FFA500;transform: scale(1.2)}

.수정버튼{
  float: right;
    top:-20px;
    position: relative;
    padding: 3px 10px;
    border-radius: 5px;
    font-family: "paybooc-Light", sans-serif;
    text-decoration: none;
    font-weight: 600;
    transition: 0.25s;
    background-color: #FFD294;
    color: #D2691E;
    border: 3px solid #E57733;
}
.수정버튼:hover:not([disabled]){background:#FFA500;transform: scale(1.2)}

.댓글버튼{
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
}.댓글버튼:hover:not([disabled]){background:#64AAFF;transform: scale(1.2)}



</style>