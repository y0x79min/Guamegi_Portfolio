
const FormData = require('form-data');
const axios = require('axios');

const frm = new FormData()
frm.append('id', 'arun011020')
frm.append('password', 'min1020__')
frm.append('userSe', 'STU')
frm.append('returnUrl', 'https://lms.mokpo.ac.kr/sso/index.php')

axios({method: 'post',url: 'https://mnuwb.mokpo.ac.kr/uat/uia/actionLogin.do',frm  ,headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.132 Safari/537.36',
                'Content-Type': 'text/html',
                'Charset': 'utf-8'}
              })
  .then(res=>{
    console.log(res)
  })