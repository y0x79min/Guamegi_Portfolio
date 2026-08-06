<template>
  <h1>안녕하세요</h1>  
</template>

<script>
export default {
    data(){
        return{ }
    },
    created(){
        document.querySelector('#menu').style.display='none'
    },
    mounted() {
        document.querySelector('#menu').style.display='none'
        if(localStorage.getItem('univ_cookie') !== null && localStorage.getItem('univ_name') !== null && localStorage.getItem('univ_id') !== null && localStorage.getItem('crow_data')!==null)
            this.$router.push({ name: 'glist'});
        else 
            this.$router.push({ name: 'login'});
    }
}
</script>