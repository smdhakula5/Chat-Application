const http = require('http');

http.createServer((req,res)=>{
    res.write('Hello World');
    res.end();
}).listen(6969,()=>{
    console.log('Server is here');
});
