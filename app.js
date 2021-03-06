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

// 导入 art-template
app.engine('html', require('express-art-template'));
app.set('views', '/static/views');


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
        myT.find('userinfo',{username,password},(err,docs)=>{
            if(!err){
                // 没错说明数据库没有问题
                // 继续判断用户是否存在
                if(docs.length==1){
                    // 保存session
                    req.session.userInfo = {
                        username
                    }
                    // 去首页
                    myT.mess(res,'欢迎回来','/index');
                }else{
                    // 用户名或密码错误 没有注册
                    myT.mess(res,'你是谁,你要干什么','/login');
                }
            }
        })
    }else{
        myT.mess(res,'哥们,验证码不对哦,检查一下吧','/login');
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

//监听
app.listen(80,"127.0.0.1",()=>{
    console.log('监听');
    
});