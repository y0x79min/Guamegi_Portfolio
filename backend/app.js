const express = require('express');
const path = require('path');
const fs = require('fs');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors = require('cors');
const cheerio = require('cheerio');
const puppeteer = require('puppeteer');
const axios = require('axios');
const requestIp = require('request-ip');
const dayjs = require("dayjs");

var app = express();
var mysql = require('mysql');
var rateLimit = require("express-rate-limit"); 
const dbConnection = {
    host: process.env.GUAMEGI_DB_HOST || '127.0.0.1',
    port: Number(process.env.GUAMEGI_DB_PORT || 12046),
    user: process.env.GUAMEGI_DB_USER || 'root',
    password: process.env.GUAMEGI_DB_PASSWORD || '',
    charset: 'utf8mb4'
};

var auddjs=[
    {글:'산을 움직이려 하는 이는 작은 돌을 들어내는 일로 시작한다.', 쓴이:'공자'},
    {글:'기회는 일어나는 것이 아니라 만들어내는 것이다.', 쓴이:'크리스 그로서'},
    {글:'성공의 비결은 좌절하지 않고 극복하는데 있다', 쓴이:'발자크 '},
    {글:'실패란 넘어지는 것이 아니라 넘어진 자리에 머무는 것이다.', 쓴이:'도서 <프린세스, 라 브라바!>中'},
    {글:'성공은 매일 반복한 작은 노력들의 합이다.', 쓴이:'로버트 콜리어'},
    {글:'인생이란 자신을 찾는 것이 아니라 자신을 만드는 것이다.', 쓴이:'롤리다스칼'},
    {글:'실패는 잊어라. 하지만 그것이 준 교훈은 절대 잊으면 안 된다.', 쓴이:'하버트 개서'},
    {글:'너 자신이 돼라. 다른 사람은 이미 있으니까.', 쓴이:'오스카 와일드'},
    {글:'일단 시작해라. 나중에 완벽해지면 된다.', 쓴이:'론 무어'},
    {글:'변명 중에서도 가장 어리석고 못난 변명은 "시간이 없어서"이다', 쓴이:'에디슨'},
    {글:'나는 이룰 때까지 노력할 것이다.', 쓴이:'브라이언 트레이시'},
    {글:'자기 신뢰 없이는 성공하지 못한다.', 쓴이:'랄프 왈도 에머슨'},
    
    ]


app.use(
    cors({			
        origin: 'https://localhost',
        credentials:true,
    }),
    rateLimit({ 
        windowMs: 1*10*1000, 
        max: 20
    })
);

let db_list = ['guamegi','목포대학교','우송대학교'];     
//대학리스트
let db={};

//유저 DB 자동생성
db_list.forEach((item)=>{
      db[item] = mysql.createPool({
      connectionLimit : 10,
      host : dbConnection.host,
      port : dbConnection.port,
      user : dbConnection.user,
      password : dbConnection.password,
      charset : dbConnection.charset,
      database : item+'_db'
    })
    db[item].query('SELECT ;', function(error, 개수){
         db[item].query(`CREATE TABLE if not exists 유저 (
                         번호        INT NOT NULL AUTO_INCREMENT,
                        아이디 VARCHAR(50),
                        쿠키 VARCHAR(100),
                        마지막크롤링 VARCHAR(30),
                        자동로그인 INT,
                        링크모음 VARCHAR(10000),
                        학과 VARCHAR(50),
                        닉네임_학교 VARCHAR(10),
                        닉네임_학과 VARCHAR(10),
                        익명_학교 INT DEFAULT 0 NOT NULL,
                        익명_학과 INT DEFAULT 0 NOT NULL,
                        익명_학교_시간 VARCHAR(20),
                        익명_학과_시간 VARCHAR(20),
                          PRIMARY KEY(번호)
                        ) ENGINE=MYISAM CHARSET=utf8;`, function(error, 됐나){ });
    })
    console.log(item+' DB Create Sucess');
    global.db = db;
});

setInterval(function () {
    db['guamegi'].query('SELECT 1');
}, 1000000);
var browser=null;

function getBrowserLaunchOptions() {
    const candidates = [
        process.env.GUAMEGI_BROWSER_PATH,
        'C:/Program Files/Google/Chrome/Application/chrome.exe',
        'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
        'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
        'C:/Program Files/Microsoft/Edge/Application/msedge.exe'
    ].filter(Boolean);

    const executablePath = candidates.find((candidate) => fs.existsSync(candidate));
    const options = {
        headless: true,
        args: ["--proxy-server='direct://'", '--proxy-bypass-list=*']
    };

    if (executablePath) options.executablePath = executablePath;
    return options;
}

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


app.post('/api/univlist', function(req, res){
    let today = new Date();  
    console.log("["+today.toLocaleString() +']'+' /main = '+requestIp.getClientIp(req));
    
    db['guamegi'].query('SELECT 학교이름 FROM 학교리스트;', function(error, 학교이름들){
    var ran = Math.floor(Math.random()*(auddjs.length))
    res.status(200).json({ univ_list: 학교이름들, auddjs:auddjs[ran]})
    });
});

