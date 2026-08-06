
import axios from 'axios'
export default {
    data(){return{
        re_id:null,re_pw:null,univ:null,univ_list:[]
    }},
    install(Vue) {
       Vue.config.globalProperties.$newlogin=function(){
          const steps = ['1', '2','3','4']
         const Queue = this.$swal.mixin({
          progressSteps: steps,
          showClass: { backdrop: 'swal2-noanimation' },
          hideClass: { backdrop: 'swal2-noanimation' }
        })
         
        Queue.fire({
          currentProgressStep: 0,
          showClass: { backdrop: 'swal2-noanimation' },
            title: '로그인 할 대학교를 선택해주세요',
            input: 'select',
            inputOptions: this.univ_list,
              inputLabel: '클라이언트 데이터가 손상돼서 재 로그인을 해야합니다',
            inputPlaceholder: '대학교를 골라주세요',
          confirmButtonText: '로그인하기',
              cancelButtonText: `로그아웃`,
            showCancelButton: true,
            inputValue:this.univ,
            inputValidator: (value) => {
              return new Promise((resolve) => {
                if (!value) {
                  this.$newlogin();
                }
                else{
                  this.univ = this.univ_list[value];
                  this.$newidpw();
                  }
              })
            }
        }).then((result) => {
              if(result.dismiss==='cancel'){
                localStorage.clear();
                this.$router.push({ name: 'home', params:{logout:'1'}});
              }
              else
                this.$newlogin();
          })
        
        
       }
      Vue.config.globalProperties.$newidpw=function(){
          const steps = ['1', '2','3','4']
         const Queue = this.$swal.mixin({
          progressSteps: steps,
          showClass: { backdrop: 'swal2-noanimation' },
          hideClass: { backdrop: 'swal2-noanimation' }
        })
         Queue.fire({
                      
                      showClass: { backdrop: 'swal2-noanimation' },
                      html: `<h3><b>아이디 비밀번호를 입력해주세요</b></h3><input type="text" id="login" class="swal2-input" placeholder="Username">
                      <input type="password" id="password" class="swal2-input" placeholder="Password">`,
                      currentProgressStep: 1,
                      denyButtonText: `대학교 재선택`,
                      cancelButtonText: `로그아웃`,
                      confirmButtonText: '로그인',
                      showDenyButton: true,
                      focusConfirm: false,
                      showCancelButton: true,
                      preConfirm: () => {
                          const login = this.$swal.getPopup().querySelector('#login').value
                          const password = this.$swal.getPopup().querySelector('#password').value
                          if (!login || !password) {
                            this.$swal.showValidationMessage(`아이디 비밀번호를 제대로 입력해주세요`)
                          }
                          return { login: login, password: password }
                        }
                    }).then((result) => {
                        if(result.isDismissed){
                          if(result.dismiss==='cancel'){
                            localStorage.clear();
                            this.$router.push({ name: 'home', params:{logout:'1'}});
                          }
                          else
                            this.$newidpw();
                        }
                        else if(result.isDenied){
                          this.$newlogin();
                        }
                        else{
                          Queue.fire({ 
                            title: '로그인 중..',
                            currentProgressStep: 2,
                            showClass: { backdrop: 'swal2-noanimation' },
                            
                          })
                          this.$swal.showLoading()
                          axios({	url: "/api/login",method: "POST",		data: {	 univ_name: this.univ,	univ_id: result.value.login,	univ_pw: result.value.password } })
                          .then(res => {
                            if(res.data.state==='로그인성공'){
                             //자동로그인
                             this.univ_cookie = res.data.r_cookie;
                             localStorage.setItem('univ_cookie', res.data.r_cookie)
                             localStorage.setItem('univ_name', res.data.r_univ)
                             localStorage.setItem('loginLink', res.data.r_loginLink)
                             localStorage.setItem('univ_id', result.value.login)
                             return new Promise(() => {
                                  
                                Queue.fire({ 
                                  title: '로그인 성공!<br>과제 불러오는중..',
                                  currentProgressStep: 3,
                                  showClass: { backdrop: 'swal2-noanimation' },
                                  
                                })
                                this.$swal.showLoading()
                                
                              	axios({	url: "/api/crowing",method: "POST",		data: {univ_id: result.value.login,	cookie:  res.data.r_cookie , r_univ: res.data.r_univ } })
                                    .then(res => {				// back 서버로부터 응답받으면
                                      Queue.fire({ 
                                        icon: 'success',
                                        title: '완료!',
                                        currentProgressStep: 4,
                                        showClass: { backdrop: 'swal2-noanimation' },
                                        
                                      }).then((result) => {this.$router.go(0); }) //이후에 새로고침 달기(꺼지거나 확인 누르면)
                                      localStorage.setItem('r_depart', res.data.r_depart);
                                      localStorage.setItem('r_time', res.data.r_reload);
                                      this.마지막크롤링=res.data.r_reload;
                                      this.crowdata = JSON.parse(res.data.r_data).sort((a, b) => { if (a.수업 < b.수업) return -1; if (a.수업 > b.수업) return 1; return 0; }); //과제 이름순 정렬
                                      localStorage.setItem('crow_data', JSON.stringify(this.crowdata));
                                      this.crowdataPre();
                                    })
                                });
                            }
                            else{
                               this.$swal( '알림',res.data.message,  'warning').then((result) => {this.$relogin()});
                               
                            }
                          });
                        }
                      })
      }
      
      
        Vue.config.globalProperties.$relogin=function(){
          this.univ_list = [];
          axios({	url: "/api/univlist",method: "POST" }).then(res => { 
            res.data.univ_list.forEach(item=>{
              this.univ_list.push( item.학교이름  )
            });
            this.$newlogin();
          });
            
        }
    }
}
