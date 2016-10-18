class util{

    /**
     * @param  {any[]} array        对象数组
     * @param  {string[]} property  需要过滤的某些属性
     * @returns any[]               返回过滤后的对象数组               
     */
    public  static filter(array:any[],properties:string[]):any[]{
        var resultArr = [];
        for(var i=0;i<array.length;i++){
            var item = array[i];
            var expectItem = {}
            for(var k=0;k<properties.length;k++){
                var key = properties[k];
                if(key in item){
                    expectItem[key] = item[key]
                }
            }
            resultArr.push(expectItem);
        }
        return resultArr;
    }    
}