app.post('/api/getposts', function(req, res){
    let univ = req.body.univ;
    let cookie = req.body.cookie;
    let univ_id = req.body.r_id;
    let fldzm = req.body.link_id;
    let page = req.body.page-1;
    let cnt = req.body.cnt;
    if(!db[univ])
        return res.status(200).json({r_data: 'relogin'});
    
    let today = new Date();  
    console.log(today.getFullYear()+'/'+(today.getMonth() + 1)+'/'+today.getDate()+' '+today.getHours()+':'+today.getMinutes()+':'+today.getSeconds()+' '+univ_id+' 글목록 '+fldzm);
    db[univ].query("SELECT 링크모음 FROM 유저 WHERE 아이디='"+univ_id+"' AND 쿠키='"+cookie+"';", function(error, 유저배열){
        if(error){ console.log(error); return;}
            if(유저배열[0]){
                if(유저배열[0].링크모음.indexOf(fldzm+',')!==-1){
                    db[univ].query("SELECT 번호,제목,태그,작성일,댓글 FROM 게시판_"+fldzm+" WHERE 삭제여부 = 'N' order by 번호 desc Limit "+page*cnt+", "+cnt+";", function(error, 게시글들){
                       db[univ].query("SELECT COUNT(*) as 개수 FROM  게시판_"+fldzm+" WHERE 삭제여부 = 'N' ;", function(error, cnt){ 
                            return res.status(200).json({	  r_data: JSON.stringify(게시글들) , r_cnt: cnt[0].개수 });
                       });
                    })
                }
                else{
                    return res.status(200).json({	  r_data: 'fail_notper' });
                }
            } else{  return res.status(200).json({	  r_data: 'relogin' }); }//유저 없을때
    })
                                        
})
app.post('/api/viewpost', function(req, res){
    let univ = req.body.univ;
    let cookie = req.body.cookie;
    let univ_id = req.body.r_id;
    let fldzm = req.body.link_id;
    let post_num = req.body.post_num;
    let writer = 0;
    
    if(!db[univ])
        return res.status(200).json({r_data: 'relogin'});
        
    db[univ].query("SELECT 링크모음,번호 FROM 유저 WHERE 아이디='"+univ_id+"' AND 쿠키='"+cookie+"';", function(error, 유저배열){
        if(error){ console.log(error); return;}
            if(유저배열[0]){
                if(유저배열[0].링크모음.indexOf(fldzm+',')!==-1){
                    db[univ].query("SELECT 제목,태그,내용,작성일,수정일,추천,비추천,신고,삭제여부,댓글 FROM 게시판_"+fldzm+" WHERE 번호='"+post_num+"';", function(error, 게시글){
                        if(게시글.length!==1)  return res.status(200).json({	  r_data: 'fail_note' });
                        if(게시글[0].삭제여부==='Y') return res.status(200).json({	  r_data: 'fail_delete' });
                        db[univ].query("SELECT 글쓴이 FROM 게시판_"+fldzm+" WHERE 번호='"+post_num+"';", function(error, 글쓴){
                            if(글쓴.length===0) return;
                            if(글쓴[0].글쓴이 === univ_id ) writer =1;
                            
                            let re_writer=[];
                            let 익명=1;
                            let 매칭딕셔={}
                            let 주인딕셔={}
                            db[univ].query("SELECT 번호,글쓴이 FROM 댓글_"+fldzm+" Where 글번호 ='"+post_num+"' AND 삭제여부 = 'N';", function(error, 댓글들1){
                                댓글들1.forEach(item => {
                                    if(item.글쓴이==글쓴[0].글쓴이) 주인딕셔[item.번호]='글쓴이';
                                    else if(매칭딕셔[item.글쓴이]==undefined){
                                        매칭딕셔[item.글쓴이]='익명'+익명++;
                                        주인딕셔[item.번호]= 매칭딕셔[item.글쓴이];
                                    }
                                    else  {주인딕셔[item.번호]= 매칭딕셔[item.글쓴이];}
                                    
                                    if(item.글쓴이==univ_id) re_writer.push(item.번호) 
                                    
                                  })
                                db[univ].query("SELECT 번호,내용,작성일,추천,비추천,신고 FROM 댓글_"+fldzm+" Where 글번호 ='"+post_num+"'  AND 삭제여부 = 'N';", function(error, 댓글들){//렉걸리면 이거빼거 위에꺼 써서 글쓴이만 빼기 
                                    
                                    if(게시글[0].추천) 게시글[0].추천 = JSON.parse(게시글[0].추천)
                                    else 게시글[0].추천=[];
                                    
                                    if(게시글[0].비추천) 게시글[0].비추천 = JSON.parse(게시글[0].비추천)
                                    else 게시글[0].비추천=[];
                                    
                                    if(게시글[0].추천.indexOf(유저배열[0].번호) !== -1) 게시글[0].추천여부=1;
                                    else if(게시글[0].비추천.indexOf(유저배열[0].번호) !== -1) 게시글[0].추천여부=-1;
                                    else 게시글[0].추천여부=0;
                                    
                                    게시글[0].추천=게시글[0].추천.length;
                                    게시글[0].비추천=게시글[0].비추천.length;
                                    
                                    for(var i = 0; i<댓글들.length;i++){
                                        
                                        if(댓글들[i].추천) 댓글들[i].추천 = JSON.parse(댓글들[i].추천)
                                        else 댓글들[i].추천=[];
                                        
                                        if(댓글들[i].비추천) 댓글들[i].비추천 = JSON.parse(댓글들[i].비추천)
                                        else 댓글들[i].비추천=[];
                                    
                                        if(댓글들[i].추천.indexOf(유저배열[0].번호) !== -1) 댓글들[i].추천여부=1;
                                        else if(댓글들[i].비추천.indexOf(유저배열[0].번호) !== -1) 댓글들[i].추천여부=-1;
                                        else 게시글[0].추천여부=0;
                                        
                                        댓글들[i].추천=댓글들[i].추천.length;
                                        댓글들[i].비추천=댓글들[i].비추천.length;
                                    }
                                    
                                    return res.status(200).json({	  r_data: JSON.stringify(게시글[0]), writer: writer,  r_reple_data: JSON.stringify(댓글들) ,r_reple_my: JSON.stringify(re_writer),r_own: JSON.stringify(주인딕셔) });
                                
                                    
                                })
                            })
                            
                            
                            
                            
                            
                        })
                    })
                }
                else{
                    return res.status(200).json({	  r_data: 'fail_notper' });
                }
            }
            else{
                return res.status(200).json({	  r_data: 'relogin' });
            }//유저 없을때
    })
                                        
})
app.post('/api/postpost', function(req, res){
    let univ = req.body.univ;
    let cookie = req.body.cookie;
    let univ_id = req.body.r_id;
    let fldzm = req.body.link_id;
    
    if(!db[univ])
        return res.status(200).json({r_data: 'relogin'});
        
    let title = req.body.title;
    let tag = req.body.tag;
    let context = req.body.context;
    let time=dayjs().format("YYYY-MM-DD HH:mm:ss");
    if(title.length>30) return res.status(200).json({	  r_data: 'fail_title' });
    if(tag.length>20) return res.status(200).json({	  r_data: 'fail_tag' });
    if(context.length>500) return res.status(200).json({	  r_data: 'fail_context' });
    if(title.length<1) return res.status(200).json({	  r_data: 'fail_title_min' });
    if(tag.length<1) return res.status(200).json({	  r_data: 'fail_tag_min' });
    if(context.length<1) return res.status(200).json({	  r_data: 'fail_context_min' });
    console.log(time+' '+univ_id+' 글씀 '+fldzm);
    db[univ].query("SELECT 링크모음 FROM 유저 WHERE 아이디='"+univ_id+"' AND 쿠키='"+cookie+"';", function(error, 유저배열){
        if(error){ console.log(error); return;}
            if(유저배열[0]){
                if(유저배열[0].링크모음.indexOf(fldzm+',')!==-1){
                        
                    db[univ].query("INSERT INTO 게시판_"+fldzm+" (제목,태그,내용,작성일,글쓴이) VALUES (?,?,?,?,?);",[title,tag,context,time,univ_id], function(error, 됐나){
                        if(error){ console.log(error); return res.status(200).json({	  r_data: 'fail_error'}); }
                        else{return res.status(200).json({	  r_data: 'sucsess' });}
                    });
                    
                }else{ return res.status(200).json({	  r_data: 'fail_notper' }); }
                
            }else{ return res.status(200).json({	  r_data: 'relogin' });}//유저 없을때
    })
                                        
})
app.post('/api/commentPost', function(req, res){
    let univ = req.body.univ;
    let cookie = req.body.cookie;
    let univ_id = req.body.r_id;
    let fldzm = req.body.link_id;
    let comment= req.body.comment
    let post_num = req.body.post_num;
    
    if(!db[univ])
        return res.status(200).json({r_data: 'relogin'});
    if(comment.length>100) return res.status(200).json({	  r_data: 'fail_comment' });
    if(comment.length<1) return res.status(200).json({	  r_data: 'fail_comment_min' });
    let time=dayjs().format("YYYY-MM-DD HH:mm:ss");
    
    db[univ].query("SELECT 링크모음 FROM 유저 WHERE 아이디='"+univ_id+"' AND 쿠키='"+cookie+"';", function(error, 유저배열){
        if(error){ console.log(error); return;}
            if(유저배열[0]){
                if(유저배열[0].링크모음.indexOf(fldzm+',')!==-1){
                        
                    db[univ].query("SELECT 번호 FROM 게시판_"+fldzm+" WHERE 번호='"+post_num+"' ;", function(error, 포스트){if(error){ console.log(error); return;}
                        if(포스트.length==1){
                            db[univ].query("INSERT INTO 댓글_"+fldzm+" (글번호,내용,작성일,글쓴이) VALUES (?,?,?,?);",[post_num,comment,time,univ_id], function(error, 됐나){
                                if(error){ console.log(error); return res.status(200).json({	  r_data: 'fail_error'}); }
                                db[univ].query("UPDATE 게시판_"+fldzm+" SET 댓글 = 댓글+1 WHERE 번호='"+post_num+"' ;", function(error, 됐나){
                                    if(error){ console.log(error); return res.status(200).json({	  r_data: 'fail_error'}); }
                                    else{console.log(time+' '+univ_id+' 댓글씀 '+fldzm);return res.status(200).json({	  r_data: 'sucsess' }); }
                                });
                            });
                        }else{ return res.status(200).json({	  r_data: 'fail_postnum' });}//유저 없을때
                    });
                    
                }else{ return res.status(200).json({	  r_data: 'fail_notper' }); }
                
            }else{ return res.status(200).json({	  r_data: 'relogin' });}//유저 없을때
    })
                                        
})
app.post('/api/deletePost', function(req, res){
    let univ = req.body.univ;
    let cookie = req.body.cookie;
    let univ_id = req.body.r_id;
    let fldzm = req.body.link_id;
    let post_num = req.body.post_num;
    
    if(!db[univ])
        return res.status(200).json({r_data: 'relogin'});
    db[univ].query("SELECT 링크모음 FROM 유저 WHERE 아이디='"+univ_id+"' AND 쿠키='"+cookie+"';", function(error, 유저배열){
        if(error){ console.log(error); return;}
            if(유저배열[0]){
                if(유저배열[0].링크모음.indexOf(fldzm+',')!==-1){
                    db[univ].query("SELECT 글쓴이 FROM 게시판_"+fldzm+" Where 번호 ='"+post_num+"';", function(error, 글쓴){
                        if(글쓴.length===0) return;
                        if(글쓴[0].글쓴이 === univ_id ){
                            let time=dayjs().format("YYYY-MM-DD HH:mm:ss");
                            db[univ].query("UPDATE 게시판_"+fldzm+" SET 삭제일 = '"+time+"' , 삭제여부 = 'Y' WHERE 번호 ='"+post_num+"';", function(error, 댓글들){
                                return res.status(200).json({	  r_data: 'sucsess' });
                            })
                        }
                    })
                }else{return res.status(200).json({	  r_data: 'fail_post' }); }
            } else{ return res.status(200).json({	  r_data: 'relogin' });}//유저 없을때
    })
                                        
})
app.post('/api/deleteReply', function(req, res){
    let univ = req.body.univ;
    let cookie = req.body.cookie;
    let univ_id = req.body.r_id;
    let fldzm = req.body.link_id;
    let reply_num = req.body.reply_num;
    
    if(!db[univ])
        return res.status(200).json({r_data: 'relogin'});
    db[univ].query("SELECT 링크모음 FROM 유저 WHERE 아이디='"+univ_id+"' AND 쿠키='"+cookie+"';", function(error, 유저배열){
        if(error){ console.log(error); return;}
            if(유저배열[0]){
                if(유저배열[0].링크모음.indexOf(fldzm+',')!==-1){
                    db[univ].query("SELECT 글쓴이,글번호 FROM 댓글_"+fldzm+" Where 번호 ='"+reply_num+"';", function(error, 글쓴){
                        if(글쓴.length<1){return res.status(200).json({	  r_data: 'no_reply' });}
                        if(글쓴[0].글쓴이 === univ_id ){
                            let post_num = 글쓴[0].글번호;
                            let time=dayjs().format("YYYY-MM-DD HH:mm:ss");
                            db[univ].query("UPDATE 댓글_"+fldzm+" SET 삭제일 = '"+time+"' , 삭제여부 = 'Y' WHERE 번호 ='"+reply_num+"';", function(error, 댓글들){
                                db[univ].query("UPDATE 게시판_"+fldzm+" SET 댓글 = 댓글-1 WHERE 번호='"+post_num+"' ;", function(error, 됐나){
                                    return res.status(200).json({	  r_data: 'sucsess' });
                                })
                            })
                        }
                    })
                }else{return res.status(200).json({	  r_data: 'fail_post' }); }
            } else{ return res.status(200).json({	  r_data: 'relogin' });}//유저 없을때
    })
                                        
})

