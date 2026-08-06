<template> 
  <div  id='app' class="gnote_post" >
    <span class='note_title'><b>{{cls}}</b></span>
    <div style='text-align:left'>
    <input v-model="title" placeholder="제목 최대30자" style="width:300px;height:25px"> [{{len(title)}}/30]<br>
    <select v-model="tag"  style="width:308px;height:30px"><option v-for="option in options">{{ option }}</option></select>
    [{{len(tag)}}/20]
    <textarea v-model="context" placeholder="내용 최대500자" style="width:500px;height:200px;float:left;resize: none; "></textarea><br><br>
    [{{len(context)}}/500] <button @click="write" class='쓰기버튼'>수정하기</button>
        <button @click='back' style="position:relative;float:right;"  class='목록으로'>돌아가기</button></div>
  </div>
</template>
<script>
    import axios from 'axios';
    import dayjs from 'dayjs';
    export default {
        name: 'Params',
        data(){ 
           return{ cls: null, prof:null, link_id:null,univ_cookie:null,univ_name:null,univ_id:null,
                  title:null,tag:'수다',context:null,게시글:null,post_num:null,options:['수다','혼잣말'],selected:'선택'
           }
        },
        mounted(){
          
          this.cls= this.$route.query.cls;
          this.prof= this.$route.query.prof;
          this.link_id= this.$route.query.link_id;
          this.univ= this.$route.query.univ;
          this.univ_cookie = localStorage.getItem('univ_cookie');
          this.univ_name = localStorage.getItem('univ_name');
          this.univ_id = localStorage.getItem('univ_id');
          this.post_num= this.$route.query.post_num;
              
          axios({	url: "/api/viewpost",method: "POST",		data: {	cookie:  this.univ_cookie, univ: this.univ_name, r_id: this.univ_id,  link_id:this.link_id, post_num:this.post_num }})
            .then(res => {
              if(res.data.r_data==='relogin'){ this.$relogin(); return;};
              this.게시글 = JSON.parse(res.data.r_data)
              
              this.title = this.게시글.제목
              this.tag = this.게시글.태그
              this.context = this.게시글.내용
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
          
        },
        methods:{
          len(str){
            if(str===null) return 0;
            return str.length;
          },
          back(){
            this.$router.go(-1);
          },
          write(){
            axios({	url: "/api/edit_post",method: "POST",		data: {	cookie:  this.univ_cookie, univ: this.univ_name, r_id: this.univ_id,  link_id:this.link_id, title:this.title, tag: this.tag,context:this.context,post_num:this.post_num } })
            .then(res => {
                if(res.data.r_data==='relogin'){  this.$relogin(); return;};
                if(res.data.r_data==='fail_notper'){this.$swal( '데이터조작?','이 기록장을 수정 할 수 없어요!',  'error').then((result) => {this.$router.push({ name: 'glist'}); return;}); };
                if(res.data.r_data==='sucsess'){ this.$swal({
                      icon: 'success',
                      title: '글을 수정했어요!',
                      toast: true,
                      position: 'top-right',
                      width:'300px',
                      customClass: {
                        popup: 'colored-toast'
                      },
                      showConfirmButton: false,
                      timer: 2000,
                      timerProgressBar: true
                    });this.$router.go(-1); return};
                if(res.data.r_data==='fail_title'){ this.$swal('다시 확인해주세요','제목이 30자가 넘어요!'); return};
                if(res.data.r_data==='fail_tag'){ this.$swal('다시 확인해주세요','태그가 이상해요!'); return};
                if(res.data.r_data==='fail_context'){ this.$swal('다시 확인해주세요','내용이 500자가 넘어요!'); return};
                if(res.data.r_data==='fail_title_min'){ this.$swal('다시 확인해주세요','제목이 없어요!'); return};
                if(res.data.r_data==='fail_tag_min'){ this.$swal('다시 확인해주세요','태그가 없어요!');return};
                if(res.data.r_data==='fail_context_min'){ this.$swal('다시 확인해주세요','내용이 없어요!'); return};
                
            });
          }
        },
    }
    
</script>
        

<style scoped>

.쓰기버튼{
    position: relative;
    padding: 3px 10px;
    border-radius: 5px;
    font-family: "paybooc-Light", sans-serif;
    text-decoration: none;
    font-weight: 600;
    transition: 0.25s;
    background-color: #BEEFFF;
    color: #0064FF;
    float: right;
    border: 3px solid #1E82FF;
    margin:3px;
}.쓰기버튼:hover:not([disabled]){background:#64AAFF;transform: scale(1.2)}
.목록으로{
  float: left;
    position: relative;
    padding: 3px 10px;
    border-radius: 5px;
    font-family: "paybooc-Light", sans-serif;
    text-decoration: none;
    font-weight: 600;
    transition: 0.25s;
    background-color: #D2FFD2;
    color: #006400;
    border: 3px solid #4BAF4B;
    margin:3px;
}.목록으로:hover:not([disabled]){background:#82F9B7;transform: scale(1.2)}
</style>