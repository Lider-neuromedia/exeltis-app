export function getCurrenDateTime(){
    var today = new Date();
    var date = today.getFullYear()+'-'+pad((today.getMonth()+1))+'-'+pad(today.getDate());
    var time = pad(today.getHours()) + ":" + pad(today.getMinutes()) + ":" + pad(today.getSeconds());
    return date+` `+time;
}

export function getCurrenDate(){
    var today = new Date();
    var date = today.getFullYear()+'-'+pad((today.getMonth()+1))+'-'+pad(today.getDate());
    return date;
}

export function getCurrenTime(){
    var today = new Date();
    var time = pad(today.getHours()) + ":" + pad(today.getMinutes()) + ":" + pad(today.getSeconds());
    return time;
}

export function pad(n) {
    return n<10 ? '0'+n : n;
}

export function inArray(target, array)
{

  for(var i = 0; i < array.length; i++) 
  {
    if(array[i] === target)
    {
      return true;
    }
  }

  return false; 
}