app.post('/api/edit_auth', function(req, res){
    let univ = req.body.univ;
    let cookie = req.body.cookie;
    let univ_id = req.body.r_id;
    let fldzm = req.body.link_id;
    let post_num = req.body.post_num;
    let writer = 0;
    if(!db[univ])
        return res.status(200).json({r_data: 'relogin'});
    db[univ].query("SELECT 링크모음 FROM 유저 WHERE 아이디='"+univ_id+"' AND 쿠키='"+cookie+"';", function(error, 유저배열){
        if(error){ console.log(error); return;}
            if(유저배열[0]){
                db[univ].query("SELECT 글쓴이 FROM 게시판_"+fldzm+" WHERE 번호='"+post_num+"';", function(error, 글쓴){
                    if(글쓴.length ===0) return res.status(200).json({	  r_data: 'fail_postnum' });
                    if(글쓴[0].글쓴이 === univ_id ) writer =1;
                    return res.status(200).json({ r_data: writer});
                
                })
            }
            else{
                return res.status(200).json({	  r_data: 'relogin' });
            }//유저 없을때
    })
                                        
})
app.post('/api/edit_post', function(req, res){
    let univ = req.body.univ;
    let cookie = req.body.cookie;
    let univ_id = req.body.r_id;
    let fldzm = req.body.link_id;
    
    if(!db[univ])
        return res.status(200).json({r_data: 'relogin'});
    let title = req.body.title;
    let tag = req.body.tag;
    let context = req.body.context;
    
    let post_num = req.body.post_num;
    
    let time=dayjs().format("YYYY-MM-DD HH:mm:ss");
    
    if(title.length>30) return res.status(200).json({	  r_data: 'fail_title' });
    if(tag.length>20) return res.status(200).json({	  r_data: 'fail_tag' });
    if(context.length>500) return res.status(200).json({	  r_data: 'fail_context' });
    if(title.length<1) return res.status(200).json({	  r_data: 'fail_title_min' });
    if(tag.length<1) return res.status(200).json({	  r_data: 'fail_tag_min' });
    if(context.length<1) return res.status(200).json({	  r_data: 'fail_context_min' });
    console.log(time+' '+univ_id+' 글씀 '+fldzm);
    db[univ].query("SELECT 링크모음 FROM 유저 WHERE 아이디='"+univ_id+"' AND 쿠키='"+cookie+"';", function(error, 유저배열){
        if(error){ console.log(error); return;}
            if(유저배열[0]){
                if(유저배열[0].링크모음.indexOf(fldzm+',')!==-1){
                        "UPDATE 게시판_"+fldzm+" SET 제목=?, 태그=?, 내용=?, 수정일=?, WHERE 번호='"+post_num+"';"
                        
                    db[univ].query("UPDATE 게시판_"+fldzm+" SET 제목=?, 태그=?, 내용=?, 수정일=? WHERE 번호='"+post_num+"';",[title,tag,context,time,post_num], function(error, 됐나){
                        if(error){ console.log(error); return res.status(200).json({	  r_data: 'fail_error'}); }
                        else{return res.status(200).json({	  r_data: 'sucsess' });}
                    });
                    
                }else{ return res.status(200).json({	  r_data: 'fail_notper' }); }
                
            }else{ return res.status(200).json({	  r_data: 'relogin' });}//유저 없을때
    })
                                        
})

