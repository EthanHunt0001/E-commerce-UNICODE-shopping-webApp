// USER SIGNUP VALIDATION

var nameError = document.getElementById('name-error');
var emailError = document.getElementById('email-error');
var mobileError = document.getElementById('mobile-error');
var passwordError = document.getElementById('password-error');
var password2Error = document.getElementById('password2-error');
var submitError = document.getElementById('submit-error');

function validateName(){                                 
  var name = document.getElementById('name').value;
  if(name.length == 0){
    nameError.innerHTML = 'Name is required';
    return false;
  }
  if(!name.match(/^[A-Za-z]+ [A-Za-z]+$/)) {
      nameError.innerHTML = 'Write full name';
      return false;
  }
  nameError.innerHTML = '';
      return true;
}

function validateMobile(){
  var mobile = document.getElementById('mobile').value;
  if(mobile.length === 0){
    mobileError.innerHTML = 'Mobile number is required';
    return false;
  }else if(!mobile.match(/^[6-9]\d{9}$/)){
    mobileError.innerHTML = 'invalid mobile number';
    return false;
  }else {
    mobileError.innerHTML = '';
    return true;
  }
}

function validateEmail(){
  var email = document.getElementById('email').value;
  if(email.length==0){
      emailError.innerHTML = 'Email is required';
      return false;
  }
  if(!email.match(/^\w+([\.-]?\w+)@\w+([\.-]?\w+)(\.\w{2,3})+$/)){
    emailError.innerHTML = 'Email invalid';
    return false;
  }
  emailError.innerHTML = '';
  return true;
}

  function validatePassword(){
    var password = document.getElementById('password').value;
    var passChecker = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,20}$/;
    if(password.match(passChecker)){
      passwordError.innerHTML = '';
      return true;
    }else{
      passwordError.innerHTML = 'required 6-20 character,1 numeric digit, 1 uppercase and 1 lowercase';
      return false;
    }
  }
  function validateRePassword(){
    var password = document.getElementById('password').value;
    var password2 = document.getElementById('password2').value;
    if(password!==password2){
      password2Error.innerHTML = "password does'nt match !!";
      return false;
    }else{
      password2Error.innerHTML = " ";
      return true;
    }
  }

  function validateForm(){
    if(!validateName() || !validateEmail() || !validatePassword() || !validateRePassword() || !validateMobile()){
      submitError.style.display='flex';
      submitError.style.justifyContent='center';
      submitError.innerHTML = 'Please fix all errors to submit';
      setTimeout(()=>{
        submitError.style.display='none';
      },3000);
      return false;
    }
  }
