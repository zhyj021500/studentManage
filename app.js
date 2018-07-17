//引入express 框架
let express = require('express');
//引入二维码生成器
let svgCaptcha = require('svg-captcha');
let path = require('path');
//引入session
let session = require('express-session')
//格式化请求数据
let bodyParser = require('body-parser')
//引入自己封装的数据库的操作
let myT = require(path.join(__dirname,'tools/myT.js'));
//引入自己定义的路由中间件
let indexRoute = require(path.join(__dirname,"route/indexRoute.js"));

let app = express();
//静态资源托管
app.use(express.static('static'));
//设置session属性
app.use(session({
    secret: 'keyboard cat',
  }));
//中间件 格式化请求数据
app.use(bodyParser.urlencoded({ extended: false }))
// 使用 index路由中间件 挂载到 /index这个路径下面
app.use('/index',indexRoute);

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
    //console.log(username+"---"+password);
  //查数据库
    myT.find('userinfo',{username},(err,result)=>{
        if(!err){
            if(result.length == 0){
                //没被注册
                myT.insert('userinfo',{username,password},(err,result)=>{
                    if(!err){
                      
                        
                        myT.mess(res,'注册成功','/login');
                    }
                });
            }else{
                //被注册
                myT.mess(res,'已被注册','/register');
            }
        }
        
    });
    
});


// 退出
app.get('/logout',(req,res)=>{
    //删除session保存的userinfo
    delete req.session.userinfo;
    //跳到登录页
    res.redirect('/login');
});
//跳到用户编辑页
app.get('/update',(req,res)=>{
    res.sendFile(path.join(__dirname,"static/views/update.html"));
});
//监听
app.listen(80,"127.0.0.1",()=>{
    console.log('监听');
    
});