app.post('/api/agree', function(req, res){
    let univ = req.body.univ;
    let cookie = req.body.cookie;
    let univ_id = req.body.r_id;
    let fldzm = req.body.link_id;
    let post_num = req.body.post_num;
    
    if(!db[univ])
        return res.status(200).json({r_data: 'relogin'});
    let time=dayjs().format("YYYY-MM-DD HH:mm:ss");
    
    console.log(time+' '+univ_id+' 추천 '+fldzm+' '+post_num);
    db[univ].query("SELECT 번호,링크모음 FROM 유저 WHERE 아이디='"+univ_id+"' AND 쿠키='"+cookie+"';", function(error, 유저배열){
        if(error){ console.log(error); return;}
            if(유저배열[0]){
                if(유저배열[0].링크모음.indexOf(fldzm+',')!==-1){
                        
                    db[univ].query("SELECT 번호,추천,비추천 FROM 게시판_"+fldzm+" WHERE 번호='"+post_num+"' ;", function(error, 포스트){if(error){ console.log(error); return;}
                        if(포스트.length==1){
                            let 딕셔 = JSON.parse(포스트[0].추천);
                            let 반대딕셔 = JSON.parse(포스트[0].비추천);
                            
                            if(딕셔===null){  딕셔=[]; }         //사용자 딕셔너리 없으면 만들고
                            if(반대딕셔===null){  반대딕셔=[];}         //사용자 딕셔너리 없으면 만들고
                            
                            if(딕셔.indexOf(유저배열[0].번호) !== -1) return res.status(200).json({	  r_data: 'exit' });    //이미 추천 했으면 리턴
                            if(반대딕셔.indexOf(유저배열[0].번호) !== -1) return res.status(200).json({	  r_data: 'exit_0' });    //이미 비추천 했으면 리턴
                            
                            딕셔.push(유저배열[0].번호);
                            db[univ].query("UPDATE 게시판_"+fldzm+" SET 추천 = '"+JSON.stringify(딕셔)+"' WHERE 번호='"+post_num+"' ;", function(error, 됐나){
                                if(error){ console.log(error); return res.status(200).json({	  r_data: 'fail_error'}); }
                                else{
                                    return res.status(200).json({	  r_data: 'sucsess' });
                                }
                            });
                            
                        }else{ return res.status(200).json({	  r_data: 'fail_postnum' });}//유저 없을때
                    });
                    
                }else{ return res.status(200).json({	  r_data: 'fail_notper' }); }
                
            }else{ return res.status(200).json({	  r_data: 'relogin' });}//유저 없을때
    })
                                        
})
app.post('/api/disagree', function(req, res){
    let univ = req.body.univ;
    let cookie = req.body.cookie;
    let univ_id = req.body.r_id;
    let fldzm = req.body.link_id;
    let post_num = req.body.post_num;
    
    if(!db[univ])
        return res.status(200).json({r_data: 'relogin'});
    let time=dayjs().format("YYYY-MM-DD HH:mm:ss");
    
    console.log(time+' '+univ_id+' 비추천 '+fldzm+' '+post_num);
    db[univ].query("SELECT 링크모음,번호 FROM 유저 WHERE 아이디='"+univ_id+"' AND 쿠키='"+cookie+"';", function(error, 유저배열){
        if(error){ console.log(error); return;}
            if(유저배열[0]){
                if(유저배열[0].링크모음.indexOf(fldzm+',')!==-1){
                        
                    db[univ].query("SELECT 번호,추천,비추천 FROM 게시판_"+fldzm+" WHERE 번호='"+post_num+"' ;", function(error, 포스트){if(error){ console.log(error); return;}
                        if(포스트.length==1){
                            let 딕셔 = JSON.parse(포스트[0].비추천);
                            let 반대딕셔 = JSON.parse(포스트[0].추천);
                            
                            if(딕셔===null){  딕셔=[];}         //사용자 딕셔너리 없으면 만들고
                            if(반대딕셔===null){  반대딕셔=[]; }         //사용자 딕셔너리 없으면 만들고
                            
                            if(딕셔.indexOf(유저배열[0].번호) !== -1) return res.status(200).json({	  r_data: 'exit' });    //이미 추천 했으면 리턴
                            if(반대딕셔.indexOf(유저배열[0].번호) !== -1) return res.status(200).json({	  r_data: 'exit_0' });    //이미 비추천 했으면 리턴
                            반대딕셔.push(유저배열[0].번호);
                            db[univ].query("UPDATE 게시판_"+fldzm+" SET 비추천 = '"+JSON.stringify(반대딕셔)+"' WHERE 번호='"+post_num+"' ;", function(error, 됐나){
                                if(error){ console.log(error); return res.status(200).json({	  r_data: 'fail_error'}); }
                                else{
                                    return res.status(200).json({	  r_data: 'sucsess' });
                                }
                            });
                            
                        }else{ return res.status(200).json({	  r_data: 'fail_postnum' });}//유저 없을때
                    });
                    
                }else{ return res.status(200).json({	  r_data: 'fail_notper' }); }
                
            }else{ return res.status(200).json({	  r_data: 'relogin' });}//유저 없을때
    })
                                        
})

