<template>
  <body>
  <div id="app">
    <div id="menu">
        &nbsp;
         <router-link to="../glist" style='margin-left:2px'>과제 목록</router-link>
          <router-link to="../gcal">과제 달력</router-link>
          <router-link to="../chat" style='margin-right:1px;letter-spacing:5px'>메신저</router-link>
          <div id='topBorder'></div>
    </div>
    <div class='routeCon'>    <router-view></router-view> </div>
  </div>
  </body>
</template>

<style>
#app {
  position: relative;
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}
#topBorder{
   margin-top: 0;
   height:30px;
   background: #4ABF2A;
   border-top:2px solid #01261C; 
}
.routeCon{
  position: relative;
  height: 800px;
  width: 500px;
  background:#FFF;
  margin:0 auto;
  padding: 10px;
;
}
#menu{
  border-radius: .5em .5em 0 0;
  position: relative;
  height: 100%;
  width: 520px;
  background:#98D936;
  margin:0 auto;
  padding-top: 0px;
  padding-bottom: 0px;
  text-align: left;
  top:9px;
}
#menu a::before {
    content:"";
    position:absolute;
    top:0;right:0;bottom:0;left:0;
    z-index:-1;
    background:#98D936;
    border-bottom:none;
    border-radius: .3em .3em 0 0;
    transform:perspective(.2em) rotateX(0.3deg);
    transform-origin: bottom;
    border-bottom:0px;
}
#menu a {
  text-align: center;
  display:inline-block;
  text-decoration: none; 
  font-size:2rem;
  color:#fff;
  padding:8px 9px 18px 9px;
  margin-top: 10px;
  border-radius: 10px;
  width:29%;
  height:30px;
  transition:all 0.1s;
  text-shadow: 0px 2px rgba(0, 0, 0, 0.44);
  font-family: 'memenu';     
  transform: translateY(-0.1px);
}
#menu a:active{
 transform: translateY(3px) scale(0.1);
}
#menu a:hover{
 transform: translateY(3px) scale(0.98);
  background:#A8E946;
}

#menu .router-link-exact-active{
  transform: translateY(2px)
}

#menu .router-link-exact-active::before {
    background:#4ABF2A;
}

#menu .router-link-exact-active:hover {
 transform: translateY(3px);
}
@font-face {
    font-family: 'memenu';
    src: url('https://cdn.jsdelivr.net/gh/projectnoonnu/noonfonts_2110@1.0/YdestreetB.woff2') format('woff2');
    font-weight: normal;
    font-style: normal;
}
@font-face {
    font-family: 'rlfhrwkd';
    src: url('https://cdn.jsdelivr.net/gh/projectnoonnu/noonfonts_20-04@1.0/KyoboHand.woff') format('woff');
    font-weight: normal;
    font-style: normal;
}
@font-face {
    font-family: 'HS-Regular';
    src: url('https://cdn.jsdelivr.net/gh/projectnoonnu/noonfonts_2201-2@1.0/HS-Regular.woff') format('woff');
    font-weight: normal;
    font-style: normal;
}

body{
  background: #E9EFC0;
  width:510px;
  margin:0 auto;
  
	
}
.note_title{
  position: relative;
  font-family:memenu;
  font-size:25px;
  width: 500px;
  display: block;
  overflow: hidden;
  text-overflow : ellipsis;
  white-space: nowrap;
  padding:10px;
  padding-bottom:0px;
  top:-10px;
  
}

</style>
