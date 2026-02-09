const form=document.getElementById('appointmentForm');
const msg=document.getElementById('formMsg');
const clearBtn=document.getElementById('clearBtn');

form.addEventListener('submit',e=>{
 e.preventDefault();
 if(!form.name.value || !form.phone.value){
   msg.textContent='Name and phone required';
   return;
 }
 msg.textContent='Appointment submitted ✔';
 form.reset();
});

clearBtn.onclick=()=>{form.reset();msg.textContent='';}