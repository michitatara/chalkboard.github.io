async function logout(){
   await fetch('/logout')
   .then((data)=>{
       window.location.href='/login';
   })
   .catch((err)=>console.log(err));
}