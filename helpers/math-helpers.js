module.exports = {
    mathMulti : (num1, num2)=>{
        num1 = parseFloat(num1);
        num2 = parseFloat(num2);
        const result = num1 * num2;
        return result.toFixed(2);
    },
    mathAdd : (num1, num2)=>{
        if(num1||num2===0){
            return 0;
        }
        num1 = parseFloat(num1);
        num2 = parseFloat(num2);
        return num1 + num2;
    },
    subDiscount : (num1)=>{
        if(num1===0){
            return 0;
        }
        return num1 - 100;
    },
    inc : (value)=>{
        return parseInt(value) + 1;
    },
    subtract:(num1, num2)=>{
        if(num1>num2){
            const result = num1-num2;
            return result;
        }
    }
}
  