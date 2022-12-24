const express = require('express');
const mysql = require('mysql');
const app = express();
const path = require('path');
const bodyParser = require("body-parser");
const cors = require('cors');
require('dotenv').config();
const port = 3000;

app.use(express.static(path.join(__dirname, '../frontend/build')));
app.use(express.json());
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

//데이터 베이스 연결
const db = mysql.createConnection({
  host:process.env.HOST,
  user:process.env.USER,
  password:process.env.PASSWORD,
  database:process.env.DATABASE,
});

db.connect((err) => {
  if(err){
    console.log('db 연결 에러');
  }
  console.log('db 연결 성공');
})

//get method : 메인페이지 랜더링시
app.get('/', (req, res) => {
  let sql = `SELECT * FROM url`;
  db.query(sql, (err, result) => {
    if(err){
      console.log(err);
    } else {
      console.log(result)
      res.sendFile(path.join(__dirname, '../frontend/build/index.html'));
    }
  })
});

app.get('/getUrls',(req,res)=>{
  let sql = `SELECT * FROM url`;
  db.query(sql, (err, result)=>{
    if(err){
      res.status(404).json({
        status:'404',
        message:'ERROR: 서버에 문제가 있습니다.'
      });
    } else {
      res.status(200).json(result);
    }
  })
})

//post method
app.post('/inputUrl', (req, res) => {
  const fullUrl = req.body.fullUrl;
  let shorten = Math.random().toString(36).replace(/[^a-z0-9]/gi,'').substring(2, 9);
  let findSql = `SELECT * FROM url WHERE fullUrl = ?`
  let sql = `INSERT INTO url(fullUrl, shortUrl) VALUES('${fullUrl}','${shorten}')`
  if(!fullUrl){
    res.status(400).json({
      status:'400',
      message:'ERROR: 데이터가 입력되지 않았습니다.'
    });
  }
  db.query(findSql,[fullUrl],(err,results)=>{
    if(err){
      console.log(err);
      res.sendStatus(404);
    }
    if(results.length === 0){
      db.query(sql,(err,res)=>{
        if(err){
          res.status(400).json({
            status:'400',
            message:'ERROR: 데이터 입력에 오류가 있습니다.'
          });
        }
      })
    } else {
      res.status(400).json({
        status:'400',
        message:'ERROR: 이미 중복된 값이 들어있습니다.',
        prevUrl:`${process.env.PROXY}/${results[0].shortUrl}`,
      });
    }
  })
})

// get method : 주소 리다이렉트
app.get('/:shortUrl',(req,res)=>{
  let findSql = `SELECT * FROM url WHERE shortUrl = ?`
  db.query(findSql,[req.params.shortUrl],(err, result)=>{
    if(err){
      res.status(404).json({
        status:'404',
        message:'ERROR: 서버에 문제가 있습니다.'
      });
    } else {
      res.redirect(result[0].fullUrl)
    }
  })
})

// post method : 삭제
app.post('/deleteUrl',(req,res)=>{
  let name = Object.keys(req.body);
  let delSql = `DELETE FROM url WHERE fullUrl = ?`
  db.query(delSql,[name],(err, result)=>{
    if(err){
      res.status(404).json({
        status:'404',
        message:'ERROR: 잘못된 접근입니다'
      });
    } else {
      res.sendStatus(200);
    }
  })
})

app.listen(port, ()=> {
  console.log(`서버가 실행됩니다. http://localhost:${port}`);
});