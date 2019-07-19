const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()
  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : '0' + n
}

const unique = arr => {
  let result = [];
  let obj = {};
  for(let i = 0; i < arr.length; i++){
    if (!obj[arr[i].from]) {
      result.push(arr[i])
      obj[arr[i].from] = true
    }
  }
  return result
}

/* 防抖 */
const debounce = (func, wait = 500) => {
  let timeout;
  return function (event) {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      func.call(this, event);
    }, wait)
  }
}


module.exports = {
  formatTime,
  unique,
  debounce
}