app.post('/api/co_agree', function(req, res){
    let univ = req.body.univ;
    let cookie = req.body.cookie;
    let univ_id = req.body.r_id;
    let fldzm = req.body.link_id;
    let post_num = req.body.post_num;
    let comment_num = req.body.comment_num;
    
    if(!db[univ])
        return res.status(200).json({r_data: 'relogin'});
    let time=dayjs().format("YYYY-MM-DD HH:mm:ss");
    
    console.log(time+' '+univ_id+' 댓추천 '+fldzm+' '+post_num);
    db[univ].query("SELECT 링크모음,번호 FROM 유저 WHERE 아이디='"+univ_id+"' AND 쿠키='"+cookie+"';", function(error, 유저배열){
        if(error){ console.log(error); return;}
            if(유저배열[0]){
                if(유저배열[0].링크모음.indexOf(fldzm+',')!==-1){
                        
                    db[univ].query("SELECT 번호,추천,비추천 FROM 댓글_"+fldzm+" WHERE 글번호='"+post_num+"' AND 번호='"+comment_num+"' ;", function(error, 포스트){if(error){ console.log(error); return;}
                        if(포스트.length==1){
                            let 딕셔 = JSON.parse(포스트[0].추천);
                            let 반대딕셔 = JSON.parse(포스트[0].비추천);
                            
                            if(딕셔===null){ 딕셔=[];} 
                            if(반대딕셔===null){  반대딕셔=[];} 
                            
                            if(딕셔.indexOf(유저배열[0].번호) !== -1) return res.status(200).json({	  r_data: 'exit' });    //이미 추천 했으면 리턴
                            if(반대딕셔.indexOf(유저배열[0].번호) !== -1) return res.status(200).json({	  r_data: 'exit_0' });    //이미 비추천 했으면 리턴
                            딕셔.push(유저배열[0].번호);
                            db[univ].query("UPDATE 댓글_"+fldzm+" SET 추천 = '"+JSON.stringify(딕셔)+"' WHERE 글번호='"+post_num+"' AND 번호='"+comment_num+"';", function(error, 됐나){
                                if(error){ console.log(error); return res.status(200).json({	  r_data: 'fail_error'}); }
                                else{
                                    return res.status(200).json({ r_data: 'sucsess' });
                                }
                            });
                            
                        }else{ return res.status(200).json({	  r_data: 'fail_postnum' });}//유저 없을때
                    });
                    
                }else{ return res.status(200).json({	  r_data: 'fail_notper' }); }
                
            }else{ return res.status(200).json({	  r_data: 'relogin' });}//유저 없을때
    })
                                        
})
app.post('/api/co_disagree', function(req, res){
    let univ = req.body.univ;
    let cookie = req.body.cookie;
    let univ_id = req.body.r_id;
    let fldzm = req.body.link_id;
    let post_num = req.body.post_num;
    let comment_num = req.body.comment_num;
    
    if(!db[univ])
        return res.status(200).json({r_data: 'relogin'});
    let time=dayjs().format("YYYY-MM-DD HH:mm:ss");
    
    console.log(time+' '+univ_id+' 댓추천 '+fldzm+' '+post_num);
    db[univ].query("SELECT 링크모음,번호 FROM 유저 WHERE 아이디='"+univ_id+"' AND 쿠키='"+cookie+"';", function(error, 유저배열){
        if(error){ console.log(error); return;}
            if(유저배열[0]){
                if(유저배열[0].링크모음.indexOf(fldzm+',')!==-1){
                        
                    db[univ].query("SELECT 번호,추천,비추천 FROM 댓글_"+fldzm+" WHERE 글번호='"+post_num+"' AND 번호='"+comment_num+"' ;", function(error, 포스트){if(error){ console.log(error); return;}
                        if(포스트.length==1){
                            let 딕셔 = JSON.parse(포스트[0].비추천);
                            let 반대딕셔 = JSON.parse(포스트[0].추천);
                            
                            if(딕셔===null){  딕셔=[];}         //사용자 딕셔너리 없으면 만들고
                            if(반대딕셔===null){  반대딕셔=[]; }         //사용자 딕셔너리 없으면 만들고
                            
                            if(딕셔.indexOf(유저배열[0].번호) !== -1) return res.status(200).json({	  r_data: 'exit' });    //이미 추천 했으면 리턴
                            if(반대딕셔.indexOf(유저배열[0].번호) !== -1) return res.status(200).json({	  r_data: 'exit_0' });    //이미 비추천 했으면 리턴
                            
                            반대딕셔.push(유저배열[0].번호);
                            db[univ].query("UPDATE 댓글_"+fldzm+" SET 비추천 = '"+JSON.stringify(반대딕셔)+"' WHERE 글번호='"+post_num+"' AND 번호='"+comment_num+"';", function(error, 됐나){
                                if(error){ console.log(error); return res.status(200).json({	  r_data: 'fail_error'}); }
                                else{
                                   return res.status(200).json({	  r_data: 'sucsess' });
                                }
                            });
                            
                        }else{ return res.status(200).json({	  r_data: 'fail_postnum' });}//글 없을때
                    });
                    
                }else{ return res.status(200).json({	  r_data: 'fail_notper' }); }
                
            }else{ return res.status(200).json({	  r_data: 'relogin' });}//유저 없을때
    })
                                        
})

app.post('/api/getchat', function(req, res){
    let univ = req.body.univ;
    let cookie = req.body.cookie;
    let univ_id = req.body.r_id;
    let type = req.body.r_type;
    let today = new Date();  
    
    if( !(type==='학교' || type==='학과')){ console.log('비정상 타입(getchat) '+type+': '+univ+' '+univ_id+' ');return}
    if(!db[univ])
        return res.status(200).json({r_data: 'relogin'});
    console.log(today.getFullYear()+'/'+(today.getMonth() + 1)+'/'+today.getDate()+' '+today.getHours()+':'+today.getMinutes()+':'+today.getSeconds()+' '+univ_id+' 챗목록: '+type);
    db[univ].query("SELECT 번호, 학과 FROM 유저 WHERE 아이디='"+univ_id+"' AND 쿠키='"+cookie+"';", function(error, 유저배열){
        //www에서 방 당 닉네임도 추가해서 거기에[ 아이디 있는지 확인 후 허가
        if(error){ console.log(error); return;}
            if(유저배열[0]){
                var addinfo = '';
                if(type==='학과') addinfo=유저배열[0].학과;
                var room_id = type+"_"+univ+"_"+addinfo;
                db[univ].query("SELECT 날짜,내용,닉네임타입,닉네임,삭제여부 FROM 메신저_"+room_id+" ;", function(error, 챗들){
                    return res.status(200).json({	  r_data: JSON.stringify(챗들)  });
                })
            }
            else{
                return res.status(200).json({	  r_data: 'relogin' });
            }//유저 없을때
    })
                                        
})
app.post('/api/getnick', function(req, res){
    let univ = req.body.univ;
    let cookie = req.body.cookie;
    let univ_id = req.body.r_id;
    let depart = req.body.depart;
    let today = new Date();  
    
    if(!db[univ])
        return res.status(200).json({r_data: 'relogin'});
    console.log(today.getFullYear()+'/'+(today.getMonth() + 1)+'/'+today.getDate()+' '+today.getHours()+':'+today.getMinutes()+':'+today.getSeconds()+' '+univ_id+' 겟닉 ');
    db[univ].query("SELECT 닉네임_학교,닉네임_학과,익명_학교,익명_학과,익명_학교_시간,익명_학과_시간 FROM 유저 WHERE 아이디='"+univ_id+"' AND 쿠키='"+cookie+"';", function(error, 유저배열){
        if(error){ console.log(error); return;}
            if(유저배열[0]){
                
                if(유저배열[0].익명_학교===0){
                    var time = dayjs().format("YYYY-MM-DD");
                    db[univ].query("SELECT MAX(익명_학교) as 수 FROM 유저;", function(error, 최고익명){
                        db[univ].query("UPDATE 유저 SET 익명_학교 = '"+(최고익명[0].수+1)+"', 익명_학교_시간='"+time+"' WHERE 아이디='"+univ_id+"' AND 쿠키='"+cookie+"';", function(error, 최고익명){console.log('학교 익 생성')}) 
                    });
                }
                if(유저배열[0].익명_학과===0){
                    db[univ].query("SELECT MAX(익명_학과) as 수 FROM 유저 Where 학과 ='"+depart+"';", function(error, 최고익명){
                        db[univ].query("UPDATE 유저 SET 익명_학과 = '"+(최고익명[0].수+1)+"', 익명_학과_시간='"+time+"' WHERE 아이디='"+univ_id+"' AND 쿠키='"+cookie+"';", function(error, 최고익명){console.log('학과 익 생성')}) 
                    });
                }
                    return res.status(200).json({	  r_data: JSON.stringify(유저배열) });
            }
            else{
                return res.status(200).json({	  r_data: 'relogin' });
            }//유저 없을때
    })
                                        
})

