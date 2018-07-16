//引入express 框架
let express = require('express');
//引入二维码生成器
let svgCaptcha = require('svg-captcha');
let path = require('path');
//引入session
let session = require('express-session')
//格式化请求数据
let bodyParser = require('body-parser')
//引入mongodb
const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');
//路径
const url = 'mongodb://localhost:27017';
// Database Name 库名
const dbName = 'footlist';

let app = express();
//静态资源托管
app.use(express.static('static'));
//设置session属性
app.use(session({
    secret: 'keyboard cat',
  }));
//中间件 格式化请求数据
app.use(bodyParser.urlencoded({ extended: false }))

//请求登录页
app.get('/login',(req,res)=>{
    res.sendFile(path.join(__dirname,'/static/views/login.html'));
});

//请求二维码
app.get('/login/captchaImg', function (req, res) {
    //创建二维码对象
    var captcha = svgCaptcha.create();

    //sessing保存二维码内容 验证码小写
     req.session.captcha = captcha.text.toLowerCase();
    
     res.type('svg');
    //console.log(captcha.data);
    res.status(200).send(captcha.data);
});
//登录
app.post('/login',(req,res)=>{
   // console.log(req.body);
    let username = req.body.username;
    let password = req.body.password;
    let code = req.body.code;
   // console.log(req.session.captcha);
   
    if(code == req.session.captcha){
        //保存登录信息 es6快速赋值
        req.session.userinfo = {username,password};
        res.sendFile(path.join(__dirname,'/static/views/index.html'));
    }else{
        res.setHeader('content-type',"text/html");
        res.send(`<script>alert('验证码错误'); window.location.href='/login'</script>`);
    }
});

//跳的注册页
app.get('/register',(req,res)=>{
    res.sendFile(path.join(__dirname,'static/views/register.html'));
});

//点击注册
app.post('/register',(req,res)=>{
    let username = req.body.username;
    let password = req.body.password;
  //  console.log(username+"---"+password);
  //查数据库
  MongoClient.connect(url, function(err, client) {
   
   
    const db = client.db('userinfo');
    const collection = db.collection('documents');
    // Insert some documents
    collection.insertMany([
      {username}
    ], function(err, result) {
      console.log(result);
    });
   
    client.close();
  });
    
});
//监听
app.listen(80,"127.0.0.1",()=>{
    console.log('监听');
    
});