app.post('/api/checknick', function(req, res){
    let univ = req.body.univ;
    let univ_id = req.body.r_id;
    let type = req.body.type;
    let nick = req.body.nick;
    let today = new Date();  
    if( !(type==='학교' || type==='학과')){ console.log('비정상 타입(checknick) '+type+': '+univ+' '+univ_id);return}
    
    console.log(today.getFullYear()+'/'+(today.getMonth() + 1)+'/'+today.getDate()+' '+today.getHours()+':'+today.getMinutes()+':'+today.getSeconds()+' '+univ_id+' 췤닉: '+nick);
     if(nick.length < 2 || nick.length > 10) 
        return res.status(200).json({	  r_data: 'fail_nick' ,msg:'2~10자를 지켜주세요.'}); 
        
    var chk = /[0-9]|[a-z]|[A-Z]|[가-힣]/;
    for( var i = 0; i <= nick.length -1 ; i++ ) {
        if(chk.test(nick.charAt(i))) {}
        else  { return res.status(200).json({	  r_data: 'fail_nick' ,msg:'한글, 숫자, 영어만 가능합니다.'}); } 
        
    }
    
    db[univ].query("SELECT 번호 FROM 유저 WHERE 닉네임_"+type+"='"+nick+"' ;", function(error, 닉배열){
        if(error){ console.log(error); return;}
            if(닉배열.length==0){
                return res.status(200).json({	  r_data: 'ok_nick' });
            }
            else{
                return res.status(200).json({	  r_data: 'exis_nick' });
            }//유저 없을때
    })
                                        
})
app.post('/api/setnick', function(req, res){
    let univ = req.body.univ;
    let cookie = req.body.cookie;
    let univ_id = req.body.r_id;
    let type = req.body.type;
    let nick = req.body.nick;
    let today = new Date();  
    if( !(type==='학교' || type==='학과')){ console.log('비정상 타입(setnick) '+type+': '+univ+' '+univ_id+' ');return}
    if(!db[univ])
        return res.status(200).json({r_data: 'relogin'});
        
    console.log(today.getFullYear()+'/'+(today.getMonth() + 1)+'/'+today.getDate()+' '+today.getHours()+':'+today.getMinutes()+':'+today.getSeconds()+' '+univ_id+' 셋닉: '+nick);
    db[univ].query("SELECT 닉네임_"+type+" as 유저닉넴 FROM 유저 WHERE 아이디='"+univ_id+"' AND 쿠키='"+cookie+"';", function(error, 유저배열){
        if(!유저배열){ console.log('셋닉_유저배열 없음'); return;}
        if(유저배열.length===1){
            if(유저배열[0].유저닉넴)  return res.status(200).json({	  r_data: 'fail_nick' ,msg:'이미 닉네임이 설정 돼있습니다.'}); 
         if(nick.length < 2 || nick.length > 10) 
            return res.status(200).json({	  r_data: 'fail_nick' ,msg:'2~10자를 지켜주세요.'}); 
            
        var chk = /[0-9]|[a-z]|[A-Z]|[가-힣]/;
        for( var i = 0; i <= nick.length -1 ; i++ ) {
            if(chk.test(nick.charAt(i))) {}
            else  { return res.status(200).json({	  r_data: 'fail_nick' ,msg:'한글, 숫자, 영어만 가능합니다.'}); } 
            
        }
        
        db[univ].query("SELECT 번호 FROM 유저 WHERE 닉네임_"+type+"='"+nick+"' ;", function(error, 닉배열){
            if(error){ console.log(error); return;}
                if(닉배열.length==0){
                    db[univ].query("UPDATE 유저 SET 닉네임_"+type+" = '"+nick+"' WHERE 아이디='"+univ_id+"' AND 쿠키='"+cookie+"';", function(error, 최고익명){}) 
                    return res.status(200).json({	  r_data: 'ok_nick' });
                }
                else{
                    return res.status(200).json({	  r_data: 'exis_nick' });
                }
        })
        }else{return res.status(200).json({	  r_data: 'relogin' });}//유저 없을때
    });                                     
})

app.post('/api/newAnon', function(req, res){
    let univ = req.body.univ;
    let cookie = req.body.cookie;
    let univ_id = req.body.r_id;
    let type = req.body.type;
    let today = new Date();  
    if( !(type==='학교' || type==='학과')){ console.log('비정상 타입(newAnon) '+type+': '+univ+' '+univ_id+' '+cookie);return}
    if(!db[univ])
        return res.status(200).json({r_data: 'relogin'});
        
    console.log(today.getFullYear()+'/'+(today.getMonth() + 1)+'/'+today.getDate()+' '+today.getHours()+':'+today.getMinutes()+':'+today.getSeconds()+' '+univ_id+' 뉴익명: '+type);
    db[univ].query("SELECT 익명_"+type+" as 유저익명, 익명_"+type+"_시간 as 유저익명시간 FROM 유저 WHERE 아이디='"+univ_id+"' AND 쿠키='"+cookie+"';", function(error, 유저배열){
        if(!유저배열){ console.log('뉴익명_유저배열 없음'); return;}
        if(유저배열.length===1){
        if(!유저배열[0].유저익명)  return res.status(200).json({	  r_data: 'fail_nick' ,msg:'익명 번호가 설정돼있지 않습니다'}); 
            
        var time = dayjs().format("YYYY-MM-DD");
        if(유저배열[0].유저익명시간>=time) return res.status(200).json({	  r_data: 'fail_nick' ,msg:'번호를 오늘은 바꿀수 없어요 내일 다시 해봐요!'});
        var change_num=0;
        db[univ].query("SELECT MAX(익명_"+type+") as 수 FROM 유저;", function(error, 최고익명){
            change_num = (최고익명[0].수+1);
            db[univ].query("UPDATE 유저 SET 익명_"+type+"= '"+(최고익명[0].수+1)+"', 익명_"+type+"_시간='"+time+"' WHERE 아이디='"+univ_id+"' AND 쿠키='"+cookie+"';", function(error, 최고익명){console.log(type+' 익 변경완료'+univ_id)}) 
        
            return res.status(200).json({	  r_data: 'ok_nick' ,newNum:change_num });
            
        });
            
        }else{return res.status(200).json({	  r_data: 'relogin' });}//유저 없을때
    });                                     
})
const arrayToChunks = (array, CHUNKSIZE) => { const results = []; let start = 0;while (start < array.length) { results.push(array.slice(start, start + CHUNKSIZE)); start += CHUNKSIZE;  }return results;};

app.post('/api/crowing', function(req, res){
    var univ = req.body.r_univ;	        
    db['guamegi'].query("SELECT * FROM 학교리스트 WHERE 학교이름='"+univ+"';", function(error, 학교정보들){
    if(학교정보들.length != 1){ return res.status(200).json({	  r_data: 'fail_univ' }); }
    let 학교=학교정보들[0];
    if(univ==='목포대학교'||univ==='우송대학교'){
            var cook = req.body.cookie;
            var cookie = 학교.쿠키명+'='+cook;     
           axios.get(학교.수업들사이트, {headers: { Cookie: cookie+';' }})    
           .then(response  => {
               
            
            const $ = cheerio.load(response.data);
            const lists = $(학교.강의목록);               
            const name = $(학교.이름위치).text();    
            if(name=='')
                return res.status(200).json({	  r_data: 'fail' });    //세션만료
            const department = $(학교.학과위치).text();                 
            
            let today = new Date();  
            var logText = '['+today.getFullYear()+'/'+(today.getMonth() + 1)+'/'+today.getDate()+' '+today.getHours()+':'+today.getMinutes()+':'+today.getSeconds()+']'+univ+' '+department+' '+name;
            console.log(logText);
            log('crawling',logText)
            if(lists==''){
                db[univ].query("UPDATE 유저 SET 학과 = ? WHERE 아이디='"+req.body.univ_id+"' AND 쿠키='"+cook+"';",[department], function(error, 됐){}) 
                return res.status(200).json({	  r_data: 'fail_list' , r_depart: department });
            }                        
             db[univ].query("UPDATE 유저 SET 학과 = ? WHERE 아이디='"+req.body.univ_id+"' AND 쿠키='"+cook+"';",[department], function(error, 됐){}) 
            var link_arr =[]
            //모든 강의 과제 링크 구하기
            lists.each((index, list) => {
            
                const title = $(list).find(학교.강의명위치).text();            
                const prof = $(list).find(학교.교수명위치).text();           
                const fldzm = $(list).find(학교.수업링크위치).attr('href');             
                link_arr.push(title+'#나눔#'+prof+'#나눔#'+학교.과제종합링크+학교.링크자르기+fldzm.split(학교.링크자르기)[1])          
            });
            var 전체배열 = [];
            var end = 0
            
             const CHUNKSIZE = link_arr.length;
             const chunkedLinks = arrayToChunks(link_arr, CHUNKSIZE);
            if(chunkedLinks.length===0) return res.status(200).json({	  r_data: 'fail_list' });
            var re_link ='';
            
            for (var chunk of chunkedLinks) { // 2
                const productObjectPromises = chunk.map((link) => getProductObject(link)); // 3: 비동기 병렬처리를 위한 핵심 코드
                Promise.all(productObjectPromises); // 4: 비동기 병렬처리를 위한 핵심 코드
            }
            
            
            function getProductObject(link){            //수업들
                
                var sp =  link.split('#나눔#');
                var title = sp[0];
                var prof = sp[1];
                var fldzm = sp[2];
                
                var 큰딕셔 = {};
                
                var simple_fldzm = fldzm.split(학교.링크자르기)[1]; 
                큰딕셔['수업'] = title;
                큰딕셔['교수'] = prof;
                큰딕셔['링크'] = simple_fldzm;
                
                save_cls(univ,simple_fldzm);
                re_link+= (simple_fldzm+','); 
                
                axios.get(fldzm, {headers: {Cookie: cookie+';'}})     
                .then(response2 => { //과제들 있는 링크
                    const $2 = cheerio.load(response2.data);
                    const list2 = $2(학교.과제리스트위치);     
                    var 작은배열 = [];
                    list2.each((index2, list2) => {
                        const 제출여부 = $2(list2).find(학교.제출여부위치).text();   
                        let sucsess=0;
                        if(제출여부==='제출 완료') sucsess=1;
                        var 작은딕셔 = {};
                        const cls_name = $2(list2).find(학교.과제이름위치).text();            
                        if(cls_name!==''){
                            const holydate = $2(list2).find(학교.제출일위치).text();                      
                            const 과제링크 = $(list2).find(학교.과제링크위치).attr('href');                    //과제링크 
                            작은딕셔['과제이름'] = cls_name;
                            작은딕셔['제출일'] = holydate;
                            작은딕셔['제출여부'] = sucsess;
                            작은딕셔['과제링크'] = 과제링크;
                            작은배열.push(작은딕셔);
                        }
                            
                            
                    });
                    큰딕셔['과제'] = 작은배열;
                }).then(res3=>{
                    end++;
                    전체배열.push(큰딕셔);
                            
                            if(end==CHUNKSIZE){
                                
                                db[univ].query("SELECT '번호' FROM 유저 WHERE 아이디='"+req.body.univ_id+"';", function(error, 유저배열){
                                if(error){ console.log(error); return;}
                                    if(유저배열[0]){
                                        db[univ].query("UPDATE 유저 SET 마지막크롤링 = ? , 링크모음 = ? WHERE  아이디=?;", [req.body.r_reload, re_link, req.body.univ_id],function(error, 됐나){if(error){ console.log(error); }});
                                   
                                        return res.status(200).json({
                                          r_data: JSON.stringify(전체배열),
                                          r_reload: req.body.r_reload,
                                          r_depart: department
                                       });
                                        
                                        
                                    }//유저배열>1
                                    else{
                                        return res.status(200).json({	  r_data: 'relogin' });
                                    }
                                });
                            }
                       
                    
                })
            }
               
           });
                
        } 
    });
    
});

function log(fileName,logText){
    var fs = require('fs');
    var fname='log/'+fileName+'.txt';
    
    fs.appendFile(fname, logText+'\n', function (err) {
          if (err) throw err;
    });
    
}

function save_cls(univ,slink){
     
    let table_name = '게시판_'+slink;
    let table_name2 = '댓글_'+slink;
      let 게시판db = `create table if not exists `+table_name+`(
                             번호        INT NOT NULL AUTO_INCREMENT,
                             제목     VARCHAR(30),
                             태그    VARCHAR(50),  
                             내용    VARCHAR(500),  
                             댓글    INT DEFAULT 0 NOT NULL,  
                             작성일 VARCHAR(20),
                             수정일 VARCHAR(20),
                             글쓴이 VARCHAR(50),
                             삭제여부 CHAR(1) DEFAULT 'N' NOT NULL,
                             삭제일 VARCHAR(20),
                             추천 VARCHAR(50000),
                             비추천 VARCHAR(50000),
                             신고 INT  DEFAULT 0 NOT NULL,
                          PRIMARY KEY(번호)) ENGINE=MYISAM CHARSET=utf8;`;
                          
      let 댓글db = `create table if not exists `+table_name2+`(
                             번호        INT NOT NULL AUTO_INCREMENT,
                             글번호     INT,
                             상위댓글번호 INT DEFAULT 0 NOT NULL,
                             내용    VARCHAR(100),  
                             작성일 VARCHAR(20),
                             수정일 VARCHAR(20),
                             글쓴이 VARCHAR(50),
                             삭제여부 CHAR(1) DEFAULT 'N' NOT NULL,
                             삭제일 VARCHAR(20),
                             추천 VARCHAR(50000),
                             비추천 VARCHAR(50000),
                             신고 INT  DEFAULT 0 NOT NULL,
                          PRIMARY KEY(번호)) ENGINE=MYISAM CHARSET=utf8;`;
                      
    db[univ].query(게시판db, function(err, results, fields) {if (err) {  console.log(err.message); } });
    db[univ].query(댓글db, function(err, results, fields) {if (err) {  console.log(err.message); } });

}
//로그인 -> 쿠키 가져오기
app.post('/api/login', function(req, res){		
   const input_u_name = req.body.univ_name;
   const input_u_id = req.body.univ_id;
   const input_u_pw = req.body.univ_pw;
   
    var 리턴메시지 = '';
    var 리턴상태 ='';
    var 리턴대학='';
    var 리턴쿠키='';
    var 리턴마지막크롤시간='';
    var 로그인링크='';
    
   db['guamegi'].query("SELECT * FROM 학교리스트 WHERE 학교이름='"+input_u_name+"';", function(error, 학교정보들){
          if(학교정보들.length != 1){ 리턴메시지 = '대학교가 잘못됐습니다 원인: 값변조';리턴상태='로그인실패_노대학';ret();return;}//리턴하고 값수정 하지말라고 그래
          const 학교정보=학교정보들[0];
          
        
        (async () => {
            
            if(browser===null){  browser = await puppeteer.launch(getBrowserLaunchOptions()); console.log('킴 login')}
            
            const page = await browser.newPage();
            await page.setRequestInterception(true);
            
            page.on('request', (req, Request) => { switch (req.resourceType()) {case 'stylesheet':case 'font': case 'image': req.abort(); break;default:req.continue(); break; }}); //로딩빠르게
            
            await page.goto(학교정보.로그인사이트);
            
            const id입력 = 학교정보.id입력칸;
            const pw입력 = 학교정보.pw입력칸;
            
            await page.evaluate((input_u_id, input_u_pw,id입력,pw입력) => {
                document.querySelector(id입력).value = input_u_id;
                document.querySelector(pw입력).value = input_u_pw;
            }, input_u_id, input_u_pw,id입력,pw입력);
            
            
            //로그인 버튼을 클릭해라
            await page.click(학교정보.로그인버튼)
            
            const responseData = (page) => {
               return new Promise(resolve => {
                   page.on("response", async (response) => {
                       if(response.url().indexOf(학교정보.sso링크)!== -1) 로그인링크=response.url();
                       if (response.url()===학교정보.로그인성공사이트){
                            let cookies = await page.cookies();
                            var login_cook='';
                            for(var ii =0 ; ii< cookies.length;ii++){
                                if(cookies[ii]['name'] === 학교정보.쿠키명){
                                    login_cook = cookies[ii]['value'];
                                    break;
                                }
                            }
                            if(login_cook !== ''){          //쿠키값까지 전부 받아왔을시 ★최종 로그인 완료!
                                //아이디로 유저검색
                                db[input_u_name].query("SELECT '번호,마지막크롤링' FROM 유저 WHERE 아이디='"+input_u_id+"';", function(error, 유저배열){
                                    if(유저배열[0]){
                                         db[input_u_name].query("UPDATE 유저 SET 쿠키 = ?, 자동로그인 = ? WHERE  아이디=?;", [login_cook,false,input_u_id],function(error, 됐나){
                                             
                                                if(error){ console.log(error); }
                                                else{
                                                    리턴메시지 = '기존유저 로그인 인증 완료';
                                                    리턴상태='로그인성공';
                                                    리턴대학=input_u_name;
                                                    리턴쿠키=login_cook;
                                                    리턴마지막크롤시간=유저배열[0].마지막크롤링;
                                                    ret();
                                                
                                                }
                                             
                                         });
                                    }
                                    else{
                                        console.log('유저없음');
                                        //유저정보 저장
                                         db[input_u_name].query("INSERT INTO 유저 (아이디,쿠키,자동로그인) VALUES (?,?,?);",[input_u_id,login_cook,false], function(error, 됐나){
                                                if(error){ console.log(error); }
                                                else{
                                                    리턴메시지 = '신규유저 로그인 성공 유저정보를 저장완료하였습니다.';
                                                    리턴상태='로그인성공';
                                                    리턴대학=input_u_name;
                                                    리턴쿠키=login_cook;
                                                    ret();
                                                }
                                         });
                                    }
                                });
                                //있으면 쿠키에 새로 저장
                                //없으면 아이디 비번(암호화) 쿠키 저장
                                
                            }
                            else{
                                리턴메시지 = '로그인에 문제가 생겼습니다 원인: 홈페이지 조치중 쿠키';
                                리턴상태='로그인실패_쿠키';
                            ret();
                            }
                            
                       }
                       
                        else if(response.url().includes(학교정보.로그인실패사이트)){
                            리턴메시지 = '로그인에 실패하였습니다.\n 아이디 비밀번호를 다시 확인하거나\n학교 로그인 사이트의 문제일 수 있습니다.';
                            리턴상태='로그인실패_실패사이트';
                            ret();
                        }
                                    
                        resolve(1);
                   });
               });
           }
   
            await responseData(page);
            await page.waitFor(10000);
             //브라우저 꺼라
            await page.close();    
        })();
    });
       function ret(){
           
           try {
                return res.status(200).json({				// front 서버에 json 형태로 '잘 받음' message 리턴
                      state: 리턴상태,
                      message: 리턴메시지,
                      r_univ: 리턴대학,
                      r_cookie: 리턴쿠키,
                      r_time: 리턴마지막크롤시간,
                      r_loginLink:로그인링크,
                   });
            } catch (error) {
              console.error('2번');
            }
        }   
   
   
   
   
});
// catch 404 and forward to error handler

app.post('/api/getSession', function(req, res){
    var univ = req.body.r_univ;	          
    var 과제링크 = req.body.과제링크;
    
    db['guamegi'].query("SELECT * FROM 학교리스트 WHERE 학교이름='"+univ+"';", function(error, 학교정보들){
    if(학교정보들.length != 1){ return res.status(200).json({	  r_data: 'fail_univ' }); }
    let 학교=학교정보들[0];
    if(univ==='목포대학교'){
            var cook = req.body.cookie;
            var cookie = 학교.쿠키명+'='+cook;                                                 //수정 쿠키명
            
           axios.get(학교.수업들사이트, {headers: { Cookie: cookie+';' }})               //수정 접속메인사이트
           .then(response  => {
               
            
            const $ = cheerio.load(response.data);
            const lists = $(학교.강의목록);                   //수정 강의목록
            const name = $('.user_department.hidden-xs').text();                                     //수정 이름위치
            if(name=='')
                return res.status(200).json({	  r_data: 'fail' });
            else{
                return res.status(200).json({	  r_data: 'sucsess', r_cookie:학교.쿠키명  });
            }
           });
                
        } 
    });
    
});

app.post('/api/ErrorReport', function(req, res){
    let today = new Date();  
    today = "\n\n["+today.toLocaleString() +']'+requestIp.getClientIp(req)+'\n';
   console.log('리폿\n: '+req.body.context)
   log('ErrorReport.txt',today+req.body.context)
    return res.status(200).json({	  r_data: 'sucsess' });
});
app.all('*',function(req,res){
    console.log('d')
	if(!req.secure){
		res.redirect("https://mnuhw.xyz"+ req.url);
	}
    else res.sendfile(path.join(__dirname, './public/index.html'));
});


// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
